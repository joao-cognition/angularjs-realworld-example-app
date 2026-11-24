import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';
import { User } from './models';

export type AuthType = 'login' | 'register';

export interface UserFields {
  email?: string;
  username?: string;
  password?: string;
  bio?: string | null;
  image?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);
  private readonly router = inject(Router);

  readonly current = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.current() !== null);

  attemptAuth(type: AuthType, credentials: UserFields): Observable<User> {
    const route = type === 'login' ? '/login' : '';
    return this.http
      .post<{ user: User }>(`${AppConstants.api}/users${route}`, { user: credentials })
      .pipe(
        map((res) => res.user),
        tap((user) => {
          this.jwt.save(user.token);
          this.current.set(user);
        }),
      );
  }

  update(fields: UserFields): Observable<User> {
    return this.http.put<{ user: User }>(`${AppConstants.api}/user`, { user: fields }).pipe(
      map((res) => res.user),
      tap((user) => this.current.set(user)),
    );
  }

  logout(): void {
    this.current.set(null);
    this.jwt.destroy();
    void this.router.navigateByUrl('/');
  }

  /** Resolves `true` when a stored JWT maps to a valid user; clears a stale token otherwise. */
  verifyAuth(): Observable<boolean> {
    if (!this.jwt.get()) {
      return of(false);
    }
    if (this.current()) {
      return of(true);
    }
    return this.http.get<{ user: User }>(`${AppConstants.api}/user`).pipe(
      map((res) => {
        this.current.set(res.user);
        return true;
      }),
      catchError(() => {
        this.jwt.destroy();
        return of(false);
      }),
    );
  }
}
