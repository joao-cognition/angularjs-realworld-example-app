import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { JwtService } from './jwt.service';
import { User } from './models';
import { UserService } from './user.service';

const API = 'https://api.realworld.show/api';
const user: User = { email: 'a@b.c', token: 't0k', username: 'alice', bio: null, image: null };

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => http.verify());

  it('logs in via POST /users/login, stores the JWT and sets the current user', async () => {
    const result = firstValueFrom(service.attemptAuth('login', { email: 'a@b.c', password: 'pw' }));
    const req = http.expectOne(`${API}/users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user: { email: 'a@b.c', password: 'pw' } });
    req.flush({ user });

    expect(await result).toEqual(user);
    expect(jwt.get()).toBe('t0k');
    expect(service.current()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('registers via POST /users', () => {
    service
      .attemptAuth('register', { username: 'alice', email: 'a@b.c', password: 'pw' })
      .subscribe();
    http.expectOne({ method: 'POST', url: `${API}/users` }).flush({ user });
    expect(service.isAuthenticated()).toBe(true);
  });

  it('verifyAuth resolves false without a token and makes no request', async () => {
    expect(await firstValueFrom(service.verifyAuth())).toBe(false);
  });

  it('verifyAuth loads the user once for concurrent callers', async () => {
    jwt.save('t0k');
    const a = firstValueFrom(service.verifyAuth());
    const b = firstValueFrom(service.verifyAuth());
    http.expectOne(`${API}/user`).flush({ user });
    expect([await a, await b]).toEqual([true, true]);
    expect(await firstValueFrom(service.verifyAuth())).toBe(true);
  });

  it('verifyAuth clears an invalid token', async () => {
    jwt.save('bad');
    const result = firstValueFrom(service.verifyAuth());
    http.expectOne(`${API}/user`).flush({}, { status: 500, statusText: 'err' });
    expect(await result).toBe(false);
    expect(jwt.get()).toBeNull();
  });

  it('logout clears the user and the token', () => {
    jwt.save('t0k');
    service.logout();
    expect(service.current()).toBeNull();
    expect(jwt.get()).toBeNull();
  });
});
