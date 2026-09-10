import { defineConfig } from 'tsup';

// ESM + types to dist/. Component CSS (`import './Button.css'`) is bundled into dist/index.css,
// exported as `@design-schema/react/index.css`; consumers import it once next to the token sheet.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom', '@design-schema/tokens'],
});
