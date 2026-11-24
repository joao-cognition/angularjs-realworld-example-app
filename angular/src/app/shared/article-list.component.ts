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
    @for (article of articles(); track article.slug) {
      <app-article-preview [article]="article" (articleChange)="replace($event)" />
    }

    @if (loading()) {
      <div class="article-preview">Loading articles...</div>
    } @else if (!articles().length) {
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
  readonly limit = input(10);
  readonly config = input.required<ArticleListConfig>();

  private readonly service = inject(ArticlesService);

  /** Back to page 1 whenever the list (feed / tag / author) changes. */
  readonly currentPage = linkedSignal({ source: this.config, computation: () => 1 });
  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalPages = signal(0);

  private readonly query = computed(() => ({
    config: this.config(),
    page: this.currentPage(),
    limit: this.limit(),
  }));

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.articles.set([]);
        }),
        switchMap(({ config, page, limit }) =>
          this.service
            .query(config, limit, limit * (page - 1))
            .pipe(catchError(() => of({ articles: [], articlesCount: 0 }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.loading.set(false);
        this.articles.set(res.articles);
        this.totalPages.set(Math.ceil(res.articlesCount / this.limit()));
      });
  }

  protected replace(updated: Article): void {
    this.articles.update((list) => list.map((a) => (a.slug === updated.slug ? updated : a)));
  }
}
