import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { AppConstants } from '../core/app.constants';
import { UserService } from '../core/user.service';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LowerCasePipe, ShowAuthedDirective],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">{{ appName | lowercase }}</a>

        <ul [showAuthed]="false" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a
              class="nav-link"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
              routerLink="/"
              >Home</a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLinkActive="active" routerLink="/login">Sign in</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLinkActive="active" routerLink="/register">Sign up</a>
          </li>
        </ul>

        <ul [showAuthed]="true" class="nav navbar-nav pull-xs-right">
          <li class="nav-item">
            <a
              class="nav-link"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
              routerLink="/"
              >Home</a
            >
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLinkActive="active" routerLink="/editor">
              <i class="ion-compose"></i>&nbsp;New Article
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLinkActive="active" routerLink="/settings">
              <i class="ion-gear-a"></i>&nbsp;Settings
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              routerLinkActive="active"
              [routerLinkActiveOptions]="exact"
              [routerLink]="['/@' + (user.current()?.username ?? '')]"
            >
              <img [attr.src]="user.current()?.image" class="user-pic" />
              {{ user.current()?.username }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `,
})
export class Header {
  protected readonly appName = AppConstants.appName;
  protected readonly user = inject(UserService);
  protected readonly exact = { exact: true };
}
