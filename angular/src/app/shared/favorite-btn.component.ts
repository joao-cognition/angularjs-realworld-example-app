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
      type="button"
      [class.disabled]="submitting()"
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

  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);

  submit(): void {
    if (!this.user.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }
    if (this.submitting()) return;
    this.submitting.set(true);
    const article = this.article();
    const request = article.favorited
      ? this.articles.unfavorite(article.slug)
      : this.articles.favorite(article.slug);
    request.subscribe({
      next: (updated) => {
        this.submitting.set(false);
        this.toggled.emit({
          ...article,
          favorited: updated.favorited,
          favoritesCount: updated.favoritesCount,
        });
      },
      error: () => this.submitting.set(false),
    });
  }
}
