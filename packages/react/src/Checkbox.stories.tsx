import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Checkbox/React',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    label: 'Send me product updates',
    name: 'updates',
    value: 'on',
    hideLabel: false,
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

/* examples */
export const Consent: Story = {
  args: { label: 'I accept the terms of service', name: 'terms', required: true },
};
export const SelectAllParent: Story = {
  args: { label: 'Select all', name: 'selectAll', indeterminate: true },
};
export const WithDescription: Story = {
  args: { label: 'Send me product updates', name: 'updates', description: 'One email a month about new features.' },
};
export const SelectionColumn: Story = {
  args: { label: 'Select row', name: 'select', hideLabel: true },
};

/* states */
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = {
  args: {
    label: 'I accept the terms of service',
    name: 'terms',
    required: true,
    error: 'Accept the terms to continue.',
  },
};
export const Controlled: Story = { args: { checked: true } };
