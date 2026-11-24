import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toErrors } from '../../core/errors';
import { Errors } from '../../core/models';
import { UserFields, UserService } from '../../core/user.service';
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
              <fieldset [disabled]="submitting()">
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

            <hr />

            <button class="btn btn-outline-danger" type="button" (click)="logout()">
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

  protected readonly errors = signal<Errors | null>(null);
  protected readonly submitting = signal(false);

  private readonly me = this.user.current();
  protected readonly form = new FormGroup({
    image: new FormControl(this.me?.image ?? '', { nonNullable: true }),
    username: new FormControl(this.me?.username ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    bio: new FormControl(this.me?.bio ?? '', { nonNullable: true }),
    email: new FormControl(this.me?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true }),
  });

  submitForm(): void {
    const { password, ...rest } = this.form.getRawValue();
    const invalid: Errors = {};
    if (!rest.username.trim()) invalid['username'] = ["can't be blank"];
    if (!rest.email.trim()) invalid['email'] = ["can't be blank"];
    else if (this.form.controls.email.hasError('email')) invalid['email'] = ['is invalid'];
    if (Object.keys(invalid).length) {
      this.errors.set(invalid);
      return;
    }

    const fields: UserFields = password ? { ...rest, password } : rest;
    this.submitting.set(true);
    this.errors.set(null);
    this.user.update(fields).subscribe({
      next: (user) => void this.router.navigate(['/@' + user.username]),
      error: (err) => {
        this.submitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }

  logout(): void {
    this.user.logout();
  }
}
