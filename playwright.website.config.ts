// The website's own browser gates, separate from playwright.config.ts on purpose: that config
// starts all three package Storybooks for every run, and a header gate has no business waiting on
// them (or failing when one of them fails to build). Run with `pnpm gates:website`.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/website',
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'logs/playwright-website.json' }]],
  // Deliberately *not* `reducedMotion: 'reduce'` like the Storybook gates: reduced motion makes
  // SidePanel unmount synchronously on close, which is the easy half of the focus-return contract.
  // The gate should exercise the transition path a visitor without that preference actually gets.
  use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}` },
  webServer: {
    // `astro preview` serves dist/ off disk, so `pnpm gates:website` builds first and a preview
    // already running (from `pnpm --filter website preview`) can be reused without going stale.
    // The gate is over the static output that ships, not the dev server.
    command: `pnpm --filter website exec astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
