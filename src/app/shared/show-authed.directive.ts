import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { UserService } from '../core/user.service';

/** `*appShowAuthed="true"` renders only for signed-in users, `false` only for guests. */
@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective {
  readonly appShowAuthed = input.required<boolean>();

  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  private readonly user = inject(UserService);
  private hasView = false;

  constructor() {
    effect(() => {
      const show = this.user.isAuthenticated() === this.appShowAuthed();
      if (show && !this.hasView) {
        this.container.createEmbeddedView(this.template);
        this.hasView = true;
      } else if (!show && this.hasView) {
        this.container.clear();
        this.hasView = false;
      }
    });
  }
}
