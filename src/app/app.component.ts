import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ezFlashWebApp';

  currentItem = 'accessibility';

  navb: Boolean = false;
  navs: Boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setUpAnalytics();

    if (!('serial' in navigator)) {
      throw console.error('No serial detected');
    } else {
      this.navs = true;
    }
    if (!('bluetooth' in navigator)) {
      throw console.error('No bluetooth detected');
    } else {
      this.navb = true;
    }
  }

  setUpAnalytics() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        gtag('config', 'G-1GE849S77H', {
          page_path: event.urlAfterRedirects,
        });
      });
  }
}
