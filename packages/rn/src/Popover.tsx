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
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import type { BottomSheetCloseReason, BottomSheetOverridableBinding } from './BottomSheet';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type PopoverPlacement = 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end' | 'start' | 'end';
export type PopoverHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;
/** Why `onOpenChange` fired. `tab-out` is part of the contract but never emitted on this platform (Pressable sees no key events). */
export type PopoverCloseReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** The style bindings a caller may replace with a different token; `surface`, `breakpoint`, `focusRing` and `focusRingWidth` are locked. */
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
  | 'enterDistance'
  | 'exit';

export interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. It is cloned with the toggle `onPress` and Button's `expanded`, so it is typed as a single element. */
  trigger: React.ReactElement;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: React.ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger's `accessibleName`, else its string `label`. */
  heading?: string | undefined;
  /** Heading level of the panel heading. React Native has no heading levels: this only selects the Heading's typography, and has no effect in the phone (BottomSheet) presentation. */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); the uncontrolled popover starts closed. */
  open?: boolean | undefined;
  /** Preferred side and alignment; flips and shifts to stay in the window. `start`/`end` mirror in right-to-left layouts. */
  placement?: PopoverPlacement | undefined;
  /** False (default): tapping outside closes. True: a small Dialog anchored to the trigger — focus trapped, a press outside does nothing, no scrim. No effect on phones, where the sheet is always modal. */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default. */
  showArrow?: boolean | undefined;
  /** Show the close button. Escape and (non-modal) an outside tap work regardless. No effect on phones, where the sheet always shows it. */
  dismissible?: boolean | undefined;
  /** Fired when the popover opens or closes, with the new state and a reason. */
  onOpenChange?: ((open: boolean, reason: PopoverCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
  /** The anchor view that holds the trigger. The `Modal` the panel lives in exposes no ref of its own. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/** The bindings Popover shares by name with BottomSheet, minus `layer`, which the sheet keeps unless the caller overrode it. */
type SheetBinding = Exclude<Extract<PopoverOverridableBinding, BottomSheetOverridableBinding>, 'layer'>;

/**
 * Popover's own default token for each shared binding. The sheet is given Popover's
 * resolved value — this default or the caller's override — rather than falling back to
 * BottomSheet's own defaults, so the phone presentation matches the anchored one.
 */
const SHEET_DEFAULTS: Readonly<Record<SheetBinding, TokenRef>> = {
  shadow: 'shadow.overlay',
  radius: 'radius.md',
  inset: 'layout.inset.md',
  partGap: 'layout.gap.normal',
  enter: 'motion.duration.fast',
  exit: 'motion.duration.fast',
};

const SHEET_BINDINGS: readonly SheetBinding[] = ['shadow', 'radius', 'inset', 'partGap', 'enter', 'exit'];

const SHEET_REASON: Record<BottomSheetCloseReason, PopoverCloseReason> = {
  escape: 'escape',
  'close-button': 'close-button',
  scrim: 'outside',
  drag: 'outside',
  // BottomSheet never raises `action` itself; the key exists only to complete the map.
  action: 'close-button',
};

// Closes that hand focus back to the trigger; an outside press leaves focus where it landed.
const RESTORE_REASONS: ReadonlySet<PopoverCloseReason> = new Set<PopoverCloseReason>(['trigger', 'escape', 'close-button']);

type Rect = { x: number; y: number; width: number; height: number };
type WindowSize = { width: number; height: number };
type PanelSize = { width: number; height: number };
type ArrowEdge = 'top' | 'bottom' | 'left' | 'right';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Places the panel from the trigger's window rect for `placement`: flips the main
 * axis when the preferred side overflows and shifts along the cross axis to stay in
 * the window. Returns the panel edge that faces the trigger (arrow and slide side).
 */
function computePopoverPosition(
  trigger: Rect,
  panelWidth: number,
  panelHeight: number,
  placement: PopoverPlacement,
  windowSize: WindowSize,
  offset: number,
): { top: number; left: number; edge: ArrowEdge } {
  const rtl = I18nManager.isRTL;

  if (placement === 'start' || placement === 'end') {
    let onLeft = rtl ? placement === 'end' : placement === 'start';
    const spaceLeft = trigger.x;
    const spaceRight = windowSize.width - (trigger.x + trigger.width);
    if (onLeft && spaceLeft < panelWidth + offset && spaceRight > spaceLeft) {
      onLeft = false;
    } else if (!onLeft && spaceRight < panelWidth + offset && spaceLeft > spaceRight) {
      onLeft = true;
    }
    const left = clamp(
      onLeft ? trigger.x - offset - panelWidth : trigger.x + trigger.width + offset,
      offset,
      windowSize.width - panelWidth - offset,
    );
    const top = clamp(trigger.y + trigger.height / 2 - panelHeight / 2, offset, windowSize.height - panelHeight - offset);
    return { top, left, edge: onLeft ? 'right' : 'left' };
  }

  const [side, align] = placement.split('-') as ['top' | 'bottom', 'start' | 'end' | undefined];
  let vertical = side;
  const spaceBelow = windowSize.height - (trigger.y + trigger.height);
  const spaceAbove = trigger.y;
  if (vertical === 'bottom' && spaceBelow < panelHeight + offset && spaceAbove > spaceBelow) {
    vertical = 'top';
  } else if (vertical === 'top' && spaceAbove < panelHeight + offset && spaceBelow > spaceAbove) {
    vertical = 'bottom';
  }

  let left: number;
  if (align === undefined) {
    left = trigger.x + trigger.width / 2 - panelWidth / 2;
  } else {
    const alignLeft = rtl ? align === 'end' : align === 'start';
    left = alignLeft ? trigger.x : trigger.x + trigger.width - panelWidth;
  }
  left = clamp(left, offset, windowSize.width - panelWidth - offset);

  const top = vertical === 'bottom' ? trigger.y + trigger.height + offset : trigger.y - offset - panelHeight;
  return { top, left, edge: vertical === 'bottom' ? 'top' : 'bottom' };
}

/**
 * Places the arrow on the panel edge facing the trigger and edges its two outer sides.
 *
 * The square is centered along that edge and its center sits on the centerline of the
 * panel's border — half `borderWidth` in from the outer edge — so the edged sides meet
 * the panel border and the fill covers the border under the base. Rotating the square
 * 45° clockwise sends its unrotated top side to the upper right, its right side to the
 * lower right, and so on, which is what picks the two sides bordered below.
 */
function arrowEdgeStyle(edge: ArrowEdge, arrowSize: number, borderWidth: number, panel: PanelSize | null): ViewStyle {
  // Before the panel is measured, assume an edge two arrows wide so the arrow is not off-centre by much.
  const along = (length: number | undefined): number => (length ?? arrowSize * 2) / 2 - arrowSize / 2;
  const across = borderWidth / 2 - arrowSize / 2;
  switch (edge) {
    case 'top':
      return { top: across, left: along(panel?.width), borderTopWidth: borderWidth, borderLeftWidth: borderWidth };
    case 'bottom':
      return { bottom: across, left: along(panel?.width), borderBottomWidth: borderWidth, borderRightWidth: borderWidth };
    case 'left':
      return { left: across, top: along(panel?.height), borderLeftWidth: borderWidth, borderBottomWidth: borderWidth };
    default:
      return { right: across, top: along(panel?.height), borderTopWidth: borderWidth, borderRightWidth: borderWidth };
  }
}

/**
 * Popover — a small panel that appears next to the thing you pressed and stays out of
 * the way of everything else: a date picker under a field, a filter panel, a help note
 * with a link. Unlike a Tooltip it can hold controls; unlike a Dialog it does not take
 * over the page.
 *
 * When to use: a compact interactive panel tied to a trigger; `modal` when the panel
 * holds a required step (a short form that must be submitted or cancelled); `heading`
 * when the content is not obvious from the trigger. Not for text-only hints (Tooltip),
 * lists of actions (Menu), options (Select/Combobox), or anything bigger than a small
 * panel (Dialog). Do not nest popovers.
 *
 * The trigger is cloned with the toggle `onPress` and Button's `expanded`, so the
 * state is announced. At or below `layout.maxWidth.prose` (phones) the panel is the
 * package's `BottomSheet` with `height="content"`, titled by `heading`, else the
 * trigger's `accessibleName`, else its string `label`; there it is always modal and
 * always shows its close button, and it is handed Popover's own shadow, radius, inset,
 * partGap, enter and exit tokens. Above the breakpoint (tablets, react-native-web) a
 * transparent `Modal` holds a full-screen transparent backdrop `Pressable` (no scrim,
 * even when `modal`) and a `role="dialog"` panel positioned from the trigger's
 * `measureInWindow()` rect, flipped and shifted to stay in the window. The panel
 * composes `FocusScope` (`trapped` when `modal`, `active` following `open`), `Heading`,
 * `Button` for the close control and `Box` for the body. It fades and slides
 * `enterDistance` from the trigger side over `enter` (motion.easing.standard) and fades
 * out over `exit` (motion.easing.exit); instantly under reduced motion.
 *
 * Dismissal: Escape (`onRequestClose`: Android back, Esc on react-native-web) always
 * closes; a backdrop tap closes when not `modal`; the close button when `dismissible`.
 * Closing by the trigger, Escape or the close button returns accessibility focus to the
 * trigger once `open` goes false; an outside tap does not. On open, focus lands on the
 * body wrapper — native has no descendant walker to find the first control.
 *
 * Acknowledged native limits: `Modal` intercepts every touch behind it, so non-modal
 * means only "tapping outside closes"; Pressable sees no key events, so Tab never
 * leaves the panel and `tab-out` is never reported; the panel is measured once per
 * open and does not follow a scrolling page; the arrow is centered on the panel edge.
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
  ref,
}: PopoverProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const windowSize = useWindowDimensions();
  const isPhoneWidth = windowSize.width <= t.layoutMaxWidthProse;

  const triggerRef = React.useRef<ViewInstance>(null);
  const bodyRef = React.useRef<ViewInstance>(null);
  const hasEnteredRef = React.useRef(false);
  const closeReasonRef = React.useRef<PopoverCloseReason | null>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const wasOpenRef = React.useRef(isOpen);

  const [mounted, setMounted] = React.useState(isOpen);
  const [triggerRect, setTriggerRect] = React.useState<Rect | null>(null);
  const [panelSize, setPanelSize] = React.useState<PanelSize | null>(null);
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
  const enterDistance = overrides?.enterDistance ? (resolveToken(t, overrides.enterDistance) as number) : t.space1;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  const surfaceColor = t.colorOverlaySurface;

  const triggerProps = trigger.props as {
    accessibleName?: unknown;
    label?: unknown;
    onPress?: ((...args: unknown[]) => void) | undefined;
  };
  const triggerName =
    typeof triggerProps.accessibleName === 'string'
      ? triggerProps.accessibleName
      : typeof triggerProps.label === 'string'
        ? triggerProps.label
        : undefined;
  const accessibleName = heading ?? triggerName;

  React.useEffect(() => {
    if (__DEV__ && accessibleName === undefined) {
      console.warn(
        'Popover: without `heading`, the trigger needs an `accessibleName` or a string `label` to name the panel; the panel has no accessible name.',
      );
    }
  }, [accessibleName]);

  const focusNode = React.useCallback((node: ViewInstance | null) => {
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  }, []);

  // Focus returns to the trigger as soon as `open` goes false (controlled or not), for the reasons that restore.
  React.useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      const reason = closeReasonRef.current;
      closeReasonRef.current = null;
      if (reason !== null && RESTORE_REASONS.has(reason)) focusNode(triggerRef.current);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, focusNode]);

  const changeOpen = (next: boolean, reason: PopoverCloseReason): void => {
    closeReasonRef.current = next ? null : reason;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next, reason);
  };

  const closePopover = (reason: PopoverCloseReason): void => {
    if (!isOpen) return;
    changeOpen(false, reason);
  };

  const handleTriggerPress = (...args: unknown[]): void => {
    triggerProps.onPress?.(...args);
    if (isOpen) closePopover('trigger');
    else changeOpen(true, 'trigger');
  };

  const handlePanelLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setPanelSize((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  // Mount on open; measure the trigger once per open.
  React.useEffect(() => {
    if (isPhoneWidth || !isOpen) {
      hasEnteredRef.current = false;
      return;
    }
    setMounted(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => setTriggerRect({ x, y, width, height }));
  }, [isOpen, isPhoneWidth]);

  // Enter once the trigger and panel sizes are known, then move focus in; exit on close.
  React.useEffect(() => {
    if (isPhoneWidth || !mounted) return undefined;
    if (isOpen) {
      if (triggerRect === null || panelSize === null || hasEnteredRef.current) return undefined;
      hasEnteredRef.current = true;
      if (reducedMotion) {
        progress.setValue(1);
        focusNode(bodyRef.current);
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
        if (finished) focusNode(bodyRef.current);
      });
      return () => animation.stop();
    }
    const unmount = (): void => {
      setMounted(false);
      setTriggerRect(null);
      setPanelSize(null);
    };
    if (reducedMotion) {
      progress.setValue(0);
      unmount();
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingExit),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) unmount();
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isPhoneWidth, mounted, triggerRect, panelSize, reducedMotion]);

  const clonedTrigger = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    onPress: handleTriggerPress,
    expanded: isOpen,
  });

  const triggerView = (
    // `collapsable={false}` keeps this View in the native tree on Android so measureInWindow stays reliable.
    <View ref={triggerRef} collapsable={false} testID="Popover.trigger">
      {clonedTrigger}
    </View>
  );

  if (isPhoneWidth) {
    // Popover's resolved value for every shared binding; `layer` alone is forwarded only
    // when overridden, so the sheet otherwise keeps its own `layer.sheet`.
    const sheetOverrides: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> = {};
    for (const binding of SHEET_BINDINGS) {
      sheetOverrides[binding] = overrides?.[binding] ?? SHEET_DEFAULTS[binding];
    }
    if (overrides?.layer !== undefined) sheetOverrides.layer = overrides.layer;
    return (
      <View ref={ref}>
        {triggerView}
        <BottomSheet
          open={isOpen}
          heading={accessibleName ?? ''}
          height="content"
          onClose={(reason) => closePopover(SHEET_REASON[reason])}
          overrides={sheetOverrides}
        >
          {children}
        </BottomSheet>
      </View>
    );
  }

  const position =
    triggerRect !== null
      ? computePopoverPosition(triggerRect, panelSize?.width ?? maxWidth, panelSize?.height ?? 0, placement, windowSize, offset)
      : null;
  const edge: ArrowEdge = position?.edge ?? 'top';

  const slideFrom = edge === 'top' || edge === 'left' ? -enterDistance : enterDistance;
  const slide = progress.interpolate({ inputRange: [0, 1], outputRange: [slideFrom, 0] });

  // Rendered transparent before it is measured, so its own size is known before it is placed.
  const panelStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    maxWidth,
    zIndex: layer,
    borderRadius: radius,
    ...shadow,
    opacity: progress,
    transform: edge === 'left' || edge === 'right' ? [{ translateX: slide }] : [{ translateY: slide }],
  };

  const surfaceStyle: ViewStyle = {
    borderRadius: radius,
    borderWidth,
    borderColor: border,
    backgroundColor: surfaceColor,
    padding: inset,
    gap: partGap,
    overflow: 'hidden',
  };

  // The heading fills the row and the close button sits at its inline end, with or without a heading.
  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: partGap,
  };

  const arrowStyle: ViewStyle = {
    position: 'absolute',
    width: arrowSize,
    height: arrowSize,
    backgroundColor: surfaceColor,
    borderColor: border,
    transform: [{ rotate: '45deg' }], // literal-ok: the diamond rotation, not a size
    ...arrowEdgeStyle(edge, arrowSize, borderWidth, panelSize),
  };

  return (
    <View ref={ref}>
      {triggerView}
      <Modal
        visible={mounted}
        transparent
        animationType="none"
        onRequestClose={() => closePopover('escape')}
        statusBarTranslucent
      >
        <View style={styles.host}>
          {/* Transparent in both modes: a modal popover has no scrim. */}
          <Pressable
            style={styles.backdrop}
            onPress={() => {
              if (!modal) closePopover('outside');
            }}
            accessible={false}
            testID="Popover.backdrop"
          />
          <FocusScope trapped={modal} active={isOpen} autoFocus="none" restoreFocus={false}>
            <Animated.View
              style={panelStyle}
              onLayout={handlePanelLayout}
              role="dialog"
              accessibilityLabel={accessibleName}
              accessibilityViewIsModal={modal}
              testID="Popover"
            >
              <View style={surfaceStyle}>
                {heading !== undefined || dismissible ? (
                  <View style={headerStyle}>
                    {heading !== undefined ? (
                      <View style={styles.heading} testID="Popover.heading">
                        <Heading level={headingLevel}>{heading}</Heading>
                      </View>
                    ) : null}
                    {dismissible ? (
                      <View testID="Popover.closeButton">
                        <Button
                          label={COPY.closeLabel}
                          variant="ghost"
                          size="sm"
                          iconOnly
                          leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                          onPress={() => closePopover('close-button')}
                        />
                      </View>
                    ) : null}
                  </View>
                ) : null}
                <View ref={bodyRef} testID="Popover.body">
                  <Box>{children}</Box>
                </View>
              </View>
              {/* After the surface, so the arrow's fill paints over the panel border beneath its base. */}
              {showArrow ? <View style={arrowStyle} testID="Popover.arrow" /> : null}
            </Animated.View>
          </FocusScope>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'transparent' },
  heading: { flex: 1 },
});
