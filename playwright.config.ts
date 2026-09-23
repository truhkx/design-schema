// Gates that need a browser: keyboard tests derived from the docs' `keyboard` blocks, and an axe pass over
// every story. Playwright starts the platform Storybooks itself (or reuses ones already running).
import { defineConfig, devices } from '@playwright/test';

const storybook = (pkg: string, port: number) => ({
  command: `pnpm --filter @design-schema/${pkg} storybook`,
  url: `http://localhost:${port}/iframe.html`,
  reuseExistingServer: true,
  timeout: 120_000,
});

// Start only the Storybooks the requested --project(s) need. The gates run one platform at a time, and parallel
// regens in separate worktrees would otherwise start each other's Storybooks on these fixed ports and, through
// reuseExistingServer, test another worktree's code. No --project: all three, as before.
const SERVERS = { web: storybook('react', 6007), lit: storybook('lit', 6008), rn: storybook('rn', 6009) };
const requested = process.argv.flatMap((a, i, all) =>
  a.startsWith('--project=') ? [a.slice(10)] : a === '--project' && all[i + 1] ? [all[i + 1]] : []);
const wanted = (Object.keys(SERVERS) as (keyof typeof SERVERS)[]).filter((p) => requested.some((r) => r.endsWith(`-${p}`)));

export default defineConfig({
  testDir: '.',
  testMatch: ['generated/keyboard/**/*.spec.ts', 'tests/gates/**/*.spec.ts'],
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'logs/playwright.json' }]],
  use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
  webServer: (wanted.length > 0 ? wanted : Object.keys(SERVERS) as (keyof typeof SERVERS)[]).map((p) => SERVERS[p]),
  projects: [
    { name: 'keyboard-web', testMatch: /generated\/keyboard\/.*\.web\.spec\.ts/, use: { baseURL: 'http://localhost:6007' } },
    { name: 'keyboard-lit', testMatch: /generated\/keyboard\/.*\.lit\.spec\.ts/, use: { baseURL: 'http://localhost:6008' } },
    { name: 'axe-web', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6007' } },
    { name: 'axe-lit', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6008' } },
    { name: 'axe-rn', testMatch: /tests\/gates\/axe\.spec\.ts/, use: { baseURL: 'http://localhost:6009' } },
  ],
});
