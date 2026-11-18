import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AppConstants } from './app-constants';
import { JwtService } from './jwt.service';

/**
 * Attaches the JWT to API calls. On a 401 for a request that carried a token, the token is
 * stale: drop it and hard-reload (legacy behaviour). A 401 without a token (wrong password)
 * is passed through so the form can show the error; the legacy app reloaded here too.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = inject(JwtService);
  const doc = inject(DOCUMENT);
  const token = jwt.get();
  const isApi = req.url.startsWith(AppConstants.api);
  const sent = isApi && token ? req.clone({ setHeaders: { Authorization: `Token ${token}` } }) : req;

  return next(sent).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && sent.headers.has('Authorization')) {
        jwt.destroy();
        doc.defaultView?.location.reload();
      }
      return throwError(() => err);
    }),
  );
};
