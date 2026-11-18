import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  RouterStateSnapshot,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { AppConstants } from '../../core/app-constants';
import { articleResolver } from './article.resolver';
import { makeArticle } from './article.testing';

describe('articleResolver', () => {
  let http: HttpTestingController;
  const run = (slug: string) =>
    TestBed.runInInjectionContext(() =>
      articleResolver(
        { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    ) as Observable<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  it('resolves the article by slug', async () => {
    const result = firstValueFrom(run('hello'));
    http.expectOne(`${AppConstants.api}/articles/hello`).flush({ article: makeArticle() });
    expect(await result).toEqual(makeArticle());
  });

  it('redirects home when the article cannot be loaded', async () => {
    const result = firstValueFrom(run('missing'));
    http
      .expectOne(`${AppConstants.api}/articles/missing`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    const redirect = (await result) as RedirectCommand;
    expect(redirect).toBeInstanceOf(RedirectCommand);
    expect(redirect.redirectTo.toString()).toBe('/');
  });
});
