import { Component, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { AppConstants } from '../../core/app-constants';
import { ListConfig } from '../../core/models';
import { TagsService } from '../../core/tags.service';
import { UserService } from '../../core/user.service';
import { ArticleListComponent } from '../../shared/article-list.component';

/** Legacy HomeCtrl + home/home.html: banner, feed tabs, article list and popular tags. */
@Component({
  selector: 'app-home',
  imports: [ArticleListComponent, LowerCasePipe],
  template: `
    <div class="home-page">
      <!-- Splash banner that only shows when not logged in -->
      @if (!user.isAuthenticated()) {
        <div class="banner">
          <div class="container">
            <h1 class="logo-font">{{ appName | lowercase }}</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      }

      <div class="container page">
        <div class="row">
          <!-- Main view - contains tabs & article list -->
          <div class="col-md-9">
            <!-- Tabs for toggling between feed, article lists -->
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                @if (user.isAuthenticated()) {
                  <li class="nav-item">
                    <a
                      href=""
                      class="nav-link"
                      [class.active]="listConfig().type === 'feed'"
                      (click)="changeList({ type: 'feed' }, $event)"
                    >
                      Your Feed
                    </a>
                  </li>
                }

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

            <!-- List the current articles -->
            <app-article-list [limit]="10" [config]="listConfig()" />
          </div>

          <!-- Sidebar where popular tags are listed -->
          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              @if (tags(); as tagNames) {
                <div class="tag-list">
                  @for (tagName of tagNames; track tagName) {
                    <a
                      href=""
                      class="tag-default tag-pill"
                      (click)="changeList({ type: 'all', filters: { tag: tagName } }, $event)"
                      >{{ tagName }}</a
                    >
                  }
                </div>
              }

              @if (!tagsLoaded()) {
                <div>Loading tags...</div>
              }

              @if (tagsLoaded() && !tags()?.length) {
                <div class="post-preview">No tags are here... yet.</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent {
  protected readonly user = inject(UserService);
  protected readonly appName = AppConstants.appName;

  protected readonly tags = signal<string[] | null>(null);
  protected readonly tagsLoaded = signal(false);

  /** Signed-in users start on their feed, everyone else on the global feed. */
  protected readonly listConfig = signal<ListConfig>({
    type: this.user.current() ? 'feed' : 'all',
  });

  constructor() {
    inject(TagsService)
      .getAll()
      .subscribe((tags) => {
        this.tagsLoaded.set(true);
        this.tags.set(tags);
      });
  }

  /** A new config object makes app-article-list reset to page 1 and re-query (legacy 'setListTo'). */
  changeList(newList: ListConfig, event?: Event): void {
    event?.preventDefault();
    this.listConfig.set(newList);
  }
}
