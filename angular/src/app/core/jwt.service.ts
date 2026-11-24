import { Injectable } from '@angular/core';
import { AppConstants } from './app.constants';

@Injectable({ providedIn: 'root' })
export class JwtService {
  get(): string | null {
    return localStorage.getItem(AppConstants.jwtKey);
  }

  save(token: string): void {
    localStorage.setItem(AppConstants.jwtKey, token);
  }

  destroy(): void {
    localStorage.removeItem(AppConstants.jwtKey);
  }
}
