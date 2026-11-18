import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { AuthState, User } from '../models';
import { ApiService } from './api.service';
import { JwtService } from './jwt.service';

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
  private readonly api = inject(ApiService);
  private readonly jwt = inject(JwtService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly authState = signal<AuthState>('loading');
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /** Restore the session from the stored JWT; runs once before the first navigation. */
  async populate(): Promise<void> {
    if (!this.jwt.get()) {
      this.purgeAuth();
      return;
    }
    this.authState.set('loading');
    try {
      const user = await firstValueFrom(
        this.api.get<{ user: User }>('/user').pipe(map((r) => r.user)),
      );
      this.setAuth(user);
    } catch (err) {
      if (err instanceof HttpErrorResponse && (err.status === 0 || err.status >= 500)) {
        this.authState.set('unavailable');
      } else {
        this.purgeAuth();
      }
    }
  }

  attemptAuth(type: 'login' | 'register', credentials: Credentials): Observable<User> {
    const path = type === 'login' ? '/users/login' : '/users';
    return this.api.post<{ user: User }>(path, { user: credentials }).pipe(
      map((r) => r.user),
      tap((user) => this.setAuth(user)),
    );
  }

  update(fields: UserUpdate): Observable<User> {
    const user: UserUpdate = { ...fields };
    if (!user.password) delete user.password;
    return this.api.put<{ user: User }>('/user', { user }).pipe(
      map((r) => r.user),
      tap((updated) => this.setAuth(updated)),
    );
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigateByUrl('/');
  }

  setAuth(user: User): void {
    if (user.token) this.jwt.save(user.token);
    this.currentUser.set(user);
    this.authState.set('authenticated');
  }

  purgeAuth(): void {
    this.jwt.destroy();
    this.currentUser.set(null);
    this.authState.set('unauthenticated');
  }
}
