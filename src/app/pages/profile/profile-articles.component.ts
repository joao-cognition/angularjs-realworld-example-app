import { Component, computed, input } from '@angular/core';
import { ArticleListConfig, Profile } from '../../core/models';
import { ArticleListComponent } from '../../shared/article-list.component';

export type ProfileTab = 'main' | 'favorites';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `<app-article-list [limit]="5" [config]="listConfig()" />`,
})
export class ProfileArticlesComponent {
  /** Inherited from the parent route's resolver. */
  readonly profile = input.required<Profile>();
  /** From route data. */
  readonly profileState = input.required<ProfileTab>();

  protected readonly listConfig = computed<ArticleListConfig>(() => ({
    type: 'all',
    filters:
      this.profileState() === 'main'
        ? { author: this.profile().username }
        : { favorited: this.profile().username },
  }));
}
