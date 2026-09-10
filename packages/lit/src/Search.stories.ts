import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Search.js';
import type { SearchSize, SearchSuggestion } from './Search.js';

interface SearchArgs {
  label: string;
  showLabel: boolean;
  name: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  action?: string;
  suggestions?: SearchSuggestion[];
  loading: boolean;
  landmark: boolean;
  size: SearchSize;
  disabled: boolean;
}

const SUGGESTIONS: SearchSuggestion[] = [
  { value: 'invoices-march', label: 'Invoices from March' },
  { value: 'invoices-april', label: 'Invoices from April', description: '12 results' },
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
    showLabel: false,
    name: 'q',
    value: undefined,
    defaultValue: undefined,
    placeholder: undefined,
    action: undefined,
    suggestions: undefined,
    loading: false,
    landmark: true,
    size: 'md',
    disabled: false,
  },
  render: (args) => html`
    <ds-search
      label=${args.label}
      ?show-label=${args.showLabel}
      name=${args.name}
      .value=${args.value}
      default-value=${ifDefined(args.defaultValue)}
      placeholder=${ifDefined(args.placeholder)}
      action=${ifDefined(args.action)}
      .suggestions=${args.suggestions}
      ?loading=${args.loading}
      ?no-landmark=${!args.landmark}
      size=${args.size}
      ?disabled=${args.disabled}
    ></ds-search>
  `,
};

export default meta;
type Story = StoryObj<SearchArgs>;

export const Default: Story = {};

/* size */
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* boolean states */
export const ShowLabelTrue: Story = { args: { showLabel: true } };
export const LandmarkFalse: Story = {
  args: { landmark: false, label: 'Filter these results' },
};
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'invoices' } };

export const WithPlaceholder: Story = {
  args: { placeholder: 'Try "invoices from March"' },
};

export const WithAction: Story = {
  args: { action: '/search', defaultValue: 'invoices' },
};

export const WithSuggestions: Story = {
  args: { defaultValue: 'invoices', suggestions: SUGGESTIONS },
};

export const LoadingTrue: Story = {
  args: { defaultValue: 'inv', suggestions: [], loading: true },
};

export const NoSuggestions: Story = {
  args: { defaultValue: 'zzz', suggestions: [] },
};

/**
 * Renders open with its field and at least three focusable children (input,
 * clear button, submit button) so the keyboard gate can verify
 * ArrowDown-to-open, arrow navigation, Enter to commit, Escape and Tab.
 * Real DOM focus stays on the input the whole time — the popup opens via
 * `play` dispatching ArrowDown on the input, since (unlike Menu/Popover/
 * Dialog) this component's schema has no controlled `open` prop to set
 * declaratively.
 */
export const Keyboard: Story = {
  args: { defaultValue: 'invoices', suggestions: SUGGESTIONS },
  play: async ({ canvasElement }) => {
    const search = canvasElement.querySelector('ds-search');
    const input = search?.shadowRoot?.querySelector<HTMLInputElement>('#input');
    input?.focus();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
  },
};
