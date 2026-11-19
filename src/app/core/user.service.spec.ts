import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';

describe('UserService.verifyAuth', () => {
  let service: UserService;
  let backend: HttpTestingController;
  let jwt: JwtService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    backend = TestBed.inject(HttpTestingController);
    jwt = TestBed.inject(JwtService);
  });

  it('resolves false without a stored token', async () => {
    expect(await service.verifyAuth()).toBe(false);
  });

  it('loads the current user for a stored token', async () => {
    jwt.save('t');
    const result = service.verifyAuth();
    backend
      .expectOne(`${AppConstants.api}/user`)
      .flush({ user: { email: 'a@b.c', token: 't', username: 'a', bio: null, image: null } });
    expect(await result).toBe(true);
    expect(service.current()?.username).toBe('a');
  });

  it('clears an invalid token', async () => {
    jwt.save('bad');
    const result = service.verifyAuth();
    backend.expectOne(`${AppConstants.api}/user`).flush({}, { status: 500, statusText: 'err' });
    expect(await result).toBe(false);
    expect(jwt.get()).toBeNull();
  });
});
