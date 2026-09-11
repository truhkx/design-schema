import { defineConfig } from 'vitest/config';

// The TypeScript tools' unit tests (tools/__tests__). The packages keep their own Vitest/Jest configs;
// `pnpm test:tools` runs only these.
export default defineConfig({
  test: {
    include: ['tools/__tests__/**/*.test.ts'],
    environment: 'node',
  },
});
