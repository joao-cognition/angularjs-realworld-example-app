import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { AvatarDirective } from './avatar.directive';

@Component({
  selector: 'app-article-meta',
  imports: [RouterLink, DatePipe, AvatarDirective],
  template: `
    <div class="article-meta">
      <a [routerLink]="['/@' + article().author.username]">
        <img [appAvatar]="article().author.image" />
      </a>
      <div class="info">
        <a class="author" [routerLink]="['/@' + article().author.username]">
          {{ article().author.username }}
        </a>
        <span class="date">{{ article().createdAt | date: 'longDate' }}</span>
      </div>
      <ng-content />
    </div>
  `,
})
export class ArticleMetaComponent {
  readonly article = input.required<Article>();
}
