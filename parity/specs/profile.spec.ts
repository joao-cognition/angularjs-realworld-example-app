import { expect, test } from '@playwright/test';
import {
  createArticle,
  createUser,
  deleteArticle,
  expectRoute,
  getJson,
  go,
  previewTitles,
  signInAs,
  snap,
  waitForList,
} from '../helpers';

test('profile + favorites tab (anonymous)', async ({ page }) => {
  const { articles } = await getJson<{ articles: any[] }>('/articles?limit=10&offset=0');
  const username = articles[0].author.username;
  const { profile } = await getJson<{ profile: any }>(`/profiles/${username}`);
  const own = await getJson<{ articles: any[] }>(`/articles?author=${username}&limit=5&offset=0`);
  const favs = await getJson<{ articles: any[] }>(
    `/articles?favorited=${username}&limit=5&offset=0`,
  );

  await go(page, `/@${username}`);
  await expect(page).toHaveTitle(`@${username} — Conduit`);
  await expect(page.locator('.user-info h4')).toHaveText(username);
  await expect(page.locator('.user-info p')).toHaveText(profile.bio ?? '');
  await expect(page.locator('.user-info img.user-img')).toHaveAttribute('src', profile.image);
  await expect(page.locator('.user-info button')).toHaveText(`Follow ${username}`);
  await expect(page.getByText('Edit Profile Settings')).toBeHidden();

  await expect(page.locator('.articles-toggle .nav-link')).toHaveText([
    'My Articles',
    'Favorited Articles',
  ]);
  await expect(page.locator('.articles-toggle .nav-link.active:visible')).toHaveText('My Articles');
  await waitForList(page);
  await expect.poll(() => previewTitles(page)).toEqual(own.articles.map((a) => a.title));
  await snap(page, '04-profile');

  await page.locator('.articles-toggle .nav-link', { hasText: 'Favorited Articles' }).click();
  await expectRoute(page, `/@${username}/favorites`);
  await expect(page).toHaveTitle(`Articles favorited by ${username} — Conduit`);
  await expect(page.locator('.articles-toggle .nav-link.active:visible')).toHaveText(
    'Favorited Articles',
  );
  await waitForList(page);
  await expect.poll(() => previewTitles(page)).toEqual(favs.articles.map((a) => a.title));
  if (!favs.articles.length)
    await expect(page.getByText('No articles are here... yet.')).toBeVisible();
  await snap(page, '05-profile-favorites');

  await page.locator('.user-info button', { hasText: 'Follow' }).click();
  await expectRoute(page, '/register');
});

test('profile pagination', async ({ page }) => {
  const author = await createUser('pg');
  const slugs: string[] = [];
  try {
    for (let i = 1; i <= 6; i++)
      slugs.push((await createArticle(author, { title: `Paged ${author.username} ${i}` })).slug);

    // The API only shows a user's own articles to that user, so browse the profile as its author.
    await signInAs(page, author, `/@${author.username}`);
    await waitForList(page);
    await expect(page.locator('.article-preview h1')).toHaveCount(5);
    await expect(page.locator('.pagination .page-item')).toHaveText(['1', '2']);
    await expect(page.locator('.pagination .page-item.active')).toHaveText('1');

    await page.locator('.pagination .page-link', { hasText: '2' }).click();
    await expect(page.locator('.pagination .page-item.active')).toHaveText('2');
    await expect(page.locator('.article-preview h1')).toHaveCount(1);
    await expect(page.locator('.article-preview h1')).toHaveText(`Paged ${author.username} 1`);
    await snap(page, '06-profile-page-2');
  } finally {
    for (const s of slugs) await deleteArticle(author, s);
  }
});

test('unknown profile redirects home', async ({ page }) => {
  await go(page, '/@no-such-user-parity-404');
  await expectRoute(page, '/');
});
