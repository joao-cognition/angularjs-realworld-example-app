import { expect, test } from '@playwright/test';
import { loginWithToken, registerViaApi, shot, uniqueUser, urlMatcher } from './helpers';

test('settings prefill and update bio/image', async ({ page, request }, info) => {
  const user = await registerViaApi(request, uniqueUser(info, 'set'));
  await loginWithToken(page, info, user.token!, '/settings');
  await expect(page).toHaveTitle('Settings — Conduit');
  await expect(page.locator('h1')).toHaveText('Your Settings');
  await expect(page.getByPlaceholder('Username')).toHaveValue(user.username);
  await expect(page.getByPlaceholder('Email')).toHaveValue(user.email);
  await shot(page, info, '08-settings');

  const bio = `Parity bio ${Date.now()}`;
  await page.getByPlaceholder('Short bio about you').fill(bio);
  await page.getByPlaceholder('URL of profile picture').fill('https://api.realworld.show/images/smiley-cyrus.jpeg');
  await page.getByRole('button', { name: 'Update Settings' }).click();

  await expect(page).toHaveURL(urlMatcher(info, `/profile/${user.username}`));
  await expect(page.locator('.user-info p')).toHaveText(bio);
  await expect(page.locator('.user-info').getByText('Edit Profile Settings')).toBeVisible();
});
