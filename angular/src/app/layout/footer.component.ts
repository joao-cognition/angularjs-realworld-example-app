import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConstants } from '../core/app.constants';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer>
      <div class="container">
        <a class="logo-font" routerLink="/">{{ appName }}</a>
        <span class="attribution">
          &copy; {{ year }}. An interactive learning project from
          <a href="https://thinkster.io">Thinkster</a>. Code licensed under MIT.
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly appName = AppConstants.appName.toLowerCase();
  protected readonly year = new Date().getFullYear();
}
