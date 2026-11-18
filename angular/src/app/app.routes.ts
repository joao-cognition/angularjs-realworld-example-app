import { ActivatedRouteSnapshot, Routes, UrlSegment } from '@angular/router';
import {
  articleResolver,
  editorArticleResolver,
  ensureAuthIs,
  profileResolver,
} from './core/guards';
import { Article, Profile } from './core/models';

const profileMatcher = (segments: UrlSegment[]) =>
  segments[0]?.path.startsWith('@')
    ? {
        consumed: [segments[0]],
        posParams: { username: new UrlSegment(segments[0].path.slice(1), {}) },
      }
    : null;

const profileOf = (r: ActivatedRouteSnapshot) => r.parent!.data['profile'] as Profile;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home',
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Sign in',
    data: { authType: 'login', title: 'Sign in' },
    canActivate: [ensureAuthIs(false)],
    loadComponent: () => import('./auth/auth').then((m) => m.Auth),
  },
  {
    path: 'register',
    title: 'Sign up',
    data: { authType: 'register', title: 'Sign up' },
    canActivate: [ensureAuthIs(false)],
    loadComponent: () => import('./auth/auth').then((m) => m.Auth),
  },
  {
    path: 'settings',
    title: 'Settings',
    canActivate: [ensureAuthIs(true)],
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
  {
    path: 'editor',
    title: 'Editor',
    canActivate: [ensureAuthIs(true)],
    loadComponent: () => import('./editor/editor').then((m) => m.Editor),
  },
  {
    path: 'editor/:slug',
    title: 'Editor',
    canActivate: [ensureAuthIs(true)],
    resolve: { article: editorArticleResolver },
    loadComponent: () => import('./editor/editor').then((m) => m.Editor),
  },
  {
    path: 'article/:slug',
    resolve: { article: articleResolver },
    data: { pageTitle: (r: ActivatedRouteSnapshot) => (r.data['article'] as Article).title },
    loadComponent: () => import('./article/article').then((m) => m.ArticlePage),
  },
  {
    matcher: profileMatcher,
    resolve: { profile: profileResolver },
    loadComponent: () => import('./profile/profile').then((m) => m.ProfilePage),
    children: [
      {
        path: '',
        data: { pageTitle: (r: ActivatedRouteSnapshot) => `@${profileOf(r).username}` },
        loadComponent: () => import('./profile/profile-articles').then((m) => m.ProfileArticles),
      },
      {
        path: 'favorites',
        data: {
          favorites: true,
          pageTitle: (r: ActivatedRouteSnapshot) =>
            `Articles favorited by ${profileOf(r).username}`,
        },
        loadComponent: () => import('./profile/profile-articles').then((m) => m.ProfileArticles),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
