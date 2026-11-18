import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ArticlesService } from '../../core/articles.service';
import { Article } from '../../core/models';

/** Legacy state resolve: Articles.get(slug), or go home when it fails. */
export const articleResolver: ResolveFn<Article> = (route) => {
  const router = inject(Router);
  return inject(ArticlesService)
    .get(route.paramMap.get('slug') ?? '')
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/')))));
};
