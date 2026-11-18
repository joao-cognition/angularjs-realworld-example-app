import { expect, test } from '@playwright/test';
import {
  activeTab,
  createArticleViaApi,
  go,
  loginWithToken,
  registerViaApi,
  uniqueUser,
  previews,
  shot,
  waitForArticles,
} from './helpers';

test.describe('home', () => {
  test('global feed, banner, tags and title (logged out)', async ({ page }, info) => {
    await go(page, info, '/');
    await expect(page).toHaveTitle('Home — Conduit');
    await expect(page.locator('.banner h1.logo-font')).toHaveText('conduit');
    await expect(page.locator('.banner')).toContainText('A place to share your knowledge.');
    await expect(page.locator('.navbar')).toContainText('Sign in');
    await expect(page.locator('.navbar')).toContainText('Sign up');
    await expect(page.locator('.feed-toggle a.nav-link', { hasText: 'Your Feed' })).toBeHidden();
    await expect(activeTab(page)).toHaveText('Global Feed');

    await waitForArticles(page);
    await expect(previews(page).first()).toBeVisible();
    const first = previews(page).first();
    await expect(first.locator('.article-meta .author')).not.toBeEmpty();
    await expect(first.locator('.preview-link h1')).not.toBeEmpty();
    await expect(first.locator('.preview-link')).toContainText('Read more...');
    await expect(first.locator('button.btn-outline-primary, button.btn-primary')).toContainText(
      /\d+/,
    );

    await expect(page.locator('.sidebar')).toContainText('Popular Tags');
    await expect(page.locator('.sidebar .tag-list a.tag-pill').first()).toBeVisible();
    await expect(page.locator('footer')).toContainText('conduit');
    await shot(page, info, '01-home-global-feed');
  });

  test('pagination moves to page 2 (logged in, global feed)', async ({ page, request }, info) => {
    const user = await registerViaApi(request, uniqueUser(info, 'pg'));
    for (let i = 0; i < 11; i++) {
      await createArticleViaApi(request, user.token!, {
        title: `Paged ${i} ${Date.now()}`,
        description: 'p',
        body: 'p',
      });
    }
    await loginWithToken(page, info, user.token!, '/');
    await page.locator('.feed-toggle a.nav-link', { hasText: 'Global Feed' }).click();
    await expect(activeTab(page)).toHaveText('Global Feed');
    await waitForArticles(page);
    await expect(previews(page)).toHaveCount(10);
    const pages = page.locator('.pagination .page-item');
    expect(await pages.count()).toBeGreaterThan(1);
    await expect(pages.first()).toHaveClass(/active/);
    const firstTitle = await previews(page).first().locator('h1').innerText();

    await pages.nth(1).locator('.page-link').click();
    await expect(pages.nth(1)).toHaveClass(/active/);
    await expect(pages.first()).not.toHaveClass(/active/);
    await waitForArticles(page);
    await expect(previews(page).first().locator('h1')).not.toHaveText(firstTitle);
    await shot(page, info, '02-home-page-2');
  });

  test('tag filter shows tag tab and tagged articles', async ({ page }, info) => {
    await go(page, info, '/');
    const tag = page.locator('.sidebar .tag-list a.tag-pill').first();
    await expect(tag).toBeVisible();
    const tagName = (await tag.innerText()).trim();
    await tag.click();

    const tagTab = activeTab(page);
    await expect(tagTab).toContainText(tagName);
    await expect(
      page.locator('.feed-toggle a.nav-link', { hasText: 'Global Feed' }),
    ).not.toHaveClass(/active/);
    await waitForArticles(page);
    await expect(previews(page).first()).toBeVisible();
    const n = await previews(page).count();
    for (let i = 0; i < n; i++) {
      await expect(previews(page).nth(i).locator('.tag-list')).toContainText(tagName);
    }
    await shot(page, info, '03-home-tag-filter');

    await page.locator('.feed-toggle a.nav-link', { hasText: 'Global Feed' }).click();
    await expect(activeTab(page)).toHaveText('Global Feed');
  });
});
