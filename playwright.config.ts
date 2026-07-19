import { defineConfig } from '@playwright/test';

const E2E_PORT = 43_173;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}/ethic-brawl/`;

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
    baseURL: E2E_BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `pnpm typecheck && VITE_E2E=true pnpm exec vite build --outDir .e2e-dist && PORT=${E2E_PORT} node scripts/serve-production-e2e.mjs .e2e-dist`,
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
