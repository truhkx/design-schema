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

/** The style bindings a caller may replace with a different token. Locked: unreadBorder, unreadBorderWidth, timestampColor, endMessageColor, focusRing, focusRingWidth. */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'fontFamily';

export interface FeedProps {
  /** What the feed contains ("Activity", "Notifications"). The list's accessible name. */
  label: string;
  /**
   * Articles, newest first. `heading` names the article (the Card's heading); `timestamp`
   * is ISO and rendered relative ("3 min ago", or the absolute date after seven days);
   * `unread` marks items the user has not seen.
   */
  items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `onEndReached` as the end approaches, and once on mount when `items` is empty and not `loading`. */
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
  /** Load more (`onLoadMore`): the last article is within one screen of view with `hasMore`, or an empty feed mounted with `hasMore` and not `loading`. */
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

/** Relative time from the copy strings; the absolute date in the user's locale from seven days on. The raw string when it does not parse. */
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
 * is known (`hasMore` false), the "{index} of {total}" position sit before each Card.
 * `onEndReached` fires with threshold one screen; `maintainVisibleContentPosition` keeps
 * the reader's place when the caller prepends after `onShowNew`. There is no hardware
 * keyboard feed model on native (no Page or Ctrl keys); screen readers browse with their
 * own gestures. The absolute time is not exposed on native.
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

  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const newItemsOffset = overrides?.newItemsOffset ? (resolveToken(t, overrides.newItemsOffset) as number) : t.space3;
  const loadingInset = overrides?.loadingInset ? (resolveToken(t, overrides.loadingInset) as number) : t.layoutInsetMd;
  const endMessageInset = overrides?.endMessageInset
    ? (resolveToken(t, overrides.endMessageInset) as number)
    : t.layoutInsetMd;

  const articleInset = overrides?.articleInset;
  const timestampSize = overrides?.timestampSize;
  const endMessageSize = overrides?.endMessageSize;
  const fontFamily = overrides?.fontFamily;

  const cardOverrides = React.useMemo<Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined>(
    () => (articleInset ? { paddingBlock: articleInset, paddingInline: articleInset } : undefined),
    [articleInset],
  );
  const timestampOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontSize: timestampSize, fontFamily }),
    [timestampSize, fontFamily],
  );
  const endMessageOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontSize: endMessageSize, fontFamily }),
    [endMessageSize, fontFamily],
  );
  const textOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontFamily }),
    [fontFamily],
  );
  const buttonOverrides = React.useMemo<Partial<Record<ButtonOverridableBinding, TokenRef | undefined>>>(
    () => ({ fontFamily }),
    [fontFamily],
  );

  // An empty FlatList has no last article to observe, so an empty feed asks for its
  // first page once, on mount.
  React.useEffect(() => {
    if (items.length === 0 && hasMore && !loading) {
      onEndReached?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEndReached = (): void => {
    // The empty case is the mount request above; the list asks only once it has articles.
    if (hasMore && !loading && items.length > 0) {
      onEndReached?.();
    }
  };

  // FlatList rejects a changing `onViewableItemsChanged`; the latest handler is read through a ref.
  const onVisibleRef = React.useRef(onViewableItemsChanged);
  React.useEffect(() => {
    onVisibleRef.current = onViewableItemsChanged;
  }, [onViewableItemsChanged]);
  const handleViewableItemsChanged = React.useRef(({ changed }: { changed: ListViewToken[] }): void => {
    for (const entry of changed) {
      if (entry.isViewable && entry.item != null) {
        onVisibleRef.current?.((entry.item as FeedItem).id);
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
            <Stack gap="tight">
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
    [cardOverrides, headingLevel, textOverrides, timestampOverrides, total, unreadColor, unreadWidth],
  );

  const footer = loading ? (
    <View testID="Feed.loadingIndicator" style={{ padding: loadingInset }}>
      <ProgressBar label={COPY.loading} hideLabel />
    </View>
  ) : !hasMore && items.length > 0 ? (
    <View testID="Feed.endMessage" style={{ padding: endMessageInset }}>
      <Text size="sm" tone="muted" overrides={endMessageOverrides}>
        {endMessage ?? COPY.end}
      </Text>
    </View>
  ) : undefined;

  // While loading with no items the loading indicator shows, not copy.empty.
  const empty = loading ? undefined : (
    <View testID="Feed.emptyState">
      <Text tone="muted" overrides={textOverrides}>
        {COPY.empty}
      </Text>
    </View>
  );

  const showNewItems = newItemsCount !== undefined && newItemsCount > 0;

  return (
    <View ref={ref} testID="Feed">
      {showNewItems ? (
        <View testID="Feed.newItemsButton" style={{ alignSelf: 'flex-start', paddingTop: newItemsOffset }}>
          <Button
            label={COPY.showNew(Math.trunc(newItemsCount))}
            variant="secondary"
            size="sm"
            overrides={buttonOverrides}
            onPress={onShowNew}
          />
        </View>
      ) : null}
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
        ListEmptyComponent={empty}
      />
    </View>
  );
}
