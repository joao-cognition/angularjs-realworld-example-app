import {
  apiRegister,
  expect,
  expectRoute,
  route,
  signInWithToken,
  test,
  uniqueName,
} from './helpers';

test.describe('Authentication', () => {
  test('register a new account', async ({ page }, info) => {
    const username = uniqueName('qa');
    await page.goto(route(info, '/register'));
    await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Email').fill(`${username}@example.com`);
    await page.getByPlaceholder('Password').fill('Passw0rd!123');
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expectRoute(page, info, '/');
    const nav = page.locator('nav.navbar');
    await expect(nav.getByRole('link', { name: username })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'New Article' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
    await expect(page.locator('.feed-toggle').getByText('Your Feed')).toBeVisible();
  });

  test('register shows validation errors', async ({ page }, info) => {
    await page.goto(route(info, '/register'));
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.locator('.error-messages li').first()).toBeVisible();
    await expectRoute(page, info, '/register');
  });

  test('login with valid credentials', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await page.goto(route(info, '/login'));
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expectRoute(page, info, '/');
    await expect(
      page.locator('nav.navbar').getByRole('link', { name: user.username }),
    ).toBeVisible();
    // Session survives a reload (JWT persisted + verified on boot).
    await page.reload();
    await expect(
      page.locator('nav.navbar').getByRole('link', { name: user.username }),
    ).toBeVisible();
  });

  test('login with a wrong password shows an error and stays on /login', async ({
    page,
    request,
  }, info) => {
    const user = await apiRegister(request);
    await page.goto(route(info, '/login'));
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.locator('.error-messages li').first()).toBeVisible();
    await expectRoute(page, info, '/login');
  });

  test('switch between sign in and sign up', async ({ page }, info) => {
    await page.goto(route(info, '/login'));
    await page.getByRole('link', { name: 'Need an account?' }).click();
    await expectRoute(page, info, '/register');
    await page.getByRole('link', { name: 'Have an account?' }).click();
    await expectRoute(page, info, '/login');
  });

  test('logout from settings', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await signInWithToken(page, user);
    await page.goto(route(info, '/settings'));
    await page.getByRole('button', { name: 'Or click here to logout.' }).click();

    await expectRoute(page, info, '/');
    const nav = page.locator('nav.navbar');
    await expect(nav.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(nav.getByRole('link', { name: user.username })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('jwtToken'))).toBeNull();
  });
});
