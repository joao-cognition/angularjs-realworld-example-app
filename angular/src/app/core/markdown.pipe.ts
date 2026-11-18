import { Pipe, PipeTransform } from '@angular/core';
import { Marked } from 'marked';

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Matches the legacy `marked(body, { sanitize: true })`: Markdown renders, raw HTML is shown as text.
const md = new Marked({ renderer: { html: ({ text }) => escapeHtml(text) } });

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(body: string | null | undefined): string {
    return md.parse(body ?? '', { async: false });
  }
}
