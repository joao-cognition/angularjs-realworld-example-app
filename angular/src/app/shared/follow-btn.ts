import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Profile } from '../core/models';
import { ProfileService } from '../core/profile.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'follow-btn',
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
export class FollowBtn {
  readonly user = model.required<Profile>();
  protected readonly isSubmitting = signal(false);
  private readonly profiles = inject(ProfileService);
  private readonly users = inject(UserService);
  private readonly router = inject(Router);

  submit() {
    this.isSubmitting.set(true);
    if (!this.users.current()) {
      this.router.navigateByUrl('/register');
      return;
    }
    const u = this.user();
    const req = u.following ? this.profiles.unfollow(u.username) : this.profiles.follow(u.username);
    req.subscribe(() => {
      this.isSubmitting.set(false);
      this.user.update((cur) => ({ ...cur, following: !u.following }));
    });
  }
}
