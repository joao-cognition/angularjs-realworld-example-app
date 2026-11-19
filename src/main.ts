import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { redirectLegacyHashUrl } from './app/core/legacy-hash-url';

redirectLegacyHashUrl();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
