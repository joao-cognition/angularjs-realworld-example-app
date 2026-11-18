import { expect, test } from '@playwright/test';
import {
  apiAs,
  createUser,
  expectRoute,
  getJson,
  go,
  previewTitles,
  signInAs,
  snap,
  waitForList,
} from '../helpers';

// The API sandboxes what a user creates (articles, favorites, follows) to that user, so social flows act on the
// seeded public articles and authors; favorites and follows are undone in `finally`.

interface Article {
  slug: string;
  title: string;
  favoritesCount: number;
  author: { username: string };
}

test('favorite and unfavorite', async ({ page }) => {
  const reader = await createUser('fr');
  const { articles } = await getJson<{ articles: Article[] }>('/articles?limit=10&offset=0');
  const article = articles[0];
  const n = article.favoritesCount;
  try {
    await signInAs(page, reader, '/');
    await page.locator('.feed-toggle .nav-link', { hasText: 'Global Feed' }).click();
    await waitForList(page);
    const btn = page.locator('.article-preview', { hasText: article.title }).locator('button');
    await expect(btn).toHaveText(String(n));
    await expect(btn).toHaveClass(/btn-outline-primary/);
    await btn.click();
    await expect(btn).toHaveText(String(n + 1));
    await expect(btn).toHaveClass(/btn-primary/);
    await expect(btn).not.toHaveClass(/btn-outline-primary/);

    await go(page, `/@${reader.username}/favorites`);
    await waitForList(page);
    await expect.poll(() => previewTitles(page)).toEqual([article.title]);

    await page.locator('.article-preview .preview-link').click();
    await expectRoute(page, `/article/${article.slug}`);
    const fav = page.locator('.banner button', { hasText: 'Favorite' });
    await expect(fav).toHaveText(`Unfavorite Article (${n + 1})`);
    await snap(page, '14-article-favorited');
    await fav.click();
    await expect(fav).toHaveText(`Favorite Article (${n})`);
    await expect(fav).toHaveClass(/btn-outline-primary/);
  } finally {
    await apiAs(reader, 'DELETE', `/articles/${article.slug}/favorite`).catch(() => undefined);
  }
});

test('follow an author and see them in Your Feed', async ({ page }) => {
  const reader = await createUser('fw');
  const { articles } = await getJson<{ articles: Article[] }>('/articles?limit=10&offset=0');
  const author = articles[0].author.username;
  const theirs = await getJson<{ articles: Article[] }>(
    `/articles?author=${author}&limit=10&offset=0`,
  );
  try {
    await signInAs(page, reader, `/@${author}`);
    const follow = page.locator('.user-info button');
    await expect(follow).toHaveText(`Follow ${author}`);
    await expect(follow).toHaveClass(/btn-outline-secondary/);
    await follow.click();
    await expect(follow).toHaveText(`Unfollow ${author}`);
    await expect(follow).toHaveClass(/btn-secondary/);
    await snap(page, '15-profile-following');

    await page.locator('nav.navbar .nav-link:visible', { hasText: 'Home' }).click();
    await expectRoute(page, '/');
    await expect(page.locator('.feed-toggle .nav-link.active:visible')).toHaveText('Your Feed');
    await waitForList(page);
    await expect.poll(() => previewTitles(page)).toEqual(theirs.articles.map((a) => a.title));
    await snap(page, '16-your-feed');

    await page.locator('.article-preview .preview-link').first().click();
    await expect(page.locator('.banner button', { hasText: 'Follow' })).toHaveText(
      `Unfollow ${author}`,
    );

    await go(page, `/@${author}`);
    await page.locator('.user-info button').click();
    await expect(page.locator('.user-info button')).toHaveText(`Follow ${author}`);
  } finally {
    await apiAs(reader, 'DELETE', `/profiles/${author}/follow`).catch(() => undefined);
  }
});

test('anonymous favorite redirects to sign up', async ({ page }) => {
  await go(page, '/');
  await waitForList(page);
  await page.locator('.article-preview button').first().click();
  await expectRoute(page, '/register');
});
