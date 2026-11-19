import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { AppConstants } from './app.constants';
import { JwtService } from './jwt.service';
import { AuthType, Credentials, User, UserUpdate } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);

  private readonly currentUser = signal<User | null>(null);
  readonly current = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  attemptAuth(type: AuthType, credentials: Credentials): Observable<User> {
    const route = type === 'login' ? '/login' : '';
    return this.http
      .post<{ user: User }>(`${AppConstants.api}/users${route}`, { user: credentials })
      .pipe(
        map((res) => res.user),
        tap((user) => this.setAuth(user)),
      );
  }

  update(fields: UserUpdate): Observable<User> {
    return this.http.put<{ user: User }>(`${AppConstants.api}/user`, { user: fields }).pipe(
      map((res) => res.user),
      tap((user) => this.currentUser.set(user)),
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.jwt.destroy();
  }

  async verifyAuth(): Promise<boolean> {
    if (!this.jwt.get()) {
      return false;
    }
    if (this.currentUser()) {
      return true;
    }
    try {
      const res = await firstValueFrom(this.http.get<{ user: User }>(`${AppConstants.api}/user`));
      this.currentUser.set(res.user);
      return true;
    } catch {
      this.jwt.destroy();
      return false;
    }
  }

  private setAuth(user: User): void {
    this.jwt.save(user.token);
    this.currentUser.set(user);
  }
}
