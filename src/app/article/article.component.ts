import { Component, effect, inject, input, linkedSignal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommentsService } from '../core/comments.service';
import { extractErrors } from '../core/errors';
import { Article, Comment, Errors } from '../core/models';
import { ConduitTitleStrategy } from '../core/title.strategy';
import { UserService } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';
import { MarkdownPipe } from '../shared/markdown.pipe';
import { ShowAuthedDirective } from '../shared/show-authed.directive';
import { ArticleActionsComponent } from './article-actions.component';
import { CommentComponent } from './comment.component';

@Component({
  selector: 'app-article',
  imports: [
    ArticleActionsComponent,
    CommentComponent,
    ListErrorsComponent,
    MarkdownPipe,
    ReactiveFormsModule,
    RouterLink,
    ShowAuthedDirective,
  ],
  templateUrl: './article.component.html',
})
export class ArticleComponent {
  /** Resolved by `articleResolver`. */
  readonly article = input.required<Article>();
  readonly state = linkedSignal(() => this.article());

  readonly currentUser = inject(UserService).current;
  readonly comments = signal<Comment[]>([]);
  readonly commentBody = new FormControl('', { nonNullable: true });
  readonly commentErrors = signal<Errors | null>(null);
  readonly isSubmittingComment = signal(false);

  private readonly commentsService = inject(CommentsService);
  private readonly titleStrategy = inject(ConduitTitleStrategy);

  constructor() {
    effect(() => this.titleStrategy.setPageTitle(this.article().title));

    effect((onCleanup) => {
      const subscription = this.commentsService
        .getAll(this.article().slug)
        .subscribe((comments) => this.comments.set(comments));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  addComment(): void {
    this.isSubmittingComment.set(true);
    this.commentsService.add(this.state().slug, this.commentBody.value).subscribe({
      next: (comment) => {
        this.comments.update((comments) => [comment, ...comments]);
        this.commentBody.reset();
        this.commentErrors.set(null);
        this.isSubmittingComment.set(false);
      },
      error: (err: unknown) => {
        this.isSubmittingComment.set(false);
        this.commentErrors.set(extractErrors(err));
      },
    });
  }

  deleteComment(comment: Comment): void {
    this.commentsService.destroy(comment.id, this.state().slug).subscribe(() => {
      this.comments.update((comments) => comments.filter((c) => c.id !== comment.id));
    });
  }
}
