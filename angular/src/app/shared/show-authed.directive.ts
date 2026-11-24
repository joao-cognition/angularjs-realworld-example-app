import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserService } from '../core/user.service';

/** `*appShowAuthed="true"` renders only for signed-in users, `*appShowAuthed="false"` only for guests. */
@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective {
  readonly appShowAuthed = input.required<boolean>();

  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private readonly user = inject(UserService);
  private shown = false;

  constructor() {
    effect(() => {
      const show = this.user.isAuthenticated() === this.appShowAuthed();
      if (show && !this.shown) {
        this.container.createEmbeddedView(this.template);
      } else if (!show && this.shown) {
        this.container.clear();
      }
      this.shown = show;
    });
  }
}
