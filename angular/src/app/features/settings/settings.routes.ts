import { Routes } from '@angular/router';
import { requireAuth } from '../../core/auth.guards';
import { SettingsComponent } from './settings.component';

export const SETTINGS_ROUTES: Routes = [
  { path: 'settings', component: SettingsComponent, title: 'Settings', canActivate: [requireAuth], runGuardsAndResolvers: 'always' },
];
