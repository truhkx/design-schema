import * as React from 'react';
import { AccessibilityInfo, FlatList, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ListRenderItemInfo, TextStyle, ViewStyle, ViewToken } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { toFontWeight, useReducedMotion, useTheme } from './theme';

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
  | 'dotTarget'
  | 'radius'
  | 'transition';

export interface CarouselSlideProps {
  /**
   * This slide's heading. Not rendered — used to build the slide's accessible name
   * ("{n} of {total}, {heading}") and, when `picker="tabs"`, that slide's tab label.
   * The visible content still needs its own heading for sighted users (a Card is the
   * usual shape); this mirrors the web platform's separate `aria-label`.
   */
  heading: string;
  /** The slide's content. Slides should be equal height. */
  children: React.ReactNode;
}

/** One slide. Rendered by `Carousel`, never directly. */
export function CarouselSlide({ children }: CarouselSlideProps): React.JSX.Element {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export interface CarouselProps {
  /** What the carousel shows ("Featured products", "Customer stories"). Names the region. */
  label: string;
  /** One `CarouselSlide` per slide. */
  children: React.ReactNode;
  /** How many slides are visible at once at the widest layout. */
  perView?: number;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean;
  /** Rotate automatically every `interval`. Never starts under reduced motion; stops for good on touch or the pause button. */
  autoplay?: boolean;
  /** Milliseconds between automatic advances. Below 5000 warns in development. */
  interval?: number;
  /** How slides are chosen directly. */
  picker?: CarouselPicker;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number;
  /** Swiping or scrolling snaps to slide boundaries. */
  snap?: boolean;
  /** Fired when the current slide changes, with the new index and the reason. */
  onChange?: (index: number, reason: CarouselChangeReason) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef>>;
}

interface CollectedSlide {
  key: string;
  heading: string;
  content: React.ReactNode;
}

function collectSlides(children: React.ReactNode): CollectedSlide[] {
  const slides: CollectedSlide[] = [];
  React.Children.forEach(children, (child, index) => {
    if (React.isValidElement(child) && child.type === CarouselSlide) {
      const props = child.props as CarouselSlideProps;
      slides.push({ key: child.key ?? String(index), heading: props.heading, content: props.children });
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

const REGION_ACTIONS = [
  { name: 'increment', label: 'Next slide' },
  { name: 'decrement', label: 'Previous slide' },
] as const;

/**
 * Carousel — shows several things in the space of one and lets the user page
 * through them.
 *
 * When to use: Use for a small set (three to eight) of peer items too rich for a
 * grid — featured products, testimonials, a gallery. Use `picker="tabs"` when
 * slides have meaningful names, `dots` for images. Leave `autoplay` off unless the
 * content is ambient, and even then keep the pause control visible. Do not hide
 * important content behind slide two, and do not autoplay text people need to read.
 *
 * Renders a horizontal `FlatList` (`pagingEnabled` at `perView` 1, `snapToInterval`
 * otherwise) of slide `View`s, each `accessible` with a positional label
 * (`copy.slideLabel` plus its heading) and hidden from assistive technology
 * (`accessibilityElementsHidden`/`importantForAccessibility`) while outside the
 * current window, so off-screen links are not tab stops. The region `View` carries
 * `accessibilityRole="adjustable"` with increment/decrement `accessibilityActions`
 * as the alternative to the swipe gesture. `prevButton`/`nextButton` are composed
 * `Button`s (`variant="ghost"`, chevron `Icon`s) each in a small wrapper `View` that
 * carries `controlBackground`/`controlShadow` — composing rather than restyling
 * Button, whose overridable bindings have no plain "background" slot. The picker
 * (`dots`/`tabs`) and the play/pause `Button` (only rendered while autoplay can
 * possibly run, i.e. `autoplay` is set and reduced motion is not) are hand-built
 * `Pressable`s with their own focus ring, matching the package's focus-visible
 * convention. A hidden `liveRegion` `View` (`accessibilityLiveRegion="polite"`)
 * covers Android; `AccessibilityInfo.announceForAccessibility` covers iOS, firing
 * for every reason except `autoplay` (APG: do not announce automatic changes).
 *
 * Next/Previous/autoplay each move exactly one slide — the spec's "one slide (or
 * one page of `perView`)" does not define page alignment, so `perView` only governs
 * how many slides are visible at once, never the step size. Autoplay stops for good
 * on touch (`onTouchStart` on the region, `onScrollBeginDrag` on the track); pausing
 * on focus could only be wired for the hand-built picker items, since the composed
 * `Button` exposes no `onFocus` prop to observe.
 */
export function Carousel({
  label,
  children,
  perView = 1,
  loop = false,
  autoplay = false,
  interval = 6000,
  picker = 'dots',
  activeIndex,
  snap = true,
  onChange,
  overrides,
}: CarouselProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const slides = React.useMemo(() => collectSlides(children), [children]);

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
    // literal-ok: a dev-only validation threshold from the spec ("below 5000 is
    // refused in development"), not a style token.
    if (__DEV__ && interval < 5000) {
      console.warn('Carousel: interval below the 5-second minimum does not give people enough time to read a slide before it advances.');
    }
  }, [interval]);

  const perViewClamped = Math.max(1, Math.round(perView));
  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = React.useState(0);
  const currentIndex = Math.min(isControlled ? (activeIndex as number) : internalIndex, Math.max(0, slides.length - 1));

  const [viewportWidth, setViewportWidth] = React.useState(0);
  const slideGap = overrides?.slideGap ? (resolveToken(t, overrides.slideGap) as number) : t.layoutGapNormal;
  const itemWidth = viewportWidth > 0 ? (viewportWidth - slideGap * (perViewClamped - 1)) / perViewClamped : viewportWidth;

  const controlOffset = overrides?.controlOffset ? (resolveToken(t, overrides.controlOffset) as number) : t.space2;
  const controlShadow = overrides?.controlShadow ? (resolveToken(t, overrides.controlShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const pickerGap = overrides?.pickerGap ? (resolveToken(t, overrides.pickerGap) as number) : t.layoutGapTight;
  const pickerOffset = overrides?.pickerOffset ? (resolveToken(t, overrides.pickerOffset) as number) : t.space3;
  const dotSize = overrides?.dotSize ? (resolveToken(t, overrides.dotSize) as number) : t.space2;
  const dotTarget = overrides?.dotTarget ? (resolveToken(t, overrides.dotTarget) as number) : t.sizeTargetMin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;

  const controlBackground = t.colorOverlaySurface;
  const dotColor = t.colorBorderStrong;
  const dotActiveColor = t.colorControlSelectedBackground;
  const minTarget = t.sizeTargetComfortable;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;

  const [announcement, setAnnouncement] = React.useState('');
  React.useEffect(() => {
    if (Platform.OS === 'ios' && announcement !== '') {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [announcement]);

  const clampIndex = React.useCallback(
    (index: number): number => {
      const total = slides.length;
      if (total === 0) {
        return 0;
      }
      if (loop) {
        return ((index % total) + total) % total;
      }
      const maxIndex = Math.max(0, total - perViewClamped);
      return Math.min(Math.max(index, 0), maxIndex);
    },
    [slides.length, loop, perViewClamped],
  );

  const flatListRef = React.useRef<FlatList<CollectedSlide>>(null);

  const goTo = React.useCallback(
    (index: number, reason: CarouselChangeReason): void => {
      const clamped = clampIndex(index);
      if (clamped === currentIndex) {
        return;
      }
      if (!isControlled) {
        setInternalIndex(clamped);
      }
      onChange?.(clamped, reason);
      flatListRef.current?.scrollToOffset({ offset: clamped * (itemWidth + slideGap), animated: !reducedMotion });
      if (reason !== 'autoplay') {
        setAnnouncement(COPY.announce(clamped + 1, slides.length));
      }
    },
    [clampIndex, currentIndex, isControlled, onChange, itemWidth, slideGap, reducedMotion, slides.length],
  );

  // A stable ticker/callback pair so the autoplay interval and the FlatList's
  // viewability callback do not need to change identity every render (React
  // Native warns on a changing `onViewableItemsChanged`), reading fresh state
  // through a ref instead — the same pattern Slider's thumb uses for its
  // PanResponder.
  const latest = React.useRef({ currentIndex, goTo });
  latest.current = { currentIndex, goTo };

  const [playing, setPlaying] = React.useState(autoplay && !reducedMotion);
  React.useEffect(() => {
    if (!autoplay || reducedMotion) {
      setPlaying(false);
    }
  }, [autoplay, reducedMotion]);

  React.useEffect(() => {
    if (!playing) {
      return undefined;
    }
    const id = setInterval(() => {
      latest.current.goTo(latest.current.currentIndex + 1, 'autoplay');
    }, interval);
    return () => clearInterval(id);
  }, [playing, interval]);

  const pauseAutoplay = (): void => setPlaying(false);

  const handleViewportLayout = (event: LayoutChangeEvent): void => {
    setViewportWidth(event.nativeEvent.layout.width);
  };

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: ViewToken[] }): void => {
    const first = viewableItems.find((entry) => entry.isViewable);
    if (!first || first.index === null || first.index === undefined || first.index === latest.current.currentIndex) {
      return;
    }
    latest.current.goTo(first.index, 'swipe');
  }).current;

  const handleRegionAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment') {
      goTo(currentIndex + 1, 'next');
    } else if (event.nativeEvent.actionName === 'decrement') {
      goTo(currentIndex - 1, 'prev');
    }
  };

  const prevDisabled = !loop && currentIndex <= 0;
  const nextDisabled = !loop && currentIndex >= Math.max(0, slides.length - perViewClamped);

  const renderItem = ({ item, index }: ListRenderItemInfo<CollectedSlide>): React.JSX.Element => {
    const distance = Math.min(Math.abs(index - currentIndex), slides.length - Math.abs(index - currentIndex));
    const visible = distance < perViewClamped;
    return (
      <View
        testID="Carousel.slide"
        accessible
        accessibilityLabel={`${COPY.slideLabel(index + 1, slides.length)}, ${item.heading}`}
        accessibilityElementsHidden={!visible}
        importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
        style={{ width: itemWidth > 0 ? itemWidth : undefined }}
      >
        {item.content}
      </View>
    );
  };

  const viewportStyle: ViewStyle = {
    position: 'relative',
    borderRadius: radius,
    overflow: 'hidden',
  };

  const controlsOverlayStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: controlOffset,
    zIndex: 1,
  };

  const arrowBackdropStyle: ViewStyle = {
    borderRadius: t.radiusFull,
    backgroundColor: controlBackground,
    ...controlShadow,
  };

  const pickerRowStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: pickerGap,
    marginTop: pickerOffset,
  };

  const pickerStyleTokens: CarouselPickerStyleTokens = {
    dotSize,
    dotTarget,
    dotColor,
    dotActiveColor,
    minTarget,
    focusRingColor,
    focusRingWidth,
    fontFamily: t.fontFamilyBody,
    fontSize: t.fontSizeSm,
    fontWeight: t.fontWeightRegular,
    fontWeightSelected: t.fontWeightSemibold,
    tabPaddingInline: t.spaceSm,
    tabColor: t.colorForegroundMuted,
    tabSelectedColor: t.colorForegroundStrong,
  };

  const showPlayButton = autoplay && !reducedMotion;

  return (
    <View
      testID="Carousel"
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityActions={REGION_ACTIONS}
      onAccessibilityAction={handleRegionAccessibilityAction}
      onTouchStart={pauseAutoplay}
    >
      {showPlayButton ? (
        <View testID="Carousel.playButton" style={{ marginBottom: t.layoutGapTight, alignSelf: 'flex-start' }}>
          <Button label={playing ? COPY.pause : COPY.play} variant="secondary" size="sm" onPress={() => setPlaying((prev) => !prev)} />
        </View>
      ) : null}
      <View testID="Carousel.viewport" onLayout={handleViewportLayout} style={viewportStyle}>
        <View style={controlsOverlayStyle} pointerEvents="box-none">
          <View testID="Carousel.prevButton" style={arrowBackdropStyle}>
            <Button
              label={COPY.previous}
              variant="ghost"
              iconOnly
              disabled={prevDisabled}
              leadingIcon={<Icon name="chevron-left" color={t.colorActionGhostForeground} />}
              onPress={() => goTo(currentIndex - 1, 'prev')}
            />
          </View>
          <View testID="Carousel.nextButton" style={arrowBackdropStyle}>
            <Button
              label={COPY.next}
              variant="ghost"
              iconOnly
              disabled={nextDisabled}
              leadingIcon={<Icon name="chevron-right" color={t.colorActionGhostForeground} />}
              onPress={() => goTo(currentIndex + 1, 'next')}
            />
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          testID="Carousel.track"
          data={slides}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled={snap && perViewClamped === 1}
          snapToInterval={snap && perViewClamped > 1 ? itemWidth + slideGap : undefined}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={pauseAutoplay}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          ItemSeparatorComponent={() => <View style={{ width: slideGap }} />}
        />
      </View>
      {picker !== 'none' ? (
        <View testID="Carousel.picker" accessibilityRole={picker === 'tabs' ? 'tablist' : undefined} style={pickerRowStyle}>
          {slides.map((slide, index) => (
            <CarouselPickerItem
              key={slide.key}
              picker={picker}
              heading={slide.heading}
              index={index}
              selected={index === currentIndex}
              styleTokens={pickerStyleTokens}
              onSelect={() => goTo(index, 'picker')}
            />
          ))}
        </View>
      ) : null}
      <View
        testID="Carousel.liveRegion"
        accessibilityLiveRegion="polite"
        importantForAccessibility="yes"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}
      >
        <RNText>{announcement}</RNText>
      </View>
    </View>
  );
}

interface CarouselPickerStyleTokens {
  dotSize: number;
  dotTarget: number;
  dotColor: string;
  dotActiveColor: string;
  minTarget: number;
  focusRingColor: string;
  focusRingWidth: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontWeightSelected: number;
  tabPaddingInline: number;
  tabColor: string;
  tabSelectedColor: string;
}

interface CarouselPickerItemProps {
  picker: CarouselPicker;
  heading: string;
  index: number;
  selected: boolean;
  styleTokens: CarouselPickerStyleTokens;
  onSelect: () => void;
}

/** One dot or tab in the picker. Its own component so focus state does not re-render the whole row. */
function CarouselPickerItem({ picker, heading, index, selected, styleTokens: s, onSelect }: CarouselPickerItemProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const isTabs = picker === 'tabs';

  const hitStyle: ViewStyle = {
    minWidth: isTabs ? s.minTarget : s.dotTarget,
    minHeight: isTabs ? s.minTarget : s.dotTarget,
    paddingHorizontal: isTabs ? s.tabPaddingInline : 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: s.focusRingWidth,
    borderColor: focused ? s.focusRingColor : 'transparent',
  };

  const dotVisualStyle: ViewStyle = {
    width: s.dotSize,
    height: s.dotSize,
    borderRadius: s.dotSize / 2, // literal-ok: halves a token-derived size into a radius
    backgroundColor: selected ? s.dotActiveColor : s.dotColor,
  };

  const tabLabelStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: toFontWeight(selected ? s.fontWeightSelected : s.fontWeight),
    color: selected ? s.tabSelectedColor : s.tabColor,
  };

  return (
    <Pressable
      testID="Carousel.pickerItem"
      accessibilityRole={isTabs ? 'tab' : 'button'}
      accessibilityLabel={isTabs ? heading : COPY.goTo(index + 1)}
      accessibilityState={{ selected }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onSelect}
      style={hitStyle}
    >
      {isTabs ? (
        <RNText numberOfLines={1} style={tabLabelStyle}>
          {heading}
        </RNText>
      ) : (
        <View style={dotVisualStyle} />
      )}
    </Pressable>
  );
}
