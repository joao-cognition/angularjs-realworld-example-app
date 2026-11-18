import { Component, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { extractErrors } from '../core/errors';
import { Errors } from '../core/models';
import { AuthType, Credentials, UserService } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-auth',
  imports: [ListErrorsComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  /** Bound from route data. */
  readonly authType = input.required<AuthType>();
  readonly title = computed(() => (this.authType() === 'login' ? 'Sign in' : 'Sign up'));

  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  submitForm(): void {
    this.isSubmitting.set(true);
    const { username, email, password } = this.form.getRawValue();
    const credentials: Credentials =
      this.authType() === 'login' ? { email, password } : { username, email, password };

    this.user.attemptAuth(this.authType(), credentials).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errors.set(extractErrors(err));
      },
    });
  }
}
