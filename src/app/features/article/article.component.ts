import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Article, Comment, Errors } from '../../core/models';
import { ArticlesService } from '../../core/services/articles.service';
import { CommentsService } from '../../core/services/comments.service';
import { UserService } from '../../core/services/user.service';
import { ConduitTitleStrategy } from '../../core/title.strategy';
import { DefaultImagePipe } from '../../shared/default-image.pipe';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { MarkdownPipe } from '../../shared/markdown.pipe';
import { toErrors } from '../auth/auth.component';
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
    DefaultImagePipe,
  ],
  template: `
    @if (article(); as current) {
      <div class="article-page">
        <div class="banner">
          <div class="container">
            <h1>{{ current.title }}</h1>
            <div class="article-meta">
              <app-article-actions [article]="current" (articleChange)="article.set($event)" />
            </div>
          </div>
        </div>

        <div class="container page">
          <div class="row article-content">
            <div class="col-xs-12">
              <div [innerHTML]="current.body | markdown"></div>
              <ul class="tag-list">
                @for (tag of current.tagList; track tag) {
                  <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
                }
              </ul>
            </div>
          </div>

          <hr />

          <div class="article-actions">
            <app-article-actions [article]="current" (articleChange)="article.set($event)" />
          </div>

          <div class="row">
            <div class="col-xs-12 col-md-8 offset-md-2">
              @if (user.currentUser(); as currentUser) {
                <div>
                  <app-list-errors [errors]="commentErrors()" />
                  <form class="card comment-form" (ngSubmit)="addComment()">
                    <fieldset [disabled]="isSubmitting()">
                      <div class="card-block">
                        <textarea
                          class="form-control"
                          name="comment"
                          placeholder="Write a comment..."
                          rows="3"
                          [(ngModel)]="commentBody"
                        ></textarea>
                      </div>
                      <div class="card-footer">
                        <img [src]="currentUser.image | defaultImage" class="comment-author-img" />
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

              @for (comment of comments(); track comment.id) {
                <app-comment [comment]="comment" (delete)="deleteComment(comment.id)" />
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ArticleComponent {
  protected readonly user = inject(UserService);
  private readonly articles = inject(ArticlesService);
  private readonly commentsService = inject(CommentsService);
  private readonly router = inject(Router);
  private readonly titles = inject(ConduitTitleStrategy);

  readonly slug = input.required<string>();

  protected readonly article = signal<Article | null>(null);
  protected readonly comments = signal<Comment[]>([]);
  protected readonly commentErrors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);
  protected commentBody = '';

  constructor() {
    effect(() => {
      const slug = this.slug();
      untracked(() => this.load(slug));
    });
  }

  private load(slug: string): void {
    this.article.set(null);
    this.comments.set([]);
    this.articles.get(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.titles.setTitle(article.title);
      },
      error: () => void this.router.navigateByUrl('/'),
    });
    this.commentsService.getAll(slug).subscribe({
      next: (comments) => this.comments.set(comments),
      error: () => this.comments.set([]),
    });
  }

  addComment(): void {
    this.isSubmitting.set(true);
    this.commentsService.add(this.slug(), this.commentBody).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.commentBody = '';
        this.commentErrors.set(null);
        this.isSubmitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.commentErrors.set(toErrors(err));
      },
    });
  }

  deleteComment(id: number): void {
    this.commentsService.destroy(id, this.slug()).subscribe(() => {
      this.comments.update((list) => list.filter((c) => c.id !== id));
    });
  }
}
