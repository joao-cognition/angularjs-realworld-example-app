import { Component, computed, effect, inject, input } from '@angular/core';
import { ArticleListConfig, Profile } from '../core/models';
import { ConduitTitleStrategy } from '../core/title.strategy';
import { ArticleListComponent } from '../shared/article-list.component';

export type ProfileTab = 'main' | 'favorites';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `<app-article-list [limit]="5" [config]="listConfig()" />`,
})
export class ProfileArticlesComponent {
  /** Inherited from the parent route's `profileResolver`. */
  readonly profile = input.required<Profile>();
  /** Bound from route data. */
  readonly profileTab = input.required<ProfileTab>();

  readonly listConfig = computed<ArticleListConfig>(() => {
    const username = this.profile().username;
    return this.profileTab() === 'favorites'
      ? { type: 'all', filters: { favorited: username } }
      : { type: 'all', filters: { author: username } };
  });

  constructor() {
    const titleStrategy = inject(ConduitTitleStrategy);
    effect(() => {
      const username = this.profile().username;
      titleStrategy.setPageTitle(
        this.profileTab() === 'favorites' ? `Articles favorited by ${username}` : `@${username}`,
      );
    });
  }
}
