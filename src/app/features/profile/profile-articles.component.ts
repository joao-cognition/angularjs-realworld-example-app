import { Component, computed, input } from '@angular/core';
import { ArticleListConfig } from '../../core/models';
import { ArticleListComponent } from '../../shared/article-list.component';

/** `/profile/:username` (authored) and `/profile/:username/favorites` (favorited) tabs. */
@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `<app-article-list [config]="config()" [limit]="5" [page]="currentPage()" />`,
})
export class ProfileArticlesComponent {
  readonly username = input.required<string>();
  readonly tab = input<'author' | 'favorited'>('author');
  readonly page = input<string>();

  protected readonly config = computed<ArticleListConfig>(() => ({
    type: 'all',
    filters: { [this.tab()]: this.username() },
  }));
  protected readonly currentPage = computed(() => Math.max(1, Number(this.page()) || 1));
}
