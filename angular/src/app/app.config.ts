import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { TitleStrategy, provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { ConduitTitleStrategy } from './core/title.strategy';
import { UserService } from './core/user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: TitleStrategy, useClass: ConduitTitleStrategy },
    // Legacy abstract 'app' state resolved User.verifyAuth() before any page rendered.
    provideAppInitializer(() => firstValueFrom(inject(UserService).verifyAuth())),
  ],
};
