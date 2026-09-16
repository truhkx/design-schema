import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';
import type { ListboxOption } from './Listbox';

const FRUITS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Combobox/React',
  component: Combobox,
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: FRUITS,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* filter */
export const FilterStartsWith: Story = { args: { filter: 'startsWith' } };
export const FilterContains: Story = { args: { filter: 'contains' } };
export const FilterNone: Story = { args: { filter: 'none' } };
export const FilterAsync: Story = { args: { filter: 'async' } };

/* examples */
export const FruitPicker: Story = {
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'apricot', label: 'Apricot' },
      { value: 'banana', label: 'Banana' },
    ],
  },
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

/* notable states */
export const Open: Story = { args: { open: true } };
export const WithDescription: Story = { args: { description: 'Used for the produce order.', placeholder: 'Search fruit' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Choose a fruit from the list.' } };
export const NotClearable: Story = { args: { clearable: false, defaultValue: 'apple' } };

/**
 * Open with its input, for the keyboard gate: the options are the focusable children, reached
 * through aria-activedescendant while DOM focus stays in the input. Args come from the story URL;
 * the story owns `open` so Escape and Tab really close it.
 */
export const Keyboard: Story = {
  args: { open: true },
  render: function KeyboardStory(args) {
    const [open, setOpen] = useState(args.open ?? true);
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
  },
};
