import { Directive, input, signal } from '@angular/core';

const DEFAULT_AVATAR = 'default-avatar.svg';

/** `<img [appAvatar]="user.image">` — falls back to a bundled avatar when the URL is empty or broken. */
@Directive({
  selector: 'img[appAvatar]',
  host: {
    '[src]': 'failed() ? fallback : appAvatar() || fallback',
    '(error)': 'failed.set(true)',
  },
})
export class AvatarDirective {
  readonly appAvatar = input<string | null | undefined>();
  protected readonly fallback = DEFAULT_AVATAR;
  protected readonly failed = signal(false);
}
