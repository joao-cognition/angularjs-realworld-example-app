import {
  apiCreateArticle,
  apiRegister,
  expect,
  expectRoute,
  isLegacy,
  route,
  signInWithToken,
  test,
} from './helpers';

// The Angular port sends anonymous users to /login (as requested); the legacy app sent them home.
const loginRedirect = (info: Parameters<typeof isLegacy>[0]) => (isLegacy(info) ? '/' : '/login');

test.describe('Auth guards', () => {
  for (const path of ['/settings', '/editor', '/editor/some-slug']) {
    test(`anonymous ${path} redirects to sign in`, async ({ page }, info) => {
      await page.goto(route(info, path));
      await expectRoute(page, info, loginRedirect(info));
    });
  }

  for (const path of ['/login', '/register']) {
    test(`signed-in ${path} redirects home`, async ({ page, request }, info) => {
      const user = await apiRegister(request);
      await signInWithToken(page, user);
      await page.goto(route(info, path));
      await expectRoute(page, info, '/');
    });
  }

  test("editing someone else's article redirects home", async ({ page, request }, info) => {
    const author = await apiRegister(request);
    const article = await apiCreateArticle(request, author);
    const intruder = await apiRegister(request);
    await signInWithToken(page, intruder);
    await page.goto(route(info, `/editor/${article.slug}`));
    await expectRoute(page, info, '/');
  });

  test('unknown article and profile redirect home', async ({ page }, info) => {
    await page.goto(route(info, '/article/this-slug-does-not-exist-e2e'));
    await expectRoute(page, info, '/');
    await page.goto(route(info, '/@no-such-user-e2e-zzz'));
    await expectRoute(page, info, '/');
  });

  test('stale JWT is dropped on boot', async ({ page }, info) => {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('jwtToken', 'not-a-real-token');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.goto(route(info, '/'));
    await expect(page.locator('nav.navbar').getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('jwtToken'))).toBeNull();
  });
});
