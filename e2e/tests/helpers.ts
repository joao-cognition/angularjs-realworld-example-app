import { APIRequestContext, expect, Page, test as base, TestInfo } from '@playwright/test';

export const API = process.env.CONDUIT_API ?? 'http://localhost:8080';
export const JWT_KEY = 'jwtToken';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token: string;
}

export interface ApiArticle {
  slug: string;
  title: string;
  description: string;
  favorited: boolean;
  favoritesCount: number;
  author: { username: string; following: boolean };
}

export const isLegacy = (info: TestInfo) => info.project.name === 'legacy';

/** Logical route (`/article/x`) -> app URL (`/#/article/x` for the hash-routed legacy app). */
export const route = (info: TestInfo, path: string) => (isLegacy(info) ? `/#${path}` : path);

export function uniqueName(prefix = 'qa'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export async function apiRegister(request: APIRequestContext, prefix = 'qa'): Promise<TestUser> {
  const username = uniqueName(prefix);
  const user = {
    username,
    email: `${username}@example.com`,
    password: 'Passw0rd!123',
  };
  const res = await request.post(`${API}/users`, { data: { user } });
  expect(res.ok(), `register ${username}: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  return { ...user, token: body.user.token };
}

export async function apiCreateArticle(
  request: APIRequestContext,
  user: TestUser,
  overrides: Partial<{
    title: string;
    description: string;
    body: string;
    tagList: string[];
  }> = {},
): Promise<ApiArticle> {
  const title = overrides.title ?? `QA article ${uniqueName('')}`;
  const res = await request.post(`${API}/articles`, {
    headers: { Authorization: `Token ${user.token}` },
    data: {
      article: {
        title,
        description: overrides.description ?? 'Created by the E2E suite',
        body: overrides.body ?? 'Hello **world**',
        tagList: overrides.tagList ?? [],
      },
    },
  });
  expect(res.ok(), `create article: ${res.status()} ${await res.text()}`).toBeTruthy();
  return (await res.json()).article;
}

/** An article by someone else (the public demo content), for favorite/follow/comment flows. */
export async function demoArticle(request: APIRequestContext): Promise<ApiArticle> {
  const res = await request.get(`${API}/articles?author=conduitdemo&limit=20`);
  const { articles } = (await res.json()) as { articles: ApiArticle[] };
  const article = articles[0];
  expect(article, 'public demo article').toBeTruthy();
  return article!;
}

/** Start the page already signed in as `user` (JWT in localStorage before the app boots). */
export async function signInWithToken(page: Page, user: TestUser): Promise<void> {
  await page.addInitScript(
    ([key, token]) => {
      if (!sessionStorage.getItem('__e2e_seeded')) {
        localStorage.setItem(key, token);
        sessionStorage.setItem('__e2e_seeded', '1');
      }
    },
    [JWT_KEY, user.token],
  );
}

export async function expectRoute(page: Page, info: TestInfo, path: string): Promise<void> {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = isLegacy(info)
    ? new RegExp(`#${escaped}$`)
    : new RegExp(`^[^#]*://[^/]+${escaped}$`);
  await expect(page).toHaveURL(pattern);
}

/** Collects console errors and uncaught exceptions for the page under test. */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await use(errors);
  },
});

export { expect };
