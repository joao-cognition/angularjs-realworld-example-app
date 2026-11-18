import { expect, test } from '@playwright/test';
import { appOf, createUser, expectRoute, go, signInAs, snap } from '../helpers';

test('settings update + logout', async ({ page }) => {
  const user = await createUser('st');
  await signInAs(page, user, '/');
  await page.locator('nav.navbar .nav-link', { hasText: 'Settings' }).click();
  await expectRoute(page, '/settings');
  await expect(page).toHaveTitle('Settings — Conduit');
  await expect(page.locator('h1')).toHaveText('Your Settings');
  await expect(page.getByPlaceholder('Username')).toHaveValue(user.username);
  await expect(page.getByPlaceholder('Email')).toHaveValue(user.email);
  await expect(page.getByPlaceholder('New Password')).toHaveValue('');
  await snap(page, '11-settings');

  await page.getByPlaceholder('Email').fill('not-an-email');
  // Bypass the browser's own type=email check so the API error renders, as it would in either app.
  await page.locator('form').evaluate((f: HTMLFormElement) => (f.noValidate = true));
  await page.getByRole('button', { name: 'Update Settings' }).click();
  if (appOf() === 'legacy') {
    // Known legacy bug (fixed in Angular): AngularJS's type=email validator turns an invalid email into
    // `undefined`, so it is silently dropped from the update and the save "succeeds".
    test
      .info()
      .annotations.push({
        type: 'legacy-bug',
        description: 'Invalid email silently ignored on save',
      });
    await expectRoute(page, `/@${user.username}`);
    await go(page, '/settings');
  } else {
    await expect(page.locator('.error-messages li')).toHaveText('email is invalid');
  }

  await page.getByPlaceholder('Email').fill(user.email);
  await page.getByPlaceholder('Short bio about you').fill('Bio written by the parity suite');
  await page.getByRole('button', { name: 'Update Settings' }).click();
  await expectRoute(page, `/@${user.username}`);
  await expect(page.locator('.user-info p')).toHaveText('Bio written by the parity suite');
  await expect(page.getByText('Edit Profile Settings')).toBeVisible();
  await expect(page.locator('.user-info button', { hasText: 'Follow' })).toBeHidden();

  await go(page, '/settings');
  await page.getByRole('button', { name: 'Or click here to logout.' }).click();
  await expectRoute(page, '/');
  await expect(page.locator('nav.navbar .nav-link:visible')).toHaveText([
    'Home',
    'Sign in',
    'Sign up',
  ]);
  expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeNull();
});
