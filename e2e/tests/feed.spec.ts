import {
  API,
  apiCreateArticle,
  apiRegister,
  expect,
  expectRoute,
  route,
  signInWithToken,
  test,
  uniqueName,
} from './helpers';

test.describe('Feeds', () => {
  test('anonymous home shows the global feed and popular tags', async ({ page }, info) => {
    await page.goto(route(info, '/'));
    await expect(page.locator('.banner h1')).toHaveText('conduit');
    await expect(page.locator('.feed-toggle .nav-link.active')).toHaveText('Global Feed');
    await expect(page.locator('.feed-toggle').getByText('Your Feed')).toHaveCount(0);
    await expect(
      page
        .locator('app-article-preview .article-preview, article-preview .article-preview')
        .first(),
    ).toBeVisible();
    await expect(page.locator('.sidebar .tag-list a').first()).toBeVisible();
  });

  test('tag filtering', async ({ page, request }, info) => {
    const { tags } = await (await request.get(`${API}/tags`)).json();
    const tag: string = tags[0];
    await page.goto(route(info, '/'));
    await page
      .locator('.sidebar .tag-list a', {
        hasText: new RegExp(`^\\s*${tag}\\s*$`),
      })
      .first()
      .click();

    const active = page.locator('.feed-toggle .nav-link.active');
    await expect(active).toContainText(tag);
    const previews = page.locator('.article-preview:has(.preview-link)');
    await expect(previews.first()).toBeVisible();
    const count = await previews.count();
    for (let i = 0; i < count; i++) {
      await expect(previews.nth(i).locator('.tag-list')).toContainText(tag);
    }
    // Back to the global feed
    await page.locator('.feed-toggle').getByText('Global Feed').click();
    await expect(active).toHaveText('Global Feed');
  });

  test('"Your Feed" shows articles from followed authors', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author, {
      title: `Followed ${uniqueName('')}`,
    });
    const reader = await apiRegister(request);
    const res = await request.post(`${API}/profiles/${author.username}/follow`, {
      headers: { Authorization: `Token ${reader.token}` },
    });
    expect(res.ok()).toBeTruthy();

    await signInWithToken(page, reader);
    await page.goto(route(info, '/'));
    const yourFeed = page.locator('.feed-toggle').getByText('Your Feed');
    await expect(yourFeed).toBeVisible();
    await yourFeed.click();
    await expect(page.locator('.feed-toggle .nav-link.active')).toHaveText('Your Feed');
    await expect(page.locator('.article-preview', { hasText: article.title })).toBeVisible();
  });

  test('"Your Feed" is empty for a user following nobody', async ({ page, request }, info) => {
    const reader = await apiRegister(request);
    await signInWithToken(page, reader);
    await page.goto(route(info, '/'));
    await page.locator('.feed-toggle').getByText('Your Feed').click();
    await expect(
      page.locator('.article-preview', {
        hasText: 'No articles are here... yet.',
      }),
    ).toBeVisible();
  });

  test('pagination on a profile with more than one page', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const titles: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const a = await apiCreateArticle(request, author, {
        title: `Paged ${i} ${uniqueName('')}`,
      });
      titles.push(a.title);
    }
    await page.goto(route(info, `/@${author.username}`));
    const pages = page.locator('.pagination .page-item');
    await expect(pages).toHaveCount(2);
    await expect(page.locator('.pagination .page-item.active')).toHaveText('1');
    const previews = page.locator('.article-preview:has(.preview-link)');
    await expect(previews).toHaveCount(5);
    await expect(previews.first()).toContainText(titles[5]); // newest first

    await pages.nth(1).locator('a').click();
    await expect(page.locator('.pagination .page-item.active')).toHaveText('2');
    await expect(previews).toHaveCount(1);
    await expect(previews.first()).toContainText(titles[0]);

    await pages.nth(0).locator('a').click();
    await expect(previews).toHaveCount(5);
    await expect(previews.first()).toContainText(titles[5]);
  });

  test('global feed pagination', async ({ page }, info) => {
    await page.goto(route(info, '/'));
    const previews = page.locator('.article-preview:has(.preview-link)');
    await expect(previews).toHaveCount(10);
    const firstTitle = await previews.first().locator('h1').innerText();
    const pages = page.locator('.pagination .page-item');
    expect(await pages.count()).toBeGreaterThan(1);
    await pages.nth(1).locator('a').click();
    await expect(page.locator('.pagination .page-item.active')).toHaveText('2');
    await expect(previews.first().locator('h1')).not.toHaveText(firstTitle);
    await expectRoute(page, info, '/');
  });
});
