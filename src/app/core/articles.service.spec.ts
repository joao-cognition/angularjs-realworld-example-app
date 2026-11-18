import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ArticlesService } from './articles.service';

const API = 'https://api.realworld.show/api';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArticlesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries /articles with filters as params', () => {
    service.query({ type: 'all', filters: { tag: 'dragons', limit: 10, offset: 20 } }).subscribe();
    const req = http.expectOne((r) => r.url === `${API}/articles`);
    expect(req.request.params.toString()).toBe('tag=dragons&limit=10&offset=20');
    req.flush({ articles: [], articlesCount: 0 });
  });

  it('queries /articles/feed for the feed', () => {
    service.query({ type: 'feed', filters: {} }).subscribe();
    http.expectOne(`${API}/articles/feed`).flush({ articles: [], articlesCount: 0 });
  });

  it('creates with POST and updates with PUT, without sending the slug in the body', () => {
    const draft = { title: 't', description: 'd', body: 'b', tagList: ['x'] };
    service.save(draft).subscribe();
    const create = http.expectOne({ method: 'POST', url: `${API}/articles` });
    expect(create.request.body).toEqual({ article: draft });
    create.flush({ article: {} });

    service.save({ ...draft, slug: 'my-slug' }).subscribe();
    const update = http.expectOne({ method: 'PUT', url: `${API}/articles/my-slug` });
    expect(update.request.body).toEqual({ article: draft });
    update.flush({ article: {} });
  });

  it('rejects an empty slug without a request', () => {
    const error = vi.fn();
    service.get('  ').subscribe({ error });
    expect(error).toHaveBeenCalled();
  });

  it('favorites with POST and unfavorites with DELETE', () => {
    service.favorite('s').subscribe();
    http.expectOne({ method: 'POST', url: `${API}/articles/s/favorite` }).flush({ article: {} });
    service.unfavorite('s').subscribe();
    http.expectOne({ method: 'DELETE', url: `${API}/articles/s/favorite` }).flush({ article: {} });
  });
});
