import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMetaComponent } from './article-meta.component';
import { FavoriteBtnComponent } from './favorite-btn.component';

@Component({
  selector: 'app-article-preview',
  imports: [RouterLink, ArticleMetaComponent, FavoriteBtnComponent],
  template: `
    <div class="article-preview">
      <app-article-meta [article]="article()">
        <app-favorite-btn
          class="pull-xs-right"
          [article]="article()"
          (toggled)="articleChange.emit($event)"
        >
          {{ article().favoritesCount }}
        </app-favorite-btn>
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
  readonly article = input.required<Article>();
  readonly articleChange = output<Article>();
}
