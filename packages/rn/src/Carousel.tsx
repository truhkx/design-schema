import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Platform, Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ListRenderItemInfo, ListViewToken, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'radius'
  | 'transition';

export interface CarouselSlideProps {
  /**
   * The slide's name: its tab in a `tabs` picker and part of its accessible name
   * ("{n} of {total}, {label}"). A plain string, not read from the content; the
   * slide repeats it visibly in its own heading.
   */
  label: string;
  /** The slide's content. Slides should be equal height. */
  children: React.ReactNode;
}

/** One slide. Rendered by `Carousel`, never on its own. */
export function CarouselSlide({ children }: CarouselSlideProps): React.JSX.Element {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export interface CarouselProps {
  /** What the carousel shows ("Featured products", "Customer stories"). Names the region. */
  label: string;
  /** One `CarouselSlide` per slide. A Card is the usual shape. Slides should be equal height. */
  children: React.ReactNode;
  /** How many slides are visible at once at the widest layout; one below the prose width. Whole numbers. */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /** Rotate automatically every `interval`. Never starts under reduced motion; pauses while touched or focused; stops on the pause button until play. */
  autoplay?: boolean | undefined;
  /** Milliseconds between automatic advances; values below 5000 are raised to 5000 (with a development warning). */
  interval?: number | undefined;
  /** How slides are chosen directly: dots, tabs with each slide's label, or none (arrows only). */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping snaps to slide boundaries. `false` lets the track scroll freely. */
  snap?: boolean | undefined;
  /** Fired when the current slide changes, with the new index and the reason. */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  /** The region View. */
  ref?: React.Ref<ViewInstance> | undefined;
}

interface CollectedSlide {
  key: string;
  label: string;
  content: React.ReactNode;
}

function collectSlides(children: React.ReactNode): CollectedSlide[] {
  const slides: CollectedSlide[] = [];
  React.Children.forEach(children, (child, index) => {
    if (React.isValidElement(child) && child.type === CarouselSlide) {
      const props = child.props as CarouselSlideProps;
      slides.push({ key: child.key ?? String(index), label: props.label, content: props.children });
    }
  });
  return slides;
}

const COPY = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic rotation',
  pause: 'Stop automatic rotation',
  slideLabel: (n: number, total: number): string => `${n} of ${total}`,
  goTo: (n: number): string => `Go to slide ${n}`,
  announce: (n: number, total: number): string => `Slide ${n} of ${total}`,
} as const;

/** constant `minInterval`: the floor `interval` is raised to, so autoplay never advances faster than a slide can be read. */
const MIN_INTERVAL = 5000; // literal-ok: schema constant minInterval (ms), no token exists

/** `default` of the `interval` prop. */
const DEFAULT_INTERVAL = 6000; // literal-ok: schema default for the interval prop (ms)

/** `itemVisiblePercentThreshold` from the platform notes. */
const VISIBLE_THRESHOLD = 60; // literal-ok: viewability percentage, not a size

const REGION_ACTIONS = [
  { name: 'increment', label: COPY.next },
  { name: 'decrement', label: COPY.previous },
] as const;

/**
 * Carousel — shows several things in the space of one and lets the user page through them.
 *
 * When to use: a small set (three to eight) of peer items too rich for a grid — featured
 * products, testimonials, a gallery. `picker="tabs"` when slides have meaningful names,
 * `dots` for images. Leave `autoplay` off unless the content is ambient, and keep the pause
 * control visible. Do not hide important content behind slide two.
 *
 * The region `View` has `accessibilityRole="adjustable"` with increment/decrement actions
 * mapped to next/previous (the swipe alternative) and is not `accessible`, so the controls
 * inside stay reachable. In tree order: the play/pause `Button` (only when `autoplay` and
 * motion is allowed), the viewport with the previous/next `secondary` icon-only `Button`s
 * overlaid inside their `controlSurface` wrappers, a horizontal `FlatList` track
 * (`pagingEnabled` at one per view, `snapToInterval` above), and the picker of Carousel's own
 * `Pressable`s. Slides outside the current page are hidden from assistive technology.
 * Previous/Next move one page of `perView` slides, disabled at the ends unless `loop`.
 * User-initiated changes are announced; autoplay changes are not.
 */
export function Carousel({
  label,
  children,
  perView = 1,
  loop = false,
  autoplay = false,
  interval = DEFAULT_INTERVAL,
  picker = 'dots',
  activeIndex,
  snap = true,
  onChange,
  overrides,
  ref,
}: CarouselProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const slides = React.useMemo(() => collectSlides(children), [children]);
  const total = slides.length;

  React.useEffect(() => {
    if (__DEV__) {
      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child) || child.type !== CarouselSlide) {
          console.warn('Carousel: children must be CarouselSlide elements.');
        }
      });
    }
  }, [children]);

  React.useEffect(() => {
    if (__DEV__ && autoplay && interval < MIN_INTERVAL) {
      console.warn(`Carousel: interval ${interval}ms is below the ${MIN_INTERVAL}ms minimum and was raised to it.`);
    }
  }, [autoplay, interval]);
  const effectiveInterval = Math.max(interval, MIN_INTERVAL);

  const slideGap = overrides?.slideGap ? (resolveToken(t, overrides.slideGap) as number) : t.layoutGapNormal;
  const controlOffset = overrides?.controlOffset ? (resolveToken(t, overrides.controlOffset) as number) : t.space2;
  const controlShadow = overrides?.controlShadow ? (resolveToken(t, overrides.controlShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const pickerGap = overrides?.pickerGap ? (resolveToken(t, overrides.pickerGap) as number) : t.layoutGapTight;
  const pickerOffset = overrides?.pickerOffset ? (resolveToken(t, overrides.pickerOffset) as number) : t.space3;
  const dotSize = overrides?.dotSize ? (resolveToken(t, overrides.dotSize) as number) : t.space2;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const transition = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationBase;

  const [viewportWidth, setViewportWidth] = React.useState(0);
  const narrow = viewportWidth > 0 && viewportWidth < t.layoutMaxWidthProse;
  const pageSize = narrow ? 1 : Math.max(1, Math.round(perView));
  const itemWidth = viewportWidth > 0 ? (viewportWidth - slideGap * (pageSize - 1)) / pageSize : 0;
  const maxStart = Math.max(0, total - pageSize);

  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = React.useState(0);
  const currentIndex = Math.min(Math.max(0, Math.round(isControlled ? activeIndex : internalIndex)), maxStart);

  /** The start index Next/Previous would move to, or `null` at an end without `loop`. */
  const stepTarget = (from: number, direction: 1 | -1): number | null => {
    if (total === 0) {
      return null;
    }
    if (direction === 1) {
      if (from + pageSize <= maxStart) {
        return from + pageSize;
      }
      if (from < maxStart) {
        return maxStart;
      }
      return loop && maxStart > 0 ? 0 : null;
    }
    if (from - pageSize >= 0) {
      return from - pageSize;
    }
    if (from > 0) {
      return 0;
    }
    return loop && maxStart > 0 ? maxStart : null;
  };

  const [announcement, setAnnouncement] = React.useState('');

  const goTo = (index: number, reason: CarouselChangeReason): void => {
    const target = Math.min(Math.max(0, index), maxStart);
    if (target === currentIndex) {
      return;
    }
    if (!isControlled) {
      setInternalIndex(target);
    }
    onChange?.(target, reason);
    if (reason !== 'autoplay') {
      const message = COPY.announce(target + 1, total);
      setAnnouncement(message);
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(message);
      }
    }
  };

  // Stable callbacks (the interval and FlatList's onViewableItemsChanged) read fresh state here.
  const latest = React.useRef({ currentIndex, goTo, stepTarget });
  latest.current = { currentIndex, goTo, stepTarget };

  const trackRef = React.useRef<FlatList<CollectedSlide>>(null);
  React.useEffect(() => {
    if (itemWidth > 0) {
      trackRef.current?.scrollToOffset({ offset: currentIndex * (itemWidth + slideGap), animated: !reducedMotion });
    }
  }, [currentIndex, itemWidth, slideGap, reducedMotion]);

  // Autoplay: `playing` is the user's intent (the pause button stops it until play);
  // touch and focus pause it only while they last.
  const canRotate = autoplay && !reducedMotion;
  const [playing, setPlaying] = React.useState(autoplay);
  const [touching, setTouching] = React.useState(false);
  const [focusCount, setFocusCount] = React.useState(0);
  const rotating = canRotate && playing && !touching && focusCount === 0 && total > 1;

  React.useEffect(() => {
    if (!rotating) {
      return undefined;
    }
    const id = setInterval(() => {
      const { currentIndex: from, goTo: go, stepTarget: step } = latest.current;
      const next = step(from, 1);
      if (next === null) {
        // Without loop, autoplay stops at the last slide.
        setPlaying(false);
        return;
      }
      go(next, 'autoplay');
    }, effectiveInterval);
    return () => clearInterval(id);
  }, [rotating, effectiveInterval]);

  const onControlFocus = (): void => setFocusCount((n) => n + 1);
  const onControlBlur = (): void => setFocusCount((n) => Math.max(0, n - 1));

  // Swipe: viewability only reports a change while the user is dragging the track.
  const dragging = React.useRef(false);
  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: VISIBLE_THRESHOLD }).current;
  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: ListViewToken[] }): void => {
    if (!dragging.current) {
      return;
    }
    const first = viewableItems.find((entry) => entry.isViewable && entry.index != null);
    if (first?.index != null) {
      latest.current.goTo(first.index, 'swipe');
    }
  }).current;

  const handleViewportLayout = (event: LayoutChangeEvent): void => {
    setViewportWidth(event.nativeEvent.layout.width);
  };

  const prevTarget = stepTarget(currentIndex, -1);
  const nextTarget = stepTarget(currentIndex, 1);

  const handleRegionAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment' && nextTarget !== null) {
      goTo(nextTarget, 'next');
    } else if (event.nativeEvent.actionName === 'decrement' && prevTarget !== null) {
      goTo(prevTarget, 'prev');
    }
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<CollectedSlide>): React.JSX.Element => {
    const visible = index >= currentIndex && index < currentIndex + pageSize;
    return (
      <View
        testID="Carousel.slide"
        accessible
        accessibilityLabel={`${COPY.slideLabel(index + 1, total)}, ${item.label}`}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={itemWidth > 0 ? { width: itemWidth } : undefined}
      >
        {item.content}
      </View>
    );
  };

  const viewportStyle: ViewStyle = { position: 'relative', borderRadius: radius, overflow: 'hidden' };
  const controlsStyle: ViewStyle = {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: controlOffset,
    zIndex: 1,
  };
  const controlSurfaceStyle: ViewStyle = { borderRadius: t.radiusFull, backgroundColor: t.colorOverlaySurface, ...controlShadow };
  const pickerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: pickerGap,
    paddingTop: pickerOffset,
  };
  const iconColor = t.colorActionSecondaryForeground;

  return (
    <View
      ref={ref}
      testID="Carousel"
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={total > 0 ? { text: COPY.slideLabel(currentIndex + 1, total) } : undefined}
      accessibilityActions={REGION_ACTIONS}
      onAccessibilityAction={handleRegionAccessibilityAction}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
    >
      {canRotate ? (
        <View testID="Carousel.playButton" style={{ alignSelf: 'flex-start', paddingBottom: t.layoutGapTight }}>
          <Button
            label={playing ? COPY.pause : COPY.play}
            variant="secondary"
            onPress={() => setPlaying((value) => !value)}
            onFocus={onControlFocus}
            onBlur={onControlBlur}
          />
        </View>
      ) : null}
      <View testID="Carousel.viewport" onLayout={handleViewportLayout} style={viewportStyle}>
        <View style={controlsStyle} pointerEvents="box-none">
          <View testID="Carousel.controlSurface" style={controlSurfaceStyle}>
            <View testID="Carousel.prevButton">
              <Button
                label={COPY.previous}
                variant="secondary"
                iconOnly
                disabled={prevTarget === null}
                leadingIcon={<Icon name="chevron-left" color={iconColor} />}
                onPress={() => {
                  if (prevTarget !== null) {
                    goTo(prevTarget, 'prev');
                  }
                }}
                onFocus={onControlFocus}
                onBlur={onControlBlur}
              />
            </View>
          </View>
          <View testID="Carousel.controlSurface" style={controlSurfaceStyle}>
            <View testID="Carousel.nextButton">
              <Button
                label={COPY.next}
                variant="secondary"
                iconOnly
                disabled={nextTarget === null}
                leadingIcon={<Icon name="chevron-right" color={iconColor} />}
                onPress={() => {
                  if (nextTarget !== null) {
                    goTo(nextTarget, 'next');
                  }
                }}
                onFocus={onControlFocus}
                onBlur={onControlBlur}
              />
            </View>
          </View>
        </View>
        <FlatList
          ref={trackRef}
          testID="Carousel.track"
          data={slides}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          extraData={`${currentIndex}:${pageSize}:${itemWidth}`}
          horizontal
          pagingEnabled={snap && pageSize === 1}
          snapToInterval={snap && pageSize > 1 && itemWidth > 0 ? itemWidth + slideGap : undefined}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={() => {
            dragging.current = true;
          }}
          onMomentumScrollEnd={() => {
            dragging.current = false;
          }}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          ItemSeparatorComponent={() => <View style={{ width: slideGap }} />}
        />
      </View>
      {picker !== 'none' && total > 0 ? (
        <View testID="Carousel.picker" accessibilityRole={picker === 'tabs' ? 'tablist' : undefined} style={pickerStyle}>
          {slides.map((slide, index) => (
            <CarouselPickerItem
              key={slide.key}
              kind={picker}
              label={picker === 'tabs' ? slide.label : COPY.goTo(index + 1)}
              selected={index >= currentIndex && index < currentIndex + pageSize}
              dotSize={dotSize}
              transition={reducedMotion ? 0 : transition}
              onSelect={() => goTo(index, 'picker')}
              onFocus={onControlFocus}
              onBlur={onControlBlur}
            />
          ))}
        </View>
      ) : null}
      <View
        testID="Carousel.liveRegion"
        accessibilityLiveRegion={rotating ? 'none' : 'polite'}
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}
      >
        <RNText>{announcement}</RNText>
      </View>
    </View>
  );
}

interface CarouselPickerItemProps {
  kind: 'dots' | 'tabs';
  label: string;
  selected: boolean;
  dotSize: number;
  transition: number;
  onSelect: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

/** One dot or tab: Carousel's own Pressable, since no Button variant carries the dot and tab tokens. */
function CarouselPickerItem({ kind, label, selected, dotSize, transition, onSelect, onFocus, onBlur }: CarouselPickerItemProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const isTabs = kind === 'tabs';

  const progress = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
  const wasSelected = React.useRef(selected);
  React.useEffect(() => {
    if (wasSelected.current === selected) {
      return undefined;
    }
    wasSelected.current = selected;
    const animation = Animated.timing(progress, {
      toValue: selected ? 1 : 0,
      duration: transition,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, transition, progress, t.motionEasingStandard]);

  const target = isTabs ? t.sizeTargetComfortable : t.sizeTargetMin;
  const hitStyle: ViewStyle = {
    minWidth: target,
    minHeight: target,
    paddingHorizontal: isTabs ? t.spaceSm : 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radiusMd,
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
  };
  const dotStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: dotSize,
    height: dotSize,
    borderRadius: t.radiusFull,
    backgroundColor: progress.interpolate({ inputRange: [0, 1], outputRange: [t.colorBorderStrong, t.colorControlSelectedBackground] }),
  };

  return (
    <Pressable
      testID="Carousel.pickerItem"
      accessibilityRole={isTabs ? 'tab' : 'button'}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onFocus={() => {
        setFocused(true);
        onFocus();
      }}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
      onPress={onSelect}
      style={hitStyle}
    >
      {isTabs ? (
        <Text size="sm" weight={selected ? 'semibold' : 'regular'} tone={selected ? 'strong' : 'muted'}>
          {label}
        </Text>
      ) : (
        <Animated.View style={dotStyle} accessibilityElementsHidden importantForAccessibility="no" />
      )}
    </Pressable>
  );
}
