import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Feed, type FeedItem } from './Feed';
import { Link } from './Link';
import { Text } from './Text';

const SAMPLE_ITEMS: FeedItem[] = [
  {
    id: 'a1',
    heading: 'Ana commented on Invoice 42',
    timestamp: '2026-09-15T09:00:00Z',
    content: <Text>Looks right to me.</Text>,
    actions: <Button label="Reply" variant="secondary" size="sm" />,
    unread: true,
  },
  {
    id: 'a2',
    heading: 'Bo approved Invoice 41',
    timestamp: '2026-09-14T16:20:00Z',
    content: <Link href="#invoice-41" label="Open Invoice 41" />,
  },
  {
    id: 'a3',
    heading: 'Cy exported the March report',
    timestamp: '2026-09-10T12:00:00Z',
    content: <Text>The export is ready to download.</Text>,
    actions: <Button label="Download" variant="secondary" size="sm" />,
  },
];

const meta: Meta<typeof Feed> = {
  title: 'Feed/React',
  component: Feed,
  tags: ['autodocs'],
  args: {
    label: 'Activity',
    items: SAMPLE_ITEMS,
    hasMore: false,
    loading: false,
    headingLevel: '3',
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: ['2', '3', '4'] },
    onLoadMore: { action: 'onLoadMore' },
    onShowNew: { action: 'onShowNew' },
    onItemVisible: { action: 'onItemVisible' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

/* states */
export const Loading: Story = { args: { hasMore: true, loading: true } };
export const Empty: Story = { args: { items: [], hasMore: false } };

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

/** Present with the new-items button and three focusable children inside the articles. */
export const Keyboard: Story = {
  args: { newItemsCount: 2 },
};
