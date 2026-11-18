import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from '../core/models';
import { ProfileService } from '../core/profile.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-follow-btn',
  template: `
    <button
      class="btn btn-sm action-btn"
      [class.disabled]="isSubmitting()"
      [class.btn-outline-secondary]="!user().following"
      [class.btn-secondary]="user().following"
      (click)="submit()"
    >
      <i class="ion-plus-round"></i>
      &nbsp;
      {{ user().following ? 'Unfollow' : 'Follow' }} {{ user().username }}
    </button>
  `,
})
export class FollowBtnComponent {
  readonly user = model.required<Profile>();
  readonly isSubmitting = signal(false);

  private readonly currentUser = inject(UserService);
  private readonly profiles = inject(ProfileService);
  private readonly router = inject(Router);

  submit(): void {
    this.isSubmitting.set(true);

    if (!this.currentUser.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }

    const { username, following } = this.user();
    const request = following ? this.profiles.unfollow(username) : this.profiles.follow(username);
    request.subscribe({
      next: (profile) => {
        this.isSubmitting.set(false);
        this.user.update((user) => ({ ...user, following: profile.following }));
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
