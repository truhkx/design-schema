import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/web-components-vite', options: {} },
  stories: ['../src/**/*.stories.ts', '../demo/**/*.stories.ts'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
};
export default config;
