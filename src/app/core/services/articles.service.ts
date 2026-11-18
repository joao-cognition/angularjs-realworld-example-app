import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Article, ArticleListConfig } from '../models';
import { ApiService } from './api.service';

export interface ArticleList {
  articles: Article[];
  articlesCount: number;
}

export type ArticleDraft = Pick<Article, 'title' | 'description' | 'body' | 'tagList'> & {
  slug?: string;
};

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly api = inject(ApiService);

  query(config: ArticleListConfig, limit: number, offset: number): Observable<ArticleList> {
    const path = config.type === 'feed' ? '/articles/feed' : '/articles';
    return this.api.get<ArticleList>(path, { ...config.filters, limit, offset });
  }

  get(slug: string): Observable<Article> {
    return this.api.get<{ article: Article }>(`/articles/${slug}`).pipe(map((r) => r.article));
  }

  destroy(slug: string): Observable<void> {
    return this.api.delete<void>(`/articles/${slug}`);
  }

  save(draft: ArticleDraft): Observable<Article> {
    const { slug, ...article } = draft;
    const request = slug
      ? this.api.put<{ article: Article }>(`/articles/${slug}`, { article })
      : this.api.post<{ article: Article }>('/articles', { article });
    return request.pipe(map((r) => r.article));
  }

  favorite(slug: string): Observable<Article> {
    return this.api
      .post<{ article: Article }>(`/articles/${slug}/favorite`)
      .pipe(map((r) => r.article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.api
      .delete<{ article: Article }>(`/articles/${slug}/favorite`)
      .pipe(map((r) => r.article));
  }
}
