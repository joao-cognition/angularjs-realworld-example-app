import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';
import { Comment } from './models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONSTANTS).api;

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

  destroy(commentId: Comment['id'], articleSlug: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/articles/${articleSlug}/comments/${commentId}`);
  }
}
