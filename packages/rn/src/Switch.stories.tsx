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

export const WithDescription: Story = {
  args: { description: 'Sends a daily summary at 9:00.' },
};

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
