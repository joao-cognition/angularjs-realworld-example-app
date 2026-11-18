import { expect, Page, TestInfo, APIRequestContext } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const API = 'https://api.realworld.show/api';
export const JWT_KEY = 'jwtToken';

/** Logical route ('/login', '/@bob', '/article/x') -> URL for the app under test. */
export function route(testInfo: TestInfo, logical: string): string {
  const p = logical.startsWith('/') ? logical : `/${logical}`;
  return testInfo.project.name === 'legacy' ? `/#${p}` : p;
}

/** Path the browser is on, normalised to a logical route for both apps. */
export function logicalPath(page: Page): string {
  const u = new URL(page.url());
  const raw = u.hash.startsWith('#/') ? u.hash.slice(1) : u.pathname;
  return decodeURIComponent(raw.replace(/\/$/, '') || '/');
}

export async function go(page: Page, testInfo: TestInfo, logical: string) {
  await page.goto(route(testInfo, logical));
}

export async function expectRoute(page: Page, logical: string | RegExp) {
  await expect.poll(() => logicalPath(page)).toEqual(
    typeof logical === 'string' ? logical : expect.stringMatching(logical),
  );
}

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token: string;
}

export function uniqueName(prefix = 'parity'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Registers a fresh user through the API so specs never share state. */
export async function createUser(request: APIRequestContext, prefix = 'parity'): Promise<TestUser> {
  const username = uniqueName(prefix);
  const user = { username, email: `${username}@example.com`, password: 'Parity-pass-123' };
  const res = await request.post(`${API}/users`, { data: { user } });
  expect(res.ok(), `register ${username}: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  return { ...user, token: body.user.token };
}

export async function createArticle(
  request: APIRequestContext,
  user: TestUser,
  article: { title: string; description: string; body: string; tagList?: string[] },
) {
  const res = await request.post(`${API}/articles`, {
    data: { article: { tagList: [], ...article } },
    headers: { Authorization: `Token ${user.token}` },
  });
  expect(res.ok(), `create article: ${res.status()} ${await res.text()}`).toBeTruthy();
  return (await res.json()).article;
}

/** Both apps keep the JWT in localStorage['jwtToken']; set it, then load the route. */
export async function signInAs(page: Page, testInfo: TestInfo, user: TestUser, logical = '/') {
  await page.goto(route(testInfo, '/'));
  await page.evaluate(([k, t]) => localStorage.setItem(k, t), [JWT_KEY, user.token]);
  await page.goto(route(testInfo, logical));
  await page.reload();
  await expect(header(page).getByRole('link', { name: user.username })).toBeVisible();
}

export function header(page: Page) {
  return page.locator('nav.navbar');
}

export function previews(page: Page) {
  return page.locator('.article-preview').filter({ has: page.locator('.preview-link') });
}

export async function waitForArticles(page: Page) {
  await expect(page.getByText('Loading articles...')).toBeHidden();
  await expect(
    previews(page).first().or(page.getByText('No articles are here... yet.').filter({ visible: true })),
  ).toBeVisible();
}

/** The visible active tab in the home feed toggle. */
export function activeTab(page: Page) {
  return page.locator('.feed-toggle .nav-link.active').filter({ visible: true });
}

/** The visible active tab on a profile page. */
export function activeProfileTab(page: Page) {
  return page.locator('.articles-toggle .nav-link.active').filter({ visible: true });
}

/**
 * api.realworld.show sandboxes data per user: a user sees the shared seed articles plus
 * only what they created. Cross-user flows therefore use seed articles and authors.
 */
export async function seedArticles(request: APIRequestContext) {
  const res = await request.get(`${API}/articles?limit=20`);
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as {
    articles: Array<{ slug: string; title: string; tagList: string[]; favoritesCount: number; author: { username: string } }>;
    articlesCount: number;
  };
}

export async function apiGet(request: APIRequestContext, pathname: string, user?: TestUser) {
  const res = await request.get(`${API}${pathname}`, {
    headers: user ? { Authorization: `Token ${user.token}` } : {},
  });
  expect(res.ok(), `GET ${pathname}: ${res.status()}`).toBeTruthy();
  return res.json();
}

/** Full-page screenshot stored per app; compose-report.mjs pairs them side by side. */
export async function snap(page: Page, testInfo: TestInfo, name: string) {
  const dir = path.join(__dirname, '..', 'report', 'screens', testInfo.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}
