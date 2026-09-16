import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';
import { withTheme } from './decorators';

const meta: Meta<typeof Switch> = {
  title: 'Switch/React Native',
  component: Switch,
  decorators: [withTheme()],
  args: {
    label: 'Email notifications',
    defaultChecked: false,
    disabled: false,
    description: undefined,
    labelPosition: 'start',
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

// labelPosition
export const LabelPositionStart: Story = { args: { labelPosition: 'start' } };
export const LabelPositionEnd: Story = { args: { labelPosition: 'end' } };

export const On: Story = { args: { defaultChecked: true } };

// examples
export const SettingsRow: Story = { args: { label: 'Email notifications', labelPosition: 'start' } };

export const WithDescription: Story = {
  args: { label: 'Daily summary', description: 'Sends a daily summary at 9:00.' },
};

export const CheckboxAligned: Story = { args: { label: 'Show archived', labelPosition: 'end' } };

export const Disabled: Story = { args: { label: 'Two-factor authentication', disabled: true } };
