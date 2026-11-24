import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';
import { JwtService } from './jwt.service';
import { User } from './models';
import { UserService } from './user.service';

describe('UserService', () => {
  const api = 'https://api.test/api';
  const user: User = { email: 'a@b.c', token: 't1', username: 'alice', bio: null, image: null };
  let service: UserService;
  let jwt: JwtService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: APP_CONSTANTS, useValue: { api, jwtKey: 'jwtToken', appName: 'Conduit' } },
      ],
    });
    service = TestBed.inject(UserService);
    jwt = TestBed.inject(JwtService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('verifyAuth resolves false without a JWT', async () => {
    expect(await firstValueFrom(service.verifyAuth())).toBe(false);
  });

  it('verifyAuth loads the current user from the JWT once', async () => {
    jwt.save('t1');
    const result = firstValueFrom(service.verifyAuth());
    httpMock.expectOne(`${api}/user`).flush({ user });
    expect(await result).toBe(true);
    expect(service.current()).toEqual(user);
    expect(await firstValueFrom(service.verifyAuth())).toBe(true);
  });

  it('verifyAuth drops an invalid JWT', async () => {
    jwt.save('bad');
    const result = firstValueFrom(service.verifyAuth());
    httpMock.expectOne(`${api}/user`).flush(null, { status: 500, statusText: 'Error' });
    expect(await result).toBe(false);
    expect(jwt.get()).toBeNull();
  });

  it('attemptAuth posts to /users/login and stores the session', async () => {
    const result = firstValueFrom(service.attemptAuth('login', { email: 'a@b.c', password: 'x' }));
    const req = httpMock.expectOne(`${api}/users/login`);
    expect(req.request.body).toEqual({ user: { email: 'a@b.c', password: 'x' } });
    req.flush({ user });
    await result;
    expect(jwt.get()).toBe('t1');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('attemptAuth posts to /users for registration', () => {
    service.attemptAuth('register', { username: 'a', email: 'a@b.c', password: 'x' }).subscribe();
    httpMock.expectOne(`${api}/users`).flush({ user });
  });

  it('logout clears the session', () => {
    jwt.save('t1');
    service.logout();
    expect(jwt.get()).toBeNull();
    expect(service.current()).toBeNull();
  });
});
