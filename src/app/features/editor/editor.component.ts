import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Errors } from '../../core/models';
import { ArticleDraft, ArticlesService } from '../../core/services/articles.service';
import { UserService } from '../../core/services/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';
import { toErrors } from '../auth/auth.component';

const emptyDraft = (): ArticleDraft => ({ title: '', description: '', body: '', tagList: [] });

@Component({
  selector: 'app-editor',
  imports: [FormsModule, ListErrorsComponent],
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
                    name="title"
                    placeholder="Article Title"
                    [(ngModel)]="draft.title"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    name="description"
                    placeholder="What's this article about?"
                    [(ngModel)]="draft.description"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    name="body"
                    placeholder="Write your article (in markdown)"
                    [(ngModel)]="draft.body"
                  ></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    name="tags"
                    placeholder="Enter tags"
                    [(ngModel)]="tagField"
                    (keydown.enter)="$event.preventDefault(); addTag()"
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
  private readonly articles = inject(ArticlesService);
  private readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly slug = input<string>();

  protected draft: ArticleDraft = emptyDraft();
  protected tagField = '';
  protected readonly tagList = signal<string[]>([]);
  protected readonly errors = signal<Errors | null>(null);
  protected readonly isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const slug = this.slug();
      untracked(() => this.load(slug));
    });
  }

  private load(slug: string | undefined): void {
    this.draft = emptyDraft();
    this.tagList.set([]);
    if (!slug) return;
    this.articles.get(slug).subscribe({
      next: (article) => {
        if (article.author.username !== this.user.currentUser()?.username) {
          void this.router.navigateByUrl('/');
          return;
        }
        const { title, description, body, tagList } = article;
        this.draft = { slug, title, description, body, tagList };
        this.tagList.set([...tagList]);
      },
      error: () => void this.router.navigateByUrl('/'),
    });
  }

  addTag(): void {
    const tag = this.tagField.trim();
    if (tag && !this.tagList().includes(tag)) this.tagList.update((tags) => [...tags, tag]);
    this.tagField = '';
  }

  removeTag(tag: string): void {
    this.tagList.update((tags) => tags.filter((t) => t !== tag));
  }

  submit(): void {
    this.isSubmitting.set(true);
    this.articles.save({ ...this.draft, tagList: this.tagList() }).subscribe({
      next: (article) => void this.router.navigate(['/article', article.slug]),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errors.set(toErrors(err));
      },
    });
  }
}
