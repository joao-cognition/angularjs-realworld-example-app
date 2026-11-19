import { ActivatedRouteSnapshot, Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { requireAuth, requireGuest } from './core/auth.guards';
import { articleResolver, editableArticleResolver, profileResolver } from './core/resolvers';

/** Matches the legacy `/@:username` profile URLs. */
export const profileMatcher: UrlMatcher = (segments) => {
  const [first] = segments;
  if (!first || !first.path.startsWith('@') || first.path.length < 2) {
    return null;
  }
  return {
    consumed: [first],
    posParams: { username: new UrlSegment(first.path.slice(1), {}) },
  };
};

const username = (route: ActivatedRouteSnapshot) => route.paramMap.get('username') ?? '';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    title: 'Sign in',
    canActivate: [requireGuest],
    data: { authType: 'login' },
    loadComponent: () => import('./auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    title: 'Sign up',
    canActivate: [requireGuest],
    data: { authType: 'register' },
    loadComponent: () => import('./auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'settings',
    title: 'Settings',
    canActivate: [requireAuth],
    loadComponent: () =>
      import('./settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'editor',
    title: 'Editor',
    canActivate: [requireAuth],
    loadComponent: () => import('./editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'editor/:slug',
    title: 'Editor',
    canActivate: [requireAuth],
    resolve: { article: editableArticleResolver },
    loadComponent: () => import('./editor/editor.component').then((m) => m.EditorComponent),
  },
  {
    path: 'article/:slug',
    resolve: { article: articleResolver },
    loadComponent: () => import('./article/article.component').then((m) => m.ArticleComponent),
  },
  {
    matcher: profileMatcher,
    resolve: { profile: profileResolver },
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: '',
        title: (route) => `@${username(route)}`,
        data: { mode: 'main' },
        loadComponent: () =>
          import('./profile/profile-articles.component').then((m) => m.ProfileArticlesComponent),
      },
      {
        path: 'favorites',
        title: (route) => `Articles favorited by ${username(route)}`,
        data: { mode: 'favorites' },
        loadComponent: () =>
          import('./profile/profile-articles.component').then((m) => m.ProfileArticlesComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
