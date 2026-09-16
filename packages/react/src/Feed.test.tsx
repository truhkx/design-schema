/**
 * Feed — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/feed.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Feed.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Feed, type FeedItem } from './Feed';
import meta from './Feed.stories';

type Props = ComponentProps<typeof Feed>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  return render(<Feed {...props} />);
}

const ONE_ITEM: FeedItem[] = [
  {
    id: 'a1',
    heading: 'Ana commented on Invoice 42',
    timestamp: '2026-09-15T09:00:00Z',
    content: 'Looks right to me.',
  },
];

describe('Feed', () => {
  it('an-empty-feed-asks-for-its-first-page', () => {
    const onLoadMore = vi.fn();
    setup({ items: [], hasMore: true, loading: false, onLoadMore });
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('pressing-show-new-asks-for-the-newer-items', () => {
    const onShowNew = vi.fn();
    const { container } = setup({ newItemsCount: 3, items: ONE_ITEM, onShowNew });
    // Button owns its own data-part, so the part hook is Feed's row around it.
    const part = container.querySelector<HTMLElement>('[data-part="newItemsButton"]');
    expect(part).not.toBeNull();
    fireEvent.click(part!.querySelector('button') ?? part!);
    expect(onShowNew).toHaveBeenCalled();
  });

  it('the-end-message-shows-when-there-is-nothing-more', () => {
    setup({ hasMore: false, items: ONE_ITEM });
    expect(screen.getByText('You are all caught up.')).toBeInTheDocument();
  });

  it('a-custom-end-message-replaces-the-default', () => {
    setup({ hasMore: false, endMessage: 'That is everything from this week.', items: ONE_ITEM });
    expect(screen.getByText('That is everything from this week.')).toBeInTheDocument();
  });

  it('an-empty-feed-that-is-not-loading-says-so', () => {
    setup({ items: [], hasMore: false, loading: false });
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
  });

  it('loading-marks-the-feed-busy', () => {
    setup({ loading: true, hasMore: true });
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true');
  });

  /* derived */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-heading-level-2', () => {
    const { container } = setup({ headingLevel: '2' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-heading-level-3', () => {
    const { container } = setup({ headingLevel: '3' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-heading-level-4', () => {
    const { container } = setup({ headingLevel: '4' });
    expect(container.firstChild).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('feed', { name: (meta.args as Props).label })).toBeInTheDocument();
  });
});
