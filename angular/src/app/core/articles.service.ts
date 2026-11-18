import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { AppConstants } from './app-constants';
import { Article, ArticleQuery, ArticlesPage } from './models';

export type ArticleDraft = Pick<Article, 'title' | 'description' | 'body' | 'tagList'> & { slug?: string };

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly api = AppConstants.api;

  query(config: ArticleQuery): Observable<ArticlesPage> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(config.filters ?? {})) {
      if (value !== undefined && value !== null) params = params.set(key, String(value));
    }
    const url = `${this.api}/articles${config.type === 'feed' ? '/feed' : ''}`;
    return this.http.get<ArticlesPage>(url, { params });
  }

  get(slug: string): Observable<Article> {
    if (!slug.trim()) return throwError(() => new Error('Article slug is empty'));
    return this.http.get<{ article: Article }>(`${this.api}/articles/${slug}`).pipe(map((r) => r.article));
  }

  destroy(slug: string): Observable<unknown> {
    return this.http.delete(`${this.api}/articles/${slug}`);
  }

  save(draft: ArticleDraft): Observable<Article> {
    const { slug, ...article } = draft;
    const req = slug
      ? this.http.put<{ article: Article }>(`${this.api}/articles/${slug}`, { article })
      : this.http.post<{ article: Article }>(`${this.api}/articles`, { article });
    return req.pipe(map((r) => r.article));
  }

  favorite(slug: string): Observable<Article> {
    return this.http.post<{ article: Article }>(`${this.api}/articles/${slug}/favorite`, {}).pipe(map((r) => r.article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.http.delete<{ article: Article }>(`${this.api}/articles/${slug}/favorite`).pipe(map((r) => r.article));
  }
}
