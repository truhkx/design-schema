import type { StorybookConfig } from '@storybook/web-components-vite';
import { litDecorators } from '../decorators.plugin.mjs';

const config: StorybookConfig = {
  framework: { name: '@storybook/web-components-vite', options: {} },
  stories: ['../src/**/*.stories.ts', '../demo/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-mcp', '@storybook/addon-docs'],
  // Standard decorators (`accessor`) are lowered by Babel; Vite 8's Oxc transformer leaves them as-is.
  viteFinal: (viteConfig) => ({ ...viteConfig, plugins: [litDecorators(), ...(viteConfig.plugins ?? [])] }),
};
export default config;
