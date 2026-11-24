import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { AppConstants } from '../../core/app.constants';
import { ArticleListConfig } from '../../core/models';
import { TagsService } from '../../core/tags.service';
import { UserService } from '../../core/user.service';
import { ArticleListComponent } from '../../shared/article-list.component';
import { ShowAuthedDirective } from '../../shared/show-authed.directive';

@Component({
  selector: 'app-home',
  imports: [ArticleListComponent, ShowAuthedDirective],
  template: `
    <div class="home-page">
      <div class="banner" *appShowAuthed="false">
        <div class="container">
          <h1 class="logo-font">{{ appName }}</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item" *appShowAuthed="true">
                  <a href="" class="nav-link" [class.active]="listConfig().type === 'feed'"
                    (click)="$event.preventDefault(); changeList({ type: 'feed' })">Your Feed</a>
                </li>
                <li class="nav-item">
                  <a href="" class="nav-link"
                    [class.active]="listConfig().type === 'all' && !listConfig().filters"
                    (click)="$event.preventDefault(); changeList({ type: 'all' })">Global Feed</a>
                </li>
                @if (listConfig().filters?.tag; as tag) {
                  <li class="nav-item">
                    <a href="" class="nav-link active" (click)="$event.preventDefault()"><i class="ion-pound"></i> {{ tag }}</a>
                  </li>
                }
              </ul>
            </div>

            <app-article-list [limit]="10" [config]="listConfig()" />
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>
              @if (tags(); as tags) {
                @if (tags.length) {
                  <div class="tag-list">
                    @for (tag of tags; track tag) {
                      <a href="" class="tag-default tag-pill"
                        (click)="$event.preventDefault(); changeList({ type: 'all', filters: { tag } })">{{ tag }}</a>
                    }
                  </div>
                } @else {
                  <div class="post-preview">No tags are here... yet.</div>
                }
              } @else {
                <div>Loading tags...</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  protected readonly appName = AppConstants.appName.toLowerCase();
  protected readonly listConfig = signal<ArticleListConfig>({
    type: inject(UserService).isAuthenticated() ? 'feed' : 'all',
  });
  protected readonly tags = toSignal(
    inject(TagsService)
      .getAll()
      .pipe(catchError(() => of([] as string[]))),
  );

  protected changeList(config: ArticleListConfig): void {
    this.listConfig.set(config);
  }
}
