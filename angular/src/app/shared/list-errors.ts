import { Component, input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Errors } from '../core/models';

@Component({
  selector: 'list-errors',
  imports: [KeyValuePipe],
  template: `
    @if (errors()) {
      <ul class="error-messages">
        @for (field of errors() | keyvalue: unsorted; track field.key) {
          <div>
            @for (error of field.value; track $index) {
              <li>{{ field.key }} {{ error }}</li>
            }
          </div>
        }
      </ul>
    }
  `,
})
export class ListErrors {
  readonly errors = input<Errors | null>(null);
  protected unsorted = () => 0;
}
