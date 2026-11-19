import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toErrors } from '../core/errors';
import { AuthType, Errors } from '../core/models';
import { UserService } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  /** Bound from route data. */
  readonly authType = input.required<AuthType>();
  readonly title = computed(() => (this.authType() === 'login' ? 'Sign in' : 'Sign up'));

  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  private readonly user = inject(UserService);
  private readonly router = inject(Router);
  readonly form = inject(NonNullableFormBuilder).group({
    username: [''],
    email: [''],
    password: [''],
  });

  submitForm(): void {
    this.isSubmitting.set(true);
    this.form.disable();
    const { username, email, password } = this.form.getRawValue();
    const credentials =
      this.authType() === 'register' ? { username, email, password } : { email, password };

    this.user.attemptAuth(this.authType(), credentials).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: (err) => {
        this.errors.set(toErrors(err));
        this.isSubmitting.set(false);
        this.form.enable();
      },
    });
  }
}
