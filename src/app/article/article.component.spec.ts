import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Article, User } from '../core/models';
import { UserService } from '../core/user.service';
import { ArticleComponent } from './article.component';

const API = 'https://api.realworld.show/api';
const user: User = { email: 'a@b.c', token: 't', username: 'alice', bio: null, image: null };
const article: Article = {
  slug: 's',
  title: 'T',
  description: 'd',
  body: 'b',
  tagList: [],
  createdAt: '2020-01-01',
  updatedAt: '2020-01-01',
  favorited: false,
  favoritesCount: 0,
  author: { username: 'bob', bio: null, image: null, following: false },
};

describe('ArticleComponent comment form', () => {
  it('posts the comment via XHR instead of a native form submit', async () => {
    const current = signal<User | null>(user);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: UserService,
          useValue: { current, isAuthenticated: () => current() !== null },
        },
      ],
    });
    const fixture = TestBed.createComponent(ArticleComponent);
    fixture.componentRef.setInput('article', article);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/articles/s/comments`).flush({ comments: [] });
    fixture.detectChanges();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form.comment-form');
    const textarea: HTMLTextAreaElement = form.querySelector('textarea')!;
    textarea.value = 'Nice post';
    textarea.dispatchEvent(new Event('input'));
    const submit = new Event('submit', { cancelable: true });
    form.dispatchEvent(submit);

    expect(submit.defaultPrevented).toBe(true);
    const req = http.expectOne({ method: 'POST', url: `${API}/articles/s/comments` });
    expect(req.request.body).toEqual({ comment: { body: 'Nice post' } });
    http.verify({ ignoreCancelled: true });
  });
});
