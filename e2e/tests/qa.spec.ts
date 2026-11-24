import {
  apiCreateArticle,
  apiRegister,
  expect,
  expectRoute,
  route,
  signInWithToken,
  test,
} from './helpers';

/** Manual-QA checks automated: every page renders, no console errors, no AngularJS left behind. */
test.describe('QA sweep (Angular port only)', () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'angular', 'Angular-only checks'));

  test('every page renders without console errors or AngularJS artifacts', async ({
    page,
    request,
    consoleErrors,
  }, info) => {
    const user = await apiRegister(request);
    const article = await apiCreateArticle(request, user, {
      tagList: ['qa-sweep'],
    });

    const anonymous = [
      '/',
      '/login',
      '/register',
      `/article/${article.slug}`,
      `/@${user.username}`,
      `/@${user.username}/favorites`,
    ];
    for (const path of anonymous) {
      await page.goto(route(info, path));
      await expect(page.locator('app-root nav.navbar')).toBeVisible();
      await page.waitForLoadState('networkidle');
      await assertNoAngularJs(page, path);
    }

    await signInWithToken(page, user);
    for (const path of [
      '/',
      '/settings',
      '/editor',
      `/editor/${article.slug}`,
      `/article/${article.slug}`,
      `/@${user.username}`,
    ]) {
      await page.goto(route(info, path));
      await expectRoute(page, info, path);
      await expect(
        page.locator('nav.navbar').getByRole('link', { name: user.username }),
      ).toBeVisible();
      await page.waitForLoadState('networkidle');
      await assertNoAngularJs(page, path);
    }
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('legacy hash URLs are redirected to path URLs', async ({ page, request }, info) => {
    const user = await apiRegister(request);
    await page.goto(`/#/@${user.username}`);
    await expect(page).toHaveURL(new RegExp(`/@${user.username}$`));
    await expect(page.locator('.user-info h4')).toHaveText(user.username);
  });

  test('broken avatar URLs fall back to the default avatar', async ({ page, request }) => {
    const user = await apiRegister(request);
    await page.goto(`/@${user.username}`);
    const img = page.locator('.user-info img.user-img');
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  });

  test('document titles follow the route', async ({ page, request }) => {
    const user = await apiRegister(request);
    const article = await apiCreateArticle(request, user);
    await page.goto('/login');
    await expect(page).toHaveTitle('Sign in — Conduit');
    await page.goto(`/article/${article.slug}`);
    await expect(page).toHaveTitle(`${article.title} — Conduit`);
    await page.goto(`/@${user.username}`);
    await expect(page).toHaveTitle(`@${user.username} — Conduit`);
  });
});

async function assertNoAngularJs(page: import('@playwright/test').Page, path: string) {
  const report = await page.evaluate(() => {
    const attrs = new Set<string>();
    for (const el of Array.from(document.querySelectorAll('*'))) {
      for (const a of Array.from(el.attributes)) {
        if (/^(ng-|data-ng-|ui-sref|ui-view)/.test(a.name) && a.name !== 'ng-version')
          attrs.add(a.name);
      }
      if (/\bng-(scope|binding|isolate-scope)\b/.test(el.getAttribute('class') ?? ''))
        attrs.add('class:ng-scope');
    }
    const text = document.body.innerText;
    return {
      angularGlobal: typeof (window as unknown as { angular?: unknown }).angular !== 'undefined',
      attrs: [...attrs],
      mustache: /\{\{[^}]*\}\}/.test(text),
      ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null,
    };
  });
  expect(report.angularGlobal, `${path}: window.angular`).toBe(false);
  expect(report.attrs, `${path}: AngularJS attributes`).toEqual([]);
  expect(report.mustache, `${path}: raw {{ }} in page text`).toBe(false);
  expect(report.ngVersion, `${path}: Angular version`).toMatch(/^21\./);
}
