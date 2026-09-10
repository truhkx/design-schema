import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  I18nManager,
  Modal,
  Pressable,
  StyleSheet,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type PopoverPlacement = 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end' | 'start' | 'end';
export type PopoverHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;
export type PopoverCloseReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type PopoverOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'offset'
  | 'arrowSize'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

export interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. */
  trigger: React.ReactNode;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling — the panel does not scroll on this platform. */
  children: React.ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel falls back to the trigger's own `label` when it has one. */
  heading?: string;
  /** Heading level of the panel heading, so it fits the page outline. RN has no native heading levels — this only controls the `Heading`'s default typographic size. */
  headingLevel?: PopoverHeadingLevel;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** Preferred side and alignment; flips and shifts to stay within the window. */
  placement?: PopoverPlacement;
  /** `false` (default): outside taps and Escape close the panel, focus moves in but is not trapped. `true`: behaves as a small Dialog anchored to the trigger — focus trapped, outside taps do nothing. */
  modal?: boolean;
  /** A small pointer toward the trigger. Off by default. */
  showArrow?: boolean;
  /** Show the close button. Escape and, when not `modal`, an outside tap still close the popover regardless. */
  dismissible?: boolean;
  /** Fired when the popover opens or closes, with the new state and the reason. */
  onOpenChange?: (open: boolean, reason: PopoverCloseReason) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef>>;
}

const COPY = {
  closeLabel: 'Close',
} as const;

type Rect = { x: number; y: number; width: number; height: number };
type WindowSize = { width: number; height: number };
type ArrowEdge = 'top' | 'bottom' | 'left' | 'right';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Positions the panel from the trigger's measured window rect for `placement`,
 * flipping the primary axis on overflow and shifting the cross axis to stay within
 * the window — the closest native equivalent of the web generator's flip/shift. Also
 * reports which panel edge faces the trigger, used for the optional arrow and for the
 * enter animation's slide direction.
 */
function computePopoverPosition(
  trigger: Rect,
  panelWidth: number,
  panelHeight: number,
  placement: PopoverPlacement,
  windowSize: WindowSize,
  offset: number,
): { top: number; left: number; arrowEdge: ArrowEdge } {
  const rtl = I18nManager.isRTL;

  if (placement === 'start' || placement === 'end') {
    let onPhysicalLeft = rtl ? placement === 'end' : placement === 'start';
    const spaceLeft = trigger.x;
    const spaceRight = windowSize.width - (trigger.x + trigger.width);
    if (onPhysicalLeft && spaceLeft < panelWidth + offset && spaceRight >= panelWidth + offset) {
      onPhysicalLeft = false;
    } else if (!onPhysicalLeft && spaceRight < panelWidth + offset && spaceLeft >= panelWidth + offset) {
      onPhysicalLeft = true;
    }
    const left = onPhysicalLeft ? trigger.x - offset - panelWidth : trigger.x + trigger.width + offset;
    const idealTop = trigger.y + trigger.height / 2 - panelHeight / 2;
    const top = clamp(idealTop, offset, windowSize.height - panelHeight - offset);
    return { top, left, arrowEdge: onPhysicalLeft ? 'right' : 'left' };
  }

  const [vertRaw, horiz] = placement.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined];
  let vertical = vertRaw;
  const spaceBelow = windowSize.height - (trigger.y + trigger.height);
  const spaceAbove = trigger.y;
  if (vertical === 'bottom' && spaceBelow < panelHeight + offset && spaceAbove > spaceBelow) {
    vertical = 'top';
  } else if (vertical === 'top' && spaceAbove < panelHeight + offset && spaceBelow > spaceAbove) {
    vertical = 'bottom';
  }

  let left: number;
  if (horiz === undefined) {
    left = trigger.x + trigger.width / 2 - panelWidth / 2;
  } else {
    const alignLeft = rtl ? horiz === 'end' : horiz === 'start';
    left = alignLeft ? trigger.x : trigger.x + trigger.width - panelWidth;
  }
  left = clamp(left, offset, windowSize.width - panelWidth - offset);

  const top = vertical === 'bottom' ? trigger.y + trigger.height + offset : trigger.y - offset - panelHeight;
  return { top, left, arrowEdge: vertical === 'bottom' ? 'top' : 'bottom' };
}

/**
 * Popover — a small interactive panel anchored to the control that opens it: a date
 * picker under a field, a color swatch, a compact filter panel. It stays out of the
 * way of everything else, unlike Dialog, and can hold controls, unlike Tooltip.
 *
 * When to use: Use for a compact panel tied to a trigger, and `modal` only when the
 * panel holds a required step (a short form that must be submitted or cancelled). Do
 * not use it for a text-only hint (Tooltip), a list of actions (Menu), or content that
 * needs more than a small panel's worth of room (Dialog).
 *
 * Tablets and react-native-web (the only configurations this generator targets, per
 * the schema's own native notes — phones want a `BottomSheet`, which does not exist
 * in this package yet, an acknowledged gap): renders the trigger cloned with an
 * `onPress` toggle, and, while open, a transparent `Modal` (`animationType="none"`,
 * self-animated) containing a full-screen backdrop `Pressable` and a panel `View`
 * absolutely positioned from the trigger's `measureInWindow()` rect, flipping and
 * shifting via `useWindowDimensions()`. The panel composes `FocusScope` (`trapped`
 * only when `modal`), `Heading` for `heading`, `Box` for the body, and `Button` for
 * the close button. `modal` tints the backdrop with `color.overlay.scrim`; non-modal
 * leaves it transparent, though — a native platform limit — the `Modal` still
 * intercepts every touch behind it, so "the page stays interactive" (the web
 * behavior) cannot be reproduced here, only "tapping outside closes it." Escape (the
 * Android back gesture, or `Esc` on react-native-web) always closes and returns focus
 * to the trigger, regardless of `dismissible`. Focus lands on the body wrapper once
 * the enter animation finishes (or immediately under reduced motion) — the same
 * "first focusable descendant" approximation `Dialog`'s `initialFocus` documents,
 * since native has no descendant walker to find a real first control or to detect
 * that the body has none, so the schema's heading fallback is unreachable here.
 *
 * Acknowledged native limits: `Button` does not forward unrecognized props (the same
 * limit `Menu`'s doc records), so the `accessibilityState.expanded` cloned onto a
 * `Button` trigger has no effect when the trigger is this package's own `Button`; the
 * panel's accessible name falls back to the trigger's `label` prop when present, an
 * approximation of the web generator's "aria-labelledby the trigger" since RN cannot
 * read arbitrary rendered text — a trigger that is not a `Button`-shaped element with
 * a string `label` and no `heading` will render with no accessible name for the
 * panel, a dev-mode warning. Tab / Shift+Tab (`tab-out`) has no native key-event API
 * on `Pressable` and is not implemented; the modal Tab-wrap is inherited from
 * `FocusScope`'s own documented native limit (no Tab order to confine). The arrow is
 * centered on the panel's measured edge, not re-aligned to the trigger's center when
 * the panel has been shifted to stay on-screen.
 */
export function Popover({
  trigger,
  children,
  heading,
  headingLevel = '3',
  open,
  placement = 'bottom',
  modal = false,
  showArrow = false,
  dismissible = true,
  onOpenChange,
  overrides,
}: PopoverProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const windowSize = useWindowDimensions();

  const triggerRef = React.useRef<View>(null);
  const bodyRef = React.useRef<View>(null);
  const hasFocusedInitialRef = React.useRef(false);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  const [mounted, setMounted] = React.useState(isOpen);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [panelSize, setPanelSize] = React.useState<{ width: number; height: number } | null>(null);
  const progress = React.useRef(new Animated.Value(0)).current;

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetMd;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapNormal;
  const offset = overrides?.offset ? (resolveToken(t, overrides.offset) as number) : t.space2;
  const arrowSize = overrides?.arrowSize ? (resolveToken(t, overrides.arrowSize) as number) : t.space2;
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.layoutMaxWidthProse;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDropdown;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationFast;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const surfaceColor = t.colorOverlaySurface;
  const scrimColor = t.colorOverlayScrim;

  const isTriggerElement = React.isValidElement(trigger);
  const triggerChild = isTriggerElement ? (trigger as React.ReactElement<Record<string, unknown>>) : null;
  const triggerChildProps = triggerChild?.props ?? {};
  const triggerLabel = typeof triggerChildProps.label === 'string' ? (triggerChildProps.label as string) : undefined;
  const accessibleName = heading ?? triggerLabel;

  React.useEffect(() => {
    if (__DEV__ && !isTriggerElement) {
      console.warn('Popover: `trigger` must be exactly one focusable element (usually a Button).');
    }
  }, [isTriggerElement]);

  React.useEffect(() => {
    if (__DEV__ && accessibleName === undefined) {
      console.warn('Popover: no `heading` and the trigger has no string `label` to fall back to; the panel needs an accessible name.');
    }
  }, [accessibleName]);

  const focusTrigger = React.useCallback(() => {
    const handle = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
    if (handle !== null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, []);

  const focusBody = React.useCallback(() => {
    const handle = bodyRef.current ? findNodeHandle(bodyRef.current) : null;
    if (handle !== null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, []);

  const changeOpen = (next: boolean, reason: PopoverCloseReason): void => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next, reason);
  };

  const closePopover = (reason: PopoverCloseReason): void => {
    if (!isOpen) {
      return;
    }
    changeOpen(false, reason);
    focusTrigger();
  };

  const handleTriggerPress = (): void => {
    if (isOpen) {
      closePopover('trigger');
      return;
    }
    changeOpen(true, 'trigger');
  };

  const handleRequestClose = (): void => {
    closePopover('escape');
  };

  const handleBackdropPress = (): void => {
    if (modal) {
      return;
    }
    closePopover('outside');
  };

  const handleCloseButtonPress = (): void => {
    closePopover('close-button');
  };

  const handlePanelLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setPanelSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  // Measure the trigger the moment the popover opens; reset everything the moment it closes.
  React.useEffect(() => {
    if (!isOpen) {
      hasFocusedInitialRef.current = false;
      setTriggerRect(null);
      setPanelSize(null);
      return;
    }
    const node = triggerRef.current;
    node?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
  }, [isOpen]);

  const position =
    triggerRect !== null
      ? computePopoverPosition(
          triggerRect,
          panelSize?.width ?? maxWidth,
          panelSize?.height ?? 0,
          placement,
          windowSize,
          offset,
        )
      : null;

  // Fade and slide in from the trigger side once the trigger and the panel's own size
  // are both known, then move accessibility focus into the panel; snap under reduced
  // motion instead of animating. Runs the fade/exit out on close.
  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (isOpen) {
      if (position === null || panelSize === null || hasFocusedInitialRef.current) {
        return undefined;
      }
      hasFocusedInitialRef.current = true;
      if (reducedMotion) {
        progress.setValue(1);
        focusBody();
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start(({ finished }) => {
        if (finished) {
          focusBody();
        }
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mounted, position, panelSize, reducedMotion]);

  const clonedTrigger =
    triggerChild !== null
      ? React.cloneElement(triggerChild, {
          onPress: (event: unknown) => {
            (triggerChildProps.onPress as ((e: unknown) => void) | undefined)?.(event);
            handleTriggerPress();
          },
          // No-op on this package's own Button/Link, which do not forward unrecognized
          // props (see `Menu`'s doc); kept for a trigger that does forward extra props.
          accessibilityState: { expanded: isOpen },
        })
      : trigger;

  const hostStyle: ViewStyle = { flex: 1 };

  const backdropStyle: ViewStyle = {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: modal ? scrimColor : 'transparent',
  };

  const slideDistance = t.space1;
  const translateAxis: 'translateX' | 'translateY' =
    position?.arrowEdge === 'left' || position?.arrowEdge === 'right' ? 'translateX' : 'translateY';
  const slideFrom = (() => {
    switch (position?.arrowEdge) {
      case 'top':
        return -slideDistance;
      case 'bottom':
        return slideDistance;
      case 'left':
        return -slideDistance;
      case 'right':
        return slideDistance;
      default:
        return 0;
    }
  })();

  const slideInterpolation = progress.interpolate({ inputRange: [0, 1], outputRange: [slideFrom, 0] });

  const panelOuterStyle: Animated.WithAnimatedObject<ViewStyle> = {
    position: 'absolute',
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    maxWidth,
    borderRadius: radius,
    zIndex: layer,
    opacity: progress,
    // `overflow: 'hidden'` lives on the inner box so it can clip content to the
    // radius/border without also clipping this view's own shadow.
    ...shadow,
    transform:
      translateAxis === 'translateX' ? [{ translateX: slideInterpolation }] : [{ translateY: slideInterpolation }],
  };

  const panelInnerStyle: ViewStyle = {
    borderRadius: radius,
    borderWidth,
    borderColor: border,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
  };

  const contentStyle: ViewStyle = { gap: partGap };

  const showHeader = heading !== undefined || dismissible;

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    // Not `partGap`: that binding is specifically "between heading and body" per the
    // schema, not the internal heading/close-button gap, which has no binding of its own.
    gap: t.layoutGapNormal,
    paddingHorizontal: inset,
    paddingTop: inset,
  };

  const headingWrapStyle: ViewStyle = { flexShrink: 1 };

  const arrowPosition: ViewStyle = (() => {
    const size = arrowSize;
    switch (position?.arrowEdge) {
      case 'top':
        return { top: -size / 2, left: (panelSize?.width ?? size * 2) / 2 - size / 2 };
      case 'bottom':
        return { bottom: -size / 2, left: (panelSize?.width ?? size * 2) / 2 - size / 2 };
      case 'left':
        return { left: -size / 2, top: (panelSize?.height ?? size * 2) / 2 - size / 2 };
      case 'right':
      default:
        return { right: -size / 2, top: (panelSize?.height ?? size * 2) / 2 - size / 2 };
    }
  })();

  const arrowStyle: ViewStyle = {
    position: 'absolute',
    width: arrowSize,
    height: arrowSize,
    backgroundColor: surfaceColor,
    borderWidth,
    borderColor: border,
    transform: [{ rotate: '45deg' }], // literal-ok: fixed diamond rotation, not a size/color value
    ...arrowPosition,
  };

  return (
    <View testID="Popover">
      {/* `collapsable={false}` keeps this View in the native tree on Android so measureInWindow stays reliable. */}
      <View ref={triggerRef} collapsable={false}>
        {clonedTrigger}
      </View>
      <Modal visible={mounted} transparent animationType="none" onRequestClose={handleRequestClose} statusBarTranslucent>
        <View style={hostStyle}>
          <Pressable style={backdropStyle} onPress={handleBackdropPress} accessible={false} testID="Popover.backdrop" />
          {position !== null ? (
            <FocusScope trapped={modal} active={mounted} autoFocus="none" restoreFocus={false}>
              <Animated.View
                style={panelOuterStyle}
                onLayout={handlePanelLayout}
                accessibilityViewIsModal={modal}
                accessibilityLabel={accessibleName}
                testID="Popover.panel"
              >
                {showArrow ? <View style={arrowStyle} testID="Popover.arrow" /> : null}
                <View style={panelInnerStyle}>
                  <View style={contentStyle}>
                    {showHeader ? (
                      <View style={headerStyle} testID="Popover.header">
                        <View style={headingWrapStyle}>
                          {heading !== undefined ? <Heading level={headingLevel}>{heading}</Heading> : null}
                        </View>
                        {dismissible ? (
                          <Button
                            label={COPY.closeLabel}
                            variant="ghost"
                            size="sm"
                            iconOnly
                            leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                            onPress={handleCloseButtonPress}
                          />
                        ) : null}
                      </View>
                    ) : null}
                    <View ref={bodyRef} testID="Popover.body">
                      <Box
                        inset="md"
                        overrides={overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined}
                      >
                        {children}
                      </Box>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </FocusScope>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}
