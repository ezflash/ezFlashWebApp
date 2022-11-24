import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { exampleDesc, AppListService } from '../../app-list.service';

@Component({
  selector: 'app-example-home',
  templateUrl: './example-home.component.html',
  styleUrls: ['./example-home.component.scss'],
})
export class ExampleHomeComponent implements OnInit {
  exampleList: exampleDesc[];
  groupList: string[];

  constructor(private apls: AppListService, private router: Router,) {}

  ngOnInit(): void {
    this.apls.getExamplelist().subscribe((res)=>{

      this.groupList = res['groups'];
      let exampleList = res['examples'] as exampleDesc[];

      for(let i =0;i < exampleList.length;i++){
        exampleList[i]['routerlink'] = 'md'
      }


      this.exampleList = exampleList;
    })
  }

  appClicked(title: string) {
    this.router.navigate(['md',{"id":title}]);
  }
}
