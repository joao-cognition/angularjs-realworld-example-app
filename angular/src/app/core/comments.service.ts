import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AppConstants } from './app.constants';
import { Comment } from './models';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  add(slug: string, body: string): Observable<Comment> {
    return this.http
      .post<{ comment: Comment }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}/comments`, {
        comment: { body },
      })
      .pipe(map((res) => res.comment));
  }

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<{ comments: Comment[] }>(`${AppConstants.api}/articles/${encodeURIComponent(slug)}/comments`)
      .pipe(map((res) => res.comments));
  }

  destroy(commentId: number, articleSlug: string): Observable<unknown> {
    return this.http.delete(`${AppConstants.api}/articles/${encodeURIComponent(articleSlug)}/comments/${commentId}`);
  }
}
