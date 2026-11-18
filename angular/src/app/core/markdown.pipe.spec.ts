import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const md = new MarkdownPipe();

  it('renders Markdown', () => {
    const html = md.transform('# Hi\n\nSome **bold** [link](https://example.com)');
    expect(html).toContain('<h1>Hi</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it('escapes raw HTML like the legacy sanitize option', () => {
    const html = md.transform('Raw <b>html</b> and <script>alert(1)</script>');
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;b&gt;html&lt;/b&gt;');
  });
});
