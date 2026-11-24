import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_CONSTANTS } from '../core/app.constants';
import { UserService } from '../core/user.service';
import { AvatarDirective } from '../shared/avatar.directive';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LowerCasePipe, ShowAuthedDirective, AvatarDirective],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">{{ appName | lowercase }}</a>

        <!-- Show this for logged out users -->
        <ul *appShowAuthed="false" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a
              class="nav-link"
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
            >
              Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/login" routerLinkActive="active">Sign in</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/register" routerLinkActive="active">Sign up</a>
          </li>
        </ul>

        <!-- Show this for logged in users -->
        <ul *appShowAuthed="true" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a
              class="nav-link"
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
            >
              Home
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              routerLink="/editor"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
            >
              <i class="ion-compose"></i>&nbsp;New Article
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/settings" routerLinkActive="active">
              <i class="ion-gear-a"></i>&nbsp;Settings
            </a>
          </li>
          @if (user.current(); as currentUser) {
            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/@' + currentUser.username]"
                routerLinkActive="active"
                [routerLinkActiveOptions]="exact"
              >
                <img [appAvatar]="currentUser.image" class="user-pic" />
                {{ currentUser.username }}
              </a>
            </li>
          }
        </ul>
      </div>
    </nav>
  `,
})
export class HeaderComponent {
  protected readonly appName = inject(APP_CONSTANTS).appName;
  protected readonly user = inject(UserService);
  protected readonly exact = { exact: true };
}
