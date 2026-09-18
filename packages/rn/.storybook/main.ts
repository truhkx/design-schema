import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

// React Native stories run in the browser through react-native-web so they can
// sit beside the React and Lit stories in the composed root Storybook.
const reactNativeWeb = fileURLToPath(new URL('./react-native-web.ts', import.meta.url));

// react-native-svg's ESM build ships its two PEG.js transform parsers as CommonJS
// (`module.exports = { parse, … }`) and imports them by name from extractTransform.js.
// With the package out of the pre-bundle (below) Vite serves them untouched, so the
// named `parse` import fails and every story that draws an Icon breaks. Wrap just those
// two files as ES modules.
const SVG_PEG_PARSER = /react-native-svg\/lib\/module\/lib\/extract\/transform(ToRn)?\.js$/;
const svgPegParsersAsEsm = {
  name: 'ds:react-native-svg-peg-parsers-as-esm',
  enforce: 'pre' as const,
  transform(code: string, id: string): string | undefined {
    if (!SVG_PEG_PARSER.test(id.split('?')[0]!.replace(/\\/g, '/'))) return undefined;
    return [
      'var module = { exports: {} };',
      code,
      'export const parse = module.exports.parse;',
      'export const SyntaxError = module.exports.SyntaxError;',
      'export default module.exports;',
    ].join('\n');
  },
};

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)', '../demo/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-mcp', '@storybook/addon-docs'],
  viteFinal: (config) => {
    const existing = config.resolve?.alias ?? {};
    const alias = Array.isArray(existing) ? existing : Object.entries(existing).map(([find, replacement]) => ({ find, replacement }));
    return {
      ...config,
      plugins: [...(config.plugins ?? []), svgPegParsersAsEsm],
      define: { ...config.define, __DEV__: true, global: 'window' },
      resolve: {
        ...config.resolve,
        alias: [
          ...alias,
          // The bare specifier goes through a one-file shim (react-native-web plus the `findNodeHandle`
          // it dropped in 0.20); subpaths go straight to react-native-web.
          { find: /^react-native$/, replacement: reactNativeWeb },
          { find: /^react-native\//, replacement: 'react-native-web/' },
          // react-native-svg's web build reads packager assets through React Native's registry, a Flow
          // file that Vite 8's Oxc transformer refuses to parse. react-native-web ships the same
          // registerAsset/getAssetByID pair as plain JavaScript.
          { find: '@react-native/assets-registry/registry', replacement: 'react-native-web/dist/modules/AssetRegistry' },
        ],
        extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', ...(config.resolve?.extensions ?? [])],
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...(config.optimizeDeps?.include ?? []), 'react-native-web'],
        // Vite 8's dependency pre-bundler does not apply the `.web.js`-first extension order above, so it
        // bundles react-native-svg's native entry (Fabric codegen imports that react-native-web lacks).
        // Left out of the pre-bundle, the package is served through Vite's own resolver, which does.
        exclude: [...(config.optimizeDeps?.exclude ?? []), 'react-native-svg'],
      },
    };
  },
};
export default config;
