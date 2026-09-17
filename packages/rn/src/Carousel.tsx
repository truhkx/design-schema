import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Platform, Pressable, Text as RNText, StyleSheet, View } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ListRenderItemInfo, ListViewToken, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { toEasing, toFontWeight, useReducedMotion, useTheme } from './theme';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlRadius'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'radius'
  | 'tabFontSize'
  | 'tabFontWeight'
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'fontFamily'
  | 'transition';

export interface CarouselSlideProps {
  /**
   * The slide's name in a `tabs` picker. A plain string, not read from the content; the slide
   * repeats it visibly in its own heading. It is not part of the slide's accessible name, which
   * is its position ("2 of 4") alone.
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
  /** How many slides are visible at once while the viewport is wider than the prose width; one at or below it. Whole numbers. */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /** Rotate automatically every `interval`. Never starts under reduced motion; pauses while touched or a control has focus; stops on the pause button. */
  autoplay?: boolean | undefined;
  /** Milliseconds between automatic advances; values below 5000 are raised to 5000 (with a development warning). */
  interval?: number | undefined;
  /** How slides are chosen directly: dots, tabs with each slide's label, or none (arrows only). */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping snaps to slide boundaries. `false` lets the track scroll freely. */
  snap?: boolean | undefined;
  /** Fired when the current slide changes, with the new index and the reason. Never fired by a change of a controlled `activeIndex`. */
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
  pickerLabel: 'Choose a slide',
  goTo: (n: number): string => `Go to slide ${n}`,
  announce: (n: number, total: number): string => `Slide ${n} of ${total}`,
} as const;

/** constant `minInterval`: the floor `interval` is raised to, so autoplay never advances faster than a slide can be read. */
const MIN_INTERVAL = 5000; // literal-ok: schema constant minInterval (ms), no token exists

/** `default` of the `interval` prop. */
const DEFAULT_INTERVAL = 6000; // literal-ok: schema default for the interval prop (ms)

/** `itemVisiblePercentThreshold` from the platform notes. */
const VISIBLE_THRESHOLD = 60; // literal-ok: viewability percentage, not a size

const SLIDE_ACTIONS = [
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
 * The region is a plain `View` named by `label`, so every control stays individually reachable.
 * In tree order: the play/pause `Button` in its own row (only when `autoplay` and motion is
 * allowed), the previous/next `secondary` icon-only `Button`s overlaid on the viewport inside
 * their `controlSurface` wrappers, a horizontal `FlatList` track of slides, then the picker of
 * Carousel's own `Pressable`s. Each visible slide is an accessible element with
 * `accessibilityRole="adjustable"` and increment/decrement actions mapped to next/previous — the
 * swipe alternative VoiceOver can reach; slides outside the current page are hidden.
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
        } else if (!(child.props as CarouselSlideProps).label) {
          console.warn('Carousel: every CarouselSlide needs a label; the tab falls back to "Go to slide {n}".');
        }
      });
    }
  }, [children]);

  const warnedInterval = React.useRef(false);
  React.useEffect(() => {
    if (__DEV__ && autoplay && interval < MIN_INTERVAL && !warnedInterval.current) {
      warnedInterval.current = true;
      console.warn(`Carousel: interval ${interval}ms is below the ${MIN_INTERVAL}ms minimum and was raised to it.`);
    }
  }, [autoplay, interval]);
  const effectiveInterval = Math.max(interval, MIN_INTERVAL);

  const slideGap = overrides?.slideGap ? (resolveToken(t, overrides.slideGap) as number) : t.layoutGapNormal;
  const controlOffset = overrides?.controlOffset ? (resolveToken(t, overrides.controlOffset) as number) : t.space2;
  const controlRadius = overrides?.controlRadius ? (resolveToken(t, overrides.controlRadius) as number) : t.radiusFull;
  const controlShadow = overrides?.controlShadow ? (resolveToken(t, overrides.controlShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const pickerGap = overrides?.pickerGap ? (resolveToken(t, overrides.pickerGap) as number) : t.layoutGapTight;
  const pickerOffset = overrides?.pickerOffset ? (resolveToken(t, overrides.pickerOffset) as number) : t.space3;
  const dotSize = overrides?.dotSize ? (resolveToken(t, overrides.dotSize) as number) : t.space2;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const tabFontSize = overrides?.tabFontSize ? (resolveToken(t, overrides.tabFontSize) as number) : t.fontSizeSm;
  const tabFontWeight = overrides?.tabFontWeight ? (resolveToken(t, overrides.tabFontWeight) as number) : t.fontWeightMedium;
  const tabPaddingBlock = overrides?.tabPaddingBlock ? (resolveToken(t, overrides.tabPaddingBlock) as number) : t.spaceSm;
  const tabPaddingInline = overrides?.tabPaddingInline ? (resolveToken(t, overrides.tabPaddingInline) as number) : t.spaceMd;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const transition = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationBase;

  // Page size: `perView` above the prose width (and until the first measurement), 1 at or below it.
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const narrow = viewportWidth > 0 && viewportWidth <= t.layoutMaxWidthProse;
  const pageSize = narrow ? 1 : Math.max(1, Math.round(perView));
  const itemWidth = viewportWidth > 0 ? (viewportWidth - slideGap * (pageSize - 1)) / pageSize : 0;
  const maxStart = Math.max(0, total - pageSize);

  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = React.useState(0);
  const currentIndex = Math.min(Math.max(0, Math.round(isControlled ? activeIndex : internalIndex)), maxStart);

  /** The start index Next/Previous would move to, or `null` when that arrow is disabled. */
  const stepTarget = (from: number, direction: 1 | -1): number | null => {
    if (maxStart === 0) {
      return null;
    }
    if (direction === 1) {
      if (from < maxStart) {
        return Math.min(from + pageSize, maxStart);
      }
      return loop ? 0 : null;
    }
    if (from > 0) {
      return Math.max(from - pageSize, 0);
    }
    return loop ? maxStart : null;
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

  // Swipe: viewability only reports a change between onScrollBeginDrag and onMomentumScrollEnd.
  const dragging = React.useRef(false);
  const [settleCount, setSettleCount] = React.useState(0);
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

  // Programmatic moves scroll the track; a drag in progress is left alone. `settleCount` makes a
  // controlled carousel whose parent kept `activeIndex` after a swipe scroll back to it.
  const trackRef = React.useRef<FlatList<CollectedSlide>>(null);
  const positioned = React.useRef(false);
  React.useEffect(() => {
    if (itemWidth <= 0 || dragging.current) {
      return;
    }
    trackRef.current?.scrollToOffset({ offset: currentIndex * (itemWidth + slideGap), animated: positioned.current && !reducedMotion });
    positioned.current = true;
  }, [currentIndex, itemWidth, slideGap, reducedMotion, settleCount]);

  // Autoplay: `playing` is the user's intent (only the pause button, or reaching the end without
  // loop, clears it); touch and control focus pause it only while they last.
  const canRotate = autoplay && !reducedMotion;
  const [playing, setPlaying] = React.useState(autoplay);
  React.useEffect(() => setPlaying(autoplay), [autoplay]);
  const [touching, setTouching] = React.useState(false);
  const [focusCount, setFocusCount] = React.useState(0);
  const rotating = canRotate && playing && !touching && focusCount === 0 && maxStart > 0;

  React.useEffect(() => {
    if (canRotate && playing && !loop && maxStart > 0 && currentIndex === maxStart) {
      // Reaching the last slide without loop counts as stopped.
      setPlaying(false);
    }
  }, [canRotate, playing, loop, maxStart, currentIndex]);

  React.useEffect(() => {
    if (!rotating) {
      return undefined;
    }
    const id = setInterval(() => {
      const { currentIndex: from, goTo: go, stepTarget: step } = latest.current;
      const next = step(from, 1);
      if (next === null) {
        setPlaying(false);
        return;
      }
      go(next, 'autoplay');
    }, effectiveInterval);
    return () => clearInterval(id);
  }, [rotating, effectiveInterval]);

  const onControlFocus = (): void => setFocusCount((n) => n + 1);
  const onControlBlur = (): void => setFocusCount((n) => Math.max(0, n - 1));

  const handlePlayPress = (): void => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // Pressing play clears the touch and focus pauses, so rotation resumes at once.
    setTouching(false);
    setFocusCount(0);
    if (!loop && maxStart > 0 && currentIndex === maxStart) {
      goTo(0, 'autoplay');
    }
    setPlaying(true);
  };

  const handleViewportLayout = (event: LayoutChangeEvent): void => {
    setViewportWidth(event.nativeEvent.layout.width);
  };

  const prevTarget = stepTarget(currentIndex, -1);
  const nextTarget = stepTarget(currentIndex, 1);

  const handleSlideAccessibilityAction = (event: AccessibilityActionEvent): void => {
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
        accessible={visible}
        accessibilityRole="adjustable"
        accessibilityLabel={COPY.slideLabel(index + 1, total)}
        accessibilityActions={SLIDE_ACTIONS}
        onAccessibilityAction={handleSlideAccessibilityAction}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={itemWidth > 0 ? { width: itemWidth } : undefined}
      >
        {item.content}
      </View>
    );
  };

  // With a gap between slides a page is wider than the viewport, so paging snaps by interval instead.
  const usePaging = snap && pageSize === 1 && slideGap === 0;
  const snapInterval = snap && !usePaging && itemWidth > 0 ? itemWidth + slideGap : undefined;

  const viewportStyle: ViewStyle = { borderRadius: radius, overflow: 'hidden' };
  const controlsStyle: ViewStyle = {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: controlOffset,
    zIndex: 1,
  };
  const controlSurfaceStyle: ViewStyle = {
    minWidth: t.sizeTargetComfortable,
    minHeight: t.sizeTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: controlRadius,
    backgroundColor: t.colorOverlaySurface,
    ...controlShadow,
  };
  const pickerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: pickerGap,
  };
  const iconColor = t.colorActionSecondaryForeground;
  const itemTransition = reducedMotion ? 0 : transition;

  return (
    <View
      ref={ref}
      testID="Carousel"
      role="region"
      accessibilityLabel={label}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
      style={{ gap: pickerOffset }}
    >
      {canRotate ? (
        <View testID="Carousel.playButton" style={{ alignSelf: 'flex-start' }}>
          <Button
            label={playing ? COPY.pause : COPY.play}
            variant="secondary"
            onPress={handlePlayPress}
            onFocus={onControlFocus}
            onBlur={onControlBlur}
          />
        </View>
      ) : null}
      <View>
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
        <View testID="Carousel.viewport" onLayout={handleViewportLayout} style={viewportStyle}>
          <FlatList
            ref={trackRef}
            testID="Carousel.track"
            data={slides}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            extraData={`${currentIndex}:${pageSize}:${itemWidth}`}
            horizontal
            pagingEnabled={usePaging}
            snapToInterval={snapInterval}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: slideGap }}
            onScrollBeginDrag={() => {
              dragging.current = true;
            }}
            onMomentumScrollEnd={() => {
              if (!dragging.current) {
                return;
              }
              dragging.current = false;
              if (isControlled) {
                setSettleCount((n) => n + 1);
              }
            }}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        </View>
      </View>
      {picker !== 'none' && total > 0 ? (
        <View testID="Carousel.picker" role={picker === 'tabs' ? 'tablist' : 'group'} accessibilityLabel={COPY.pickerLabel} style={pickerStyle}>
          {slides.map((slide, index) =>
            picker === 'tabs' ? (
              <CarouselTab
                key={slide.key}
                label={slide.label || COPY.goTo(index + 1)}
                selected={index === currentIndex}
                fontSize={tabFontSize}
                fontWeight={tabFontWeight}
                fontFamily={fontFamily}
                paddingBlock={tabPaddingBlock}
                paddingInline={tabPaddingInline}
                transition={itemTransition}
                onSelect={() => goTo(index, 'picker')}
                onFocus={onControlFocus}
                onBlur={onControlBlur}
              />
            ) : (
              <CarouselDot
                key={slide.key}
                label={COPY.goTo(index + 1)}
                selected={index >= currentIndex && index < currentIndex + pageSize}
                size={dotSize}
                transition={itemTransition}
                onSelect={() => goTo(index, 'picker')}
                onFocus={onControlFocus}
                onBlur={onControlBlur}
              />
            ),
          )}
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

/** 0 → 1 as `selected` turns on, over `transition` with the standard easing; jumps when `transition` is 0. */
function useSelectedProgress(selected: boolean, transition: number): Animated.Value {
  const { tokens: t } = useTheme();
  const progress = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
  const wasSelected = React.useRef(selected);
  React.useEffect(() => {
    if (wasSelected.current === selected) {
      return undefined;
    }
    wasSelected.current = selected;
    if (transition === 0) {
      progress.setValue(selected ? 1 : 0);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: selected ? 1 : 0,
      duration: transition,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [selected, transition, progress, t.motionEasingStandard]);
  return progress;
}

interface PickerItemBaseProps {
  label: string;
  selected: boolean;
  transition: number;
  onSelect: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

/** One dot: Carousel's own Pressable, since no Button variant carries the dot tokens. */
function CarouselDot({ label, selected, size, transition, onSelect, onFocus, onBlur }: PickerItemBaseProps & { size: number }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const progress = useSelectedProgress(selected, transition);

  const hitStyle: ViewStyle = {
    minWidth: t.sizeTargetMin,
    minHeight: t.sizeTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
  };
  const dotStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: size,
    height: size,
    borderRadius: t.radiusFull,
    backgroundColor: progress.interpolate({ inputRange: [0, 1], outputRange: [t.colorBorderStrong, t.colorControlSelectedBackground] }),
  };

  return (
    <Pressable
      testID="Carousel.pickerItem"
      accessibilityRole="button"
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
      <Animated.View style={dotStyle} accessibilityElementsHidden importantForAccessibility="no" />
    </Pressable>
  );
}

interface CarouselTabProps extends PickerItemBaseProps {
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  paddingBlock: number;
  paddingInline: number;
}

/** One tab: Carousel's own Pressable and label, styled from the `tab*` bindings. */
function CarouselTab({
  label,
  selected,
  fontSize,
  fontWeight,
  fontFamily,
  paddingBlock,
  paddingInline,
  transition,
  onSelect,
  onFocus,
  onBlur,
}: CarouselTabProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const progress = useSelectedProgress(selected, transition);

  const hitStyle: ViewStyle = {
    minHeight: t.sizeTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
  };
  const labelStyle = {
    fontFamily,
    fontSize,
    // The same weight selected or not, so selection never shifts the row.
    fontWeight: toFontWeight(fontWeight),
    color: progress.interpolate({ inputRange: [0, 1], outputRange: [t.colorForegroundMuted, t.colorForegroundStrong] }),
  };
  // The selected tab's underline sits inside the tab's box, so it takes no layout.
  const indicatorStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: t.borderWidthFocus,
    backgroundColor: t.colorControlSelectedBackground,
  };

  return (
    <Pressable
      testID="Carousel.pickerItem"
      accessibilityRole="tab"
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
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {selected ? <View style={indicatorStyle} accessibilityElementsHidden importantForAccessibility="no" /> : null}
    </Pressable>
  );
}
