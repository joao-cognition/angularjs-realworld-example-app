import { test, expect } from '@playwright/test';
import { go, header, activeTab, createUser, uniqueName, expectRoute, snap, signInAs } from '../helpers/app';

test.describe('auth', () => {
  test('sign up page and new account', async ({ page }, testInfo) => {
    await go(page, testInfo, '/register');
    await expect(page.locator('h1')).toHaveText('Sign up');
    await expect(page.getByRole('link', { name: 'Have an account?' })).toBeVisible();
    await expect(page).toHaveTitle('Sign up — Conduit');
    await snap(page, testInfo, 'register');
    const username = uniqueName('signup');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(`${username}@example.com`);
    await page.getByPlaceholder('Password').fill('Parity-pass-123');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(header(page).getByRole('link', { name: username })).toBeVisible();
    await expectRoute(page, '/');
    await expect(activeTab(page)).toHaveText('Your Feed');
  });

  test('sign in page and existing account', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'signin');
    await go(page, testInfo, '/login');
    await expect(page.locator('h1')).toHaveText('Sign in');
    await expect(page.getByRole('link', { name: 'Need an account?' })).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeHidden();
    await expect(page).toHaveTitle('Sign in — Conduit');
    await snap(page, testInfo, 'login');
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(header(page).getByRole('link', { name: user.username })).toBeVisible();
    await expectRoute(page, '/');
    await page.reload();
    await expect(header(page).getByRole('link', { name: user.username })).toBeVisible();
  });

  test('wrong password keeps the user signed out', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'badpw');
    await go(page, testInfo, '/login');
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    // The API answers 401; the legacy interceptor reloads the page on any 401, so it never shows
    // the error. Angular shows it (legacy bug fixed on purpose, listed in the PR).
    if (testInfo.project.name === 'angular') {
      await expect(page.locator('.error-messages')).toContainText('credentials invalid');
    } else {
      await page.waitForLoadState('load');
    }
    await expectRoute(page, '/login');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    await expect(header(page).getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
    await snap(page, testInfo, 'login-error');
  });

  test('blank sign up shows server errors', async ({ page }, testInfo) => {
    await go(page, testInfo, '/register');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.locator('.error-messages li')).toHaveText([
      "username can't be blank",
      "email can't be blank",
      "password can't be blank",
    ]);
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeEnabled();
  });

  test('signed-in user is sent home from sign in', async ({ page, request }, testInfo) => {
    const user = await createUser(request, 'authed');
    await signInAs(page, testInfo, user);
    await go(page, testInfo, '/login');
    await expectRoute(page, '/');
  });
});
