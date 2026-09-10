import type { Meta, StoryObj } from '@storybook/react';
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

const meta = {
  title: 'Select/React',
  component: Select,
  args: {
    label: 'Country',
    name: 'country',
    options: COUNTRIES,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

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

/* notable states */
export const Multiple: Story = {
  args: { label: 'Role', name: 'role', options: ROLES, multiple: true },
};

export const WithDescription: Story = {
  args: { description: 'Used for shipping and tax rates.' },
};

export const Required: Story = { args: { required: true } };

export const Placeholder: Story = { args: { placeholder: 'Choose a country' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'fr' } };

export const InvalidWithError: Story = {
  args: { invalid: true, error: 'Country is required.' },
};

export const DefaultValue: Story = { args: { defaultValue: 'fr' } };

export const HideLabel: Story = { args: { hideLabel: true } };

/**
 * Open/present with its trigger, for the keyboard gate. The first Select renders with `open`, so
 * the popup and its composed (embedded) Listbox are present; per the WAI-ARIA listbox pattern the
 * Listbox exposes exactly one focusable node for the whole option list (aria-activedescendant, not
 * per-option tab stops), so two further closed triggers stand alongside it to reach three
 * focusable children without adding any decorator-only focusable element.
 */
export const Keyboard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Select label="Country" name="country-a" options={COUNTRIES} open />
      <Select label="Role" name="role-b" options={ROLES} />
      <Select label="Export to" name="export-c" options={COUNTRIES} />
    </div>
  ),
};
