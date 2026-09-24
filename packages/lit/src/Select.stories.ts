import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Select.js';
import type { DsSelect, SelectNative, SelectOpenChangeDetail, SelectSize, SelectValue } from './Select.js';
import type { ListboxItem, ListboxOption } from './Listbox.js';

interface SelectArgs {
  label: string;
  name: string;
  options: ListboxItem[];
  value?: SelectValue | undefined;
  defaultValue?: SelectValue | undefined;
  placeholder?: string | undefined;
  hideLabel: boolean;
  size: SelectSize;
  open?: boolean | undefined;
  multiple: boolean;
  description?: string | undefined;
  required: boolean;
  disabled: boolean;
  invalid: boolean;
  error?: string | undefined;
  native: SelectNative;
}

const COUNTRIES: ListboxOption[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'mx', label: 'Mexico' },
  { value: 'us', label: 'United States' },
];

const ROLES: ListboxItem[] = [
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

const meta: Meta<SelectArgs> = {
  title: 'Select/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'open-change'] },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md'] },
    native: { control: 'select', options: ['auto', 'always', 'never'] },
    open: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    name: 'country',
    options: COUNTRIES,
    hideLabel: false,
    size: 'md',
    multiple: false,
    required: false,
    disabled: false,
    invalid: false,
    native: 'auto',
  },
  render: (args) => html`
    <ds-select
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      placeholder=${ifDefined(args.placeholder)}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      .open=${args.open}
      ?multiple=${args.multiple}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      error=${ifDefined(args.error)}
      native=${args.native}
    ></ds-select>
  `,
};

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* native */
export const NativeAuto: Story = { args: { native: 'auto' } };
export const NativeAlways: Story = { args: { native: 'always' } };
export const NativeNever: Story = { args: { native: 'never' } };

/* examples */
export const CountryPicker: Story = {
  args: {
    label: 'Country',
    name: 'country',
    placeholder: 'Choose a country',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'fr', label: 'France' },
      { value: 'jp', label: 'Japan' },
    ],
  },
};

export const MultiSelectRoles: Story = {
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'design', label: 'Design' },
    ],
  },
};

export const ForcedNativePicker: Story = {
  args: {
    label: 'Country',
    name: 'country',
    native: 'always',
    options: [
      { value: 'ca', label: 'Canada' },
      { value: 'us', label: 'United States' },
    ],
  },
};

export const CompactPickerInAHeader: Story = {
  args: {
    label: 'Month',
    name: 'month',
    hideLabel: true,
    size: 'sm',
    options: [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
    ],
  },
};

/* notable states */
export const Multiple: Story = {
  args: { label: 'Role', name: 'role', options: ROLES, multiple: true, defaultValue: ['frontend', 'backend', 'brand'] },
};

export const WithDescription: Story = { args: { description: 'Used for shipping and tax rates.' } };

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'fr' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithError: Story = { args: { error: 'Choose the country you ship to.' } };

export const DefaultValue: Story = { args: { defaultValue: 'fr' } };

/** Disabled wins over a controlled `open`: no popup, aria-expanded="false". */
export const DisabledOpen: Story = { args: { disabled: true, open: true } };

/**
 * Open with its trigger, for the keyboard gate: the popup's Listbox holds the six country options
 * (focusable through the trigger's keyboard model) while DOM focus stays on the trigger. Args come
 * from the story URL; the story owns `open` — it writes the new state back onto the element — so
 * Escape and Tab really close it. The play step puts DOM focus where the popup's keyboard model
 * lives — on the trigger — since the embedded list is never a tab stop.
 */
export const Keyboard: Story = {
  args: { open: true },
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('ds-select');
    await select?.updateComplete;
    select?.shadowRoot?.querySelector<HTMLElement>('[data-part=trigger]')?.focus();
  },
  render: (args) => html`
    <ds-select
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      placeholder=${ifDefined(args.placeholder)}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      .open=${args.open}
      ?multiple=${args.multiple}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      error=${ifDefined(args.error)}
      native=${args.native}
      @open-change=${(event: CustomEvent<SelectOpenChangeDetail>) => {
        (event.currentTarget as DsSelect).open = event.detail.open;
      }}
    ></ds-select>
  `,
};
