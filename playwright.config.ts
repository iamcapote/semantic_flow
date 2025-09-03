import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['junit', { outputFile: 'playwright-results.xml' }]],
  use: {
    baseURL: process.env.APP_BASE_URL || 'http://localhost:8081',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    port: 8081,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
