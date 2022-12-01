import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-flasher-home',
  templateUrl: './flasher-home.component.html',
  styleUrls: ['./flasher-home.component.scss']
})
export class FlasherHomeComponent implements OnInit {

  @ViewChild('flasher') flasher: any;
  constructor() { }

  ngOnInit(): void {
  }


}
