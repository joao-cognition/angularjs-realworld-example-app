import { Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMetaComponent } from './article-meta.component';
import { FavoriteBtnComponent } from './favorite-btn.component';

@Component({
  selector: 'app-article-preview',
  imports: [ArticleMetaComponent, FavoriteBtnComponent, RouterLink],
  template: `
    <div class="article-preview">
      <app-article-meta [article]="state()">
        <app-favorite-btn [(article)]="state" class="pull-xs-right">
          {{ state().favoritesCount }}
        </app-favorite-btn>
      </app-article-meta>

      <a [routerLink]="['/article', state().slug]" class="preview-link">
        <h1>{{ state().title }}</h1>
        <p>{{ state().description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of state().tagList; track tag) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreviewComponent {
  readonly article = input.required<Article>();
  readonly state = linkedSignal(() => this.article());
}
