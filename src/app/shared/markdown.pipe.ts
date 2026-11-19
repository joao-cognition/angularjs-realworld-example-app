import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(markdown: string | null | undefined): string {
    const html = marked.parse(markdown ?? '', { async: false });
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
