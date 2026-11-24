import { Directive, ElementRef, inject } from '@angular/core';

export const DEFAULT_AVATAR = '/default-avatar.svg';

/** Swaps a broken avatar URL (e.g. a dead image host) for the bundled default avatar. */
@Directive({
  selector: 'img[appAvatar]',
  host: { '(error)': 'onError()' },
})
export class AvatarFallbackDirective {
  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  onError(): void {
    if (!this.img.src.endsWith(DEFAULT_AVATAR)) {
      this.img.src = DEFAULT_AVATAR;
    }
  }
}
