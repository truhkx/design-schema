import * as React from 'react';
import { FlatList, View } from 'react-native';
import type { ListRenderItemInfo, ListViewToken, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import type { ButtonOverridableBinding } from './Button';
import { Card } from './Card';
import type { CardOverridableBinding } from './Card';
import { ProgressBar } from './ProgressBar';
import { Stack } from './Stack';
import type { StackOverridableBinding } from './Stack';
import { Text } from './Text';
import type { TextOverridableBinding } from './Text';
import { useTheme } from './theme';

/** Heading level for each article's heading. The schema declares the values as strings; numbers are accepted too. */
export type FeedHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

export type FeedItem = {
  id: string;
  heading: string;
  timestamp: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  unread?: boolean;
};

/**
 * The style bindings a caller may replace with a different token. Locked: unreadBorder,
 * unreadBorderWidth, timestampColor, endMessageColor, emptyStateColor, focusRing, focusRingWidth.
 */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'articleBodyGap'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'newItemsLayer'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'emptyStateInset'
  | 'emptyStateSize'
  | 'fontFamily';

export interface FeedProps {
  /** What the feed contains ("Activity", "Notifications"). The list's accessible name; an empty or whitespace-only label warns once per mount in development. */
  label: string;
  /**
   * Articles, newest first. `heading` names the article (the Card's heading); `timestamp`
   * is ISO and rendered relative from the copy strings ("3 min ago", the absolute date from
   * seven days on), computed at render and not ticking; `unread` marks items the user has
   * not seen. String or number `content` is wrapped in the package `Text`; other content
   * renders as given. The absolute time is not exposed on native.
   */
  items: FeedItem[];
  /**
   * More items exist beyond the last; the feed asks for them with `onEndReached` as the end
   * approaches, and whenever `items` is empty and not `loading` — on mount and again if the
   * caller clears `items` — so an empty feed fetches its first page itself. While the last
   * article stays in view it asks at most once per change of the last item's id, `hasMore` or
   * `loading`, and never while `loading`; a prepend from `onShowNew` leaves the last id
   * unchanged, so it does not ask again.
   */
  hasMore?: boolean | undefined;
  /** More items are being fetched; a loading indicator is shown after the last article and the list is marked busy. */
  loading?: boolean | undefined;
  /** Number of newer items available above. The feed does not insert them; it shows a "Show {count} new" button above the list. Whole numbers only. */
  newItemsCount?: number | undefined;
  /** Heading level for article headings. React Native has no heading levels: headings carry the `header` role and this controls only typography. */
  headingLevel?: FeedHeadingLevel | undefined;
  /** Shown after the last item when `hasMore` is false and `items` is not empty. Defaults to `copy.end`. */
  endMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Load more (`onLoadMore`): the last article is within one screen of view with `hasMore`, or an empty feed with `hasMore` and not `loading`. */
  onEndReached?: (() => void) | undefined;
  /** The new-items button was pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: (() => void) | undefined;
  /** Item visible (`onItemVisible`): the item has been at least half visible for a second (mark as read). */
  onViewableItemsChanged?: ((id: string) => void) | undefined;
}

const COPY = {
  showNew: (count: number): string => `Show ${count} new`,
  loading: 'Loading more',
  end: 'You are all caught up.',
  unread: 'unread',
  position: (index: number, total: number): string => `${index} of ${total}`,
  empty: 'Nothing here yet.',
  justNow: 'just now',
  minutesAgo: (n: number): string => `${n} min ago`,
  hoursAgo: (n: number): string => `${n} hr ago`,
  daysAgo: (n: number): string => `${n} d ago`,
} as const;

/** Clipped to a point but still exposed to assistive technology: text with no visible slot. */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

/** Half visible for one second, as the schema's platform notes state. */
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50, minimumViewTime: 1000 }; // literal-ok: schema-declared visibility rule, not a style value

const MINUTE = 60_000; // literal-ok: milliseconds in a minute
const HOUR = 60 * MINUTE; // literal-ok: minutes in an hour
const DAY = 24 * HOUR; // literal-ok: hours in a day
const WEEK = 7 * DAY; // literal-ok: days in a week

/**
 * Relative time from the copy strings, floored (90 seconds is "1 min ago"); a future
 * timestamp reads as `justNow`; the absolute date in the user's locale from seven days on.
 * The raw string when it does not parse.
 */
function formatTimestamp(timestamp: string, now: number): string {
  const then = new Date(timestamp).getTime();
  if (!Number.isFinite(then)) {
    return timestamp;
  }
  const elapsed = Math.max(0, now - then);
  if (elapsed < MINUTE) {
    return COPY.justNow;
  }
  if (elapsed < HOUR) {
    return COPY.minutesAgo(Math.floor(elapsed / MINUTE));
  }
  if (elapsed < DAY) {
    return COPY.hoursAgo(Math.floor(elapsed / HOUR));
  }
  if (elapsed < WEEK) {
    return COPY.daysAgo(Math.floor(elapsed / DAY));
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(then);
}

/**
 * Feed — a stream of time-ordered articles that grows as the reader nears the end, with
 * newer items offered by a button rather than inserted under the reader.
 *
 * Renders a `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={label}`, busy
 * while `loading`) of `Card`s. Cards are left un-collapsed so action Buttons and Links in
 * an article stay individually focusable; the hidden "unread" word and, when the total
 * is known (`hasMore` false), the "{index} of {total}" position sit before each Card,
 * because Card takes a heading string and a footer slot with nothing between them.
 * `onEndReached` fires with threshold one screen, at most once per change of the last item's
 * id, `hasMore` or `loading`, so a list that keeps reporting the end asks only once;
 * `maintainVisibleContentPosition` keeps the reader's place when the caller prepends after
 * `onShowNew`. The new-items row is a `View` above the list, so it never scrolls away; it is
 * always rendered as `accessibilityLiveRegion="polite"` and padded only while shown — Android
 * announces the count; on iOS VoiceOver users reach the button at the top.
 * While `loading` with no items the indicator shows, not `copy.empty`, so an empty feed
 * about to fetch stays blank rather than flashing it. There is no hardware keyboard feed
 * model on native (no Page or Ctrl keys); screen readers browse with their own gestures.
 * The absolute time is not exposed on native.
 */
export function Feed({
  label,
  items,
  hasMore = false,
  loading = false,
  newItemsCount,
  headingLevel = '3',
  endMessage,
  overrides,
  ref,
  onEndReached,
  onShowNew,
  onViewableItemsChanged,
}: FeedProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const token = <V,>(override: TokenRef | undefined, fallback: V): V =>
    override ? (resolveToken(t, override) as V) : fallback;

  const itemGap = token<number>(overrides?.itemGap, t.layoutGapNormal);
  const newItemsOffset = token<number>(overrides?.newItemsOffset, t.space3);
  const newItemsLayer = token<number>(overrides?.newItemsLayer, t.layerRaised);
  const loadingInset = token<number>(overrides?.loadingInset, t.layoutInsetMd);
  const endMessageInset = token<number>(overrides?.endMessageInset, t.layoutInsetMd);
  const emptyStateInset = token<number>(overrides?.emptyStateInset, t.layoutInsetMd);

  // Forwarded to the composed child's own `overrides` rather than resolved here.
  const articleInset = overrides?.articleInset;
  const articleBodyGap = overrides?.articleBodyGap;
  const timestampSize = overrides?.timestampSize;
  const endMessageSize = overrides?.endMessageSize;
  const emptyStateSize = overrides?.emptyStateSize;
  const fontFamily = overrides?.fontFamily;

  const cardOverrides = React.useMemo<Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined>(
    () => (articleInset ? { paddingBlock: articleInset, paddingInline: articleInset } : undefined),
    [articleInset],
  );
  const articleBodyOverrides = React.useMemo<Partial<Record<StackOverridableBinding, TokenRef | undefined>>>(
    () => ({ gap: articleBodyGap }),
    [articleBodyGap],
  );
  const timestampOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontSize: timestampSize, fontFamily }),
    [timestampSize, fontFamily],
  );
  const endMessageOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontSize: endMessageSize, fontFamily }),
    [endMessageSize, fontFamily],
  );
  const emptyStateOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontSize: emptyStateSize, fontFamily }),
    [emptyStateSize, fontFamily],
  );
  const textOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontFamily }),
    [fontFamily],
  );
  const buttonOverrides = React.useMemo<Partial<Record<ButtonOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontFamily }),
    [fontFamily],
  );

  const warnedLabel = React.useRef(false);
  React.useEffect(() => {
    if (__DEV__ && label.trim() === '' && !warnedLabel.current) {
      warnedLabel.current = true;
      console.warn('Feed: label is the accessible name of the feed and must not be empty.');
    }
  }, [label]);

  // An empty list has no last article to observe, so an empty feed asks for its first page
  // itself — on mount, and again whenever the caller clears `items`. Never while loading.
  const requestRef = React.useRef(onEndReached);
  React.useEffect(() => {
    requestRef.current = onEndReached;
  }, [onEndReached]);
  const empty = items.length === 0;
  React.useEffect(() => {
    if (empty && hasMore && !loading) {
      requestRef.current?.();
    }
  }, [empty, hasMore, loading]);

  // While the last article stays in view the list keeps reporting the end, so the request is
  // made at most once per change of the last item's id, `hasMore` or `loading`. A prepend from
  // `onShowNew` leaves the last id unchanged, so it does not ask again.
  const lastId = items.length > 0 ? items[items.length - 1]!.id : undefined;
  const asked = React.useRef(false);
  React.useEffect(() => {
    asked.current = false;
  }, [lastId, hasMore, loading]);

  const handleEndReached = (): void => {
    // The empty case is the request above; the list asks only once it has articles.
    if (hasMore && !loading && !empty && !asked.current) {
      asked.current = true;
      onEndReached?.();
    }
  };

  // FlatList rejects a changing `onViewableItemsChanged`; the latest handler is read through a ref.
  const onVisibleRef = React.useRef(onViewableItemsChanged);
  React.useEffect(() => {
    onVisibleRef.current = onViewableItemsChanged;
  }, [onViewableItemsChanged]);
  // Once per item id per mount: an item that scrolls out and back does not fire again.
  const announced = React.useRef(new Set<string>());
  const handleViewableItemsChanged = React.useRef(({ changed }: { changed: ListViewToken[] }): void => {
    for (const entry of changed) {
      if (entry.isViewable && entry.item != null) {
        const { id } = entry.item as FeedItem;
        if (!announced.current.has(id)) {
          announced.current.add(id);
          onVisibleRef.current?.(id);
        }
      }
    }
  }).current;

  const total = hasMore ? undefined : items.length;
  const unreadColor = t.colorControlSelectedBackground;
  const unreadWidth = t.borderWidthFocus;

  const renderItem = React.useCallback(
    ({ item, index }: ListRenderItemInfo<FeedItem>): React.JSX.Element => (
      <View
        testID="Feed.article"
        // The list's rows. `accessibilityRole` has no `listitem`, so the `role` prop carries it;
        // react-native-web maps both to the same ARIA role and renders an <li>. Without it the
        // articles' headings, Buttons and Links are children of role="list" that ARIA does not
        // allow, and an articleless feed has no required child at all.
        role="listitem"
        style={item.unread ? { borderStartWidth: unreadWidth, borderStartColor: unreadColor } : undefined}
      >
        {item.unread ? (
          <View style={HIDDEN_STYLE}>
            <Text overrides={textOverrides}>{COPY.unread}</Text>
          </View>
        ) : null}
        {total !== undefined ? (
          <View style={HIDDEN_STYLE}>
            <Text overrides={textOverrides}>{COPY.position(index + 1, total)}</Text>
          </View>
        ) : null}
        <Card
          heading={item.heading}
          headingLevel={headingLevel}
          inset="md"
          overrides={cardOverrides}
          footer={item.actions != null ? <View testID="Feed.articleActions">{item.actions}</View> : undefined}
        >
          <View testID="Feed.articleBody">
            <Stack gap="tight" overrides={articleBodyOverrides}>
              <View testID="Feed.timestamp">
                <Text size="xs" tone="muted" overrides={timestampOverrides}>
                  {formatTimestamp(item.timestamp, Date.now())}
                </Text>
              </View>
              {/* React Native cannot render a bare string outside Text. */}
              {typeof item.content === 'string' || typeof item.content === 'number' ? (
                <Text overrides={textOverrides}>{item.content}</Text>
              ) : (
                item.content
              )}
            </Stack>
          </View>
        </Card>
      </View>
    ),
    [
      articleBodyOverrides,
      cardOverrides,
      headingLevel,
      textOverrides,
      timestampOverrides,
      total,
      unreadColor,
      unreadWidth,
    ],
  );

  // The footer and the empty state are rendered inside the list (`ListFooterComponent` /
  // `ListEmptyComponent`), so they are rows of it: `role="listitem"` keeps the ProgressBar from
  // being a child role="list" does not allow, and gives a feed with no articles its one required
  // child.
  const footer = loading ? (
    <View testID="Feed.loadingIndicator" role="listitem" style={{ padding: loadingInset }}>
      <ProgressBar label={COPY.loading} hideLabel />
    </View>
  ) : !hasMore && !empty ? (
    <View testID="Feed.endMessage" role="listitem" style={{ padding: endMessageInset }}>
      <Text size="sm" tone="muted" overrides={endMessageOverrides}>
        {endMessage ?? COPY.end}
      </Text>
    </View>
  ) : undefined;

  // copy.empty shows only with no items, not loading and nothing more to fetch: a feed
  // about to ask for its first page stays blank rather than flashing it.
  const emptyState = !hasMore && !loading ? (
    <View testID="Feed.emptyState" role="listitem" style={{ padding: emptyStateInset }}>
      <Text size="sm" tone="muted" overrides={emptyStateOverrides}>
        {COPY.empty}
      </Text>
    </View>
  ) : undefined;

  const showNewItems = newItemsCount !== undefined && newItemsCount > 0;

  return (
    <View ref={ref} testID="Feed">
      {/*
        The row is always rendered as the live region and padded only while shown: a region
        that mounts together with its text is not reliably announced on Android. Android
        announces the count; on iOS VoiceOver users reach the button at the top of the feed.
      */}
      <View
        testID="Feed.newItemsButton"
        accessibilityLiveRegion="polite"
        style={{ alignSelf: 'flex-start', paddingTop: showNewItems ? newItemsOffset : 0, zIndex: newItemsLayer }}
      >
        {showNewItems ? (
          <Button
            label={COPY.showNew(newItemsCount)}
            variant="secondary"
            size="sm"
            overrides={buttonOverrides}
            onPress={onShowNew}
          />
        ) : null}
      </View>
      <FlatList
        testID="Feed.container"
        accessibilityRole="list"
        accessibilityLabel={label}
        accessibilityState={{ busy: loading }}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: itemGap }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={1}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListFooterComponent={footer}
        ListEmptyComponent={emptyState}
      />
    </View>
  );
}
