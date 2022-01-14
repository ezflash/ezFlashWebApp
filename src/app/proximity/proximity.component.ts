import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-proximity',
  templateUrl: './proximity.component.html',
  styleUrls: ['./proximity.component.scss'],
})
export class ProximityComponent implements OnInit {
  connected: Boolean = false;

  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  ias_alert_level: BluetoothRemoteGATTCharacteristic;
  lls_alert_level: BluetoothRemoteGATTCharacteristic;
  bas_level: BluetoothRemoteGATTCharacteristic;

  IAS_SERVICE_UUID: number = 0x1802;
  IAS_ALERT_LEVEL_UUID: number = 0x2a06;

  LLS_SERVICE_UUID: number = 0x1803;
  LLS_ALERT_LEVEL_UUID: number = 0x2a06;

  BAS_SERVICE_UUID: number = 0x180f;
  BAS_LEVEL_UUID: number = 0x2a19;

  DIS_SERVICE_UUID: number = 0x180A;
  MODEL_NUMBER_UUID: number = 0x2a24;
  FIRMWARE_REV_UUID: number = 0x2a26;
  HW_REV_UUID: number = 0x2a27;
  SW_REV_UUID: number = 0x2a28;
  MNF_REV_UUID: number = 0x2a29;

  alertLevels: String[] = ['Off', 'Mild', 'High'];
  alertLevel: number = 0;
  distanceLevel: number = 0;
  battery: string = '--';
  manufacturer : string;
  model : string;
  fw_rev: string;
  hw_rev: string;
  sw_rev: string;


  dis: boolean = false;
  bas: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  log(msg) {
    console.log(msg);
  }

  setAlert(index: number): void {
    this.ias_alert_level.writeValueWithoutResponse(new Uint8Array([index]));
    this.alertLevel = index;
  }

  setLinkLoss(index: number): void {
    console.log('set link loss ' + index);
    this.lls_alert_level.writeValueWithoutResponse(new Uint8Array([index]));
    this.distanceLevel = index;
  }

  isCheckedAlert(index: number): boolean {
    if (this.alertLevel === index) {
      return true;
    }
    return false;
  }
  isCheckedDistance(index: number): boolean {
    if (this.distanceLevel === index) {
      return true;
    }
    return false;
  }

  async scanDevice() {
    // Set BLE scan filters
    let options = {
      filters: [{ services: [this.IAS_SERVICE_UUID] }],
      optionalServices: [
        this.IAS_SERVICE_UUID,
        this.LLS_SERVICE_UUID,
        this.BAS_SERVICE_UUID,
        this.DIS_SERVICE_UUID,
      ],
    };

    if (this.server && this.server.connected === true) {
      this.connected = false;
      this.server.disconnect();
      return;
    }

    // Try to connect to a BLE device
    try {
      this.log('Requesting Bluetooth Device...');

      this.device = await navigator.bluetooth.requestDevice(options);

      this.device.addEventListener('gattserverdisconnected', () => {
        this.connected = false;
        this.battery = '--';
        this.dis = false;
        this.bas = false;
        this.log('Disconnected');
      });

      this.log('Connected to' + this.device.name);
      this.alertLevel = 0;
      this.connected = true;

      this.log('Connecting to GATT Server...');
      this.server = await this.device.gatt.connect();

      this.log('Mapping IAS Service...');
      const ias_service = await this.server.getPrimaryService(
        this.IAS_SERVICE_UUID
      );

      this.log(' Getting IAS Characteristic...');
      this.ias_alert_level = await ias_service.getCharacteristic(
        this.IAS_ALERT_LEVEL_UUID
      );
      this.log('Mapping LLS Service...');
      const lls_service = await this.server.getPrimaryService(
        this.LLS_SERVICE_UUID
      );

      this.log(' Getting LLS Characteristic...');
      this.lls_alert_level = await lls_service.getCharacteristic(
        this.LLS_ALERT_LEVEL_UUID
      );

      this.log('Mapping BAS Service...');
      const bas_service = await this.server.getPrimaryService(
        this.BAS_SERVICE_UUID
      );
      if(bas_service ) {
        this.bas = true;
        this.log(' Getting BAS Characteristic...');
        this.bas_level = await bas_service.getCharacteristic(this.BAS_LEVEL_UUID);
  
        let lvl = await this.bas_level.readValue();
        this.battery = lvl.getUint8(0).toString();
        await this.bas_level.startNotifications();
        this.bas_level.addEventListener(
          'characteristicvaluechanged',
          async (event: Event) => {
            let t = event.target as any;
            let v = t.value as any;
            let x = v.getUint8(0);
            this.battery = x.toString();
          }
        );
      }

      this.log('Mapping DIS Service...');
      const dis_service = await this.server.getPrimaryService(
        this.DIS_SERVICE_UUID
      );
      
      if(dis_service ) {

        let decoder = new TextDecoder("utf-8");
        let dis_char : BluetoothRemoteGATTCharacteristic;

        try {
          dis_char = await dis_service.getCharacteristic(this.MODEL_NUMBER_UUID);
          this.model = decoder.decode(await dis_char.readValue());
        } catch (error) {}
        
        try {
          dis_char = await dis_service.getCharacteristic(this.FIRMWARE_REV_UUID);
          this.fw_rev = decoder.decode(await dis_char.readValue());
        } catch (error) {}
        
        try {
          dis_char = await dis_service.getCharacteristic(this.HW_REV_UUID);
          this.hw_rev = decoder.decode(await dis_char.readValue());
        } catch (error) {}
        
        try {
          dis_char = await dis_service.getCharacteristic(this.SW_REV_UUID);
          this.sw_rev = decoder.decode(await dis_char.readValue());
        } catch (error) {}
        
        try {
          dis_char = await dis_service.getCharacteristic(this.MNF_REV_UUID);
          this.manufacturer = decoder.decode(await dis_char.readValue());
        } catch (error) {}

        this.dis = true;

      }

    } catch (error) {
      this.log('connection failed ' + error);
    }
  }
}
