import { Routes } from '@angular/router';
import { requireAnon } from '../../core/auth.guards';
import { AuthComponent } from './auth.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: AuthComponent, title: 'Sign in', data: { authType: 'login' }, canActivate: [requireAnon] },
  { path: 'register', component: AuthComponent, title: 'Sign up', data: { authType: 'register' }, canActivate: [requireAnon] },
];
