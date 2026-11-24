import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { AppConstants } from './app.constants';
import { Article, Profile } from './models';

/** `<page> — Conduit`, with the article title / profile name when the route resolved one. */
@Injectable({ providedIn: 'root' })
export class ConduitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const article = route.data['article'] as Article | undefined;
    const profile = route.data['profile'] as Profile | undefined;

    let page = this.buildTitle(snapshot);
    if (article) {
      page = article.title;
    } else if (profile) {
      page =
        route.data['tab'] === 'favorites'
          ? `Articles favorited by ${profile.username}`
          : `@${profile.username}`;
    }
    this.title.setTitle(page ? `${page} \u2014 ${AppConstants.appName}` : AppConstants.appName);
  }
}
