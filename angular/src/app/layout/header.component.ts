import { LowerCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppConstants } from '../core/app-constants';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LowerCasePipe],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">{{ appName | lowercase }}</a>

        @if (user.current(); as currentUser) {
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/editor" routerLinkActive="active"><i class="ion-compose"></i>&nbsp;New Article</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/settings" routerLinkActive="active"><i class="ion-gear-a"></i>&nbsp;Settings</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [routerLink]="'/@' + currentUser.username" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <img [attr.src]="currentUser.image || null" class="user-pic" />
                {{ currentUser.username }}
              </a>
            </li>
          </ul>
        } @else {
          <ul class="nav navbar-nav pull-xs-right">
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
        }
      </div>
    </nav>
  `,
})
export class HeaderComponent {
  protected readonly user = inject(UserService);
  protected readonly appName = AppConstants.appName;
}
