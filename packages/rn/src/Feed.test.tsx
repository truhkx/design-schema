/**
 * Feed — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Feed } from './Feed';
import type { FeedItem, FeedProps } from './Feed';
import meta from './Feed.stories';
import { ThemeProvider } from './theme';

function setup(given: Partial<FeedProps> = {}) {
  const props: FeedProps = { ...(meta.args as FeedProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Feed {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

const ONE_ITEM: FeedItem[] = [
  { id: 'a1', heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' },
];

describe('Feed', () => {
  it('an-empty-feed-asks-for-its-first-page', () => {
    const onEndReached = jest.fn();
    setup({ items: [], hasMore: true, loading: false, onEndReached });
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('pressing-show-new-asks-for-the-newer-items', () => {
    const onShowNew = jest.fn();
    setup({ newItemsCount: 3, items: ONE_ITEM, onShowNew });
    const part = screen.getByTestId('Feed.newItemsButton');
    fireEvent.press(within(part).getByRole('button'));
    expect(onShowNew).toHaveBeenCalledTimes(1);
  });

  it('the-end-message-shows-when-there-is-nothing-more', () => {
    setup({ hasMore: false, items: ONE_ITEM });
    expect(screen.getByText('You are all caught up.')).toBeTruthy();
  });

  it('a-custom-end-message-replaces-the-default', () => {
    setup({ hasMore: false, endMessage: 'That is everything from this week.', items: ONE_ITEM });
    expect(screen.getByText('That is everything from this week.')).toBeTruthy();
  });

  it('an-empty-feed-that-is-not-loading-says-so', () => {
    setup({ items: [], hasMore: false, loading: false });
    expect(screen.getByText('Nothing here yet.')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const f = setup();
    expect(f.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-2', () => {
    const f = setup({ headingLevel: '2' });
    expect(f.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-3', () => {
    const f = setup({ headingLevel: '3' });
    expect(f.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-4', () => {
    const f = setup({ headingLevel: '4' });
    expect(f.toJSON()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const f = setup();
    expect(screen.getByLabelText(f.props.label)).toBeTruthy();
  });
});
