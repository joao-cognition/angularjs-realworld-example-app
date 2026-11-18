import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';
import { User } from './models';

export type AuthType = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);
  private readonly _current = signal<User | null>(null);

  readonly current = this._current.asReadonly();

  attemptAuth(
    type: AuthType,
    credentials: Partial<User> & { password?: string },
  ): Observable<User> {
    const route = type === 'login' ? '/login' : '';
    return this.http
      .post<{ user: User }>(`${AppConstants.api}/users${route}`, { user: credentials })
      .pipe(
        map((res) => res.user),
        tap((user) => {
          this.jwt.save(user.token);
          this._current.set(user);
        }),
      );
  }

  update(fields: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<{ user: User }>(`${AppConstants.api}/user`, { user: fields }).pipe(
      map((res) => res.user),
      tap((user) => this._current.set(user)),
    );
  }

  logout(): void {
    this._current.set(null);
    this.jwt.destroy();
  }

  /** Resolves true when a stored JWT belongs to a valid user; clears a stale JWT otherwise. */
  async verifyAuth(): Promise<boolean> {
    if (!this.jwt.get()) return false;
    if (this._current()) return true;
    try {
      const res = await firstValueFrom(this.http.get<{ user: User }>(`${AppConstants.api}/user`));
      this._current.set(res.user);
      return true;
    } catch {
      this.jwt.destroy();
      return false;
    }
  }
}
