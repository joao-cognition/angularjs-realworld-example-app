import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppConstants } from './app.constants';
import { Article, ListConfig } from './models';

export interface ArticleQuery extends ListConfig {
  limit: number;
  offset: number;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);

  query(q: ArticleQuery): Observable<{ articles: Article[]; articlesCount: number }> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries({ ...q.filters, limit: q.limit, offset: q.offset })) {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    }
    const route = q.type === 'feed' ? '/articles/feed' : '/articles';
    return this.http.get<{ articles: Article[]; articlesCount: number }>(AppConstants.api + route, {
      params,
    });
  }

  get(slug: string): Observable<Article> {
    return this.http
      .get<{ article: Article }>(`${AppConstants.api}/articles/${slug}`)
      .pipe(map((r) => r.article));
  }

  destroy(slug: string): Observable<unknown> {
    return this.http.delete(`${AppConstants.api}/articles/${slug}`);
  }

  save(article: Partial<Article>): Observable<Article> {
    const { slug, ...data } = article;
    const req = slug
      ? this.http.put<{ article: Article }>(`${AppConstants.api}/articles/${slug}`, {
          article: data,
        })
      : this.http.post<{ article: Article }>(`${AppConstants.api}/articles`, { article: data });
    return req.pipe(map((r) => r.article));
  }

  favorite(slug: string): Observable<unknown> {
    return this.http.post(`${AppConstants.api}/articles/${slug}/favorite`, {});
  }

  unfavorite(slug: string): Observable<unknown> {
    return this.http.delete(`${AppConstants.api}/articles/${slug}/favorite`);
  }
}
