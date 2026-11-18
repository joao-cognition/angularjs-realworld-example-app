import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1, // api.realworld.show is a shared public API and occasionally drops a request
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'legacy', use: { baseURL: 'http://localhost:4000' } },
    { name: 'angular', use: { baseURL: 'http://localhost:4200' } },
  ],
});
