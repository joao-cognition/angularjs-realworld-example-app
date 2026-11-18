import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppConstants } from '../../core/app-constants';
import { Article, User } from '../../core/models';
import { UserService } from '../../core/user.service';
import { HomeComponent } from './home.component';

const user: User = { email: 'a@b.c', token: 'tok', username: 'alice', bio: null, image: null };
const article = (slug: string): Article => ({
  slug,
  title: slug,
  description: 'd',
  body: 'b',
  tagList: ['t'],
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'bob', bio: null, image: null, following: false },
});

describe('HomeComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function render(signedIn: boolean) {
    if (signedIn) TestBed.inject(UserService).current.set(user);
    const fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const tabs = () => [...el.querySelectorAll<HTMLAnchorElement>('.feed-toggle .nav-link')];
    const active = () =>
      tabs()
        .filter((t) => t.classList.contains('active'))
        .map((t) => t.textContent?.trim());
    const settle = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return { fixture, el, tabs, active, settle };
  }

  function flushArticles(path: string, articles: Article[], count = articles.length) {
    http
      .expectOne((r) => r.url === `${AppConstants.api}${path}`)
      .flush({ articles, articlesCount: count });
  }

  it('anonymous: shows the banner, Global Feed only, and loads popular tags', async () => {
    const { el, tabs, active, settle } = await render(false);
    expect(el.querySelector('.banner h1')?.textContent?.trim()).toBe('conduit');
    expect(el.textContent).toContain('A place to share your knowledge.');
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(['Global Feed']);
    expect(active()).toEqual(['Global Feed']);
    expect(el.textContent).toContain('Loading tags...');

    http.expectOne(`${AppConstants.api}/tags`).flush({ tags: ['dragons', 'angular'] });
    flushArticles('/articles', [article('a1')]);
    await settle();

    const pills = [...el.querySelectorAll('.sidebar .tag-list a.tag-pill')].map((p) =>
      p.textContent?.trim(),
    );
    expect(pills).toEqual(['dragons', 'angular']);
    expect(el.textContent).not.toContain('Loading tags...');
    expect(el.querySelectorAll('.preview-link').length).toBe(1);
  });

  it('shows the empty-tags message when the API has none', async () => {
    const { el, settle } = await render(false);
    http.expectOne(`${AppConstants.api}/tags`).flush({ tags: [] });
    flushArticles('/articles', []);
    await settle();
    expect(el.querySelector('.sidebar .post-preview')?.textContent?.trim()).toBe(
      'No tags are here... yet.',
    );
  });

  it('signed in: hides the banner and starts on Your Feed', async () => {
    const { el, tabs, active } = await render(true);
    http.expectOne(`${AppConstants.api}/tags`).flush({ tags: [] });
    flushArticles('/articles/feed', []);
    expect(el.querySelector('.banner')).toBeNull();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(['Your Feed', 'Global Feed']);
    expect(active()).toEqual(['Your Feed']);
  });

  it('clicking a tag adds an active tag tab and queries by tag; Global Feed clears it', async () => {
    const { el, tabs, active, settle } = await render(false);
    http.expectOne(`${AppConstants.api}/tags`).flush({ tags: ['dragons'] });
    flushArticles('/articles', [article('a1')]);
    await settle();

    el.querySelector<HTMLAnchorElement>('.sidebar a.tag-pill')!.click();
    await settle();
    const req = http.expectOne((r) => r.url === `${AppConstants.api}/articles`);
    expect(req.request.params.get('tag')).toBe('dragons');
    expect(req.request.params.get('offset')).toBe('0');
    req.flush({ articles: [article('d1')], articlesCount: 1 });
    await settle();
    expect(active()).toEqual(['dragons']);
    expect(tabs()[0].classList).not.toContain('active');

    tabs()[0].click();
    await settle();
    const all = http.expectOne((r) => r.url === `${AppConstants.api}/articles`);
    expect(all.request.params.has('tag')).toBe(false);
    all.flush({ articles: [article('a1')], articlesCount: 1 });
    await settle();
    expect(tabs().map((t) => t.textContent?.trim())).toEqual(['Global Feed']);
    expect(active()).toEqual(['Global Feed']);
  });

  it('tab links do not navigate', async () => {
    const { el, settle } = await render(false);
    http.expectOne(`${AppConstants.api}/tags`).flush({ tags: [] });
    flushArticles('/articles', []);
    const event = new MouseEvent('click', { cancelable: true });
    el.querySelector('.feed-toggle .nav-link')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    await settle();
    http
      .expectOne((r) => r.url === `${AppConstants.api}/articles`)
      .flush({ articles: [], articlesCount: 0 });
  });
});
