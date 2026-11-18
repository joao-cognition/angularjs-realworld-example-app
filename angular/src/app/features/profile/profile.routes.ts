import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  ResolveFn,
  Router,
  Routes,
  UrlMatchResult,
  UrlSegment,
} from '@angular/router';
import { catchError, of } from 'rxjs';
import { Profile } from '../../core/models';
import { ProfileService } from '../../core/profile.service';
import { ProfileArticlesComponent } from './profile-articles.component';
import { ProfileComponent } from './profile.component';

/** Legacy ui-router url '/@:username'. */
export function profileMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  const first = segments[0];
  if (!first || !first.path.startsWith('@') || first.path.length < 2) return null;
  return {
    consumed: [first],
    posParams: { username: new UrlSegment(first.path.slice(1), {}) },
  };
}

/** Legacy 'app.profile' resolve: Profile.get(username), or go home when it fails. */
export const profileResolver: ResolveFn<Profile | RedirectCommand> = (route) => {
  const router = inject(Router);
  return inject(ProfileService)
    .get(route.paramMap.get('username')!)
    .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/')))));
};

function parentProfile(route: ActivatedRouteSnapshot): Profile {
  return route.parent!.data['profile'];
}

/** Legacy ProfileArticlesCtrl page titles. */
export const profileTitle: ResolveFn<string> = (route) => `@${parentProfile(route).username}`;
export const favoritesTitle: ResolveFn<string> = (route) =>
  `Articles favorited by ${parentProfile(route).username}`;

export const PROFILE_ROUTES: Routes = [
  {
    matcher: profileMatcher,
    component: ProfileComponent,
    resolve: { profile: profileResolver },
    children: [
      { path: '', component: ProfileArticlesComponent, title: profileTitle },
      {
        path: 'favorites',
        component: ProfileArticlesComponent,
        title: favoritesTitle,
        data: { favorites: true },
      },
    ],
  },
];
