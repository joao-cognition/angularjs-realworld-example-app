import { Injectable } from '@angular/core';

const JWT_KEY = 'jwtToken';

@Injectable({ providedIn: 'root' })
export class JwtService {
  get(): string | null {
    return window.localStorage.getItem(JWT_KEY);
  }

  save(token: string): void {
    window.localStorage.setItem(JWT_KEY, token);
  }

  destroy(): void {
    window.localStorage.removeItem(JWT_KEY);
  }
}
