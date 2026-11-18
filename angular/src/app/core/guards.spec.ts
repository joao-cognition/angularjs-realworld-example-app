import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { ensureAuthIs } from './guards';
import { UserService } from './user.service';

describe('ensureAuthIs', () => {
  function run(authed: boolean, valid: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { verifyAuth: async () => valid } },
      ],
    });
    return TestBed.runInInjectionContext(() =>
      ensureAuthIs(authed)({} as never, {} as never),
    ) as Promise<boolean | UrlTree>;
  }

  it('allows a signed-in user onto authed pages', async () => {
    expect(await run(true, true)).toBe(true);
  });

  it('sends anonymous users home from authed pages', async () => {
    const res = await run(true, false);
    expect(TestBed.inject(Router).serializeUrl(res as UrlTree)).toBe('/');
  });

  it('sends signed-in users home from sign in / sign up', async () => {
    const res = await run(false, true);
    expect(TestBed.inject(Router).serializeUrl(res as UrlTree)).toBe('/');
  });
});
