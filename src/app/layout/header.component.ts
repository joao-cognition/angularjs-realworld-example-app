import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_CONFIG } from '../core/app-config';
import { UserService } from '../core/user.service';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-header',
  imports: [LowerCasePipe, RouterLink, RouterLinkActive, ShowAuthedDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly appName = inject(APP_CONFIG).appName;
  readonly currentUser = inject(UserService).current;
}
