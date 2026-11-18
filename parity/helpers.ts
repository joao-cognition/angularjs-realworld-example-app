import { expect, Page, TestInfo, test } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const API = process.env.CONDUIT_API ?? 'https://api.realworld.show/api';
export const JWT_KEY = 'jwtToken';

export type AppName = 'legacy' | 'angular';

export function appOf(info: TestInfo = test.info()): AppName {
  return info.project.name as AppName;
}

/** Map a logical route ("/article/foo") to the URL each app serves it on. */
export function url(route: string, info: TestInfo = test.info()): string {
  return appOf(info) === 'legacy' ? `/#${route}` : route;
}

/** The logical route the page is currently on, for either app. */
export function currentRoute(page: Page): string {
  const u = new URL(page.url());
  if (u.hash.startsWith('#/')) return decodeURIComponent(u.hash.slice(1));
  return decodeURIComponent(u.pathname);
}

export async function go(page: Page, route: string) {
  await page.goto(url(route));
}

export async function expectRoute(page: Page, route: string | RegExp) {
  await expect
    .poll(() => currentRoute(page), { message: `route should be ${route}` })
    .toMatch(typeof route === 'string' ? new RegExp(`^${escapeRe(route)}$`) : route);
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// API helpers (test setup only; every assertion goes through the UI)
// ---------------------------------------------------------------------------

export interface User {
  username: string;
  email: string;
  password: string;
  token: string;
}

let seq = 0;
/** Per-account throwaway password, so no usable credential is committed. */
export function randomPassword() {
  return randomBytes(12).toString('base64url');
}

export function uniqueName(prefix: string, info: TestInfo = test.info()) {
  const app = appOf(info) === 'legacy' ? 'l' : 'a';
  return `${prefix}${app}${Date.now().toString(36)}${(seq++).toString(36)}`;
}

async function api<T>(method: string, route: string, body?: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Token ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status} ${text}`);
  return (text ? JSON.parse(text) : {}) as T;
}

export async function createUser(prefix = 'pu', attempt = 1): Promise<User> {
  const username = uniqueName(prefix);
  const email = `${username}@parity.test`;
  const password = randomPassword();
  const res = await api<{ user: { token: string } }>('POST', '/users', {
    user: { username, email, password },
  });
  // The shared API's GET /user can answer with another account under concurrent traffic; only hand out a
  // token whose round-trip matches, so setup itself never starts from the wrong user.
  const me = await api<{ user: { username: string } }>('GET', '/user', undefined, res.user.token);
  if (me.user.username !== username) {
    if (attempt >= 3) throw new Error(`token for ${username} resolves to ${me.user.username}`);
    return createUser(prefix, attempt + 1);
  }
  return { username, email, password, token: res.user.token };
}

export async function createArticle(
  user: User,
  data: Partial<{ title: string; description: string; body: string; tagList: string[] }> = {},
) {
  const title = data.title ?? `Parity article ${uniqueName('t')}`;
  const res = await api<{ article: { slug: string; title: string } }>(
    'POST',
    '/articles',
    {
      article: {
        title,
        description: data.description ?? 'Written by the parity suite',
        body: data.body ?? 'Hello **parity**',
        tagList: data.tagList ?? [],
      },
    },
    user.token,
  );
  return res.article;
}

export async function deleteArticle(user: User, slug: string) {
  await api('DELETE', `/articles/${slug}`, undefined, user.token).catch(() => undefined);
}

export async function getJson<T>(route: string, token?: string): Promise<T> {
  return api<T>('GET', route, undefined, token);
}

/** Sign a user in by seeding the JWT the same way both apps store it. */
export async function signInAs(page: Page, user: User, route = '/') {
  await page.goto(url('/'));
  await page.evaluate(([k, t]) => localStorage.setItem(k, t), [JWT_KEY, user.token] as const);
  // A hash-only change would not re-bootstrap the legacy app, so force a fresh load.
  await page.goto('about:blank');
  await page.goto(url(route));
  await expect(page.locator('nav.navbar')).toContainText(user.username);
}

// ---------------------------------------------------------------------------
// Screenshots for the side-by-side report
// ---------------------------------------------------------------------------

export async function snap(page: Page, name: string) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  // Fonts and avatars come from third-party CDNs; give them a moment to settle.
  await page.evaluate(() => (document as any).fonts?.ready).catch(() => undefined);
  await page.waitForTimeout(300);
  const dir = path.join(__dirname, 'report', 'screens', appOf());
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({
    path: path.join(dir, `${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

/** Visible text of the article previews' titles, in order. */
export async function previewTitles(page: Page) {
  return page.locator('.article-preview h1').allInnerTexts();
}

/** Whole-text match that ignores the whitespace AngularJS templates leave around interpolations. */
export function exact(text: string) {
  return new RegExp(`^\\s*${escapeRe(text)}\\s*$`);
}

export async function waitForList(page: Page) {
  await expect(page.locator('.article-preview', { hasText: 'Loading articles...' })).toBeHidden();
}

/** Raw authenticated API call for test setup/cleanup. */
export async function apiAs<T = unknown>(user: User, method: string, route: string): Promise<T> {
  return api<T>(method, route, undefined, user.token);
}
