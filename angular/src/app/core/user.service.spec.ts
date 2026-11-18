import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppConstants } from './app-constants';
import { User } from './models';
import { UserService } from './user.service';

const user: User = { email: 'a@b.c', token: 'tok', username: 'alice', bio: null, image: null };

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('logs in, stores the token and sets the current user', async () => {
    const done = firstValueFrom(service.attemptAuth('login', { email: user.email, password: 'pw' }));
    const req = http.expectOne(`${AppConstants.api}/users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user: { email: user.email, password: 'pw' } });
    req.flush({ user });
    await done;
    expect(localStorage.getItem('jwtToken')).toBe('tok');
    expect(service.current()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('registers against /users', async () => {
    const done = firstValueFrom(service.attemptAuth('register', { email: user.email, password: 'pw', username: 'alice' }));
    http.expectOne(`${AppConstants.api}/users`).flush({ user });
    await done;
    expect(service.current()?.username).toBe('alice');
  });

  it('verifyAuth is false without a token and makes no request', async () => {
    expect(await firstValueFrom(service.verifyAuth())).toBe(false);
  });

  it('verifyAuth loads the user when a token exists', async () => {
    localStorage.setItem('jwtToken', 'tok');
    const done = firstValueFrom(service.verifyAuth());
    http.expectOne(`${AppConstants.api}/user`).flush({ user });
    expect(await done).toBe(true);
    expect(service.current()).toEqual(user);
  });

  it('verifyAuth drops a rejected token', async () => {
    localStorage.setItem('jwtToken', 'bad');
    const done = firstValueFrom(service.verifyAuth());
    http.expectOne(`${AppConstants.api}/user`).flush({}, { status: 500, statusText: 'err' });
    expect(await done).toBe(false);
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });

  it('update replaces the current user', async () => {
    const done = firstValueFrom(service.update({ bio: 'hi' }));
    const req = http.expectOne(`${AppConstants.api}/user`);
    expect(req.request.method).toBe('PUT');
    req.flush({ user: { ...user, bio: 'hi' } });
    await done;
    expect(service.current()?.bio).toBe('hi');
  });

  it('logout clears the session', () => {
    service.current.set(user);
    localStorage.setItem('jwtToken', 'tok');
    service.logout();
    expect(service.current()).toBeNull();
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });
});
