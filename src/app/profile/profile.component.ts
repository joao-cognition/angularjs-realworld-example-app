import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Profile } from '../core/models';
import { UserService } from '../core/user.service';
import { FollowBtnComponent } from '../shared/follow-btn.component';
import { AvatarPipe } from '../shared/avatar.pipe';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FollowBtnComponent, AvatarPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  /** Bound from the route resolver. */
  readonly profile = input.required<Profile>();
  readonly current = linkedSignal(() => this.profile());

  private readonly user = inject(UserService);
  readonly isUser = computed(() => this.user.current()?.username === this.current().username);
}
