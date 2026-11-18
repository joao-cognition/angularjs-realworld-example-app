import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api.config';
import { ArticlesService } from './articles.service';
import { CommentsService } from './comments.service';
import { ProfileService } from './profile.service';
import { TagsService } from './tags.service';

describe('API services', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries the global list with filters, limit and offset', () => {
    TestBed.inject(ArticlesService)
      .query({ type: 'all', filters: { tag: 'dragons' } }, 10, 20)
      .subscribe();
    const req = http.expectOne((r) => r.url === `${API_URL}/articles`);
    expect(req.request.params.get('tag')).toBe('dragons');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('offset')).toBe('20');
    req.flush({ articles: [], articlesCount: 0 });
  });

  it('queries the personal feed', () => {
    TestBed.inject(ArticlesService).query({ type: 'feed', filters: {} }, 10, 0).subscribe();
    http
      .expectOne((r) => r.url === `${API_URL}/articles/feed`)
      .flush({ articles: [], articlesCount: 0 });
  });

  it('creates with POST and updates with PUT (slug not sent in the body)', () => {
    const articles = TestBed.inject(ArticlesService);
    const draft = { title: 't', description: 'd', body: 'b', tagList: ['x'] };
    articles.save(draft).subscribe();
    expect(http.expectOne({ method: 'POST', url: `${API_URL}/articles` }).request.body).toEqual({
      article: draft,
    });
    articles.save({ ...draft, slug: 'my-slug' }).subscribe();
    expect(
      http.expectOne({ method: 'PUT', url: `${API_URL}/articles/my-slug` }).request.body,
    ).toEqual({
      article: draft,
    });
  });

  it('favorites, comments, follows and tags hit the RealWorld endpoints', () => {
    TestBed.inject(ArticlesService).favorite('s').subscribe();
    http.expectOne({ method: 'POST', url: `${API_URL}/articles/s/favorite` });
    TestBed.inject(ArticlesService).unfavorite('s').subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/articles/s/favorite` });
    TestBed.inject(CommentsService).add('s', 'hello').subscribe();
    expect(
      http.expectOne({ method: 'POST', url: `${API_URL}/articles/s/comments` }).request.body,
    ).toEqual({ comment: { body: 'hello' } });
    TestBed.inject(CommentsService).destroy(7, 's').subscribe();
    http.expectOne({ method: 'DELETE', url: `${API_URL}/articles/s/comments/7` });
    TestBed.inject(ProfileService).follow('bob').subscribe();
    http.expectOne({ method: 'POST', url: `${API_URL}/profiles/bob/follow` });
    let tags: string[] = [];
    TestBed.inject(TagsService)
      .getAll()
      .subscribe((t) => (tags = t));
    http.expectOne(`${API_URL}/tags`).flush({ tags: ['a', 'b'] });
    expect(tags).toEqual(['a', 'b']);
  });
});
