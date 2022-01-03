import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { appDesc, AppListService } from '../app-list.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  appList: appDesc[];

  constructor(private router: Router, private apls: AppListService) {}

  ngOnInit(): void {
    this.appList = this.apls.getApplist();
  }

  appClicked(link: string): void {
    this.router.navigate([link]);
  }
}
