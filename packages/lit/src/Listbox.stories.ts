import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Listbox.js';
import type { ListboxMaxVisible, ListboxOption, ListboxValue } from './Listbox.js';

interface ListboxArgs {
  label: string;
  options: ListboxOption[];
  multiple: boolean;
  value?: ListboxValue;
  defaultValue?: ListboxValue;
  selectionFollowsFocus: boolean;
  required: boolean;
  invalid: boolean;
  error?: string;
  embedded: boolean;
  disabled: boolean;
  name: string;
  emptyMessage?: string;
  maxVisible: ListboxMaxVisible;
  defaultActiveValue?: string;
  loading: boolean;
}

const FRUIT_OPTIONS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const PLAN_OPTIONS: ListboxOption[] = [
  { value: 'starter', label: 'Starter', description: 'For individuals trying things out' },
  { value: 'team', label: 'Team', description: 'For small teams shipping together' },
  { value: 'enterprise', label: 'Enterprise', description: 'For organizations with custom needs', icon: 'info' },
];

const GROUPED_OPTIONS: ListboxOption[] = [
  {
    group: 'Fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ],
  },
  {
    group: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'daikon', label: 'Daikon' },
    ],
  },
];

const DISABLED_OPTION_LIST: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
];

const MANY_OPTIONS: ListboxOption[] = Array.from({ length: 20 }, (_, index) => ({
  value: `option-${index + 1}`,
  label: `Option ${index + 1}`,
}));

const meta: Meta<ListboxArgs> = {
  title: 'Listbox/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'active-change'] },
  },
  argTypes: {
    maxVisible: { control: 'select', options: ['5', '8', '12', 'all'] },
    multiple: { control: 'boolean' },
    selectionFollowsFocus: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    embedded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Assignees',
    options: FRUIT_OPTIONS,
    multiple: false,
    value: undefined,
    defaultValue: undefined,
    selectionFollowsFocus: true,
    required: false,
    invalid: false,
    error: undefined,
    embedded: false,
    disabled: false,
    name: 'fruit',
    emptyMessage: undefined,
    maxVisible: '8',
    defaultActiveValue: undefined,
    loading: false,
  },
  render: (args) => html`
    <ds-listbox
      label=${args.label}
      .options=${args.options}
      ?multiple=${args.multiple}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      ?no-selection-follows-focus=${!args.selectionFollowsFocus}
      ?required=${args.required}
      ?invalid=${args.invalid}
      .error=${args.error}
      ?embedded=${args.embedded}
      ?disabled=${args.disabled}
      name=${args.name}
      empty-message=${ifDefined(args.emptyMessage)}
      max-visible=${args.maxVisible}
      default-active-value=${ifDefined(args.defaultActiveValue)}
      ?loading=${args.loading}
    ></ds-listbox>
  `,
};

export default meta;
type Story = StoryObj<ListboxArgs>;

export const Default: Story = {};

/* maxVisible */
export const MaxVisible5: Story = { args: { options: MANY_OPTIONS, maxVisible: '5' } };
export const MaxVisible8: Story = { args: { options: MANY_OPTIONS, maxVisible: '8' } };
export const MaxVisible12: Story = { args: { options: MANY_OPTIONS, maxVisible: '12' } };
export const MaxVisibleAll: Story = { args: { options: FRUIT_OPTIONS, maxVisible: 'all' } };

/* boolean states */
export const MultipleTrue: Story = {
  args: { multiple: true, options: PLAN_OPTIONS, label: 'Add-ons', defaultValue: ['team'] },
};
export const SelectionFollowsFocusFalse: Story = {
  args: { selectionFollowsFocus: false, defaultValue: 'apple' },
};
export const RequiredTrue: Story = { args: { required: true } };
export const InvalidTrue: Story = { args: { invalid: true } };
export const ErrorMessage: Story = { args: { error: 'Fix this before continuing.' } };
export const EmbeddedTrue: Story = { args: { embedded: true } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'apple' } };
export const DisabledOption: Story = { args: { options: DISABLED_OPTION_LIST } };
export const LoadingTrue: Story = { args: { loading: true, options: [] } };
export const DefaultActiveValueSet: Story = { args: { defaultActiveValue: 'cherry' } };

export const WithDescriptionsAndIcons: Story = {
  args: { label: 'Plan', options: PLAN_OPTIONS, defaultValue: 'team' },
};

export const Grouped: Story = {
  args: { label: 'Produce', options: GROUPED_OPTIONS, defaultValue: 'banana' },
};

export const EmptyState: Story = {
  args: { options: [], emptyMessage: 'No matching people' },
};

/**
 * Renders with at least three options so the keyboard gate can verify arrow
 * navigation, Home/End, PageUp/PageDown, Space/Enter and typeahead. Listbox
 * has no trigger and is a single tab stop — options move via
 * `aria-activedescendant`, not independent DOM focus.
 */
export const Keyboard: Story = {
  args: { options: FRUIT_OPTIONS },
};
