import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Select.js';
import type { SelectNative, SelectSize, SelectValue } from './Select.js';
import type { ListboxOption } from './Listbox.js';

interface SelectArgs {
  label: string;
  name: string;
  options: ListboxOption[];
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

const COUNTRY_OPTIONS: ListboxOption[] = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'us', label: 'United States' },
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
    options: COUNTRY_OPTIONS,
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

/* states */
export const Multiple: Story = { args: { multiple: true, defaultValue: ['ca', 'fr', 'jp'] } };
export const WithDescription: Story = { args: { description: 'Where the account is registered.' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'fr' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Fix this before continuing.' } };

/** Rendered open with its trigger and four options, for the keyboard gate. */
export const Keyboard: Story = { args: { open: true } };

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
