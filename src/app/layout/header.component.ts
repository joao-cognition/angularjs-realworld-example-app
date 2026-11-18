import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../core/services/user.service';
import { DefaultImagePipe } from '../shared/default-image.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, DefaultImagePipe],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">conduit</a>

        @if (user.currentUser(); as currentUser) {
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                >Home</a
              >
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/editor" routerLinkActive="active">
                <i class="ion-compose"></i>&nbsp;New Article
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/settings" routerLinkActive="active">
                <i class="ion-gear-a"></i>&nbsp;Settings
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                [routerLink]="['/profile', currentUser.username]"
                routerLinkActive="active"
              >
                <img [src]="currentUser.image | defaultImage" class="user-pic" />
                {{ currentUser.username }}
              </a>
            </li>
          </ul>
        } @else {
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                >Home</a
              >
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
}
