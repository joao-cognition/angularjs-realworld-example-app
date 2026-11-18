import { test, expect } from '@playwright/test';
import {
  go, createUser, createArticle, signInAs, previews, waitForArticles, snap, expectRoute, seedArticles, apiGet,
  activeProfileTab,
} from '../helpers/app';

test.describe('profile', () => {
  test("another user's profile, articles and follow", async ({ page, request }, testInfo) => {
    const art = (await seedArticles(request)).articles[0];
    const name = art.author.username;
    const { profile } = await apiGet(request, `/profiles/${name}`);
    const { articles } = await apiGet(request, `/articles?author=${name}&limit=5`);
    const viewer = await createUser(request, 'viewer');
    await signInAs(page, testInfo, viewer, `/@${name}`);
    await expect(page.locator('.user-info h4')).toHaveText(name);
    await expect(page.locator('.user-info p')).toHaveText(profile.bio ?? '');
    await expect(page.locator('.user-info img.user-img')).toHaveAttribute('src', profile.image);
    await expect(page.getByRole('link', { name: /Edit Profile Settings/ })).toBeHidden();
    await expect(activeProfileTab(page)).toHaveText('My Articles');
    await waitForArticles(page);
    await expect(previews(page).locator('h1')).toHaveText(articles.map((a: { title: string }) => a.title));
    await snap(page, testInfo, 'profile');
    await page.getByRole('button', { name: `Follow ${name}` }).click();
    await expect(page.getByRole('button', { name: `Unfollow ${name}` })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: `Unfollow ${name}` })).toBeVisible();
    await page.getByRole('button', { name: `Unfollow ${name}` }).click();
    await expect(page.getByRole('button', { name: `Follow ${name}` })).toBeVisible();
  });

  test('favorite shows up on the Favorited Articles tab', async ({ page, request }, testInfo) => {
    const art = (await seedArticles(request)).articles[0];
    const fan = await createUser(request, 'favs');
    await signInAs(page, testInfo, fan, `/@${art.author.username}`);
    await waitForArticles(page);
    const preview = previews(page).filter({ hasText: art.title });
    await expect(preview.locator('button')).toHaveText(String(art.favoritesCount));
    await preview.locator('button').click();
    await expect(preview.locator('button')).toHaveText(String(art.favoritesCount + 1));
    await go(page, testInfo, `/@${fan.username}/favorites`);
    await expect(activeProfileTab(page)).toHaveText('Favorited Articles');
    await waitForArticles(page);
    await expect(previews(page)).toHaveCount(1);
    await expect(previews(page).first().locator('h1')).toHaveText(art.title);
    await snap(page, testInfo, 'profile-favorites');
    await previews(page).first().locator('button').click();
    await expect(previews(page).first().locator('button')).toHaveText(String(art.favoritesCount));
  });

  test('own profile lists own articles and empty favorites', async ({ page, request }, testInfo) => {
    const me = await createUser(request, 'prof');
    const art = await createArticle(request, me, { title: `Profile parity ${Date.now()}`, description: 'mine', body: 'b' });
    await signInAs(page, testInfo, me, `/@${me.username}`);
    await expect(page.locator('.user-info h4')).toHaveText(me.username);
    await expect(page.getByRole('link', { name: /Edit Profile Settings/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Follow/ })).toHaveCount(0);
    await waitForArticles(page);
    await expect(previews(page).locator('h1')).toHaveText([art.title]);
    await page.getByRole('link', { name: 'Favorited Articles' }).click();
    await expectRoute(page, `/@${me.username}/favorites`);
    await expect(activeProfileTab(page)).toHaveText('Favorited Articles');
    await waitForArticles(page);
    await expect(page.getByText('No articles are here... yet.')).toBeVisible();
    await page.getByRole('link', { name: 'My Articles' }).click();
    await expectRoute(page, `/@${me.username}`);
    await expect(previews(page).locator('h1')).toHaveText([art.title]);
  });

  test('anonymous follow goes to sign up', async ({ page, request }, testInfo) => {
    const name = (await seedArticles(request)).articles[0].author.username;
    await go(page, testInfo, `/@${name}`);
    await page.getByRole('button', { name: `Follow ${name}` }).click();
    await expect(page.locator('h1')).toHaveText('Sign up');
  });

  test('unknown profile goes home', async ({ page }, testInfo) => {
    await go(page, testInfo, '/@no-such-user-parity-xyz');
    await expectRoute(page, '/');
  });
});
