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
      &nbsp;
      {{ user().following ? 'Unfollow' : 'Follow' }} {{ user().username }}
    </button>
  `,
})
export class FollowBtnComponent {
  private readonly session = inject(UserService);
  private readonly profiles = inject(ProfileService);
  private readonly router = inject(Router);

  readonly user = input.required<Profile>();
  /** Emits the updated profile; the parent owns it and replaces it. */
  readonly toggled = output<Profile>();
  protected readonly isSubmitting = signal(false);

  submit(): void {
    this.isSubmitting.set(true);
    if (!this.session.current()) {
      this.router.navigateByUrl('/register');
      return;
    }
    const profile = this.user();
    const req = profile.following ? this.profiles.unfollow(profile.username) : this.profiles.follow(profile.username);
    req.subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.toggled.emit(updated);
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
