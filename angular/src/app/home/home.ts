import { Component, computed, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AppConstants } from '../core/app.constants';
import { ListConfig } from '../core/models';
import { TagsService } from '../core/tags.service';
import { UserService } from '../core/user.service';
import { ArticleList } from '../shared/article-list';
import { ShowAuthedDirective } from '../shared/show-authed.directive';

@Component({
  selector: 'app-home',
  imports: [LowerCasePipe, ArticleList, ShowAuthedDirective],
  template: `
    <div class="home-page">
      <div class="banner" [showAuthed]="false">
        <div class="container">
          <h1 class="logo-font">{{ appName | lowercase }}</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>

      <div class="container page">
        <div class="row">
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item" [showAuthed]="true">
                  <a
                    href=""
                    class="nav-link"
                    [class.active]="listConfig().type === 'feed'"
                    (click)="changeList($event, { type: 'feed' })"
                  >
                    Your Feed
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    href=""
                    class="nav-link"
                    [class.active]="isGlobal()"
                    (click)="changeList($event, { type: 'all' })"
                  >
                    Global Feed
                  </a>
                </li>
                @if (tag()) {
                  <li class="nav-item">
                    <a href="" class="nav-link active" (click)="$event.preventDefault()">
                      <i class="ion-pound"></i> {{ tag() }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <article-list [limit]="10" [listConfig]="listConfig()" />
          </div>

          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              @if (tags()) {
                <div class="tag-list">
                  @for (tagName of tags(); track tagName) {
                    <a
                      href=""
                      class="tag-default tag-pill"
                      (click)="changeList($event, { type: 'all', filters: { tag: tagName } })"
                      >{{ tagName }}</a
                    >
                  }
                </div>
              } @else {
                <div>Loading tags...</div>
              }

              @if (tags() && !tags()!.length) {
                <div class="post-preview">No tags are here... yet.</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Home {
  protected readonly appName = AppConstants.appName;
  protected readonly tags = toSignal(
    inject(TagsService)
      .getAll()
      .pipe(map((t) => t)),
    { initialValue: undefined },
  );
  protected readonly listConfig = signal<ListConfig>({
    type: inject(UserService).current() ? 'feed' : 'all',
  });
  protected readonly tag = computed(() => this.listConfig().filters?.tag);
  protected readonly isGlobal = computed(
    () => this.listConfig().type === 'all' && !this.listConfig().filters,
  );

  protected changeList(event: Event, config: ListConfig) {
    event.preventDefault();
    this.listConfig.set(config);
  }
}
