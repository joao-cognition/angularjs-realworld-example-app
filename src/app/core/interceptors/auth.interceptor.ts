import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api.config';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';

/**
 * Attaches `Authorization: Token <jwt>` to RealWorld API requests. If an authenticated request
 * is rejected with 401 the stored session is no longer valid, so it is cleared and the user is
 * sent home logged out (the AngularJS app did the same with a full page reload).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(JwtService).get();
  if (!token || !req.url.startsWith(API_URL)) return next(req);

  const userService = inject(UserService);
  return next(req.clone({ setHeaders: { Authorization: `Token ${token}` } })).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) userService.logout();
      return throwError(() => err);
    }),
  );
};
