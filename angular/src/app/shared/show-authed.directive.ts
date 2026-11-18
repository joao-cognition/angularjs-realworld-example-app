import { computed, Directive, inject, input } from '@angular/core';
import { UserService } from '../core/user.service';

/** `[showAuthed]="true"` shows the element only when signed in; `false` only when signed out. */
@Directive({
  selector: '[showAuthed]',
  host: { '[style.display]': 'display()' },
})
export class ShowAuthedDirective {
  readonly showAuthed = input.required<boolean>();
  private readonly user = inject(UserService);
  protected readonly display = computed(() =>
    !!this.user.current() === this.showAuthed() ? 'inherit' : 'none',
  );
}
