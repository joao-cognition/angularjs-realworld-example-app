import { inject } from '@angular/core';
import { CanActivateFn, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './user.service';

/** Root resolver: restores the session from the stored JWT before any page renders. */
export const verifyAuthResolver: ResolveFn<boolean> = () => inject(UserService).verifyAuth();

/** Lets the route activate only when the auth state matches; otherwise redirects home. */
export function ensureAuthIs(expected: boolean): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(UserService)
      .verifyAuth()
      .pipe(map((valid) => (valid === expected ? true : router.createUrlTree(['/']))));
  };
}
