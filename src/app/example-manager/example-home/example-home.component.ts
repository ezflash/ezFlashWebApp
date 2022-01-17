import { Component, OnInit } from '@angular/core';

import { exampleDesc, AppListService } from '../../app-list.service';

@Component({
  selector: 'app-example-home',
  templateUrl: './example-home.component.html',
  styleUrls: ['./example-home.component.scss'],
})
export class ExampleHomeComponent implements OnInit {
  exampleList: exampleDesc[];

  constructor(private apls: AppListService) {}

  ngOnInit(): void {
    this.exampleList = this.apls.getExamplelist();
  }

  appClicked(title: string) {
    console.log(title);
  }
}
