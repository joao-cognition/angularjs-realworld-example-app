import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-layout',
  imports: [FooterComponent, HeaderComponent, RouterOutlet],
  template: `
    <app-header />

    <router-outlet />

    <app-footer />
  `,
})
export class AppLayoutComponent {}
