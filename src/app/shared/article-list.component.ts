import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ArticlesService } from '../core/articles.service';
import { Article, ArticleListConfig } from '../core/models';
import { ArticlePreviewComponent } from './article-preview.component';
import { ListPaginationComponent } from './list-pagination.component';

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, ListPaginationComponent],
  template: `
    @for (article of list(); track article.slug; let i = $index) {
      <app-article-preview [article]="article" (articleChange)="replace(i, $event)" />
    }

    @if (loading()) {
      <div class="article-preview">Loading articles...</div>
    } @else if (!list().length) {
      <div class="article-preview">No articles are here... yet.</div>
    }

    @if (totalPages() > 1) {
      <app-list-pagination
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        (pageChange)="currentPage.set($event)"
      />
    }
  `,
})
export class ArticleListComponent {
  readonly limit = input.required<number>();
  readonly config = input.required<ArticleListConfig>();

  private readonly articles = inject(ArticlesService);

  /** Back to page 1 whenever a different list (feed / tag / author) is selected. */
  protected readonly currentPage = linkedSignal({ source: this.config, computation: () => 1 });
  protected readonly list = signal<Article[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalPages = signal(0);

  private readonly query = computed(() => ({
    config: this.config(),
    limit: this.limit(),
    page: this.currentPage(),
  }));

  constructor() {
    let previousConfig: ArticleListConfig | undefined;
    toObservable(this.query)
      .pipe(
        tap(({ config }) => {
          this.loading.set(true);
          if (config !== previousConfig) {
            this.list.set([]);
            previousConfig = config;
          }
        }),
        switchMap(({ config, limit, page }) =>
          this.articles
            .query({
              type: config.type,
              filters: { ...config.filters, limit, offset: limit * (page - 1) },
            })
            .pipe(catchError(() => of({ articles: [], articlesCount: 0 }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.loading.set(false);
        this.list.set(res.articles);
        this.totalPages.set(Math.ceil(res.articlesCount / this.limit()));
      });
  }

  protected replace(index: number, article: Article): void {
    this.list.update((list) => list.map((a, i) => (i === index ? article : a)));
  }
}
