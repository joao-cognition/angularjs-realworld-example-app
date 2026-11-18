import { Component, computed, inject, model, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { Article, Profile } from '../core/models';
import { UserService } from '../core/user.service';
import { ArticleMeta } from '../shared/article-meta';
import { FavoriteBtn } from '../shared/favorite-btn';
import { FollowBtn } from '../shared/follow-btn';

@Component({
  selector: 'article-actions',
  imports: [RouterLink, ArticleMeta, FavoriteBtn, FollowBtn],
  template: `
    <article-meta [article]="article()">
      @if (canModify()) {
        <span>
          <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/editor', article().slug]">
            <i class="ion-edit"></i> Edit Article
          </a>

          <button
            class="btn btn-sm btn-outline-danger"
            [class.disabled]="isDeleting()"
            (click)="deleteArticle()"
          >
            <i class="ion-trash-a"></i> Delete Article
          </button>
        </span>
      } @else {
        <span>
          <follow-btn [user]="article().author" (userChange)="setAuthor($event)" />
          <favorite-btn [(article)]="article">
            {{ article().favorited ? 'Unfavorite' : 'Favorite' }} Article
            <span class="counter">({{ article().favoritesCount }})</span>
          </favorite-btn>
        </span>
      }
    </article-meta>
  `,
})
export class ArticleActions {
  readonly article = model.required<Article>();
  protected readonly isDeleting = signal(false);
  private readonly user = inject(UserService);
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);
  protected readonly canModify = computed(
    () => this.user.current()?.username === this.article().author.username,
  );

  protected setAuthor(author: Profile) {
    this.article.update((a) => ({ ...a, author }));
  }

  protected deleteArticle() {
    this.isDeleting.set(true);
    const home = () => this.router.navigateByUrl('/');
    this.articles.destroy(this.article().slug).subscribe({ next: home, error: home });
  }
}
