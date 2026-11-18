import { Component, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { ArticleMetaComponent } from './article-meta.component';
import { FavoriteBtnComponent } from './favorite-btn.component';

@Component({
  selector: 'app-article-preview',
  imports: [RouterLink, ArticleMetaComponent, FavoriteBtnComponent],
  template: `
    @let a = current();
    <div class="article-preview">
      <app-article-meta [article]="a">
        <app-favorite-btn class="pull-xs-right" [article]="a" (toggled)="current.set($event)">
          {{ a.favoritesCount }}
        </app-favorite-btn>
      </app-article-meta>

      <a [routerLink]="['/article', a.slug]" class="preview-link">
        <h1>{{ a.title }}</h1>
        <p>{{ a.description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of a.tagList; track tag) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreviewComponent {
  readonly article = input.required<Article>();
  protected readonly current = linkedSignal(() => this.article());
}
