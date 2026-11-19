import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
      .pipe(map((res) => res.comment));
  }

  getAll(slug: string): Observable<Comment[]> {
    return this.http
      .get<{ comments: Comment[] }>(`${AppConstants.api}/articles/${slug}/comments`)
      .pipe(map((res) => res.comments));
  }

  destroy(commentId: number, articleSlug: string): Observable<void> {
    return this.http.delete<void>(
      `${AppConstants.api}/articles/${articleSlug}/comments/${commentId}`,
    );
  }
}
