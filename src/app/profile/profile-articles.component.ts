import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ArticleListConfig, Profile } from '../core/models';
import { ArticleListComponent } from '../shared/article-list.component';

export type ProfileArticlesMode = 'main' | 'favorites';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-article-list [limit]="5" [config]="listConfig()" />`,
})
export class ProfileArticlesComponent {
  /** Inherited from the parent route resolver. */
  readonly profile = input.required<Profile>();
  /** Bound from route data. */
  readonly mode = input.required<ProfileArticlesMode>();

  readonly listConfig = computed<ArticleListConfig>(() => {
    const username = this.profile().username;
    return {
      type: 'all',
      filters: this.mode() === 'main' ? { author: username } : { favorited: username },
    };
  });
}
