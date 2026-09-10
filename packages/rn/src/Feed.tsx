import * as React from 'react';
import { Animated, FlatList, View } from 'react-native';
import type { LayoutChangeEvent, ListRenderItemInfo, ViewStyle, ViewToken } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Card } from './Card';
import type { CardOverridableBinding, CardHeadingLevel } from './Card';
import { Text } from './Text';
import type { TextOverridableBinding } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

/** Heading level for each article's `Heading`. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type FeedHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

export interface FeedItem {
  id: string;
  /** Names the article, with the actor first ("Ana commented on Invoice 42"). Rendered as a Heading inside the article's Card. */
  heading: string;
  /** ISO timestamp, rendered relative ("3 min ago"). */
  timestamp: string;
  /** The article's body. Keep it to a few lines with a Link to the full thing. */
  content: React.ReactNode;
  /** At most two Buttons, primary first. */
  actions?: React.ReactNode;
  /** Marks an item the user has not seen: a start-edge bar plus a hidden "unread" word. */
  unread?: boolean;
}

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'unreadBorderWidth'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'loadingInset'
  | 'endMessageSize'
  | 'fontFamily';

export interface FeedProps {
  /** What the feed contains ("Activity", "Notifications"). Its accessible name. */
  label: string;
  /** Articles, newest first. The feed renders them in the order given; it never re-sorts. */
  items: FeedItem[];
  /** More items exist beyond the last; the feed asks for them with `onEndReached` as the end approaches. */
  hasMore?: boolean;
  /** More items are being fetched; a loading indicator is shown after the last article and the feed is marked busy. */
  loading?: boolean;
  /** Number of newer items available above. Shows a "Show {count} new" button at the top; the feed never inserts them itself. */
  newItemsCount?: number;
  /** Heading level for article headings, matching the page outline. Native has no heading levels; this controls only the default typography. */
  headingLevel?: FeedHeadingLevel;
  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
  endMessage?: string;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FeedOverridableBinding, TokenRef>>;
  /** Fired when the last rendered article is within one screen of view and `hasMore` is set. */
  onEndReached?: () => void;
  /** Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`. */
  onShowNew?: () => void;
  /** Fired with an item id once it has been substantially visible for a moment (mark as read). */
  onViewableItemsChanged?: (itemId: string) => void;
}

const COPY = {
  showNew: (count: number): string => `Show ${count} new`,
  loading: 'Loading more',
  end: 'You are all caught up.',
  unread: 'unread',
  position: (index: number, total: number): string => `${index} of ${total}`,
  empty: 'Nothing here yet.',
};

/** A View clipped to a point but still exposed to assistive technology, for text that has no visible slot. */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50, minimumViewTime: 1000 };

/** Renders "3 min ago" style relative time. Falls back to the raw string when `timestamp` does not parse. */
function formatRelativeTime(timestamp: string, now: number): string {
  const then = new Date(timestamp).getTime();
  if (!Number.isFinite(then)) {
    return timestamp;
  }
  const diffSeconds = Math.round(Math.abs(now - then) / 1000);
  if (diffSeconds < 60) {
    return 'just now';
  }
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
}

/**
 * A stand-in for the not-yet-generated React Native `ProgressBar`: an indeterminate
 * track with a sliding fill, frozen under reduced motion. Replace with `ProgressBar`
 * once it exists on this platform — see the component's gap notes.
 */
function FeedLoadingIndicator({ label, tokens: t }: { label: string; tokens: Tokens }): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = React.useState(0);
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (reducedMotion) {
      progress.setValue(0.5);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: t.motionDurationLoop,
        easing: toEasing(t.motionEasingStandard),
        // Layout properties cannot use the native driver.
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, progress, t.motionDurationLoop, t.motionEasingStandard]);

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  const fillWidth = trackWidth * 0.4;
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-fillWidth, trackWidth] });

  const trackStyle: ViewStyle = {
    height: t.space2,
    borderRadius: t.radiusFull,
    backgroundColor: t.colorBackgroundStrong,
    overflow: 'hidden',
  };

  return (
    <View
      testID="Feed.loadingIndicator"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{ gap: t.space2 }}
    >
      <View style={trackStyle} onLayout={handleLayout}>
        <Animated.View
          style={{
            width: fillWidth,
            height: t.space2,
            borderRadius: t.radiusFull,
            backgroundColor: t.colorForegroundMuted,
            transform: [{ translateX }],
          }}
        />
      </View>
    </View>
  );
}

/**
 * Feed — a list that never quite ends: it grows as the reader nears the bottom, and
 * newer items arrive at the top without moving what is on screen.
 *
 * When to use: Use a Feed for a stream of similar, time-ordered items whose total is
 * unknown or large — activity, notifications, comments, audit events. Use
 * `newItemsCount` with `onShowNew` for live streams rather than inserting items while
 * the reader is looking, and `onViewableItemsChanged` to mark things read.
 *
 * Renders a `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={label}`,
 * `accessibilityState={{ busy: loading }}`) of articles, each a `Card` wrapped in a
 * plain `View` that carries the start-edge unread bar and a visually-hidden
 * "unread"/position hint — the wrapper is not itself `accessible` so a Card's
 * composed action `Button`s and any `Link` in `content` stay individually
 * focusable, unlike the single-node grouping the web `role="article"` achieves.
 * `onEndReached` fires `hasMore`'s load request (guarded against firing while
 * already `loading`); `maintainVisibleContentPosition` keeps the reader's place
 * when `onShowNew`'s caller prepends items. The footer is an indeterminate loading
 * indicator (see `FeedLoadingIndicator`) or the end message, from `ListFooterComponent`.
 * `newItemsCount > 0` renders a `secondary`/`sm` `Button` above the list rather than
 * inside it, so it never scrolls away.
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
  onEndReached,
  onShowNew,
  onViewableItemsChanged,
}: FeedProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const unreadBorderWidth = overrides?.unreadBorderWidth
    ? (resolveToken(t, overrides.unreadBorderWidth) as number)
    : t.borderWidthFocus;
  const newItemsOffset = overrides?.newItemsOffset ? (resolveToken(t, overrides.newItemsOffset) as number) : t.space3;
  const loadingInset = overrides?.loadingInset ? (resolveToken(t, overrides.loadingInset) as number) : t.layoutInsetMd;

  const cardOverrides: Partial<Record<CardOverridableBinding, TokenRef>> | undefined = overrides?.articleInset
    ? { paddingBlock: overrides.articleInset, paddingInline: overrides.articleInset }
    : undefined;

  const timestampTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> | undefined =
    overrides?.timestampSize || overrides?.fontFamily
      ? {
          ...(overrides?.timestampSize ? { fontSize: overrides.timestampSize } : {}),
          ...(overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : {}),
        }
      : undefined;

  const endMessageTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> | undefined =
    overrides?.endMessageSize || overrides?.fontFamily
      ? {
          ...(overrides?.endMessageSize ? { fontSize: overrides.endMessageSize } : {}),
          ...(overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : {}),
        }
      : undefined;

  const newItemsButtonOverrides = overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : undefined;

  const showNewItemsButton = newItemsCount !== undefined && newItemsCount > 0;

  const handleEndReached = (): void => {
    if (hasMore && !loading) {
      onEndReached?.();
    }
  };

  const latestOnViewable = React.useRef(onViewableItemsChanged);
  React.useEffect(() => {
    latestOnViewable.current = onViewableItemsChanged;
  }, [onViewableItemsChanged]);

  // A stable identity, since FlatList warns when `onViewableItemsChanged` changes
  // across renders; fresh state is read through the ref instead.
  const handleViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: ViewToken[] }): void => {
    for (const entry of viewableItems) {
      if (entry.isViewable && entry.item) {
        latestOnViewable.current?.((entry.item as FeedItem).id);
      }
    }
  }).current;

  const renderItem = React.useCallback(
    ({ item, index }: ListRenderItemInfo<FeedItem>): React.JSX.Element => {
      const now = Date.now();
      const relative = formatRelativeTime(item.timestamp, now);

      const wrapperStyle: ViewStyle = item.unread
        ? { borderStartWidth: unreadBorderWidth, borderStartColor: t.colorControlSelectedBackground }
        : {};

      return (
        <View testID="Feed.article" style={wrapperStyle}>
          {item.unread ? (
            <View style={HIDDEN_STYLE}>
              <Text size="xs">{COPY.unread}</Text>
            </View>
          ) : null}
          {!hasMore ? (
            <View style={HIDDEN_STYLE}>
              <Text size="xs">{COPY.position(index + 1, items.length)}</Text>
            </View>
          ) : null}
          <Card heading={item.heading} headingLevel={headingLevel as CardHeadingLevel} footer={item.actions} overrides={cardOverrides}>
            <View style={{ gap: t.layoutGapTight }}>
              <Text size="xs" tone="muted" overrides={timestampTextOverrides}>
                {relative}
              </Text>
              {item.content}
            </View>
          </Card>
        </View>
      );
    },
    [cardOverrides, hasMore, headingLevel, items.length, t.colorControlSelectedBackground, t.layoutGapTight, timestampTextOverrides, unreadBorderWidth],
  );

  const footer = loading ? (
    <View style={{ paddingHorizontal: loadingInset, paddingVertical: loadingInset }}>
      <FeedLoadingIndicator label={COPY.loading} tokens={t} />
    </View>
  ) : !hasMore ? (
    <View testID="Feed.endMessage" style={{ paddingHorizontal: loadingInset, paddingVertical: loadingInset }}>
      <Text size="sm" tone="muted" overrides={endMessageTextOverrides}>
        {endMessage ?? COPY.end}
      </Text>
    </View>
  ) : null;

  const empty = (
    <View testID="Feed.emptyState" style={{ padding: t.layoutInsetMd }}>
      <Text tone="muted">{COPY.empty}</Text>
    </View>
  );

  return (
    <View testID="Feed.container">
      {showNewItemsButton ? (
        <View testID="Feed.newItemsButton" style={{ alignSelf: 'flex-start', paddingTop: newItemsOffset }}>
          <Button label={COPY.showNew(newItemsCount as number)} variant="secondary" size="sm" overrides={newItemsButtonOverrides} onPress={onShowNew} />
        </View>
      ) : null}
      <FlatList
        testID="Feed"
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
