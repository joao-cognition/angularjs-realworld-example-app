import { Injectable, inject } from '@angular/core';
import { APP_CONSTANTS } from './app.constants';

@Injectable({ providedIn: 'root' })
export class JwtService {
  private readonly key = inject(APP_CONSTANTS).jwtKey;

  save(token: string): void {
    window.localStorage.setItem(this.key, token);
  }

  get(): string | null {
    return window.localStorage.getItem(this.key);
  }

  destroy(): void {
    window.localStorage.removeItem(this.key);
  }
}
