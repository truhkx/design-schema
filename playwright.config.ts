// Gates that need a browser: keyboard tests derived from the docs' `keyboard` blocks, and an axe pass over
// every story. Playwright starts the platform Storybooks itself (or reuses ones already running).
import { defineConfig, devices } from '@playwright/test';

const storybook = (pkg: string, port: number) => ({
  command: `pnpm --filter @design-schema/${pkg} storybook`,
  url: `http://localhost:${port}/iframe.html`,
  reuseExistingServer: true,
  timeout: 120_000,
});

export default defineConfig({
  testDir: '.',
  testMatch: ['generated/keyboard/**/*.spec.ts', 'tests/gates/**/*.spec.ts'],
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'logs/playwright.json' }]],
  use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
  webServer: [storybook('react', 6007), storybook('lit', 6008), storybook('rn', 6009)],
  projects: [
    { name: 'keyboard-web', testMatch: /generated\/keyboard\/.*\.web\.spec\.ts/, use: { baseURL: 'http://localhost:6007' } },
    { name: 'keyboard-lit', testMatch: /generated\/keyboard\/.*\.lit\.spec\.ts/, use: { baseURL: 'http://localhost:6008' } },
    { name: 'axe-web', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6007' } },
    { name: 'axe-lit', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6008' } },
    { name: 'axe-rn', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6009' } },
  ],
});
