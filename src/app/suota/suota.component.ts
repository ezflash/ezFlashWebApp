import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare const M: any;

@Component({
  selector: 'app-suota',
  templateUrl: './suota.component.html',
  styleUrls: ['./suota.component.scss'],
})
export class SuotaComponent implements OnInit {
  inputFile: File;
  fileData: Uint8Array;
  message: string = '';

  server: BluetoothRemoteGATTServer;
  spotar_mem_dev: BluetoothRemoteGATTCharacteristic;
  spotar_gpiomap: BluetoothRemoteGATTCharacteristic;
  spotar_mem_info: BluetoothRemoteGATTCharacteristic;
  spotar_patch_len: BluetoothRemoteGATTCharacteristic;
  spotar_patch_data: BluetoothRemoteGATTCharacteristic;
  spotar_serv_status: BluetoothRemoteGATTCharacteristic;
  spotar_mtu_size: BluetoothRemoteGATTCharacteristic;

  position: number = 0;

  mtu: number;
  total_length: number;

  done: boolean;
  progress: string;

  time_start: number;

  SPOTAR_SERVICE: number = 0xfef5;

  SPOTA_MEM_DEV: string = '8082caa8-41a6-4021-91c6-56f9b954cc34';
  SPOTA_GPIOMAP: string = '724249f0-5ec3-4b5f-8804-42345af08651';
  SPOTA_MEM_INFO: string = '6c53db25-47a1-45fe-a022-7c92fb334fd4';
  SPOTA_PATCH_LEN: string = '9d84b9a3-000c-49d8-9183-855b673fda31';
  SPOTA_PATCH_DATA: string = '457871e8-d516-4ca1-9116-57d0b17b9cb2';
  SPOTA_SERV_STATUS: string = '5f78df94-798c-46f5-990a-b3eb6a065c88';
  SPOTA_MTU: string = 'b7de1eea-823d-43bb-a3af-c4903dfce23c';

  RESET_CMD: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0xfd]); // Reset SUotA target command
  FINAL_CMD: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0xfe]); // Finalize SUotA command
  ABORT_CMD: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0xff]); // Abort SUotA command

  GPIO_CMD: Uint8Array = new Uint8Array([0x00, 0x03, 0x06, 0x05]); // SPI_CLK=P00, SPI_SS=P03, SPI_MOSI=P06, SPI_MISO=P05 (devkit defaults)

  FLASH_CMD: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0x13]); // Target firmware is stored in bank with the oldest image
  EEPROM_CMD: Uint8Array = new Uint8Array([0x00, 0x00, 0x00, 0x12]); // Target firmware is stored in bank with the oldest image

  BLOCK_SIZE: number = 2048; // Bytes per block over the air (0xA0 = 160 decimal)
  CHUNK_SIZE: number = 0x200; // Bytes per block over the air (0xA0 = 160 decimal)

  CHUNK_PER_BLOCK: number = 8;

  img_header = [
    0x70, 0x51, 0xaa, 0x00, 0x0c, 0x69, 0x00, 0x00, 0x50, 0xd2, 0xb6, 0x0d,
    0x36, 0x2e, 0x30, 0x2e, 0x31, 0x30, 0x2e, 0x35, 0x31, 0x33, 0x00, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xc0, 0x9f, 0xb6, 0x62, 0x00, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0xff, 0xff, 0xff,
  ];

  constructor() {}

  ngOnInit(): void {
    let elem = document.querySelectorAll('#suotamodal') as any;
    let instances = M.Modal.init(elem, {});

  }

  saveSelectedProduct(event: Event) {

    console.log(event);
  }

  async executeSuota(inputFile: File) {
    this.inputFile = inputFile;

    let reader = new FileReader();

    reader.onload = (e) => {
      this.fileData = new Uint8Array(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(this.inputFile);

    this.connectSuota();
  }

  public log(msg: string): void {
    //console.log(msg);
    this.message = msg;
  }

  async connectSuota() {
    let device: BluetoothDevice;

    let statusHandler = async (event: Event) => {
      // Data was received from BLE peer
      let t = event.target as any;
      let v = t.value as any;
      let x = v.getUint8(0);

      if (x == 0x02) {
        if (this.position < this.fileData.length) {
          this.log('acK received');
          this.upload_image();
        } else if (!this.done) {
          // Uploading complete
          this.done = true;
          // Verify that image was complely received by checking the peer byte count
          this.log('Image was transferred - Verifying...');
          this.log('write FINAL_CMD');
          // Finalize
          await this.spotar_mem_dev.writeValue(new Uint8Array(this.FINAL_CMD));

          // stop notification
          await this.spotar_serv_status.startNotifications();

          this.log('write reboot');
          // Reset the peer device
          try {
            await this.spotar_mem_dev.writeValue(
              new Uint8Array(this.RESET_CMD)
            );
          } catch (err) {}

          this.log('Update Completed.');
          this.log(
            'Update time: ' + (Date.now() - this.time_start) / 1000 + 's'
          );
        }
      }
      // Error messages
      else if (x == 0x07)
        this.log(
          'Internal Memory Error. Not enough internal memory space for patch!'
        );
      else if (x == 0x08) this.log('Invalid memory device!');
      else if (x == 0x09) this.log('Application error!');
      else if (x == 0x11) this.log('Invalid image bank!');
      else if (x == 0x12) this.log('Invalid image header!');
      else if (x == 0x13) this.log('Invalid image size!');
      else if (x == 0x14) this.log('Invalid product header!');
      else if (x == 0x15) this.log('Same image error!');
      else if (x == 0x16)
        this.log('Failed to read from external memory device!');
    };

    let disconnectHandler = () => {
      this.spotar_serv_status.removeEventListener(
        'characteristicvaluechanged',
        statusHandler
      );
      device.removeEventListener('gattserverdisconnected', disconnectHandler);
      this.log('Disconnected');
    };

    // Set BLE scan filters
    let options = {
      filters: [{ services: [this.SPOTAR_SERVICE] }],
      optionalServices: [this.SPOTAR_SERVICE],
    };

    this.done = false;
    this.position = 0;
    this.progress = '0%';

    // Try to connect to a BLE device
      this.log('Requesting Bluetooth Device...');

      try {
        device = await navigator.bluetooth.requestDevice(options);
      } catch (error) {
        return;
      }
      let elem = document.querySelectorAll('#suotamodal') as any;
      elem[0].M_Modal.open();
      this.time_start = Date.now();

      device.addEventListener('gattserverdisconnected', disconnectHandler);

      this.log('Connected to' + device.name);

      this.log('Connecting to GATT Server...');
      this.server = await device.gatt.connect();

      this.log('Mapping SUotA Service...');
      const spotar_service = await this.server.getPrimaryService(
        this.SPOTAR_SERVICE
      );

      this.log(' Getting SPOTA_SERV_STATUS Characteristic...');
      this.spotar_serv_status = await spotar_service.getCharacteristic(
        this.SPOTA_SERV_STATUS
      );

      this.log('Subscribing to SPOTA_SERV_STATUS notifications ...');
      await this.spotar_serv_status.startNotifications();
      this.spotar_serv_status.addEventListener(
        'characteristicvaluechanged',
        statusHandler
      );

      this.log(' Getting SPOTA_MEM_DEV Characteristic...');
      this.spotar_mem_dev = await spotar_service.getCharacteristic(
        this.SPOTA_MEM_DEV
      );

      this.log(' Getting SPOTA_GPIOMAP Characteristic...');
      this.spotar_gpiomap = await spotar_service.getCharacteristic(
        this.SPOTA_GPIOMAP
      );

      this.log(' Getting SPOTA_MEM_INFO Characteristic...');
      this.spotar_mem_info = await spotar_service.getCharacteristic(
        this.SPOTA_MEM_INFO
      );

      this.log(' Getting SPOTA_PATCH_LEN Characteristic...');
      this.spotar_patch_len = await spotar_service.getCharacteristic(
        this.SPOTA_PATCH_LEN
      );

      this.log(' Getting SPOTA_PATCH_DATA Characteristic...');
      this.spotar_patch_data = await spotar_service.getCharacteristic(
        this.SPOTA_PATCH_DATA
      );

      this.log(' Getting SPOTA_MTU Characteristic...');
      this.spotar_mtu_size = await spotar_service.getCharacteristic(
        this.SPOTA_MTU
      );

      let spotar_mtu_value = await this.spotar_mtu_size.readValue();

      this.CHUNK_SIZE =
        (spotar_mtu_value.getUint8(0) + 256 * spotar_mtu_value.getUint8(1)) / 4;

      this.BLOCK_SIZE = this.CHUNK_SIZE * this.CHUNK_PER_BLOCK;
      this.log('MTU value ' + this.CHUNK_SIZE);

      // Initialize SUotA
      await this.spotar_mem_dev.writeValue(new Uint8Array(this.FLASH_CMD));

      this.log('Write patch_len: ' + this.BLOCK_SIZE);
      await this.spotar_patch_len.writeValue(
        Uint8Array.of(this.BLOCK_SIZE & 0xff, (this.BLOCK_SIZE / 256) & 0xff)
      );

      this.log('Ready to communicate.');

      this.upload_image();
  }

  async upload_image() {
    // Upload the image in chunks of 20 bytes
    let chunks_sent: number = 0;
    let remaining = this.fileData.length - this.position;

    if (remaining < this.BLOCK_SIZE) {
      await this.spotar_patch_len.writeValue(
        Uint8Array.of(remaining, remaining / 256)
      );
    }

    // As long as there is still data to upload...
    while (
      this.position < this.fileData.length &&
      chunks_sent < this.CHUNK_PER_BLOCK
    ) {
      chunks_sent++;
      if (this.fileData.length - this.position < this.CHUNK_SIZE) {
        await this.spotar_patch_data.writeValueWithoutResponse(
          this.fileData.slice(this.position, this.fileData.length)
        );
        this.position = this.fileData.length;
        this.log('Sent:' + this.position + ' / ' + this.fileData.length);
        this.progress =
          ((this.position / this.fileData.length) * 100).toString(10) + '%';
        break;
      }

      let data = new ArrayBuffer(this.CHUNK_SIZE);
      let dataview = new Uint8Array(data);
      await this.spotar_patch_data.writeValueWithoutResponse(
        this.fileData.slice(this.position, this.position + this.CHUNK_SIZE)
      );
      this.position = this.position + this.CHUNK_SIZE;

      this.log('Sent:' + this.position + ' / ' + this.fileData.length);
      this.progress =
        ((this.position / this.fileData.length) * 100).toString(10) + '%';
    }
  }
}
