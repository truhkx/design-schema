import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button, type ButtonOverridableBinding } from './Button';
import { Card, type CardOverridableBinding } from './Card';
import { ProgressBar } from './ProgressBar';
import { Stack, type StackOverridableBinding } from './Stack';
import { Text, type TextOverridableBinding } from './Text';
import './Feed.css';

/** Accepts the schema's string values and their numeric equivalents. */
export type FeedHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

export type FeedItem = {
  id: string;
  heading: string;
  timestamp: string;
  content: ReactNode;
  actions?: ReactNode;
  unread?: boolean;
};

const COPY = {
  showNew: 'Show {count} new',
  loading: 'Loading more',
  end: 'You are all caught up.',
  unread: 'unread',
  position: '{index} of {total}',
  empty: 'Nothing here yet.',
  justNow: 'just now',
  minutesAgo: '{n} min ago',
  hoursAgo: '{n} hr ago',
  daysAgo: '{n} d ago',
} as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'articleBodyGap'
  | 'articleRadius'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'newItemsLayer'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'emptyStateInset'
  | 'emptyStateSize'
  | 'fontFamily';

/** Bindings Feed owns as hooks on its root. The rest forward to composed children's `overrides`. */
const ROOT_HOOK: Partial<Record<FeedOverridableBinding, string>> = {
  itemGap: '--ds-feed-item-gap',
  articleRadius: '--ds-feed-article-radius',
  newItemsOffset: '--ds-feed-new-items-offset',
  newItemsLayer: '--ds-feed-new-items-layer',
  loadingInset: '--ds-feed-loading-inset',
  endMessageInset: '--ds-feed-end-message-inset',
  emptyStateInset: '--ds-feed-empty-state-inset',
  fontFamily: '--ds-feed-font-family',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

interface ResolvedOverrides {
  rootStyle: CSSProperties | undefined;
  card: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  articleBody: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
  timestamp: TextOverrides | undefined;
  endMessage: TextOverrides | undefined;
  emptyState: TextOverrides | undefined;
  newItemsButton: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
}

function resolveOverrides(overrides: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined): ResolvedOverrides {
  if (!overrides) {
    return {
      rootStyle: undefined,
      card: undefined,
      articleBody: undefined,
      timestamp: undefined,
      endMessage: undefined,
      emptyState: undefined,
      newItemsButton: undefined,
    };
  }
  const rootStyle: Record<string, string> = {};
  const card: Partial<Record<CardOverridableBinding, TokenRef | undefined>> = {};
  const articleBody: Partial<Record<StackOverridableBinding, TokenRef | undefined>> = {};
  const timestamp: TextOverrides = {};
  const endMessage: TextOverrides = {};
  const emptyState: TextOverrides = {};
  const newItemsButton: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {};
  for (const binding of Object.keys(overrides) as FeedOverridableBinding[]) {
    const tokenRef = overrides[binding];
    if (!tokenRef) continue;
    const hook = ROOT_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(tokenRef);
    switch (binding) {
      case 'articleInset':
        card.paddingBlock = tokenRef;
        card.paddingInline = tokenRef;
        break;
      case 'articleBodyGap':
        articleBody.gap = tokenRef;
        break;
      case 'timestampSize':
        timestamp.fontSize = tokenRef;
        break;
      case 'endMessageSize':
        endMessage.fontSize = tokenRef;
        break;
      case 'emptyStateSize':
        emptyState.fontSize = tokenRef;
        break;
      case 'fontFamily':
        timestamp.fontFamily = tokenRef;
        endMessage.fontFamily = tokenRef;
        emptyState.fontFamily = tokenRef;
        newItemsButton.fontFamily = tokenRef;
        break;
      default:
        // Locked bindings are not in the type; anything else is a root hook handled above.
        break;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, card, articleBody, timestamp, endMessage, emptyState, newItemsButton };
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_LIMIT_DAYS = 7;
/** How long an item stays half visible before `onItemVisible` fires. */
const VISIBLE_DWELL = SECOND;

/** Relative time from the copy strings; a week or more (or an unparseable date) falls back to the absolute date. */
function formatRelative(iso: string, now: number): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return iso;
  const elapsed = Math.max(0, now - time);
  if (elapsed < MINUTE) return COPY.justNow;
  if (elapsed < HOUR) return COPY.minutesAgo.replace('{n}', String(Math.floor(elapsed / MINUTE)));
  if (elapsed < DAY) return COPY.hoursAgo.replace('{n}', String(Math.floor(elapsed / HOUR)));
  if (elapsed < RELATIVE_LIMIT_DAYS * DAY) return COPY.daysAgo.replace('{n}', String(Math.floor(elapsed / DAY)));
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(time);
}

function formatAbsolute(iso: string): string | undefined {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return undefined;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(time);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Focusable elements outside `root`, in document order. */
function outsideFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !root.contains(el) && !el.closest('[inert]'),
  );
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export interface FeedProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-label' | 'aria-busy' | 'className' | 'style'> {
  /** What the feed contains ("Activity", "Notifications"). */
  label: string;
  /**
   * Articles, newest first. `heading` names the article (a Heading inside the Card); `timestamp` is
   * ISO and rendered relative from the copy strings, with the absolute time as its title; `unread`
   * marks items the user has not seen.
   */
  items: FeedItem[];
  /**
   * More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches,
   * and whenever `items` is empty and not `loading` — on mount and again if the caller clears `items`.
   */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  loading?: boolean | undefined;
  /**
   * Number of newer items available above (from polling or a socket). The feed does not insert
   * them — that would shift what the reader is looking at — it shows a "Show {count} new" button at
   * the top which prepends and scrolls.
   */
  newItemsCount?: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`. */
  endMessage?: string | undefined;
  /** Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore`). */
  onLoadMore?: (() => void) | undefined;
  /** Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: (() => void) | undefined;
  /** Fired with an item id when it has been substantially visible for a moment (mark as read). */
  onItemVisible?: ((id: string) => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Feed — Design Schema, category: container.
 *
 * When to use:
 * Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.
 */
export function Feed({
  ref,
  label,
  items,
  hasMore = false,
  loading = false,
  newItemsCount,
  headingLevel = '3',
  endMessage,
  onLoadMore,
  onShowNew,
  onItemVisible,
  overrides,
  onKeyDown,
  ...rest
}: FeedProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = `ds-feed${useId()}`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  // The element that carries role="feed": its direct children are the articles, so the live row and
  // the loading indicator are siblings of it rather than children (a feed owns its articles).
  const feedRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);

  const articleRefs = useRef(new Map<string, HTMLElement>());
  const newItemsButtonRef = useRef<HTMLButtonElement | null>(null);

  // The label is the feed's only accessible name; there is no default. Warns once per mount.
  const warnedLabelRef = useRef(false);
  const warnEmptyLabel = isDev && label.trim() === '';
  useEffect(() => {
    if (warnEmptyLabel && !warnedLabelRef.current) {
      warnedLabelRef.current = true;
      console.warn('Feed: label is the accessible name of the feed and must not be empty.');
    }
  }, [warnEmptyLabel]);

  const onLoadMoreRef = useRef(onLoadMore);
  const onItemVisibleRef = useRef(onItemVisible);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    onItemVisibleRef.current = onItemVisible;
  });

  const total = items.length;
  const firstId = items[0]?.id;
  const lastId = items[total - 1]?.id;
  const idsKey = items.map((item) => item.id).join(' ');
  const showNewButton = newItemsCount !== undefined && newItemsCount > 0;

  // After "Show new", focus moves to the first new article once the caller has prepended it. The
  // request lives until the next change of `items` and no further: that change takes it when it puts
  // a new id first, and otherwise drops it, so an unrelated later prepend never steals focus.
  const pendingFocusNewRef = useRef(false);
  const lastFirstIdRef = useRef(firstId);
  useEffect(() => {
    const previousFirstId = lastFirstIdRef.current;
    lastFirstIdRef.current = firstId;
    if (!pendingFocusNewRef.current) return;
    pendingFocusNewRef.current = false;
    if (firstId === undefined || firstId === previousFirstId) return;
    const node = articleRefs.current.get(firstId);
    if (!node) return;
    node.focus({ preventScroll: true });
    if (typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }, [idsKey, firstId]);

  // An empty feed has no last article to observe, so it asks for its first page itself: on mount, again
  // if the caller clears `items`, and again after a `loading` cycle that left it empty (a failed page).
  const firedEmptyLoadRef = useRef(false);
  useEffect(() => {
    if (total > 0 || loading) {
      firedEmptyLoadRef.current = false;
    } else if (hasMore && !firedEmptyLoadRef.current) {
      firedEmptyLoadRef.current = true;
      onLoadMoreRef.current?.();
    }
  }, [total, hasMore, loading]);

  // Load more when the last article is within one viewport of view.
  useEffect(() => {
    if (!hasMore || loading || lastId === undefined || typeof IntersectionObserver === 'undefined') return undefined;
    const node = articleRefs.current.get(lastId);
    if (!node) return undefined;
    // While the last article stays in view the feed asks at most once per change of the last id, hasMore or loading.
    let asked = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (asked || !entries.some((entry) => entry.isIntersecting)) return;
        asked = true;
        onLoadMoreRef.current?.();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lastId, hasMore, loading]);

  // Half visible for a second → onItemVisible, once per item id per mount.
  const reportedVisibleRef = useRef(new Set<string>());
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const idByNode = new Map<Element, string>();
    articleRefs.current.forEach((node, id) => {
      if (!reportedVisibleRef.current.has(id)) idByNode.set(node, id);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByNode.get(entry.target);
          if (id === undefined) continue;
          const pending = timers.get(id);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (pending !== undefined) continue;
            timers.set(
              id,
              setTimeout(() => {
                timers.delete(id);
                if (reportedVisibleRef.current.has(id)) return;
                reportedVisibleRef.current.add(id);
                observer.unobserve(entry.target);
                onItemVisibleRef.current?.(id);
              }, VISIBLE_DWELL),
            );
          } else if (pending !== undefined) {
            clearTimeout(pending);
            timers.delete(id);
          }
        }
      },
      { threshold: 0.5 },
    );
    idByNode.forEach((_, node) => observer.observe(node));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [idsKey]);

  const handleShowNew = (): void => {
    pendingFocusNewRef.current = true;
    onShowNew?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    const root = rootRef.current;
    const feed = feedRef.current;
    if (event.defaultPrevented || !root || !feed) return;
    const article = (event.target as HTMLElement).closest<HTMLElement>('[role="article"]');
    // Feed commands apply only while focus is within one of this feed's articles.
    if (!article || article.closest('[role="feed"]') !== feed) return;

    if ((event.key === 'PageDown' || event.key === 'PageUp') && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const articles = Array.from(feed.querySelectorAll<HTMLElement>('[role="article"]')).filter(
        (el) => el.closest('[role="feed"]') === feed,
      );
      const index = articles.indexOf(article);
      event.preventDefault();
      articles[index + (event.key === 'PageDown' ? 1 : -1)]?.focus();
      return;
    }
    if (event.key === 'End' && event.ctrlKey) {
      event.preventDefault();
      if (hasMore) {
        // Nothing to ask for while a page is already on its way; press again once it has landed.
        if (!loading) onLoadMoreRef.current?.();
      } else {
        outsideFocusables(root)
          .find((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
          ?.focus();
      }
      return;
    }
    if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      if (showNewButton && newItemsButtonRef.current) {
        newItemsButtonRef.current.focus();
      } else {
        outsideFocusables(root)
          .filter((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0)
          .pop()
          ?.focus();
      }
    }
  };

  const resolved = resolveOverrides(overrides);
  const now = Date.now();
  const totalKnown = !hasMore;
  // A feed has to own at least one article: with none, the column is a plain container rather than an
  // unowned role="feed" (which is an ARIA error, and axe's aria-required-children reports it). While
  // `loading` the role stays with aria-busy, which is the sanctioned way to own nothing yet.
  const isFeed = total > 0 || loading;

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Feed"
      className="ds-feed"
      style={resolved.rootStyle}
      onKeyDown={handleKeyDown}
    >
      {/* Always rendered so the button's count is announced the moment it first appears; padded only while shown. */}
      <div
        className={showNewButton ? 'ds-feed__new-items ds-feed__new-items--shown' : 'ds-feed__new-items'}
        data-part={showNewButton ? 'newItemsButton' : undefined}
        role="status"
      >
        {showNewButton ? (
          <Button
            ref={newItemsButtonRef}
            variant="secondary"
            size="sm"
            label={COPY.showNew.replace('{count}', String(newItemsCount))}
            overrides={resolved.newItemsButton}
            onClick={handleShowNew}
          />
        ) : null}
      </div>
      <div
        ref={feedRef}
        className="ds-feed__items"
        data-part="container"
        role={isFeed ? 'feed' : undefined}
        aria-label={isFeed ? label : undefined}
        aria-busy={isFeed ? loading : undefined}
      >
        {items.map((item, index) => {
          const timestampId = `${baseId}-${index}-time`;
          const absolute = formatAbsolute(item.timestamp);
          return (
            <div
              key={item.id}
              className={item.unread ? 'ds-feed__item ds-feed__item--unread' : 'ds-feed__item'}
              data-part="article"
            >
              <Card
                ref={(node: HTMLElement | null) => {
                  if (node) articleRefs.current.set(item.id, node);
                  else articleRefs.current.delete(item.id);
                }}
                focusable
                heading={item.heading}
                headingLevel={headingLevel}
                inset="md"
                overrides={resolved.card}
                role="article"
                aria-describedby={timestampId}
                aria-posinset={index + 1}
                aria-setsize={totalKnown ? total : -1}
                footer={
                  item.actions !== undefined && item.actions !== null ? (
                    <div className="ds-feed__part" data-part="articleActions">
                      <Stack direction="horizontal" gap="tight">
                        {item.actions}
                      </Stack>
                    </div>
                  ) : undefined
                }
              >
                <div className="ds-feed__part" data-part="articleBody">
                  <Stack gap="tight" overrides={resolved.articleBody}>
                    {item.unread ? <span className="ds-feed__visually-hidden">{COPY.unread}</span> : null}
                    <Text element="span" tone="muted" size="xs" overrides={resolved.timestamp}>
                      <time id={timestampId} className="ds-feed__timestamp" data-part="timestamp" dateTime={item.timestamp} title={absolute}>
                        {formatRelative(item.timestamp, now)}
                      </time>
                    </Text>
                    {totalKnown ? (
                      <span className="ds-feed__visually-hidden">
                        {COPY.position.replace('{index}', String(index + 1)).replace('{total}', String(total))}
                      </span>
                    ) : null}
                    {item.content}
                  </Stack>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      {/* The footer is one slot, and every piece of it sits outside the feed element (a feed owns only
          articles): loading wins, then an empty feed with `hasMore` shows nothing, then an empty feed
          without it shows copy.empty, then a feed with items and without `hasMore` shows the end message. */}
      {loading ? (
        <div className="ds-feed__loading" data-part="loadingIndicator">
          {/* Not live: aria-busy on the feed covers loading, so the bar announces nothing of its own. */}
          <ProgressBar label={COPY.loading} hideLabel announce="none" />
        </div>
      ) : total === 0 ? (
        hasMore ? null : (
          <div className="ds-feed__empty-state" data-part="emptyState">
            <Text tone="muted" size="sm" overrides={resolved.emptyState}>
              {COPY.empty}
            </Text>
          </div>
        )
      ) : hasMore ? null : (
        <div className="ds-feed__end-message" data-part="endMessage">
          <Text tone="muted" size="sm" overrides={resolved.endMessage}>
            {endMessage ?? COPY.end}
          </Text>
        </div>
      )}
    </div>
  );
}
