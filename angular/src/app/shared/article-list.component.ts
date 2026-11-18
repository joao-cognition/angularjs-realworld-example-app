import { Component, DestroyRef, computed, effect, inject, input, linkedSignal, signal, untracked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ArticlesService } from '../core/articles.service';
import { Article, ListConfig } from '../core/models';
import { ArticlePreviewComponent } from './article-preview.component';
import { ListPaginationComponent } from './list-pagination.component';

/**
 * Legacy <article-list limit list-config>. A new `config` object replaces the list
 * (legacy 'setListTo' broadcast); pagination re-queries the same config ('setPageTo').
 */
@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, ListPaginationComponent],
  template: `
    @for (article of list(); track article.slug) {
      <app-article-preview [article]="article" />
    }
    @if (loading()) {
      <div class="article-preview">Loading articles...</div>
    }
    @if (!loading() && !list().length) {
      <div class="article-preview">No articles are here... yet.</div>
    }
    @if (totalPages() > 1) {
      <app-list-pagination [totalPages]="totalPages()" [currentPage]="currentPage()" (pageChange)="currentPage.set($event)" />
    }
  `,
})
export class ArticleListComponent {
  private readonly articles = inject(ArticlesService);

  readonly limit = input(10);
  readonly config = input.required<ListConfig>();

  protected readonly currentPage = linkedSignal(() => this.config().currentPage ?? 1);
  protected readonly list = signal<Article[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalPages = signal(0);

  private readonly query = computed(() => ({ config: this.config(), page: this.currentPage(), limit: this.limit() }));
  private lastConfig?: ListConfig;
  private sub?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.sub?.unsubscribe());
    effect(() => {
      const { config, page, limit } = this.query();
      untracked(() => this.run(config, page, limit));
    });
  }

  private run(config: ListConfig, page: number, limit: number): void {
    if (config !== this.lastConfig) {
      this.list.set([]);
      this.lastConfig = config;
    }
    this.loading.set(true);
    this.sub?.unsubscribe();
    this.sub = this.articles
      .query({ type: config.type, filters: { ...config.filters, limit, offset: limit * (page - 1) } })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.list.set(res.articles);
          this.totalPages.set(Math.ceil(res.articlesCount / limit));
        },
        error: () => this.loading.set(false),
      });
  }
}
