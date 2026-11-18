import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';

export const RELOAD = { page: () => location.reload() };

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const token = req.url.startsWith(AppConstants.api) ? jwt.get() : null;
  const authed = token ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err: unknown) => {
      // A rejected token means the session is gone: drop it and start over, like the legacy app.
      // Unlike the legacy app, a 401 on an unauthenticated request (bad sign-in) is left to the form.
      if (token && err instanceof HttpErrorResponse && err.status === 401) {
        jwt.destroy();
        RELOAD.page();
      }
      return throwError(() => err);
    }),
  );
};
