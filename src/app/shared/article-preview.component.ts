import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMetaComponent } from './article-meta.component';
import { FavoriteBtnComponent } from './favorite-btn.component';

@Component({
  selector: 'app-article-preview',
  imports: [RouterLink, ArticleMetaComponent, FavoriteBtnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="article-preview">
      <app-article-meta [article]="current()">
        <app-favorite-btn [(article)]="current" class="pull-xs-right">
          {{ current().favoritesCount }}
        </app-favorite-btn>
      </app-article-meta>

      <a [routerLink]="['/article', current().slug]" class="preview-link">
        <h1>{{ current().title }}</h1>
        <p>{{ current().description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of current().tagList; track tag) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreviewComponent {
  readonly article = input.required<Article>();
  readonly current = linkedSignal(() => this.article());
}
