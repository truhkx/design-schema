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
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
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
  trigger?: React.ReactNode;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). Ignored once `persistent` takes over — the panel is then always present. */
  open?: boolean;
  /** The panel's title and accessible name. May be visually hidden with `hideTitle`. */
  title: string;
  /** Keep the title for assistive technology but do not render it. The accessible name is required regardless. */
  hideTitle?: boolean;
  /** The body. Scrolls inside the panel when taller than the viewport. */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: React.ReactNode;
  /** The physical edge the panel slides from, flipped by `I18nManager.isRTL`. */
  side?: SidePanelSide;
  /** Panel width: `narrow` for a list of links, `wide` for a form or detail. Clamped to the viewport minus `edgeGutter` on narrow screens. */
  width?: SidePanelWidth;
  /** Above the chosen breakpoint the panel renders as a fixed sidebar beside the content instead of an overlay: always visible regardless of `open`, no scrim, no trap, trigger hidden. `content` switches at `layout.maxWidth.content`, `page` at `layout.maxWidth.page`. */
  persistent?: SidePanelPersistent;
  /** `false` (default, the disclosure pattern): focus stays on the trigger when it opens, the panel is not trapped. `true`: a modal Dialog at the edge — focus moves in and is trapped, always shows a scrim. */
  modal?: boolean;
  /** Show the scrim in non-modal mode too. Modal always has one regardless of this prop. */
  scrim?: boolean;
  /** Escape, the close button, a scrim tap and the swipe gesture all request close. When false, only the trigger and footer actions close it. */
  dismissible?: boolean;
  /** A swipe toward the edge dismisses the panel. Purely additive: the close button and (when `dismissible`) Escape always exist. Edge-swipe-to-open is not automatic — see `useSidePanelEdgeSwipe`. */
  swipeable?: boolean;
  /** Fired when the panel opens or closes, with the new state and a reason. */
  onOpenChange?: (open: boolean, reason: SidePanelCloseReason) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef>>;
}

const COPY = {
  closeLabel: 'Close',
  openLabel: 'Open menu',
} as const;

const DRAG_DISMISS_RATIO = 0.25; // literal-ok: fraction of panel width past which a swipe dismisses, matching BottomSheet's vertical convention
const DRAG_DISMISS_VELOCITY = 1.5; // literal-ok: release velocity (px/ms) past which a swipe dismisses regardless of distance

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
 * (level 2, hidden with `hideTitle`) for the title, `Button` for the close control,
 * `Box` for the scrollable body and `Stack` for the footer row — never restyled
 * directly. A `PanResponder` on the surface tracks a drag toward the edge it came
 * from; past 25% of its measured width or a fast flick, it fires `onOpenChange`
 * with reason `swipe` and continues the motion off-screen with `Animated.decay` at
 * the release velocity (instant, no decay, under reduced motion); otherwise it
 * springs back. The gesture is additive — the close button always exists and is
 * gated only by `dismissible`, exactly like Escape (the Android back button via
 * `onRequestClose`), the scrim tap and the swipe: per this component's own prop
 * doc, all four are disabled when `dismissible` is false, unlike `Dialog`'s
 * "Escape always reports" precedent, which does not apply here. `width`'s tokens
 * are clamped to the viewport minus `edgeGutter` so a phone-width panel always
 * leaves a strip of scrim visible. Above the `persistent` breakpoint
 * (`useWindowDimensions` against the chosen `layout.maxWidth.*` token) the panel
 * renders instead as a plain `View` (`accessibilityRole="none"`, labelled by
 * `title`) with a border on the edge facing the content, always visible regardless
 * of `open`, with the trigger unrendered — the mirror of the web generator's fixed
 * sidebar. Edge-swipe-to-open is not implemented inside the component (it needs a
 * gesture on the screen root, not the panel itself); `useSidePanelEdgeSwipe` is
 * exported for a consumer to wire onto their own root view.
 *
 * Acknowledged native limits: there is no page-scroll lock or `inert` background —
 * the same limit `Dialog` and `BottomSheet` document, since there is no page scroll
 * for a modal window to suppress; the modal Tab-wrap and non-modal "Tab flows into
 * the panel" behavior have no native key-event equivalent, the same limit
 * `FocusScope` itself documents; a followed `Link` inside the body cannot close the
 * panel on its own (no client router to observe), so `navigation` is never emitted
 * by this component, only reserved on the type for parity with the web/Lit docs.
 */
export function SidePanel({
  trigger,
  open,
  title,
  hideTitle = false,
  children,
  footer,
  side = 'start',
  width = 'default',
  persistent = 'never',
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

  const triggerRef = React.useRef<View>(null);
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
    if (node !== null) {
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

  const handleScrimPress = (): void => {
    if (dismissible) {
      requestClose('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    requestClose('close-button');
  };

  const handleRequestClose = (): void => {
    if (dismissible) {
      requestClose('escape');
    }
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceWidthRef.current = event.nativeEvent.layout.width;
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!swipeable || !dismissible) {
            return false;
          }
          const awayDx = isPhysicalLeft ? -gestureState.dx : gestureState.dx;
          return awayDx > 4 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
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
            requestClose('swipe');
            if (reducedMotion) {
              dragX.setValue(isPhysicalLeft ? -windowWidth : windowWidth);
            } else {
              const decayVelocity = isPhysicalLeft ? -Math.max(awayVx, 0.5) : Math.max(awayVx, 0.5);
              Animated.decay(dragX, { velocity: decayVelocity, deceleration: 0.998, useNativeDriver: false }).start();
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
          Animated.timing(dragX, { toValue: 0, duration: exitDuration, useNativeDriver: false }).start();
        },
      }),
    [swipeable, dismissible, isPhysicalLeft, dragX, windowWidth, overlayPanelWidth, reducedMotion, exitDuration, t.motionEasingStandard],
  );

  const isTriggerElement = React.isValidElement(trigger);
  const triggerChild = isTriggerElement ? (trigger as React.ReactElement<Record<string, unknown>>) : null;
  const triggerChildProps = triggerChild?.props ?? {};
  const triggerHasLabel = typeof triggerChildProps.label === 'string';

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
          // No-op on this package's own Button, which does not forward unrecognized
          // props (see Popover's doc); kept for a trigger that does forward extra props.
          accessibilityState: { expanded: isOpen },
          ...(triggerHasLabel ? null : { accessibilityLabel: COPY.openLabel }),
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
      <View style={sidebarStyle} accessibilityRole="none" accessibilityLabel={title} testID="SidePanel">
        {!hideTitle ? (
          <View style={headerStyle} testID="SidePanel.header">
            <Heading level={2}>{title}</Heading>
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

  const scrimStyle: Animated.WithAnimatedObject<ViewStyle> = {
    ...StyleSheet.absoluteFillObject,
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

  const surfaceStyle: Animated.WithAnimatedObject<ViewStyle> = {
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
            style={StyleSheet.absoluteFillObject}
            onPress={handleScrimPress}
            accessible={false}
            testID="SidePanel.scrim"
          />
          <View style={anchorStyle} pointerEvents="box-none">
            <FocusScope trapped={modal} active={mounted} autoFocus={modal ? 'first' : 'none'} restoreFocus={false}>
              <Animated.View
                {...(swipeable && dismissible ? panResponder.panHandlers : null)}
                style={surfaceStyle}
                onLayout={handleSurfaceLayout}
                accessibilityViewIsModal={modal}
                accessibilityLabel={title}
                testID="SidePanel.surface"
              >
                <View style={headerStyle} testID="SidePanel.header">
                  {!hideTitle ? <Heading level={2}>{title}</Heading> : null}
                  <Button
                    label={COPY.closeLabel}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    disabled={!dismissible}
                    leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                    onPress={handleCloseButtonPress}
                  />
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
  side?: SidePanelSide;
  /** Turn the gesture off, e.g. while the panel is already open. */
  enabled?: boolean;
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
export function useSidePanelEdgeSwipe({ side = 'start', enabled = true, onOpen }: UseSidePanelEdgeSwipeOptions) {
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
