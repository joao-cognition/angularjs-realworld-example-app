import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { Article } from '../core/models';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-favorite-btn',
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
export class FavoriteBtnComponent {
  readonly article = model.required<Article>();
  readonly isSubmitting = signal(false);

  private readonly user = inject(UserService);
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  submit(): void {
    this.isSubmitting.set(true);

    if (!this.user.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }

    const { slug, favorited } = this.article();
    const request = favorited ? this.articles.unfavorite(slug) : this.articles.favorite(slug);
    request.subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.article.update((article) => ({
          ...article,
          favorited: updated.favorited,
          favoritesCount: updated.favoritesCount,
        }));
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
