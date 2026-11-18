import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { Article } from '../core/models';
import { UserService } from '../core/user.service';

@Component({
  selector: 'favorite-btn',
  template: `
    <button
      class="btn btn-sm"
      [class.disabled]="isSubmitting()"
      [class.btn-outline-primary]="!article().favorited"
      [class.btn-primary]="article().favorited"
      (click)="submit()"
    >
      <i class="ion-heart"></i> <ng-content />
    </button>
  `,
})
export class FavoriteBtn {
  readonly article = model.required<Article>();
  protected readonly isSubmitting = signal(false);
  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  submit() {
    this.isSubmitting.set(true);
    if (!this.user.current()) {
      this.router.navigateByUrl('/register');
      return;
    }
    const a = this.article();
    const req = a.favorited ? this.articles.unfavorite(a.slug) : this.articles.favorite(a.slug);
    req.subscribe(() => {
      this.isSubmitting.set(false);
      this.article.update((cur) => ({
        ...cur,
        favorited: !a.favorited,
        favoritesCount: cur.favoritesCount + (a.favorited ? -1 : 1),
      }));
    });
  }
}
