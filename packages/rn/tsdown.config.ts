import { defineConfig } from 'tsdown';

// ESM + types to dist/. Declarations come from oxc's isolated-declarations transform (no TypeScript
// compiler API involved), which is why tsconfig.json has `isolatedDeclarations: true`. JSX is compiled
// to React.createElement (the files import React) rather than preserved, so the output is plain
// JavaScript for Metro and for react-native-web alike.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { isolatedDeclarations: true },
  sourcemap: true,
  clean: true,
  platform: 'neutral',
  target: 'es2022',
  deps: { neverBundle: ['react', 'react-native', 'react-native-svg', '@design-schema/tokens'] },
  inputOptions: {
    transform: { jsx: { runtime: 'classic' } },
  },
});
