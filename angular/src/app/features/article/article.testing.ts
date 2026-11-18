import { Article, Comment, User } from '../../core/models';

export const me: User = { email: 'me@x.io', token: 'tok', username: 'me', bio: null, image: null };

export function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: 'hello',
    title: 'Hello',
    description: 'd',
    body: '## Hi\n\n**there**',
    tagList: ['a', 'b'],
    createdAt: '2024-01-05T10:00:00.000Z',
    updatedAt: '2024-01-05T10:00:00.000Z',
    favorited: false,
    favoritesCount: 3,
    author: { username: 'bob', bio: null, image: null, following: false },
    ...overrides,
  };
}

export function makeComment(id: number, username: string, body = `c${id}`): Comment {
  return {
    id,
    body,
    createdAt: '2024-02-01T00:00:00.000Z',
    author: { username, bio: null, image: null, following: false },
  };
}
