import { test, expect } from '@playwright/test';
import { go, header, createUser, signInAs, expectRoute, snap } from '../helpers/app';

test.describe('settings', () => {
  test('form is prefilled and saves bio', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'settings');
    await signInAs(page, testInfo, user, '/settings');
    await expect(page.locator('h1')).toHaveText('Your Settings');
    await expect(page).toHaveTitle('Settings — Conduit');
    await expect(page.getByPlaceholder('Username')).toHaveValue(user.username);
    await expect(page.getByPlaceholder('Email')).toHaveValue(user.email);
    await snap(page, testInfo, 'settings');
    const bio = `Parity bio ${Date.now()}`;
    await page.getByPlaceholder('Short bio about you').fill(bio);
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expectRoute(page, `/@${user.username}`);
    await expect(page.locator('.user-info p')).toHaveText(bio);
  });

  test('logout returns to anonymous header', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'logout');
    await signInAs(page, testInfo, user, '/settings');
    await page.getByRole('button', { name: 'Or click here to logout.' }).click();
    await expect(header(page).getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(header(page).getByRole('link', { name: user.username })).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeNull();
  });

  test('anonymous users are sent home', async ({ page }, testInfo) => {
    await go(page, testInfo, '/settings');
    await expectRoute(page, '/');
  });
});
