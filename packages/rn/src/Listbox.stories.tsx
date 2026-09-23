import type { Meta, StoryObj } from '@storybook/react-vite';
import { Listbox } from './Listbox';
import type { ListboxItem } from './Listbox';
import { withTheme } from './decorators';

const people: ListboxItem[] = [
  { value: 'alex', label: 'Alex Kim', description: 'Design' },
  { value: 'sam', label: 'Sam Patel', description: 'Engineering' },
  { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
  { value: 'lee', label: 'Lee Chen', description: 'Product' },
];

// The Default story's args are the `single-picker` example on every platform.
const meta: Meta<typeof Listbox> = {
  title: 'Listbox/React Native',
  component: Listbox,
  decorators: [withTheme()],
  args: {
    label: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
    multiple: false,
    selectionFollowsFocus: true,
    required: false,
    disabled: false,
    maxVisible: '8',
  },
};

export default meta;

type Story = StoryObj<typeof Listbox>;

export const Default: Story = {};

// maxVisible
export const MaxVisible5: Story = { args: { maxVisible: '5' } };
export const MaxVisible8: Story = { args: { maxVisible: '8' } };
export const MaxVisible12: Story = { args: { maxVisible: '12' } };
export const MaxVisibleAll: Story = { args: { maxVisible: 'all' } };

export const Multiple: Story = {
  args: { label: 'Reviewers', options: people, defaultValue: ['sam', 'jo'], multiple: true },
};

export const Grouped: Story = {
  args: {
    label: 'Assignee',
    defaultValue: 'sam',
    options: [
      { group: 'Design', options: [{ value: 'alex', label: 'Alex Kim' }] },
      {
        group: 'Engineering',
        options: [
          { value: 'sam', label: 'Sam Patel' },
          { value: 'jo', label: 'Jo Rivera' },
        ],
      },
      { group: 'Product', options: [{ value: 'lee', label: 'Lee Chen' }] },
    ],
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Status',
    defaultValue: 'open',
    options: [
      { value: 'open', label: 'Open', icon: 'info' },
      { value: 'closed', label: 'Closed', icon: 'success' },
    ],
  },
};

export const OptionDisabled: Story = {
  args: {
    label: 'Assignee',
    options: [
      { value: 'alex', label: 'Alex Kim', description: 'Design' },
      { value: 'sam', label: 'Sam Patel', description: 'Engineering', disabled: true },
      { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
    ],
  },
};

export const Required: Story = { args: { required: true, name: 'fruit' } };

export const Invalid: Story = { args: { invalid: true } };

export const ErrorMessage: Story = { args: { error: 'Choose a fruit before continuing.' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };

export const Empty: Story = { args: { options: [], emptyMessage: 'No matching fruit' } };

export const Loading: Story = { args: { options: [], loading: true } };

export const Embedded: Story = { args: { embedded: true } };

export const InitialActiveValue: Story = { args: { label: 'Assignee', options: people, initialActiveValue: 'jo' } };

/** A host-driven active row: pre-highlights `jo` the way a Select or Combobox would. */
export const ActiveValue: Story = { args: { label: 'Assignee', options: people, activeValue: 'jo' } };

// Examples from the component doc.

/** The standalone visible picker, where arrows select as they move. */
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

/** Any number of selections, each selected row carrying a check. */
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

/** Options under group headings, for a list long enough to need sections. */
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

/** The same engine inside a Select or Combobox popup, which owns the surface, capped at five rows. */
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

/** At least three focusable rows, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: { label: 'Assignee', defaultValue: 'sam', options: people },
};
