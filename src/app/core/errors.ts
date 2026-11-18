import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from './models';

export function extractErrors(err: unknown): Errors {
  if (err instanceof HttpErrorResponse && err.error && typeof err.error.errors === 'object') {
    return err.error.errors as Errors;
  }
  const message = err instanceof HttpErrorResponse ? err.message : String(err);
  return { error: [message] };
}
