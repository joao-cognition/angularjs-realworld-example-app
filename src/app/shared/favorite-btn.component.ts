import { Component, inject, input, output, signal } from '@angular/core';
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
  readonly article = input.required<Article>();
  readonly toggled = output<Article>();

  private readonly user = inject(UserService);
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);
  protected readonly isSubmitting = signal(false);

  submit(): void {
    if (!this.user.current()) {
      void this.router.navigate(['/register']);
      return;
    }
    const article = this.article();
    this.isSubmitting.set(true);
    const request = article.favorited
      ? this.articles.unfavorite(article.slug)
      : this.articles.favorite(article.slug);
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toggled.emit({
          ...article,
          favorited: !article.favorited,
          favoritesCount: article.favoritesCount + (article.favorited ? -1 : 1),
        });
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
