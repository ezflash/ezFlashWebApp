import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface appDesc {
  title: string;
  group: string;
  description: string;
  routerlink: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
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

  constructor(private router: Router) {}

  ngOnInit(): void {}

  appClicked(link: string): void {
    this.router.navigate([link]);
  }
}
