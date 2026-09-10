import type { StorybookConfig } from '@storybook/react-vite';

// React Native stories run in the browser through react-native-web so they can
// sit beside the React and Lit stories in the composed root Storybook.
const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)', '../demo/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  viteFinal: (config) => ({
    ...config,
    define: { ...config.define, __DEV__: true, global: 'window' },
    resolve: {
      ...config.resolve,
      alias: { ...(config.resolve?.alias ?? {}), 'react-native': 'react-native-web' },
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', ...(config.resolve?.extensions ?? [])],
    },
    optimizeDeps: { ...config.optimizeDeps, include: [...(config.optimizeDeps?.include ?? []), 'react-native-web'] },
  }),
};
export default config;
