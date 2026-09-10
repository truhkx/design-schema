import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

// The tests gate (tools/checks.py) runs `pnpm test -- src/<Name>.test.tsx` per component.
// jsdom is enough for React: the components are native elements with ARIA, not layout.
// The behavior gate (tools/behavior_tests.py) writes generated/behavior/<Name>.web.test.tsx,
// run with `pnpm test -- generated/behavior/<Name>.web`; it is included here too.
export default defineConfig({
  // generated/behavior/*.web.test.tsx sits outside src/, so esbuild's tsconfig discovery (which
  // walks up from the file being transformed) never finds this package's "jsx": "react-jsx" —
  // set the automatic runtime explicitly so it applies there too.
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.tsx', '../../generated/behavior/*.web.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      // generated/behavior/*.web.test.tsx lives outside this package (it is shared across
      // packages), so its bare imports — including the automatic JSX runtime esbuild inserts —
      // can't walk up its own directory to find this package's node_modules. Resolve them here.
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      '@testing-library/react': require.resolve('@testing-library/react'),
      '@testing-library/user-event': require.resolve('@testing-library/user-event'),
    },
  },
});
