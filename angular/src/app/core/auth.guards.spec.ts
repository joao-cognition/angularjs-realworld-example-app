import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { requireAuth, requireGuest } from './auth.guards';
import { UserService } from './user.service';

function run(guard: typeof requireAuth, authed: boolean): Promise<boolean | UrlTree> {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: UserService, useValue: { verifyAuth: () => of(authed) } },
    ],
  });
  const result = TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  ) as Observable<boolean | UrlTree>;
  return firstValueFrom(result);
}

describe('auth guards', () => {
  it('requireAuth lets signed-in users through', async () => {
    expect(await run(requireAuth, true)).toBe(true);
  });

  it('requireAuth redirects anonymous users to /login', async () => {
    expect(String(await run(requireAuth, false))).toBe('/login');
  });

  it('requireGuest lets anonymous users through', async () => {
    expect(await run(requireGuest, false)).toBe(true);
  });

  it('requireGuest redirects signed-in users home', async () => {
    expect(String(await run(requireGuest, true))).toBe('/');
  });
});
