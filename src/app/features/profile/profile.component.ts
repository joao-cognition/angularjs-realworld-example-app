import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../../core/models';
import { ProfileService } from '../../core/services/profile.service';
import { UserService } from '../../core/services/user.service';
import { DefaultImagePipe } from '../../shared/default-image.pipe';
import { FollowButtonComponent } from '../../shared/follow-button.component';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FollowButtonComponent, DefaultImagePipe],
  template: `
    @if (profile(); as current) {
      <div class="profile-page">
        <div class="user-info">
          <div class="container">
            <div class="row">
              <div class="col-xs-12 col-md-10 offset-md-1">
                <img [src]="current.image | defaultImage" class="user-img" />
                <h4>{{ current.username }}</h4>
                <p>{{ current.bio }}</p>
                @if (isUser()) {
                  <a routerLink="/settings" class="btn btn-sm btn-outline-secondary action-btn">
                    <i class="ion-gear-a"></i> Edit Profile Settings
                  </a>
                } @else {
                  <app-follow-button [profile]="current" (profileChange)="profile.set($event)" />
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
                      [routerLink]="['/profile', current.username]"
                      routerLinkActive="active"
                      [routerLinkActiveOptions]="{
                        paths: 'exact',
                        queryParams: 'ignored',
                        fragment: 'ignored',
                        matrixParams: 'ignored',
                      }"
                      >My Articles</a
                    >
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      [routerLink]="['/profile', current.username, 'favorites']"
                      routerLinkActive="active"
                      >Favorited Articles</a
                    >
                  </li>
                </ul>
              </div>
              <router-outlet />
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProfileComponent {
  private readonly profiles = inject(ProfileService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly username = input.required<string>();
  protected readonly profile = signal<Profile | null>(null);
  protected readonly isUser = computed(
    () => this.user.currentUser()?.username === this.profile()?.username,
  );

  constructor() {
    effect(() => {
      const username = this.username();
      untracked(() => {
        this.profile.set(null);
        this.profiles.get(username).subscribe({
          next: (profile) => this.profile.set(profile),
          error: () => void this.router.navigateByUrl('/'),
        });
      });
    });
  }
}
