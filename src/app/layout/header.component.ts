import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppConstants } from '../core/app.constants';
import { UserService } from '../core/user.service';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LowerCasePipe, ShowAuthedDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly appName = AppConstants.appName;
  readonly currentUser = inject(UserService).current;
}
