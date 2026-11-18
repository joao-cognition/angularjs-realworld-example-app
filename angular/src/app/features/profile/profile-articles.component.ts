import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ListConfig, Profile } from '../../core/models';
import { ArticleListComponent } from '../../shared/article-list.component';

/** Legacy ProfileArticlesCtrl + profile/profile-articles.html. */
@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `<app-article-list [limit]="5" [config]="listConfig()" />`,
})
export class ProfileArticlesComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly profile = toSignal(
    this.route.parent!.data.pipe(map((d) => d['profile'] as Profile)),
    {
      requireSync: true,
    },
  );
  private readonly favorites = toSignal(this.route.data.pipe(map((d) => !!d['favorites'])), {
    requireSync: true,
  });

  readonly listConfig = computed(() =>
    profileListConfig(this.profile().username, this.favorites()),
  );
}

/** Both tabs use the 'all' list type; the author tab filters by author, the favorites tab by favorited. */
export function profileListConfig(username: string, favorites: boolean): ListConfig {
  return { type: 'all', filters: favorites ? { favorited: username } : { author: username } };
}
