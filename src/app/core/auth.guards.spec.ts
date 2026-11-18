import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { ensureAuthIs } from './auth.guards';
import { UserService } from './user.service';

function run(expected: boolean, valid: boolean) {
  TestBed.configureTestingModule({
    providers: [{ provide: UserService, useValue: { verifyAuth: () => of(valid) } }],
  });
  return TestBed.runInInjectionContext(
    () =>
      ensureAuthIs(expected)({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<
        boolean | UrlTree
      >,
  );
}

describe('ensureAuthIs', () => {
  it('allows the route when the auth state matches', async () => {
    expect(await firstValueFrom(run(true, true))).toBe(true);
  });

  it('redirects home when it does not', async () => {
    const result = await firstValueFrom(run(false, true));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
