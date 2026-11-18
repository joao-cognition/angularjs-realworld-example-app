import { expect, test } from '@playwright/test';
import { expectRoute, getJson, go, snap, waitForList } from '../helpers';

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

test('article page + comments (anonymous)', async ({ page }) => {
  const { articles } = await getJson<{ articles: any[] }>('/articles?limit=10&offset=0');
  let article: any;
  let comments: any[] = [];
  for (const a of articles) {
    const res = await getJson<{ comments: any[] }>(`/articles/${a.slug}/comments`);
    if (res.comments.length) {
      article = a;
      comments = res.comments;
      break;
    }
  }
  article ??= articles[0];

  await go(page, '/');
  await waitForList(page);
  await page.locator('.article-preview .preview-link', { hasText: article.title }).click();
  await expectRoute(page, `/article/${article.slug}`);
  await expect(page).toHaveTitle(`${article.title} — Conduit`);

  const banner = page.locator('.banner');
  await expect(banner.locator('h1')).toHaveText(article.title);
  await expect(banner.locator('.author')).toHaveText(article.author.username);
  await expect(banner.locator('.date')).toHaveText(longDate(article.createdAt));
  await expect(banner.locator('button', { hasText: 'Follow' })).toHaveText(
    `Follow ${article.author.username}`,
  );
  await expect(banner.locator('button', { hasText: 'Favorite' })).toHaveText(
    `Favorite Article (${article.favoritesCount})`,
  );
  await expect(page.locator('.article-actions .author')).toHaveText(article.author.username);
  await expect(page.locator('.article-content .tag-list li')).toHaveText(article.tagList);
  await expect(page.locator('.article-content')).not.toBeEmpty();

  await expect(page.getByText('to add comments on this article.')).toHaveText(
    'Sign in or sign up to add comments on this article.',
  );
  await expect(page.locator('form.comment-form')).toBeHidden();
  await expect(page.locator('.card .card-text')).toHaveText(comments.map((c) => c.body));
  await expect(page.locator('.card-footer a.comment-author:not(:has(img))')).toHaveText(
    comments.map((c) => c.author.username),
  );
  await expect(page.locator('.card-footer .date-posted')).toHaveText(
    comments.map((c) => longDate(c.createdAt)),
  );
  await expect(page.locator('.card-footer .mod-options:visible')).toHaveCount(0);
  await snap(page, '03-article');

  await page.locator('.card-footer a.comment-author:not(:has(img))').first().click();
  await expectRoute(page, `/@${comments[0]?.author.username ?? ''}`);
});

test('unknown article redirects home', async ({ page }) => {
  await go(page, '/article/this-slug-does-not-exist-parity');
  await expectRoute(page, '/');
});
