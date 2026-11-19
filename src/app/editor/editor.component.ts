import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { toErrors } from '../core/errors';
import { Article, Errors } from '../core/models';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor.component.html',
})
export class EditorComponent {
  /** Bound from the route resolver; null when creating a new article. */
  readonly article = input<Article | null>(null);

  readonly tagList = signal<string[]>([]);
  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly form = this.fb.group({ title: [''], description: [''], body: [''] });
  readonly tagField = this.fb.control('');

  constructor() {
    effect(() => {
      const article = this.article();
      this.form.reset({
        title: article?.title ?? '',
        description: article?.description ?? '',
        body: article?.body ?? '',
      });
      this.tagList.set(article ? [...article.tagList] : []);
    });
  }

  addTag(event: Event): void {
    event.preventDefault();
    const tag = this.tagField.value.trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagField.reset();
  }

  removeTag(tagName: string): void {
    this.tagList.update((tags) => tags.filter((tag) => tag !== tagName));
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.form.disable();
    this.articles
      .save({ ...this.form.getRawValue(), tagList: this.tagList(), slug: this.article()?.slug })
      .subscribe({
        next: (article) => void this.router.navigate(['/article', article.slug]),
        error: (err) => {
          this.errors.set(toErrors(err));
          this.isSubmitting.set(false);
          this.form.enable();
        },
      });
  }
}
