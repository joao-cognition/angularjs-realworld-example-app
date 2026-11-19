import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toErrors } from '../core/errors';
import { Errors, UserUpdate } from '../core/models';
import { UserService } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  readonly form = inject(NonNullableFormBuilder).group({
    image: [this.user.current()?.image ?? ''],
    username: [this.user.current()?.username ?? ''],
    bio: [this.user.current()?.bio ?? ''],
    email: [this.user.current()?.email ?? ''],
    password: [''],
  });

  submitForm(): void {
    this.isSubmitting.set(true);
    this.form.disable();
    const { password, ...fields } = this.form.getRawValue();
    const update: UserUpdate = password ? { ...fields, password } : fields;

    this.user.update(update).subscribe({
      next: (user) => void this.router.navigate(['/@' + user.username]),
      error: (err) => {
        this.errors.set(toErrors(err));
        this.isSubmitting.set(false);
        this.form.enable();
      },
    });
  }

  logout(): void {
    this.user.logout();
    void this.router.navigateByUrl('/');
  }
}
