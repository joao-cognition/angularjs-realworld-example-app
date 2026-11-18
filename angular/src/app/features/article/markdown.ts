import { Marked } from 'marked';

const escapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => escapes[c]);

/**
 * Legacy rendered with marked(body, { sanitize: true }), which escapes raw HTML in the markdown.
 * marked dropped `sanitize`, so raw HTML tokens are escaped here; Angular's [innerHTML] sanitizer
 * then strips anything unsafe (e.g. javascript: links) from the generated markup.
 */
const md = new Marked({
  async: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
  },
});

export function renderMarkdown(body: string | null | undefined): string {
  return md.parse(body ?? '') as string;
}
