import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
// Vite's `root` defaults to the working directory, and this config is run from packages/react
// (`pnpm --filter @design-schema/react exec vitest run --config demo-brand/vitest.config.ts`, which
// is how the demo borrows the canonical package's installed React, Testing Library and jsdom rather
// than becoming a workspace package of its own). So the root is set to this file's directory and
// every path below is relative to the demo tree.
const here = dirname(fileURLToPath(import.meta.url));

/**
 * The renamed tree's behavior gate.
 *
 * `behavior/*.web.test.tsx` are `generated/behavior/*.web.test.tsx` put through the same rename as
 * the components: they mount `<CtaButton emphasis="primary">` and still find it with
 * `[data-ds="Button"]`, which is the two halves of the mechanism in one file — the brand's names on
 * the surface, the canonical hooks underneath, where the gates look. `src/*.test.tsx` are the
 * hand-written component tests, renamed the same way.
 *
 * This config deliberately mirrors ../vitest.config.ts rather than extending it: what is being
 * proved is that the renamed tree passes the gate the canonical tree passes, so the two should be
 * readable side by side.
 */
export default defineConfig({
  root: here,
  // The test files sit outside packages/react/src, so the transformer's tsconfig discovery never
  // finds the package's "jsx": "react-jsx" — set the automatic runtime explicitly, as ../vitest.config.ts does.
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  test: {
    environment: 'jsdom',
    include: ['behavior/*.web.test.tsx', 'src/*.test.tsx'],
    setupFiles: ['../src/test-setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      // Demo Brand's generated code imports `@demo/tokens` (themes/demo-brand/naming.md renames the
      // package scope). A real fork publishes that package; here it is the canonical one under
      // another name — the same alias packages/react/demo-brand/tsconfig.json makes for tsc.
      '@demo/tokens': require.resolve('@design-schema/tokens'),
      // Resolved from packages/react for the same reason ../vitest.config.ts does it: these test
      // files cannot walk up their own directory to a node_modules that has them.
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      '@testing-library/react': require.resolve('@testing-library/react'),
      '@testing-library/user-event': require.resolve('@testing-library/user-event'),
    },
  },
});
