import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConstants } from './app-constants';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  const reload = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    reload.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: DOCUMENT, useValue: { defaultView: { location: { reload } } } },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  it('adds the token to API requests only', () => {
    localStorage.setItem('jwtToken', 'tok');
    http.get(`${AppConstants.api}/tags`).subscribe();
    http.get('https://example.com/x').subscribe();
    expect(ctrl.expectOne(`${AppConstants.api}/tags`).request.headers.get('Authorization')).toBe('Token tok');
    expect(ctrl.expectOne('https://example.com/x').request.headers.has('Authorization')).toBe(false);
  });

  it('on 401 with a token, drops it and reloads', () => {
    localStorage.setItem('jwtToken', 'tok');
    http.get(`${AppConstants.api}/user`).subscribe({ error: () => {} });
    ctrl.expectOne(`${AppConstants.api}/user`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(reload).toHaveBeenCalled();
  });

  it('on 401 without a token, passes the error through without reloading', () => {
    let status = 0;
    http.post(`${AppConstants.api}/users/login`, {}).subscribe({ error: (e) => (status = e.status) });
    ctrl.expectOne(`${AppConstants.api}/users/login`).flush({ errors: { credentials: ['invalid'] } }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(reload).not.toHaveBeenCalled();
  });
});
