import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Root Storybook: composes the three platform Storybooks with refs so the same
 * component appears three times, side by side — Button/React, Button/Lit,
 * Button/React Native. Run `pnpm storybook` from the repo root.
 */
const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['./welcome.stories.tsx'],
  addons: ['@storybook/addon-mcp'],
  // `type: 'server-checked'` makes the manager fetch index.json with credentials omitted; the child dev
  // servers answer with `Access-Control-Allow-Origin: *`, which browsers refuse when credentials are included.
  refs: {
    react: { title: 'React', url: 'http://localhost:6007', type: 'server-checked' },
    lit: { title: 'Lit (web components)', url: 'http://localhost:6008', type: 'server-checked' },
    rn: { title: 'React Native (via react-native-web)', url: 'http://localhost:6009', type: 'server-checked' },
  },
};
export default config;
