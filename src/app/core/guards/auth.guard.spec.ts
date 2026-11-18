import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { UserService } from '../services/user.service';
import { authGuard, noAuthGuard } from './auth.guard';

const run = (guard: typeof authGuard) =>
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

  it('authGuard redirects anonymous users home', () => {
    const result = run(authGuard);
    expect(result instanceof UrlTree && result.toString()).toBe('/');
  });

  it('authGuard lets signed-in users through; noAuthGuard sends them home', () => {
    TestBed.inject(UserService).setAuth({
      email: 'a@b.c',
      token: 't',
      username: 'a',
      bio: null,
      image: null,
    });
    expect(run(authGuard)).toBe(true);
    const result = run(noAuthGuard);
    expect(result instanceof UrlTree && result.toString()).toBe('/');
  });
});
