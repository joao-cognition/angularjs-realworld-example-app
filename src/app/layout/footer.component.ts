import { DatePipe, LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONSTANTS } from '../core/app.constants';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LowerCasePipe, DatePipe],
  template: `
    <footer>
      <div class="container">
        <a class="logo-font" routerLink="/">{{ appName | lowercase }}</a>
        <span class="attribution">
          &copy; {{ date | date: 'yyyy' }}. An interactive learning project from
          <a href="https://thinkster.io">Thinkster</a>. Code licensed under MIT.
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly appName = inject(APP_CONSTANTS).appName;
  protected readonly date = new Date();
}
