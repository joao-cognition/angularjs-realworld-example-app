import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against a local RealWorld backend (CONDUIT_API, default http://localhost:8080) because the public
 * api.realworld.show issues the same token to every account, which breaks any multi-user flow.
 *  - angular: the Angular 21 port (path routes) on :4200, served with `--configuration local`.
 *  - legacy:  the original AngularJS app (hash routes) on :4000 — optional baseline; it must be
 *             pointed at the same backend (src/js/config/app.constants.js) to be meaningful.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  // The reference backend uses SQLite, which returns SQLITE_BUSY under concurrent writes.
  workers: Number(process.env.E2E_WORKERS ?? 1),
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'angular',
      use: { baseURL: process.env.ANGULAR_URL ?? 'http://localhost:4200' },
    },
    {
      name: 'legacy',
      use: { baseURL: process.env.LEGACY_URL ?? 'http://localhost:4000' },
    },
  ],
});
