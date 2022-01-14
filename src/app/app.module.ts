import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SuotaComponent } from './suota/suota.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BooterComponent } from './booter/booter.component';
import { SuotaHomeComponent } from './suota/suota-home/suota-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { DspsComponent } from './dsps/dsps.component';
import { DngComponent } from './dsps/dng/dng.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MarkdownViewerComponent } from './markdown-viewer/markdown-viewer.component';
import { MarkdownModule } from 'ngx-markdown';
import { HomeComponent } from './home/home.component';
import { ProximityComponent } from './proximity/proximity.component';
import { ExampleManagerComponent } from './example-manager/example-manager.component';
import { ExampleHomeComponent } from './example-manager/example-home/example-home.component';
import { ExampleViewerComponent } from './example-manager/example-viewer/example-viewer.component';
import { FlasherComponent } from './flasher/flasher.component';
@NgModule({
  declarations: [
    AppComponent,
    SuotaComponent,
    PageNotFoundComponent,
    BooterComponent,
    SuotaHomeComponent,
    DspsComponent,
    DngComponent,
    MarkdownViewerComponent,
    HomeComponent,
    ProximityComponent,
    ExampleManagerComponent,
    ExampleHomeComponent,
    ExampleViewerComponent,
    FlasherComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxFileDropModule,
    WebBluetoothModule.forRoot({
      enableTracing: false, // or false, this will enable logs in the browser's console
    }),
    MarkdownModule.forRoot({ loader: HttpClient }),
    DragDropModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}