import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Errors } from '../../core/models';
import { UserService, UserUpdate } from '../../core/services/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { toErrors } from '../auth/auth.component';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, ListErrorsComponent],
  template: `
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">
            <h1 class="text-xs-center">Your Settings</h1>

            <app-list-errors [errors]="errors()" />

            <form (ngSubmit)="submit()">
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    name="image"
                    placeholder="URL of profile picture"
                    [(ngModel)]="form.image"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    name="username"
                    placeholder="Username"
                    [(ngModel)]="form.username"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    name="bio"
                    placeholder="Short bio about you"
                    [(ngModel)]="form.bio"
                  ></textarea>
                </fieldset>
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
                    placeholder="New Password"
                    [(ngModel)]="form.password"
                  />
                </fieldset>
                <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
                  Update Settings
                </button>
              </fieldset>
            </form>

            <hr />

            <button class="btn btn-outline-danger" (click)="user.logout()">
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  protected readonly user = inject(UserService);
  private readonly router = inject(Router);

  protected readonly errors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);
  protected form: UserUpdate = (() => {
    const { email, username, bio, image } = this.user.currentUser() ?? {};
    return { email, username, bio, image, password: '' };
  })();

  submit(): void {
    this.isSubmitting.set(true);
    this.user.update(this.form).subscribe({
      next: (user) => void this.router.navigate(['/profile', user.username]),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }
}
