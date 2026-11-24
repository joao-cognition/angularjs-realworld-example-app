import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArticlesService } from '../../core/articles.service';
import { toErrors } from '../../core/errors';
import { Article, Errors } from '../../core/models';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <app-list-errors [errors]="errors()" />

            <form [formGroup]="form">
              <fieldset [disabled]="submitting()">
                <fieldset class="form-group">
                  <input class="form-control form-control-lg" type="text" placeholder="Article Title" formControlName="title" />
                </fieldset>
                <fieldset class="form-group">
                  <input class="form-control" type="text" placeholder="What's this article about?" formControlName="description" />
                </fieldset>
                <fieldset class="form-group">
                  <textarea class="form-control" rows="8" placeholder="Write your article (in markdown)" formControlName="body"></textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input class="form-control" type="text" placeholder="Enter tags" formControlName="tagField"
                    (keydown.enter)="$event.preventDefault(); addTag()" />
                  <div class="tag-list">
                    @for (tag of tagList(); track tag) {
                      <span class="tag-default tag-pill">
                        <i class="ion-close-round" (click)="removeTag(tag)"></i>
                        {{ tag }}
                      </span>
                    }
                  </div>
                </fieldset>
                <button class="btn btn-lg pull-xs-right btn-primary" type="button" (click)="submit()">Publish Article</button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EditorComponent implements OnInit {
  /** Resolved on `/editor/:slug`; absent on `/editor`. */
  readonly article = input<Article | undefined>(undefined);

  private readonly articles = inject(ArticlesService);
  private readonly router = inject(Router);

  protected readonly errors = signal<Errors | null>(null);
  protected readonly submitting = signal(false);
  protected readonly tagList = signal<string[]>([]);
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    body: new FormControl('', { nonNullable: true }),
    tagField: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const article = this.article();
    if (article) {
      this.form.patchValue(article);
      this.tagList.set([...article.tagList]);
    }
  }

  addTag(): void {
    const tag = this.form.controls.tagField.value.trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.form.controls.tagField.setValue('');
  }

  removeTag(tag: string): void {
    this.tagList.update((tags) => tags.filter((t) => t !== tag));
  }

  submit(): void {
    const { title, description, body } = this.form.getRawValue();
    const invalid: Errors = {};
    if (!title.trim()) invalid['title'] = ["can't be blank"];
    if (!description.trim()) invalid['description'] = ["can't be blank"];
    if (!body.trim()) invalid['body'] = ["can't be blank"];
    if (Object.keys(invalid).length) {
      this.errors.set(invalid);
      return;
    }

    this.submitting.set(true);
    this.errors.set(null);
    this.articles
      .save({ slug: this.article()?.slug, title, description, body, tagList: this.tagList() })
      .subscribe({
        next: (saved) => void this.router.navigate(['/article', saved.slug]),
        error: (err) => {
          this.submitting.set(false);
          this.errors.set(toErrors(err));
        },
      });
  }
}
