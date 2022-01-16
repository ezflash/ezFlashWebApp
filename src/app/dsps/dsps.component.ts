/// <reference types="../../../node_modules/@types/web-bluetooth" />

import { HttpHandler } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { disconnect } from 'process';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';

@Component({
  selector: 'app-dsps',
  templateUrl: './dsps.component.html',
  styleUrls: ['./dsps.component.scss'],
})
export class DspsComponent implements OnInit {
  private UUID_SPS = '0783b03e-8535-b5a0-7140-a304d2495cb7';
  private UUID_SPS_SERVER_TX = '0783b03e-8535-b5a0-7140-a304d2495cb8';
  private UUID_SPS_SERVER_RX = '0783b03e-8535-b5a0-7140-a304d2495cba';
  private UUID_SPS_FLOW_CTRL = '0783b03e-8535-b5a0-7140-a304d2495cb9';

  connected: Boolean = false;

  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  service: BluetoothRemoteGATTService;
  serverRxChar: BluetoothRemoteGATTCharacteristic;
  serverTxChar: BluetoothRemoteGATTCharacteristic;
  serverFlowControl: BluetoothRemoteGATTCharacteristic;

  dataFromServer: string = '';
  dataToSever: string = '';
  flowControl: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  public log(msg: string): void {
    console.log(msg);
    // this.message = msg;
  }

  async scanDevice() {

    let serverTxHandler = (ev: Event) => {
      let event = ev.target as any;
      let decoder = new TextDecoder();
      let value = decoder.decode(event.value);

      console.log('decoded:' + value);
      if (value != null) {
        this.dataFromServer += value;
        console.log(this.dataFromServer);
      }
    };

    let flowControlHandler = (ev: Event) => {
      let event = ev.target as any;
      let decoder = new TextDecoder();
      let value = decoder.decode(event.value);

      console.log('decoded:' + value);
      if (value != null) {
        this.flowControl = value;
        console.log(this.flowControl);
      }
    };

    let disconnectHandler = () => {
      this.connected = false;
      // this.spotar_serv_status.removeEventListener(
      //   'characteristicvaluechanged',
      //   statusHandler
      // );
      // device.removeEventListener('gattserverdisconnected', disconnectHandler);
      // this.log('Disconnected');
    };

    let options = {
      filters: [{ services: [this.UUID_SPS] }],
      optionalServices: [this.UUID_SPS],
    };

    if (this.server && this.server.connected) {
      console.log('disconnect first');
      this.server.disconnect();
      return;
    }

    try {
      this.device = await navigator.bluetooth.requestDevice(options);
    } catch (error) {
      return;
    }
    this.device.addEventListener('gattserverdisconnected', disconnectHandler);

    this.log('Connecting to GATT Server...');
    this.server = await this.device.gatt.connect();

    this.connected = true;

    this.log('Mapping SUotA Service...');
    const dsps_service = await this.server.getPrimaryService(this.UUID_SPS);

    this.log(' Getting DSPS Rx Characteristic');
    this.serverRxChar = await dsps_service.getCharacteristic(
      this.UUID_SPS_SERVER_RX
    );

    this.log(' Getting DSPS Tx Characteristic');
    let serverTxChar = await dsps_service.getCharacteristic(
      this.UUID_SPS_SERVER_TX
    );

    this.log(' Getting DSPS FLOW control Characteristic');
    let serverFlowControl = await dsps_service.getCharacteristic(
      this.UUID_SPS_FLOW_CTRL
    );

    await serverFlowControl.startNotifications();
    serverFlowControl.addEventListener(
      'characteristicvaluechanged',
      flowControlHandler
    );

    await serverTxChar.startNotifications();
    serverTxChar.addEventListener(
      'characteristicvaluechanged',
      serverTxHandler
    );

    serverFlowControl.writeValueWithoutResponse(new Uint8Array([1]));

    
  }

  onKey(value: string) {
    this.dataToSever = value;
  }
  sendMessage(): void {
    var enc = new TextEncoder(); // always utf-8
    this.serverRxChar.writeValueWithoutResponse(enc.encode(this.dataToSever));
    console.log('send:' + this.dataToSever);
  }
}
