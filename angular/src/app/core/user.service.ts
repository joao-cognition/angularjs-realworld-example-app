import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { AppConstants } from './app-constants';
import { JwtService } from './jwt.service';
import { User } from './models';

export interface Credentials {
  email: string;
  password: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);
  private readonly router = inject(Router);

  readonly current = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.current() !== null);

  attemptAuth(type: 'login' | 'register', credentials: Credentials): Observable<User> {
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

  update(fields: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<{ user: User }>(`${AppConstants.api}/user`, { user: fields }).pipe(
      map((res) => res.user),
      tap((user) => this.current.set(user)),
    );
  }

  /** Clears the session and re-runs the current route so its guards apply (legacy: $state.go(current, {reload: true})). */
  logout(): void {
    this.purge();
    this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
  }

  purge(): void {
    this.current.set(null);
    this.jwt.destroy();
  }

  verifyAuth(): Observable<boolean> {
    if (!this.jwt.get()) return of(false);
    if (this.current()) return of(true);
    return this.http.get<{ user: User }>(`${AppConstants.api}/user`).pipe(
      map((res) => {
        this.current.set(res.user);
        return true;
      }),
      catchError(() => {
        this.purge();
        return of(false);
      }),
    );
  }
}
