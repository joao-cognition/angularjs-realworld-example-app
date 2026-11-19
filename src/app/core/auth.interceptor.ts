import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const token = jwt.get();
  const sendsToken = token !== null && req.url.startsWith(AppConstants.api);
  const request = sendsToken
    ? req.clone({ setHeaders: { Authorization: `Token ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err) => {
      // Only an expired/invalid token should force a reset; a 401 from a bad login must reach the form.
      if (sendsToken && err?.status === 401) {
        jwt.destroy();
        window.location.reload();
      }
      return throwError(() => err);
    }),
  );
};
