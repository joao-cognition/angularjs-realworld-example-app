import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { requireAnon, requireAuth } from './auth.guards';
import { UserService } from './user.service';

function run(guard: typeof requireAuth, authed: boolean) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: UserService, useValue: { verifyAuth: () => of(authed) } }],
  });
  return TestBed.runInInjectionContext(() =>
    firstValueFrom(guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as Observable<boolean | UrlTree>),
  );
}

describe('auth guards', () => {
  it('requireAuth lets signed-in users through', async () => {
    expect(await run(requireAuth, true)).toBe(true);
  });

  it('requireAuth sends anonymous users home', async () => {
    const res = await run(requireAuth, false);
    expect(TestBed.inject(Router).serializeUrl(res as UrlTree)).toBe('/');
  });

  it('requireAnon sends signed-in users home', async () => {
    const res = await run(requireAnon, true);
    expect(TestBed.inject(Router).serializeUrl(res as UrlTree)).toBe('/');
  });

  it('requireAnon lets anonymous users through', async () => {
    expect(await run(requireAnon, false)).toBe(true);
  });
});
