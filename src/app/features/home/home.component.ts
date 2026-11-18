import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleListConfig } from '../../core/models';
import { TagsService } from '../../core/services/tags.service';
import { UserService } from '../../core/services/user.service';
import { ArticleListComponent } from '../../shared/article-list.component';

/**
 * Routes: `/` (global feed), `/?feed=following` (your feed), `/tag/:tag`, plus `?page=N` on each.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, ArticleListComponent],
  template: `
    <div class="home-page">
      @if (!user.isAuthenticated()) {
        <div class="banner">
          <div class="container">
            <h1 class="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      }

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                @if (user.isAuthenticated()) {
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      [class.active]="listConfig().type === 'feed'"
                      routerLink="/"
                      [queryParams]="{ feed: 'following' }"
                      >Your Feed</a
                    >
                  </li>
                }
                <li class="nav-item">
                  <a
                    class="nav-link"
                    [class.active]="listConfig().type === 'all' && !tag()"
                    routerLink="/"
                    >Global Feed</a
                  >
                </li>
                @if (tag()) {
                  <li class="nav-item">
                    <a class="nav-link active" [routerLink]="['/tag', tag()]">
                      <i class="ion-pound"></i> {{ tag() }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <app-article-list [config]="listConfig()" [limit]="10" [page]="currentPage()" />
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>
              @if (tags(); as tagList) {
                @if (tagList.length) {
                  <div class="tag-list">
                    @for (tagName of tagList; track tagName) {
                      <a class="tag-default tag-pill" [routerLink]="['/tag', tagName]">{{
                        tagName
                      }}</a>
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
  protected readonly user = inject(UserService);
  private readonly router = inject(Router);

  readonly tag = input<string>();
  readonly feed = input<string>();
  readonly page = input<string>();

  protected readonly tags = signal<string[] | null>(null);

  protected readonly listConfig = computed<ArticleListConfig>(() => {
    const tag = this.tag();
    if (tag) return { type: 'all', filters: { tag } };
    if (this.feed() === 'following' && this.user.isAuthenticated()) {
      return { type: 'feed', filters: {} };
    }
    return { type: 'all', filters: {} };
  });

  protected readonly currentPage = computed(() => Math.max(1, Number(this.page()) || 1));

  constructor() {
    inject(TagsService)
      .getAll()
      .subscribe({ next: (tags) => this.tags.set(tags), error: () => this.tags.set([]) });

    effect(() => {
      if (this.feed() === 'following' && !this.user.isAuthenticated()) {
        void this.router.navigateByUrl('/login');
      }
    });
  }
}
