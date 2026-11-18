import { Routes } from '@angular/router';
import { requireAuth } from '../../core/auth.guards';
import { EditorComponent } from './editor.component';

export const EDITOR_ROUTES: Routes = [
  { path: 'editor', component: EditorComponent, title: 'Editor', canActivate: [requireAuth], runGuardsAndResolvers: 'always' },
  { path: 'editor/:slug', component: EditorComponent, title: 'Editor', canActivate: [requireAuth], runGuardsAndResolvers: 'always' },
];
