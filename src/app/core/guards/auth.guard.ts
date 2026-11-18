import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/** Editor and settings: anonymous users are sent home (same as the AngularJS `ensureAuthIs(true)`). */
export const authGuard: CanActivateFn = () =>
  inject(UserService).isAuthenticated() || inject(Router).parseUrl('/');

/** Login and register: signed-in users are sent home (`ensureAuthIs(false)`). */
export const noAuthGuard: CanActivateFn = () =>
  !inject(UserService).isAuthenticated() || inject(Router).parseUrl('/');
