import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Feed.js';
import './Text.js';
import './Link.js';
import type { FeedHeadingLevel, FeedItem } from './Feed.js';

interface FeedArgs {
  label: string;
  headingLevel: FeedHeadingLevel;
  hasMore: boolean;
  loading: boolean;
  newItemsCount: number | undefined;
  endMessage: string | undefined;
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
    content: html`<ds-text size="sm">Looks right to me.</ds-text>`,
    actions: html`<ds-link href="#invoice-42">View invoice</ds-link>`,
    unread: true,
  },
  {
    id: 'evt-47',
    heading: 'Bo approved Invoice 41',
    timestamp: minutesAgo(47),
    content: html`<ds-text size="sm">Approved for payment.</ds-text>`,
    actions: html`<ds-link href="#invoice-41">View invoice</ds-link>`,
  },
  {
    id: 'evt-95',
    heading: 'Dae opened a ticket',
    timestamp: minutesAgo(95),
    content: html`<ds-text size="sm">Export fails for large workspaces.</ds-text>`,
    actions: html`<ds-link href="#ticket-108">View ticket</ds-link>`,
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
      .endMessage=${args.endMessage}
      .items=${args.items}
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

/* notable states */
export const HasMore: Story = { args: { hasMore: true } };
export const Loading: Story = { args: { hasMore: true, loading: true } };
export const NewItems: Story = { args: { newItemsCount: 4 } };
export const Empty: Story = { args: { items: [] } };
export const EmptyLoading: Story = { args: { items: [], hasMore: true, loading: true } };

/* examples */
export const ActivityStream: Story = {
  args: {
    label: 'Activity',
    hasMore: true,
    items: [
      { id: 'a1', heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' },
      { id: 'a2', heading: 'Bo approved Invoice 41', timestamp: '2026-09-14T16:20:00Z', content: 'Approved for payment.' },
    ],
  },
};

export const NotificationsWithUnreadItems: Story = {
  args: {
    label: 'Notifications',
    newItemsCount: 3,
    items: [
      {
        id: 'n1',
        heading: 'Your export is ready',
        timestamp: '2026-09-15T08:00:00Z',
        content: 'The March export finished.',
        unread: true,
      },
      { id: 'n2', heading: 'Invoice 42 was paid', timestamp: '2026-09-14T11:00:00Z', content: 'Payment received.' },
    ],
  },
};

export const CaughtUp: Story = {
  args: {
    label: 'Activity',
    hasMore: false,
    endMessage: 'That is everything from this week.',
    items: [
      { id: 'a1', heading: 'Bo approved Invoice 41', timestamp: '2026-09-14T16:20:00Z', content: 'Approved for payment.' },
    ],
  },
};

export const LoadingTheNextPage: Story = {
  args: {
    label: 'Audit events',
    hasMore: true,
    loading: true,
    headingLevel: '2',
    items: [{ id: 'e1', heading: 'Role changed for Ana', timestamp: '2026-09-15T07:00:00Z', content: 'Editor to Admin.' }],
  },
};

/**
 * The new-items button plus three articles, each with a link, so Tab moves
 * through each article's content and PageUp/PageDown/Ctrl+Home/Ctrl+End move
 * between and out of articles. Links before and after give Ctrl+Home/End
 * somewhere to land.
 */
export const Keyboard: Story = {
  args: { newItemsCount: 2 },
  render: (args, context) => html`
    <ds-link href="#before">Before the feed</ds-link>
    ${meta.render!(args, context)}
    <ds-link href="#after">After the feed</ds-link>
  `,
};
