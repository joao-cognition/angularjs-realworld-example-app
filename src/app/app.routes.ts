import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { ensureAuthIs, verifyAuthResolver } from './core/auth.guards';
import { Article, Profile } from './core/models';
import { RouteTitle } from './core/page-title.service';
import { articleResolver, editorArticleResolver, profileResolver } from './core/resolvers';
import { AppLayoutComponent } from './layout/app-layout.component';

/** Matches the legacy `/@:username` URL (a param with a literal `@` prefix). */
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

const profileTitle =
  (format: (username: string) => string): RouteTitle =>
  (route) =>
    format((route.parent?.data['profile'] as Profile).username);

export const routes: Routes = [
  {
    // Legacy abstract `app` state: layout shell + `User.verifyAuth()` resolve.
    path: '',
    component: AppLayoutComponent,
    resolve: { auth: verifyAuthResolver },
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
        data: { title: 'Home' },
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
        canActivate: [ensureAuthIs(false)],
        data: { title: 'Sign in', authType: 'login' },
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
        canActivate: [ensureAuthIs(false)],
        data: { title: 'Sign up', authType: 'register' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
        canActivate: [ensureAuthIs(true)],
        runGuardsAndResolvers: 'always',
        data: { title: 'Settings' },
      },
      ...['editor', 'editor/:slug'].map((path) => ({
        path,
        loadComponent: () =>
          import('./pages/editor/editor.component').then((m) => m.EditorComponent),
        canActivate: [ensureAuthIs(true)],
        resolve: { article: editorArticleResolver },
        data: { title: 'Editor' },
      })),
      {
        path: 'article/:slug',
        loadComponent: () =>
          import('./pages/article/article.component').then((m) => m.ArticleComponent),
        resolve: { article: articleResolver },
        data: {
          title: ((route) => (route.data['article'] as Article).title) satisfies RouteTitle,
        },
      },
      {
        matcher: profileMatcher,
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
        resolve: { profile: profileResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/profile/profile-articles.component').then(
                (m) => m.ProfileArticlesComponent,
              ),
            data: { profileState: 'main', title: profileTitle((u) => `@${u}`) },
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('./pages/profile/profile-articles.component').then(
                (m) => m.ProfileArticlesComponent,
              ),
            data: {
              profileState: 'favorites',
              title: profileTitle((u) => `Articles favorited by ${u}`),
            },
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
