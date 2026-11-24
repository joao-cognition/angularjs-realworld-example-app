import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticlesService } from '../../core/articles.service';
import { toErrors } from '../../core/errors';
import { Article, Errors } from '../../core/models';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, FormsModule, ListErrorsComponent],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <app-list-errors [errors]="errors()" />

            <form [formGroup]="form">
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    formControlName="title"
                    type="text"
                    placeholder="Article Title"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    formControlName="description"
                    type="text"
                    placeholder="What's this article about?"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    formControlName="body"
                    placeholder="Write your article (in markdown)"
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="Enter tags"
                    [(ngModel)]="tagField"
                    [ngModelOptions]="{ standalone: true }"
                    (keyup.enter)="addTag()"
                  />
                  <div class="tag-list">
                    @for (tag of tagList(); track tag) {
                      <span class="tag-default tag-pill">
                        <i class="ion-close-round" (click)="removeTag(tag)"></i>
                        {{ tag }}
                      </span>
                    }
                  </div>
                </fieldset>

                <button
                  class="btn btn-lg pull-xs-right btn-primary"
                  type="button"
                  (click)="submit()"
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EditorComponent {
  /** Resolved by `editorArticleResolver`; `null` when creating a new article. */
  readonly article = input<Article | null>(null);

  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Errors | null>(null);
  protected readonly tagList = signal<string[]>([]);
  protected tagField = '';
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    body: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    // The router reuses this component when moving between /editor/:slug URLs, so reset the draft per article.
    effect(() => {
      const article = this.article();
      untracked(() => {
        this.form.setValue({
          title: article?.title ?? '',
          description: article?.description ?? '',
          body: article?.body ?? '',
        });
        this.tagList.set([...(article?.tagList ?? [])]);
        this.tagField = '';
        this.errors.set(null);
        this.isSubmitting.set(false);
      });
    });
  }

  protected addTag(): void {
    const tag = this.tagField.trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagField = '';
  }

  protected removeTag(tagName: string): void {
    this.tagList.update((tags) => tags.filter((tag) => tag !== tagName));
  }

  protected submit(): void {
    this.isSubmitting.set(true);
    this.articles
      .save({ ...this.form.getRawValue(), tagList: this.tagList(), slug: this.article()?.slug })
      .subscribe({
        next: (article) => void this.router.navigate(['/article', article.slug]),
        error: (err) => {
          this.isSubmitting.set(false);
          this.errors.set(toErrors(err));
        },
      });
  }
}
