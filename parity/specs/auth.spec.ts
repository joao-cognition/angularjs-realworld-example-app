import { expect, test } from '@playwright/test';
import {
  createUser,
  expectRoute,
  go,
  signInAs,
  snap,
  uniqueName,
  waitForList,
  appOf,
} from '../helpers';

test('sign up', async ({ page }) => {
  const username = uniqueName('su');
  await go(page, '/register');
  await expect(page).toHaveTitle('Sign up — Conduit');
  await expect(page.locator('h1')).toHaveText('Sign up');
  await expect(page.getByRole('link', { name: 'Have an account?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Need an account?' })).toBeHidden();
  await expect(page.locator('nav.navbar .nav-link.active:visible')).toHaveText('Sign up');
  await snap(page, '07-sign-up');

  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Email').fill(`${username}@parity.test`);
  await page.getByPlaceholder('Password').fill('parity-pass-123');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expectRoute(page, '/');
  await expect(page.locator('nav.navbar .nav-link:visible')).toHaveText([
    'Home',
    'New Article',
    'Settings',
    username,
  ]);
  await expect(page.locator('.banner')).toBeHidden();
  await expect(page.locator('.feed-toggle .nav-link:visible')).toHaveText([
    'Your Feed',
    'Global Feed',
  ]);
  await expect(page.locator('.feed-toggle .nav-link.active:visible')).toHaveText('Your Feed');
  await waitForList(page);
  await expect(page.getByText('No articles are here... yet.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeTruthy();
  await snap(page, '08-home-signed-in');
});

test('sign in (bad then good credentials)', async ({ page }) => {
  const user = await createUser('si');
  await go(page, '/login');
  await expect(page).toHaveTitle('Sign in — Conduit');
  await expect(page.locator('h1')).toHaveText('Sign in');
  await expect(page.getByRole('link', { name: 'Need an account?' })).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeHidden();
  await snap(page, '09-sign-in');

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  if (appOf() === 'legacy') {
    // Known legacy bug (kept in the baseline, fixed in Angular): the API answers bad credentials with 401
    // and the AngularJS auth interceptor hard-reloads the page on any 401, wiping the error and the form.
    test
      .info()
      .annotations.push({
        type: 'legacy-bug',
        description: 'Bad sign-in reloads the page; no error shown',
      });
    await expect(page.getByPlaceholder('Password')).toHaveValue('');
    await expect(page.locator('.error-messages li')).toHaveCount(0);
  } else {
    await expect(page.locator('.error-messages li')).toHaveText('credentials invalid');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  }
  await expectRoute(page, '/login');
  await snap(page, '10-sign-in-error');

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expectRoute(page, '/');
  await expect(page.locator('nav.navbar')).toContainText(user.username);
});

test('auth guards', async ({ page }) => {
  await go(page, '/settings');
  await expectRoute(page, '/');
  await go(page, '/editor/');
  await expectRoute(page, '/');

  const user = await createUser('ag');
  await signInAs(page, user);
  await go(page, '/login');
  await expectRoute(page, '/');
  await go(page, '/register');
  await expectRoute(page, '/');
});
