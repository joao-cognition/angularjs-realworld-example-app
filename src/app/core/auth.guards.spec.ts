import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppConstants } from './app.constants';
import { requireAuth, requireGuest } from './auth.guards';
import { UserService } from './user.service';

const run = (guard: typeof requireAuth) =>
  TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('auth guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('redirects anonymous users away from protected routes', () => {
    expect(run(requireAuth)).toBeInstanceOf(UrlTree);
    expect(run(requireGuest)).toBe(true);
  });

  it('lets authenticated users in and keeps them off login/register', async () => {
    const user = TestBed.inject(UserService);
    const login = firstValueFrom(user.attemptAuth('login', { email: 'a@b.c', password: 'x' }));
    TestBed.inject(HttpTestingController)
      .expectOne(`${AppConstants.api}/users/login`)
      .flush({ user: { email: 'a@b.c', token: 't', username: 'a', bio: null, image: null } });
    await login;

    expect(run(requireAuth)).toBe(true);
    expect(run(requireGuest)).toBeInstanceOf(UrlTree);
  });
});
