import { defineConfig } from 'tsup';

// ESM + types to dist/. Importing the package registers every custom element (sideEffects: true).
// Decorators and useDefineForClassFields come from tsconfig.json, which esbuild reads.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['lit', '@design-schema/tokens'],
});
