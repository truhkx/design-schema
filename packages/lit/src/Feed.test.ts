/**
 * <ds-feed> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Feed.js';
import type { DsFeed, FeedItem } from './Feed.js';
import meta from './Feed.stories.js';

type Given = Partial<
  Pick<DsFeed, 'label' | 'items' | 'hasMore' | 'loading' | 'newItemsCount' | 'headingLevel' | 'endMessage'>
>;

const ONE_ITEM: FeedItem[] = [
  { id: 'a1', heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' },
];

/** The Default story's args plus the scenario's `given`, as properties on a fresh element; listeners attach before connect. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-feed');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const loadMore = vi.fn();
  const showNew = vi.fn();
  el.addEventListener('load-more', loadMore);
  el.addEventListener('show-new', showNew);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    loadMore,
    showNew,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`),
  };
}

function rendered(el: DsFeed) {
  expect(el.isConnected).toBe(true);
  expect(el.getAttribute('data-ds')).toBe('Feed');
  expect(el.shadowRoot!.querySelector('[data-part=container]')).not.toBeNull();
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('ds-feed behavior', () => {
  it('an-empty-feed-asks-for-its-first-page', async () => {
    const { loadMore } = await setup({ items: [], hasMore: true, loading: false });
    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('pressing-show-new-asks-for-the-newer-items', async () => {
    const { part, showNew } = await setup({ newItemsCount: 3, items: ONE_ITEM });
    const button = part('newItemsButton');
    expect(button).not.toBeNull();
    await userEvent.click(button!);
    expect(showNew).toHaveBeenCalledTimes(1);
  });

  it('the-end-message-shows-when-there-is-nothing-more', async () => {
    const { part } = await setup({ hasMore: false, items: ONE_ITEM });
    expect(part('endMessage')?.textContent?.trim()).toBe('You are all caught up.');
  });

  it('a-custom-end-message-replaces-the-default', async () => {
    const { part } = await setup({ hasMore: false, endMessage: 'That is everything from this week.', items: ONE_ITEM });
    expect(part('endMessage')?.textContent?.trim()).toBe('That is everything from this week.');
  });

  it('an-empty-feed-that-is-not-loading-says-so', async () => {
    const { part } = await setup({ items: [], hasMore: false, loading: false });
    expect(part('emptyState')?.textContent?.trim()).toBe('Nothing here yet.');
  });

  it('renders', async () => {
    rendered((await setup()).el);
  });

  it('renders-heading-level-2', async () => {
    rendered((await setup({ headingLevel: '2' })).el);
  });

  it('renders-heading-level-3', async () => {
    rendered((await setup({ headingLevel: '3' })).el);
  });

  it('renders-heading-level-4', async () => {
    rendered((await setup({ headingLevel: '4' })).el);
  });

  it('has-accessible-name', async () => {
    const { el } = await setup();
    expect(el.getAttribute('role')).toBe('feed');
    expect(el.getAttribute('aria-label')).toBe(meta.args?.label);
  });
});
