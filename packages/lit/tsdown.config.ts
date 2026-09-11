import { defineConfig } from 'tsdown';
import { litDecorators } from './decorators.plugin.mjs';

// ESM + types to dist/. Importing the package registers every custom element (sideEffects: true).
// Declarations come from oxc's isolated-declarations transform (no TypeScript compiler API involved),
// which is why tsconfig.json has `isolatedDeclarations: true`. The elements use standard (TC39)
// decorators with `accessor` fields, lowered by the Babel plugin below (Oxc does not lower them).
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { isolatedDeclarations: true },
  sourcemap: true,
  clean: true,
  platform: 'neutral',
  target: 'es2022',
  deps: { neverBundle: ['lit', '@design-schema/tokens'] },
  plugins: [litDecorators()],
});
