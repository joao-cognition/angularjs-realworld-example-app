import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppConstants } from './app.constants';
import { authInterceptor, RELOAD } from './auth.interceptor';
import { JwtService } from './jwt.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctl: HttpTestingController;
  let jwt: JwtService;
  let reload: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    localStorage.clear();
    reload = vi.fn<() => void>();
    RELOAD.page = reload;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctl = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  it('adds the Token header to API calls only', () => {
    jwt.save('abc');
    http.get(`${AppConstants.api}/tags`).subscribe();
    http.get('https://example.com/x').subscribe();
    expect(ctl.expectOne(`${AppConstants.api}/tags`).request.headers.get('Authorization')).toBe(
      'Token abc',
    );
    expect(ctl.expectOne('https://example.com/x').request.headers.has('Authorization')).toBe(false);
  });

  it('drops the JWT and reloads when a token is rejected', () => {
    jwt.save('abc');
    http.get(`${AppConstants.api}/user`).subscribe({ error: () => undefined });
    ctl
      .expectOne(`${AppConstants.api}/user`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(jwt.get()).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('leaves an anonymous 401 (bad credentials) to the caller', () => {
    let status = 0;
    http
      .post(`${AppConstants.api}/users/login`, {})
      .subscribe({ error: (e) => (status = e.status) });
    ctl
      .expectOne(`${AppConstants.api}/users/login`)
      .flush({ errors: { credentials: ['invalid'] } }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(reload).not.toHaveBeenCalled();
  });
});
