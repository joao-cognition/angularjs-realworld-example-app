import {
  API,
  apiCreateArticle,
  apiRegister,
  demoArticle,
  expect,
  expectRoute,
  route,
  signInWithToken,
  test,
  uniqueName,
} from './helpers';

test.describe('Article interactions', () => {
  test('post and delete a comment', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    const reader = await apiRegister(request);
    await signInWithToken(page, reader);
    await page.goto(route(info, `/article/${article.slug}`));

    const text = `QA comment ${uniqueName('')}`;
    await page.getByPlaceholder('Write a comment...').fill(text);
    await page.getByRole('button', { name: 'Post Comment' }).click();
    const card = page.locator('.card', { hasText: text });
    await expect(card).toBeVisible();
    await expect(card.locator('.comment-author', { hasText: reader.username })).toBeVisible();
    await expect(page.getByPlaceholder('Write a comment...')).toHaveValue('');

    // Persisted server-side
    await page.reload();
    await expect(card).toBeVisible();

    await card.locator('.ion-trash-a').click();
    await expect(card).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
    await expect(page.locator('.card', { hasText: text })).toHaveCount(0);
  });

  test("cannot delete someone else's comment; anonymous sees sign-in prompt", async ({
    page,
    request,
  }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    const res = await request.post(`${API}/articles/${article.slug}/comments`, {
      headers: { Authorization: `Token ${author.token}` },
      data: { comment: { body: 'Author comment' } },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto(route(info, `/article/${article.slug}`));
    const card = page.locator('.card', { hasText: 'Author comment' });
    await expect(card).toBeVisible();
    await expect(card.locator('.ion-trash-a')).toHaveCount(0);
    await expect(page.getByPlaceholder('Write a comment...')).toHaveCount(0);
    await expect(
      page.locator('.article-page').getByRole('link', { name: 'Sign in' }),
    ).toBeVisible();
  });

  test('favorite and unfavorite from the article page', async ({ page, request }, info) => {
    const article = await demoArticle(request);
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, `/article/${article.slug}`));

    const fav = page
      .locator('.article-meta')
      .first()
      .getByRole('button', { name: /favorite article/i });
    await expect(fav).toContainText('Favorite Article');
    await expect(fav).toContainText(`(${article.favoritesCount})`);
    await fav.click();
    await expect(fav).toContainText('Unfavorite Article');
    await expect(fav).toContainText(`(${article.favoritesCount + 1})`);
    await expect(fav).toHaveClass(/btn-primary/);

    await page.goto(route(info, `/@${user.username}/favorites`));
    await expect(page.locator('.article-preview', { hasText: article.title })).toBeVisible();

    await page.goto(route(info, `/article/${article.slug}`));
    await expect(fav).toContainText('Unfavorite Article');
    await fav.click();
    await expect(fav).toContainText('Favorite Article');
    await expect(fav).not.toContainText('Unfavorite');
    await expect(fav).toContainText(`(${article.favoritesCount})`);
  });

  test('favorite and unfavorite from a feed preview', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, `/@${author.username}`));

    const preview = page.locator('.article-preview', {
      hasText: article.title,
    });
    const btn = preview.locator('button');
    await expect(btn).toHaveText(/0/);
    await btn.click();
    await expect(btn).toHaveText(/1/);
    await expect(btn).toHaveClass(/btn-primary/);
    await btn.click();
    await expect(btn).toHaveText(/0/);
    await expect(btn).toHaveClass(/btn-outline-primary/);
  });

  test('follow and unfollow the author', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    const user = await apiRegister(request);
    await signInWithToken(page, user);

    await page.goto(route(info, `/article/${article.slug}`));
    const follow = page.locator('.banner').getByRole('button', {
      name: new RegExp(`follow ${author.username}`, 'i'),
    });
    await expect(follow).toContainText(`Follow ${author.username}`);
    await follow.click();
    await expect(follow).toContainText(`Unfollow ${author.username}`);

    // Reflected on the profile page
    await page.goto(route(info, `/@${author.username}`));
    const profileBtn = page
      .locator('.user-info')
      .getByRole('button', { name: new RegExp(author.username) });
    await expect(profileBtn).toContainText(`Unfollow ${author.username}`);
    await profileBtn.click();
    await expect(profileBtn).toContainText(`Follow ${author.username}`);
    await expect(profileBtn).not.toContainText('Unfollow');
  });

  test('anonymous favorite/follow sends the user to sign up', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    await page.goto(route(info, `/article/${article.slug}`));
    await page
      .locator('.banner')
      .getByRole('button', { name: /favorite article/i })
      .click();
    await expectRoute(page, info, '/register');

    await page.goto(route(info, `/@${author.username}`));
    await page
      .locator('.user-info')
      .getByRole('button', { name: new RegExp(author.username) })
      .click();
    await expectRoute(page, info, '/register');
  });
});
