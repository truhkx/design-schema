import { defineConfig } from 'vitest/config';

// The TypeScript tools' unit tests (tools/__tests__, mcp/__tests__ and tokens/__tests__, which checks the
// output of `pnpm tokens`). The packages keep their own Vitest/Jest configs; `pnpm test:tools` runs only
// these.
export default defineConfig({
  test: {
    include: ['tools/__tests__/**/*.test.ts', 'mcp/__tests__/**/*.test.ts', 'tokens/__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
