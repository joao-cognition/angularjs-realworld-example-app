import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConstants } from './app.constants';
import { authInterceptor } from './auth.interceptor';
import { JwtService } from './jwt.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => backend.verify());

  it('attaches the JWT to API requests', () => {
    jwt.save('abc');
    http.get(`${AppConstants.api}/user`).subscribe();
    expect(backend.expectOne(`${AppConstants.api}/user`).request.headers.get('Authorization')).toBe(
      'Token abc',
    );
  });

  it('does not attach the JWT to other hosts', () => {
    jwt.save('abc');
    http.get('https://example.com/x').subscribe();
    expect(backend.expectOne('https://example.com/x').request.headers.has('Authorization')).toBe(
      false,
    );
  });

  it('sends no header when logged out and lets 401 login errors through', () => {
    let status = 0;
    http.post(`${AppConstants.api}/users/login`, {}).subscribe({ error: (e) => (status = e.status) });
    const req = backend.expectOne(`${AppConstants.api}/users/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ errors: { credentials: ['invalid'] } }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
  });
});
