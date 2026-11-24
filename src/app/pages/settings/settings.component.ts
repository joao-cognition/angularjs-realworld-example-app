import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toErrors } from '../../core/errors';
import { Errors } from '../../core/models';
import { UserService, UserUpdate } from '../../core/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  template: `
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <app-list-errors [errors]="errors()" />

            <form [formGroup]="form" (ngSubmit)="submitForm()">
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    formControlName="image"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                    formControlName="username"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    formControlName="bio"
                  ></textarea>
                </fieldset>
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
                    placeholder="New Password"
                    formControlName="password"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
                  Update Settings
                </button>
              </fieldset>
            </form>

            <!-- Line break for logout button -->
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
export class SettingsComponent {
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Errors | null>(null);
  protected readonly form = new FormGroup({
    image: new FormControl(this.user.current()?.image ?? '', { nonNullable: true }),
    username: new FormControl(this.user.current()?.username ?? '', { nonNullable: true }),
    bio: new FormControl(this.user.current()?.bio ?? '', { nonNullable: true }),
    email: new FormControl(this.user.current()?.email ?? '', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  protected submitForm(): void {
    this.isSubmitting.set(true);
    const { password, ...fields } = this.form.getRawValue();
    const update: UserUpdate = password ? { ...fields, password } : fields;
    this.user.update(update).subscribe({
      next: (user) => void this.router.navigate(['/@' + user.username]),
      error: (err) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }

  protected logout(): void {
    this.user.logout();
  }
}
