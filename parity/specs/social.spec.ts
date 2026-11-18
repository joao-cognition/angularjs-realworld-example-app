import { expect, test } from '@playwright/test';
import {
  activeTab,
  firstDemoArticle,
  go,
  loginWithToken,
  previews,
  registerViaApi,
  shot,
  uniqueUser,
  waitForArticles,
} from './helpers';

// The public API only shows logged-in users their own content plus demo-account content,
// so social flows act on demo articles/authors (favorite/follow state is per user).

test('favorite and unfavorite; favorites tab on profile', async ({ page, request }, info) => {
  const article = await firstDemoArticle(request);
  const user = await registerViaApi(request, uniqueUser(info, 'fu'));
  await loginWithToken(page, info, user.token!, '/');
  await page.locator('.feed-toggle a.nav-link', { hasText: 'Global Feed' }).click();
  await waitForArticles(page);

  const card = previews(page).filter({ hasText: article.title });
  const btn = card.locator('.article-meta button');
  await expect(btn).toHaveClass(/btn-outline-primary/);
  const before = Number((await btn.innerText()).trim());
  await btn.click();
  await expect(btn).toHaveClass(/btn-primary/);
  await expect(btn).not.toHaveClass(/btn-outline-primary/);
  await expect(btn).toHaveText(String(before + 1));

  await go(page, info, `/profile/${user.username}/favorites`);
  await expect(page).toHaveTitle(`Articles favorited by ${user.username} — Conduit`);
  await expect(activeTab(page, '.articles-toggle')).toHaveText('Favorited Articles');
  await waitForArticles(page);
  await expect(previews(page)).toHaveCount(1);
  await expect(previews(page).first()).toContainText(article.title);
  await shot(page, info, '12-profile-favorites');

  await go(page, info, `/article/${article.slug}`);
  const favBtn = page.locator('.banner').getByRole('button', { name: /Unfavorite Article/ });
  await expect(favBtn).toContainText(`(${before + 1})`);
  await favBtn.click();
  await expect(
    page.locator('.banner').getByRole('button', { name: /(?<!Un)Favorite Article/ }),
  ).toContainText(`(${before})`);
});

test('follow author from article page; your feed; unfollow from profile', async ({
  page,
  request,
}, info) => {
  const article = await firstDemoArticle(request);
  const author = article.author.username;
  const user = await registerViaApi(request, uniqueUser(info, 'fo'));
  await loginWithToken(page, info, user.token!, `/article/${article.slug}`);

  await page
    .locator('.banner')
    .getByRole('button', { name: `Follow ${author}` })
    .click();
  await expect(
    page.locator('.banner').getByRole('button', { name: `Unfollow ${author}` }),
  ).toBeVisible();

  await go(page, info, '/?feed=following');
  await expect(activeTab(page)).toHaveText('Your Feed');
  await waitForArticles(page);
  await expect(previews(page).filter({ hasText: article.title })).toHaveCount(1);
  await shot(page, info, '13-your-feed-following');

  await go(page, info, `/profile/${author}`);
  const unfollow = page.locator('.user-info').getByRole('button', { name: `Unfollow ${author}` });
  await expect(unfollow).toHaveClass(/btn-secondary/);
  await unfollow.click();
  await expect(
    page.locator('.user-info').getByRole('button', { name: `Follow ${author}` }),
  ).toHaveClass(/btn-outline-secondary/);
});
