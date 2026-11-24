import { InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppConstants {
  api: string;
  jwtKey: string;
  appName: string;
}

export const APP_CONSTANTS = new InjectionToken<AppConstants>('APP_CONSTANTS', {
  providedIn: 'root',
  factory: () => ({
    api: environment.apiUrl,
    jwtKey: 'jwtToken',
    appName: 'Conduit',
  }),
});
