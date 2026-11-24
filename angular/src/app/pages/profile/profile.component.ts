import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../../core/models';
import { UserService } from '../../core/user.service';
import { AvatarPipe } from '../../shared/avatar.pipe';
import { FollowBtnComponent } from '../../shared/follow-btn.component';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AvatarPipe, FollowBtnComponent],
  template: `
    <div class="profile-page">
      <div class="user-info">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">
              <img [src]="current().image | avatar" class="user-img" alt="" />
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

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="['/@' + current().username]" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">My Articles</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" [routerLink]="['/@' + current().username, 'favorites']" routerLinkActive="active">Favorited Articles</a>
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
export class ProfileComponent {
  /** Resolved by `profileResolver`. */
  readonly profile = input.required<Profile>();

  private readonly user = inject(UserService);
  protected readonly current = linkedSignal(() => this.profile());
  protected readonly isUser = computed(
    () => this.user.current()?.username === this.profile().username,
  );
}
