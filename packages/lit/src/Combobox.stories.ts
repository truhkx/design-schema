import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Combobox.js';
import type { ComboboxFilter, ComboboxOpenChangeDetail, ComboboxValue, DsCombobox } from './Combobox.js';
import type { ListboxItem } from './Listbox.js';

interface ComboboxArgs {
  label: string;
  name: string;
  options: ListboxItem[];
  value?: ComboboxValue | undefined;
  defaultValue?: ComboboxValue | undefined;
  open?: boolean | undefined;
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

const FRUIT_OPTIONS: ListboxItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot' },
  { value: 'banana', label: 'Banana' },
];

const meta: Meta<ComboboxArgs> = {
  title: 'Combobox/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'input-change', 'open-change'] },
  },
  argTypes: {
    filter: { control: 'select', options: ['startsWith', 'contains', 'none', 'async'] },
    open: { control: 'boolean' },
  },
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: FRUIT_OPTIONS,
    multiple: false,
    allowCustom: false,
    filter: 'contains',
    required: false,
    disabled: false,
    invalid: false,
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
      .open=${args.open}
      .inputValue=${args.inputValue}
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
      .clearable=${args.clearable}
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
export const FilterAsync: Story = { args: { filter: 'async' } };

/* states */
export const Open: Story = { args: { open: true } };
export const Multiple: Story = { args: { multiple: true, defaultValue: ['apple', 'banana'] } };
export const AllowCustom: Story = { args: { allowCustom: true, multiple: true } };
export const Loading: Story = { args: { filter: 'async', loading: true, open: true } };
export const NotClearable: Story = { args: { clearable: false, defaultValue: 'apple' } };
export const WithDescription: Story = {
  args: { description: 'Used for the produce order.', placeholder: 'Search fruit' },
};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Choose a fruit from the list.' } };

/**
 * Open with its input, for the keyboard gate: the options are reached through the Listbox while DOM
 * focus stays in the input, and the clear and toggle buttons are the other focus stops.
 * `defaultValue` is set so the clear button renders. The story owns `open` — it writes `open-change`
 * back onto the element — so Escape and Tab really close the popup.
 */
export const Keyboard: Story = {
  args: { open: true, defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const combobox = canvasElement.querySelector('ds-combobox');
    await combobox?.updateComplete;
    combobox?.shadowRoot?.querySelector<HTMLElement>('[data-part=input]')?.focus();
  },
  render: (args) => html`
    <ds-combobox
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      .open=${args.open}
      .inputValue=${args.inputValue}
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
      .clearable=${args.clearable}
      @open-change=${(event: CustomEvent<ComboboxOpenChangeDetail>) => {
        (event.currentTarget as DsCombobox).open = event.detail.open;
      }}
    ></ds-combobox>
  `,
};

/* examples */
export const FruitPicker: Story = {
  args: {
    label: 'Fruit',
    name: 'fruit',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'apricot', label: 'Apricot' },
      { value: 'banana', label: 'Banana' },
    ],
  },
};

export const MultiSelectWithChips: Story = {
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    defaultValue: ['frontend'],
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
    ],
  },
};

export const FreeTextTags: Story = {
  args: {
    label: 'Tags',
    name: 'tags',
    multiple: true,
    allowCustom: true,
    options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'billing', label: 'Billing' },
    ],
  },
};

export const AsyncResults: Story = {
  args: {
    label: 'Customer',
    name: 'customer',
    filter: 'async',
    loading: true,
    options: [{ value: 'acme', label: 'Acme Ltd' }],
  },
};
