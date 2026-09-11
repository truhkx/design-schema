import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Feed.js';
import './Text.js';
import './Link.js';
import './Button.js';
import type { FeedHeadingLevel, FeedItem } from './Feed.js';

interface FeedArgs {
  label: string;
  headingLevel: FeedHeadingLevel;
  hasMore: boolean;
  loading: boolean;
  newItemsCount?: number | undefined;
  endMessage?: string | undefined;
  items: FeedItem[];
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const BASE_ITEMS: FeedItem[] = [
  {
    id: 'evt-3',
    heading: 'Ana commented on Invoice 42',
    timestamp: minutesAgo(3),
    content: html`<ds-text size="sm">"Looks good, approving now."</ds-text>`,
    actions: html`<ds-link href="/invoices/42">View invoice</ds-link>`,
    unread: true,
  },
  {
    id: 'evt-47',
    heading: 'Priya archived Project Nimbus',
    timestamp: minutesAgo(47),
    content: html`<ds-text size="sm">Moved to the archive after the Q3 review.</ds-text>`,
  },
  {
    id: 'evt-95',
    heading: 'Dae opened a new ticket',
    timestamp: minutesAgo(95),
    content: html`<ds-text size="sm">"Export is failing for large workspaces."</ds-text>`,
    actions: html`<ds-link href="/tickets/108">View ticket</ds-link>`,
  },
];

const meta: Meta<FeedArgs> = {
  title: 'Feed/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['load-more', 'show-new', 'item-visible'] },
  },
  argTypes: {
    headingLevel: { control: 'select', options: ['2', '3', '4'] },
    hasMore: { control: 'boolean' },
    loading: { control: 'boolean' },
    newItemsCount: { control: 'number' },
    endMessage: { control: 'text' },
  },
  args: {
    label: 'Activity',
    headingLevel: '3',
    hasMore: false,
    loading: false,
    newItemsCount: undefined,
    endMessage: undefined,
    items: BASE_ITEMS,
  },
  render: (args) => html`
    <ds-feed
      label=${args.label}
      heading-level=${args.headingLevel}
      ?has-more=${args.hasMore}
      ?loading=${args.loading}
      .newItemsCount=${args.newItemsCount}
      .items=${args.items}
      end-message=${args.endMessage ?? ''}
    ></ds-feed>
  `,
};

export default meta;
type Story = StoryObj<FeedArgs>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

/* boolean / notable states */
export const HasMoreTrue: Story = { args: { hasMore: true } };
export const LoadingTrue: Story = { args: { hasMore: true, loading: true } };
export const NewItemsCount: Story = { args: { newItemsCount: 4 } };
export const CustomEndMessage: Story = { args: { endMessage: 'No more activity today.' } };
export const Empty: Story = { args: { items: [] } };
export const EmptyLoading: Story = { args: { items: [], loading: true } };

/**
 * Three articles, each with a focusable action, so Tab moves through each
 * article's interactive content and PageUp/PageDown/Ctrl+Home/Ctrl+End move
 * between and out of articles.
 */
export const Keyboard: Story = {
  args: { newItemsCount: 2 },
};
