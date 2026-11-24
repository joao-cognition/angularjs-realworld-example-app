import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from '../core/models';
import { ProfileService } from '../core/profile.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-follow-btn',
  template: `
    <button
      class="btn btn-sm action-btn"
      type="button"
      [class.disabled]="submitting()"
      [class.btn-outline-secondary]="!user().following"
      [class.btn-secondary]="user().following"
      (click)="submit()"
    >
      <i class="ion-plus-round"></i>
      &nbsp; {{ user().following ? 'Unfollow' : 'Follow' }} {{ user().username }}
    </button>
  `,
})
export class FollowBtnComponent {
  readonly user = input.required<Profile>();
  readonly toggled = output<Profile>();

  private readonly profiles = inject(ProfileService);
  private readonly auth = inject(UserService);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }
    if (this.submitting()) return;
    this.submitting.set(true);
    const profile = this.user();
    const request = profile.following
      ? this.profiles.unfollow(profile.username)
      : this.profiles.follow(profile.username);
    request.subscribe({
      next: (updated) => {
        this.submitting.set(false);
        this.toggled.emit({ ...profile, following: updated.following });
      },
      error: () => this.submitting.set(false),
    });
  }
}
