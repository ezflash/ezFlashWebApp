/// <reference types="w3c-web-serial" />
import { Component, OnInit } from '@angular/core';

import { FileFetcherService } from '../file-fetcher.service';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Component({
  selector: 'app-booter',
  templateUrl: './booter.component.html',
  styleUrls: ['./booter.component.scss'],
})
export class BooterComponent implements OnInit {
  port: SerialPort | undefined;

  _reader: ReadableStreamDefaultReader;
  __inputBuffer?: number[] = [];

  bootloader: Uint8Array;
  bootloaderCRC: number;

  constructor(private fetcher: FileFetcherService) {}

  ngOnInit(): void {
    this.fetcher.getArrayFile('assets/ezFlashStub.bin').subscribe((result) => {
      this.bootloader = new Uint8Array(result);
      this.bootloaderCRC = 0;
      for (let n of this.bootloader) {
        this.bootloaderCRC ^= n;
      }
    });
  }

  async _disconnect() {
    console.log('Disconnect');
    await this._reader.cancel();
    await this.port.close();
    this.port = null;
    console.log('closed port');
  }

  async onConnectReq() {
    let sync: Boolean;

    let portOption: SerialOptions = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none',
    };

    if (this.port) {
      await this._disconnect();
      return;
    }

    // let serial : Serial = new Serial();
    if ('serial' in navigator) {
      console.log('serial available');
    } else {
      //TODO add unsupported browser message
      console.log('serial not available');
      return;
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
    this.readLoop();

    sync = await this.sync();

    if (await this.sync()) {
      let packet: number[] | null = [];
      packet.push(1);
      packet.push(this.bootloader.length & 0xff);
      packet.push((this.bootloader.length >> 8) & 0xff);
      await this.writeToStream(packet);
    } else {
      return;
    }

    if (await this.ack()) {
      this.writeToStream(Array.from(this.bootloader));
    } else {
      return;
    }
    let crc = await this.crc();
    if (crc === this.bootloaderCRC) {
      await this.writeToStream([6]);
    } else {
      console.log('crc mismatch', crc, this.bootloaderCRC);
    }
  }

  /**
   * @name sync
   * Put into ROM bootload mode & attempt to synchronize with the
   * ESP ROM bootloader, we will retry a few times
   */
  async sync() {
    for (let i = 0; i < 5; i++) {
      if (this.__inputBuffer.length > 0) {
        if (this.__inputBuffer[0] === 2) {
          this.__inputBuffer.length = 0;
          return true;
        } else {
          this.__inputBuffer.length = 0;
        }
      }

      await sleep(100);
    }

    throw new Error(
      "Couldn't sync to Smartbond. Try resetting." + this.__inputBuffer
    );
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
    throw new Error("Couldn't get crc from Smartbond. Try resetting.");
  }

  /**
   * @name sync
   * Put into ROM bootload mode & attempt to synchronize with the
   * ESP ROM bootloader, we will retry a few times
   */
  async ack() {
    for (let i = 0; i < 5; i++) {
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

  async writeToStream(data: number[]) {
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
