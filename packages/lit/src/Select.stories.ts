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
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
];

const ROLE_OPTIONS: ListboxOption[] = [
  { value: 'viewer', label: 'Viewer', description: 'Can view, not edit' },
  { value: 'editor', label: 'Editor', description: 'Can view and edit' },
  { value: 'admin', label: 'Admin', description: 'Full access, including billing' },
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

const meta: Meta<SelectArgs> = {
  title: 'Select/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'open-change'] },
  },
  argTypes: {
    native: { control: 'select', options: ['auto', 'always', 'never'] },
    size: { control: 'select', options: ['sm', 'md'] },
    hideLabel: { control: 'boolean' },
    multiple: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    name: 'country',
    options: COUNTRY_OPTIONS,
    value: undefined,
    defaultValue: undefined,
    placeholder: undefined,
    hideLabel: false,
    size: 'md',
    open: undefined,
    multiple: false,
    description: undefined,
    required: false,
    disabled: false,
    invalid: false,
    error: undefined,
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
      ?open=${args.open}
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

/* native */
export const NativeAuto: Story = { args: { native: 'auto' } };
export const NativeAlways: Story = { args: { native: 'always', defaultValue: 'ca' } };
export const NativeNever: Story = { args: { native: 'never' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* boolean states */
export const HideLabelTrue: Story = {
  args: { hideLabel: true, defaultValue: 'us' },
};
export const MultipleTrue: Story = {
  args: { multiple: true, options: ROLE_OPTIONS, label: 'Roles', name: 'roles', defaultValue: ['editor'] },
};
export const MultipleManySelected: Story = {
  args: {
    multiple: true,
    options: GROUPED_OPTIONS,
    label: 'Regions',
    name: 'regions',
    defaultValue: ['us', 'ca', 'mx', 'fr'],
  },
};
export const RequiredTrue: Story = { args: { required: true } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'us' } };

export const WithDescription: Story = {
  args: {
    label: 'Role',
    name: 'role',
    options: ROLE_OPTIONS,
    description: 'Controls what this member can see and change.',
    defaultValue: 'viewer',
  },
};

export const Grouped: Story = {
  args: { label: 'Country', options: GROUPED_OPTIONS, defaultValue: 'fr' },
};

export const ErrorIdentified: Story = {
  args: { required: true, error: 'Fix this before continuing.' },
};

/**
 * Renders open (via the controlled `open` prop) with its trigger and at
 * least three options so the keyboard gate can verify Enter/Space/arrow-to-
 * open, arrow navigation, Home/End, typeahead, Enter to commit, Escape and
 * Tab. Unlike the option list, real DOM focus stays on the trigger the whole
 * time the popup is open.
 */
export const Keyboard: Story = {
  args: { options: COUNTRY_OPTIONS, open: true },
};
