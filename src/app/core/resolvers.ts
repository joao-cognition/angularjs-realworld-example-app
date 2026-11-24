import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticlesService } from './articles.service';
import { Article, Profile } from './models';
import { ProfileService } from './profile.service';
import { UserService } from './user.service';

function homeRedirect(): RedirectCommand {
  const router = inject(Router);
  return new RedirectCommand(router.createUrlTree(['/']));
}

export const articleResolver: ResolveFn<Article> = (route) => {
  const home = homeRedirect();
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(home)));
};

/** Only the author may edit; anyone else is sent home. `null` means "new article". */
export const editorArticleResolver: ResolveFn<Article | null> = (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) {
    return null;
  }
  const home = homeRedirect();
  const user = inject(UserService);
  return inject(ArticlesService)
    .get(slug)
    .pipe(
      map((article) => (article.author.username === user.current()?.username ? article : home)),
      catchError(() => of(home)),
    );
};

export const profileResolver: ResolveFn<Profile> = (route) => {
  const home = homeRedirect();
  return inject(ProfileService)
    .get(route.paramMap.get('username') ?? '')
    .pipe(catchError(() => of(home)));
};
