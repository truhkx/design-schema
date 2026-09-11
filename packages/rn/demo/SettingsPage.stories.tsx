import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPage } from './SettingsPage';
import { withTheme } from '../src/decorators';

const meta: Meta<typeof SettingsPage> = {
  title: 'Patterns/SettingsPage',
  component: SettingsPage,
  decorators: [withTheme()],
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

export const Default: Story = {};
