import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, type SearchSuggestion } from './Search';

const SUGGESTIONS: SearchSuggestion[] = [
  { value: 'invoices-march', label: 'Invoices from March' },
  { value: 'invoices-april', label: 'Invoices from April' },
  { value: 'invoices-overdue', label: 'Overdue invoices', description: 'Past their due date' },
];

const meta: Meta<typeof Search> = {
  title: 'Search/React',
  component: Search,
  args: {
    label: 'Search products',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

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

/** Suggestions supplied from `onChange`, the way a caller wires a fetch. */
export const SuggestionsFromOnChange: Story = {
  render: (args) => {
    function Demo() {
      const [suggestions, setSuggestions] = useState<SearchSuggestion[] | undefined>(undefined);
      return (
        <Search
          {...args}
          onChange={(query) => {
            const needle = query.trim().toLowerCase();
            setSuggestions(needle ? SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(needle)) : undefined);
          }}
        />
      );
    }
    return <Demo />;
  },
};

/** Inside a search landmark of its own, with `landmark` off: a plain form. */
export const LandmarkOff: Story = { args: { landmark: false } };

/**
 * For the keyboard gate: the closed field with a query and the `with-suggestions` example's
 * suggestions, so the input, the clear button (there is text) and the submit button are the three
 * focus stops the Tab rule walks, and the first ArrowDown opens the list. There is no `open` prop —
 * focus alone never opens it.
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
