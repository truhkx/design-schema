import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button, type ButtonOverridableBinding } from './Button';
import { Card, type CardOverridableBinding } from './Card';
import { ProgressBar } from './ProgressBar';
import { Text, type TextOverridableBinding } from './Text';
import './Feed.css';

/** The schema declares the values as strings; numbers are accepted for ergonomics. */
export type FeedHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** One article. `heading` names it (a Heading inside the article's Card); `timestamp` is ISO and
 * rendered relative, with the absolute time as its title; `unread` marks items not yet seen. */
export interface FeedItem {
  id: string;
  heading: string;
  timestamp: string;
  content: ReactNode;
  actions?: ReactNode;
  unread?: boolean | undefined;
}

const COPY = {
  showNew: 'Show {count} new',
  loading: 'Loading more',
  end: 'You are all caught up.',
  unread: 'unread',
  position: '{index} of {total}',
  empty: 'Nothing here yet.',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'unreadBorderWidth'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'fontFamily';

/** Bindings owned by the root; `articleInset` forwards to each composed Card's own padding hooks,
 * and `timestampSize`/`endMessageSize`/`fontFamily` forward into the composed Text (and, for
 * `fontFamily`, the new-items Button) instances' own `overrides`, since those components already
 * own that hook. */
const ROOT_OVERRIDE_HOOK: Partial<Record<FeedOverridableBinding, string | undefined>> = {
  itemGap: '--ds-feed-item-gap',
  unreadBorderWidth: '--ds-feed-unread-border-width',
  newItemsOffset: '--ds-feed-new-items-offset',
  loadingInset: '--ds-feed-loading-inset',
  endMessageInset: '--ds-feed-end-message-inset',
};

function overridesToStyle(overrides: Partial<Record<FeedOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  articleOverrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>>;
  timestampOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  endMessageOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  newItemsButtonOverrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const articleOverrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>> = {};
  const timestampOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const endMessageOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const newItemsButtonOverrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {};

  for (const binding of Object.keys(overrides) as FeedOverridableBinding[]) {
    const tokenRef = overrides[binding];
    if (!tokenRef) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) {
      rootStyle[hook] = cssVar(tokenRef);
      continue;
    }
    switch (binding) {
      case 'articleInset':
        articleOverrides.paddingBlock = tokenRef;
        articleOverrides.paddingInline = tokenRef;
        break;
      case 'timestampSize':
        timestampOverrides.fontSize = tokenRef;
        break;
      case 'endMessageSize':
        endMessageOverrides.fontSize = tokenRef;
        break;
      case 'fontFamily':
        timestampOverrides.fontFamily = tokenRef;
        endMessageOverrides.fontFamily = tokenRef;
        newItemsButtonOverrides.fontFamily = tokenRef;
        break;
    }
  }

  return { rootStyle: rootStyle as CSSProperties, articleOverrides, timestampOverrides, endMessageOverrides, newItemsButtonOverrides };
}

/** Elements the Ctrl+Home/Ctrl+End feed commands can escape to. */
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Moves focus to the first focusable element after `root` in document order. */
function focusAfter(root: HTMLElement): void {
  const candidates = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !root.contains(el),
  );
  candidates.find((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)?.focus();
}

/** Moves focus to the last focusable element before `root` in document order. */
function focusBefore(root: HTMLElement): void {
  const candidates = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !root.contains(el),
  );
  candidates.filter((el) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0).pop()?.focus();
}

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

/** No `copy.*` token covers relative time ("3 min ago"); this leans on the platform's own i18n
 * formatting rather than inventing English strings, matching the Lit generation's locale choice. */
function formatRelativeTime(iso: string): string {
  let duration = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_TIME.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return RELATIVE_TIME.format(Math.round(duration), 'years');
}

function formatAbsoluteTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export interface FeedProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-label' | 'aria-busy'> {
  /** What the feed contains ("Activity", "Notifications"). */
  label: string;
  /** Articles, newest first. */
  items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches. */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  loading?: boolean | undefined;
  /**
   * Number of newer items available above (from polling or a socket). The feed does not insert
   * them — that would shift what the reader is looking at — it shows a "Show {count} new" button
   * at the top which prepends and scrolls.
   */
  newItemsCount?: number | undefined;
  /** Heading level for article headings, matching the page outline. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
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
 * Use a Feed for a stream of similar, time-ordered items whose total is unknown or large:
 * activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a
 * time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the
 * reader is looking; use `onItemVisible` to mark things read.
 */
export const Feed = function Feed({
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
  className,
  style,
  ...rest
}: FeedProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const baseId = `ds-feed${generatedId}`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const articleRefs = useRef(new Map<string, HTMLElement>());
  const newItemsButtonRef = useRef<HTMLButtonElement | null>(null);

  const onLoadMoreRef = useRef(onLoadMore);
  const onItemVisibleRef = useRef(onItemVisible);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    onItemVisibleRef.current = onItemVisible;
  });

  // The feed never inserts new items itself: pressing "Show new" only asks the caller to prepend
  // them. Once that lands (the first item's id changes), focus moves to it.
  const pendingFocusNewRef = useRef(false);
  const lastFirstIdRef = useRef(items[0]?.id);
  useEffect(() => {
    if (pendingFocusNewRef.current && items[0] && items[0].id !== lastFirstIdRef.current) {
      pendingFocusNewRef.current = false;
      const node = articleRefs.current.get(items[0].id);
      node?.focus();
      node?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }
    lastFirstIdRef.current = items[0]?.id;
  }, [items]);

  // An empty feed has no last article to observe, so it asks for its first page itself.
  const firedInitialLoadRef = useRef(false);
  useEffect(() => {
    if (items.length === 0 && hasMore && !loading && !firedInitialLoadRef.current) {
      firedInitialLoadRef.current = true;
      onLoadMoreRef.current?.();
    } else if (items.length > 0) {
      firedInitialLoadRef.current = false;
    }
  }, [items, hasMore, loading]);

  // Loads more as the last article nears view.
  useEffect(() => {
    if (!hasMore || loading || items.length === 0 || typeof IntersectionObserver === 'undefined') return undefined;
    const node = articleRefs.current.get(items[items.length - 1]!.id);
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current?.();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [items, hasMore, loading]);

  // Marks items read once they have been at least half visible for a moment.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const timers = new Map<string, number>();
    const idByNode = new Map<HTMLElement, string>();
    items.forEach((item) => {
      const node = articleRefs.current.get(item.id);
      if (node) idByNode.set(node, item.id);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = idByNode.get(entry.target as HTMLElement);
          if (!id) return;
          const existing = timers.get(id);
          if (existing !== undefined) {
            window.clearTimeout(existing);
            timers.delete(id);
          }
          if (entry.isIntersecting) {
            timers.set(
              id,
              window.setTimeout(() => {
                timers.delete(id);
                onItemVisibleRef.current?.(id);
              }, 1000),
            );
          }
        });
      },
      { threshold: 0.5 },
    );
    idByNode.forEach((_, node) => observer.observe(node));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [items]);

  const handleShowNew = () => {
    pendingFocusNewRef.current = true;
    onShowNew?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'PageDown' || event.key === 'PageUp') {
      const articleEl = (event.target as HTMLElement).closest<HTMLElement>('[data-ds="Card"]');
      if (!articleEl) return;
      const ids = items.map((item) => item.id);
      const currentIndex = ids.findIndex((id) => articleRefs.current.get(id) === articleEl);
      if (currentIndex === -1) return;
      event.preventDefault();
      const targetId = ids[currentIndex + (event.key === 'PageDown' ? 1 : -1)];
      if (targetId) articleRefs.current.get(targetId)?.focus();
    } else if (event.key === 'End' && event.ctrlKey) {
      event.preventDefault();
      if (hasMore) {
        onLoadMoreRef.current?.();
      } else if (rootRef.current) {
        focusAfter(rootRef.current);
      }
    } else if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      if (newItemsCount) {
        newItemsButtonRef.current?.focus();
      } else if (rootRef.current) {
        focusBefore(rootRef.current);
      }
    }
  };

  const classes = ['ds-feed', className ?? null].filter(Boolean).join(' ');
  const { rootStyle, articleOverrides, timestampOverrides, endMessageOverrides, newItemsButtonOverrides } = overrides
    ? overridesToStyle(overrides)
    : {
        rootStyle: undefined,
        articleOverrides: undefined,
        timestampOverrides: undefined,
        endMessageOverrides: undefined,
        newItemsButtonOverrides: undefined,
      };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const total = items.length;
  const setSize = hasMore ? -1 : total;

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Feed"
      data-part="container"
      className={classes}
      style={mergedStyle}
      role="feed"
      aria-label={label}
      aria-busy={loading ? 'true' : undefined}
      onKeyDown={handleKeyDown}
    >
      {newItemsCount ? (
        <div className="ds-feed__new-items" data-part="newItemsButton" role="status" aria-live="polite">
          <Button
            ref={newItemsButtonRef}
            variant="secondary"
            size="sm"
            label={COPY.showNew.replace('{count}', String(newItemsCount))}
            overrides={newItemsButtonOverrides}
            onClick={handleShowNew}
          />
        </div>
      ) : null}
      {total === 0 && !loading ? (
        <Text tone="muted" className="ds-feed__empty" data-part="emptyState">
          {COPY.empty}
        </Text>
      ) : (
        items.map((item, index) => {
          const itemBaseId = `${baseId}-${item.id}`;
          const timestampId = `${itemBaseId}-time`;

          return (
            <Card
              key={item.id}
              ref={(node) => {
                if (node) articleRefs.current.set(item.id, node);
                else articleRefs.current.delete(item.id);
              }}
              data-unread={item.unread || undefined}
              heading={item.heading}
              headingLevel={headingLevel}
              footer={item.actions !== undefined ? <div data-part="articleActions">{item.actions}</div> : undefined}
              overrides={articleOverrides}
              tabIndex={-1}
              aria-describedby={timestampId}
              aria-posinset={index + 1}
              aria-setsize={setSize}
            >
              <div className="ds-feed__article-body" data-part="articleBody">
                {item.unread ? <span className="ds-feed__visually-hidden">{COPY.unread}</span> : null}
                <time
                  className="ds-feed__timestamp"
                  id={timestampId}
                  dateTime={item.timestamp}
                  title={formatAbsoluteTime(item.timestamp)}
                >
                  <Text element="span" tone="muted" size="xs" overrides={timestampOverrides}>
                    {formatRelativeTime(item.timestamp)}
                  </Text>
                </time>
                {setSize !== -1 ? (
                  <span className="ds-feed__visually-hidden">
                    {COPY.position.replace('{index}', String(index + 1)).replace('{total}', String(total))}
                  </span>
                ) : null}
                {item.content}
              </div>
            </Card>
          );
        })
      )}
      {loading ? (
        <div className="ds-feed__loading" data-part="loadingIndicator">
          <ProgressBar label={COPY.loading} hideLabel />
        </div>
      ) : total > 0 && !hasMore ? (
        <div className="ds-feed__end-message" data-part="endMessage" role="status" aria-live="polite">
          <Text tone="muted" size="sm" overrides={endMessageOverrides}>
            {endMessage ?? COPY.end}
          </Text>
        </div>
      ) : null}
    </div>
  );
};
