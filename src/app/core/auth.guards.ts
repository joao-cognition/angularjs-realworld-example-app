import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user.service';

function ensureAuthIs(expected: boolean): CanActivateFn {
  return () => {
    const authenticated = inject(UserService).isAuthenticated();
    return authenticated === expected || inject(Router).createUrlTree(['/']);
  };
}

export const requireAuth = ensureAuthIs(true);
export const requireGuest = ensureAuthIs(false);
