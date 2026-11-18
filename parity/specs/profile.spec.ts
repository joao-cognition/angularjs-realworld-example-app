import { expect, test } from '@playwright/test';
import {
  activeTab,
  createArticleViaApi,
  firstDemoArticle,
  go,
  loginWithToken,
  previews,
  registerViaApi,
  shot,
  uniqueUser,
  waitForArticles,
} from './helpers';

test('profile of another user (logged out): info, follow button, tabs', async ({
  page,
  request,
}, info) => {
  const author = (await firstDemoArticle(request)).author.username;
  await go(page, info, `/profile/${author}`);
  await expect(page).toHaveTitle(`@${author} — Conduit`);
  await expect(page.locator('.user-info h4')).toHaveText(author);
  await expect(page.locator('.user-info p')).not.toBeEmpty();
  await expect(
    page.locator('.user-info').getByRole('button', { name: `Follow ${author}` }),
  ).toBeVisible();
  await expect(page.locator('.user-info').getByText('Edit Profile Settings')).toBeHidden();
  await expect(activeTab(page, '.articles-toggle')).toHaveText('My Articles');
  await waitForArticles(page);
  const n = await previews(page).count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++)
    await expect(previews(page).nth(i).locator('.author')).toHaveText(author);
  await shot(page, info, '14-profile-other-user');

  await page
    .locator('.user-info')
    .getByRole('button', { name: `Follow ${author}` })
    .click();
  await expect(page).toHaveURL(/register/);
});

test('own profile: my articles paginated by 5, favorites tab, settings link', async ({
  page,
  request,
}, info) => {
  const author = await registerViaApi(request, uniqueUser(info, 'pr'));
  for (let i = 0; i < 6; i++) {
    await createArticleViaApi(request, author.token!, {
      title: `Profile article ${i} ${Date.now()}`,
      description: `desc ${i}`,
      body: `body ${i}`,
      tagList: ['profiletag'],
    });
  }
  await loginWithToken(page, info, author.token!, `/profile/${author.username}`);
  await expect(page).toHaveTitle(`@${author.username} — Conduit`);
  await expect(page.locator('.user-info h4')).toHaveText(author.username);
  await expect(page.locator('.user-info').getByText('Edit Profile Settings')).toBeVisible();
  await expect(page.locator('.user-info').getByRole('button', { name: /Follow/ })).toBeHidden();
  await waitForArticles(page);
  await expect(previews(page)).toHaveCount(5);
  await expect(page.locator('.pagination .page-item')).toHaveCount(2);
  await shot(page, info, '15-profile-own-articles');
  await page.locator('.pagination .page-item').nth(1).locator('.page-link').click();
  await expect(page.locator('.pagination .page-item').nth(1)).toHaveClass(/active/);
  await waitForArticles(page);
  await expect(previews(page)).toHaveCount(1);

  await page.locator('.articles-toggle a.nav-link', { hasText: 'Favorited Articles' }).click();
  await expect(activeTab(page, '.articles-toggle')).toHaveText('Favorited Articles');
  await expect(page.getByText('No articles are here... yet.')).toBeVisible();

  await page.locator('.user-info').getByText('Edit Profile Settings').click();
  await expect(page.locator('h1')).toHaveText('Your Settings');
});

test('unknown article and profile redirect home', async ({ page }, info) => {
  await go(page, info, '/article/this-slug-does-not-exist-parity');
  await expect(page.locator('.home-page')).toBeVisible();
  await go(page, info, '/profile/no_such_user_parity_404');
  await expect(page.locator('.home-page')).toBeVisible();
});
