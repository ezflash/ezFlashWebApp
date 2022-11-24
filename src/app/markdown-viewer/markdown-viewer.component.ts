import { Component, OnInit, ViewChild,AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FileFetcherService } from '../file-fetcher.service';

@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss'],
})
export class MarkdownViewerComponent implements OnInit, AfterViewInit {
  constructor(private fileFetcher: FileFetcherService,
              private route: ActivatedRoute) {}
  
  @ViewChild('md') mdview: any; // map servier
  mdFile: string;
  mdurl: string;

  ngOnInit(): void {
    this.mdurl = 'https://raw.githubusercontent.com/dialog-semiconductor/BLE_SDK10_examples/main/' + this.route.snapshot.paramMap.get('id');
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
    
  }
}
