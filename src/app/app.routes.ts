import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'tag/:tag',
    title: 'Home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    title: 'Sign in',
    data: { authType: 'login' },
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    title: 'Sign up',
    data: { authType: 'register' },
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'settings',
    title: 'Settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'editor',
    title: 'Editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'editor/:slug',
    title: 'Editor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'article/:slug',
    title: 'Article',
    loadComponent: () =>
      import('./features/article/article.component').then((m) => m.ArticleComponent),
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: '',
        title: 'Profile',
        data: { tab: 'author' },
        loadComponent: () =>
          import('./features/profile/profile-articles.component').then(
            (m) => m.ProfileArticlesComponent,
          ),
      },
      {
        path: 'favorites',
        title: 'Favorites',
        data: { tab: 'favorited' },
        loadComponent: () =>
          import('./features/profile/profile-articles.component').then(
            (m) => m.ProfileArticlesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
