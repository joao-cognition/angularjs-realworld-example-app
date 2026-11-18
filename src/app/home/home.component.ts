import { LowerCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '../core/app-config';
import { ArticleListConfig } from '../core/models';
import { TagsService } from '../core/tags.service';
import { UserService } from '../core/user.service';
import { ArticleListComponent } from '../shared/article-list.component';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-home',
  imports: [ArticleListComponent, LowerCasePipe, ShowAuthedDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly appName = inject(APP_CONFIG).appName;
  readonly tags = signal<string[]>([]);
  readonly tagsLoaded = signal(false);
  readonly listConfig = signal<ArticleListConfig>({
    type: inject(UserService).isAuthenticated() ? 'feed' : 'all',
  });

  constructor() {
    inject(TagsService)
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((tags) => {
        this.tagsLoaded.set(true);
        this.tags.set(tags);
      });
  }

  changeList(event: Event, config: ArticleListConfig): void {
    event.preventDefault();
    this.listConfig.set(config);
  }
}
