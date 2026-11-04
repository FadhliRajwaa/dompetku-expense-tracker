import { defineConfig } from '@playwright/test';

const baseURL = process.env['E2E_BASE_URL'] ?? 'http://localhost:3100';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL, trace: 'on-first-retry' },
  webServer: process.env['E2E_BASE_URL']
    ? undefined
    : { command: 'pnpm dev --port 3100', url: 'http://localhost:3100', reuseExistingServer: true, timeout: 180000 },
});
