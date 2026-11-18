export interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

export interface User {
  username: string;
  email: string;
  bio: string | null;
  image: string | null;
  token: string;
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

export interface ListConfig {
  type: 'all' | 'feed';
  filters?: { tag?: string; author?: string; favorited?: string };
}
