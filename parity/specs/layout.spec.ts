import { test, expect } from '@playwright/test';
import { go, header, createUser, signInAs, snap } from '../helpers/app';

test.describe('layout (shell)', () => {
  test('anonymous header, footer and title', async ({ page }, testInfo) => {
    await go(page, testInfo, '/');
    const nav = header(page);
    await expect(nav.locator('.navbar-brand')).toHaveText('conduit');
    for (const name of ['Home', 'Sign in', 'Sign up']) {
      await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: /New Article/ })).toBeHidden();
    await expect(page.locator('footer')).toContainText('An interactive learning project from Thinkster');
    await expect(page.locator('footer')).toContainText(`© ${new Date().getFullYear()}.`);
    await expect(page).toHaveTitle('Home — Conduit');
  });

  test('signed-in header', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'layout');
    await signInAs(page, testInfo, user);
    const nav = header(page);
    await expect(nav.getByRole('link', { name: /New Article/ })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Settings/ })).toBeVisible();
    await expect(nav.getByRole('link', { name: user.username })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sign in', exact: true })).toBeHidden();
    await snap(page, testInfo, 'layout-signed-in');
  });

  test('unknown route falls back to home', async ({ page }, testInfo) => {
    await go(page, testInfo, '/no-such-page');
    await expect(page.getByText('Popular Tags')).toBeVisible();
  });
});
