import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const api = inject(APP_CONSTANTS).api;
  const location = inject(DOCUMENT).location;

  const token = jwt.get();
  const sendsToken = !!token && req.url.startsWith(api);
  const request = sendsToken ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      // Only an authenticated request can mean "stale session"; a 401 from a login attempt is a form error.
      if (sendsToken && err instanceof HttpErrorResponse && err.status === 401) {
        jwt.destroy();
        location.reload();
      }
      return throwError(() => err);
    }),
  );
};
