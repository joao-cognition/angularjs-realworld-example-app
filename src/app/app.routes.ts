import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { ensureAuthIs, verifyAuthResolver } from './core/auth.guards';
import { articleResolver, editableArticleResolver, profileResolver } from './core/resolvers';
import { AppLayoutComponent } from './layout/app-layout.component';

/** Matches `/@:username` (ui-router allowed a param inside a segment; Angular needs a matcher). */
export function profileMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  const [first] = segments;
  if (first && first.path.length > 1 && first.path.startsWith('@')) {
    return {
      consumed: [first],
      posParams: { username: new UrlSegment(first.path.slice(1), {}) },
    };
  }
  return null;
}

const editor = () => import('./editor/editor.component').then((m) => m.EditorComponent);
const auth = () => import('./auth/auth.component').then((m) => m.AuthComponent);
const profileArticles = () =>
  import('./profile/profile-articles.component').then((m) => m.ProfileArticlesComponent);

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    resolve: { auth: verifyAuthResolver },
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Home',
        loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'login',
        title: 'Sign in',
        canActivate: [ensureAuthIs(false)],
        data: { authType: 'login' },
        loadComponent: auth,
      },
      {
        path: 'register',
        title: 'Sign up',
        canActivate: [ensureAuthIs(false)],
        data: { authType: 'register' },
        loadComponent: auth,
      },
      {
        path: 'settings',
        title: 'Settings',
        canActivate: [ensureAuthIs(true)],
        loadComponent: () =>
          import('./settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'editor',
        title: 'Editor',
        canActivate: [ensureAuthIs(true)],
        loadComponent: editor,
      },
      {
        path: 'editor/:slug',
        title: 'Editor',
        canActivate: [ensureAuthIs(true)],
        resolve: { article: editableArticleResolver },
        loadComponent: editor,
      },
      {
        path: 'article/:slug',
        title: 'Article',
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
            title: 'Profile',
            data: { profileTab: 'main' },
            loadComponent: profileArticles,
          },
          {
            path: 'favorites',
            title: 'Favorites',
            data: { profileTab: 'favorites' },
            loadComponent: profileArticles,
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
