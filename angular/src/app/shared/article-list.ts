import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ArticlesService } from '../core/articles.service';
import { Article, ListConfig } from '../core/models';
import { ArticlePreview } from './article-preview';
import { ListPagination } from './list-pagination';

@Component({
  selector: 'article-list',
  imports: [ArticlePreview, ListPagination],
  template: `
    @for (article of list(); track article.slug; let i = $index) {
      <article-preview [article]="article" (articleChange)="replace(i, $event)" />
    }

    @if (loading()) {
      <div class="article-preview">Loading articles...</div>
    }

    @if (!loading() && !list().length) {
      <div class="article-preview">No articles are here... yet.</div>
    }

    @if (totalPages() > 1) {
      <list-pagination
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        (pageChange)="setPage($event)"
      />
    }
  `,
})
export class ArticleList {
  readonly limit = input.required<number>();
  readonly listConfig = input.required<ListConfig>();

  protected readonly list = signal<Article[]>([]);
  protected readonly loading = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(0);

  private readonly articles = inject(ArticlesService);
  private sub?: Subscription;

  constructor() {
    // A new list config starts over at page 1 with an empty list, like the legacy `setListTo`.
    effect(() => {
      const config = this.listConfig();
      untracked(() => {
        this.list.set([]);
        this.currentPage.set(1);
        this.run(config);
      });
    });
  }

  protected setPage(page: number) {
    this.currentPage.set(page);
    this.run(this.listConfig());
  }

  protected replace(i: number, article: Article) {
    this.list.update((l) => l.map((a, j) => (j === i ? article : a)));
  }

  private run(config: ListConfig) {
    this.loading.set(true);
    this.sub?.unsubscribe();
    const limit = this.limit();
    this.sub = this.articles
      .query({ ...config, limit, offset: limit * (this.currentPage() - 1) })
      .subscribe((res) => {
        this.loading.set(false);
        this.list.set(res.articles);
        this.totalPages.set(Math.ceil(res.articlesCount / limit));
      });
  }
}
