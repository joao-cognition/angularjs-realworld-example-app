import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticlesService } from '../../core/articles.service';
import { Article } from '../../core/models';
import { UserService } from '../../core/user.service';

/** Legacy `app.editor` resolve: load the article for /editor/:slug, home if it is not the current user's. */
export const editorArticleResolver: ResolveFn<Article | null> = (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug) return of(null);
  const router = inject(Router);
  const user = inject(UserService);
  const home = new RedirectCommand(router.parseUrl('/'));
  return inject(ArticlesService)
    .get(slug)
    .pipe(
      map((article) => (user.current()?.username === article.author.username ? article : home)),
      catchError(() => of(home)),
    );
};
