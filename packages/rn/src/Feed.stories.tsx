import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Feed } from './Feed';
import type { FeedItem } from './Feed';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const now = Date.now();
const minutesAgo = (minutes: number): string => new Date(now - minutes * 60_000).toISOString();

const SAMPLE_ITEMS: FeedItem[] = [
  {
    id: '1',
    heading: 'Ana commented on Invoice 42',
    timestamp: minutesAgo(3),
    content: <Text>Looks right to me.</Text>,
    actions: <Button label="Reply" variant="secondary" size="sm" />,
    unread: true,
  },
  {
    id: '2',
    heading: 'Priya assigned you Ticket 118',
    timestamp: minutesAgo(47),
    content: (
      <Stack gap="tight">
        <Text>The export is missing line items.</Text>
        <Link href="#" label="Open ticket" />
      </Stack>
    ),
  },
  {
    id: '3',
    heading: 'Bo approved Invoice 41',
    timestamp: minutesAgo(180),
    content: <Text>Approved for payment.</Text>,
  },
];

const meta: Meta<typeof Feed> = {
  title: 'Feed/React Native',
  component: Feed,
  decorators: [withTheme()],
  args: {
    label: 'Activity',
    items: SAMPLE_ITEMS,
    hasMore: true,
    loading: false,
    headingLevel: '3',
  },
};

export default meta;

type Story = StoryObj<typeof Feed>;

export const Default: Story = {};

export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

export const Loading: Story = { args: { loading: true } };
export const LoadingEmpty: Story = { args: { items: [], loading: true } };
export const EndOfFeed: Story = { args: { hasMore: false } };
export const NewItemsAvailable: Story = { args: { newItemsCount: 4 } };
export const Empty: Story = { args: { items: [], hasMore: false } };

/** Three newer items waiting above and articles with actions and a Link: at least three focusable children. */
export const Keyboard: Story = { args: { newItemsCount: 3, hasMore: false } };

// Examples from the schema, with exactly their `given` as args.
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
      { id: 'n1', heading: 'Your export is ready', timestamp: '2026-09-15T08:00:00Z', content: 'The March export finished.', unread: true },
      { id: 'n2', heading: 'Invoice 42 was paid', timestamp: '2026-09-14T11:00:00Z', content: 'Payment received.' },
    ],
  },
};

export const CaughtUp: Story = {
  args: {
    label: 'Activity',
    hasMore: false,
    endMessage: 'That is everything from this week.',
    items: [{ id: 'a1', heading: 'Bo approved Invoice 41', timestamp: '2026-09-14T16:20:00Z', content: 'Approved for payment.' }],
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
