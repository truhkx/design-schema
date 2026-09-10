import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Search } from './Search';
import type { SearchSuggestion } from './Search';

const SUGGESTIONS: SearchSuggestion[] = [
  { value: 'invoices from march', label: 'invoices from march' },
  { value: 'invoices overdue', label: 'invoices overdue', description: '12 results' },
  { value: 'invoice template', label: 'invoice template' },
];

const meta = {
  title: 'Search/React',
  component: Search,
  args: {
    label: 'Search products',
    name: 'q',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* notable states */
export const ShowLabel: Story = {
  args: { showLabel: true, label: 'Search orders' },
};

export const Placeholder: Story = {
  args: { placeholder: 'Try "invoices from March"' },
};

export const WithValue: Story = { args: { defaultValue: 'invoices' } };

export const WithAction: Story = { args: { action: '/search' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'invoices' } };

export const NotLandmark: Story = { args: { landmark: false } };

export const WithSuggestions: Story = {
  args: { defaultValue: 'invoice', suggestions: SUGGESTIONS },
  render: (args) => {
    function SuggestionsDemo() {
      const [suggestions, setSuggestions] = useState(args.suggestions);
      return (
        <Search
          {...args}
          suggestions={suggestions}
          onChange={(text) =>
            setSuggestions(text ? SUGGESTIONS.filter((s) => s.label.includes(text.toLowerCase())) : undefined)
          }
        />
      );
    }
    return <SuggestionsDemo />;
  },
};

export const Loading: Story = {
  args: { defaultValue: 'invoice', suggestions: [], loading: true },
};

export const NoSuggestions: Story = {
  args: { defaultValue: 'zzz', suggestions: [] },
};

/**
 * Open/present with its trigger, for the keyboard gate: the input, its clear button (there is
 * text) and its submit button (an `action` is set) are three real focus stops in the field alone.
 */
export const Keyboard: Story = {
  args: { defaultValue: 'invoice', action: '/search', suggestions: SUGGESTIONS },
};
