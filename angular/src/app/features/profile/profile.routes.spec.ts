import { UrlSegment } from '@angular/router';
import { profileMatcher } from './profile.routes';

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
