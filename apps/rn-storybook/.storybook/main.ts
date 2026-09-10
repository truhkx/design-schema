import type { StorybookConfig } from '@storybook/react-native';

// The same story files the react-native-web Storybook (packages/rn, port 6009) renders, on a device.
const main: StorybookConfig = {
  stories: ['../../../packages/rn/src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-backgrounds',
  ],
};

export default main;
