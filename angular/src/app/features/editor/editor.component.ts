import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleDraft, ArticlesService } from '../../core/articles.service';
import { Article, Errors } from '../../core/models';
import { ListErrorsComponent } from '../../shared/list-errors.component';

type TextField = 'title' | 'description' | 'body';

function emptyDraft(): ArticleDraft {
  return { title: '', description: '', body: '', tagList: [] };
}

@Component({
  selector: 'app-editor',
  imports: [ListErrorsComponent],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <app-list-errors [errors]="errors()" />

            <form>
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    [value]="draft().title"
                    (input)="setField('title', $event)"
                  />
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    [value]="draft().description"
                    (input)="setField('description', $event)"
                  />
                </fieldset>

                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    [value]="draft().body"
                    (input)="setField('body', $event)"
                  ></textarea>
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="Enter tags"
                    [value]="tagField()"
                    (input)="tagField.set($any($event.target).value)"
                    (keyup.enter)="addTag()"
                  />

                  <div class="tag-list">
                    @for (tag of draft().tagList; track tag) {
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
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  /** Bound from the route resolver (null on /editor). */
  readonly article = input<Article | null>(null);

  readonly draft = signal<ArticleDraft>(emptyDraft());
  readonly tagField = signal('');
  readonly errors = signal<Errors | null>(null);
  readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const a = this.article();
      this.draft.set(
        a
          ? {
              slug: a.slug,
              title: a.title,
              description: a.description,
              body: a.body,
              tagList: [...a.tagList],
            }
          : emptyDraft(),
      );
      this.tagField.set('');
      this.errors.set(null);
      this.isSubmitting.set(false);
    });
  }

  setField(field: TextField, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  addTag(): void {
    const tag = this.tagField().trim();
    if (!tag || this.draft().tagList.includes(tag)) return;
    this.draft.update((d) => ({ ...d, tagList: [...d.tagList, tag] }));
    this.tagField.set('');
  }

  removeTag(tag: string): void {
    this.draft.update((d) => ({ ...d, tagList: d.tagList.filter((t) => t !== tag) }));
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.articles.save(this.draft()).subscribe({
      next: (saved) => this.router.navigate(['/article', saved.slug]),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? { error: [err.message] });
      },
    });
  }
}
