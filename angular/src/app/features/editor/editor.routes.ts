import { Routes } from '@angular/router';
import { requireAuth } from '../../core/auth.guards';
import { EditorComponent } from './editor.component';
import { editorArticleResolver } from './editor.resolver';

const editor = {
  component: EditorComponent,
  title: 'Editor',
  canActivate: [requireAuth],
  resolve: { article: editorArticleResolver },
  runGuardsAndResolvers: 'always' as const,
};

export const EDITOR_ROUTES: Routes = [
  { path: 'editor', ...editor },
  { path: 'editor/:slug', ...editor },
];
