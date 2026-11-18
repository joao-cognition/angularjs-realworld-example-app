import { test, expect } from '@playwright/test';
import {
  go, previews, waitForArticles, snap, createUser, createArticle, signInAs, activeTab, seedArticles,
} from '../helpers/app';

test.describe('home feed', () => {
  test('global feed, banner and popular tags', async ({ page, request }, testInfo) => {
    const seed = await seedArticles(request);
    await go(page, testInfo, '/');
    await expect(page.locator('.banner h1')).toHaveText('conduit');
    await expect(page.getByText('A place to share your knowledge.')).toBeVisible();
    await expect(activeTab(page)).toHaveText('Global Feed');
    await expect(page.locator('.feed-toggle').getByText('Your Feed')).toBeHidden();
    await waitForArticles(page);
    await expect(previews(page)).toHaveCount(Math.min(seed.articlesCount, 10));
    await expect(previews(page).locator('h1')).toHaveText(seed.articles.slice(0, 10).map((a) => a.title));
    const first = previews(page).first();
    await expect(first.locator('.author')).toHaveText(seed.articles[0].author.username);
    await expect(first.locator('.date')).toHaveText(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    await expect(first.getByText('Read more...')).toBeVisible();
    await expect(first.locator('button')).toHaveText(String(seed.articles[0].favoritesCount));
    await expect(first.locator('.tag-list li')).toHaveText(seed.articles[0].tagList);
    await expect(page.getByText('Popular Tags')).toBeVisible();
    await expect(page.locator('.sidebar .tag-list a.tag-pill').first()).toBeVisible();
    await expect(page.getByText('Loading tags...')).toBeHidden();
    await expect(page).toHaveTitle('Home — Conduit');
    await snap(page, testInfo, 'home');
  });

  test('pagination', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'pager');
    const seed = await seedArticles(request);
    const toCreate = Math.max(1, 11 - seed.articlesCount);
    for (let i = 0; i < toCreate; i++) {
      await createArticle(request, user, { title: `Pager ${i} ${Date.now()}`, description: 'p', body: 'p' });
    }
    await signInAs(page, testInfo, user);
    await page.locator('.feed-toggle').getByText('Global Feed').click();
    await waitForArticles(page);
    await expect(previews(page)).toHaveCount(10);
    const pages = page.locator('.pagination .page-item');
    await expect(pages).toHaveCount(Math.ceil((seed.articlesCount + toCreate) / 10));
    await expect(page.locator('.pagination .page-item.active')).toHaveText('1');
    const firstTitle = await previews(page).first().locator('h1').innerText();
    await snap(page, testInfo, 'home-pagination');
    await pages.nth(1).locator('a').click();
    await expect(page.locator('.pagination .page-item.active')).toHaveText('2');
    await waitForArticles(page);
    await expect(previews(page).first().locator('h1')).not.toHaveText(firstTitle);
    await expect(previews(page)).toHaveCount(seed.articlesCount + toCreate - 10);
  });

  test('tag filter', async ({ page, request }, testInfo) => {
    await go(page, testInfo, '/');
    await waitForArticles(page);
    const tag = page.locator('.sidebar .tag-list a.tag-pill').first();
    const tagName = (await tag.innerText()).trim();
    const expected = (await (await request.get(`https://api.realworld.show/api/articles?tag=${tagName}&limit=10`)).json())
      .articles as Array<{ title: string }>;
    await tag.click();
    await expect(activeTab(page)).toHaveText(tagName);
    await expect(page.locator('.feed-toggle').getByText('Global Feed')).not.toHaveClass(/active/);
    await waitForArticles(page);
    await expect(previews(page).locator('h1')).toHaveText(expected.map((a) => a.title));
    const n = await previews(page).count();
    for (let i = 0; i < n; i++) {
      await expect(previews(page).nth(i).locator('.tag-list')).toContainText(tagName);
    }
    await snap(page, testInfo, 'home-tag');
    await page.locator('.feed-toggle').getByText('Global Feed').click();
    await expect(activeTab(page)).toHaveText('Global Feed');
    await expect(page.locator('.feed-toggle .nav-link').filter({ hasText: tagName })).toBeHidden();
  });

  test('signed-in user starts on Your Feed', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'home');
    await signInAs(page, testInfo, user);
    await expect(page.locator('.banner')).toBeHidden();
    await expect(activeTab(page)).toHaveText('Your Feed');
    await waitForArticles(page);
    await expect(page.getByText('No articles are here... yet.')).toBeVisible();
    await page.locator('.feed-toggle').getByText('Global Feed').click();
    await expect(activeTab(page)).toHaveText('Global Feed');
    await waitForArticles(page);
    expect(await previews(page).count()).toBeGreaterThan(0);
  });

  test('favorite as anonymous goes to sign up', async ({ page }, testInfo) => {
    await go(page, testInfo, '/');
    await waitForArticles(page);
    await previews(page).first().locator('button').click();
    await expect(page.locator('h1')).toHaveText('Sign up');
  });
});
