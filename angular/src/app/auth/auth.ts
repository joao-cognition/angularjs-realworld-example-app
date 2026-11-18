import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Errors } from '../core/models';
import { AuthType, UserService } from '../core/user.service';
import { ListErrors } from '../shared/list-errors';

@Component({
  selector: 'app-auth',
  imports: [RouterLink, ListErrors],
  template: `
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">{{ title() }}</h1>
            <p class="text-xs-center">
              @if (authType() === 'register') {
                <a routerLink="/login">Have an account?</a>
              } @else {
                <a routerLink="/register">Need an account?</a>
              }
            </p>

            <list-errors [errors]="errors()" />

            <form (submit)="submitForm($event)">
              <fieldset [disabled]="isSubmitting()">
                @if (authType() === 'register') {
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      [value]="username()"
                      (input)="username.set($any($event.target).value)"
                    />
                  </fieldset>
                }
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    [value]="email()"
                    (input)="email.set($any($event.target).value)"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    [value]="password()"
                    (input)="password.set($any($event.target).value)"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
                  {{ title() }}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Auth {
  /** Bound from route data. */
  readonly authType = input.required<AuthType>();
  readonly title = input.required<string>();

  protected readonly username = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly errors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  protected submitForm(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);
    const credentials =
      this.authType() === 'register'
        ? { username: this.username(), email: this.email(), password: this.password() }
        : { email: this.email(), password: this.password() };
    this.user.attemptAuth(this.authType(), credentials).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? null);
      },
    });
  }
}
