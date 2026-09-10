import { defineConfig } from 'vitest/config';

// Lit elements are form-associated (ElementInternals), use delegatesFocus and :focus-visible —
// none of which jsdom implements — so the tests run in a real headless Chromium via Playwright
// (`npx playwright install chromium` once). The tests gate runs `pnpm test -- src/<Name>.test.ts`.
// The behavior gate (tools/behavior_tests.py) writes generated/behavior/<Name>.lit.test.ts,
// run with `pnpm test -- generated/behavior/<Name>.lit`; it is included here too.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', '../../generated/behavior/*.lit.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
