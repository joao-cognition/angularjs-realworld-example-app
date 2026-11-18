import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ArticleListComponent } from './article-list.component';

const API = 'https://api.realworld.show/api';

describe('ArticleListComponent pagination', () => {
  it('shows one page link per page and requests the clicked page offset', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ArticleListComponent);
    fixture.componentRef.setInput('limit', 10);
    fixture.componentRef.setInput('config', { type: 'all', filters: {} });
    fixture.detectChanges();

    const first = http.expectOne((r) => r.url === `${API}/articles`);
    expect(first.request.params.get('offset')).toBe('0');
    first.flush({ articles: [], articlesCount: 25 });
    fixture.detectChanges();

    const links: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.page-item'));
    expect(links.map((l) => l.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(links[0].classList).toContain('active');

    links[2].click();
    fixture.detectChanges();
    const third = http.expectOne((r) => r.url === `${API}/articles`);
    expect(third.request.params.get('limit')).toBe('10');
    expect(third.request.params.get('offset')).toBe('20');
    third.flush({ articles: [], articlesCount: 25 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.page-item.active').textContent.trim()).toBe('3');
  });
});
