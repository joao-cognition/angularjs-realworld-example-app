import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from './models';

export function toErrors(err: unknown): Errors {
  if (err instanceof HttpErrorResponse && err.error?.errors) {
    return err.error.errors as Errors;
  }
  const message = err instanceof Error ? err.message : 'something went wrong';
  return { error: [message] };
}
