import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const transform = (md: string) =>
    TestBed.runInInjectionContext(() => new MarkdownPipe()).transform(md);

  it('renders markdown to HTML', () => {
    expect(transform('# Hi\n\n**bold**')).toContain('<strong>bold</strong>');
  });

  it('strips unsafe HTML', () => {
    const html = transform('<img src="x" onerror="alert(1)"><script>alert(1)</script>');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });
});
