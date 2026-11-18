import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Errors } from '../../core/models';
import { Credentials, UserService } from '../../core/services/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

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

            <form (ngSubmit)="submit()">
              <fieldset [disabled]="isSubmitting()">
                @if (authType() === 'register') {
                  <fieldset class="form-group">
                    <input
                      class="form-control form-control-lg"
                      type="text"
                      name="username"
                      placeholder="Username"
                      [(ngModel)]="form.username"
                    />
                  </fieldset>
                }
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="email"
                    name="email"
                    placeholder="Email"
                    [(ngModel)]="form.email"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    name="password"
                    placeholder="Password"
                    [(ngModel)]="form.password"
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
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly authType = input<'login' | 'register'>('login');
  protected readonly title = computed(() => (this.authType() === 'login' ? 'Sign in' : 'Sign up'));
  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Errors | null>(null);
  protected form: Credentials = { username: '', email: '', password: '' };

  submit(): void {
    this.isSubmitting.set(true);
    this.errors.set(null);
    const credentials: Credentials =
      this.authType() === 'login'
        ? { email: this.form.email, password: this.form.password }
        : { ...this.form };
    this.user.attemptAuth(this.authType(), credentials).subscribe({
      next: () => void this.router.navigate(['/'], { queryParams: { feed: 'following' } }),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }
}

export function toErrors(err: HttpErrorResponse): Errors {
  return err.error?.errors ?? { error: [err.message || 'Something went wrong'] };
}
