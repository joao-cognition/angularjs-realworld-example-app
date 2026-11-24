import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticlesService } from '../../core/articles.service';
import { Article, Profile } from '../../core/models';
import { UserService } from '../../core/user.service';
import { ArticleMetaComponent } from '../../shared/article-meta.component';
import { FavoriteBtnComponent } from '../../shared/favorite-btn.component';
import { FollowBtnComponent } from '../../shared/follow-btn.component';

@Component({
  selector: 'app-article-actions',
  imports: [RouterLink, ArticleMetaComponent, FavoriteBtnComponent, FollowBtnComponent],
  template: `
    <app-article-meta [article]="article()">
      @if (canModify()) {
        <span>
          <a class="btn btn-sm btn-outline-secondary" [routerLink]="['/editor', article().slug]">
            <i class="ion-edit"></i> Edit Article
          </a>
          <button
            class="btn btn-sm btn-outline-danger"
            type="button"
            [class.disabled]="deleting()"
            (click)="deleteArticle()"
          >
            <i class="ion-trash-a"></i> Delete Article
          </button>
        </span>
      } @else {
        <span>
          <app-follow-btn [user]="article().author" (toggled)="authorChange.emit($event)" />
          <app-favorite-btn [article]="article()" (toggled)="articleChange.emit($event)">
            {{ article().favorited ? 'Unfavorite' : 'Favorite' }} Article
            <span class="counter">({{ article().favoritesCount }})</span>
          </app-favorite-btn>
        </span>
      }
    </app-article-meta>
  `,
})
export class ArticleActionsComponent {
  readonly article = input.required<Article>();
  readonly articleChange = output<Article>();
  readonly authorChange = output<Profile>();

  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  protected readonly deleting = signal(false);
  protected readonly canModify = computed(
    () => this.user.current()?.username === this.article().author.username,
  );

  deleteArticle(): void {
    if (this.deleting()) return;
    this.deleting.set(true);
    const home = () => void this.router.navigateByUrl('/');
    this.articles.destroy(this.article().slug).subscribe({ next: home, error: home });
  }
}
