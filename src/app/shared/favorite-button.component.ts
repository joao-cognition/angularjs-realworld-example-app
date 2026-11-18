import { Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '../core/models';
import { ArticlesService } from '../core/services/articles.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-favorite-button',
  template: `
    <button
      class="btn btn-sm"
      [class.disabled]="isSubmitting()"
      [class.btn-outline-primary]="!article().favorited"
      [class.btn-primary]="article().favorited"
      (click)="toggle()"
    >
      <i class="ion-heart"></i> <ng-content />
    </button>
  `,
})
export class FavoriteButtonComponent {
  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly article = model.required<Article>();
  protected readonly isSubmitting = signal(false);

  toggle(): void {
    if (!this.user.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }
    if (this.isSubmitting()) return;
    const { slug, favorited, favoritesCount } = this.article();
    this.isSubmitting.set(true);
    const request = favorited ? this.articles.unfavorite(slug) : this.articles.favorite(slug);
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.article.update((a) => ({
          ...a,
          favorited: !favorited,
          favoritesCount: favoritesCount + (favorited ? -1 : 1),
        }));
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
