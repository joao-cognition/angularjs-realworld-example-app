import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppConstants } from '../core/app.constants';
import { UserService } from '../core/user.service';
import { AvatarPipe } from '../shared/avatar.pipe';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ShowAuthedDirective, AvatarPipe],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">{{ appName }}</a>

        <ul *appShowAuthed="false" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/login" routerLinkActive="active">Sign in</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/register" routerLinkActive="active">Sign up</a>
          </li>
        </ul>

        <ul *appShowAuthed="true" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/editor" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
              <i class="ion-compose"></i>&nbsp;New Article
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/settings" routerLinkActive="active">
              <i class="ion-gear-a"></i>&nbsp;Settings
            </a>
          </li>
          @if (user.current(); as me) {
            <li class="nav-item">
              <a class="nav-link" [routerLink]="['/@' + me.username]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <img [src]="me.image | avatar" class="user-pic" alt="" />
                {{ me.username }}
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
})
export class HeaderComponent {
  protected readonly appName = AppConstants.appName.toLowerCase();
  protected readonly user = inject(UserService);
}
