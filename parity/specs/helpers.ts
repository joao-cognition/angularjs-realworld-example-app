import { expect, type APIRequestContext, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const API = process.env.API_BASE || 'https://api.realworld.show/api';

export const isLegacy = (info: TestInfo) => info.project.name === 'legacy';

/**
 * Map a logical (RealWorld spec) route to the URL each app uses.
 * Legacy: hashbang routing and `/@username` profiles. Angular: HTML5 routing, `/profile/:username`.
 */
export function route(info: TestInfo, logical: string): string {
  if (!isLegacy(info)) return logical;
  const legacy = logical.replace(/^\/profile\/([^/]+)/, '/@$1').replace(/^\/editor$/, '/editor/');
  return '/#' + legacy;
}

export async function go(page: Page, info: TestInfo, logical: string) {
  await page.goto(route(info, logical));
}

export function urlMatcher(info: TestInfo, logicalRegex: string): RegExp {
  if (isLegacy(info)) {
    return new RegExp('#' + logicalRegex.replace('/profile/', '/@'));
  }
  return new RegExp(`^[^#]*${logicalRegex}`);
}

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token?: string;
}

export function uniqueUser(info: TestInfo, prefix = 'par'): TestUser {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const tag = isLegacy(info) ? 'l' : 'a';
  const username = `${prefix}${tag}${id}`;
  return { username, email: `${username}@example.com`, password: 'Parity-pass-123' };
}

export async function registerViaApi(request: APIRequestContext, user: TestUser): Promise<TestUser> {
  const res = await request.post(`${API}/users`, { data: { user } });
  expect(res.ok(), `register ${user.username}: ${res.status()}`).toBeTruthy();
  const body = await res.json();
  return { ...user, token: body.user.token };
}

export async function createArticleViaApi(
  request: APIRequestContext,
  token: string,
  article: { title: string; description: string; body: string; tagList?: string[] },
) {
  const res = await request.post(`${API}/articles`, {
    data: { article },
    headers: { Authorization: `Token ${token}` },
  });
  expect(res.ok(), `create article: ${res.status()}`).toBeTruthy();
  return (await res.json()).article as { slug: string; title: string };
}

/** Log in by seeding the shared `jwtToken` localStorage key both apps read on boot. */
export async function loginWithToken(page: Page, info: TestInfo, token: string, logical = '/') {
  await page.goto(route(info, '/'));
  await page.evaluate(t => localStorage.setItem('jwtToken', t), token);
  await page.goto(route(info, logical));
  await page.reload();
}

export async function waitForArticles(page: Page) {
  await expect(page.getByText('Loading articles...')).toBeHidden();
}

/** First article in the logged-out global feed (demo content visible to everyone). */
export async function firstDemoArticle(request: APIRequestContext) {
  const res = await request.get(`${API}/articles?limit=1`);
  const body = await res.json();
  return body.articles[0] as { slug: string; title: string; favoritesCount: number; author: { username: string } };
}

export function activeTab(page: Page, container = '.feed-toggle') {
  return page.locator(`${container} a.nav-link.active:visible`);
}

export function previews(page: Page) {
  return page.locator('.article-preview:has(.preview-link)');
}

export async function shot(page: Page, info: TestInfo, name: string) {
  const dir = path.join(__dirname, '..', 'report', 'screens', info.project.name);
  fs.mkdirSync(dir, { recursive: true });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(dir, `${name}.png`), fullPage: true });
}
