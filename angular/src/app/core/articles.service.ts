import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { AppConstants } from './app.constants';
import { Article, ArticleDraft, ArticleListConfig } from './models';

export interface ArticlePage {
  articles: Article[];
  articlesCount: number;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);

  query(config: ArticleListConfig, limit: number, offset: number): Observable<ArticlePage> {
    const url = `${AppConstants.api}/articles${config.type === 'feed' ? '/feed' : ''}`;
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    for (const [key, value] of Object.entries(config.filters ?? {})) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<ArticlePage>(url, { params });
  }

  get(slug: string): Observable<Article> {
    if (!slug.trim()) {
      return throwError(() => new Error('Article slug is empty'));
    }
    return this.http
      .get<{ article: Article }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}`)
      .pipe(map((res) => res.article));
  }

  destroy(slug: string): Observable<unknown> {
    return this.http.delete(`${AppConstants.api}/articles/${encodeURIComponent(slug)}`);
  }

  save(draft: ArticleDraft): Observable<Article> {
    const { slug, ...article } = draft;
    const request = slug
      ? this.http.put<{ article: Article }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}`, { article })
      : this.http.post<{ article: Article }>(`${AppConstants.api}/articles`, { article });
    return request.pipe(map((res) => res.article));
  }

  favorite(slug: string): Observable<Article> {
    return this.http
      .post<{ article: Article }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}/favorite`, {})
      .pipe(map((res) => res.article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.http
      .delete<{ article: Article }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}/favorite`)
      .pipe(map((res) => res.article));
  }
}
