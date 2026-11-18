import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentsService } from '../../core/comments.service';
import { Article, Comment, Errors } from '../../core/models';
import { PageTitle } from '../../core/title.strategy';
import { UserService } from '../../core/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { ArticleActionsComponent } from './article-actions.component';
import { CommentComponent } from './comment.component';
import { renderMarkdown } from './markdown';

@Component({
  selector: 'app-article',
  imports: [
    ArticleActionsComponent,
    CommentComponent,
    FormsModule,
    ListErrorsComponent,
    RouterLink,
  ],
  template: `
    <div class="article-page">
      <!-- Banner for article title, action buttons -->
      <div class="banner">
        <div class="container">
          <h1>{{ article().title }}</h1>

          <div class="article-meta">
            <app-article-actions [article]="article()" (articleChange)="article.set($event)" />
          </div>
        </div>
      </div>

      <!-- Main view. Contains article html and comments -->
      <div class="container page">
        <!-- Article's HTML & tags rendered here -->
        <div class="row article-content">
          <div class="col-xs-12">
            <div [innerHTML]="body()"></div>

            <ul class="tag-list">
              @for (tag of article().tagList; track $index) {
                <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
              }
            </ul>
          </div>
        </div>

        <hr />

        <div class="article-actions">
          <app-article-actions [article]="article()" (articleChange)="article.set($event)" />
        </div>

        <!-- Comments section -->
        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
            @if (currentUser(); as me) {
              <div>
                <app-list-errors [errors]="errors()" />
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
                      <img [attr.src]="me.image || null" class="comment-author-img" />
                      <button class="btn btn-sm btn-primary" type="submit">Post Comment</button>
                    </div>
                  </fieldset>
                </form>
              </div>
            } @else {
              <div>
                <a routerLink="/login">Sign in</a> or <a routerLink="/register">sign up</a> to add
                comments on this article.
              </div>
            }

            @for (cmt of comments(); track cmt.id) {
              <app-comment [comment]="cmt" (delete)="deleteComment(cmt.id)" />
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ArticleComponent {
  private readonly commentsApi = inject(CommentsService);
  private readonly pageTitle = inject(PageTitle);
  protected readonly currentUser = inject(UserService).current;

  /** Bound from the route resolver. */
  readonly resolved = input.required<Article>({ alias: 'article' });
  /** Local copy that favorite/follow updates replace. */
  protected readonly article = linkedSignal(() => this.resolved());
  protected readonly body = computed(() => renderMarkdown(this.resolved().body));

  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentBody = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Errors | null>(null);

  constructor() {
    effect((onCleanup) => {
      const { slug, title } = this.resolved();
      untracked(() => {
        this.pageTitle.set(title);
        this.resetCommentForm();
        this.comments.set([]);
        const sub = this.commentsApi
          .getAll(slug)
          .subscribe((comments) => this.comments.set(comments));
        onCleanup(() => sub.unsubscribe());
      });
    });
  }

  addComment(): void {
    this.isSubmitting.set(true);
    this.commentsApi.add(this.resolved().slug, this.commentBody()).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.resetCommentForm();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? null);
      },
    });
  }

  deleteComment(id: number): void {
    this.commentsApi
      .destroy(id, this.resolved().slug)
      .subscribe(() => this.comments.update((list) => list.filter((c) => c.id !== id)));
  }

  private resetCommentForm(): void {
    this.isSubmitting.set(false);
    this.commentBody.set('');
    this.errors.set(null);
  }
}
