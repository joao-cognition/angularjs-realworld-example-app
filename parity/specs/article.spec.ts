import { expect, test } from '@playwright/test';
import { go, previews, shot, urlMatcher, waitForArticles } from './helpers';

test('article page (logged out): body, tags, author, comments prompt', async ({ page }, info) => {
  await go(page, info, '/');
  await waitForArticles(page);
  const first = previews(page).first();
  const title = (await first.locator('.preview-link h1').innerText()).trim();
  const author = (await first.locator('.article-meta .author').innerText()).trim();
  await first.locator('.preview-link').click();

  await expect(page).toHaveURL(urlMatcher(info, '/article/.+'));
  await expect(page.locator('.article-page .banner h1')).toHaveText(title);
  await expect(page).toHaveTitle(`${title} — Conduit`);
  await expect(page.locator('.banner .article-meta .author')).toHaveText(author);
  await expect(page.locator('.article-content')).not.toBeEmpty();
  await expect(page.locator('.banner').getByRole('button', { name: new RegExp(`Follow ${author}`) })).toBeVisible();
  await expect(page.locator('.banner').getByRole('button', { name: /Favorite Article/ })).toBeVisible();
  await expect(page.locator('.banner').getByText('Edit Article')).toBeHidden();
  await expect(page.getByText('to add comments on this article.')).toBeVisible();
  await expect(page.locator('textarea[placeholder="Write a comment..."]')).toBeHidden();
  await shot(page, info, '04-article-logged-out');

  await page.locator('.banner .article-meta .author').click();
  await expect(page).toHaveURL(urlMatcher(info, `/profile/${author}`));
  await expect(page.locator('.user-info h4')).toHaveText(author);
});

test('favorite while logged out sends user to sign up', async ({ page }, info) => {
  await go(page, info, '/');
  await waitForArticles(page);
  await previews(page).first().locator('.article-meta button').click();
  await expect(page).toHaveURL(urlMatcher(info, '/register'));
  await expect(page.locator('h1')).toHaveText('Sign up');
});
