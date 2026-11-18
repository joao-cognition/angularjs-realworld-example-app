import { Component, computed, inject, model, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { Article, Profile } from '../core/models';
import { UserService } from '../core/user.service';
import { ArticleMetaComponent } from '../shared/article-meta.component';
import { FavoriteBtnComponent } from '../shared/favorite-btn.component';
import { FollowBtnComponent } from '../shared/follow-btn.component';

@Component({
  selector: 'app-article-actions',
  imports: [ArticleMetaComponent, FavoriteBtnComponent, FollowBtnComponent, RouterLink],
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
          <app-follow-btn [user]="article().author" (userChange)="setAuthor($event)" />
          <app-favorite-btn [(article)]="article">
            {{ article().favorited ? 'Unfavorite' : 'Favorite' }} Article
            <span class="counter">({{ article().favoritesCount }})</span>
          </app-favorite-btn>
        </span>
      }
    </app-article-meta>
  `,
})
export class ArticleActionsComponent {
  readonly article = model.required<Article>();
  readonly isDeleting = signal(false);

  private readonly currentUser = inject(UserService).current;
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  readonly canModify = computed(
    () => this.currentUser()?.username === this.article().author.username,
  );

  setAuthor(author: Profile): void {
    this.article.update((article) => ({ ...article, author }));
  }

  deleteArticle(): void {
    this.isDeleting.set(true);
    const goHome = () => void this.router.navigateByUrl('/');
    this.articles.destroy(this.article().slug).subscribe({ next: goHome, error: goHome });
  }
}
