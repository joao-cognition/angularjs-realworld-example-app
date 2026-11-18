import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../core/models';
import { UserService } from '../core/user.service';
import { FollowBtnComponent } from '../shared/follow-btn.component';

@Component({
  selector: 'app-profile',
  imports: [FollowBtnComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  /** Resolved by `profileResolver`. */
  readonly profile = input.required<Profile>();
  readonly state = linkedSignal(() => this.profile());

  private readonly currentUser = inject(UserService).current;
  readonly isUser = computed(() => this.currentUser()?.username === this.profile().username);
}
