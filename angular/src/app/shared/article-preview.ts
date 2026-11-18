import { Component, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMeta } from './article-meta';
import { FavoriteBtn } from './favorite-btn';

@Component({
  selector: 'article-preview',
  imports: [RouterLink, ArticleMeta, FavoriteBtn],
  template: `
    <div class="article-preview">
      <article-meta [article]="article()">
        <favorite-btn [(article)]="article" class="pull-xs-right">
          {{ article().favoritesCount }}
        </favorite-btn>
      </article-meta>

      <a [routerLink]="['/article', article().slug]" class="preview-link">
        <h1>{{ article().title }}</h1>
        <p>{{ article().description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of article().tagList; track $index) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreview {
  readonly article = model.required<Article>();
}
