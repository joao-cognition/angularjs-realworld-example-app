import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommentsService } from '../core/comments.service';
import { MarkdownPipe } from '../core/markdown.pipe';
import { Article, Comment, Errors } from '../core/models';
import { UserService } from '../core/user.service';
import { ListErrors } from '../shared/list-errors';
import { ShowAuthedDirective } from '../shared/show-authed.directive';
import { ArticleActions } from './article-actions';
import { CommentCard } from './comment';

@Component({
  selector: 'app-article',
  imports: [RouterLink, MarkdownPipe, ListErrors, ShowAuthedDirective, ArticleActions, CommentCard],
  template: `
    <div class="article-page">
      <div class="banner">
        <div class="container">
          <h1>{{ article().title }}</h1>
          <div class="article-meta">
            <article-actions [(article)]="article" />
          </div>
        </div>
      </div>

      <div class="container page">
        <div class="row article-content">
          <div class="col-xs-12">
            <div [innerHTML]="article().body | markdown"></div>

            <ul class="tag-list">
              @for (tag of article().tagList; track $index) {
                <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
              }
            </ul>
          </div>
        </div>

        <hr />

        <div class="article-actions">
          <article-actions [(article)]="article" />
        </div>

        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
            <div [showAuthed]="true">
              <list-errors [errors]="commentErrors()" />
              <form class="card comment-form" (submit)="addComment($event)">
                <fieldset [disabled]="isSubmitting()">
                  <div class="card-block">
                    <textarea
                      class="form-control"
                      placeholder="Write a comment..."
                      rows="3"
                      [value]="commentBody()"
                      (input)="commentBody.set($any($event.target).value)"
                    ></textarea>
                  </div>
                  <div class="card-footer">
                    <img [attr.src]="user.current()?.image" class="comment-author-img" />
                    <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
                  </div>
                </fieldset>
              </form>
            </div>

            <div [showAuthed]="false">
              <a routerLink="/login">Sign in</a> or <a routerLink="/register">sign up</a> to add
              comments on this article.
            </div>

            @for (cmt of comments(); track cmt.id) {
              <app-comment [data]="cmt" (deleted)="deleteComment(cmt)" />
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ArticlePage {
  /** Bound from the route resolver. */
  readonly resolved = input.required<Article>({ alias: 'article' });
  protected readonly article = linkedSignal(() => this.resolved());
  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentBody = signal('');
  protected readonly commentErrors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly user = inject(UserService);
  private readonly commentsApi = inject(CommentsService);

  ngOnInit() {
    this.commentsApi.getAll(this.article().slug).subscribe((c) => this.comments.set(c));
  }

  protected addComment(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);
    this.commentsApi.add(this.article().slug, this.commentBody()).subscribe({
      next: (comment) => {
        this.comments.update((c) => [comment, ...c]);
        this.isSubmitting.set(false);
        this.commentBody.set('');
        this.commentErrors.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.commentErrors.set(err.error?.errors ?? null);
      },
    });
  }

  protected deleteComment(cmt: Comment) {
    this.commentsApi
      .destroy(cmt.id, this.article().slug)
      .subscribe(() => this.comments.update((c) => c.filter((x) => x.id !== cmt.id)));
  }
}
