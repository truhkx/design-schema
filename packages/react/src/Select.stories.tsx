import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';
import type { ListboxOption } from './Listbox';

const COUNTRIES: ListboxOption[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
];

const ROLES: ListboxOption[] = [
  {
    group: 'Engineering',
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
    ],
  },
  {
    group: 'Design',
    options: [
      { value: 'product', label: 'Product design' },
      { value: 'brand', label: 'Brand design' },
    ],
  },
];

const meta: Meta<typeof Select> = {
  title: 'Select/React',
  component: Select,
  args: {
    label: 'Country',
    name: 'country',
    options: COUNTRIES,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* native */
export const NativeAuto: Story = { args: { native: 'auto' } };
export const NativeAlways: Story = { args: { native: 'always' } };
export const NativeNever: Story = { args: { native: 'never' } };

/* examples */
export const CountryPicker: Story = {
  args: {
    label: 'Country',
    name: 'country',
    placeholder: 'Choose a country',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'fr', label: 'France' },
      { value: 'jp', label: 'Japan' },
    ],
  },
};

export const MultiSelectRoles: Story = {
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
    ],
  },
};

export const ForcedNativePicker: Story = {
  args: {
    label: 'Country',
    name: 'country',
    native: 'always',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'us', label: 'United States' },
    ],
  },
};

export const CompactPickerInAHeader: Story = {
  args: {
    label: 'Month',
    name: 'month',
    hideLabel: true,
    size: 'sm',
    options: [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
    ],
  },
};

/* notable states */
export const Multiple: Story = {
  args: { label: 'Role', name: 'role', options: ROLES, multiple: true, defaultValue: ['frontend', 'backend', 'brand'] },
};

export const WithDescription: Story = { args: { description: 'Used for shipping and tax rates.' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'fr' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithError: Story = { args: { error: 'Choose the country you ship to.' } };

export const DefaultValue: Story = { args: { defaultValue: 'fr' } };

/**
 * Open with its trigger, for the keyboard gate: the popup's Listbox holds the six country options
 * (focusable children through aria-activedescendant) while focus stays on the trigger. Args come
 * from the story URL; the story owns `open` so Escape and Tab really close it.
 */
export const Keyboard: Story = {
  args: { open: true },
  render: function KeyboardStory(args) {
    const [open, setOpen] = useState(args.open ?? true);
    return (
      <Select
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
