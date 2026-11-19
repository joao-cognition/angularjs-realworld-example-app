import { AvatarPipe, DEFAULT_AVATAR } from './avatar.pipe';

describe('AvatarPipe', () => {
  const pipe = new AvatarPipe();

  it('keeps a provided image', () => {
    expect(pipe.transform('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  it('falls back for empty or missing images', () => {
    expect(pipe.transform('')).toBe(DEFAULT_AVATAR);
    expect(pipe.transform(null)).toBe(DEFAULT_AVATAR);
    expect(pipe.transform(undefined)).toBe(DEFAULT_AVATAR);
  });
});
