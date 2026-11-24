import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const pipe = new MarkdownPipe();

  it('renders markdown', () => {
    expect(pipe.transform('# Hi\n\n**bold**')).toContain('<strong>bold</strong>');
  });

  it('escapes raw HTML like the legacy sanitize option', () => {
    const html = pipe.transform('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles empty input', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('keeps task-list state visible as text', () => {
    const html = pipe.transform('- [x] done\n- [ ] todo');
    expect(html).toContain('[x] done');
    expect(html).toContain('[ ] todo');
    expect(html).not.toContain('<input');
  });
});
