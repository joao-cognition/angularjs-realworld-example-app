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
  updatedAt: string;
  author: Profile;
}

export type Errors = Record<string, string[]>;

export interface ArticleListConfig {
  type: 'all' | 'feed';
  filters?: { tag?: string; author?: string; favorited?: string };
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface ArticleDraft {
  slug?: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export type AuthType = 'login' | 'register';

export interface Credentials {
  username?: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  email: string;
  username: string;
  bio: string;
  image: string;
  password?: string;
}
