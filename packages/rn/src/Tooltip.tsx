import * as React from 'react';
import { Animated, I18nManager, Platform, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Text, TextForegroundContext } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TooltipDelay = 'default' | 'none';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TooltipOverridableBinding =
  | 'radius'
  | 'paddingBlock'
  | 'paddingInline'
  | 'offset'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'shadow'
  | 'layer'
  | 'enter'
  | 'exit';

export interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error. */
  children: React.ReactNode;
  /** Preferred side; flips when it would overflow the window (measured with `measureInWindow`). `start`/`end` are logical and mirror in right-to-left. */
  placement?: TooltipPlacement | undefined;
  /** `true`: supplementary, becomes the child's `accessibilityHint`. `false`: it IS the child's name and becomes `accessibilityLabel` instead. */
  describes?: boolean | undefined;
  /** Controlled visibility, for stories and tests only. Product code never sets it: a tooltip is hover, focus and long-press driven. */
  open?: boolean | undefined;
  /** Hover delay before showing (react-native-web): `default` waits `motion.duration.base` × 3; `none` shows instantly. */
  delay?: TooltipDelay | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

type Size = { width: number; height: number };
type Rect = Size & { x: number; y: number };
type Sources = { hover: boolean; bubble: boolean; focus: boolean; press: boolean };

const NO_SOURCES: Sources = { hover: false, bubble: false, focus: false, press: false };

/** Module-level "warm until" timestamp shared by every Tooltip: after one hides, a sibling hovered within `warmWindow` shows with no delay. */
let warmUntil = 0;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Positions the bubble from the trigger's window rect for `placement`, flipping to the
 * opposite side when the preferred one would overflow the window and shifting the cross
 * axis to stay inside it. Returns coordinates relative to the trigger, because the bubble
 * is laid out inside Tooltip's own root rather than a portal.
 */
function computeBubblePosition(
  placement: TooltipPlacement,
  trigger: Rect,
  bubble: Size,
  windowSize: Size,
  offset: number,
): { top: number; left: number } {
  if (placement === 'start' || placement === 'end') {
    let onLeft = I18nManager.isRTL ? placement === 'end' : placement === 'start';
    const spaceLeft = trigger.x;
    const spaceRight = windowSize.width - (trigger.x + trigger.width);
    if (onLeft && spaceLeft < bubble.width + offset && spaceRight >= bubble.width + offset) {
      onLeft = false;
    } else if (!onLeft && spaceRight < bubble.width + offset && spaceLeft >= bubble.width + offset) {
      onLeft = true;
    }
    const left = onLeft ? trigger.x - offset - bubble.width : trigger.x + trigger.width + offset;
    const top = clamp(trigger.y + trigger.height / 2 - bubble.height / 2, 0, windowSize.height - bubble.height);
    return { top: top - trigger.y, left: left - trigger.x };
  }

  let below = placement === 'bottom';
  const spaceAbove = trigger.y;
  const spaceBelow = windowSize.height - (trigger.y + trigger.height);
  if (below && spaceBelow < bubble.height + offset && spaceAbove > spaceBelow) {
    below = false;
  } else if (!below && spaceAbove < bubble.height + offset && spaceBelow > spaceAbove) {
    below = true;
  }
  const top = below ? trigger.y + trigger.height + offset : trigger.y - offset - bubble.height;
  const left = clamp(trigger.x + trigger.width / 2 - bubble.width / 2, 0, windowSize.width - bubble.width);
  return { top: top - trigger.y, left: left - trigger.x };
}

type Handler = ((event: unknown) => void) | undefined;

/**
 * Tooltip — the smallest overlay: a label that names an icon-only button or adds a
 * short clarification to a control, shown while attention is on it.
 *
 * When to use: attach it to an icon-only Button (`describes={false}`, so the tooltip is
 * the accessible name rather than a second announcement) or to a labelled control that
 * needs one more short phrase. Never put essential information, links or controls in it.
 *
 * There is no hover on touch, so native shows nothing by default: `content` is cloned
 * onto the single child as `accessibilityHint` (or `accessibilityLabel` when `describes`
 * is `false`), so the information is never hover-only. A long-press shows the inverted
 * bubble above the child until the press ends, as a sighted-user aid. On
 * react-native-web hover and focus behave as on web: focus shows it immediately, hover
 * waits `hoverDelay` (none when `delay` is `none` or a sibling hid within `warmWindow`),
 * leaving the trigger hides it after `pointerGrace` unless the pointer reaches the
 * bubble, and Escape hides it without moving focus. The bubble is hidden from
 * accessibility — the hint or label on the trigger already carries the text.
 *
 * The bubble is not portaled: it is absolutely positioned inside Tooltip's root on
 * `layer.toast`, placed from the trigger's `measureInWindow` rect and flipped on
 * overflow. An ancestor that clips (`overflow: 'hidden'`) or a sibling stacking context
 * above the root can still cover it — the acknowledged native limit.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  describes = true,
  open: openProp,
  delay = 'default',
  overrides,
  ref,
}: TooltipProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const windowSize = useWindowDimensions();

  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusSm;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.space1;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.space2;
  const offset = overrides?.offset ? (resolveToken(t, overrides.offset) as number) : t.space1;
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.space20 * 3; // literal-ok: schema computed times 3
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowRaised) : t.shadowRaised;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerToast;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  // Constants, read through their token expressions.
  const hoverDelay = t.motionDurationBase * 3; // literal-ok: schema constant hoverDelay multiply 3
  const warmWindow = t.motionDurationBase;
  const pointerGrace = t.motionDurationFast;

  const [sources, setSources] = React.useState<Sources>(NO_SOURCES);
  // Escape while controlled: hides until the `open` prop changes.
  const [escaped, setEscaped] = React.useState(false);
  React.useEffect(() => setEscaped(false), [openProp]);

  const visible =
    openProp !== undefined ? openProp && !escaped : sources.hover || sources.bubble || sources.focus || sources.press;

  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const graceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = (timer: React.RefObject<ReturnType<typeof setTimeout> | null>): void => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  React.useEffect(
    () => () => {
      clearTimer(hoverTimer);
      clearTimer(graceTimer);
    },
    [],
  );

  const setSource = React.useCallback((key: keyof Sources, value: boolean) => {
    setSources((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  // Leaving a visible tooltip opens the shared warm window for its siblings.
  const wasVisible = React.useRef(visible);
  React.useEffect(() => {
    if (wasVisible.current && !visible) {
      warmUntil = Date.now() + warmWindow;
    }
    wasVisible.current = visible;
  }, [visible, warmWindow]);

  const handleHoverIn = (): void => {
    clearTimer(graceTimer);
    clearTimer(hoverTimer);
    if (delay === 'none' || visible || Date.now() < warmUntil) {
      setSource('hover', true);
      return;
    }
    hoverTimer.current = setTimeout(() => setSource('hover', true), hoverDelay);
  };

  const handleHoverOut = (): void => {
    clearTimer(hoverTimer);
    clearTimer(graceTimer);
    graceTimer.current = setTimeout(() => setSource('hover', false), pointerGrace);
  };

  const handleBubbleEnter = (): void => {
    clearTimer(graceTimer);
    setSource('bubble', true);
  };

  const handleBubbleLeave = (): void => {
    clearTimer(graceTimer);
    graceTimer.current = setTimeout(() => {
      setSource('bubble', false);
      setSource('hover', false);
    }, pointerGrace);
  };

  const dismiss = React.useCallback(() => {
    clearTimer(hoverTimer);
    clearTimer(graceTimer);
    setSources(NO_SOURCES);
    setEscaped(true);
  }, []);

  // Escape hides without moving focus. Only react-native-web has a keyboard event to
  // listen for; native hardware keyboards have no Escape binding for a non-modal view.
  React.useEffect(() => {
    if (Platform.OS !== 'web' || !visible) {
      return undefined;
    }
    type KeyListener = (event: { key?: string | undefined }) => void;
    const globalWindow = (
      globalThis as {
        window?:
          | { addEventListener: (type: 'keydown', listener: KeyListener) => void; removeEventListener: (type: 'keydown', listener: KeyListener) => void }
          | undefined;
      }
    ).window;
    if (globalWindow === undefined) {
      return undefined;
    }
    const handleKeyDown: KeyListener = (event) => {
      if (event.key === 'Escape') {
        dismiss();
      }
    };
    globalWindow.addEventListener('keydown', handleKeyDown);
    return () => globalWindow.removeEventListener('keydown', handleKeyDown);
  }, [visible, dismiss]);

  const isSingleElement = React.isValidElement(children) && React.Children.count(children) === 1;
  React.useEffect(() => {
    if (__DEV__ && !isSingleElement) {
      console.warn('Tooltip: `children` must be exactly one focusable element (a Button, Link or Input).');
    }
  }, [isSingleElement]);

  const child = isSingleElement ? (children as React.ReactElement<Record<string, unknown>>) : null;
  const childProps = child?.props ?? {};
  const chain =
    (name: string, own: () => void) =>
    (event: unknown): void => {
      (childProps[name] as Handler)?.(event);
      own();
    };

  const trigger =
    child !== null
      ? React.cloneElement(child, {
          ...(describes ? { accessibilityHint: content } : { accessibilityLabel: content }),
          onLongPress: chain('onLongPress', () => setSource('press', true)),
          onPressOut: chain('onPressOut', () => setSource('press', false)),
          ...(Platform.OS === 'web'
            ? {
                onHoverIn: chain('onHoverIn', handleHoverIn),
                onHoverOut: chain('onHoverOut', handleHoverOut),
                onFocus: chain('onFocus', () => setSource('focus', true)),
                onBlur: chain('onBlur', () => setSource('focus', false)),
              }
            : {}),
        })
      : children;

  // Mounted stays true through the exit fade.
  const [mounted, setMounted] = React.useState(visible);
  const progress = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    const easing = toEasing(t.motionEasingStandard);
    if (visible) {
      if (reducedMotion) {
        progress.setValue(1);
        return undefined;
      }
      // react-native-web has no native animated module.
      const animation = Animated.timing(progress, { toValue: 1, duration: enterDuration, easing, useNativeDriver: false });
      animation.start();
      return () => animation.stop();
    }
    if (reducedMotion) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    const animation = Animated.timing(progress, { toValue: 0, duration: exitDuration, easing, useNativeDriver: false });
    animation.start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
    return () => animation.stop();
  }, [visible, mounted, reducedMotion, enterDuration, exitDuration, progress, t.motionEasingStandard]);

  const triggerRef = React.useRef<ViewInstance>(null);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [bubbleSize, setBubbleSize] = React.useState<Size | null>(null);

  const measureTrigger = React.useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerRect((prev) =>
        prev !== null && prev.x === x && prev.y === y && prev.width === width && prev.height === height
          ? prev
          : { x, y, width, height },
      );
    });
  }, []);

  React.useEffect(() => {
    if (mounted) {
      measureTrigger();
    }
  }, [mounted, measureTrigger, windowSize.width, windowSize.height]);

  const handleBubbleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setBubbleSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const position =
    triggerRect !== null
      ? computeBubblePosition(placement, triggerRect, bubbleSize ?? { width: 0, height: 0 }, windowSize, offset)
      : null;

  const bubbleStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    maxWidth,
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    borderRadius: radius,
    backgroundColor: t.colorInverseSurface,
    zIndex: layer,
    // Stays transparent until it has been measured and placed.
    opacity: position !== null && bubbleSize !== null ? progress : 0,
    ...shadow,
  };

  return (
    <View ref={ref} testID="Tooltip" style={{ position: 'relative', alignSelf: 'flex-start', ...(mounted ? { zIndex: layer } : {}) }}>
      {/* `collapsable={false}` keeps this View in the native tree on Android so measureInWindow stays reliable. */}
      <View ref={triggerRef} collapsable={false}>
        {trigger}
      </View>
      {mounted ? (
        <Animated.View
          testID="Tooltip.popup"
          onLayout={handleBubbleLayout}
          // Hoverable under react-native-web (WCAG 1.4.13); inert on touch.
          pointerEvents={Platform.OS === 'web' ? 'auto' : 'none'}
          onPointerEnter={handleBubbleEnter}
          onPointerLeave={handleBubbleLeave}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={bubbleStyle}
        >
          {/* surface and text are locked: the bubble provides its foreground to the composed Text (whose color is locked too) instead of overriding it. */}
          <TextForegroundContext.Provider value={t.colorInverseForeground}>
            <Text
              size="sm"
              overrides={{
                fontFamily: overrides?.fontFamily,
                fontSize: overrides?.fontSize,
                lineHeight: overrides?.lineHeight,
              }}
            >
              {content}
            </Text>
          </TextForegroundContext.Provider>
        </Animated.View>
      ) : null}
    </View>
  );
}
