import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Listbox.js';
import type { ListboxMaxVisible, ListboxItem, ListboxOption, ListboxValue } from './Listbox.js';

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
  activeValue?: string | null | undefined;
  loading: boolean;
  disabled: boolean;
  name?: string | undefined;
  emptyMessage?: string | undefined;
  maxVisible: ListboxMaxVisible;
}

const FRUITS: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

/** The `single-picker` example, which is the Default story's args. */
const SINGLE_PICKER: ListboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const MANY_FRUITS: ListboxItem[] = [
  ...FRUITS,
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
  { value: 'kiwi', label: 'Kiwi' },
  { value: 'lemon', label: 'Lemon' },
  { value: 'mango', label: 'Mango' },
  { value: 'nectarine', label: 'Nectarine' },
  { value: 'orange', label: 'Orange' },
  { value: 'papaya', label: 'Papaya' },
];

const PEOPLE: ListboxOption[] = [
  { value: 'ana', label: 'Ana Souza', description: 'Product design' },
  { value: 'bo', label: 'Bo Lin', description: 'Engineering' },
  { value: 'cara', label: 'Cara Nash', description: 'Engineering', icon: 'success' },
  { value: 'deshawn', label: 'DeShawn Reid', description: 'Out of office', disabled: true },
];

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
    options: SINGLE_PICKER,
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
      .activeValue=${args.activeValue}
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
export const MaxVisible5: Story = { args: { maxVisible: '5', options: MANY_FRUITS } };
export const MaxVisible8: Story = { args: { maxVisible: '8', options: MANY_FRUITS } };
export const MaxVisible12: Story = { args: { maxVisible: '12', options: MANY_FRUITS } };
export const MaxVisibleAll: Story = { args: { maxVisible: 'all', options: MANY_FRUITS } };

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
export const WithDescriptions: Story = { args: { label: 'Assignee', options: PEOPLE } };
export const SelectionFollowsFocusFalse: Story = { args: { selectionFollowsFocus: false } };
export const Required: Story = { args: { required: true, name: 'fruit' } };
export const Invalid: Story = { args: { invalid: true } };
export const ErrorMessage: Story = { args: { error: 'Fix this before continuing.' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'banana' } };
export const Loading: Story = { args: { loading: true, options: [] } };
export const InitialActiveValue: Story = { args: { initialActiveValue: 'cherry' } };
export const Empty: Story = { args: { options: [] } };
export const EmptyWithMessage: Story = { args: { options: [], emptyMessage: 'No matching people' } };
export const Controlled: Story = { args: { value: 'cherry' } };
/** Driven by a host: the highlight follows `activeValue` without focus in the list. */
export const ActiveValue: Story = { args: { embedded: true, activeValue: 'banana' } };
export const WithGroupsAndDisabled: Story = {
  args: {
    label: 'Assignee',
    options: [
      { group: 'Team', options: PEOPLE },
      { group: 'Empty', options: [] },
    ],
  },
};
export const Multiple: Story = { args: { multiple: true, defaultValue: ['banana'] } };

/**
 * `labelledBy` is accepted for parity with web, but ids do not cross a shadow
 * root: the list is still named by `label`, and the visible paragraph is only
 * a caption beside it.
 */
export const LabelledBy: Story = {
  args: { labelledBy: 'listbox-story-label' },
  render: (args) => html`
    <div>
      <p id="listbox-story-label">Favourite fruit</p>
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
        .activeValue=${args.activeValue}
        ?loading=${args.loading}
        ?disabled=${args.disabled}
        name=${ifDefined(args.name)}
        empty-message=${ifDefined(args.emptyMessage)}
        max-visible=${args.maxVisible}
      ></ds-listbox>
    </div>
  `,
};

/** Present with at least three options, for the keyboard gate — Listbox has no trigger or popup. */
export const Keyboard: Story = {
  args: { options: FRUITS },
};
