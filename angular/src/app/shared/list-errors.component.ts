import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Errors } from '../core/models';

@Component({
  selector: 'app-list-errors',
  imports: [KeyValuePipe],
  template: `
    @if (errors(); as errs) {
      <ul class="error-messages">
        @for (field of errs | keyvalue; track field.key) {
          @for (error of field.value; track $index) {
            <li>{{ field.key }} {{ error }}</li>
          }
        }
      </ul>
    }
  `,
})
export class ListErrorsComponent {
  readonly errors = input<Errors | null | undefined>(null);
}
