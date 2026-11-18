import { Injectable } from '@angular/core';
import { AppConstants } from './app.constants';

@Injectable({ providedIn: 'root' })
export class JwtService {
  save(token: string): void {
    localStorage.setItem(AppConstants.jwtKey, token);
  }

  get(): string | null {
    return localStorage.getItem(AppConstants.jwtKey);
  }

  destroy(): void {
    localStorage.removeItem(AppConstants.jwtKey);
  }
}
