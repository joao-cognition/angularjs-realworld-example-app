import { AvatarFallbackDirective } from '../../shared/avatar-fallback.directive';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { marked } from 'marked';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { CommentsService } from '../../core/comments.service';
import { toErrors } from '../../core/errors';
import { Article, Comment, Errors, Profile } from '../../core/models';
import { UserService } from '../../core/user.service';
import { AvatarPipe } from '../../shared/avatar.pipe';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { ShowAuthedDirective } from '../../shared/show-authed.directive';
import { ArticleActionsComponent } from './article-actions.component';
import { CommentComponent } from './comment.component';

@Component({
  selector: 'app-article',
  imports: [
    AvatarFallbackDirective,
    FormsModule,
    RouterLink,
    AvatarPipe,
    ListErrorsComponent,
    ShowAuthedDirective,
    ArticleActionsComponent,
    CommentComponent,
  ],
  template: `
    <div class="article-page">
      <div class="banner">
        <div class="container">
          <h1>{{ current().title }}</h1>
          <div class="article-meta">
            <app-article-actions
              [article]="current()"
              (articleChange)="current.set($event)"
              (authorChange)="setAuthor($event)"
            />
          </div>
        </div>
      </div>

      <div class="container page">
        <div class="row article-content">
          <div class="col-xs-12">
            <div [innerHTML]="bodyHtml()"></div>
            <ul class="tag-list">
              @for (tag of current().tagList; track tag) {
                <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
              }
            </ul>
          </div>
        </div>

        <hr />

        <div class="article-actions">
          <app-article-actions
            [article]="current()"
            (articleChange)="current.set($event)"
            (authorChange)="setAuthor($event)"
          />
        </div>

        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
            <div *appShowAuthed="true">
              <app-list-errors [errors]="commentErrors()" />
              <form class="card comment-form" (ngSubmit)="addComment()">
                <fieldset [disabled]="submitting()">
                  <div class="card-block">
                    <textarea
                      class="form-control"
                      placeholder="Write a comment..."
                      rows="3"
                      name="body"
                      [(ngModel)]="commentBody"
                    ></textarea>
                  </div>
                  <div class="card-footer">
                    <img
                      appAvatar
                      [src]="user.current()?.image | avatar"
                      class="comment-author-img"
                      alt=""
                    />
                    <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
                  </div>
                </fieldset>
              </form>
            </div>

            <div *appShowAuthed="false">
              <a routerLink="/login">Sign in</a> or <a routerLink="/register">sign up</a> to add
              comments on this article.
            </div>

            @for (comment of comments(); track comment.id) {
              <app-comment [comment]="comment" (delete)="deleteComment(comment)" />
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ArticleComponent {
  /** Resolved by `articleResolver`. */
  readonly article = input.required<Article>();

  protected readonly user = inject(UserService);
  private readonly commentsService = inject(CommentsService);

  protected readonly current = linkedSignal(() => this.article());
  protected readonly bodyHtml = computed(() =>
    marked.parse(this.current().body ?? '', { async: false }),
  );
  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentErrors = signal<Errors | null>(null);
  protected readonly submitting = signal(false);
  protected commentBody = '';

  constructor() {
    toObservable(this.article)
      .pipe(
        map((a) => a.slug),
        distinctUntilChanged(),
        switchMap((slug) => this.commentsService.getAll(slug).pipe(catchError(() => of([])))),
        takeUntilDestroyed(),
      )
      .subscribe((comments) => this.comments.set(comments));
  }

  protected setAuthor(author: Profile): void {
    this.current.update((a) => ({ ...a, author }));
  }

  addComment(): void {
    if (!this.commentBody.trim()) {
      this.commentErrors.set({ body: ["can't be blank"] });
      return;
    }
    this.submitting.set(true);
    this.commentsService.add(this.current().slug, this.commentBody).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.commentBody = '';
        this.commentErrors.set(null);
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.commentErrors.set(toErrors(err));
      },
    });
  }

  deleteComment(comment: Comment): void {
    this.commentsService.destroy(comment.id, this.current().slug).subscribe(() => {
      this.comments.update((list) => list.filter((c) => c.id !== comment.id));
    });
  }
}
