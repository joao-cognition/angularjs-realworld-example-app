import { Component, computed, inject, model, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Article } from '../../core/models';
import { ArticlesService } from '../../core/services/articles.service';
import { UserService } from '../../core/services/user.service';
import { ArticleMetaComponent } from '../../shared/article-meta.component';
import { FavoriteButtonComponent } from '../../shared/favorite-button.component';
import { FollowButtonComponent } from '../../shared/follow-button.component';

@Component({
  selector: 'app-article-actions',
  imports: [RouterLink, ArticleMetaComponent, FavoriteButtonComponent, FollowButtonComponent],
  template: `
    <app-article-meta [article]="article()">
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
          <app-follow-button [profile]="article().author" (profileChange)="setAuthor($event)" />
          <app-favorite-button [(article)]="article">
            {{ article().favorited ? 'Unfavorite' : 'Favorite' }} Article
            <span class="counter">({{ article().favoritesCount }})</span>
          </app-favorite-button>
        </span>
      }
    </app-article-meta>
  `,
})
export class ArticleActionsComponent {
  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly article = model.required<Article>();
  protected readonly isDeleting = signal(false);
  protected readonly canModify = computed(
    () => this.user.currentUser()?.username === this.article().author.username,
  );

  protected setAuthor(author: Article['author']): void {
    this.article.update((a) => ({ ...a, author }));
  }

  deleteArticle(): void {
    this.isDeleting.set(true);
    this.articles.destroy(this.article().slug).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: () => this.isDeleting.set(false),
    });
  }
}
