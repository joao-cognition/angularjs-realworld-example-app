import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticlesService } from '../core/articles.service';
import { extractErrors } from '../core/errors';
import { Article, Errors } from '../core/models';
import { ListErrorsComponent } from '../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ListErrorsComponent, ReactiveFormsModule],
  templateUrl: './editor.component.html',
})
export class EditorComponent {
  /** Resolved by `editableArticleResolver` on `/editor/:slug`; absent for a new article. */
  readonly article = input<Article>();

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    body: new FormControl('', { nonNullable: true }),
  });
  readonly tagField = new FormControl('', { nonNullable: true });
  readonly tagList = signal<string[]>([]);
  readonly isSubmitting = signal(false);
  readonly errors = signal<Errors | null>(null);

  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const article = this.article();
      untracked(() => {
        this.form.reset({
          title: article?.title ?? '',
          description: article?.description ?? '',
          body: article?.body ?? '',
        });
        this.tagList.set([...(article?.tagList ?? [])]);
      });
    });
  }

  addTag(): void {
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
    this.articles
      .save({ slug: this.article()?.slug, ...this.form.getRawValue(), tagList: this.tagList() })
      .subscribe({
        next: (article) => void this.router.navigate(['/article', article.slug]),
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          this.errors.set(extractErrors(err));
        },
      });
  }
}
