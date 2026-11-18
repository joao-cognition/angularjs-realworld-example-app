import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { AppConstants } from './app-constants';

export function pageTitle(title?: string | null): string {
  return title ? `${title} \u2014 ${AppConstants.appName}` : AppConstants.appName;
}

/** Legacy $rootScope.setPageTitle: "<state title> — Conduit". Pages can override via PageTitle. */
@Injectable({ providedIn: 'root' })
export class ConduitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(pageTitle(this.buildTitle(snapshot)));
  }
}

@Injectable({ providedIn: 'root' })
export class PageTitle {
  private readonly title = inject(Title);

  set(title?: string | null): void {
    this.title.setTitle(pageTitle(title));
  }
}
