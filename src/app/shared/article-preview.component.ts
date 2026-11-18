import { Component, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMetaComponent } from './article-meta.component';
import { FavoriteButtonComponent } from './favorite-button.component';

@Component({
  selector: 'app-article-preview',
  imports: [RouterLink, ArticleMetaComponent, FavoriteButtonComponent],
  template: `
    <div class="article-preview">
      <app-article-meta [article]="article()">
        <app-favorite-button class="pull-xs-right" [(article)]="article">
          {{ article().favoritesCount }}
        </app-favorite-button>
      </app-article-meta>

      <a [routerLink]="['/article', article().slug]" class="preview-link">
        <h1>{{ article().title }}</h1>
        <p>{{ article().description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of article().tagList; track tag) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreviewComponent {
  readonly article = model.required<Article>();
}
