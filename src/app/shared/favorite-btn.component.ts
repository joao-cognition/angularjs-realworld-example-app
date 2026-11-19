import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { Article } from '../core/models';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-favorite-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  submit(): void {
    if (!this.user.isAuthenticated()) {
      void this.router.navigateByUrl('/register');
      return;
    }
    const { slug, favorited } = this.article();
    this.isSubmitting.set(true);
    (favorited ? this.articles.unfavorite(slug) : this.articles.favorite(slug)).subscribe({
      next: () => {
        this.article.update((a) => ({
          ...a,
          favorited: !favorited,
          favoritesCount: a.favoritesCount + (favorited ? -1 : 1),
        }));
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
