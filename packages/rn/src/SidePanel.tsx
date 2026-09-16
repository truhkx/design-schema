import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  I18nManager,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  findNodeHandle,
  useWindowDimensions, type PanResponderInstance,
} from 'react-native';
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type SidePanelSide = 'start' | 'end';
export type SidePanelWidth = 'narrow' | 'default' | 'wide';
export type SidePanelPersistent = 'never' | 'content' | 'page';
export type SidePanelRole = 'complementary' | 'navigation';
/** Why `onOpenChange` fired. `action` and `navigation` are never emitted by SidePanel itself — they exist for a consumer whose footer action, or a followed Link inside the body, wants to report a close through the same callback (native has no client-router hook to detect a followed Link, unlike the web generator). */
export type SidePanelCloseReason = 'trigger' | 'escape' | 'close-button' | 'scrim' | 'swipe' | 'action' | 'navigation';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SidePanelOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'border'
  | 'borderWidth'
  | 'width'
  | 'widthNarrow'
  | 'widthWide'
  | 'edgeGutter'
  | 'inset'
  | 'headerGap'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

export interface SidePanelProps {
  /** The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon). It is the APG disclosure button: pressing it again closes the panel. Omit to control `open` from elsewhere (a Toolbar); hidden entirely once `persistent` takes over. */
  trigger?: React.ReactNode | undefined;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). Ignored once `persistent` takes over — the panel is then always present. */
  open?: boolean | undefined;
  /** The panel's title and accessible name. May be visually hidden with `hideHeading`. */
  heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the panel when taller than the viewport. */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: React.ReactNode | undefined;
  /** The physical edge the panel slides from, flipped by `I18nManager.isRTL`. */
  side?: SidePanelSide | undefined;
  /** Panel width: `narrow` for a list of links, `wide` for a form or detail. Clamped to the viewport minus `edgeGutter` on narrow screens. */
  width?: SidePanelWidth | undefined;
  /** Above the chosen breakpoint the panel renders as a fixed sidebar beside the content instead of an overlay: always visible regardless of `open`, no scrim, no trap, trigger hidden. `content` switches at `layout.maxWidth.content`, `page` at `layout.maxWidth.page`. */
  persistent?: SidePanelPersistent | undefined;
  /** The landmark role the panel exposes as a persistent sidebar: `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. Native has no `<aside>`/landmark equivalent for the overlay surface, so this reaches only the persistent sidebar's `role`. */
  role?: SidePanelRole | undefined;
  /** `false` (default, the disclosure pattern): focus stays on the trigger when it opens, the panel is not trapped. `true`: a modal Dialog at the edge — focus moves in and is trapped, always shows a scrim. */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too. Modal always has one regardless of this prop. */
  scrim?: boolean | undefined;
  /** Escape, the close button, a scrim tap and the swipe gesture all request close. When false, the close button is not rendered and taps outside and swipes do nothing; Escape (the Android back button) still reports through `onOpenChange` with reason `escape` — the consumer decides. */
  dismissible?: boolean | undefined;
  /** A swipe on the header (not the close button) toward the edge dismisses the panel. Purely additive: the trigger and close button always exist. Edge-swipe-to-open is not automatic — see `useSidePanelEdgeSwipe`, which needs a controlled `open`. */
  swipeable?: boolean | undefined;
  /** Fired when the panel opens or closes, with the new state and a reason. */
  onOpenChange?: ((open: boolean, reason: SidePanelCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

const DRAG_DISMISS_RATIO = 0.25; // literal-ok: fraction of panel width past which a swipe dismisses, matching BottomSheet's vertical convention
const DRAG_DISMISS_VELOCITY = 1.5; // literal-ok: release velocity (px/ms) past which a swipe dismisses regardless of distance
const DRAG_SLOP = 4; // literal-ok: horizontal travel (px) before a touch counts as a swipe rather than a tap
const DECAY_MIN_VELOCITY = 0.5; // literal-ok: floor (px/ms) for the swipe-dismiss continuation
const DECAY_DECELERATION = 0.998; // literal-ok: Animated.decay's own default rate

/**
 * SidePanel — the drawer: hidden off the edge until the trigger asks for it, then
 * sliding in beside the page. Non-modal by default (the APG disclosure pattern:
 * focus stays on the trigger, the page stays live); `modal` turns it into a Dialog
 * at the edge for a panel that must be finished or dismissed. Above `persistent`'s
 * breakpoint it stops being an overlay and becomes a fixed sidebar.
 *
 * When to use: primary navigation on phones (`start` edge), filters, a cart or
 * detail panel (`end` edge), a settings drawer. Set `persistent: content` when the
 * same panel should become the permanent desktop sidebar. Do not use it for a short
 * list of actions (Menu/ActionSheet), a small task (Dialog/BottomSheet), or content
 * that is the page's point. Do not stack side panels.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * backdrop `Pressable` — tinted with `color.overlay.scrim` when `modal` or `scrim`,
 * transparent otherwise, though the `Modal` still intercepts every touch behind it on
 * this platform, the same native limit `Popover` documents for its own non-modal
 * mode — and an `Animated.View` surface anchored to `side` (`I18nManager.isRTL`
 * flips it), sliding in on open (skipped under reduced motion). The surface composes
 * `FocusScope` (`trapped={modal}`, `autoFocus={modal ? 'first' : 'none'}`), `Heading`
 * (level 2, hidden with `hideHeading`) for the heading, `Button` for the close control,
 * `Box` for the scrollable body and `Stack` for the footer row — never restyled
 * directly. A `PanResponder` on the header (touches that start on the close button
 * are excluded — there is no handle part) tracks a drag toward the edge the panel
 * came from and moves the whole surface; past 25% of its measured width or a fast
 * flick, it fires `onOpenChange` with reason `swipe` and continues the motion
 * off-screen with `Animated.decay` at the release velocity (instant under reduced
 * motion); otherwise it settles back. The gesture is additive — the trigger and the
 * close button always exist. With `dismissible` false the close button is not
 * rendered and the scrim tap and swipe do nothing, but `onRequestClose` (the Android
 * back button, native's Escape) still reports `onOpenChange(false, 'escape')`, as in
 * `Dialog`: a controlled consumer decides, and an uncontrolled panel stays open. The
 * trigger is cloned with the toggle `onPress` and Button's `expanded`. `width`'s tokens
 * are clamped to the viewport minus `edgeGutter` so a phone-width panel always
 * leaves a strip of scrim visible. Above the `persistent` breakpoint
 * (`useWindowDimensions` against the chosen `layout.maxWidth.*` token) the panel
 * renders instead as a plain `View` (native `role` set from the `role` prop,
 * labelled by `heading`) with a border on the edge facing the content, always
 * visible regardless of `open`, with the trigger unrendered — the mirror of the web
 * generator's fixed sidebar. Edge-swipe-to-open is not implemented inside the
 * component (it needs a gesture on the screen root, not the panel itself);
 * `useSidePanelEdgeSwipe` is exported for a consumer to wire onto their own root
 * view.
 *
 * Acknowledged native limits: `role` reaches only the persistent sidebar — the
 * overlay surface has no `<aside>`/landmark equivalent on native, so its region role
 * is not exposed while disclosed or modal; there is no page-scroll lock or `inert`
 * background — the same limit `Dialog` and `BottomSheet` document, since there is no
 * page scroll for a modal window to suppress; the modal Tab-wrap and non-modal "Tab
 * flows into the panel" behavior have no native key-event equivalent, the same limit
 * `FocusScope` itself documents; a followed `Link` inside the body cannot close the
 * panel on its own (no client router to observe), so `navigation` is never emitted
 * by this component, only reserved on the type for parity with the web/Lit docs.
 */
export function SidePanel({
  trigger,
  open,
  heading,
  hideHeading = false,
  children,
  footer,
  side = 'start',
  width = 'default',
  persistent = 'never',
  role = 'complementary',
  modal = false,
  scrim = true,
  dismissible = true,
  swipeable = true,
  onOpenChange,
  overrides,
}: SidePanelProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const triggerRef = React.useRef<ViewInstance>(null);
  const surfaceWidthRef = React.useRef(0);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  const [mounted, setMounted] = React.useState(isOpen);
  const progress = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const dragX = React.useRef(new Animated.Value(0)).current;

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const widthDefault = overrides?.width ? (resolveToken(t, overrides.width) as number) : t.layoutMaxWidthProse;
  const widthNarrow = overrides?.widthNarrow ? (resolveToken(t, overrides.widthNarrow) as number) : t.space20 * 3; // literal-ok: schema-specified multiplier (space.20 × 3)
  const widthWide = overrides?.widthWide ? (resolveToken(t, overrides.widthWide) as number) : t.layoutMaxWidthContent;
  const edgeGutter = overrides?.edgeGutter ? (resolveToken(t, overrides.edgeGutter) as number) : t.space12;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const persistentBreakpoint =
    persistent === 'content' ? t.layoutMaxWidthContent : persistent === 'page' ? t.layoutMaxWidthPage : null;
  const isPersistentActive = persistentBreakpoint !== null && windowWidth >= persistentBreakpoint;

  const rtl = I18nManager.isRTL;
  const isPhysicalLeft = rtl ? side === 'end' : side === 'start';
  const showScrim = modal || scrim;

  const widthToken = width === 'narrow' ? widthNarrow : width === 'wide' ? widthWide : widthDefault;
  const overlayPanelWidth = Math.min(widthToken, windowWidth - edgeGutter);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  React.useEffect(() => {
    // The persistent sidebar has no overlay/animation lifecycle of its own.
    if (isPersistentActive || !mounted) {
      return undefined;
    }
    if (isOpen) {
      dragX.setValue(0);
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
      easing: toEasing(t.motionEasingExit),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });
    return () => animation.stop();
    // Reacts to the open/closed transition and the mount gate it drives; the
    // animation's own config is read fresh each run rather than tracked as a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mounted, reducedMotion, isPersistentActive]);

  React.useEffect(() => {
    if (__DEV__ && footer === undefined && !dismissible) {
      console.warn('SidePanel: with no footer and dismissible={false}, provide a way to close the panel in its body.');
    }
  }, [footer, dismissible]);

  React.useEffect(() => {
    if (__DEV__ && trigger === undefined && !isControlled) {
      console.warn(
        'SidePanel: no `trigger` and no `open` — the panel has no way to open. Pass `open` and control it from elsewhere (a Toolbar), or provide a `trigger`.',
      );
    }
  }, [trigger, isControlled]);

  const focusTrigger = React.useCallback(() => {
    const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const changeOpen = (next: boolean, reason: SidePanelCloseReason): void => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next, reason);
  };

  const requestClose = (reason: SidePanelCloseReason): void => {
    if (!isOpen) {
      return;
    }
    changeOpen(false, reason);
    focusTrigger();
  };

  const handleTriggerPress = (): void => {
    if (isOpen) {
      requestClose('trigger');
      return;
    }
    changeOpen(true, 'trigger');
  };

  // The memoized pan responder reads the latest close handler, not the one from its first render.
  const requestCloseRef = React.useRef(requestClose);
  requestCloseRef.current = requestClose;

  const handleScrimPress = (): void => {
    if (dismissible) {
      requestClose('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    requestClose('close-button');
  };

  const handleRequestClose = (): void => {
    if (!isOpen) {
      return;
    }
    if (dismissible) {
      requestClose('escape');
      return;
    }
    // Non-dismissible: report only; the consumer decides whether `open` flips.
    onOpenChange?.(false, 'escape');
  };

  // Set when a touch starts on the close button so the header's swipe ignores it;
  // cleared when that touch ends on the header.
  const closeTouchRef = React.useRef(false);
  const handleCloseTouchStart = (): void => {
    closeTouchRef.current = true;
  };
  const handleHeaderTouchEnd = (): void => {
    closeTouchRef.current = false;
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceWidthRef.current = event.nativeEvent.layout.width;
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!swipeable || !dismissible || closeTouchRef.current) {
            return false;
          }
          const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
          return awayDx > DRAG_SLOP && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderMove: (_, gestureState) => {
          const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
          if (awayDx > 0) {
            dragX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
          const awayVx = isPhysicalLeft ? -gestureState.vx : gestureState.vx;
          const threshold = (surfaceWidthRef.current || overlayPanelWidth) * DRAG_DISMISS_RATIO;
          const shouldDismiss = awayDx > threshold || awayVx > DRAG_DISMISS_VELOCITY;
          if (shouldDismiss) {
            requestCloseRef.current('swipe');
            if (reducedMotion) {
              dragX.setValue(isPhysicalLeft ? -windowWidth : windowWidth);
            } else {
              const speed = Math.max(awayVx, DECAY_MIN_VELOCITY);
              Animated.decay(dragX, {
                velocity: isPhysicalLeft ? -speed : speed,
                deceleration: DECAY_DECELERATION,
                useNativeDriver: false,
              }).start();
            }
            return;
          }
          if (reducedMotion) {
            dragX.setValue(0);
            return;
          }
          Animated.timing(dragX, {
            toValue: 0,
            duration: exitDuration,
            easing: toEasing(t.motionEasingStandard),
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: () => {
          if (reducedMotion) {
            dragX.setValue(0);
            return;
          }
          Animated.timing(dragX, {
            toValue: 0,
            duration: exitDuration,
            easing: toEasing(t.motionEasingStandard),
            useNativeDriver: false,
          }).start();
        },
      }),
    [swipeable, dismissible, isPhysicalLeft, dragX, windowWidth, overlayPanelWidth, reducedMotion, exitDuration, t.motionEasingStandard],
  );

  const isTriggerElement = React.isValidElement(trigger);
  const triggerChild = isTriggerElement ? (trigger as React.ReactElement<Record<string, unknown>>) : null;
  const triggerChildProps = triggerChild?.props ?? {};

  React.useEffect(() => {
    if (__DEV__ && trigger !== undefined && !isTriggerElement) {
      console.warn('SidePanel: `trigger` must be exactly one focusable element (usually a Button).');
    }
  }, [trigger, isTriggerElement]);

  const clonedTrigger =
    triggerChild !== null
      ? React.cloneElement(triggerChild, {
          onPress: (event: unknown) => {
            (triggerChildProps.onPress as ((e: unknown) => void) | undefined)?.(event);
            handleTriggerPress();
          },
          // Button reflects this to accessibilityState.expanded (the disclosure state).
          expanded: isOpen,
        })
      : trigger;

  if (isPersistentActive) {
    const sidebarStyle: ViewStyle = {
      width: widthToken,
      height: '100%',
      backgroundColor: surfaceColor,
      gap: partGap,
      ...(isPhysicalLeft
        ? { borderRightWidth: borderWidth, borderRightColor: borderColor }
        : { borderLeftWidth: borderWidth, borderLeftColor: borderColor }),
    };
    const headerStyle: ViewStyle = {
      paddingHorizontal: inset,
      paddingTop: inset,
    };
    const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
    const bodyContentStyle: ViewStyle = { flexGrow: 1 };
    const footerStyle: ViewStyle = {
      paddingHorizontal: inset,
      paddingBottom: inset,
    };

    return (
      <View style={sidebarStyle} role={role} accessibilityLabel={heading} testID="SidePanel">
        {!hideHeading ? (
          <View style={headerStyle} testID="SidePanel.header">
            <Heading level={2}>{heading}</Heading>
          </View>
        ) : null}
        <ScrollView testID="SidePanel.body" style={bodyFlexStyle} contentContainerStyle={bodyContentStyle}>
          <Box inset="lg" overrides={overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined}>
            {children}
          </Box>
        </ScrollView>
        {footer !== undefined ? (
          <SafeAreaView style={footerStyle} testID="SidePanel.footer">
            <Stack
              direction="horizontal"
              gap="tight"
              justify="end"
              overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
            >
              {footer}
            </Stack>
          </SafeAreaView>
        ) : null}
      </View>
    );
  }

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: showScrim ? progress : 0,
  };

  const anchorStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    justifyContent: isPhysicalLeft ? 'flex-start' : 'flex-end',
    zIndex: layer,
  };

  const entryTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [isPhysicalLeft ? -overlayPanelWidth : overlayPanelWidth, 0],
  });

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: overlayPanelWidth,
    height: '100%',
    ...shadow,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
    gap: partGap,
    transform: [{ translateX: Animated.add(entryTranslateX, dragX) }],
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: headerGap,
    paddingHorizontal: inset,
    paddingTop: inset,
  };

  const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingBottom: inset,
  };

  return (
    <View testID="SidePanel">
      {trigger !== undefined ? (
        <View ref={triggerRef} collapsable={false} testID="SidePanel.trigger">
          {clonedTrigger}
        </View>
      ) : null}
      <Modal visible={mounted} transparent onRequestClose={handleRequestClose} statusBarTranslucent>
        <View style={hostStyle}>
          <Animated.View style={scrimStyle} />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleScrimPress}
            accessible={false}
            testID="SidePanel.scrim"
          />
          <View style={anchorStyle} pointerEvents="box-none">
            <FocusScope trapped={modal} active={mounted} autoFocus={modal ? 'first' : 'none'} restoreFocus={false}>
              <Animated.View
                style={surfaceStyle}
                onLayout={handleSurfaceLayout}
                accessibilityViewIsModal={modal}
                accessibilityLabel={heading}
                testID="SidePanel.surface"
              >
                <View
                  {...(swipeable && dismissible ? panResponder.panHandlers : null)}
                  onTouchEnd={handleHeaderTouchEnd}
                  onTouchCancel={handleHeaderTouchEnd}
                  style={headerStyle}
                  testID="SidePanel.header"
                >
                  {!hideHeading ? <Heading level={2}>{heading}</Heading> : null}
                  {dismissible ? (
                    <View onTouchStart={handleCloseTouchStart} testID="SidePanel.closeButton">
                      <Button
                        label={COPY.closeLabel}
                        variant="ghost"
                        size="sm"
                        iconOnly
                        leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                        onPress={handleCloseButtonPress}
                      />
                    </View>
                  ) : null}
                </View>
                <ScrollView
                  testID="SidePanel.body"
                  style={bodyFlexStyle}
                  contentContainerStyle={bodyContentStyle}
                  keyboardShouldPersistTaps="handled"
                >
                  <Box
                    inset="lg"
                    overrides={overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined}
                  >
                    {children}
                  </Box>
                </ScrollView>
                {footer !== undefined ? (
                  <SafeAreaView style={footerStyle} testID="SidePanel.footer">
                    <Stack
                      direction="horizontal"
                      gap="tight"
                      justify="end"
                      overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
                    >
                      {footer}
                    </Stack>
                  </SafeAreaView>
                ) : null}
              </Animated.View>
            </FocusScope>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export interface UseSidePanelEdgeSwipeOptions {
  /** Must match the SidePanel's own `side`; the hook flips it for RTL the same way. */
  side?: SidePanelSide | undefined;
  /** Turn the gesture off, e.g. while the panel is already open. */
  enabled?: boolean | undefined;
  /** Fired when an edge swipe crosses the open threshold. The consumer sets its own `open` state — this hook has no knowledge of the panel it opens. */
  onOpen: () => void;
}

/**
 * A `PanResponder` for the screen root that opens a `SidePanel` on an edge swipe —
 * additive to the trigger and never the only way in (WCAG 2.5.1). Not part of
 * `SidePanel` itself: the gesture has to start from the edge of the whole screen,
 * outside the panel's own (unmounted-when-closed) surface, so the schema asks for a
 * hook the consumer wires onto their own root view rather than an automatic behavior
 * `SidePanel` could silently opt every screen into.
 */
export function useSidePanelEdgeSwipe({ side = 'start', enabled = true, onOpen }: UseSidePanelEdgeSwipeOptions): { panHandlers: PanResponderInstance['panHandlers']; } {
  const { tokens: t } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const rtl = I18nManager.isRTL;
  const isPhysicalLeft = rtl ? side === 'end' : side === 'start';
  // No token names the zone a swipe must start within; the comfortable target size is
  // the closest existing token to "a thumb's-width strip at the edge."
  const edgeZone = t.sizeTargetComfortable;

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => {
          if (!enabled) {
            return false;
          }
          return isPhysicalLeft ? gestureState.x0 <= edgeZone : gestureState.x0 >= windowWidth - edgeZone;
        },
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!enabled) {
            return false;
          }
          const inwardDx = isPhysicalLeft ? gestureState.dx : -gestureState.dx;
          return inwardDx > 4 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
          const inwardDx = isPhysicalLeft ? gestureState.dx : -gestureState.dx;
          if (inwardDx > edgeZone / 2) {
            onOpen();
          }
        },
      }),
    [enabled, isPhysicalLeft, windowWidth, edgeZone, onOpen],
  );

  return { panHandlers: panResponder.panHandlers };
}
