import { Pipe, PipeTransform } from '@angular/core';
import { Marked } from 'marked';

const escapeHtml = (html: string) =>
  html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Escapes raw HTML in the source, matching the legacy `marked(body, { sanitize: true })`.
const markdown = new Marked({
  async: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
  },
});

/** Renders markdown to HTML; bind with `[innerHTML]` so Angular's sanitizer also applies. */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? (markdown.parse(value) as string) : '';
  }
}
