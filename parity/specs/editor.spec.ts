import { test, expect } from '@playwright/test';
import { go, header, createUser, createArticle, signInAs, expectRoute, snap, apiGet } from '../helpers/app';

test.describe('editor', () => {
  test('publish, edit and delete an article', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'editor');
    await signInAs(page, testInfo, user);
    await header(page).getByRole('link', { name: /New Article/ }).click();
    await expect(page.getByPlaceholder('Article Title')).toBeVisible();
    await expect(page).toHaveTitle('Editor — Conduit');
    const title = `Editor parity ${Date.now()}`;
    await page.getByPlaceholder('Article Title').fill(title);
    await page.getByPlaceholder("What's this article about?").fill('About parity');
    await page.getByPlaceholder('Write your article (in markdown)').fill('Body with *emphasis*.');
    const tags = page.getByPlaceholder('Enter tags');
    for (const t of ['alpha', 'beta', 'gamma']) {
      await tags.fill(t);
      await tags.press('Enter');
    }
    await expect(page.locator('.tag-list .tag-pill')).toHaveText(['alpha', 'beta', 'gamma']);
    await page.locator('.tag-list .tag-pill').filter({ hasText: 'gamma' }).locator('i').click();
    await expect(page.locator('.tag-list .tag-pill')).toHaveText(['alpha', 'beta']);
    await snap(page, testInfo, 'editor');
    await page.getByRole('button', { name: 'Publish Article' }).click();

    await expectRoute(page, /^\/article\/.+/);
    await expect(page.locator('.banner h1')).toHaveText(title);
    await expect(page.locator('.article-content em')).toHaveText('emphasis');
    await expect(page.locator('.article-content .tag-list li')).toHaveText(['alpha', 'beta']);

    await page.getByRole('link', { name: /Edit Article/ }).first().click();
    await expect(page.getByPlaceholder('Article Title')).toHaveValue(title);
    await expect(page.locator('.tag-list .tag-pill')).toHaveText(['alpha', 'beta']);
    await page.getByPlaceholder('Article Title').fill(`${title} edited`);
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.locator('.banner h1')).toHaveText(`${title} edited`);

    await page.getByRole('button', { name: /Delete Article/ }).first().click();
    await expectRoute(page, '/');
  });

  test('edit loads your article and saves the changes', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'edload');
    const title = `Loaded ${Date.now()}`;
    const art = await createArticle(request, user, { title, description: 'desc', body: 'body text', tagList: ['one', 'two'] });
    await signInAs(page, testInfo, user, `/editor/${art.slug}`);
    await expect(page.getByPlaceholder('Article Title')).toHaveValue(title);
    await expect(page.getByPlaceholder("What's this article about?")).toHaveValue('desc');
    await expect(page.getByPlaceholder('Write your article (in markdown)')).toHaveValue('body text');
    await expect(page.locator('.tag-list .tag-pill')).toHaveText(['one', 'two']);
    await snap(page, testInfo, 'editor-edit');
    await page.getByPlaceholder("What's this article about?").fill('desc edited');
    const tags = page.getByPlaceholder('Enter tags');
    await tags.fill('three');
    await tags.press('Enter');
    await page.locator('.tag-list .tag-pill').filter({ hasText: 'one' }).locator('i').click();
    await expect(page.locator('.tag-list .tag-pill')).toHaveText(['two', 'three']);
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expectRoute(page, `/article/${art.slug}`);
    const saved = (await apiGet(request, `/articles/${art.slug}`, user)).article;
    expect(saved.description).toBe('desc edited');
    expect([...saved.tagList].sort()).toEqual(['three', 'two']);
  });

  test('missing fields show server errors', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'edempty');
    await signInAs(page, testInfo, user);
    await header(page).getByRole('link', { name: /New Article/ }).click();
    await page.getByRole('button', { name: 'Publish Article' }).click();
    await expect(page.locator('.error-messages li').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Article' })).toBeEnabled();
  });

  test('anonymous users are sent home', async ({ page }, testInfo) => {
    await go(page, testInfo, '/editor/');
    await expectRoute(page, '/');
  });

  test("cannot edit someone else's article", async ({ page, request }, testInfo) => {
    const owner = await createUser(request, 'owner');
    const art = await createArticle(request, owner, { title: `Owned ${Date.now()}`, description: 'd', body: 'b' });
    const other = await createUser(request, 'other');
    await signInAs(page, testInfo, other);
    await go(page, testInfo, `/editor/${art.slug}`);
    await expectRoute(page, '/');
  });
});
