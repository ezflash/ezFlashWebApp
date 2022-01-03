import { Component, OnInit, PACKAGE_ROOT_URL } from '@angular/core';

import { FileFetcherService } from '../file-fetcher.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
declare const M: any;

@Component({
  selector: 'app-flasher',
  templateUrl: './flasher.component.html',
  styleUrls: ['./flasher.component.scss'],
})
export class FlasherComponent implements OnInit {
  constructor(private fetcher: FileFetcherService) {}

  RETRYNUMBER: number = 5;
  inputFile: File;
  fileData: Uint8Array;

  port: SerialPort | undefined;
  _reader: ReadableStreamDefaultReader;
  __inputBuffer?: number[] = [];

  bootloader: Uint8Array;
  bootloaderCRC: number;

  portstate: string;
  syncstate: string;
  flashingState: string;

  flashProgress: string = '0%';

  ngOnInit(): void {
    this.fetcher.getArrayFile('assets/ezFlashStub.bin').subscribe((result) => {
      this.bootloader = new Uint8Array(result);
      this.bootloaderCRC = 0;
      for (let n of this.bootloader) {
        this.bootloaderCRC ^= n;
      }
    });
  }

  async updateFileList(inputFile: File) {
    this.inputFile = inputFile;

    let reader = new FileReader();

    reader.onload = (e) => {
      this.fileData = new Uint8Array(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(this.inputFile);

    this.writeFlash();
  }

  logger(msg: string) {
    console.log(msg);
  }

  async writeFlash() {
    console.log('Starting flash process');
    this.boot();
  }

  async disconnect() {
    console.log('Disconnect');
    if (this._reader) {
      try {
        await this._reader.cancel();
      } catch {}
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch {}
    }
    this.port = null;
    console.log('closed port');
  }

  async boot() {
    let sync: Boolean;
    let packet: number[] | null = [];

    this.syncstate = 'syncing';
    this.flashingState = 'idle';
    this.__inputBuffer.length = 0;
    this.flashProgress = '0%';

    let portOption: SerialOptions = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    };

    if (this.port) {
      await this.disconnect();
    }

    try {
      this.port = await navigator.serial.requestPort();
    } catch (err: any) {
      if ((err as DOMException).name === 'NotFoundError') {
        return;
      }
      alert(`Error: ${err.message}`);
      return;
    }

    if (!this.port) {
      return;
    } else {
      console.log(this.port);
    }
    try {
      await this.port.open({ baudRate: 115200 });
    } catch (err: any) {
      alert(err.message);
      return;
    }

    this.syncstate = 'syncing';

    let elem = document.querySelectorAll('#flasherModal');
    let instance = M.Modal.getInstance(elem[0]);
    instance.open();

    this.readLoop();
    this.syncstate = await this.smartbondSync();
    console.log("initial sync state " +this.syncstate);

    if (this.syncstate === 'synced') {
      packet.push(1);
      packet.push(this.bootloader.length & 0xff);
      packet.push((this.bootloader.length >> 8) & 0xff);
      await this.writeToStream(packet);
    } else if (this.syncstate === 'booted') {
    } else {
      this.disconnect();
      return;
    }
    if (this.syncstate === 'synced') {
      if (await this.ack()) {
        this.writeToStream(Array.from(this.bootloader));
      } else {
        return;
      }
      let crc = await this.crc();
      if (crc === this.bootloaderCRC) {
        await this.writeToStream([6]);
      } else {
        this.syncstate = 'booterror';
        console.log('crc mismatch', crc, this.bootloaderCRC);
      }
    }

    this.syncstate = await this.smartbondSync();
    this.__inputBuffer.length = 0;

    // Send flash command
    let address = 0x2000;
    let remaining: number = this.fileData.length;
    let chunkSize: number = 0xc000;
    let sentData: number = 0;
    let thischunk: number;
    let retryCount: number = 0;

    this.flashingState = 'progress';

    while (remaining && retryCount <= this.RETRYNUMBER) {
      console.log(
        'burn status: remaining: ' + remaining + ', retry: ' + retryCount
      );

      thischunk = Math.min(remaining, chunkSize);
      packet.length = 0;
      await this.writeToStream([
        1,
        0x12,
        (thischunk + 5) & 0xff,
        ((thischunk + 5) >> 8) & 0xff,
      ]);

      if (!(await this.ack())) {
        console.error('failed to get ack');
        this.flashingState = "flasherror";
        break
      }

      let chunk = new Uint8Array(thischunk + 5);
      chunk.set(
        [
          1,
          address & 0xff,
          (address >> 8) & 0xff,
          (address >> 16) & 0xff,
          (address >> 24) & 0xff,
        ],
        0
      );
      chunk.set(this.fileData.subarray(sentData, sentData + thischunk), 5);

      await this.writeToStream(chunk);

      let crc16: number = 0xffff;
      for (let [i, datum] of chunk.entries()) {
        let dat = datum;
        for (let j = 0; j < 8; j++) {
          let need_xor = ((crc16 & 0x8000) >> 15) ^ ((dat & 0x80) >> 7);
          crc16 = (crc16 << 1) & 0xffff;
          if (need_xor) {
            crc16 = (crc16 ^ 0x1021) & 0xffff;
          }
          dat = dat << 1;
        }
      }
      let devcrc = await this.getFlashCrc();

      console.log(crc16, devcrc);

      if (!(crc16 === devcrc)) {
        retryCount += 1;
        console.error('crc error');
        await this.writeToStream([0x15]);
        if (!(await this.nack())) {
          console.error('failed to get ack');
        }
      } else {
        await this.writeToStream([6]);

        if (!(await this.ack())) {
          console.error('failed to get ack');
        }

        address += thischunk;
        sentData += thischunk;
        remaining -= thischunk;
        this.flashProgress =
          Math.round(
            ((this.fileData.length - remaining) / this.fileData.length) *
            100
          ).toString(10) + '%';
        console.log("fp " + this.flashProgress);
      }

      if (remaining == 0) {
        this.flashingState = 'flashDone';
      }
    }
  }

  async getFlashCrc(): Promise<number> {
    for (let i = 0; i < 500; i++) {
      if (this.__inputBuffer.length >= 3 && this.__inputBuffer[0]) {
        let crc = this.__inputBuffer[1] | (this.__inputBuffer[2] << 8);
        console.log('return crc ' + this.__inputBuffer + ' data ' + crc);
        this.__inputBuffer.length = 0;
        return crc;
      }
      await sleep(10);
    }
    console.log(this.__inputBuffer);
    throw new Error("Couldn't get crcflash  from Smartbond. Try resetting.");
  }

  /**
   * @name sync
   * Put into ROM bootload mode & attempt to synchronize with the
   * ESP ROM bootloader, we will retry a few times
   */
  async smartbondSync(): Promise<string> {
    for (let i = 0; i < 500; i++) {
      while (this.__inputBuffer.length > 0) {
        if (this.__inputBuffer[0] === 2) {
          this.__inputBuffer.length = 0;
          return 'synced';
        } else if (this.__inputBuffer[0] === 7) {
          this.__inputBuffer.length = 0;
          return 'booted';
        } else {
          this.__inputBuffer.length = 0;
        }
        this.__inputBuffer.slice(0, 1);
      }

      await sleep(10);
    }

    return 'unsynced';
  }

  async crc() {
    for (let i = 0; i < 500; i++) {
      if (this.__inputBuffer.length > 0) {
        return this.__inputBuffer[0];
      }
      console.log('wait crc');
      await sleep(10);
    }
    console.log(this.__inputBuffer);
    throw new Error("Couldn't get flash write crc from Smartbond");
  }

  /**
   * @name sync
   * Put into ROM bootload mode & attempt to synchronize with the
   * ESP ROM bootloader, we will retry a few times
   */
  async ack() {
    for (let i = 0; i < 60; i++) {
      if (this.__inputBuffer.length > 0) {
        if (this.__inputBuffer[0] === 6) {
          this.__inputBuffer.length = 0;
          return true;
        }
      }

      await sleep(10);
    }
    console.log(this.__inputBuffer);
    throw new Error("Couldn't get ack from Smartbond. Try resetting.");
  }
  async nack() {
    for (let i = 0; i < 5; i++) {
      if (this.__inputBuffer.length > 0) {
        if (this.__inputBuffer[0] === 21) {
          this.__inputBuffer.length = 0;
          return true;
        }
      }

      await sleep(10);
    }
    console.log(this.__inputBuffer);
    throw new Error("Couldn't get ack from Smartbond. Try resetting.");
  }

  async writeToStream(data: number[] | Uint8Array) {
    const writer = this.port.writable!.getWriter();
    await writer.write(new Uint8Array(data));
    try {
      writer.releaseLock();
    } catch (err) {
      console.error('Ignoring release lock error', err);
    }
  }

  /**
   * @name readLoop
   * Reads data from the input stream and places it in the inputBuffer
   */
  async readLoop() {
    console.log('Starting read loop');

    this._reader = this.port.readable!.getReader();

    try {
      while (true) {
        const { value, done } = await this._reader.read();
        if (done) {
          this._reader.releaseLock();
          break;
        }
        if (!value || value.length === 0) {
          continue;
        }
        this.__inputBuffer.push(...Uint8Array.from(value));
      }
    } catch (err) {
      this.port.close();
      console.log('Read loop got disconnected');
    }
  }
}
