import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Errors, User } from '../../core/models';
import { UserService } from '../../core/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

export type SettingsFields = Pick<User, 'email' | 'username' | 'bio' | 'image'> & { password?: string };

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
                  <input class="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    formControlName="image" />
                </fieldset>

                <fieldset class="form-group">
                  <input class="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                    formControlName="username" />
                </fieldset>

                <fieldset class="form-group">
                  <textarea class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    formControlName="bio">
                  </textarea>
                </fieldset>

                <fieldset class="form-group">
                  <input class="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    formControlName="email" />
                </fieldset>

                <fieldset class="form-group">
                  <input class="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                    formControlName="password" />
                </fieldset>

                <button class="btn btn-lg btn-primary pull-xs-right"
                  type="submit">
                  Update Settings
                </button>

              </fieldset>
            </form>

            <hr />

            <button class="btn btn-outline-danger"
              (click)="logout()">
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

  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  readonly form = new FormGroup({
    image: new FormControl<string | null>(this.user.current()?.image ?? null),
    username: new FormControl(this.user.current()?.username ?? '', { nonNullable: true }),
    bio: new FormControl<string | null>(this.user.current()?.bio ?? null),
    email: new FormControl(this.user.current()?.email ?? '', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });

  submitForm(): void {
    this.isSubmitting.set(true);
    const { password, ...fields } = this.form.getRawValue();
    const payload: SettingsFields = password ? { ...fields, password } : fields;
    this.user.update(payload).subscribe({
      next: (user) => this.router.navigate(['/@' + user.username]),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? null);
      },
    });
  }

  logout(): void {
    this.user.logout();
  }
}
