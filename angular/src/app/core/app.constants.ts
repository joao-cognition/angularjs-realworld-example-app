import { environment } from '../../environments/environment';

export const AppConstants = {
  api: environment.api,
  jwtKey: 'jwtToken',
  appName: 'Conduit',
} as const;
