import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsPage } from './SettingsPage';
import { ToastProvider } from '../src';
import { withTheme } from '../src/decorators';

const meta: Meta<typeof SettingsPage> = {
  title: 'Patterns/SettingsPage',
  component: SettingsPage,
  // The story stands in for the app root, which is where the ToastProvider (and its region) lives.
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
    withTheme(),
  ],
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

export const Default: Story = {};
