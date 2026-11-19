import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppConstants } from '../core/app.constants';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, DatePipe, LowerCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  readonly appName = AppConstants.appName;
  readonly date = new Date();
}
