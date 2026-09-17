import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Listbox.js';
import type { ListboxMaxVisible, ListboxItem, ListboxValue } from './Listbox.js';

interface ListboxArgs {
  label: string;
  labelledBy?: string | undefined;
  options: ListboxItem[];
  multiple: boolean;
  value?: ListboxValue | undefined;
  defaultValue?: ListboxValue | undefined;
  selectionFollowsFocus: boolean;
  required: boolean;
  invalid: boolean;
  error?: string | undefined;
  embedded: boolean;
  initialActiveValue?: string | undefined;
  loading: boolean;
  disabled: boolean;
  name?: string | undefined;
  emptyMessage?: string | undefined;
  maxVisible: ListboxMaxVisible;
}

const FRUIT_OPTIONS: ListboxItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const PLAN_OPTIONS: ListboxItem[] = [
  { value: 'starter', label: 'Starter', description: 'For individuals trying things out' },
  { value: 'team', label: 'Team', description: 'For small teams shipping together' },
  { value: 'enterprise', label: 'Enterprise', description: 'For organizations with custom needs', icon: 'info' },
];

const MANY_OPTIONS: ListboxItem[] = Array.from({ length: 20 }, (_, index) => ({
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
  },
  args: {
    label: 'Fruit',
    options: FRUIT_OPTIONS,
    multiple: false,
    selectionFollowsFocus: true,
    required: false,
    invalid: false,
    embedded: false,
    loading: false,
    disabled: false,
    maxVisible: '8',
  },
  render: (args) => html`
    <ds-listbox
      label=${args.label}
      labelled-by=${ifDefined(args.labelledBy)}
      .options=${args.options}
      ?multiple=${args.multiple}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      .selectionFollowsFocus=${args.selectionFollowsFocus}
      ?required=${args.required}
      ?invalid=${args.invalid}
      .error=${args.error}
      ?embedded=${args.embedded}
      initial-active-value=${ifDefined(args.initialActiveValue)}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
      name=${ifDefined(args.name)}
      empty-message=${ifDefined(args.emptyMessage)}
      max-visible=${args.maxVisible}
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
export const MaxVisibleAll: Story = { args: { options: MANY_OPTIONS, maxVisible: 'all' } };

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
export const SelectionFollowsFocusFalse: Story = { args: { selectionFollowsFocus: false, defaultValue: 'apple' } };
export const WithDescriptionsAndIcons: Story = { args: { label: 'Plan', options: PLAN_OPTIONS, defaultValue: 'team' } };
export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'apple', label: 'Apple', disabled: true },
      { value: 'banana', label: 'Banana' },
    ],
  },
};
export const Required: Story = { args: { required: true, name: 'fruit' } };
export const Invalid: Story = { args: { invalid: true } };
export const ErrorMessage: Story = { args: { error: 'Fix this before continuing.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Empty: Story = { args: { options: [] } };
export const EmptyCustomMessage: Story = { args: { options: [], emptyMessage: 'No fruit matches that.' } };
export const Loading: Story = { args: { options: [], loading: true } };
export const InitialActiveValue: Story = { args: { initialActiveValue: 'cherry' } };

/**
 * Keyboard gate: a single tab stop with at least three options; arrows, Home/End,
 * PageUp/PageDown, Space/Enter and typeahead move `aria-activedescendant`. The
 * `multiple` rules read `?args=multiple:!true` from the story URL.
 */
export const Keyboard: Story = {
  args: { options: MANY_OPTIONS.slice(0, 8), label: 'Options' },
};
