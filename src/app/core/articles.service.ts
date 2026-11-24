import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';
import { Article, ArticleDraft, ArticleListConfig, ArticleListResponse } from './models';

export interface ArticleQuery {
  type: ArticleListConfig['type'];
  filters: Record<string, string | number>;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONSTANTS).api;

  query(config: ArticleQuery): Observable<ArticleListResponse> {
    const url = `${this.api}/articles${config.type === 'feed' ? '/feed' : ''}`;
    return this.http.get<ArticleListResponse>(url, {
      params: new HttpParams({ fromObject: config.filters }),
    });
  }

  get(slug: string): Observable<Article> {
    if (!slug.trim()) {
      return throwError(() => new Error('Article slug is empty'));
    }
    return this.http
      .get<{ article: Article }>(`${this.api}/articles/${slug}`)
      .pipe(map((res) => res.article));
  }

  destroy(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/articles/${slug}`);
  }

  save(draft: ArticleDraft): Observable<Article> {
    const { slug, ...article } = draft;
    const request = slug
      ? this.http.put<{ article: Article }>(`${this.api}/articles/${slug}`, { article })
      : this.http.post<{ article: Article }>(`${this.api}/articles`, { article });
    return request.pipe(map((res) => res.article));
  }

  favorite(slug: string): Observable<Article> {
    return this.http
      .post<{ article: Article }>(`${this.api}/articles/${slug}/favorite`, {})
      .pipe(map((res) => res.article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.http
      .delete<{ article: Article }>(`${this.api}/articles/${slug}/favorite`)
      .pipe(map((res) => res.article));
  }
}
