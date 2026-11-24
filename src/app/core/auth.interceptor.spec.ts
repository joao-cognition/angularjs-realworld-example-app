import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_CONSTANTS } from './app.constants';
import { authInterceptor } from './auth.interceptor';
import { JwtService } from './jwt.service';

describe('authInterceptor', () => {
  const api = 'https://api.test/api';
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let jwt: JwtService;
  let reload: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reload = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: APP_CONSTANTS, useValue: { api, jwtKey: 'jwtToken', appName: 'Conduit' } },
        { provide: DOCUMENT, useValue: { location: { reload } } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('attaches the JWT to API requests', () => {
    jwt.save('abc');
    http.get(`${api}/user`).subscribe();
    expect(httpMock.expectOne(`${api}/user`).request.headers.get('Authorization')).toBe(
      'Token abc',
    );
  });

  it('does not attach the JWT to other hosts or when signed out', () => {
    jwt.save('abc');
    http.get('https://elsewhere.test/x').subscribe();
    expect(
      httpMock.expectOne('https://elsewhere.test/x').request.headers.has('Authorization'),
    ).toBe(false);
    jwt.destroy();
    http.get(`${api}/tags`).subscribe();
    expect(httpMock.expectOne(`${api}/tags`).request.headers.has('Authorization')).toBe(false);
  });

  it('clears the JWT and reloads on 401 for authenticated requests', () => {
    jwt.save('stale');
    http.get(`${api}/user`).subscribe({ error: () => undefined });
    httpMock.expectOne(`${api}/user`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(jwt.get()).toBeNull();
    expect(reload).toHaveBeenCalled();
  });

  it('leaves a 401 from an anonymous login attempt to the form', () => {
    http.post(`${api}/users/login`, {}).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${api}/users/login`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(reload).not.toHaveBeenCalled();
  });
});
