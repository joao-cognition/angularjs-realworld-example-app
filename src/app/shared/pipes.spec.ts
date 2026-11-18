import { TestBed } from '@angular/core/testing';
import { DefaultImagePipe } from './default-image.pipe';
import { MarkdownPipe } from './markdown.pipe';

describe('pipes', () => {
  it('markdown renders lists and strips scripts', () => {
    const pipe = TestBed.runInInjectionContext(() => new MarkdownPipe());
    const html = pipe.transform('# Title\n\n- one\n- two\n\n<script>alert(1)</script>');
    expect(html).toContain('<h1');
    expect(html).toContain('<li>one</li>');
    expect(html).not.toContain('<script');
  });

  it('defaultImage falls back to the default avatar', () => {
    const pipe = new DefaultImagePipe();
    expect(pipe.transform(null)).toBe('/assets/default-avatar.svg');
    expect(pipe.transform('')).toBe('/assets/default-avatar.svg');
    expect(pipe.transform('https://x/y.png')).toBe('https://x/y.png');
  });
});
