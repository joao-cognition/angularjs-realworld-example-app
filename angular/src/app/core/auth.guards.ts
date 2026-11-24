import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from './user.service';

/** Logged-in only (settings, editor); anonymous users are sent to the sign-in page. */
export const requireAuth: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserService)
    .verifyAuth()
    .pipe(map((ok) => ok || router.createUrlTree(['/login'])));
};

/** Logged-out only (login, register); signed-in users are sent home. */
export const requireGuest: CanActivateFn = () => {
  const router = inject(Router);
  return inject(UserService)
    .verifyAuth()
    .pipe(map((ok) => !ok || router.createUrlTree(['/'])));
};
