import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { AppConstants } from './app.constants';

export type PageTitleFn = (route: ActivatedRouteSnapshot) => string;

/** "<page> — Conduit", where a route may compute <page> from resolved data via `data.pageTitle`. */
@Injectable({ providedIn: 'root' })
export class ConduitTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    let leaf = snapshot.root;
    while (leaf.firstChild) leaf = leaf.firstChild;
    const fn = leaf.data['pageTitle'] as PageTitleFn | undefined;
    const page = fn ? fn(leaf) : this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} \u2014 ${AppConstants.appName}` : AppConstants.appName);
  }
}
