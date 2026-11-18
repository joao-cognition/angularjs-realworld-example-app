import { pageTitle } from './title.strategy';

describe('pageTitle', () => {
  it('formats like the legacy setPageTitle', () => {
    expect(pageTitle('Home')).toBe('Home \u2014 Conduit');
    expect(pageTitle()).toBe('Conduit');
  });
});
