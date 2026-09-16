import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Search.js';
import type { SearchSize, SearchSuggestion } from './Search.js';

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
  { value: 'invoice-templates', label: 'Invoice templates' },
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

/* states */
export const ShowLabel: Story = { args: { showLabel: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'invoices' } };
export const Loading: Story = { args: { defaultValue: 'inv', suggestions: [], loading: true } };
export const NoSuggestions: Story = { args: { defaultValue: 'zzz', suggestions: [] } };

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

/**
 * Open with its suggestions, and three focusable children in the field
 * (input, clear button, submit button). Search has no `open` prop, so `play`
 * focuses the input and presses ArrowDown, which opens the list.
 */
export const Keyboard: Story = {
  args: { defaultValue: 'invoices', suggestions: SUGGESTIONS },
  play: async ({ canvasElement }) => {
    const search = canvasElement.querySelector('ds-search');
    await search?.updateComplete;
    const input = search?.shadowRoot?.querySelector<HTMLInputElement>('[data-part=input]');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
  },
};
