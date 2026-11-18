import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders markdown to HTML', () => {
    const html = renderMarkdown('## Title\n\nSome **bold** text.');
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('escapes raw HTML like legacy marked({ sanitize: true })', () => {
    const html = renderMarkdown('<script>window.x = 1</script>\n\nhi <b onclick="x()">b</b>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b ');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&lt;b onclick=&quot;x()&quot;&gt;');
  });

  it('handles an empty body', () => {
    expect(renderMarkdown(null)).toBe('');
  });
});
