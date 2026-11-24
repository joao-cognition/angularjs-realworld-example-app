import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { APP_CONSTANTS } from './app.constants';

/** Route `data.title` is either a static string or derived from the activated snapshot (e.g. resolved data). */
export type RouteTitle = string | ((route: ActivatedRouteSnapshot) => string);

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly appName = inject(APP_CONSTANTS).appName;

  /** Sets the document title to `<title> — Conduit`, or just `Conduit`. */
  setPageTitle(title?: string | null): void {
    this.title.setTitle(title ? `${title} \u2014 ${this.appName}` : this.appName);
  }

  /** Mirrors the legacy `$stateChangeSuccess` listener: update the title after every navigation. */
  listen(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        const title = route.data['title'] as RouteTitle | undefined;
        this.setPageTitle(typeof title === 'function' ? title(route) : title);
      });
  }
}
