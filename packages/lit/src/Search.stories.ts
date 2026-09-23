import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Search.js';
import type { DsSearch, SearchChangeDetail, SearchSize, SearchSuggestion } from './Search.js';

interface SearchArgs {
  label: string;
  showLabel?: boolean | undefined;
  name?: string | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  placeholder?: string | undefined;
  action?: string | undefined;
  suggestions?: SearchSuggestion[] | undefined;
  loading?: boolean | undefined;
  landmark?: boolean | undefined;
  size?: SearchSize | undefined;
  disabled?: boolean | undefined;
}

const SUGGESTIONS: SearchSuggestion[] = [
  { value: 'invoices-march', label: 'Invoices from March' },
  { value: 'invoices-april', label: 'Invoices from April' },
  { value: 'invoices-overdue', label: 'Overdue invoices', description: 'Past their due date' },
];

const meta: Meta<SearchArgs> = {
  title: 'Search/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'submit', 'clear'] },
  },
  argTypes: {
    size: { control: 'select', options: ['md', 'lg'] },
    showLabel: { control: 'boolean' },
    loading: { control: 'boolean' },
    landmark: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Search products',
  },
  render: (args) => html`
    <ds-search
      label=${args.label}
      ?show-label=${args.showLabel === true}
      name=${ifDefined(args.name)}
      .value=${args.value}
      default-value=${ifDefined(args.defaultValue)}
      placeholder=${ifDefined(args.placeholder)}
      action=${ifDefined(args.action)}
      .suggestions=${args.suggestions}
      ?loading=${args.loading === true}
      ?no-landmark=${args.landmark === false}
      size=${ifDefined(args.size)}
      ?disabled=${args.disabled === true}
    ></ds-search>
  `,
};

export default meta;
type Story = StoryObj<SearchArgs>;

export const Default: Story = {};

/* size */
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* examples */
export const HeaderSearch: Story = {
  args: { label: 'Search this site', placeholder: 'Search products and orders' },
};

export const SearchPageHero: Story = {
  args: { label: 'Search orders', showLabel: true, size: 'lg' },
};

export const WithSuggestions: Story = {
  args: {
    label: 'Search products',
    suggestions: [
      { value: 'invoices-march', label: 'Invoices from March' },
      { value: 'invoices-april', label: 'Invoices from April' },
    ],
  },
};

export const FilterWithinAResultsPage: Story = {
  args: { label: 'Filter results', landmark: false, name: 'filter' },
};

/* notable states */
export const WithValue: Story = { args: { defaultValue: 'invoices' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'invoices' } };

export const Loading: Story = { args: { defaultValue: 'invoices', suggestions: [], loading: true } };

export const NoSuggestions: Story = { args: { defaultValue: 'zzz', suggestions: [] } };

/** Suggestions supplied from `change`, the way a caller wires a fetch. */
export const SuggestionsFromOnChange: Story = {
  render: (args) => html`
    <ds-search
      label=${args.label}
      ?show-label=${args.showLabel === true}
      name=${ifDefined(args.name)}
      default-value=${ifDefined(args.defaultValue)}
      placeholder=${ifDefined(args.placeholder)}
      ?no-landmark=${args.landmark === false}
      size=${ifDefined(args.size)}
      @change=${(event: CustomEvent<SearchChangeDetail>) => {
        const search = event.currentTarget as DsSearch;
        const needle = event.detail.value.trim().toLowerCase();
        search.suggestions = needle
          ? SUGGESTIONS.filter((item) => item.label.toLowerCase().includes(needle))
          : undefined;
      }}
    ></ds-search>
  `,
};

/**
 * For the keyboard gate: the closed field with a query and suggestions, so the
 * input, the clear button (there is text) and the submit button are the three
 * focus stops the Tab rule walks, and the first ArrowDown opens the list. There
 * is no `open` prop — focus alone never opens it.
 */
export const Keyboard: Story = {
  args: {
    defaultValue: 'invoices',
    suggestions: [
      { value: 'invoices-march', label: 'Invoices from March' },
      { value: 'invoices-april', label: 'Invoices from April' },
    ],
  },
};
