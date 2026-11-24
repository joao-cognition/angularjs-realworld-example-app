import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Errors } from '../core/models';

@Component({
  selector: 'app-list-errors',
  imports: [KeyValuePipe],
  template: `
    @if (errors(); as errors) {
      <ul class="error-messages">
        @for (entry of errors | keyvalue; track entry.key) {
          @for (error of entry.value; track $index) {
            <li>{{ entry.key }} {{ error }}</li>
          }
        }
      </ul>
    }
  `,
})
export class ListErrorsComponent {
  readonly errors = input<Errors | null>(null);
}
