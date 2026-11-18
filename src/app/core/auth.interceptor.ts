import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const api = inject(APP_CONFIG).api;
  const location = inject(DOCUMENT).location;

  const token = jwt.get();
  const request =
    token && req.url.startsWith(api)
      ? req.clone({ setHeaders: { Authorization: `Token ${token}` } })
      : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        jwt.destroy();
        location.reload();
      }
      return throwError(() => err);
    }),
  );
};
