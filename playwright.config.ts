import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/ethic-brawl/',
    headless: true,
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command:
      'pnpm typecheck && VITE_E2E=true pnpm exec vite build --outDir .e2e-dist && node scripts/serve-production-e2e.mjs .e2e-dist',
    url: 'http://127.0.0.1:4173/ethic-brawl/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
