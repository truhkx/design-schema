import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { litDecorators } from './decorators.plugin.mjs';

// Lit elements are form-associated (ElementInternals), use delegatesFocus and :focus-visible —
// none of which jsdom implements — so the tests run in a real headless Chromium via Playwright
// (`npx playwright install chromium` once). The tests gate runs `pnpm test -- src/<Name>.test.ts`.
// The behavior gate (tools/behavior_tests.py) writes generated/behavior/<Name>.lit.test.ts,
// run with `pnpm test -- generated/behavior/<Name>.lit`; it is included here too.
export default defineConfig({
  // Standard decorators (`accessor`) are lowered by Babel; Vite 8's Oxc transformer leaves them as-is.
  plugins: [litDecorators()],
  resolve: {
    alias: {
      // Vitest 5 moved the browser context (userEvent, page…) to the virtual module `vitest/browser`;
      // `@vitest/browser/context` is now a stub that throws. Tests generated before the move
      // (packages/lit/src/*.test.ts, generated/behavior/*.lit.test.ts) still import the old path,
      // and they change only through regeneration, so resolve it here.
      '@vitest/browser/context': 'vitest/browser',
    },
  },
  test: {
    include: ['src/**/*.test.ts', '../../generated/behavior/*.lit.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
});
