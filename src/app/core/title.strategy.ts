import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { APP_CONFIG } from './app-config';

@Injectable({ providedIn: 'root' })
export class ConduitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly appName = inject(APP_CONFIG).appName;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.setPageTitle(this.buildTitle(snapshot));
  }

  setPageTitle(title?: string): void {
    this.title.setTitle(title ? `${title} \u2014 ${this.appName}` : this.appName);
  }
}
