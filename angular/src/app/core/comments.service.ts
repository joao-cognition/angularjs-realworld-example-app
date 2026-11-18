import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppConstants } from './app.constants';
import { Comment } from './models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  add(slug: string, body: string): Observable<Comment> {
    return this.http
      .post<{ comment: Comment }>(`${AppConstants.api}/articles/${slug}/comments`, {
        comment: { body },
      })
      .pipe(map((r) => r.comment));
  }

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<{ comments: Comment[] }>(`${AppConstants.api}/articles/${slug}/comments`)
      .pipe(map((r) => r.comments));
  }

  destroy(commentId: number, slug: string): Observable<unknown> {
    return this.http.delete(`${AppConstants.api}/articles/${slug}/comments/${commentId}`);
  }
}
