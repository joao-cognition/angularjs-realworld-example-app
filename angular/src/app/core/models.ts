export interface User {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: string | null;
}

export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

export interface Comment {
  id: number;
  body: string;
  createdAt: string;
  author: Profile;
}

export type Errors = Record<string, string[]>;

export interface ArticleQuery {
  type?: 'all' | 'feed';
  filters?: { tag?: string; author?: string; favorited?: string; limit?: number; offset?: number };
}

export interface ListConfig extends ArticleQuery {
  currentPage?: number;
}

export interface ArticlesPage {
  articles: Article[];
  articlesCount: number;
}
