import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AppConstants } from '../../core/app-constants';
import { User } from '../../core/models';
import { UserService } from '../../core/user.service';
import { SettingsComponent } from './settings.component';

const user: User = { email: 'a@b.c', token: 'tok', username: 'alice', bio: 'hi', image: 'http://img/a.png' };

describe('SettingsComponent', () => {
  let http: HttpTestingController;
  let users: UserService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    users = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    users.current.set(user);
  });

  afterEach(() => http.verify());

  function render() {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  const field = (el: HTMLElement, placeholder: string) =>
    el.querySelector<HTMLInputElement>(`[placeholder="${placeholder}"]`)!;

  it('prefills the form from the current user with an empty password', () => {
    const { el } = render();
    expect(el.querySelector('h1')?.textContent).toBe('Your Settings');
    expect(field(el, 'URL of profile picture').value).toBe(user.image);
    expect(field(el, 'Username').value).toBe('alice');
    expect(field(el, 'Short bio about you').value).toBe('hi');
    expect(field(el, 'Email').value).toBe('a@b.c');
    expect(field(el, 'New Password').value).toBe('');
  });

  it('saves without a password and goes to the updated profile', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const { fixture, el } = render();
    fixture.componentInstance.form.patchValue({ bio: 'new bio', username: 'alice2' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(fixture.componentInstance.isSubmitting()).toBe(true);
    const req = http.expectOne(`${AppConstants.api}/user`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      user: { image: user.image, username: 'alice2', bio: 'new bio', email: 'a@b.c' },
    });
    req.flush({ user: { ...user, username: 'alice2', bio: 'new bio' } });
    expect(navigate).toHaveBeenCalledWith(['/@alice2']);
    expect(users.current()?.username).toBe('alice2');
  });

  it('sends the new password when one is typed', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const { fixture } = render();
    fixture.componentInstance.form.patchValue({ password: 'secret' });
    fixture.componentInstance.submitForm();
    const req = http.expectOne(`${AppConstants.api}/user`);
    expect(req.request.body.user.password).toBe('secret');
    req.flush({ user });
  });

  it('shows server errors and re-enables the form', async () => {
    const { fixture, el } = render();
    fixture.componentInstance.submitForm();
    fixture.detectChanges();
    expect(el.querySelector<HTMLFieldSetElement>('form > fieldset')!.disabled).toBe(true);
    http
      .expectOne(`${AppConstants.api}/user`)
      .flush({ errors: { username: ['has already been taken'] } }, { status: 422, statusText: 'Unprocessable' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('.error-messages li')?.textContent).toBe('username has already been taken');
    expect(el.querySelector<HTMLFieldSetElement>('form > fieldset')!.disabled).toBe(false);
  });

  it('logout button clears the session', () => {
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    localStorage.setItem('jwtToken', 'tok');
    const { el } = render();
    const btn = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Or click here to logout.')!;
    btn.click();
    expect(users.current()).toBeNull();
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });
});
