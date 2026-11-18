import { expect, test } from '@playwright/test';
import { getJson, go, previewTitles, snap, waitForList, exact } from '../helpers';

type ArticleList = { articles: any[]; articlesCount: number };
const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

test('global feed (anonymous)', async ({ page }) => {
  const expected = await getJson<ArticleList>('/articles?limit=10&offset=0');
  const { tags } = await getJson<{ tags: string[] }>('/tags');

  await go(page, '/');
  await expect(page).toHaveTitle('Home — Conduit');
  await expect(page.locator('nav.navbar .navbar-brand')).toHaveText('conduit');
  await expect(page.locator('nav.navbar .nav-link:visible')).toHaveText([
    'Home',
    'Sign in',
    'Sign up',
  ]);
  await expect(page.locator('.banner h1')).toHaveText('conduit');
  await expect(page.locator('.banner p')).toHaveText('A place to share your knowledge.');

  await expect(page.locator('.feed-toggle .nav-link:visible')).toHaveText(['Global Feed']);
  await expect(page.locator('.feed-toggle .nav-link.active:visible')).toHaveText('Global Feed');

  await waitForList(page);
  expect(await previewTitles(page)).toEqual(expected.articles.map((a) => a.title));

  const first = expected.articles[0];
  const preview = page.locator('.article-preview').first();
  await expect(preview.locator('.author')).toHaveText(first.author.username);
  await expect(preview.locator('.date')).toHaveText(longDate(first.createdAt));
  await expect(preview.locator('button')).toHaveText(String(first.favoritesCount));
  await expect(preview.locator('p')).toHaveText(first.description);
  await expect(preview.locator('.preview-link span')).toHaveText('Read more...');
  await expect(preview.locator('.tag-list li')).toHaveText(first.tagList);

  const pages = Math.ceil(expected.articlesCount / 10);
  await expect(page.locator('.pagination .page-item:visible')).toHaveCount(pages > 1 ? pages : 0);

  await expect(page.locator('.sidebar p')).toHaveText('Popular Tags');
  await expect(page.locator('.sidebar .tag-list a')).toHaveText(tags);

  await expect(page.locator('footer .logo-font')).toHaveText('conduit');
  await expect(page.locator('footer .attribution')).toHaveText(
    `© ${new Date().getFullYear()}. An interactive learning project from Thinkster. Code licensed under MIT.`,
  );
  await snap(page, '01-home');
});

test('tag filter', async ({ page }) => {
  const { tags } = await getJson<{ tags: string[] }>('/tags');
  const tag = tags.includes('javascript') ? 'javascript' : tags[0];
  const expected = await getJson<ArticleList>(
    `/articles?tag=${encodeURIComponent(tag)}&limit=10&offset=0`,
  );

  await go(page, '/');
  await waitForList(page);
  await page.locator('.sidebar .tag-list a', { hasText: exact(tag) }).click();

  await expect(page.locator('.feed-toggle .nav-link.active:visible')).toHaveText(tag);
  await expect(page.locator('.feed-toggle .nav-link.active:visible i.ion-pound')).toHaveCount(1);
  await expect(page.locator('.feed-toggle .nav-link', { hasText: 'Global Feed' })).not.toHaveClass(
    /active/,
  );
  await waitForList(page);
  await expect.poll(() => previewTitles(page)).toEqual(expected.articles.map((a) => a.title));
  for (const tagList of await page.locator('.article-preview .tag-list').all()) {
    await expect(tagList.locator('li', { hasText: exact(tag) })).toHaveCount(1);
  }
  await snap(page, '02-tag-filter');

  await page.locator('.feed-toggle .nav-link', { hasText: 'Global Feed' }).click();
  await expect(page.locator('.feed-toggle .nav-link.active:visible')).toHaveText('Global Feed');
  await expect(page.locator('.feed-toggle .nav-link:visible')).toHaveText(['Global Feed']);
});
