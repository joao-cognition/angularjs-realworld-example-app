import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { Article, ArticleDraft, ArticleQuery } from './models';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).api;

  query(config: ArticleQuery): Observable<{ articles: Article[]; articlesCount: number }> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(config.filters)) {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    }
    const url = `${this.api}/articles${config.type === 'feed' ? '/feed' : ''}`;
    return this.http.get<{ articles: Article[]; articlesCount: number }>(url, { params });
  }

  get(slug: string): Observable<Article> {
    if (!slug.trim()) {
      return throwError(() => new Error('Article slug is empty'));
    }
    return this.http
      .get<{ article: Article }>(`${this.api}/articles/${slug}`)
      .pipe(map((res) => res.article));
  }

  destroy(slug: string): Observable<unknown> {
    return this.http.delete(`${this.api}/articles/${slug}`);
  }

  save({ slug, ...article }: ArticleDraft): Observable<Article> {
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
