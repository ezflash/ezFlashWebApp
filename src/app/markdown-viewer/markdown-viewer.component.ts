import { Component, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppListService, exampleDesc } from '../app-list.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss'],
})
export class MarkdownViewerComponent implements OnInit, AfterViewInit {
  constructor(private apls: AppListService,
              private route: ActivatedRoute,
              private http: HttpClient) {}
  
  @ViewChild('md') mdview: any;
  @ViewChild('flasher') flasher: any;

  baseUrl: string = 'https://raw.githubusercontent.com/dialog-semiconductor/BLE_SDK10_examples/main/';

  mdFile: string;
  mdurl: string;
  binURL: string;

  ngOnInit(): void {
    this.mdurl = this.baseUrl + this.route.snapshot.paramMap.get('id');

    this.apls.getExamplelist().subscribe((res)=>{
      for(let ex of res['examples'] as exampleDesc[]){
        if(this.route.snapshot.paramMap.get('id') == ex.readmePath){
          this.binURL =  this.apls.getBinURL(ex.binPath);
          break;
        } 
      }
    });

  }

  ngAfterViewInit(): void {
    this.mdview.src = this.mdurl;
    this.mdview.loadContent();
  }

  onLoad(e): void {
    // console.log("md Load:",e);
  }
  
  onError(e): void {
    console.log("md error:",e);
  }

  flashMe() : void {

    if( !this.binURL){
      console.error('bin File not found');
      return;
    }

    this.http.get(this.binURL,{ responseType: 'arraybuffer' }).subscribe( res => {
      this.flasher.fileData = new Uint8Array(res);
      
      this.flasher.writeFlash();
    });
    



  }
}
