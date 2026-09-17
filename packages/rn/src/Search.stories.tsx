import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from './Search';
import { withTheme } from './decorators';

const SUGGESTIONS = [
  { value: 'invoices-march', label: 'Invoices from March' },
  { value: 'invoices-april', label: 'Invoices from April' },
  { value: 'invoice-1042', label: 'Invoice No. 1042', description: 'Overdue' },
];

const meta: Meta<typeof Search> = {
  title: 'Search/React Native',
  component: Search,
  decorators: [withTheme()],
  args: {
    label: 'Search products',
    showLabel: false,
    name: 'q',
    placeholder: 'Try "invoices from March"',
    loading: false,
    landmark: true,
    size: 'md',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Search>;

export const Default: Story = {};

// size
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

// examples
export const HeaderSearch: Story = { args: { label: 'Search this site', placeholder: 'Search products and orders' } };

export const SearchPageHero: Story = { args: { label: 'Search orders', showLabel: true, size: 'lg' } };

export const WithSuggestions: Story = {
  args: {
    label: 'Search products',
    suggestions: [
      { value: 'invoices-march', label: 'Invoices from March' },
      { value: 'invoices-april', label: 'Invoices from April' },
    ],
  },
};

export const FilterWithinAResultsPage: Story = { args: { label: 'Filter results', landmark: false, name: 'filter' } };

// notable states
export const Loading: Story = { args: { suggestions: [], loading: true } };

export const NoSuggestions: Story = { args: { suggestions: [] } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'invoices' } };

/**
 * For the axe gate and manual keyboard checks on react-native-web: with a query the field
 * holds three focusables (input, clear button, submit button). Search has no `open` prop and
 * focus alone never opens the list: type in the field (or press ArrowDown) to show it.
 */
export const Keyboard: Story = { args: { defaultValue: 'invoices', suggestions: SUGGESTIONS } };
