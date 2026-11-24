import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';

export const RELOAD = { page: () => window.location.reload() };

/** Attaches `Authorization: Token <jwt>` to API calls; a 401 on an authenticated call drops the token and reloads. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const token = jwt.get();
  const authed = !!token && req.url.startsWith(AppConstants.api);
  const request = authed ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      // Only for calls that sent a token: a wrong-password login also returns 401 and must surface its errors.
      if (authed && err instanceof HttpErrorResponse && err.status === 401) {
        jwt.destroy();
        RELOAD.page();
      }
      return throwError(() => err);
    }),
  );
};
