import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';
import { withTheme } from './decorators';

const meta: Meta<typeof Checkbox> = {
  title: 'Checkbox/React Native',
  component: Checkbox,
  decorators: [withTheme()],
  args: {
    label: 'Send me product updates',
    name: 'updates',
    value: 'on',
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    invalid: false,
    description: undefined,
    error: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

/** For a selection column in a Table, where the row name is the label. */
export const HideLabel: Story = { args: { label: 'Select row', name: 'row-1', hideLabel: true } };

export const WithDescription: Story = {
  args: { description: 'One email a month; no marketing from partners.' },
};

/** A "select all" parent whose children are partly selected. Announced as "mixed". */
export const Indeterminate: Story = { args: { label: 'Select all', name: 'all', indeterminate: true } };

/** Consent and agreement: the label carries the required indicator. */
export const Required: Story = { args: { label: 'I agree to the terms', name: 'terms', required: true } };

export const WithError: Story = {
  args: { label: 'I agree to the terms', name: 'terms', required: true, error: 'Accept the terms to continue.' },
};

/** Marked invalid without a message, as the Form does before its own error arrives. */
export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
