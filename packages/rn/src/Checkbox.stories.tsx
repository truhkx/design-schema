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
    hideLabel: false,
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

/** A required consent checkbox whose label is the agreement itself. */
export const Consent: Story = { args: { label: 'I accept the terms of service', name: 'terms', required: true } };

/** A "select all" parent showing the mixed indicator while only some children are checked. */
export const SelectAllParent: Story = { args: { label: 'Select all', name: 'selectAll', indeterminate: true } };

/** An option whose scope needs one line of explanation under the label. */
export const WithDescription: Story = {
  args: { label: 'Send me product updates', name: 'updates', description: 'One email a month about new features.' },
};

/** A row selection checkbox in a Table, where the row name is the hidden label. */
export const SelectionColumn: Story = { args: { label: 'Select row', name: 'select', hideLabel: true } };

export const WithError: Story = {
  args: { label: 'I accept the terms of service', name: 'terms', required: true, error: 'Accept the terms to continue.' },
};

/** Marked invalid without a message, as the Form does before its own error arrives. */
export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
