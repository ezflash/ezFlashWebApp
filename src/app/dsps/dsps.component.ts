
/// <reference types="../../../node_modules/@types/web-bluetooth" />

import { HttpHandler } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { disconnect } from 'process';
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

  device: BluetoothRemoteGATTServer;
  service: BluetoothRemoteGATTService;
  serverRxChar: BluetoothRemoteGATTCharacteristic;
  serverTxChar: BluetoothRemoteGATTCharacteristic;
  serverFlowControl: BluetoothRemoteGATTCharacteristic;

  dataFromServer: string = '';
  dataToSever: string = '';
  flowControl: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  scanDevice(): void {
    // let options = {
    //   filters: [{ services: [this.UUID_SPS] }],
    //   optionalServices: [this.UUID_SPS],
    // };

    // if (this.connected) {
    //   console.log('disconnect first');
    //   this.device.disconnect();
    //   return;
    // }

    // this.ble.discover$({ filters: [{ services: [this.UUID_SPS] }] }).subscribe({
    //   next: (gattserver: BluetoothRemoteGATTServer) => {
    //     if (gattserver) {
    //       this.device = gattserver;
    //       this.connected = gattserver.connected;
    //       this.dataFromServer = '';

    //       gattserver.device.ongattserverdisconnected = (evt) => {
    //         this.connected = false;
    //         this.cdr.detectChanges();
    //       };

    //       gattserver
    //         .getPrimaryService(this.UUID_SPS)
    //         .then((service: BluetoothRemoteGATTService) => {
    //           this.service = service;
    //           return service.getCharacteristic(this.UUID_SPS_SERVER_RX);
    //         })
    //         .then((rxchar: BluetoothRemoteGATTCharacteristic) => {
    //           this.serverRxChar = rxchar;
    //           return this.service.getCharacteristic(this.UUID_SPS_SERVER_TX);
    //         })
    //         .then((txchar: BluetoothRemoteGATTCharacteristic) => {
    //           this.serverTxChar = txchar;
    //           return this.service.getCharacteristic(this.UUID_SPS_FLOW_CTRL);
    //         })
    //         .then((fcc: BluetoothRemoteGATTCharacteristic) => {
    //           this.serverFlowControl = fcc;
    //           return this.serverFlowControl.startNotifications();
    //         })
    //         .then((_: any) => {
    //           console.log('>flow control notification started');
    //           this.serverFlowControl.addEventListener(
    //             'characteristicvaluechanged',
    //             (ev: Event) => {
    //               let event = ev.target as any;
    //               let decoder = new TextDecoder();
    //               let value = decoder.decode(event.value);

    //               console.log('decoded:' + value);
    //               if (value != null) {
    //                 this.flowControl = value;
    //                 console.log(this.flowControl);
    //               }
    //             }
    //           );
    //           return this.serverTxChar.startNotifications();
    //         })
    //         .then((_: any) => {
    //           console.log('>serverTxChar notification started');
    //           this.serverTxChar.addEventListener(
    //             'characteristicvaluechanged',
    //             (ev: Event) => {
    //               let event = ev.target as any;
    //               let decoder = new TextDecoder();
    //               let value = decoder.decode(event.value);

    //               console.log('decoded:' + value);
    //               if (value != null) {
    //                 this.dataFromServer += value;
    //                 console.log(this.dataFromServer);
    //               }
    //             }
    //           );
    //           return this.serverFlowControl.writeValueWithoutResponse(
    //             new Uint8Array([1])
    //           );
    //         })
    //         .then((_: any) => {
    //           console.log('done', _);
    //         });
    //     } else {
    //       console.log('Not Discovered: ', gattserver);
    //     }
    //   },
    //   error: (msg) => {
    //     console.log('Error discovering: ', msg);
    //   },
    // });
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
