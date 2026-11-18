import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';

const user = { username: 'jake', email: 'jake@jake.jake', bio: null, image: null, token: 'jwt-1' };

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

  it('stores the JWT and current user after sign in', () => {
    service.attemptAuth('login', { email: user.email, password: 'x' }).subscribe();
    const req = http.expectOne(`${AppConstants.api}/users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user: { email: user.email, password: 'x' } });
    req.flush({ user });
    expect(jwt.get()).toBe('jwt-1');
    expect(service.current()?.username).toBe('jake');
  });

  it('registers against /users', () => {
    service
      .attemptAuth('register', { username: 'jake', email: user.email, password: 'x' })
      .subscribe();
    http.expectOne(`${AppConstants.api}/users`).flush({ user });
    expect(service.current()?.username).toBe('jake');
  });

  it('verifyAuth is false without a JWT and makes no request', async () => {
    expect(await service.verifyAuth()).toBe(false);
  });

  it('verifyAuth loads the user for a stored JWT', async () => {
    jwt.save('jwt-1');
    const p = service.verifyAuth();
    http.expectOne(`${AppConstants.api}/user`).flush({ user });
    expect(await p).toBe(true);
    expect(service.current()?.email).toBe(user.email);
  });

  it('verifyAuth drops a rejected JWT', async () => {
    jwt.save('stale');
    const p = service.verifyAuth();
    http
      .expectOne(`${AppConstants.api}/user`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await p).toBe(false);
    expect(jwt.get()).toBeNull();
  });

  it('logout clears the user and JWT', () => {
    jwt.save('jwt-1');
    service.logout();
    expect(service.current()).toBeNull();
    expect(jwt.get()).toBeNull();
  });
});
