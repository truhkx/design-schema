import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Feed.js';
import './Button.js';
import './Link.js';
import './Text.js';
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

const SAMPLE_ITEMS: FeedItem[] = [
  {
    id: 'a1',
    heading: 'Ana commented on Invoice 42',
    timestamp: '2026-09-15T09:00:00Z',
    content: html`<ds-text>Looks right to me.</ds-text>`,
    actions: html`<ds-button label="Reply" variant="secondary" size="sm"></ds-button>`,
    unread: true,
  },
  {
    id: 'a2',
    heading: 'Bo approved Invoice 41',
    timestamp: '2026-09-14T16:20:00Z',
    content: html`<ds-link href="#invoice-41" label="Open Invoice 41"></ds-link>`,
  },
  {
    id: 'a3',
    heading: 'Cy exported the March report',
    timestamp: '2026-09-10T12:00:00Z',
    content: html`<ds-text>The export is ready to download.</ds-text>`,
    actions: html`<ds-button label="Download" variant="secondary" size="sm"></ds-button>`,
  },
];

const meta: Meta<FeedArgs> = {
  title: 'Feed/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['load-more', 'show-new', 'item-visible'] },
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: ['2', '3', '4'] },
    hasMore: { control: 'boolean' },
    loading: { control: 'boolean' },
    newItemsCount: { control: 'number' },
    endMessage: { control: 'text' },
  },
  args: {
    label: 'Activity',
    items: SAMPLE_ITEMS,
    hasMore: false,
    loading: false,
    headingLevel: '3',
    newItemsCount: undefined,
    endMessage: undefined,
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
export const Empty: Story = { args: { items: [], hasMore: false } };
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
 * Present with three focusable children inside the feed's own articles (a Reply button, a Link and a
 * Download button). The new-items row is a sibling of the `role="feed"` element rather than one of
 * its children, so its button is deliberately absent here: it would be the first Tab stop on the
 * page while sitting outside the feed the keyboard gate walks.
 */
export const Keyboard: Story = {};
