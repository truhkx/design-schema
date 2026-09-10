import { defineConfig } from 'tsup';

// ESM + types to dist/. JSX is compiled to React.createElement (the files import React) rather than
// preserved, so the output is plain JavaScript for Metro and for react-native-web alike.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-native', 'react-native-svg', '@design-schema/tokens'],
  esbuildOptions(options) {
    options.jsx = 'transform';
  },
});
