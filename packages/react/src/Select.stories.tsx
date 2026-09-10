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

/**
 * Open/present with its trigger, for the keyboard gate. Select's popup composes Listbox, which —
 * per the WAI-ARIA listbox pattern — exposes exactly one focusable node for the whole option list
 * (aria-activedescendant, not per-option tab stops), so three separately-focusable children cannot
 * exist inside a single open Select. Three trigger instances stand in instead, matching the same
 * structural workaround already used by Tooltip.stories.tsx.
 */
export const Keyboard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      <Select label="Country" name="country-a" options={COUNTRIES} />
      <Select label="Role" name="role-b" options={ROLES} />
      <Select label="Export to" name="export-c" options={COUNTRIES} />
    </div>
  ),
};
