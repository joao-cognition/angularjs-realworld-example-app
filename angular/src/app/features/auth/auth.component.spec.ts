import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AppConstants } from '../../core/app-constants';
import { AuthComponent, toErrors } from './auth.component';

const user = { email: 'a@b.c', token: 'tok', username: 'alice', bio: null, image: null };

describe('AuthComponent', () => {
  let http: HttpTestingController;
  let router: Router;

  function create(authType: 'login' | 'register') {
    const fixture = TestBed.createComponent(AuthComponent);
    fixture.componentRef.setInput('authType', authType);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  it('renders the sign in form without the username field', () => {
    const el: HTMLElement = create('login').nativeElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Sign in');
    expect(el.querySelector('button[type=submit]')?.textContent?.trim()).toBe('Sign in');
    expect(el.querySelector('a')?.textContent?.trim()).toBe('Need an account?');
    expect(el.querySelector('input[placeholder=Username]')).toBeNull();
  });

  it('renders the sign up form with the username field', () => {
    const el: HTMLElement = create('register').nativeElement;
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Sign up');
    expect(el.querySelector('a')?.textContent?.trim()).toBe('Have an account?');
    expect(el.querySelector('input[placeholder=Username]')).not.toBeNull();
  });

  it('signs in without sending a username and goes home', () => {
    const fixture = create('login');
    const cmp = fixture.componentInstance;
    cmp.username.set('ignored');
    cmp.email.set(user.email);
    cmp.password.set('pw');
    cmp.submitForm();
    expect(cmp.isSubmitting()).toBe(true);
    const req = http.expectOne(`${AppConstants.api}/users/login`);
    expect(req.request.body).toEqual({ user: { email: user.email, password: 'pw' } });
    req.flush({ user });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('signs up with the username', () => {
    const cmp = create('register').componentInstance;
    cmp.username.set('alice');
    cmp.email.set(user.email);
    cmp.password.set('pw');
    cmp.submitForm();
    const req = http.expectOne(`${AppConstants.api}/users`);
    expect(req.request.body).toEqual({ user: { username: 'alice', email: user.email, password: 'pw' } });
    req.flush({ user });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows server errors and re-enables the form', () => {
    const fixture = create('register');
    const cmp = fixture.componentInstance;
    cmp.submitForm();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(true);
    http
      .expectOne(`${AppConstants.api}/users`)
      .flush({ errors: { username: ["can't be blank"], email: ["can't be blank"] } }, { status: 422, statusText: 'Unprocessable' });
    fixture.detectChanges();
    expect(cmp.isSubmitting()).toBe(false);
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBe(false);
    const items = [...fixture.nativeElement.querySelectorAll('.error-messages li')].map((li: Element) => li.textContent?.trim());
    expect(items).toEqual(["username can't be blank", "email can't be blank"]);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

describe('toErrors', () => {
  it('returns the API error map', () => {
    const err = new HttpErrorResponse({ status: 401, error: { errors: { credentials: ['invalid'] } } });
    expect(toErrors(err)).toEqual({ credentials: ['invalid'] });
  });

  it('falls back to a generic error when the body has no error map', () => {
    expect(toErrors(new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }))).toEqual({
      error: ['could not reach the server'],
    });
    expect(toErrors(new Error('boom'))).toEqual({ error: ['could not reach the server'] });
  });
});
