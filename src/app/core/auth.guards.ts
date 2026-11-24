import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './user.service';

/** Replaces the abstract `app` state's `User.verifyAuth()` resolve. */
export const verifyAuthResolver: ResolveFn<boolean> = () => inject(UserService).verifyAuth();

/** Replaces `User.ensureAuthIs(bool)`: sends the user home when the auth state doesn't match. */
export function ensureAuthIs(authenticated: boolean): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(UserService)
      .verifyAuth()
      .pipe(map((valid) => (valid === authenticated ? true : router.createUrlTree(['/']))));
  };
}
