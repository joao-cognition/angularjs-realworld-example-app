import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL } from '../api.config';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { User } from '../models';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';

const user: User = { email: 'a@b.c', token: 'jwt-1', username: 'alice', bio: null, image: null };

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('stores the JWT under jwtToken on login', () => {
    service.attemptAuth('login', { email: user.email, password: 'pw' }).subscribe();
    const req = http.expectOne(`${API_URL}/users/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user: { email: user.email, password: 'pw' } });
    req.flush({ user });
    expect(localStorage.getItem('jwtToken')).toBe('jwt-1');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.authState()).toBe('authenticated');
  });

  it('registers against POST /users', () => {
    service
      .attemptAuth('register', { username: 'alice', email: user.email, password: 'pw' })
      .subscribe();
    http.expectOne({ method: 'POST', url: `${API_URL}/users` }).flush({ user });
    expect(service.currentUser()?.username).toBe('alice');
  });

  it('populate() restores the session with the token header', async () => {
    TestBed.inject(JwtService).save('jwt-1');
    const done = service.populate();
    const req = http.expectOne(`${API_URL}/user`);
    expect(req.request.headers.get('Authorization')).toBe('Token jwt-1');
    req.flush({ user });
    await done;
    expect(service.currentUser()).toEqual(user);
  });

  it('populate() purges an invalid token', async () => {
    TestBed.inject(JwtService).save('stale');
    const done = service.populate();
    http.expectOne(`${API_URL}/user`).flush({}, { status: 401, statusText: 'Unauthorized' });
    await done;
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(service.authState()).toBe('unauthenticated');
  });

  it('update() omits an empty password', () => {
    service.update({ bio: 'hi', password: '' }).subscribe();
    const req = http.expectOne({ method: 'PUT', url: `${API_URL}/user` });
    expect(req.request.body).toEqual({ user: { bio: 'hi' } });
    req.flush({ user: { ...user, bio: 'hi' } });
    expect(service.currentUser()?.bio).toBe('hi');
  });

  it('logout() clears the token and user', () => {
    service.setAuth(user);
    service.logout();
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
