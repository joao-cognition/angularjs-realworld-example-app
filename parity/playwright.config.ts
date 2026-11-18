import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['json', { outputFile: 'report/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'legacy', use: { baseURL: process.env.LEGACY_URL || 'http://localhost:4000' } },
    { name: 'angular', use: { baseURL: process.env.ANGULAR_URL || 'http://localhost:4200' } },
  ],
});
