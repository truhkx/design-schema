import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

// React Native stories run in the browser through react-native-web so they can
// sit beside the React and Lit stories in the composed root Storybook.
const reactNativeWeb = fileURLToPath(new URL('./react-native-web.ts', import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)', '../demo/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-mcp', '@storybook/addon-docs'],
  viteFinal: (config) => {
    const existing = config.resolve?.alias ?? {};
    const alias = Array.isArray(existing) ? existing : Object.entries(existing).map(([find, replacement]) => ({ find, replacement }));
    return {
      ...config,
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
