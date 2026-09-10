import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Feed } from './Feed';
import type { FeedItem } from './Feed';
import { Link } from './Link';
import { Text } from './Text';
import { withTheme } from './decorators';

const now = Date.now();
const minutesAgo = (minutes: number): string => new Date(now - minutes * 60 * 1000).toISOString();

const SAMPLE_ITEMS: FeedItem[] = [
  {
    id: '1',
    heading: 'Ana commented on Invoice 42',
    timestamp: minutesAgo(3),
    content: <Text>"Looks good, approving now."</Text>,
    actions: <Button label="Reply" variant="secondary" size="sm" />,
    unread: true,
  },
  {
    id: '2',
    heading: 'Priya assigned you Ticket 118',
    timestamp: minutesAgo(47),
    content: (
      <View style={{ gap: 4 }}>
        <Text>"Customer reports the export is missing line items."</Text>
        <Link href="#" label="Open ticket" />
      </View>
    ),
  },
  {
    id: '3',
    heading: 'System backup completed',
    timestamp: minutesAgo(180),
    content: <Text tone="muted">All volumes archived successfully.</Text>,
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

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

export const Loading: Story = { args: { loading: true } };

export const EndOfFeed: Story = { args: { hasMore: false } };

export const CustomEndMessage: Story = { args: { hasMore: false, endMessage: "That's everything for today." } };

export const NewItemsAvailable: Story = { args: { newItemsCount: 4 } };

export const Empty: Story = { args: { items: [], hasMore: false } };

/** At least three focusable children (two article actions plus a content Link), for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  args: {
    items: [
      ...SAMPLE_ITEMS,
      {
        id: '4',
        heading: 'Diego mentioned you in Project Nova',
        timestamp: minutesAgo(240),
        content: <Text>"Can you take a look at the latest draft?"</Text>,
        actions: <Button label="View" variant="secondary" size="sm" />,
      },
    ],
  },
};
