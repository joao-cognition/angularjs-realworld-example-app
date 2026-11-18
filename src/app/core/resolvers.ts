import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ArticlesService } from './articles.service';
import { Article, Profile } from './models';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

function redirectHome() {
  return of(new RedirectCommand(inject(Router).parseUrl('/')));
}

export const articleResolver: ResolveFn<Article> = (route) => {
  const home = redirectHome();
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => home));
};

/** Article for the editor: only its author may edit it. */
export const editableArticleResolver: ResolveFn<Article> = (route) => {
  const home = redirectHome();
  const user = inject(UserService);
  const articles = inject(ArticlesService);
  return user.verifyAuth().pipe(
    switchMap(() => articles.get(route.paramMap.get('slug') ?? '')),
    switchMap((article) =>
      article.author.username === user.current()?.username ? of(article) : home,
    ),
    catchError(() => home),
  );
};

export const profileResolver: ResolveFn<Profile> = (route) => {
  const home = redirectHome();
  return inject(ProfileService)
    .get(route.paramMap.get('username') ?? '')
    .pipe(catchError(() => home));
};
