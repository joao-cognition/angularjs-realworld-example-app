import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { AppConstants } from './app.constants';

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.setPageTitle(this.buildTitle(snapshot));
  }

  setPageTitle(title?: string): void {
    this.title.setTitle(title ? `${title} \u2014 ${AppConstants.appName}` : AppConstants.appName);
  }
}
