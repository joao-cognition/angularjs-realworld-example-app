import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { APP_NAME } from './api.config';

/** Page titles read `<title> — Conduit`, matching the AngularJS `setPageTitle`. */
@Injectable({ providedIn: 'root' })
export class ConduitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.setTitle(this.buildTitle(snapshot));
  }

  setTitle(page?: string | null): void {
    this.title.setTitle(page ? `${page} \u2014 ${APP_NAME}` : APP_NAME);
  }
}
