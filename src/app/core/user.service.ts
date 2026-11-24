import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';
import { JwtService } from './jwt.service';
import { User } from './models';

export type AuthType = 'login' | 'register';

export interface Credentials {
  username?: string;
  email: string;
  password: string;
}

export type UserUpdate = Partial<Pick<User, 'email' | 'username' | 'bio' | 'image'>> & {
  password?: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);
  private readonly router = inject(Router);
  private readonly api = inject(APP_CONSTANTS).api;

  private readonly currentUser = signal<User | null>(null);
  private pendingVerify: Observable<boolean> | null = null;

  readonly current = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  attemptAuth(type: AuthType, credentials: Credentials): Observable<User> {
    const route = type === 'login' ? '/login' : '';
    return this.http.post<{ user: User }>(`${this.api}/users${route}`, { user: credentials }).pipe(
      map((res) => res.user),
      tap((user) => {
        this.jwt.save(user.token);
        this.currentUser.set(user);
      }),
    );
  }

  update(fields: UserUpdate): Observable<User> {
    return this.http.put<{ user: User }>(`${this.api}/user`, { user: fields }).pipe(
      map((res) => res.user),
      tap((user) => this.currentUser.set(user)),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.jwt.destroy();
    // Re-run the current route's guards (e.g. /settings requires auth and redirects home).
    void this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
  }

  /** Resolves `true` when a valid session exists, loading the current user from the JWT if needed. */
  verifyAuth(): Observable<boolean> {
    if (!this.jwt.get()) {
      return of(false);
    }
    if (this.currentUser()) {
      return of(true);
    }
    this.pendingVerify ??= this.http.get<{ user: User }>(`${this.api}/user`).pipe(
      map((res) => {
        this.currentUser.set(res.user);
        return true;
      }),
      catchError(() => {
        this.jwt.destroy();
        return of(false);
      }),
      finalize(() => (this.pendingVerify = null)),
      shareReplay(1),
    );
    return this.pendingVerify;
  }
}
