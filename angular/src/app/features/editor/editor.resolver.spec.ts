import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ArticlesService } from '../../core/articles.service';
import { Article } from '../../core/models';
import { UserService } from '../../core/user.service';
import { editorArticleResolver } from './editor.resolver';

const article = { slug: 'a', author: { username: 'alice' } } as Article;

function run(slug: string | null, current: string | null, get: () => Observable<Article>) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: ArticlesService, useValue: { get } },
      {
        provide: UserService,
        useValue: { current: signal(current ? { username: current } : null) },
      },
    ],
  });
  const route = { paramMap: convertToParamMap(slug ? { slug } : {}) } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    firstValueFrom(
      editorArticleResolver(route, {} as RouterStateSnapshot) as Observable<
        Article | null | RedirectCommand
      >,
    ),
  );
}

function redirectsHome(res: unknown) {
  expect(res).toBeInstanceOf(RedirectCommand);
  expect(TestBed.inject(Router).serializeUrl((res as RedirectCommand).redirectTo)).toBe('/');
}

describe('editorArticleResolver', () => {
  it('resolves null for a new article without loading anything', async () => {
    const get = vi.fn();
    expect(await run(null, 'alice', get)).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });

  it("returns the article when it is the current user's", async () => {
    expect(await run('a', 'alice', () => of(article))).toBe(article);
  });

  it("redirects home for someone else's article", async () => {
    redirectsHome(await run('a', 'bob', () => of(article)));
  });

  it('redirects home when the article cannot be loaded', async () => {
    redirectsHome(await run('missing', 'alice', () => throwError(() => new Error('404'))));
  });
});
