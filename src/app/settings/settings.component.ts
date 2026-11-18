import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { extractErrors } from '../core/errors';
import { Errors } from '../core/models';
import { UserService, UserUpdate } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-settings',
  imports: [ListErrorsComponent, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    image: new FormControl(this.user.current()?.image ?? '', { nonNullable: true }),
    username: new FormControl(this.user.current()?.username ?? '', { nonNullable: true }),
    bio: new FormControl(this.user.current()?.bio ?? '', { nonNullable: true }),
    email: new FormControl(this.user.current()?.email ?? '', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  submitForm(): void {
    this.isSubmitting.set(true);
    const { password, ...fields } = this.form.getRawValue();
    const update: UserUpdate = password ? { ...fields, password } : fields;

    this.user.update(update).subscribe({
      next: (user) => void this.router.navigate(['/@' + user.username]),
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.errors.set(extractErrors(err));
      },
    });
  }

  logout(): void {
    this.user.logout();
    void this.router.navigateByUrl('/');
  }
}
