import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';
import type { ComboboxProps } from './Combobox';
import { withTheme } from './decorators';

const FRUIT = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Combobox/React Native',
  component: Combobox,
  decorators: [withTheme()],
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: FRUIT,
    filter: 'contains',
    multiple: false,
    allowCustom: false,
    required: false,
    disabled: false,
    invalid: false,
    loading: false,
    clearable: true,
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

export const Default: Story = {};

// filter
export const FilterStartsWith: Story = { args: { filter: 'startsWith' } };
export const FilterContains: Story = { args: { filter: 'contains' } };
export const FilterNone: Story = { args: { filter: 'none' } };
export const FilterAsync: Story = { args: { filter: 'async' } };

// examples
export const FruitPicker: Story = {
  args: { label: 'Fruit', name: 'fruit', options: FRUIT },
};

export const MultiSelectWithChips: Story = {
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
    ],
  },
};

export const FreeTextTags: Story = {
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'billing', label: 'Billing' },
    ],
  },
};

export const AsyncResults: Story = {
  args: {
    label: 'Customer',
    name: 'customer',
    filter: 'async',
    loading: true,
    options: [{ value: 'acme', label: 'Acme Ltd' }],
  },
};

// notable states
export const Grouped: Story = {
  args: {
    options: [
      { group: 'Pome', options: [{ value: 'apple', label: 'Apple' }] },
      {
        group: 'Stone',
        options: [
          { value: 'apricot', label: 'Apricot' },
          { value: 'cherry', label: 'Cherry' },
        ],
      },
    ],
  },
};

export const Empty: Story = { args: { options: [] } };

export const ClearableFalse: Story = { args: { defaultValue: 'apple', clearable: false } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'apple' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithError: Story = { args: { error: 'Choose a fruit.' } };

export const WithDescription: Story = { args: { description: 'Pick the one you want delivered.', placeholder: 'Search fruit' } };

function KeyboardCombobox(args: ComboboxProps): React.JSX.Element {
  // The story owns `open`: it starts open and writes onOpenChange back, so Escape and Tab can close it.
  const [open, setOpen] = React.useState<boolean>(args.open ?? true);
  return (
    <Combobox
      {...args}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        args.onOpenChange?.(next);
      }}
    />
  );
}

/**
 * Rendered open with the input, the clear and toggle buttons and three option rows, for the axe
 * gate and manual keyboard checks on react-native-web. `defaultValue: apple` makes the clear
 * button render.
 */
export const Keyboard: Story = {
  args: { open: true, defaultValue: 'apple', options: FRUIT },
  render: (args) => <KeyboardCombobox {...args} />,
};
