import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ListConfig, Profile } from '../core/models';
import { ArticleList } from '../shared/article-list';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleList],
  template: `<article-list [limit]="5" [listConfig]="listConfig()" />`,
})
export class ProfileArticles {
  private readonly route = inject(ActivatedRoute);
  private readonly parentData = toSignal(this.route.parent!.data, { requireSync: true });
  private readonly data = toSignal(this.route.data, { requireSync: true });

  protected readonly listConfig = computed<ListConfig>(() => {
    const username = (this.parentData()['profile'] as Profile).username;
    return this.data()['favorites']
      ? { type: 'all', filters: { favorited: username } }
      : { type: 'all', filters: { author: username } };
  });
}
