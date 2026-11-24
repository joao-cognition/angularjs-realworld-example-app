import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from './models';

/** Normalise an API failure into the RealWorld `{ field: [messages] }` shape used by `ListErrors`. */
export function toErrors(err: unknown): Errors {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { errors?: Errors; message?: string } | null;
    if (body && typeof body === 'object' && body.errors) {
      return body.errors;
    }
    if (body && typeof body === 'object' && body.message) {
      return { error: [body.message] };
    }
    return { error: [err.status ? `${err.status} ${err.statusText}` : 'network request failed'] };
  }
  return { error: [String(err)] };
}
