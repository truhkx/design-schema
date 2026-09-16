import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Switch/React',
  component: Switch,
  tags: ['autodocs'],
  args: {
    label: 'Email notifications',
    defaultChecked: false,
    disabled: false,
    labelPosition: 'start',
  },
  argTypes: {
    labelPosition: { control: 'inline-radio', options: ['start', 'end'] },
    onChange: { action: 'onChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* labelPosition */
export const LabelPositionStart: Story = { args: { labelPosition: 'start' } };
export const LabelPositionEnd: Story = { args: { labelPosition: 'end' } };

/* examples */
export const SettingsRow: Story = { args: { label: 'Email notifications', labelPosition: 'start' } };
export const WithDescription: Story = {
  args: { label: 'Daily summary', description: 'Sends a daily summary at 9:00.' },
};
export const CheckboxAligned: Story = { args: { label: 'Show archived', labelPosition: 'end' } };
export const Disabled: Story = { args: { label: 'Two-factor authentication', disabled: true } };

/* states */
export const On: Story = { args: { defaultChecked: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };
export const Controlled: Story = { args: { checked: true } };
