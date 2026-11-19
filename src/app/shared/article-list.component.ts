import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ArticlesService } from '../core/articles.service';
import { Article, ArticleListConfig } from '../core/models';
import { ArticlePreviewComponent } from './article-preview.component';
import { ListPaginationComponent } from './list-pagination.component';

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, ListPaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (article of list(); track article.slug) {
      <app-article-preview [article]="article" />
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

  readonly currentPage = linkedSignal({ source: this.config, computation: () => 1 });
  readonly loading = signal(true);
  readonly list = signal<Article[]>([]);
  readonly totalPages = signal(0);

  private readonly articles = inject(ArticlesService);
  private readonly query = computed(() => ({
    ...this.config(),
    limit: this.limit(),
    offset: this.limit() * (this.currentPage() - 1),
  }));

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.articles.query(query).pipe(catchError(() => of({ articles: [], articlesCount: 0 }))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.list.set(res.articles);
        this.totalPages.set(Math.ceil(res.articlesCount / this.limit()));
        this.loading.set(false);
      });
  }
}
