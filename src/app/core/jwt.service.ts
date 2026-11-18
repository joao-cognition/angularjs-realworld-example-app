import { Injectable, inject } from '@angular/core';
import { APP_CONFIG } from './app-config';

@Injectable({ providedIn: 'root' })
export class JwtService {
  private readonly key = inject(APP_CONFIG).jwtKey;

  save(token: string): void {
    localStorage.setItem(this.key, token);
  }

  get(): string | null {
    return localStorage.getItem(this.key);
  }

  destroy(): void {
    localStorage.removeItem(this.key);
  }
}
