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

  readonly messages = computed(() =>
    Object.entries(this.errors() ?? {}).flatMap(([field, errors]) =>
      (Array.isArray(errors) ? errors : [errors]).map((error) => `${field} ${error}`),
    ),
  );
}
