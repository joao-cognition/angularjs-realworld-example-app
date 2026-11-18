import { test, expect } from '@playwright/test';
import { go, createUser, createArticle, signInAs, snap, expectRoute, seedArticles, apiGet } from '../helpers/app';

test.describe('article page', () => {
  test('seed article for anonymous readers', async ({ page, request }, testInfo) => {
    const art = (await seedArticles(request)).articles[0];
    const { comments } = await apiGet(request, `/articles/${art.slug}/comments`);
    await go(page, testInfo, `/article/${art.slug}`);
    await expect(page.locator('.banner h1')).toHaveText(art.title);
    await expect(page.locator('.banner .author')).toHaveText(art.author.username);
    await expect(page.locator('.banner .date')).toHaveText(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    await expect(page.locator('.article-content .tag-list li')).toHaveText(art.tagList);
    await expect(page.getByRole('button', { name: `Follow ${art.author.username}` })).toHaveCount(2);
    await expect(page.getByRole('button', { name: `Favorite Article (${art.favoritesCount})` })).toHaveCount(2);
    await expect(page.getByText('to add comments on this article.')).toBeVisible();
    await expect(page.getByPlaceholder('Write a comment...')).toBeHidden();
    await expect(page.locator('.card .card-text')).toHaveCount(comments.length);
    if (comments.length) {
      await expect(page.locator('.card .card-text').first()).toHaveText(comments[0].body);
    }
    await expect(page).toHaveTitle(`${art.title} — Conduit`);
    await snap(page, testInfo, 'article');
  });

  test('author sees markdown, edit and delete', async ({ page, request }, testInfo) => {
    const author = await createUser(request, 'author');
    const art = await createArticle(request, author, {
      title: `Parity article ${Date.now()}`,
      description: 'Checks article rendering',
      body: '## Parity heading\n\nSome **bold** text.\n\n<script>window.__xss = 1</script>',
      tagList: ['parity', 'migration'],
    });
    await signInAs(page, testInfo, author, `/article/${art.slug}`);
    await expect(page.locator('.banner h1')).toHaveText(art.title);
    await expect(page.locator('.article-content h2')).toHaveText('Parity heading');
    await expect(page.locator('.article-content strong')).toHaveText('bold');
    await expect(page.locator('.article-content .tag-list li')).toHaveText(art.tagList);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    await expect(page.getByRole('link', { name: /Edit Article/ })).toHaveCount(2);
    await expect(page.getByRole('button', { name: /Delete Article/ })).toHaveCount(2);
    await expect(page.getByRole('button', { name: /Follow/ })).toHaveCount(0);
    await snap(page, testInfo, 'article-author');
  });

  test('reader posts and deletes a comment', async ({ page, request }, testInfo) => {
    const art = (await seedArticles(request)).articles[0];
    const reader = await createUser(request, 'reader');
    await signInAs(page, testInfo, reader, `/article/${art.slug}`);
    await expect(page.getByRole('link', { name: /Edit Article/ })).toHaveCount(0);
    const text = `Parity comment ${Date.now()}`;
    await page.getByPlaceholder('Write a comment...').fill(text);
    await page.getByRole('button', { name: 'Post Comment' }).click();
    const card = page.locator('.card').filter({ hasText: text });
    await expect(card).toBeVisible();
    await expect(page.locator('.card .card-text').first()).toHaveText(text);
    await expect(card.locator('.comment-author').last()).toHaveText(reader.username);
    await expect(page.getByPlaceholder('Write a comment...')).toHaveValue('');
    await expect(page.locator('.card').filter({ hasNotText: text }).locator('.mod-options i').filter({ visible: true })).toHaveCount(0);
    await snap(page, testInfo, 'article-comment');
    await card.locator('.mod-options i').click();
    await expect(card).toHaveCount(0);
  });

  test('favorite and follow from the article page', async ({ page, request }, testInfo) => {
    const art = (await seedArticles(request)).articles[0];
    const reader = await createUser(request, 'fan');
    await signInAs(page, testInfo, reader, `/article/${art.slug}`);
    const n = art.favoritesCount;
    await page.getByRole('button', { name: `Favorite Article (${n})` }).first().click();
    await expect(page.getByRole('button', { name: `Unfavorite Article (${n + 1})` })).toHaveCount(2);
    await page.getByRole('button', { name: `Follow ${art.author.username}` }).first().click();
    await expect(page.getByRole('button', { name: `Unfollow ${art.author.username}` })).toHaveCount(2);
    await page.getByRole('button', { name: /Unfavorite Article/ }).first().click();
    await expect(page.getByRole('button', { name: `Favorite Article (${n})` })).toHaveCount(2);
    await page.getByRole('button', { name: `Unfollow ${art.author.username}` }).first().click();
    await expect(page.getByRole('button', { name: `Follow ${art.author.username}` })).toHaveCount(2);
  });

  test('unknown slug goes home', async ({ page }, testInfo) => {
    await go(page, testInfo, '/article/no-such-article-parity-xyz');
    await expectRoute(page, '/');
  });
});
