import { Routes } from '@angular/router';
import { ArticleComponent } from './article.component';
import { articleResolver } from './article.resolver';

export const ARTICLE_ROUTES: Routes = [
  {
    path: 'article/:slug',
    component: ArticleComponent,
    title: 'Article',
    resolve: { article: articleResolver },
  },
];
