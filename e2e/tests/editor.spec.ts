import {
  apiCreateArticle,
  apiRegister,
  expect,
  expectRoute,
  route,
  signInWithToken,
  test,
  uniqueName,
} from './helpers';

test.describe('Editor', () => {
  test('create, edit and delete an article', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, '/'));
    await page.locator('nav.navbar').getByRole('link', { name: 'New Article' }).click();
    await expectRoute(page, info, '/editor');

    const title = `QA create ${uniqueName('')}`;
    await page.getByPlaceholder('Article Title').fill(title);
    await page.getByPlaceholder("What's this article about?").fill('An E2E description');
    await page
      .getByPlaceholder('Write your article (in markdown)')
      .fill('# Heading\n\nSome **bold** text');
    const tags = page.getByPlaceholder('Enter tags');
    await tags.fill('qa-e2e');
    await tags.press('Enter');
    await tags.fill('removeme');
    await tags.press('Enter');
    await expect(page.locator('.tag-list .tag-pill')).toHaveCount(2);
    await page.locator('.tag-list .tag-pill', { hasText: 'removeme' }).locator('i').click();
    await expect(page.locator('.tag-list .tag-pill')).toHaveCount(1);
    await page.getByRole('button', { name: 'Publish Article' }).click();

    // Create -> article page with rendered markdown and tags
    await expect(page).toHaveURL(/article\//);
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.locator('.article-content h1', { hasText: 'Heading' })).toBeVisible();
    await expect(page.locator('.article-content strong', { hasText: 'bold' })).toBeVisible();
    await expect(page.locator('.article-content .tag-list')).toContainText('qa-e2e');
    await expect(page.locator('.article-content .tag-list')).not.toContainText('removeme');

    // Edit
    await page.getByRole('link', { name: 'Edit Article' }).first().click();
    await expect(page).toHaveURL(/editor\//);
    await expect(page.getByPlaceholder('Article Title')).toHaveValue(title);
    await expect(page.locator('.tag-list .tag-pill')).toHaveCount(1);
    await page.getByPlaceholder("What's this article about?").fill('Edited description');
    await page.getByPlaceholder('Write your article (in markdown)').fill('Edited body text');
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page).toHaveURL(/article\//);
    await expect(page.locator('.article-content')).toContainText('Edited body text');

    // Delete
    await page.getByRole('button', { name: 'Delete Article' }).first().click();
    await expectRoute(page, info, '/');
    await page.goto(route(info, `/@${user.username}`));
    await expect(
      page.locator('.article-preview', {
        hasText: 'No articles are here... yet.',
      }),
    ).toBeVisible();
  });

  test('publishing an empty article shows validation errors', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, '/editor'));
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.locator('.error-messages li').first()).toBeVisible();
    await expectRoute(page, info, '/editor');
  });

  test('author sees edit/delete controls; others do not', async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    await page.goto(route(info, `/article/${article.slug}`));
    await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Edit Article' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete Article' })).toHaveCount(0);
  });
});
