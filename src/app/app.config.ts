import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { routes } from './app.routes';
import { installDebugInterface } from './core/debug';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { JwtService } from './core/services/jwt.service';
import { UserService } from './core/services/user.service';
import { ConduitTitleStrategy } from './core/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useExisting: ConduitTitleStrategy },
    provideAppInitializer(() => {
      const user = inject(UserService);
      installDebugInterface(inject(JwtService), user);
      return user.populate();
    }),
  ],
};
