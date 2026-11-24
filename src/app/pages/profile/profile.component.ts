import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../../core/models';
import { UserService } from '../../core/user.service';
import { AvatarDirective } from '../../shared/avatar.directive';
import { FollowBtnComponent } from '../../shared/follow-btn.component';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FollowBtnComponent, AvatarDirective],
  template: `
    <div class="profile-page">
      <!-- User's basic info & action buttons -->
      <div class="user-info">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img [appAvatar]="current().image" class="user-img" />
              <h4>{{ current().username }}</h4>
              <p>{{ current().bio }}</p>

              @if (isUser()) {
                <a routerLink="/settings" class="btn btn-sm btn-outline-secondary action-btn">
                  <i class="ion-gear-a"></i> Edit Profile Settings
                </a>
              } @else {
                <app-follow-btn [user]="current()" (toggled)="current.set($event)" />
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Container where User's posts & favs are list w/ toggle tabs -->
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
                    [routerLink]="['/@' + current().username]"
                  >
                    My Articles
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    routerLinkActive="active"
                    [routerLink]="['/@' + current().username, 'favorites']"
                  >
                    Favorited Articles
                  </a>
                </li>
              </ul>
            </div>

            <!-- List of articles -->
            <router-outlet />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  /** Resolved by `profileResolver`. */
  readonly profile = input.required<Profile>();
  protected readonly current = linkedSignal(() => this.profile());

  private readonly user = inject(UserService);
  protected readonly isUser = computed(
    () => this.user.current()?.username === this.profile().username,
  );
}
