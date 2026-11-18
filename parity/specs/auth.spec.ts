import { expect, test } from '@playwright/test';
import { activeTab, go, isLegacy, registerViaApi, shot, uniqueUser, urlMatcher } from './helpers';

test('sign up, log out, sign in', async ({ page }, info) => {
  const user = uniqueUser(info, 'su');
  await go(page, info, '/register');
  await expect(page).toHaveTitle('Sign up — Conduit');
  await expect(page.locator('h1')).toHaveText('Sign up');
  await expect(page.getByRole('link', { name: 'Have an account?' })).toBeVisible();
  await shot(page, info, '05-register');
  await page.getByPlaceholder('Username').fill(user.username);
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page).toHaveURL(urlMatcher(info, '/(\\?feed=following)?$'));
  const nav = page.locator('.navbar');
  await expect(nav.getByRole('link', { name: user.username })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'New Article' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Sign in' })).toBeHidden();
  await expect(page.locator('.banner')).toBeHidden();
  await expect(activeTab(page)).toHaveText('Your Feed');
  await expect(page.getByText('No articles are here... yet.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeTruthy();
  await shot(page, info, '06-home-logged-in-your-feed');

  await nav.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Or click here to logout.' }).click();
  await expect(nav.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page).toHaveURL(urlMatcher(info, '/(\\?feed=following)?$'));
  expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeFalsy();

  await nav.getByRole('link', { name: 'Sign in' }).click();
  await expect(page).toHaveTitle('Sign in — Conduit');
  await expect(page.getByRole('link', { name: 'Need an account?' })).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeHidden();
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(nav.getByRole('link', { name: user.username })).toBeVisible();
});

test('sign in with wrong password shows errors', async ({ page, request }, info) => {
  test.fail(
    isLegacy(info),
    'Legacy bug: the 401 interceptor hard-reloads the page, so login errors never render',
  );
  const user = await registerViaApi(request, uniqueUser(info, 'bad'));
  await go(page, info, '/login');
  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('.error-messages li').first()).toBeVisible();
  await expect(page.locator('.error-messages')).toContainText(/invalid/i);
  await shot(page, info, '07-login-error');
});

test('sign up with blank fields shows validation errors', async ({ page }, info) => {
  await go(page, info, '/register');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.locator('.error-messages')).toContainText("username can't be blank");
  await expect(page.locator('.error-messages')).toContainText("email can't be blank");
});

test('protected routes redirect anonymous users home', async ({ page }, info) => {
  await go(page, info, '/settings');
  await expect(page).toHaveURL(urlMatcher(info, '/$'));
  await go(page, info, '/editor');
  await expect(page).toHaveURL(urlMatcher(info, '/$'));
});
