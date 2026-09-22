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

/** The role="feed" column: the element whose direct children are the articles. */
function feed(el: DsFeed): HTMLElement | null {
  return el.shadowRoot!.querySelector<HTMLElement>('[data-part=container]');
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
    // `newItemsButton` is the sticky live row; the Button hosts its own anatomy inside it.
    const button = part('newItemsButton')?.querySelector('ds-button');
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

  it('loading-marks-the-feed-busy', async () => {
    const { el } = await setup({ loading: true, hasMore: true });
    expect(feed(el)?.getAttribute('aria-busy')).toBe('true');
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
    // role and the name sit on the items column, not the host: a feed owns its articles directly.
    expect(feed(el)?.getAttribute('role')).toBe('feed');
    expect(feed(el)?.getAttribute('aria-label')).toBe(meta.args?.label);
  });

  it('a feed owning no article carries no role, so it is never an empty feed', async () => {
    const { el } = await setup({ items: [], hasMore: false, loading: false });
    expect(feed(el)?.hasAttribute('role')).toBe(false);
  });

  it('only articles are children of the feed element', async () => {
    const { el } = await setup({ hasMore: false });
    const children = Array.from(feed(el)!.children);
    expect(children.length).toBeGreaterThan(0);
    expect(children.every((child) => child.getAttribute('data-part') === 'article')).toBe(true);
  });

  /**
   * A negative tabindex on a *shadow host* takes that host's whole flat-tree subtree out of
   * sequential focus navigation, so the article's focus target has to be Feed's own wrapper
   * div. With it on the composed Card instead, Tab reaches nothing inside any article.
   */
  it('articles are focusable without taking their content out of the tab order', async () => {
    const { el } = await setup();
    const articles = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('[data-part=article]'));
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      expect(article.getAttribute('tabindex')).toBe('-1');
      expect(article.getAttribute('role')).toBe('article');
      expect(article.querySelector('ds-card')?.hasAttribute('tabindex')).toBe(false);
    }
    articles[0]!.focus();
    expect(el.shadowRoot!.activeElement).toBe(articles[0]);
  });

  it('PageDown and PageUp move between articles', async () => {
    const { el } = await setup();
    const articles = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('[data-part=article]'));
    articles[0]!.focus();
    await userEvent.keyboard('{PageDown}');
    expect(el.shadowRoot!.activeElement).toBe(articles[1]);
    await userEvent.keyboard('{PageUp}');
    expect(el.shadowRoot!.activeElement).toBe(articles[0]);
  });

  it('Ctrl+End asks for more from inside an article, and does nothing while loading', async () => {
    const { el, loadMore } = await setup({ hasMore: true });
    el.shadowRoot!.querySelector<HTMLElement>('[data-part=article]')!.focus();
    // The last article is in view here, so the observer asks too; count the key's own asks.
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    const beforeKey = loadMore.mock.calls.length;
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(loadMore.mock.calls.length).toBe(beforeKey + 1);

    el.loading = true;
    await el.updateComplete;
    const whileLoading = loadMore.mock.calls.length;
    await userEvent.keyboard('{Control>}{End}{/Control}');
    expect(loadMore.mock.calls.length).toBe(whileLoading);
  });

  it('Ctrl+Home goes to the new-items button when it is shown', async () => {
    const { el } = await setup({ newItemsCount: 2 });
    el.shadowRoot!.querySelector<HTMLElement>('[data-part=article]')!.focus();
    await userEvent.keyboard('{Control>}{Home}{/Control}');
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.new-items-row ds-button'));
  });
});
