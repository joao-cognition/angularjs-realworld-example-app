import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { AppConstants } from '../../core/app-constants';
import { UserService } from '../../core/user.service';
import { ArticleComponent } from './article.component';
import { makeArticle, makeComment, me } from './article.testing';

const api = AppConstants.api;

describe('ArticleComponent', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<ArticleComponent>;
  let el: HTMLElement;

  async function render(
    article = makeArticle(),
    comments = [makeComment(1, 'bob'), makeComment(2, 'me')],
  ) {
    fixture = TestBed.createComponent(ArticleComponent);
    fixture.componentRef.setInput('article', article);
    el = fixture.nativeElement;
    await fixture.whenStable();
    http.expectOne(`${api}/articles/${article.slug}/comments`).flush({ comments });
    await fixture.whenStable();
  }

  const texts = (sel: string) => [...el.querySelectorAll(sel)].map((e) => e.textContent?.trim());
  const button = (label: RegExp) =>
    [...el.querySelectorAll('button')].filter((b) =>
      label.test(b.textContent ?? ''),
    ) as HTMLButtonElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('renders title, sanitized markdown, tags, comments and the page title', async () => {
    await render(makeArticle({ body: '## Hi\n\n<img src=x onerror="alert(1)">' }));
    expect(el.querySelector('.banner h1')?.textContent).toBe('Hello');
    expect(el.querySelector('.article-content h2')?.textContent).toBe('Hi');
    expect(el.querySelector('.article-content img')).toBeNull();
    expect(texts('.tag-list li')).toEqual(['a', 'b']);
    expect(texts('.card .card-text')).toEqual(['c1', 'c2']);
    expect(TestBed.inject(Title).getTitle()).toBe('Hello — Conduit');
  });

  it('shows the sign-in prompt and follow/favorite buttons to anonymous readers', async () => {
    await render();
    expect(el.textContent).toContain('to add comments on this article.');
    expect(el.querySelector('textarea')).toBeNull();
    expect(button(/Follow bob/)).toHaveLength(2);
    expect(button(/Favorite Article \(3\)/)).toHaveLength(2);
    expect(el.querySelectorAll('.mod-options')).toHaveLength(0);
  });

  it('lets a signed-in user post a comment and delete their own', async () => {
    TestBed.inject(UserService).current.set(me);
    await render();
    expect(el.querySelectorAll('.mod-options')).toHaveLength(1);

    const textarea = el.querySelector('textarea')!;
    textarea.value = 'new one';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const post = http.expectOne(`${api}/articles/hello/comments`);
    expect(post.request.body).toEqual({ comment: { body: 'new one' } });
    post.flush({ comment: makeComment(3, 'me', 'new one') });
    await fixture.whenStable();
    expect(texts('.card .card-text')).toEqual(['new one', 'c1', 'c2']);
    expect(textarea.value).toBe('');

    (el.querySelector('.mod-options i') as HTMLElement).click();
    const del = http.expectOne(`${api}/articles/hello/comments/3`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});
    await fixture.whenStable();
    expect(texts('.card .card-text')).toEqual(['c1', 'c2']);
  });

  it('shows comment errors from the API', async () => {
    TestBed.inject(UserService).current.set(me);
    await render();
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    http
      .expectOne(`${api}/articles/hello/comments`)
      .flush(
        { errors: { body: ["can't be blank"] } },
        { status: 422, statusText: 'Unprocessable' },
      );
    await fixture.whenStable();
    expect(texts('.error-messages li')).toEqual(["body can't be blank"]);
    expect(el.querySelector('fieldset')?.disabled).toBe(false);
  });

  it('updates both action bars after favorite and follow', async () => {
    TestBed.inject(UserService).current.set(me);
    await render();
    button(/Favorite Article/)[0].click();
    http
      .expectOne(`${api}/articles/hello/favorite`)
      .flush({ article: makeArticle({ favorited: true, favoritesCount: 4, body: 'raw' }) });
    await fixture.whenStable();
    expect(button(/Unfavorite Article \(4\)/)).toHaveLength(2);
    expect(el.querySelector('.article-content h2')?.textContent).toBe('Hi');

    button(/Follow bob/)[0].click();
    http
      .expectOne(`${api}/profiles/bob/follow`)
      .flush({ profile: { username: 'bob', bio: null, image: null, following: true } });
    await fixture.whenStable();
    expect(button(/Unfollow bob/)).toHaveLength(2);
  });

  it('shows edit/delete to the author and goes home after deleting', async () => {
    TestBed.inject(UserService).current.set(me);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await render(
      makeArticle({ author: { username: 'me', bio: null, image: null, following: false } }),
    );
    expect(texts('a.btn').filter((t) => t?.includes('Edit Article'))).toHaveLength(2);
    expect(button(/Follow/)).toHaveLength(0);
    const edit = el.querySelector('a.btn-outline-secondary') as HTMLAnchorElement;
    expect(edit.getAttribute('href')).toBe('/editor/hello');

    button(/Delete Article/)[0].click();
    await fixture.whenStable();
    expect(button(/Delete Article/)[0].classList).toContain('disabled');
    const del = http.expectOne(`${api}/articles/hello`);
    expect(del.request.method).toBe('DELETE');
    del.flush({});
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
