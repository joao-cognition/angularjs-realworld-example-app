import { Routes } from '@angular/router';
import { ARTICLE_ROUTES } from './features/article/article.routes';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { EDITOR_ROUTES } from './features/editor/editor.routes';
import { HOME_ROUTES } from './features/home/home.routes';
import { PROFILE_ROUTES } from './features/profile/profile.routes';
import { SETTINGS_ROUTES } from './features/settings/settings.routes';

// Each feature owns its routes file so feature branches don't touch this one.
export const routes: Routes = [
  ...HOME_ROUTES,
  ...AUTH_ROUTES,
  ...SETTINGS_ROUTES,
  ...EDITOR_ROUTES,
  ...ARTICLE_ROUTES,
  ...PROFILE_ROUTES,
  { path: '**', redirectTo: '' },
];
