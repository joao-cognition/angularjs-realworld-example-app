import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Comment } from '../models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly api = inject(ApiService);

  getAll(slug: string): Observable<Comment[]> {
    return this.api
      .get<{ comments: Comment[] }>(`/articles/${slug}/comments`)
      .pipe(map((r) => r.comments));
  }

  add(slug: string, body: string): Observable<Comment> {
    return this.api
      .post<{ comment: Comment }>(`/articles/${slug}/comments`, { comment: { body } })
      .pipe(map((r) => r.comment));
  }

  destroy(commentId: number, slug: string): Observable<void> {
    return this.api.delete<void>(`/articles/${slug}/comments/${commentId}`);
  }
}
