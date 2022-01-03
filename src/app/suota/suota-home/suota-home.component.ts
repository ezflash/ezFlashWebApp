import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';

@Component({
  selector: 'app-suota-home',
  templateUrl: './suota-home.component.html',
  styleUrls: ['./suota-home.component.scss'],
})
export class SuotaHomeComponent implements OnInit {
  @Output() selectedFile = new EventEmitter<File>();

  public files: NgxFileDropEntry[] = [];
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  public dropped(files: NgxFileDropEntry[]) {
    this.files = this.files.concat(files);
  }
  public fileOver(event) {
    // console.log(event);
  }

  public fileLeave(event) {
    // console.log(event);
  }

  async sendSelectedFiled(index: number) {
    if (this.files[index].fileEntry.isFile) {
      const fileEntry = this.files[index].fileEntry as FileSystemFileEntry;

      fileEntry.file((file: File) => {
        this.selectedFile.emit(file);
      });
    } else {
      console.log('input is not a file');
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }
}
