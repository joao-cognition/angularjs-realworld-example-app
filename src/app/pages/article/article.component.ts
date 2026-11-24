import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { CommentsService } from '../../core/comments.service';
import { toErrors } from '../../core/errors';
import { Article, Comment, Errors } from '../../core/models';
import { UserService } from '../../core/user.service';
import { AvatarDirective } from '../../shared/avatar.directive';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { MarkdownPipe } from '../../shared/markdown.pipe';
import { ShowAuthedDirective } from '../../shared/show-authed.directive';
import { ArticleActionsComponent } from './article-actions.component';
import { CommentComponent } from './comment.component';

@Component({
  selector: 'app-article',
  imports: [
    FormsModule,
    RouterLink,
    ArticleActionsComponent,
    CommentComponent,
    ListErrorsComponent,
    MarkdownPipe,
    ShowAuthedDirective,
    AvatarDirective,
  ],
  template: `
    <div class="article-page">
      <!-- Banner for article title, action buttons -->
      <div class="banner">
        <div class="container">
          <h1>{{ current().title }}</h1>
          <div class="article-meta">
            <app-article-actions [article]="current()" (articleChange)="current.set($event)" />
          </div>
        </div>
      </div>

      <!-- Main view. Contains article html and comments -->
      <div class="container page">
        <div class="row article-content">
          <div class="col-xs-12">
            <div [innerHTML]="current().body | markdown"></div>
            <ul class="tag-list">
              @for (tag of current().tagList; track tag) {
                <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
              }
            </ul>
          </div>
        </div>

        <hr />

        <div class="article-actions">
          <app-article-actions [article]="current()" (articleChange)="current.set($event)" />
        </div>

        <!-- Comments section -->
        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
            <div *appShowAuthed="true">
              <app-list-errors [errors]="commentErrors()" />
              <form class="card comment-form" (ngSubmit)="addComment()">
                <fieldset [disabled]="isSubmitting()">
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
                    <img [appAvatar]="user.current()?.image" class="comment-author-img" />
                    <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
                  </div>
                </fieldset>
              </form>
            </div>

            <div *appShowAuthed="false">
              <a routerLink="/login">Sign in</a> or <a routerLink="/register">sign up</a> to add
              comments on this article.
            </div>

            @for (cmt of comments(); track cmt.id) {
              <app-comment [comment]="cmt" (delete)="deleteComment(cmt)" />
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
  protected readonly current = linkedSignal(() => this.article());

  protected readonly user = inject(UserService);
  private readonly commentsService = inject(CommentsService);

  protected readonly comments = signal<Comment[]>([]);
  protected readonly isSubmitting = signal(false);
  protected readonly commentErrors = signal<Errors | null>(null);
  protected commentBody = '';

  constructor() {
    toObservable(this.article)
      .pipe(
        tap(() => {
          this.commentBody = '';
          this.commentErrors.set(null);
          this.comments.set([]);
        }),
        switchMap((article) =>
          this.commentsService.getAll(article.slug).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((comments) => this.comments.set(comments));
  }

  protected addComment(): void {
    this.isSubmitting.set(true);
    this.commentsService.add(this.current().slug, this.commentBody).subscribe({
      next: (comment) => {
        this.comments.update((comments) => [comment, ...comments]);
        this.commentBody = '';
        this.commentErrors.set(null);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.commentErrors.set(toErrors(err));
      },
    });
  }

  protected deleteComment(comment: Comment): void {
    this.commentsService.destroy(comment.id, this.current().slug).subscribe(() => {
      this.comments.update((comments) => comments.filter((c) => c.id !== comment.id));
    });
  }
}
