import { Component, computed, input } from '@angular/core';
import { ArticleListConfig, Profile } from '../../core/models';
import { ArticleListComponent } from '../../shared/article-list.component';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `<app-article-list [limit]="5" [config]="config()" />`,
})
export class ProfileArticlesComponent {
  /** Inherited from the parent profile route. */
  readonly profile = input.required<Profile>();
  /** `main` (authored) or `favorites`, from route data. */
  readonly tab = input.required<'main' | 'favorites'>();

  protected readonly config = computed<ArticleListConfig>(() => ({
    type: 'all',
    filters:
      this.tab() === 'favorites'
        ? { favorited: this.profile().username }
        : { author: this.profile().username },
  }));
}
