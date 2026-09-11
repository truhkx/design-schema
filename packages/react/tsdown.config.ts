import { defineConfig } from 'tsdown';

// ESM + types to dist/. Declarations come from oxc's isolated-declarations transform (no TypeScript
// compiler API involved), which is why tsconfig.json has `isolatedDeclarations: true`. Component CSS
// (`import './Button.css'`) is bundled by @tsdown/css into dist/index.css, exported as
// `@design-schema/react/index.css`; consumers import it once next to the token sheet.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { isolatedDeclarations: true },
  sourcemap: true,
  clean: true,
  platform: 'neutral',
  target: 'es2022',
  deps: { neverBundle: ['react', 'react-dom', '@design-schema/tokens'] },
  css: { fileName: 'index.css' },
});
