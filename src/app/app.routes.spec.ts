import { UrlSegment } from '@angular/router';
import { profileMatcher } from './app.routes';

const match = (...paths: string[]) =>
  profileMatcher(
    paths.map((p) => new UrlSegment(p, {})),
    {} as never,
    {} as never,
  );

describe('profileMatcher', () => {
  it('matches /@username and leaves child segments', () => {
    const result = match('@jake', 'favorites');
    expect(result?.consumed.map((s) => s.path)).toEqual(['@jake']);
    expect(result?.posParams?.['username'].path).toBe('jake');
  });

  it('ignores other paths', () => {
    expect(match('article', 'x')).toBeNull();
    expect(match('@')).toBeNull();
  });
});
