import { UrlSegment } from '@angular/router';
import { profileMatcher } from './app.routes';

describe('profileMatcher', () => {
  const seg = (...paths: string[]) => paths.map((p) => new UrlSegment(p, {}));

  it('matches /@username and exposes the username param', () => {
    const result = profileMatcher(seg('@alice', 'favorites'));
    expect(result?.consumed.length).toBe(1);
    expect(result?.posParams?.['username'].path).toBe('alice');
  });

  it('ignores other paths', () => {
    expect(profileMatcher(seg('article', 'x'))).toBeNull();
    expect(profileMatcher(seg('@'))).toBeNull();
  });
});
