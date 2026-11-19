import { LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppConstants } from '../core/app.constants';
import { ArticleListConfig } from '../core/models';
import { TagsService } from '../core/tags.service';
import { UserService } from '../core/user.service';
import { ArticleListComponent } from '../shared/article-list.component';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-home',
  imports: [LowerCasePipe, ArticleListComponent, ShowAuthedDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly appName = AppConstants.appName;
  readonly tags = toSignal(inject(TagsService).getAll());
  readonly listConfig = signal<ArticleListConfig>({
    type: inject(UserService).isAuthenticated() ? 'feed' : 'all',
  });

  changeList(config: ArticleListConfig): void {
    this.listConfig.set(config);
  }
}
