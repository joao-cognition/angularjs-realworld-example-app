import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { AppConstants } from './app.constants';
import { Article, ArticleDraft, ArticleListConfig, ArticlesResponse } from './models';

export interface ArticleQuery extends ArticleListConfig {
  limit: number;
  offset: number;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);

  query(config: ArticleQuery): Observable<ArticlesResponse> {
    let params = new HttpParams().set('limit', config.limit).set('offset', config.offset);
    for (const [key, value] of Object.entries(config.filters ?? {})) {
      if (value) {
        params = params.set(key, value);
      }
    }
    const url = `${AppConstants.api}/articles${config.type === 'feed' ? '/feed' : ''}`;
    return this.http.get<ArticlesResponse>(url, { params });
  }

  get(slug: string): Observable<Article> {
    if (!slug.trim()) {
      return throwError(() => new Error('Article slug is empty'));
    }
    return this.http
      .get<{ article: Article }>(`${AppConstants.api}/articles/${slug}`)
      .pipe(map((res) => res.article));
  }

  destroy(slug: string): Observable<void> {
    return this.http.delete<void>(`${AppConstants.api}/articles/${slug}`);
  }

  save({ slug, ...article }: ArticleDraft): Observable<Article> {
    const request = slug
      ? this.http.put<{ article: Article }>(`${AppConstants.api}/articles/${slug}`, { article })
      : this.http.post<{ article: Article }>(`${AppConstants.api}/articles`, { article });
    return request.pipe(map((res) => res.article));
  }

  favorite(slug: string): Observable<Article> {
    return this.http
      .post<{ article: Article }>(`${AppConstants.api}/articles/${slug}/favorite`, {})
      .pipe(map((res) => res.article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.http
      .delete<{ article: Article }>(`${AppConstants.api}/articles/${slug}/favorite`)
      .pipe(map((res) => res.article));
  }
}
