import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';

/** Renders article markdown with `marked` and strips unsafe HTML with Angular's sanitizer. */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(content: string | null | undefined): string {
    const html = marked.parse(content ?? '', { async: false });
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}
