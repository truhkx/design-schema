import type { Meta, StoryObj } from '@storybook/react';
import { Listbox } from './Listbox';
import { withTheme } from './decorators';

const meta: Meta<typeof Listbox> = {
  title: 'Listbox/React Native',
  component: Listbox,
  decorators: [withTheme()],
  args: {
    label: 'Assignee',
    options: [
      { value: 'alex', label: 'Alex Kim', description: 'Design' },
      { value: 'sam', label: 'Sam Patel', description: 'Engineering' },
      { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
      { value: 'lee', label: 'Lee Chen', description: 'Product' },
    ],
    defaultValue: 'sam',
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
  args: {
    label: 'Reviewers',
    defaultValue: ['sam', 'jo'],
    multiple: true,
  },
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
    options: [
      { value: 'alex', label: 'Alex Kim', description: 'Design' },
      { value: 'sam', label: 'Sam Patel', description: 'Engineering', disabled: true },
      { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
    ],
  },
};

export const Required: Story = { args: { defaultValue: undefined, required: true, name: 'assignee' } };

export const Disabled: Story = { args: { disabled: true } };

export const Empty: Story = { args: { options: [], emptyMessage: 'No matching people' } };

/** At least three focusable rows, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    label: 'Assignee',
    defaultValue: 'sam',
    options: [
      { value: 'alex', label: 'Alex Kim', description: 'Design' },
      { value: 'sam', label: 'Sam Patel', description: 'Engineering' },
      { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
      { value: 'lee', label: 'Lee Chen', description: 'Product' },
    ],
  },
};
