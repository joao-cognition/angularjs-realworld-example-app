import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from './app-config';
import { Comment } from './models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).api;

  add(slug: string, body: string): Observable<Comment> {
    return this.http
      .post<{ comment: Comment }>(`${this.api}/articles/${slug}/comments`, { comment: { body } })
      .pipe(map((res) => res.comment));
  }

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<{ comments: Comment[] }>(`${this.api}/articles/${slug}/comments`)
      .pipe(map((res) => res.comments));
  }

  destroy(commentId: number, articleSlug: string): Observable<unknown> {
    return this.http.delete(`${this.api}/articles/${articleSlug}/comments/${commentId}`);
  }
}
