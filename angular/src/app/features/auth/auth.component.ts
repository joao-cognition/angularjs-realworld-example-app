import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Errors } from '../../core/models';
import { Credentials, UserService } from '../../core/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

export type AuthType = 'login' | 'register';

/** Legacy AuthCtrl + auth.html: one form for /login and /register, picked by route data `authType`. */
@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink, ListErrorsComponent],
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

            <app-list-errors [errors]="errors()" />

            <form (ngSubmit)="submitForm()">
              <fieldset [disabled]="isSubmitting()">
                @if (authType() === 'register') {
                  <fieldset class="form-group">
                    <input class="form-control form-control-lg" type="text" placeholder="Username" name="username" [(ngModel)]="username" />
                  </fieldset>
                }

                <fieldset class="form-group">
                  <input class="form-control form-control-lg" type="email" placeholder="Email" name="email" [(ngModel)]="email" />
                </fieldset>

                <fieldset class="form-group">
                  <input class="form-control form-control-lg" type="password" placeholder="Password" name="password" [(ngModel)]="password" />
                </fieldset>

                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">{{ title() }}</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  /** Bound from route data via withComponentInputBinding. */
  readonly authType = input<AuthType>('login');
  readonly title = computed(() => (this.authType() === 'register' ? 'Sign up' : 'Sign in'));

  readonly username = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  submitForm(): void {
    this.isSubmitting.set(true);
    const credentials: Credentials = { email: this.email(), password: this.password() };
    if (this.authType() === 'register') credentials.username = this.username();

    this.userService.attemptAuth(this.authType(), credentials).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }
}

/** RealWorld APIs answer `{ errors: { field: [msg] } }`; anything else (network down) gets a generic entry. */
export function toErrors(err: unknown): Errors {
  const body = err instanceof HttpErrorResponse ? err.error : null;
  if (body && typeof body === 'object' && body.errors && typeof body.errors === 'object') return body.errors as Errors;
  return { error: ['could not reach the server'] };
}
