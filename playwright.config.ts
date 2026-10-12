import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'node server/index.mjs',
        url: 'http://127.0.0.1:4175/api/health',
        env: {
          HOST: '127.0.0.1',
          PORT: '4175',
          DATABASE_PATH: ':memory:',
          PUBLIC_ORIGIN: 'http://127.0.0.1:4175',
        },
        reuseExistingServer: false,
      },
});
