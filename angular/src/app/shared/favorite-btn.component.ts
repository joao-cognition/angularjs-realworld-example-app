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
  private readonly user = inject(UserService);
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  readonly article = input.required<Article>();
  /** Emits the updated article; the parent owns the article and replaces it. */
  readonly toggled = output<Article>();
  protected readonly isSubmitting = signal(false);

  submit(): void {
    this.isSubmitting.set(true);
    if (!this.user.current()) {
      this.router.navigateByUrl('/register');
      return;
    }
    const article = this.article();
    const req = article.favorited ? this.articles.unfavorite(article.slug) : this.articles.favorite(article.slug);
    req.subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.toggled.emit(updated);
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
