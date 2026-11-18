import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { JwtService } from './jwt.service';

const API = 'https://api.realworld.show/api';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let jwt: JwtService;
  const reload = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    reload.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: { location: { reload } } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  afterEach(() => controller.verify());

  it('attaches `Authorization: Token <jwt>` to API requests', () => {
    jwt.save('abc');
    http.get(`${API}/tags`).subscribe();
    const req = controller.expectOne(`${API}/tags`);
    expect(req.request.headers.get('Authorization')).toBe('Token abc');
    req.flush({});
  });

  it('does not attach the token to other hosts or when signed out', () => {
    jwt.save('abc');
    http.get('https://example.com/x').subscribe();
    expect(controller.expectOne('https://example.com/x').request.headers.has('Authorization')).toBe(
      false,
    );
    jwt.destroy();
    http.get(`${API}/tags`).subscribe();
    expect(controller.expectOne(`${API}/tags`).request.headers.has('Authorization')).toBe(false);
  });

  it('on 401 clears the token and reloads the page', () => {
    jwt.save('abc');
    http.get(`${API}/user`).subscribe({ error: () => undefined });
    controller.expectOne(`${API}/user`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(jwt.get()).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });
});
