import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { DefaultImagePipe } from './default-image.pipe';

@Component({
  selector: 'app-article-meta',
  imports: [RouterLink, DatePipe, DefaultImagePipe],
  template: `
    <div class="article-meta">
      <a [routerLink]="['/profile', article().author.username]">
        <img [src]="article().author.image | defaultImage" />
      </a>
      <div class="info">
        <a class="author" [routerLink]="['/profile', article().author.username]">{{
          article().author.username
        }}</a>
        <span class="date">{{ article().createdAt | date: 'longDate' }}</span>
      </div>
      <ng-content />
    </div>
  `,
})
export class ArticleMetaComponent {
  readonly article = input.required<Article>();
}
