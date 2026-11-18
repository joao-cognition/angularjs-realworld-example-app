import { UrlSegment } from '@angular/router';
import { profileMatcher } from './app.routes';

const segments = (...paths: string[]) => paths.map((p) => new UrlSegment(p, {}));

describe('profileMatcher', () => {
  it('matches /@username and extracts the username', () => {
    const result = profileMatcher(segments('@alice', 'favorites'));
    expect(result?.consumed.map((s) => s.path)).toEqual(['@alice']);
    expect(result?.posParams?.['username'].path).toBe('alice');
  });

  it('ignores other paths', () => {
    expect(profileMatcher(segments('alice'))).toBeNull();
    expect(profileMatcher(segments('@'))).toBeNull();
    expect(profileMatcher([])).toBeNull();
  });
});
