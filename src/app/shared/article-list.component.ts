import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Article, ArticleListConfig } from '../core/models';
import { ArticlesService } from '../core/services/articles.service';
import { ArticlePreviewComponent } from './article-preview.component';
import { PaginationComponent } from './pagination.component';

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, PaginationComponent],
  template: `
    @for (article of articles(); track article.slug; let i = $index) {
      <app-article-preview [article]="article" (articleChange)="replace(i, $event)" />
    }

    @if (loading()) {
      <div class="article-preview">Loading articles...</div>
    } @else if (!articles().length) {
      <div class="article-preview empty-feed-message">No articles are here... yet.</div>
    }

    @if (totalPages() > 1) {
      <app-pagination [totalPages]="totalPages()" [currentPage]="page()" />
    }
  `,
})
export class ArticleListComponent {
  private readonly articlesService = inject(ArticlesService);

  readonly config = input.required<ArticleListConfig>();
  readonly limit = input(10);
  readonly page = input(1);

  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly totalPages = signal(0);

  private readonly query = computed(() => ({
    config: this.config(),
    limit: this.limit(),
    page: this.page(),
  }));

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.articles.set([]);
        }),
        switchMap(({ config, limit, page }) =>
          this.articlesService
            .query(config, limit, limit * (page - 1))
            .pipe(catchError(() => of({ articles: [], articlesCount: 0 }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ articles, articlesCount }) => {
        this.articles.set(articles);
        this.totalPages.set(Math.ceil(articlesCount / this.limit()));
        this.loading.set(false);
      });
  }

  protected replace(index: number, article: Article): void {
    this.articles.update((list) => list.map((a, i) => (i === index ? article : a)));
  }
}
