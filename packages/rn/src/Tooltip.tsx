import * as React from 'react';
import { Animated, I18nManager, Platform, View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Text } from './Text';
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
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it. */
  children: React.ReactNode;
  /** Preferred side; native has no viewport to flip against, so this is not adjusted automatically. */
  placement?: TooltipPlacement | undefined;
  /** `true`: supplementary, becomes the child's `accessibilityHint`. `false`: it IS the child's name and becomes `accessibilityLabel` instead. */
  describes?: boolean | undefined;
  /** Hover delay (react-native-web only — there is no hover on touch): `default` waits `motion.duration.base` × 3; `none` shows instantly, as does any hover while a sibling tooltip is still "warm". */
  delay?: TooltipDelay | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
}

type Size = { width: number; height: number };

/** Module-level "warm until" timestamp, shared by every Tooltip: moving the pointer from one just-hidden tooltip's trigger to the next shows it instantly instead of waiting out `delay`, the same toolbar behavior the web platform implements. */
let warmUntil = 0;

/** Positions the bubble from the trigger's own measured size — there is no portal, so this is relative to the shared parent rather than the window — flipping `start`/`end` against the writing direction. Does not flip `top`/`bottom` on overflow: unlike Menu's dropdown, native has no window-rect measurement wired up for this transient, non-portaled view. */
function computeBubbleOffset(placement: TooltipPlacement, trigger: Size, bubble: Size, offset: number): ViewStyle {
  switch (placement) {
    case 'top':
      return { bottom: trigger.height + offset, left: (trigger.width - bubble.width) / 2 };
    case 'bottom':
      return { top: trigger.height + offset, left: (trigger.width - bubble.width) / 2 };
    case 'start':
      return I18nManager.isRTL
        ? { left: trigger.width + offset, top: (trigger.height - bubble.height) / 2 }
        : { right: trigger.width + offset, top: (trigger.height - bubble.height) / 2 };
    case 'end':
      return I18nManager.isRTL
        ? { right: trigger.width + offset, top: (trigger.height - bubble.height) / 2 }
        : { left: trigger.width + offset, top: (trigger.height - bubble.height) / 2 };
  }
}

/**
 * Tooltip — the smallest overlay: a label that names an icon-only button or adds a
 * short clarification to a control, shown on hover or focus and gone the moment
 * attention moves on.
 *
 * When to use: Attach it to an icon-only Button (`describes={false}` so the tooltip
 * becomes the accessible name instead of a second announcement) or to a labelled
 * control that needs one more short phrase. Never put essential information, links
 * or controls in it — a touch user will never see it.
 *
 * There is no hover on touch, so native shows nothing by default: `content` is
 * cloned onto the single child as `accessibilityHint` (or `accessibilityLabel` when
 * `describes` is `false`), and a long-press reveals a transient inverted-surface
 * `View` above the child, as a sighted-user aid, for the duration of the press. On
 * react-native-web `content` — and the informational content is already covered by
 * that clone regardless of platform — hover and focus behave as on web: focus shows
 * it immediately, hover waits out `delay` (`motion.duration.base` × 3, or instantly
 * when `delay` is `none` or a sibling tooltip's `hide()` left the shared module-level
 * "warm" window still open), and Escape hides it without moving focus via a `window`
 * `keydown` listener (a real browser exists under react-native-web; native has no
 * hardware-keyboard Escape to bind to and the popup is never shown there to begin
 * with). The bubble itself carries `accessibilityElementsHidden` — it is decorative,
 * since the real accessible information is the hint/label on the trigger, per the
 * schema's own "never hover-only" rule.
 *
 * Acknowledged native limits: this package's own `Button`/`Link`/`Input` do not
 * forward unrecognized props, so the `accessibilityHint`/`accessibilityLabel` and
 * the hover/focus/long-press handlers cloned here have no effect when the child is
 * one of those three — only a child that forwards extra props onto a native
 * `Pressable`/`TextInput` (or a raw core-RN element) actually receives them. Making
 * this work for the package's own trigger components requires those components'
 * own schemas to grow a passthrough, which is out of scope here. `top`/`bottom`
 * placement is not flipped on overflow (no window-rect measurement for a
 * non-portaled view); `start`/`end` still resolve against writing direction.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  describes = true,
  delay = 'default',
  overrides,
}: TooltipProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [triggerSize, setTriggerSize] = React.useState<Size | null>(null);
  const [bubbleSize, setBubbleSize] = React.useState<Size | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusSm;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.space1;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.space2;
  const offset = overrides?.offset ? (resolveToken(t, overrides.offset) as number) : t.space1;
  // space.20 × 3 per the schema's own description — a multiplier, not a new token.
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.space20 * 3; // literal-ok: schema-specified multiplier
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowRaised) : t.shadowRaised;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerToast;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const clearHoverTimer = React.useCallback(() => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);
  React.useEffect(() => clearHoverTimer, [clearHoverTimer]);

  const show = React.useCallback(() => {
    clearHoverTimer();
    setOpen(true);
  }, [clearHoverTimer]);

  const hide = React.useCallback(() => {
    clearHoverTimer();
    setOpen((wasOpen) => {
      if (wasOpen) {
        warmUntil = Date.now() + t.motionDurationBase;
      }
      return false;
    });
  }, [clearHoverTimer, t.motionDurationBase]);

  // `delay.default` is `motion.duration.base` × 3 per the schema; a sibling tooltip
  // hidden within the last `motion.duration.base` leaves the toolbar "warm" so this
  // one shows instantly instead, mirroring the web platform's own implementation.
  const handleHoverIn = React.useCallback(() => {
    clearHoverTimer();
    if (delay === 'none' || Date.now() < warmUntil) {
      show();
      return;
    }
    hoverTimer.current = setTimeout(show, t.motionDurationBase * 3); // literal-ok: schema-specified multiplier
  }, [clearHoverTimer, delay, show, t.motionDurationBase]);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      if (reducedMotion) {
        progress.setValue(1);
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }
    if (reducedMotion) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
    return () => animation.stop();
    // Reacts to the open/mounted transition; the animation's own config is read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  // Escape hides the tooltip without moving focus. There is no hardware-keyboard
  // event API on native, and the popup is never shown there; react-native-web runs
  // in a real browser, so a `window` listener covers exactly the case that needs it.
  React.useEffect(() => {
    if (Platform.OS !== 'web' || !open) {
      return undefined;
    }
    const globalWindow = (
      globalThis as {
        window?: {
          addEventListener: (type: 'keydown', listener: (event: { key?: string | undefined }) => void) => void;
          removeEventListener: (type: 'keydown', listener: (event: { key?: string | undefined }) => void) => void;
        } | undefined;
      }
    ).window;
    if (globalWindow === undefined) {
      return undefined;
    }
    const handleKeyDown = (event: { key?: string | undefined }): void => {
      if (event.key === 'Escape') {
        hide();
      }
    };
    globalWindow.addEventListener('keydown', handleKeyDown);
    return () => globalWindow.removeEventListener('keydown', handleKeyDown);
  }, [open, hide]);

  const isElement = React.isValidElement(children);
  React.useEffect(() => {
    if (__DEV__ && (!isElement || React.Children.count(children) !== 1)) {
      console.warn('Tooltip: `children` must be exactly one focusable element (Button, Link, or Input).');
    }
  }, [isElement, children]);

  const child = isElement ? (children as React.ReactElement<Record<string, unknown>>) : null;
  const childProps = child?.props ?? {};

  const trigger =
    child !== null
      ? React.cloneElement(child, {
          ...(describes ? { accessibilityHint: content } : { accessibilityLabel: content }),
          onLongPress: (event: unknown) => {
            (childProps.onLongPress as ((e: unknown) => void) | undefined)?.(event);
            show();
          },
          onPressOut: (event: unknown) => {
            (childProps.onPressOut as ((e: unknown) => void) | undefined)?.(event);
            hide();
          },
          ...(Platform.OS === 'web'
            ? {
                onHoverIn: (event: unknown) => {
                  (childProps.onHoverIn as ((e: unknown) => void) | undefined)?.(event);
                  handleHoverIn();
                },
                onHoverOut: (event: unknown) => {
                  (childProps.onHoverOut as ((e: unknown) => void) | undefined)?.(event);
                  hide();
                },
                onFocus: (event: unknown) => {
                  (childProps.onFocus as ((e: unknown) => void) | undefined)?.(event);
                  show();
                },
                onBlur: (event: unknown) => {
                  (childProps.onBlur as ((e: unknown) => void) | undefined)?.(event);
                  hide();
                },
              }
            : {}),
        })
      : children;

  const handleTriggerLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setTriggerSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const handleBubbleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setBubbleSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const hostStyle: ViewStyle = {
    position: 'relative',
    alignSelf: 'flex-start',
  };

  const bubblePosition =
    triggerSize !== null ? computeBubbleOffset(placement, triggerSize, bubbleSize ?? { width: 0, height: 0 }, offset) : {};

  const bubbleStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    ...bubblePosition,
    maxWidth,
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    borderRadius: radius,
    backgroundColor: t.colorInverseSurface,
    zIndex: layer,
    opacity: progress,
    ...shadow,
  };

  return (
    <View testID="Tooltip" style={hostStyle}>
      <View onLayout={handleTriggerLayout}>{trigger}</View>
      {mounted && triggerSize !== null ? (
        <Animated.View
          testID="Tooltip.popup"
          onLayout={handleBubbleLayout}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={bubbleStyle}
        >
          <Text
            size="sm"
            overrides={{
              color: 'color.inverse.foreground',
              fontFamily: overrides?.fontFamily,
              fontSize: overrides?.fontSize,
              lineHeight: overrides?.lineHeight,
            }}
          >
            {content}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
