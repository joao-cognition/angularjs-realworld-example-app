import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './user.service';

/** Legacy `User.ensureAuthIs(bool)`: if auth state differs, go home. */
export function ensureAuthIs(expected: boolean): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(UserService)
      .verifyAuth()
      .pipe(map((authed) => (authed === expected ? true : router.parseUrl('/'))));
  };
}

export const requireAuth = ensureAuthIs(true);
export const requireAnon = ensureAuthIs(false);
