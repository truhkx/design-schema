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

// notable states
export const ShowLabel: Story = { args: { showLabel: true } };

export const WithSuggestions: Story = { args: { suggestions: SUGGESTIONS } };

export const Loading: Story = { args: { suggestions: [], loading: true } };

export const NoSuggestions: Story = { args: { suggestions: [] } };

export const WithValue: Story = { args: { defaultValue: 'invoices' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'invoices' } };

/**
 * At least three focusable elements once suggestions are open, for the axe gate and
 * manual keyboard checks on react-native-web. Search has no `open`/`defaultOpen`
 * prop — focusing the field opens its suggestions, matching the field's own
 * behavior — so this story cannot render pre-opened; see the generation gap notes.
 */
export const Keyboard: Story = {
  args: { suggestions: SUGGESTIONS },
};
