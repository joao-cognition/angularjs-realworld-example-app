import { AvatarFallbackDirective } from './avatar-fallback.directive';
import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models';
import { AvatarPipe } from './avatar.pipe';

@Component({
  selector: 'app-article-meta',
  imports: [AvatarFallbackDirective, RouterLink, DatePipe, AvatarPipe],
  template: `
    <div class="article-meta">
      <a [routerLink]="['/@' + article().author.username]">
        <img appAvatar [src]="article().author.image | avatar" alt="" />
      </a>
      <div class="info">
        <a class="author" [routerLink]="['/@' + article().author.username]">{{
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
