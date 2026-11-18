import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticlesService } from '../core/articles.service';
import { Article, Errors } from '../core/models';
import { ListErrors } from '../shared/list-errors';

type Draft = Pick<Article, 'title' | 'description' | 'body' | 'tagList'> & { slug?: string };

@Component({
  selector: 'app-editor',
  imports: [ListErrors],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <list-errors [errors]="errors()" />

            <form>
              <fieldset [disabled]="isSubmitting()">
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    [value]="draft().title"
                    (input)="set('title', $event)"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    [value]="draft().description"
                    (input)="set('description', $event)"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    [value]="draft().body"
                    (input)="set('body', $event)"
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
export class Editor {
  /** Bound from the route resolver; null for a new article. */
  readonly article = input<Article | null>(null);
  protected readonly draft = linkedSignal<Draft>(() => {
    const a = this.article();
    return a
      ? {
          slug: a.slug,
          title: a.title,
          description: a.description,
          body: a.body,
          tagList: [...a.tagList],
        }
      : { title: '', description: '', body: '', tagList: [] };
  });
  protected readonly tagField = signal('');
  protected readonly errors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);
  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  protected set(field: 'title' | 'description' | 'body', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  protected addTag() {
    const tag = this.tagField();
    if (tag && !this.draft().tagList.includes(tag)) {
      this.draft.update((d) => ({ ...d, tagList: [...d.tagList, tag] }));
      this.tagField.set('');
    }
  }

  protected removeTag(tag: string) {
    this.draft.update((d) => ({ ...d, tagList: d.tagList.filter((t) => t !== tag) }));
  }

  protected submit() {
    this.isSubmitting.set(true);
    this.articles.save(this.draft()).subscribe({
      next: (a) => this.router.navigate(['/article', a.slug]),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(err.error?.errors ?? null);
      },
    });
  }
}
