import { expect, test } from '@playwright/test';
import { createUser, expectRoute, getJson, signInAs, snap, uniqueName } from '../helpers';

const BODY = [
  '# Parity heading',
  '',
  'Some **bold** text and a [link](https://example.com).',
  '',
  '- one',
  '- two',
  '',
  'Raw <b>html</b> stays escaped.',
].join('\n');

test('publish, comment, edit and delete an article', async ({ page }) => {
  const user = await createUser('ed');
  const title = `Parity ${uniqueName('pub')}`;
  await signInAs(page, user, '/');

  await page.locator('nav.navbar .nav-link', { hasText: 'New Article' }).click();
  await expectRoute(page, /^\/editor\/?$/);
  await expect(page).toHaveTitle('Editor — Conduit');

  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expect(page.locator('.error-messages li')).toHaveText([
    "title can't be blank",
    "description can't be blank",
    "body can't be blank",
  ]);

  await page.getByPlaceholder('Article Title').fill(title);
  await page.getByPlaceholder("What's this article about?").fill('Published through the UI');
  await page.getByPlaceholder('Write your article (in markdown)').fill(BODY);
  const tags = page.getByPlaceholder('Enter tags');
  for (const t of ['parity', 'conduit', 'removeme']) {
    await tags.fill(t);
    await tags.press('Enter');
  }
  await expect(page.locator('.tag-list .tag-pill')).toHaveText(['parity', 'conduit', 'removeme']);
  await page
    .locator('.tag-list .tag-pill', { hasText: 'removeme' })
    .locator('i.ion-close-round')
    .click();
  await expect(page.locator('.tag-list .tag-pill')).toHaveText(['parity', 'conduit']);
  await snap(page, '12-editor');

  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expectRoute(page, /^\/article\/.+/);
  const slug = (page.url().match(/article\/([^/?#]+)/) ?? [])[1];
  await expect(page).toHaveTitle(`${title} — Conduit`);
  await expect(page.locator('.banner h1')).toHaveText(title);

  const content = page.locator('.article-content');
  await expect(content.locator('h1')).toHaveText('Parity heading');
  await expect(content.locator('strong')).toHaveText('bold');
  await expect(content.locator('a[href="https://example.com"]')).toHaveText('link');
  await expect(content.locator('ul:not(.tag-list) li')).toHaveText(['one', 'two']);
  await expect(content.locator('b')).toHaveCount(0);
  await expect(content).toContainText('Raw <b>html</b> stays escaped.');
  // The API returns tags sorted.
  await expect(content.locator('.tag-list li')).toHaveText(['conduit', 'parity']);

  const banner = page.locator('.banner');
  await expect(banner.getByText('Edit Article')).toBeVisible();
  await expect(banner.getByText('Delete Article')).toBeVisible();
  await expect(banner.locator('button', { hasText: 'Favorite' })).toBeHidden();
  await expect(banner.locator('button', { hasText: 'Follow' })).toBeHidden();

  await page.getByPlaceholder('Write a comment...').fill('First comment from the parity suite');
  await page.getByRole('button', { name: 'Post Comment' }).click();
  await expect(page.locator('.card .card-text')).toHaveText([
    'First comment from the parity suite',
  ]);
  await expect(page.getByPlaceholder('Write a comment...')).toHaveValue('');
  await expect(page.locator('.card-footer a.comment-author:not(:has(img))')).toHaveText([
    user.username,
  ]);
  await expect(page.locator('.card-footer .mod-options:visible')).toHaveCount(1);
  await snap(page, '13-article-own-with-comment');

  await page.locator('.card-footer .mod-options i.ion-trash-a').click();
  await expect(page.locator('.card .card-text')).toHaveCount(0);

  await banner.getByText('Edit Article').click();
  await expectRoute(page, `/editor/${slug}`);
  await expect(page.getByPlaceholder('Article Title')).toHaveValue(title);
  await expect(page.getByPlaceholder('Write your article (in markdown)')).toHaveValue(BODY);
  await expect(page.locator('.tag-list .tag-pill')).toHaveText(['conduit', 'parity']);
  await page.getByPlaceholder('Article Title').fill(`${title} (edited)`);
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expectRoute(page, /^\/article\/.+/);
  await expect(page.locator('.banner h1')).toHaveText(`${title} (edited)`);

  const editedSlug = (page.url().match(/article\/([^/?#]+)/) ?? [])[1];
  await page.locator('.banner').getByText('Delete Article').click();
  await expectRoute(page, '/');
  await expect
    .poll(() =>
      getJson(`/articles/${editedSlug}`).then(
        () => 'exists',
        () => 'gone',
      ),
    )
    .toBe('gone');
});

test("editing someone else's article redirects home", async ({ page }) => {
  const { articles } = await getJson<{ articles: any[] }>('/articles?limit=1&offset=0');
  const user = await createUser('ex');
  await signInAs(page, user);
  await page.goto('about:blank');
  await page.goto(
    (test.info().project.name === 'legacy' ? '/#' : '') + `/editor/${articles[0].slug}`,
  );
  await expectRoute(page, '/');
});
