import type { Meta, StoryObj } from '@storybook/react';
import { Listbox, type ListboxOption } from './Listbox';

const FRUITS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const PEOPLE: ListboxOption[] = [
  { value: 'ana', label: 'Ana Souza', description: 'Product design' },
  { value: 'bo', label: 'Bo Lin', description: 'Engineering' },
  { value: 'cara', label: 'Cara Nash', description: 'Engineering', icon: 'success' },
  { value: 'deshawn', label: 'DeShawn Reid', description: 'Out of office', disabled: true },
];

const GROUPED: ListboxOption[] = [
  {
    group: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ],
  },
  {
    group: 'Vegetable',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'daikon', label: 'Daikon' },
    ],
  },
];

const meta = {
  title: 'Listbox/React',
  component: Listbox,
  args: {
    label: 'Fruit',
    options: FRUITS,
  },
  argTypes: {
    onChange: { action: 'onChange' },
    onActiveChange: { action: 'onActiveChange' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Listbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* maxVisible */
export const MaxVisible5: Story = { args: { maxVisible: '5', options: [...FRUITS, { value: 'fig', label: 'Fig' }, { value: 'grape', label: 'Grape' }] } };
export const MaxVisible8: Story = { args: { maxVisible: '8' } };
export const MaxVisible12: Story = { args: { maxVisible: '12' } };
export const MaxVisibleAll: Story = { args: { maxVisible: 'all' } };

/* notable states */
export const WithDescriptions: Story = { args: { label: 'Assignee', options: PEOPLE } };
export const Grouped: Story = { args: { label: 'Ingredient', options: GROUPED } };
export const Multiple: Story = { args: { multiple: true, defaultValue: ['apple', 'cherry'] } };
export const SelectionFollowsFocusFalse: Story = { args: { selectionFollowsFocus: false } };
export const Required: Story = { args: { required: true, name: 'fruit' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Empty: Story = { args: { options: [] } };
export const EmptyWithMessage: Story = { args: { options: [], emptyMessage: 'No matching people' } };
export const Controlled: Story = { args: { value: 'cherry' } };

/** Present with at least three options, for the keyboard gate — Listbox has no trigger or popup. */
export const Keyboard: Story = {
  args: { options: FRUITS },
};
