import { defineConfig, devices } from '@playwright/test';

const LEGACY_URL = process.env.LEGACY_URL ?? 'http://localhost:4000';
const ANGULAR_URL = process.env.ANGULAR_URL ?? 'http://localhost:4200';

export default defineConfig({
  testDir: './specs',
  // The specs share one public RealWorld API, so run them one at a time.
  workers: 1,
  fullyParallel: false,
  // api.realworld.show's GET /user is not concurrency-safe: under concurrent traffic from any client it can
  // answer with another user's account, which surfaces as the wrong username in the navbar. Retry those.
  retries: 2,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
  use: {
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'legacy',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        baseURL: LEGACY_URL,
      },
    },
    {
      name: 'angular',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        baseURL: ANGULAR_URL,
      },
    },
  ],
});
