import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from '../core/models';
import { ProfileService } from '../core/services/profile.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-follow-button',
  template: `
    <button
      class="btn btn-sm action-btn"
      [class.disabled]="isSubmitting()"
      [class.btn-outline-secondary]="!profile().following"
      [class.btn-secondary]="profile().following"
      (click)="toggle()"
    >
      <i class="ion-plus-round"></i>
      &nbsp; {{ profile().following ? 'Unfollow' : 'Follow' }} {{ profile().username }}
    </button>
  `,
})
export class FollowButtonComponent {
  private readonly profiles = inject(ProfileService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly profile = model.required<Profile>();
  protected readonly isSubmitting = signal(false);

  toggle(): void {
    if (!this.user.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }
    if (this.isSubmitting()) return;
    const { username, following } = this.profile();
    this.isSubmitting.set(true);
    const request = following ? this.profiles.unfollow(username) : this.profiles.follow(username);
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.profile.update((p) => ({ ...p, following: !following }));
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
