import { Component, OnInit } from '@angular/core';
import { FileFetcherService } from '../file-fetcher.service';

@Component({
  selector: 'app-markdown-viewer',
  templateUrl: './markdown-viewer.component.html',
  styleUrls: ['./markdown-viewer.component.scss'],
})
export class MarkdownViewerComponent implements OnInit {
  constructor(private fileFetcher: FileFetcherService) {}

  mdFile: string;

  ngOnInit(): void {
    this.fileFetcher
      .getTextFile(
        'https://raw.githubusercontent.com/dialog-semiconductor/BLE_SDK10_examples/main/Readme.md'
      )
      .subscribe((result) => {
        this.mdFile = result;
      });
  }

  onLoad(e): void {}

  onError(e): void {}
}
