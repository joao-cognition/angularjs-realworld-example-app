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
} from './helpers';

test.describe('Settings', () => {
  test('update bio and image', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, '/settings'));
    await expect(page.getByPlaceholder('Username')).toHaveValue(user.username);
    await expect(page.getByPlaceholder('Email')).toHaveValue(user.email);

    const bio = `I test things ${Date.now()}`;
    const image = 'https://api.realworld.show/images/smiley-cyrus.jpeg?e2e=1';
    await page.getByPlaceholder('Short bio about you').fill(bio);
    await page.getByPlaceholder('URL of profile picture').fill(image);
    await page.getByRole('button', { name: 'Update Settings' }).click();

    await expectRoute(page, info, `/@${user.username}`);
    await expect(page.locator('.user-info p')).toContainText(bio);
    await expect(page.locator('.user-info img.user-img')).toHaveAttribute('src', image);
    await expect(page.locator('nav.navbar img.user-pic')).toHaveAttribute('src', image);

    const me = await (
      await request.get(`${API}/user`, {
        headers: { Authorization: `Token ${user.token}` },
      })
    ).json();
    expect(me.user.bio).toBe(bio);
  });

  test('new password is sent only when filled in', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, '/settings'));

    let req = page.waitForRequest((r) => r.url().endsWith('/user') && r.method() === 'PUT');
    await page.getByRole('button', { name: 'Update Settings' }).click();
    expect((await req).postDataJSON().user).not.toHaveProperty('password');
    await expectRoute(page, info, `/@${user.username}`);

    await page.goto(route(info, '/settings'));
    await page.getByPlaceholder('New Password').fill('N3wPassw0rd!');
    req = page.waitForRequest((r) => r.url().endsWith('/user') && r.method() === 'PUT');
    await page.getByRole('button', { name: 'Update Settings' }).click();
    expect((await req).postDataJSON().user.password).toBe('N3wPassw0rd!');
    await expectRoute(page, info, `/@${user.username}`);
  });
});

test.describe('Profile', () => {
  test('articles and favorites tabs', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    const own = await apiCreateArticle(request, user);
    const fav = await demoArticle(request);
    const res = await request.post(`${API}/articles/${fav.slug}/favorite`, {
      headers: { Authorization: `Token ${user.token}` },
    });
    expect(res.ok()).toBeTruthy();

    await signInWithToken(page, user);
    await page.goto(route(info, `/@${user.username}`));
    await expect(page.locator('.user-info h4')).toHaveText(user.username);
    await expect(page.getByRole('link', { name: 'Edit Profile Settings' })).toBeVisible();

    const tabs = page.locator('.articles-toggle');
    await expect(tabs.locator('.nav-link.active')).toHaveText('My Articles');
    const previews = page.locator('.article-preview:has(.preview-link)');
    await expect(previews).toHaveCount(1);
    await expect(previews.first()).toContainText(own.title);

    await tabs.getByRole('link', { name: 'Favorited Articles' }).click();
    await expectRoute(page, info, `/@${user.username}/favorites`);
    await expect(tabs.locator('.nav-link.active')).toHaveText('Favorited Articles');
    await expect(previews.first()).toContainText(fav.title);
    await expect(page.locator('.article-preview', { hasText: own.title })).toHaveCount(0);

    await tabs.getByRole('link', { name: 'My Articles' }).click();
    await expectRoute(page, info, `/@${user.username}`);
    await expect(previews.first()).toContainText(own.title);
  });

  test("another user's profile shows follow, not settings", async ({ page, request }, info) => {
    const other = await apiRegister(request);
    const me = await apiRegister(request);
    await signInWithToken(page, me);
    await page.goto(route(info, `/@${other.username}`));
    await expect(page.locator('.user-info h4')).toHaveText(other.username);
    await expect(page.getByRole('link', { name: 'Edit Profile Settings' })).toHaveCount(0);
    await expect(
      page.locator('.user-info').getByRole('button', { name: `Follow ${other.username}` }),
    ).toBeVisible();
  });

  test('header avatar link and author links navigate to profiles', async ({
    page,
    request,
  }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    await page.goto(route(info, `/article/${article.slug}`));
    await page.locator('.banner .article-meta a.author').click();
    await expectRoute(page, info, `/@${author.username}`);
    await expect(page.locator('.user-info h4')).toHaveText(author.username);
  });
});
