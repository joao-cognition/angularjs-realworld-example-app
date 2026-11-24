import { Component, computed, input } from '@angular/core';
import { Errors } from '../core/models';

@Component({
  selector: 'app-list-errors',
  template: `
    @if (messages().length) {
      <ul class="error-messages">
        @for (message of messages(); track $index) {
          <li>{{ message }}</li>
        }
      </ul>
    }
  `,
})
export class ListErrorsComponent {
  readonly errors = input<Errors | null>(null);

  protected readonly messages = computed(() =>
    Object.entries(this.errors() ?? {}).flatMap(([field, list]) =>
      (Array.isArray(list) ? list : [String(list)]).map((error) => `${field} ${error}`),
    ),
  );
}
