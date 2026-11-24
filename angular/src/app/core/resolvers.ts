import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticlesService } from './articles.service';
import { Article, Profile } from './models';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

function home() {
  return new RedirectCommand(inject(Router).parseUrl('/'));
}

export const articleResolver: ResolveFn<Article> = (route) => {
  const redirect = home();
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(redirect)));
};

/** Only the author may edit; anyone else (or a missing article) goes home. */
export const editableArticleResolver: ResolveFn<Article> = (route) => {
  const redirect = home();
  const user = inject(UserService);
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(
      map((article) =>
        article.author.username === user.current()?.username ? article : redirect,
      ),
      catchError(() => of(redirect)),
    );
};

export const profileResolver: ResolveFn<Profile> = (route) => {
  const redirect = home();
  return inject(ProfileService)
    .get(route.paramMap.get('username') ?? '')
    .pipe(catchError(() => of(redirect)));
};
