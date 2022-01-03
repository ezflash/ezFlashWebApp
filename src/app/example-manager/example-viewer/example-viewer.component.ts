import { Component, OnInit } from '@angular/core';
import { FileFetcherService } from '../../file-fetcher.service';

@Component({
  selector: 'app-example-viewer',
  templateUrl: './example-viewer.component.html',
  styleUrls: ['./example-viewer.component.scss'],
})
export class ExampleViewerComponent implements OnInit {
  mdFile: string;

  constructor(private fileFetcher: FileFetcherService) {}

  ngOnInit(): void {
    this.fileFetcher
      .getTextFile(
        'https://raw.githubusercontent.com/dialog-semiconductor/BLE_SDK10_examples/main/Readme.md'
      )
      .subscribe((result) => {
        this.mdFile = result;
      });
  }
}
