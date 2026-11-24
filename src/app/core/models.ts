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
  id: number | string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: Profile;
}

export interface ArticleListConfig {
  type: 'all' | 'feed';
  filters?: {
    tag?: string;
    author?: string;
    favorited?: string;
  };
}

export interface ArticleListResponse {
  articles: Article[];
  articlesCount: number;
}

export type ArticleDraft = Pick<Article, 'title' | 'description' | 'body' | 'tagList'> & {
  slug?: string;
};

export type Errors = Record<string, string[]>;
