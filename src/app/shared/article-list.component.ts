import { Component, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { ArticlesService } from '../core/articles.service';
import { Article, ArticleListConfig } from '../core/models';
import { ArticlePreviewComponent } from './article-preview.component';
import { ListPaginationComponent } from './list-pagination.component';

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, ListPaginationComponent],
  template: `
    @for (article of articles(); track article.slug) {
      <app-article-preview [article]="article" />
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
  readonly limit = input.required<number>();
  readonly config = input.required<ArticleListConfig>();

  readonly currentPage = linkedSignal({ source: this.config, computation: () => 1 });
  readonly loading = signal(false);
  readonly articles = signal<Article[]>([]);
  readonly totalPages = signal(0);

  private readonly articlesService = inject(ArticlesService);
  private lastConfig: ArticleListConfig | null = null;

  constructor() {
    effect((onCleanup) => {
      const config = this.config();
      const limit = this.limit();
      const page = this.currentPage();

      untracked(() => {
        if (config !== this.lastConfig) {
          this.articles.set([]);
          this.lastConfig = config;
        }
        this.loading.set(true);
      });

      const subscription = this.articlesService
        .query({
          type: config.type,
          filters: { ...config.filters, limit, offset: limit * (page - 1) },
        })
        .subscribe({
          next: (res) => {
            this.loading.set(false);
            this.articles.set(res.articles);
            this.totalPages.set(Math.ceil(res.articlesCount / limit));
          },
          error: () => this.loading.set(false),
        });
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
