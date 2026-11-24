import { LowerCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONSTANTS } from '../../core/app.constants';
import { ArticleListConfig } from '../../core/models';
import { TagsService } from '../../core/tags.service';
import { UserService } from '../../core/user.service';
import { ArticleListComponent } from '../../shared/article-list.component';
import { ShowAuthedDirective } from '../../shared/show-authed.directive';

@Component({
  selector: 'app-home',
  imports: [LowerCasePipe, ArticleListComponent, ShowAuthedDirective],
  template: `
    <div class="home-page">
      <!-- Splash banner that only shows when not logged in -->
      <div class="banner" *appShowAuthed="false">
        <div class="container">
          <h1 class="logo-font">{{ appName | lowercase }}</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <!-- Main view - contains tabs & article list -->
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item" *appShowAuthed="true">
                  <a
                    href=""
                    class="nav-link"
                    [class.active]="listConfig().type === 'feed'"
                    (click)="changeList({ type: 'feed' }, $event)"
                  >
                    Your Feed
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    href=""
                    class="nav-link"
                    [class.active]="listConfig().type === 'all' && !listConfig().filters"
                    (click)="changeList({ type: 'all' }, $event)"
                  >
                    Global Feed
                  </a>
                </li>
                @if (listConfig().filters?.tag; as tag) {
                  <li class="nav-item">
                    <a href="" class="nav-link active" (click)="$event.preventDefault()">
                      <i class="ion-pound"></i> {{ tag }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <app-article-list [limit]="10" [config]="listConfig()" />
          </div>

          <!-- Sidebar where popular tags are listed -->
          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              @if (tags(); as tags) {
                <div class="tag-list">
                  @for (tagName of tags; track tagName) {
                    <a
                      href=""
                      class="tag-default tag-pill"
                      (click)="changeList({ type: 'all', filters: { tag: tagName } }, $event)"
                    >
                      {{ tagName }}
                    </a>
                  }
                </div>
                @if (!tags.length) {
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
  protected readonly appName = inject(APP_CONSTANTS).appName;
  protected readonly tags = signal<string[] | null>(null);
  protected readonly listConfig = signal<ArticleListConfig>({
    type: inject(UserService).current() ? 'feed' : 'all',
  });

  constructor() {
    inject(TagsService)
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((tags) => this.tags.set(tags));
  }

  protected changeList(config: ArticleListConfig, event: Event): void {
    event.preventDefault();
    this.listConfig.set(config);
  }
}
