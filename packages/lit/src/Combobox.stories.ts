import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Combobox.js';
import type { ComboboxFilter, ComboboxValue } from './Combobox.js';
import type { ListboxOption } from './Listbox.js';

interface ComboboxArgs {
  label: string;
  name: string;
  options: ListboxOption[];
  value?: ComboboxValue | undefined;
  defaultValue?: ComboboxValue | undefined;
  inputValue?: string | undefined;
  multiple: boolean;
  allowCustom: boolean;
  filter: ComboboxFilter;
  placeholder?: string | undefined;
  description?: string | undefined;
  required: boolean;
  disabled: boolean;
  invalid: boolean;
  error?: string | undefined;
  loading: boolean;
  clearable: boolean;
}

const COUNTRY_OPTIONS: ListboxOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
];

const PEOPLE_OPTIONS: ListboxOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@example.com' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@example.com' },
  { value: 'katherine', label: 'Katherine Johnson', description: 'katherine@example.com' },
];

const GROUPED_OPTIONS: ListboxOption[] = [
  {
    group: 'North America',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'mx', label: 'Mexico' },
    ],
  },
  {
    group: 'Europe',
    options: [
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
    ],
  },
];

const meta: Meta<ComboboxArgs> = {
  title: 'Combobox/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'input-change', 'open-change'] },
  },
  argTypes: {
    filter: { control: 'select', options: ['startsWith', 'contains', 'none', 'async'] },
    multiple: { control: 'boolean' },
    allowCustom: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    name: 'country',
    options: COUNTRY_OPTIONS,
    value: undefined,
    defaultValue: undefined,
    inputValue: undefined,
    multiple: false,
    allowCustom: false,
    filter: 'contains',
    placeholder: undefined,
    description: undefined,
    required: false,
    disabled: false,
    invalid: false,
    error: undefined,
    loading: false,
    clearable: true,
  },
  render: (args) => html`
    <ds-combobox
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      input-value=${ifDefined(args.inputValue)}
      ?multiple=${args.multiple}
      ?allow-custom=${args.allowCustom}
      filter=${args.filter}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      error=${ifDefined(args.error)}
      ?loading=${args.loading}
      ?no-clear=${!args.clearable}
    ></ds-combobox>
  `,
};

export default meta;
type Story = StoryObj<ComboboxArgs>;

export const Default: Story = {};

/* filter */
export const FilterStartsWith: Story = { args: { filter: 'startsWith' } };
export const FilterContains: Story = { args: { filter: 'contains' } };
export const FilterNone: Story = { args: { filter: 'none' } };
export const FilterAsync: Story = { args: { filter: 'async', loading: false } };

/* boolean states */
export const MultipleTrue: Story = {
  args: { multiple: true, options: PEOPLE_OPTIONS, label: 'Assignees', name: 'assignees', defaultValue: ['ada'] },
};
export const AllowCustomTrue: Story = {
  args: { allowCustom: true, label: 'Tags', name: 'tags', options: PEOPLE_OPTIONS, multiple: true },
};
export const RequiredTrue: Story = { args: { required: true } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'us' } };
export const LoadingTrue: Story = { args: { filter: 'async', loading: true } };
export const ClearableFalse: Story = { args: { clearable: false, defaultValue: 'us' } };

export const WithDescription: Story = {
  args: {
    label: 'Assignee',
    name: 'assignee',
    options: PEOPLE_OPTIONS,
    description: 'Search by name or email.',
    defaultValue: 'ada',
  },
};

export const Grouped: Story = {
  args: { label: 'Country', options: GROUPED_OPTIONS, defaultValue: 'fr' },
};

export const ErrorIdentified: Story = {
  args: { required: true, error: 'Fix this before continuing.' },
};

/**
 * Renders open with its field and at least three focusable children (input,
 * clear button, toggle button) so the keyboard gate can verify
 * ArrowDown/ArrowUp-to-open, arrow navigation, Enter to commit, Escape,
 * Tab and Backspace-removes-chip. Real DOM focus stays on the input the
 * whole time — the popup opens via `play` clicking the toggle button, since
 * (unlike Menu/Popover/Dialog) this component's schema has no controlled
 * `open` prop to set declaratively.
 */
export const Keyboard: Story = {
  args: { options: COUNTRY_OPTIONS, defaultValue: 'us', clearable: true },
  play: async ({ canvasElement }) => {
    const combobox = canvasElement.querySelector('ds-combobox');
    const toggle = combobox?.shadowRoot?.querySelector('#toggle-button');
    const toggleButton = toggle?.shadowRoot?.querySelector<HTMLButtonElement>('button');
    toggleButton?.click();
  },
};
