import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
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

export const PROFILE_ROUTES: Routes = [
  {
    matcher: profileMatcher,
    children: [
      { path: '', component: ProfileComponent, title: 'Profile' },
      { path: 'favorites', component: ProfileComponent, title: 'Favorites', data: { favorites: true } },
    ],
  },
];
