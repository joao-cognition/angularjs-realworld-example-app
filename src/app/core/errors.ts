import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from './models';

/** Normalises an API failure into the `{ field: [messages] }` shape rendered by `<app-list-errors>`. */
export function toErrors(err: unknown): Errors {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      if (body.errors && typeof body.errors === 'object') {
        return Object.fromEntries(
          Object.entries(body.errors as Record<string, unknown>).map(([field, value]) => [
            field,
            Array.isArray(value) ? value.map(String) : [String(value)],
          ]),
        );
      }
      if (typeof body.message === 'string') {
        return { error: [body.message] };
      }
    }
    return { error: [err.statusText || err.message] };
  }
  return { error: [String(err)] };
}
