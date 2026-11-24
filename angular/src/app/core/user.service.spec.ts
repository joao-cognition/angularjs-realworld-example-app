import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppConstants } from './app.constants';
import { authInterceptor, RELOAD } from './auth.interceptor';
import { JwtService } from './jwt.service';
import { User } from './models';
import { UserService } from './user.service';

const user: User = { email: 'a@b.c', token: 'jwt-1', username: 'alice', bio: null, image: null };

describe('UserService + authInterceptor', () => {
  let http: HttpTestingController;
  let service: UserService;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UserService);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  it('login stores the JWT and sets the current user', async () => {
    const result = firstValueFrom(
      service.attemptAuth('login', { email: user.email, password: 'x' }),
    );
    const req = http.expectOne(`${AppConstants.api}/users/login`);
    expect(req.request.body).toEqual({ user: { email: user.email, password: 'x' } });
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ user });
    await result;
    expect(jwt.get()).toBe('jwt-1');
    expect(service.current()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('register posts to /users', () => {
    service
      .attemptAuth('register', { username: 'alice', email: user.email, password: 'x' })
      .subscribe();
    http.expectOne(`${AppConstants.api}/users`).flush({ user });
    expect(service.current()?.username).toBe('alice');
  });

  it('adds the Token header once authenticated', () => {
    jwt.save('jwt-1');
    service.update({ bio: 'hi' }).subscribe();
    const req = http.expectOne(`${AppConstants.api}/user`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Token jwt-1');
    req.flush({ user: { ...user, bio: 'hi' } });
    expect(service.current()?.bio).toBe('hi');
  });

  it('verifyAuth resolves false without a token and makes no request', async () => {
    expect(await firstValueFrom(service.verifyAuth())).toBe(false);
  });

  it('verifyAuth loads the user for a valid token', async () => {
    jwt.save('jwt-1');
    const result = firstValueFrom(service.verifyAuth());
    http.expectOne(`${AppConstants.api}/user`).flush({ user });
    expect(await result).toBe(true);
    expect(service.current()).toEqual(user);
  });

  it('a 401 on an authenticated call clears the token and reloads', async () => {
    const reload = vi.spyOn(RELOAD, 'page').mockImplementation(() => undefined);
    jwt.save('stale');
    const result = firstValueFrom(service.verifyAuth());
    http
      .expectOne(`${AppConstants.api}/user`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBe(false);
    expect(jwt.get()).toBeNull();
    expect(reload).toHaveBeenCalled();
  });

  it('a 401 on an anonymous login does not reload (error stays visible)', async () => {
    const reload = vi.spyOn(RELOAD, 'page').mockImplementation(() => undefined);
    const result = firstValueFrom(
      service.attemptAuth('login', { email: 'x', password: 'y' }),
    ).catch((e) => e);
    http
      .expectOne(`${AppConstants.api}/users/login`)
      .flush(
        { errors: { 'email or password': ['is invalid'] } },
        { status: 401, statusText: 'Unauthorized' },
      );
    expect((await result).status).toBe(401);
    expect(reload).not.toHaveBeenCalled();
  });

  it('logout clears the user and token', () => {
    jwt.save('jwt-1');
    service.current.set(user);
    service.logout();
    expect(service.current()).toBeNull();
    expect(jwt.get()).toBeNull();
  });
});
