import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toErrors } from '../../core/errors';
import { Errors } from '../../core/models';
import { AuthType, UserService } from '../../core/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink, ListErrorsComponent],
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

            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <fieldset [disabled]="isSubmitting()">
                @if (authType() === 'register') {
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      formControlName="username"
                    />
                  </fieldset>
                }
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    formControlName="email"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="Password"
                    formControlName="password"
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
export class AuthComponent {
  /** Bound from route data. */
  readonly authType = input.required<AuthType>();
  protected readonly title = computed(() => (this.authType() === 'login' ? 'Sign in' : 'Sign up'));

  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Errors | null>(null);
  protected readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  protected submitForm(): void {
    this.isSubmitting.set(true);
    const { username, email, password } = this.form.getRawValue();
    const credentials =
      this.authType() === 'register' ? { username, email, password } : { email, password };
    this.user.attemptAuth(this.authType(), credentials).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (err) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }
}
