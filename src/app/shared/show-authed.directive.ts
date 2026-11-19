import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { UserService } from '../core/user.service';

/** Renders its template only when the auth state matches: `*appShowAuthed="true"`. */
@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective {
  readonly appShowAuthed = input.required<boolean>();

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly user = inject(UserService);

  constructor() {
    effect(() => {
      const show = this.user.isAuthenticated() === this.appShowAuthed();
      if (show && this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (!show) {
        this.viewContainer.clear();
      }
    });
  }
}
