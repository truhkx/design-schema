import type { StorybookConfig } from '@storybook/react-native';

// The same story files the react-native-web Storybook (packages/rn, port 6009) renders, on a device.
// On-device addons go under `deviceAddons` (Storybook React Native 10.4+) so Storybook core never
// tries to load them as Node presets.
const main: StorybookConfig = {
  stories: ['../../../packages/rn/src/**/*.stories.@(ts|tsx)'],
  deviceAddons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-backgrounds',
  ],
};

export default main;
