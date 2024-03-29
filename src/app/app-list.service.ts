import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

export interface appDesc {
  title: string;
  group: string;
  description: string;
  routerlink: string;
}

export interface exampleDesc {
  title?: string;
  group?: string;
  binPath?: string;
  readmePath?: string;
  description?: string;
  routerlink?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppListService {

  artifactsBaseURL : string = 'https://s3.eu-central-1.amazonaws.com/lpccs-docs.renesas.com/examples_arfitacts/da1469x/';

  constructor(private http: HttpClient) {}

  appList: appDesc[] = [
    {
      title: 'Booter',
      group: 'manager',
      description: 'Boot the Smartbond device through the serial port.',
      routerlink: 'booter',
    },
    {
      title: 'Flasher',
      group: 'manager',
      description: 'Flash the Smartbond device through the serial port.',
      routerlink: 'flasher',
    },
    {
      title: 'OTP Parser',
      group: 'manager',
      description: 'Browse the smartbond device OTP.',
      routerlink: 'otp',
    },
    {
      title: 'SUOTA',
      group: 'bluetooth',
      description: 'Performs Software Update Over the Air. ',
      routerlink: 'suota',
    },
    {
      title: 'DSPS',
      group: 'bluetooth',
      description:
        'Dialog Serial Port service. Serial terminal over bluetooth.',
      routerlink: 'dsps',
    },
    {
      title: 'Proximity',
      group: 'bluetooth',
      description: 'Control Proximity reporter devices.',
      routerlink: 'prox',
    },
  ];

  getApplist(): appDesc[] {
    return this.appList;
  }


  getExamplelist(): Observable<Object> {


    return this.http.get( this.artifactsBaseURL + 'projectData.json');
  }

  getBinURL( ex: string): string {
    return( this.artifactsBaseURL + ex);
  }
}
