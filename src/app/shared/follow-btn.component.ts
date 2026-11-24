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
      [class.disabled]="isSubmitting()"
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

  private readonly userService = inject(UserService);
  private readonly profiles = inject(ProfileService);
  private readonly router = inject(Router);
  protected readonly isSubmitting = signal(false);

  submit(): void {
    if (!this.userService.current()) {
      void this.router.navigate(['/register']);
      return;
    }
    const profile = this.user();
    this.isSubmitting.set(true);
    const request = profile.following
      ? this.profiles.unfollow(profile.username)
      : this.profiles.follow(profile.username);
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toggled.emit({ ...profile, following: !profile.following });
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
