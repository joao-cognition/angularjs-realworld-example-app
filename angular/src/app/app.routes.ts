import { Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { requireAuth, requireGuest } from './core/auth.guards';
import { articleResolver, editableArticleResolver, profileResolver } from './core/resolvers';

/** Matches the `/@:username` prefix (Angular paths cannot mix literals and params in one segment). */
export const profileMatcher: UrlMatcher = (segments) => {
  const first = segments[0];
  if (first && first.path.startsWith('@') && first.path.length > 1) {
    return {
      consumed: [first],
      posParams: { username: new UrlSegment(first.path.slice(1), {}) },
    };
  }
  return null;
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    title: 'Sign in',
    canActivate: [requireGuest],
    data: { authType: 'login' },
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    title: 'Sign up',
    canActivate: [requireGuest],
    data: { authType: 'register' },
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'settings',
    title: 'Settings',
    canActivate: [requireAuth],
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'editor',
    title: 'Editor',
    canActivate: [requireAuth],
    loadComponent: () => import('./pages/editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'editor/:slug',
    title: 'Editor',
    canActivate: [requireAuth],
    resolve: { article: editableArticleResolver },
    loadComponent: () => import('./pages/editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'article/:slug',
    title: 'Article',
    resolve: { article: articleResolver },
    loadComponent: () =>
      import('./pages/article/article.component').then((m) => m.ArticleComponent),
  },
  {
    matcher: profileMatcher,
    resolve: { profile: profileResolver },
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: '',
        title: 'Profile',
        data: { tab: 'main' },
        loadComponent: () =>
          import('./pages/profile/profile-articles.component').then(
            (m) => m.ProfileArticlesComponent,
          ),
      },
      {
        path: 'favorites',
        title: 'Favorites',
        data: { tab: 'favorites' },
        loadComponent: () =>
          import('./pages/profile/profile-articles.component').then(
            (m) => m.ProfileArticlesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
