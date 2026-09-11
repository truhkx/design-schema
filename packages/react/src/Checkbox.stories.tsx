import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Checkbox/React',
  component: Checkbox,
  args: {
    label: 'Send me product updates',
    name: 'updates',
    value: 'on',
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    invalid: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* states */
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { label: 'Select all', name: 'all', indeterminate: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Required: Story = {
  args: { label: 'I agree to the terms', name: 'terms', required: true },
};
export const WithDescription: Story = {
  args: { description: 'One email a month about new features. No marketing.' },
};
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = {
  args: { label: 'I agree to the terms', name: 'terms', required: true, error: 'Accept the terms to continue.' },
};
export const Controlled: Story = { args: { checked: true } };
export const HideLabel: Story = {
  args: { label: 'Select row', name: 'select-row', hideLabel: true },
};
