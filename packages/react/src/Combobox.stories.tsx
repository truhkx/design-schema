import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';
import type { ListboxOption } from './Listbox';

const FRUITS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'papaya', label: 'Papaya' },
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
export const FilterAsync: Story = {
  args: { filter: 'async', options: FRUITS.slice(0, 3) },
  render: (args) => {
    function AsyncDemo() {
      const [options, setOptions] = useState(args.options);
      const [loading, setLoading] = useState(false);
      return (
        <Combobox
          {...args}
          options={options}
          loading={loading}
          onInputChange={(text) => {
            setLoading(true);
            setTimeout(() => {
              setOptions(FRUITS.filter((option) => 'label' in option && option.label.toLowerCase().includes(text.toLowerCase())));
              setLoading(false);
            }, 300);
          }}
        />
      );
    }
    return <AsyncDemo />;
  },
};

/* notable states */
export const Multiple: Story = {
  args: { label: 'Role', name: 'role', options: ROLES, multiple: true, defaultValue: ['frontend'] },
};

export const AllowCustom: Story = {
  args: { label: 'Tags', name: 'tags', multiple: true, allowCustom: true, defaultValue: ['launch'] },
};

export const WithDescription: Story = {
  args: { description: 'Used for the produce order.' },
};

export const Required: Story = { args: { required: true } };

export const Placeholder: Story = { args: { placeholder: 'Search fruit' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };

export const InvalidWithError: Story = {
  args: { invalid: true, error: 'Fruit is required.' },
};

export const DefaultValue: Story = { args: { defaultValue: 'cherry' } };

export const NotClearable: Story = { args: { clearable: false, defaultValue: 'mango' } };

/**
 * Open/present with its trigger, for the keyboard gate. Unlike Select's popup (a single
 * aria-activedescendant listbox with one focus stop), a Combobox's own field always carries
 * several real focus stops — the input plus its clear and toggle buttons — so a single `multiple`
 * instance with existing chips (each with its own removable button) already clears the "at least
 * three focusable children" bar without needing the popup open.
 */
export const Keyboard: Story = {
  args: { label: 'Role', name: 'role-keyboard', options: ROLES, multiple: true, defaultValue: ['frontend', 'backend'] },
};
