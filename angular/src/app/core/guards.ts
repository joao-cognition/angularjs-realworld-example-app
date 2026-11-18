import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticlesService } from './articles.service';
import { Article, Profile } from './models';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

/** Mirrors the legacy `User.ensureAuthIs(bool)` resolve: the wrong auth state goes home. */
export function ensureAuthIs(authed: boolean): CanActivateFn {
  return async () => {
    const router = inject(Router);
    const valid = await inject(UserService).verifyAuth();
    return valid === authed ? true : router.parseUrl('/');
  };
}

function home() {
  return new RedirectCommand(inject(Router).parseUrl('/'));
}

export const articleResolver: ResolveFn<Article> = (route) => {
  const toHome = home();
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(toHome)));
};

export const profileResolver: ResolveFn<Profile> = (route) => {
  const toHome = home();
  return inject(ProfileService)
    .get(route.paramMap.get('username') ?? '')
    .pipe(catchError(() => of(toHome)));
};

/** Only the author may edit an article; a new article resolves to null. */
export const editorArticleResolver: ResolveFn<Article | null> = (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) return null;
  const toHome = home();
  const user = inject(UserService).current();
  return inject(ArticlesService)
    .get(slug)
    .pipe(
      map((article) => (article.author.username === user?.username ? article : toHome)),
      catchError(() => of(toHome)),
    );
};
