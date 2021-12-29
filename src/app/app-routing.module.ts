import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MarkdownViewerComponent } from './markdown-viewer/markdown-viewer.component';
import { DspsComponent } from './dsps/dsps.component';
import { BooterComponent } from './booter/booter.component';
import { SuotaComponent } from './suota/suota.component';
import { HomeComponent } from './home/home.component';
import { ProximityComponent } from './proximity/proximity.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'dsps', component: DspsComponent },
  { path: 'prox', component: ProximityComponent },
  { path: 'suota', component: SuotaComponent },
  { path: 'booter', component: BooterComponent },
  { path: 'md', component: MarkdownViewerComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
