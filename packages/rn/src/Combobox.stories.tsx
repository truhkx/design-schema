import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';
import { withTheme } from './decorators';

const OPTIONS = [
  { value: 'alex', label: 'Alex Kim', description: 'Design' },
  { value: 'sam', label: 'Sam Patel', description: 'Engineering' },
  { value: 'jo', label: 'Jo Rivera', description: 'Engineering' },
  { value: 'lee', label: 'Lee Chen', description: 'Product' },
];

const meta: Meta<typeof Combobox> = {
  title: 'Combobox/React Native',
  component: Combobox,
  decorators: [withTheme()],
  args: {
    label: 'Assignee',
    name: 'assignee',
    options: OPTIONS,
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
export const FilterAsync: Story = { args: { filter: 'async', loading: false } };

// notable states
export const Multiple: Story = {
  args: {
    label: 'Reviewers',
    name: 'reviewers',
    multiple: true,
    defaultValue: ['sam', 'jo'],
  },
};

export const AllowCustom: Story = {
  args: {
    label: 'Tags',
    name: 'tags',
    allowCustom: true,
    options: [
      { value: 'bug', label: 'Bug' },
      { value: 'feature', label: 'Feature' },
    ],
  },
};

export const Grouped: Story = {
  args: {
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

export const Loading: Story = { args: { filter: 'async', loading: true, options: [] } };

export const Empty: Story = { args: { options: [] } };

export const ClearableFalse: Story = { args: { defaultValue: 'sam', clearable: false } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'sam' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithError: Story = { args: { error: 'Choose an assignee.' } };

export const WithDescription: Story = { args: { description: 'Searches everyone in the workspace.' } };

/**
 * At least three focusable rows once opened, for the axe gate and manual keyboard
 * checks on react-native-web. Combobox has no `open`/`defaultOpen` prop (typing or
 * focusing the field opens it, matching the field's own behavior) — see the
 * generation gap notes for why this story cannot render pre-opened like Menu's or
 * Dialog's `open: true` stories do.
 */
export const Keyboard: Story = {
  args: { options: OPTIONS },
};
