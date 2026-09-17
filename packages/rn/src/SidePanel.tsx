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
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent, PanResponderInstance, ViewInstance, ViewStyle } from 'react-native';
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
/**
 * Why `onOpenChange` fired. On React Native SidePanel itself raises only `trigger`,
 * `escape` (the Android back button), `close-button`, `scrim` and `swipe`: `outside`
 * never happens (an outside tap lands on the full-screen scrim Pressable, transparent
 * when `scrim` is false, and is `scrim`), `navigation` has no router hook to observe,
 * and `action` exists for a consumer's own footer handler reusing this callback.
 */
export type SidePanelCloseReason =
  | 'trigger'
  | 'escape'
  | 'close-button'
  | 'scrim'
  | 'outside'
  | 'swipe'
  | 'action'
  | 'navigation';

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
  /** The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label like "Menu"). It stays a toggle — pressing it again closes — and carries `expanded`. Omit to control `open` from elsewhere (a Toolbar). Not rendered once `persistent` takes over. */
  trigger?: React.ReactNode | undefined;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel always starts closed, so a panel that must start open is controlled. */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). */
  heading: string;
  /** Keep the title for assistive technology (the surface's `accessibilityLabel`) but do not show it. When the header would then be empty, it is not rendered. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the overlay panel when taller than the viewport. */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: React.ReactNode | undefined;
  /** The edge the panel slides from: `start` is left in left-to-right layouts, right under `I18nManager.isRTL`. */
  side?: SidePanelSide | undefined;
  /** Panel width: `narrow` for a list of links, `wide` for a form or a detail. On phones the panel is the window width minus `edgeGutter`. */
  width?: SidePanelWidth | undefined;
  /** Above this window width the panel is a fixed sidebar instead of an overlay: always visible, no scrim, no trap, no close button, trigger hidden. `content` switches at `layout.maxWidth.content`, `page` at `layout.maxWidth.page`; a width exactly at the token is still the overlay. */
  persistent?: SidePanelPersistent | undefined;
  /** The role the persistent sidebar carries: `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. The overlay presentations expose no region role, only their label. */
  role?: SidePanelRole | undefined;
  /** `false` (default, the disclosure pattern): focus stays on the trigger when it opens. `true`: a modal panel — always a scrim, screen readers confined with `accessibilityViewIsModal`. */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too (modal always has one). */
  scrim?: boolean | undefined;
  /** The back button (Escape), the close button, a scrim tap and the swipe all request close. When false, the close button is not rendered and the scrim tap and swipe do nothing; the back button still reports `onOpenChange(false, 'escape')` without closing an uncontrolled panel. */
  dismissible?: boolean | undefined;
  /** A swipe on the header (not the close button) toward the edge dismisses. Purely additive. Edge-swipe-to-open is `useSidePanelEdgeSwipe`, which needs a controlled `open`. */
  swipeable?: boolean | undefined;
  /** Fired after the panel opens or closes, with the new state and a reason. */
  onOpenChange?: ((open: boolean, reason: SidePanelCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
  /** The positioned surface: the sliding panel view in overlay mode, the sidebar view when persistent. Null while the overlay is closed. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

const DRAG_DISMISS_RATIO = 0.25; // literal-ok: fraction of panel width past which a swipe dismisses
const DRAG_DISMISS_VELOCITY = 1.5; // literal-ok: release velocity (px/ms) past which a swipe dismisses regardless of distance
const DRAG_SLOP = 4; // literal-ok: horizontal travel (px) before a touch counts as a swipe rather than a tap
const DECAY_MIN_VELOCITY = 0.5; // literal-ok: floor (px/ms) for the swipe-dismiss continuation
const DECAY_DECELERATION = 0.998; // literal-ok: Animated.decay's own default rate

/**
 * SidePanel — the drawer: hidden off the edge until the trigger asks for it, then
 * sliding in beside the page. Non-modal by default (the APG disclosure pattern);
 * `modal` makes it a modal panel at the edge. Above `persistent`'s breakpoint it
 * stops being an overlay and becomes a sidebar.
 *
 * When to use: primary navigation on phones (`start`), filters, a cart or a detail
 * panel (`end`), a settings drawer. Not for a short list of actions (Menu,
 * ActionSheet), a task with a few fields (Dialog, BottomSheet), or the page's point.
 * Do not stack side panels.
 *
 * Overlay: a native `Modal` (`transparent`, `statusBarTranslucent`) holding a
 * full-screen scrim `Pressable` (`color.overlay.scrim` when `modal` or `scrim`,
 * transparent otherwise, reported as `scrim` either way) and an `Animated.View`
 * surface at the `side` edge (`I18nManager.isRTL` flips it), its width the width
 * binding capped at the window minus `edgeGutter`. It slides in over `enter` with
 * `motion.easing.standard` and out over `exit` with `motion.easing.exit`, the scrim
 * fading with it, instantly under reduced motion. The surface composes `FocusScope`
 * (`trapped={modal}`), a header row with `Heading` (level 2, size lg) and the close
 * `Button` (ghost, iconOnly), a scrolling `Box` body and a `Stack` footer. A
 * `PanResponder` on the header — never on a touch that starts inside the close
 * button's wrapping view — drags the surface toward its edge; past a quarter of its
 * width or a fast flick it reports `swipe` and continues at the release velocity,
 * otherwise it springs back over `exit`. `onRequestClose` (the Android back button)
 * is `escape`; with `dismissible` false it reports without closing. Closing moves
 * accessibility focus back to the trigger.
 *
 * Persistent (window width > the chosen `layout.maxWidth.*` token — a width check,
 * not an orientation check): a plain `View` where SidePanel sits, with the `role`
 * prop and `heading` as its label, the `border` on the edge facing the content, the
 * width binding as its width and natural height (the screen scrolls, not the body),
 * no Modal, scrim, close button or trigger.
 *
 * Native limits: the non-modal "page stays live" cannot be reproduced under `Modal`,
 * which intercepts every touch; Tab stitching and modal Tab wrap have no native
 * key-event equivalent; the inert page is the Modal window itself and scroll lock has
 * no meaning. Crossing the persistent breakpoint changes the root, so the children
 * remount.
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
  ref,
}: SidePanelProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const triggerRef = React.useRef<ViewInstance>(null);
  const surfaceWidthRef = React.useRef(0);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const [mounted, setMounted] = React.useState(isOpen);
  const progress = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const dragX = React.useRef(new Animated.Value(0)).current;

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const widthDefault = overrides?.width ? (resolveToken(t, overrides.width) as number) : t.layoutMaxWidthProse;
  // The binding holds the space.20 unit; the rule multiplies it, so an override replaces the unit.
  const widthNarrowUnit = overrides?.widthNarrow ? (resolveToken(t, overrides.widthNarrow) as number) : t.space20;
  const widthNarrow = widthNarrowUnit * 3; // literal-ok: schema-computed multiplier (space.20 × 3)
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
  // `width > token` is the sidebar; exactly the token width is still the overlay.
  const isPersistentActive = persistentBreakpoint !== null && windowWidth > persistentBreakpoint;

  const isPhysicalLeft = I18nManager.isRTL ? side === 'end' : side === 'start';
  const showScrim = modal || scrim;

  const widthToken = width === 'narrow' ? widthNarrow : width === 'wide' ? widthWide : widthDefault;
  const overlayPanelWidth = Math.min(widthToken, windowWidth - edgeGutter);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  React.useEffect(() => {
    // The persistent sidebar has no overlay lifecycle of its own.
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
    // animation's config is read fresh each run rather than tracked as a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mounted, reducedMotion, isPersistentActive]);

  const focusTrigger = (): void => {
    const node = triggerRef.current ? findNodeHandle(triggerRef.current) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

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

  // Set when a touch starts inside the close button's wrapping view so the header's
  // swipe never claims it; cleared when that touch ends.
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

  const panResponder = React.useMemo(() => {
    const springBack = (): void => {
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
    };
    return PanResponder.create({
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
        dragX.setValue(awayDx > 0 ? gestureState.dx : 0);
      },
      onPanResponderRelease: (_, gestureState) => {
        const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
        const awayVx = isPhysicalLeft ? -gestureState.vx : gestureState.vx;
        const threshold = (surfaceWidthRef.current || overlayPanelWidth) * DRAG_DISMISS_RATIO;
        if (awayDx <= threshold && awayVx <= DRAG_DISMISS_VELOCITY) {
          springBack();
          return;
        }
        requestCloseRef.current('swipe');
        if (reducedMotion) {
          dragX.setValue(isPhysicalLeft ? -windowWidth : windowWidth);
          return;
        }
        // The dismiss continues at the swipe's own velocity.
        const speed = Math.max(awayVx, DECAY_MIN_VELOCITY);
        Animated.decay(dragX, {
          velocity: isPhysicalLeft ? -speed : speed,
          deceleration: DECAY_DECELERATION,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: springBack,
    });
  }, [swipeable, dismissible, isPhysicalLeft, dragX, windowWidth, overlayPanelWidth, reducedMotion, exitDuration, t.motionEasingStandard]);

  const triggerChild = React.isValidElement(trigger) ? (trigger as React.ReactElement<Record<string, unknown>>) : null;

  const clonedTrigger =
    triggerChild !== null
      ? React.cloneElement(triggerChild, {
          onPress: (event: unknown) => {
            (triggerChild.props.onPress as ((e: unknown) => void) | undefined)?.(event);
            handleTriggerPress();
          },
          // Button reflects this to accessibilityState.expanded (the disclosure state).
          expanded: isOpen,
        })
      : trigger;

  const bodyBoxOverrides = overrides?.inset ? { paddingBlock: overrides.inset } : undefined;
  const footerStackOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : undefined;

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingBottom: inset,
  };

  const footerPart =
    footer !== undefined ? (
      <SafeAreaView style={footerStyle} testID="SidePanel.footer">
        <Stack direction="horizontal" gap="tight" justify="end" overrides={footerStackOverrides}>
          {footer}
        </Stack>
      </SafeAreaView>
    ) : null;

  const headingPart = (
    <Heading level={2} size="lg">
      {heading}
    </Heading>
  );

  if (isPersistentActive) {
    const sidebarStyle: ViewStyle = {
      width: widthToken,
      backgroundColor: surfaceColor,
      gap: partGap,
      ...(isPhysicalLeft
        ? { borderRightWidth: borderWidth, borderRightColor: borderColor }
        : { borderLeftWidth: borderWidth, borderLeftColor: borderColor }),
    };
    const sidebarHeaderStyle: ViewStyle = {
      paddingHorizontal: inset,
      paddingTop: inset,
    };

    return (
      <View ref={ref} style={sidebarStyle} role={role} accessibilityLabel={heading} testID="SidePanel">
        {/* No close button here, so a hidden title leaves the header empty: not rendered. */}
        {!hideHeading ? (
          <View style={sidebarHeaderStyle} testID="SidePanel.header">
            {headingPart}
          </View>
        ) : null}
        <View testID="SidePanel.body">
          <Box inset="lg" overrides={bodyBoxOverrides}>
            {children}
          </Box>
        </View>
        {footerPart}
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
    justifyContent: hideHeading ? 'flex-end' : 'space-between',
    gap: headerGap,
    paddingHorizontal: inset,
    paddingTop: inset,
  };

  const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  const showHeader = !hideHeading || dismissible;

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
                ref={ref}
                style={surfaceStyle}
                onLayout={handleSurfaceLayout}
                accessibilityViewIsModal={modal}
                accessibilityLabel={heading}
                testID="SidePanel.surface"
              >
                {showHeader ? (
                  <View
                    {...(swipeable && dismissible ? panResponder.panHandlers : null)}
                    onTouchEnd={handleHeaderTouchEnd}
                    onTouchCancel={handleHeaderTouchEnd}
                    style={headerStyle}
                    testID="SidePanel.header"
                  >
                    {!hideHeading ? headingPart : null}
                    {dismissible ? (
                      <View onTouchStart={handleCloseTouchStart} testID="SidePanel.closeButton">
                        <Button
                          label={COPY.closeLabel}
                          variant="ghost"
                          iconOnly
                          leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                          onPress={handleCloseButtonPress}
                        />
                      </View>
                    ) : null}
                  </View>
                ) : null}
                <ScrollView
                  testID="SidePanel.body"
                  style={bodyFlexStyle}
                  contentContainerStyle={bodyContentStyle}
                  keyboardShouldPersistTaps="handled"
                >
                  <Box inset="lg" overrides={bodyBoxOverrides}>
                    {children}
                  </Box>
                </ScrollView>
                {footerPart}
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
  /** Fired when an edge swipe crosses the open threshold. The consumer sets its own controlled `open` — the hook has no knowledge of the panel it opens. */
  onOpen: () => void;
}

/**
 * A `PanResponder` for the screen root that opens a controlled `SidePanel` on a swipe
 * from its edge — additive to the trigger, never the only way in (WCAG 2.5.1). The
 * gesture has to start at the edge of the whole screen, outside the panel's own
 * (unmounted-when-closed) surface, so the consumer spreads `panHandlers` onto their
 * root view.
 */
export function useSidePanelEdgeSwipe({
  side = 'start',
  enabled = true,
  onOpen,
}: UseSidePanelEdgeSwipeOptions): { panHandlers: PanResponderInstance['panHandlers'] } {
  const { tokens: t } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isPhysicalLeft = I18nManager.isRTL ? side === 'end' : side === 'start';
  // No token names the edge zone; the comfortable target size is a thumb's-width strip.
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
          const startsAtEdge = isPhysicalLeft ? gestureState.x0 <= edgeZone : gestureState.x0 >= windowWidth - edgeZone;
          const inwardDx = isPhysicalLeft ? gestureState.dx : -gestureState.dx;
          return startsAtEdge && inwardDx > DRAG_SLOP && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
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
