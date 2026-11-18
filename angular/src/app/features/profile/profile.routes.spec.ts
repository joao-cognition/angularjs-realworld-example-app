import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of, throwError } from 'rxjs';
import { Profile } from '../../core/models';
import { ProfileService } from '../../core/profile.service';
import { favoritesTitle, profileMatcher, profileResolver, profileTitle } from './profile.routes';

describe('profileMatcher', () => {
  it('matches /@username and exposes the username', () => {
    const res = profileMatcher([new UrlSegment('@alice', {}), new UrlSegment('favorites', {})]);
    expect(res?.consumed.length).toBe(1);
    expect(res?.posParams?.['username'].path).toBe('alice');
  });

  it('ignores other paths', () => {
    expect(profileMatcher([new UrlSegment('alice', {})])).toBeNull();
    expect(profileMatcher([new UrlSegment('@', {})])).toBeNull();
    expect(profileMatcher([])).toBeNull();
  });
});

const alice: Profile = { username: 'alice', bio: 'hi', image: 'a.png', following: false };

function resolve(get: (u: string) => Observable<Profile>) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ProfileService, useValue: { get } }],
  });
  const route = { paramMap: convertToParamMap({ username: 'alice' }) } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    firstValueFrom(
      profileResolver(route, {} as RouterStateSnapshot) as Observable<Profile | RedirectCommand>,
    ),
  );
}

describe('profileResolver', () => {
  it('resolves the profile for the url username', async () => {
    const get = vi.fn(() => of(alice));
    expect(await resolve(get)).toEqual(alice);
    expect(get).toHaveBeenCalledWith('alice');
  });

  it('redirects home when the profile does not exist', async () => {
    const res = await resolve(() => throwError(() => new Error('404')));
    expect(res).toBeInstanceOf(RedirectCommand);
    expect(TestBed.inject(Router).serializeUrl((res as RedirectCommand).redirectTo as never)).toBe(
      '/',
    );
  });
});

describe('profile titles', () => {
  const child = { parent: { data: { profile: alice } } } as unknown as ActivatedRouteSnapshot;
  it('match the legacy page titles', () => {
    expect(profileTitle(child, {} as RouterStateSnapshot)).toBe('@alice');
    expect(favoritesTitle(child, {} as RouterStateSnapshot)).toBe('Articles favorited by alice');
  });
});
