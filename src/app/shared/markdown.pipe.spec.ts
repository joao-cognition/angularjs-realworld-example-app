import { TestBed } from '@angular/core/testing';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const render = (md: string) =>
    TestBed.runInInjectionContext(() => new MarkdownPipe()).transform(md);

  it('renders markdown', () => {
    expect(render('# Hi\n\n**bold**')).toContain('<h1>Hi</h1>');
    expect(render('**bold**')).toContain('<strong>bold</strong>');
  });

  it('strips scripts, event handlers and javascript: links', () => {
    const html = render(
      '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\n[x](javascript:alert(1))',
    );
    expect(html).not.toContain('<script');
    expect(html).not.toContain('onerror');
    expect(html).not.toMatch(/href="javascript:/);
  });
});
