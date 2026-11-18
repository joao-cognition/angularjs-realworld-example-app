import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../core/models';
import { UserService } from '../core/user.service';
import { FollowBtn } from '../shared/follow-btn';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FollowBtn],
  template: `
    <div class="profile-page">
      <div class="user-info">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img [attr.src]="profile().image" class="user-img" />
              <h4>{{ profile().username }}</h4>
              <p>{{ profile().bio }}</p>

              @if (isUser()) {
                <a routerLink="/settings" class="btn btn-sm btn-outline-secondary action-btn">
                  <i class="ion-gear-a"></i> Edit Profile Settings
                </a>
              } @else {
                <follow-btn [(user)]="profile" />
              }
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a
                    class="nav-link"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: true }"
                    [routerLink]="['/@' + profile().username]"
                  >
                    My Articles
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    routerLinkActive="active"
                    [routerLink]="['/@' + profile().username, 'favorites']"
                  >
                    Favorited Articles
                  </a>
                </li>
              </ul>
            </div>

            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfilePage {
  /** Bound from the route resolver. */
  readonly resolved = input.required<Profile>({ alias: 'profile' });
  protected readonly profile = linkedSignal(() => this.resolved());
  private readonly user = inject(UserService);
  protected readonly isUser = computed(
    () => this.user.current()?.username === this.profile().username,
  );
}
