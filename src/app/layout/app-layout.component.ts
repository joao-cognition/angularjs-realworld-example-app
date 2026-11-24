import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

/** Shell for the legacy abstract `app` state: header, routed view, footer. */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header />
    <router-outlet />
    <app-footer />
  `,
})
export class AppLayoutComponent {}
