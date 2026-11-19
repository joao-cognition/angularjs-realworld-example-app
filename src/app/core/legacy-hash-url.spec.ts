import { legacyHashUrl } from './legacy-hash-url';

describe('legacyHashUrl', () => {
  it('maps legacy article and profile links to paths', () => {
    expect(legacyHashUrl('#/article/example-slug')).toBe('/article/example-slug');
    expect(legacyHashUrl('#/@jake/favorites')).toBe('/@jake/favorites');
    expect(legacyHashUrl('#/')).toBe('/');
  });

  it('leaves ordinary fragments alone', () => {
    expect(legacyHashUrl('')).toBeNull();
    expect(legacyHashUrl('#heading')).toBeNull();
  });
});
