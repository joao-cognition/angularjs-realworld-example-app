import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from '../core/models';
import { UserService } from '../core/user.service';
import { ListErrors } from '../shared/list-errors';

@Component({
  selector: 'app-settings',
  imports: [ListErrors],
  template: `
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <list-errors [errors]="errors()" />

            <form (submit)="submitForm($event)">
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    [value]="form.image()"
                    (input)="form.image.set(val($event))"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                    [value]="form.username()"
                    (input)="form.username.set(val($event))"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    [value]="form.bio()"
                    (input)="form.bio.set(val($event))"
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    [value]="form.email()"
                    (input)="form.email.set(val($event))"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                    [value]="form.password()"
                    (input)="form.password.set(val($event))"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
                  Update Settings
                </button>
              </fieldset>
            </form>

            <hr />

            <button class="btn btn-outline-danger" (click)="logout()">
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  private readonly user = inject(UserService);
  private readonly router = inject(Router);
  private readonly current = this.user.current()!;

  protected readonly form = {
    image: signal(this.current.image ?? ''),
    username: signal(this.current.username),
    bio: signal(this.current.bio ?? ''),
    email: signal(this.current.email),
    password: signal(''),
  };
  protected readonly errors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);

  protected val(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);
    const f = this.form;
    const fields = {
      image: f.image(),
      username: f.username(),
      bio: f.bio(),
      email: f.email(),
      ...(f.password() ? { password: f.password() } : {}),
    };
    this.user.update(fields).subscribe({
      next: (u) => this.router.navigateByUrl(`/@${u.username}`),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? null);
      },
    });
  }

  protected logout() {
    this.user.logout();
    this.router.navigateByUrl('/');
  }
}
