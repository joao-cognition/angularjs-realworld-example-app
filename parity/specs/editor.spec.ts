import { expect, test } from '@playwright/test';
import { loginWithToken, registerViaApi, shot, uniqueUser, urlMatcher } from './helpers';

test('publish, comment, edit and delete an article', async ({ page, request }, info) => {
  const user = await registerViaApi(request, uniqueUser(info, 'ed'));
  await loginWithToken(page, info, user.token!, '/');
  await page.locator('.navbar').getByRole('link', { name: 'New Article' }).click();
  await expect(page).toHaveTitle('Editor — Conduit');

  const title = `Parity article ${Date.now()}`;
  await page.getByPlaceholder('Article Title').fill(title);
  await page.getByPlaceholder("What's this article about?").fill('Parity description');
  await page
    .getByPlaceholder('Write your article (in markdown)')
    .fill('Hello **bold** world\n\n- item one\n- item two');
  const tags = page.getByPlaceholder('Enter tags');
  await tags.fill('paritytag');
  await tags.press('Enter');
  await tags.fill('second');
  await tags.press('Enter');
  await expect(page.locator('.tag-list .tag-pill')).toHaveCount(2);
  await page
    .locator('.tag-list .tag-pill', { hasText: 'second' })
    .locator('.ion-close-round')
    .click();
  await expect(page.locator('.tag-list .tag-pill')).toHaveCount(1);
  await shot(page, info, '09-editor');
  await page.getByRole('button', { name: 'Publish Article' }).click();

  await expect(page).toHaveURL(urlMatcher(info, '/article/.+'));
  await expect(page.locator('.banner h1')).toHaveText(title);
  await expect(page.locator('.article-content strong')).toHaveText('bold');
  await expect(page.locator('.article-content li:not(.tag-default)')).toHaveCount(2);
  await expect(page.locator('.article-content .tag-list')).toContainText('paritytag');
  await expect(page.locator('.banner').getByText('Edit Article')).toBeVisible();
  await expect(page.locator('.banner').getByText('Delete Article')).toBeVisible();
  await expect(page.locator('.banner').getByRole('button', { name: /Follow/ })).toBeHidden();

  const comment = `Parity comment ${Date.now()}`;
  await page.getByPlaceholder('Write a comment...').fill(comment);
  await page.getByRole('button', { name: 'Post Comment' }).click();
  const posted = page.locator('.card:not(.comment-form)', { hasText: comment });
  await expect(posted).toBeVisible();
  await expect(posted.locator('.comment-author').last()).toHaveText(user.username);
  await expect(page.getByPlaceholder('Write a comment...')).toHaveValue('');
  await shot(page, info, '10-article-own-with-comment');
  await posted.locator('.mod-options .ion-trash-a').click();
  await expect(posted).toHaveCount(0);

  await page.locator('.banner').getByText('Edit Article').click();
  await expect(page).toHaveURL(urlMatcher(info, '/editor/.+'));
  await expect(page.getByPlaceholder('Article Title')).toHaveValue(title);
  await expect(page.getByPlaceholder('Write your article (in markdown)')).toHaveValue(
    /Hello \*\*bold\*\* world/,
  );
  await expect(page.locator('.tag-list .tag-pill')).toHaveCount(1);
  await page.getByPlaceholder('Article Title').fill(`${title} edited`);
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expect(page.locator('.banner h1')).toHaveText(`${title} edited`);

  await page.locator('.banner').getByRole('button', { name: 'Delete Article' }).click();
  await expect(page).toHaveURL(urlMatcher(info, '/$'));
});

test('editor shows API validation errors', async ({ page, request }, info) => {
  const user = await registerViaApi(request, uniqueUser(info, 'ee'));
  await loginWithToken(page, info, user.token!, '/editor');
  await page.getByRole('button', { name: 'Publish Article' }).click();
  await expect(page.locator('.error-messages li').first()).toBeVisible();
  await shot(page, info, '11-editor-errors');
});
