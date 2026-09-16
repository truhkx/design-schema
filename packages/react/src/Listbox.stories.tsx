import type { Meta, StoryObj } from '@storybook/react-vite';
import { Listbox, type ListboxOption } from './Listbox';

const FRUITS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const MANY_FRUITS: ListboxOption[] = [
  ...FRUITS,
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mango', label: 'Mango' },
  { value: 'nectarine', label: 'Nectarine' },
  { value: 'orange', label: 'Orange' },
  { value: 'papaya', label: 'Papaya' },
];

const PEOPLE: ListboxOption[] = [
  { value: 'ana', label: 'Ana Souza', description: 'Product design' },
  { value: 'bo', label: 'Bo Lin', description: 'Engineering' },
  { value: 'cara', label: 'Cara Nash', description: 'Engineering', icon: 'success' },
  { value: 'deshawn', label: 'DeShawn Reid', description: 'Out of office', disabled: true },
];

const meta: Meta<typeof Listbox> = {
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* maxVisible */
export const MaxVisible5: Story = { args: { maxVisible: '5', options: MANY_FRUITS } };
export const MaxVisible8: Story = { args: { maxVisible: '8', options: MANY_FRUITS } };
export const MaxVisible12: Story = { args: { maxVisible: '12', options: MANY_FRUITS } };
export const MaxVisibleAll: Story = { args: { maxVisible: 'all', options: MANY_FRUITS } };

/* examples */
export const SinglePicker: Story = {
  args: {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
  },
};

export const MultiSelectWithChecks: Story = {
  args: {
    label: 'Roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
    ],
  },
};

export const GroupedOptions: Story = {
  args: {
    label: 'Role',
    options: [
      {
        group: 'Engineering',
        options: [
          { value: 'frontend', label: 'Frontend' },
          { value: 'backend', label: 'Backend' },
        ],
      },
      { group: 'Design', options: [{ value: 'product', label: 'Product design' }] },
    ],
  },
};

export const EmbeddedInAPopup: Story = {
  args: {
    label: 'Country',
    embedded: true,
    maxVisible: '5',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'fr', label: 'France' },
      { value: 'jp', label: 'Japan' },
    ],
  },
};

/* notable states */
export const WithDescriptions: Story = { args: { label: 'Assignee', options: PEOPLE } };
export const SelectionFollowsFocusFalse: Story = { args: { selectionFollowsFocus: false } };
export const Required: Story = { args: { required: true, name: 'fruit' } };
export const Invalid: Story = { args: { invalid: true } };
export const ErrorMessage: Story = { args: { error: 'Fix this before continuing.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Loading: Story = { args: { loading: true, options: [] } };
export const InitialActiveValue: Story = { args: { initialActiveValue: 'cherry' } };
export const Empty: Story = { args: { options: [] } };
export const EmptyWithMessage: Story = { args: { options: [], emptyMessage: 'No matching people' } };
export const Controlled: Story = { args: { value: 'cherry' } };

/** Present with at least three options, for the keyboard gate — Listbox has no trigger or popup. */
export const Keyboard: Story = {
  args: { options: FRUITS },
};
