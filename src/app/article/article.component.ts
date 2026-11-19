import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs';
import { CommentsService } from '../core/comments.service';
import { toErrors } from '../core/errors';
import { Article, Comment, Errors } from '../core/models';
import { PageTitleStrategy } from '../core/title.strategy';
import { UserService } from '../core/user.service';
import { ListErrorsComponent } from '../shared/list-errors.component';
import { MarkdownPipe } from '../shared/markdown.pipe';
import { ShowAuthedDirective } from '../shared/show-authed.directive';
import { ArticleActionsComponent } from './article-actions.component';
import { CommentComponent } from './comment.component';
import { AvatarPipe } from '../shared/avatar.pipe';

@Component({
  selector: 'app-article',
  imports: [
    AvatarPipe,
    FormsModule,
    RouterLink,
    ArticleActionsComponent,
    CommentComponent,
    ListErrorsComponent,
    MarkdownPipe,
    ShowAuthedDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './article.component.html',
})
export class ArticleComponent {
  /** Bound from the route resolver. */
  readonly article = input.required<Article>();
  readonly current = linkedSignal(() => this.article());

  readonly currentUser = inject(UserService).current;
  readonly comments = signal<Comment[]>([]);
  readonly commentBody = signal('');
  readonly commentSubmitting = signal(false);
  readonly commentErrors = signal<Errors | null>(null);

  private readonly commentsService = inject(CommentsService);
  private readonly titleStrategy = inject(PageTitleStrategy);

  constructor() {
    effect(() => this.titleStrategy.setPageTitle(this.article().title));

    toObservable(this.article)
      .pipe(
        map((article) => article.slug),
        distinctUntilChanged(),
        switchMap((slug) => this.commentsService.getAll(slug)),
        takeUntilDestroyed(),
      )
      .subscribe((comments) => this.comments.set(comments));
  }

  addComment(): void {
    this.commentSubmitting.set(true);
    this.commentsService.add(this.current().slug, this.commentBody()).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.commentBody.set('');
        this.commentErrors.set(null);
        this.commentSubmitting.set(false);
      },
      error: (err) => {
        this.commentErrors.set(toErrors(err));
        this.commentSubmitting.set(false);
      },
    });
  }

  deleteComment(commentId: number): void {
    this.commentsService.destroy(commentId, this.current().slug).subscribe(() => {
      this.comments.update((list) => list.filter((c) => c.id !== commentId));
    });
  }
}
