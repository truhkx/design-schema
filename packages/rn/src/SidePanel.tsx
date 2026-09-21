import * as React from 'react';
import {
  Animated,
  I18nManager,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  PanResponderInstance,
  ViewInstance,
  ViewStyle,
} from 'react-native';
import type { TokenRef } from '@design-schema/tokens';
import { resolveToken } from '@design-schema/tokens';
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
 * Why `onOpenChange` fired. React Native raises `trigger`, `escape` (the Android back
 * button or the VoiceOver escape gesture), `close-button`, `scrim` and `swipe` only:
 * `outside` never happens — an outside tap lands on the full-screen scrim `Pressable`,
 * transparent when `scrim` is false, and is reported as `scrim` — `navigation` has no
 * router hook to observe, and `action` exists for a consumer's own footer handler
 * reusing this callback. All three stay in the type so the reason is one union across
 * platforms.
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

/**
 * The style bindings a caller may replace with a different token; `surface`, `focusRing`
 * and `focusRingWidth` are accessibility-bearing, so they are locked and ignored if passed.
 */
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
  | 'headingGap'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

export interface SidePanelProps {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and
   * a label like "Menu"). It stays a toggle — pressing it again closes — and is cloned to
   * carry the disclosure state as `accessibilityState.expanded`. Omit to control `open`
   * from elsewhere (a Toolbar). Not rendered once `persistent` takes over.
   */
  trigger?: React.ReactNode | undefined;
  /**
   * Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled
   * panel always starts closed and there is no `defaultOpen`, so a panel that must start
   * open is controlled.
   */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). Required regardless of `hideHeading`. */
  heading: string;
  /**
   * Keep the title for assistive technology but do not show it: on native it is the
   * surface's `accessibilityLabel`. When the header would then be empty — no close button,
   * because `dismissible` is false or the panel is persistent — the header part is not
   * rendered at all: no padding, no gap, no height. When the header keeps only the close
   * button, that button is end-aligned in it.
   */
  hideHeading?: boolean | undefined;
  /**
   * The body: a Stack of navigation Links, a Stack of filter controls, a Stack of Cards.
   * Scrolls inside the overlay panel when taller than the window; the persistent sidebar
   * takes its natural height and the screen scrolls instead.
   */
  children: React.ReactNode;
  /** Pinned to the bottom of the panel above the safe area (a sign-out Button, an "Apply filters" row). */
  footer?: React.ReactNode | undefined;
  /** The edge the panel slides from. `start` is left in left-to-right layouts and right under `I18nManager.isRTL`; `end` the opposite. */
  side?: SidePanelSide | undefined;
  /** `narrow` for a list of links, `wide` for a form or a detail. On phones the panel is the window width minus `edgeGutter`, so a strip of scrim stays visible. */
  width?: SidePanelWidth | undefined;
  /**
   * Above this window width the panel stops being an overlay and becomes a sidebar beside
   * the content: always visible, no Modal, no scrim, no trap, no close button, and the
   * trigger is not rendered. `content` switches at `layout.maxWidth.content`, `page` at
   * `layout.maxWidth.page`; the comparison is `window width > token`, so exactly the token
   * width is still the overlay. It is a width check, not an orientation check.
   */
  persistent?: SidePanelPersistent | undefined;
  /**
   * The landmark the persistent sidebar exposes through the RN `role` prop: `navigation`
   * for a menu of Links, `complementary` for filters, a cart, a detail. React Native has no
   * landmark roles in the overlay presentations, which expose only their label.
   */
  role?: SidePanelRole | undefined;
  /**
   * `false` (the default, the APG disclosure pattern): focus stays on the trigger when the
   * panel opens. `true`: a modal panel at the edge — always a scrim, focus moved in, and
   * screen-reader users confined by `accessibilityViewIsModal` — for a panel that must be
   * finished or dismissed.
   */
  modal?: boolean | undefined;
  /** Show the scrim in non-modal mode too (modal always has one). Turn it off for a panel that should feel like part of the page. */
  scrim?: boolean | undefined;
  /**
   * Escape (the back button), the close button, a scrim tap and the swipe all request
   * close. When false the close button is not rendered and a scrim tap and the swipe do
   * nothing; Escape still reports `onOpenChange(false, 'escape')` — the consumer decides —
   * so an uncontrolled non-dismissible panel reports it and stays open. Only those four are
   * gated: the trigger toggle always closes.
   */
  dismissible?: boolean | undefined;
  /**
   * On touch, a swipe on the header toward the edge dismisses the panel. Purely additive:
   * the trigger and close button always exist (WCAG 2.5.1). The edge-to-open swipe is
   * `useSidePanelEdgeSwipe`, which needs a controlled `open`.
   */
  swipeable?: boolean | undefined;
  /** Fired after the panel opens or closes, with the new state and the reason it changed. */
  onOpenChange?: ((open: boolean, reason: SidePanelCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/** Schema constants without a token; `dragSlop` (`space.1`) and `edgeZone` (`size.target.comfortable`) have one and are read from the theme. */
const CONSTANTS = {
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance (ratio of the panel width)
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity (px/ms)
} as const;

interface DragSample {
  /** Travel toward the edge, measured from where the slop was crossed. */
  away: number;
  time: number;
}

/** Velocity toward the edge between the last two move samples; only speed that way counts. */
function sampledVelocity(samples: readonly DragSample[]): number {
  const [previous, last] = samples;
  if (previous === undefined || last === undefined) {
    return 0;
  }
  const elapsed = last.time - previous.time;
  return elapsed > 0 ? Math.max(0, (last.away - previous.away) / elapsed) : 0;
}

/** Keeps the last two move samples, so a release reads the speed it ended at rather than its average. */
function pushSample(samples: readonly DragSample[], sample: DragSample): DragSample[] {
  return [samples[samples.length - 1] ?? sample, sample];
}

/**
 * SidePanel — the drawer: hidden off the edge until the trigger asks for it, then sliding
 * in beside the page. Non-modal by default (the APG disclosure pattern: the trigger keeps
 * focus and carries the expanded state); `modal` makes it a modal panel at the edge, for
 * content that must be finished or dismissed. Above `persistent`'s breakpoint it stops
 * being an overlay and is simply there, as a sidebar — so a product has one menu, not a
 * phone menu and a desktop one.
 *
 * When to use: primary navigation on phones (`start`), filters, a cart or a detail panel
 * (`end`), a settings drawer. Not for a short list of actions (Menu, ActionSheet), a task
 * with a few fields (Dialog, BottomSheet), or content that is the page's point. Do not
 * stack side panels.
 *
 * Overlay: a native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself — `statusBarTranslucent`) holding a full-screen scrim (`color.overlay.scrim` when
 * `modal` or `scrim`, fully transparent otherwise) with a `Pressable` over it that catches
 * every outside tap and reports `scrim` either way, and an `Animated.View` surface at the
 * `side` edge (`I18nManager.isRTL` flips it) whose width is the width binding capped at the
 * window minus `edgeGutter`. It slides in over `enter` with `motion.easing.standard` and
 * out over `exit` with `motion.easing.exit`, the scrim fading with it, instant under
 * reduced motion. `FocusScope` (`trapped={modal}`, `autoFocus` only when modal, restoring
 * to the trigger) wraps the surface from outside, since its wrapper `View` cannot be styled
 * or height-constrained; inside the surface a `SafeAreaView` holds the parts column, which
 * carries `partGap` and the block padding from `inset` (`SafeAreaView` ignores its own
 * padding) around the header, the scrolling body and the pinned footer.
 *
 * The swipe lives on the header, never on the close button: a touch that starts inside
 * `SidePanel.closeButton` is remembered, so the header's responder declines it and the tap
 * still activates the button. The drag claims a move past `dragSlop` (`space.1`) toward the
 * edge and counts from where the slop was crossed, so the surface does not jump, and it
 * follows the finger even under reduced motion because it is user-driven. Released past
 * `dismissDistance` of the measured surface width, or faster than `dismissVelocity` between
 * the last two move samples, it reports `swipe` and then holds the released offset — there
 * is no momentum or decay — until the consumer's next render: closed, the normal exit plays
 * from there; still open, it springs back over `exit` with `motion.easing.standard`, a
 * timing animation and never a spring, which also finishes an interrupted enter.
 *
 * Persistent (window width > the chosen `layout.maxWidth.*` token): a plain `View` where
 * SidePanel sits, carrying the RN `role` prop and `heading` as its label, the `border` on
 * the edge facing the content, the width binding as its width and its natural height. It
 * pads no safe area — the screen owns that — and renders no Modal, scrim, close button or
 * trigger.
 *
 * Native limits, all accepted by the doc: the non-modal "page stays live" cannot be
 * reproduced under `Modal`, which intercepts every touch, so only tap-outside-to-close is
 * possible; there is no Tab order to stitch or wrap; the Modal window itself stands in for
 * the inert page and scroll lock has no meaning, with `accessibilityViewIsModal` confining
 * screen-reader users. `role` is not exposed in overlay mode, no ref is exposed at all, and
 * crossing the persistent breakpoint changes the root between `Modal` and `View`, so the
 * children remount and lose their state.
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
  const samplesRef = React.useRef<DragSample[]>([]);
  // Where the slop was crossed; the drag offset counts from there.
  const grantAwayRef = React.useRef(0);
  // Set while a touch that started inside the close button's wrapper is live, so the
  // header's swipe never claims it.
  const closeTouchRef = React.useRef(false);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;

  // Kept mounted while the exit animation runs; derived during render so the Modal's
  // content exists on the commit that opens it.
  const [mounted, setMounted] = React.useState(isOpen);
  if (isOpen && !mounted) {
    setMounted(true);
  }
  // Bumped after a swipe release so an effect can read `open` once the consumer's update has rendered.
  const [swipeReleases, setSwipeReleases] = React.useState(0);

  const progress = React.useRef(new Animated.Value(0)).current;
  const dragX = React.useRef(new Animated.Value(0)).current;

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const widthDefault = overrides?.width ? (resolveToken(t, overrides.width) as number) : t.layoutMaxWidthProse;
  // The binding holds the space.20 unit and the rule multiplies it, so an override replaces
  // the unit rather than the final width.
  const widthNarrowUnit = overrides?.widthNarrow ? (resolveToken(t, overrides.widthNarrow) as number) : t.space20;
  const widthNarrow = widthNarrowUnit * 3; // literal-ok: the binding's own computed multiplier (space.20 × 3)
  const widthWide = overrides?.widthWide ? (resolveToken(t, overrides.widthWide) as number) : t.layoutMaxWidthContent;
  const edgeGutter = overrides?.edgeGutter ? (resolveToken(t, overrides.edgeGutter) as number) : t.space12;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  // A schema constant with a token, not an overridable binding.
  const dragSlop = t.space1;

  const persistentBreakpoint =
    persistent === 'content' ? t.layoutMaxWidthContent : persistent === 'page' ? t.layoutMaxWidthPage : null;
  // The breakpoint is the theme token, read per render: `width > token` is the sidebar, so
  // exactly the token width is still the overlay. A width check, never an orientation check.
  const isPersistentActive = persistentBreakpoint !== null && windowWidth > persistentBreakpoint;

  const isPhysicalLeft = I18nManager.isRTL ? side === 'end' : side === 'start';
  const showScrim = modal || scrim;
  const canSwipe = swipeable && dismissible;

  const widthToken = width === 'narrow' ? widthNarrow : width === 'wide' ? widthWide : widthDefault;
  const overlayPanelWidth = Math.min(widthToken, windowWidth - edgeGutter);

  const springBack = (): void => {
    if (reducedMotion || exitDuration === 0) {
      dragX.setValue(0);
      return;
    }
    // A timing animation, not a spring: the theme's motion never bounces.
    Animated.timing(dragX, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: false,
    }).start();
  };

  React.useEffect(() => {
    // The persistent sidebar has no overlay lifecycle of its own.
    if (isPersistentActive || !mounted) {
      return undefined;
    }
    if (isOpen) {
      dragX.setValue(0);
      if (reducedMotion || enterDuration === 0) {
        progress.setValue(1);
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }
    if (reducedMotion || exitDuration === 0) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    // Plays from wherever the surface is, including the offset a swipe dismiss left it at.
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
    // Runs on the open/closed transition and the mount gate it drives; the animation's
    // config is read fresh each run rather than tracked as a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mounted, reducedMotion, isPersistentActive]);

  React.useEffect(() => {
    // The release and the consumer's `setState` batch into one render, so `isOpen` here is
    // the answer to the dismiss: still open means the swipe was not honored, so spring back.
    if (swipeReleases > 0 && isOpen) {
      springBack();
    }
    // Only a swipe release triggers this check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swipeReleases]);

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
    // FocusScope returns accessibility focus to the trigger when the panel unmounts.
    changeOpen(false, reason);
  };

  const handleTriggerPress = (): void => {
    // The trigger toggle is never gated by `dismissible`.
    changeOpen(!isOpen, 'trigger');
  };

  const handleScrimPress = (): void => {
    if (dismissible) {
      requestClose('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    requestClose('close-button');
  };

  // The Android back button and the VoiceOver escape gesture. Not dismissible: reported
  // only, so an uncontrolled panel stays open and the consumer decides.
  const handleEscape = (): void => {
    if (!isOpen) {
      return;
    }
    if (dismissible) {
      requestClose('escape');
      return;
    }
    onOpenChange?.(false, 'escape');
  };

  const handleCloseTouchStart = (): void => {
    closeTouchRef.current = true;
  };
  const handleHeaderTouchEnd = (): void => {
    closeTouchRef.current = false;
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceWidthRef.current = event.nativeEvent.layout.width;
  };

  // Travel toward the `side` edge, whichever physical direction that is.
  const towardEdge = (value: number): number => (isPhysicalLeft ? -value : value);

  // The responder is created once and reads the current render's values through this ref.
  const latest = React.useRef({ dragSlop, isPhysicalLeft, overlayPanelWidth, requestClose, springBack });
  latest.current = { dragSlop, isPhysicalLeft, overlayPanelWidth, requestClose, springBack };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    const away = (g: PanResponderGestureState): number =>
      (latest.current.isPhysicalLeft ? -g.dx : g.dx) - grantAwayRef.current;
    const claims = (_: GestureResponderEvent, g: PanResponderGestureState): boolean => {
      // A touch that began on the close button is the button's, never the header's swipe.
      if (closeTouchRef.current) {
        return false;
      }
      const dx = latest.current.isPhysicalLeft ? -g.dx : g.dx;
      return dx > latest.current.dragSlop && Math.abs(g.dx) > Math.abs(g.dy);
    };
    panResponder.current = PanResponder.create({
      // A tap never claims the responder; only a move past the slop does.
      onStartShouldSetPanResponder: () => false,
      // Capture so a drag that started on the heading is taken over by the header, but only
      // past the slop — and never from the close button, which `claims` declines.
      onMoveShouldSetPanResponderCapture: claims,
      onMoveShouldSetPanResponder: claims,
      onPanResponderGrant: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        samplesRef.current = [];
        grantAwayRef.current = latest.current.isPhysicalLeft ? -g.dx : g.dx;
      },
      // Follows the finger even under reduced motion: the drag is user-driven.
      onPanResponderMove: (event: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, away(g));
        dragX.setValue(latest.current.isPhysicalLeft ? -offset : offset);
        samplesRef.current = pushSample(samplesRef.current, { away: offset, time: event.nativeEvent.timestamp });
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, away(g));
        const panelWidth =
          surfaceWidthRef.current > 0 ? surfaceWidthRef.current : latest.current.overlayPanelWidth;
        const dismiss =
          offset > panelWidth * CONSTANTS.dismissDistance ||
          sampledVelocity(samplesRef.current) > CONSTANTS.dismissVelocity;
        if (!dismiss) {
          latest.current.springBack();
          return;
        }
        // No momentum and no decay: the surface holds the released offset until the
        // consumer's next render answers the dismiss.
        latest.current.requestClose('swipe');
        setSwipeReleases((count) => count + 1);
      },
      onPanResponderTerminate: () => latest.current.springBack(),
    });
  }

  const triggerChild = React.isValidElement(trigger) ? (trigger as React.ReactElement<Record<string, unknown>>) : null;

  if (__DEV__ && trigger !== undefined && triggerChild === null) {
    // eslint-disable-next-line no-console
    console.warn(
      'SidePanel: `trigger` must be a single element so it can carry the toggle and the expanded state. It is rendered as given, but it will not open or close the panel.',
    );
  }

  const clonedTrigger =
    triggerChild !== null
      ? React.cloneElement(triggerChild, {
          onPress: (event: unknown) => {
            (triggerChild.props.onPress as ((e: unknown) => void) | undefined)?.(event);
            handleTriggerPress();
          },
          // Button reflects this to accessibilityState.expanded, which the platform
          // announces in its own words; `copy.expanded` is never rendered here.
          expanded: isOpen,
        })
      : trigger;

  const headingPart = !hideHeading ? (
    <View style={{ flexShrink: 1 }} testID="SidePanel.heading">
      {/* `headingGap` turns the Heading's own margin off so the title centers against the close button. */}
      <Heading level="2" size="lg" overrides={{ marginBlockEnd: overrides?.headingGap ?? 'space.0' }}>
        {heading}
      </Heading>
    </View>
  ) : null;

  // `inset` reaches the Box only as a token path through its own overrides, always sent;
  // the block padding stays on the parts column so nothing doubles with `partGap`.
  const bodyPart = (
    <Box inset="none" overrides={{ paddingInline: overrides?.inset ?? 'layout.inset.lg' }}>
      {children}
    </Box>
  );

  const footerStyle: ViewStyle = { paddingHorizontal: inset };

  const footerPart =
    footer !== undefined ? (
      <View style={footerStyle} testID="SidePanel.footer">
        <Stack
          direction="horizontal"
          gap="tight"
          justify="end"
          overrides={{ gap: overrides?.footerGap ?? 'layout.gap.tight' }}
        >
          {footer}
        </Stack>
      </View>
    ) : null;

  if (isPersistentActive) {
    // The sidebar View is itself the parts column: it carries the gap and the block padding.
    const sidebarStyle: ViewStyle = {
      width: widthToken,
      backgroundColor: t.colorOverlaySurface,
      gap: partGap,
      paddingVertical: inset,
      // The border is on the inner edge, the one facing the content; the shadow is overlay-only.
      ...(isPhysicalLeft
        ? { borderRightWidth: borderWidth, borderRightColor: borderColor }
        : { borderLeftWidth: borderWidth, borderLeftColor: borderColor }),
    };
    const sidebarHeaderStyle: ViewStyle = { paddingHorizontal: inset };

    return (
      // No safe-area padding: the screen's own layout owns that beside the content.
      <View style={sidebarStyle} role={role} accessibilityLabel={heading} testID="SidePanel">
        {/* There is no close button here, so a hidden title leaves the header empty: not rendered. */}
        {headingPart !== null ? (
          <View style={sidebarHeaderStyle} testID="SidePanel.header">
            {headingPart}
          </View>
        ) : null}
        <View testID="SidePanel.body">{bodyPart}</View>
        {footerPart}
      </View>
    );
  }

  const hostStyle: ViewStyle = { flex: 1 };

  // Transparent but always present when `scrim` is false, so an outside tap still lands on
  // the Pressable over it and is reported as `scrim`; `outside` is never raised here.
  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: showScrim ? progress : 0,
  };

  // The scrim and the surface share one layer; the surface is painted after, so it is above.
  const anchorStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    justifyContent: isPhysicalLeft ? 'flex-start' : 'flex-end',
    zIndex: layer,
  };

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: overlayPanelWidth,
    height: '100%',
    ...shadow,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    transform: [
      {
        translateX: Animated.add(
          progress.interpolate({
            inputRange: [0, 1],
            outputRange: [towardEdge(overlayPanelWidth), 0],
          }),
          dragX,
        ),
      },
    ],
  };

  const safeAreaStyle: ViewStyle = { flex: 1 };

  // The parts column: the only space between header, body and footer, and the one place the
  // block edges are padded. SafeAreaView ignores padding of its own, so both live here.
  const columnStyle: ViewStyle = {
    flex: 1,
    gap: partGap,
    paddingVertical: inset,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // With the title hidden the close button is end-aligned in the header.
    justifyContent: hideHeading ? 'flex-end' : 'space-between',
    gap: headerGap,
    paddingHorizontal: inset,
  };

  const bodyStyle: ViewStyle = { flexShrink: 1, flexGrow: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  // Nothing to show in the header: no visible title and no close button.
  const showHeader = !hideHeading || dismissible;

  return (
    <View testID="SidePanel">
      {trigger !== undefined ? (
        // collapsable={false}: the wrapper must keep a native view for setAccessibilityFocus.
        <View ref={triggerRef} collapsable={false} testID="SidePanel.trigger">
          {clonedTrigger}
        </View>
      ) : null}
      <Modal visible={mounted} transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
        <View style={hostStyle}>
          <Animated.View style={scrimStyle} />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleScrimPress}
            accessible={false}
            testID="SidePanel.scrim"
          />
          <View style={anchorStyle} pointerEvents="box-none">
            {/* FocusScope wraps the surface from outside: its wrapper View cannot be styled
                or height-constrained, and it takes no testID of its own. */}
            <FocusScope
              trapped={modal}
              active={mounted}
              autoFocus={modal ? 'first' : 'none'}
              restoreFocus
              returnFocusTo={triggerRef}
            >
              <Animated.View
                style={surfaceStyle}
                onLayout={handleSurfaceLayout}
                accessibilityViewIsModal={modal}
                accessibilityLabel={heading}
                onAccessibilityEscape={handleEscape}
                testID="SidePanel.surface"
              >
                <SafeAreaView style={safeAreaStyle}>
                  <View style={columnStyle} testID="SidePanel.focusScope">
                    {showHeader ? (
                      <View
                        {...(canSwipe ? panResponder.current.panHandlers : undefined)}
                        onTouchEnd={handleHeaderTouchEnd}
                        onTouchCancel={handleHeaderTouchEnd}
                        style={headerStyle}
                        testID="SidePanel.header"
                      >
                        {headingPart}
                        {dismissible ? (
                          <View onTouchStart={handleCloseTouchStart} testID="SidePanel.closeButton">
                            {/* Default size: Button's own hitSlop keeps it at `size.target.comfortable`. */}
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
                      style={bodyStyle}
                      contentContainerStyle={bodyContentStyle}
                      keyboardShouldPersistTaps="handled"
                      testID="SidePanel.body"
                    >
                      {bodyPart}
                    </ScrollView>
                    {footerPart}
                  </View>
                </SafeAreaView>
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
  /** Turn the gesture off — while the panel is already open, or on a screen that should not have it. */
  enabled?: boolean | undefined;
  /** Fired when an edge swipe crosses the open threshold. The consumer sets its own controlled `open`; the hook knows nothing about the panel it opens. */
  onOpen: () => void;
}

/**
 * A `PanResponder` for the screen root that opens a controlled `SidePanel` on a swipe from
 * its `side` edge — additive to the trigger, never the only way in (WCAG 2.5.1). The panel
 * has to be controlled: an uncontrolled one exposes nothing to open by hand. Spread the
 * returned `panHandlers` onto the screen's root view; the gesture starts in the `edgeZone`
 * strip (`size.target.comfortable`) at the edge, outside the closed panel's own surface.
 *
 * It follows the same rules as the dismiss swipe, measured toward the content: it claims a
 * move past `dragSlop` (`space.1`), and a release past `dismissDistance` of the window
 * width — the only extent the hook can see, and within a gutter of the panel's own width on
 * a phone — or faster than `dismissVelocity` between the last two move samples opens the
 * panel. The surface itself does not track the finger, since the hook does not own it.
 */
export function useSidePanelEdgeSwipe({
  side = 'start',
  enabled = true,
  onOpen,
}: UseSidePanelEdgeSwipeOptions): { panHandlers: PanResponderInstance['panHandlers'] } {
  const { tokens: t } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isPhysicalLeft = I18nManager.isRTL ? side === 'end' : side === 'start';

  const samplesRef = React.useRef<DragSample[]>([]);
  // The responder is created once and reads the current render's values through this ref.
  const latest = React.useRef({
    enabled,
    isPhysicalLeft,
    windowWidth,
    edgeZone: t.sizeTargetComfortable,
    dragSlop: t.space1,
    onOpen,
  });
  latest.current = {
    enabled,
    isPhysicalLeft,
    windowWidth,
    edgeZone: t.sizeTargetComfortable,
    dragSlop: t.space1,
    onOpen,
  };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    const startsAtEdge = (g: PanResponderGestureState): boolean => {
      const { isPhysicalLeft: left, edgeZone, windowWidth: screenWidth } = latest.current;
      return left ? g.x0 <= edgeZone : g.x0 >= screenWidth - edgeZone;
    };
    // Toward the content, the direction that opens the panel.
    const inward = (g: PanResponderGestureState): number => (latest.current.isPhysicalLeft ? g.dx : -g.dx);
    panResponder.current = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_: GestureResponderEvent, g: PanResponderGestureState) =>
        latest.current.enabled &&
        startsAtEdge(g) &&
        inward(g) > latest.current.dragSlop &&
        Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        samplesRef.current = [];
      },
      onPanResponderMove: (event: GestureResponderEvent, g: PanResponderGestureState) => {
        samplesRef.current = pushSample(samplesRef.current, {
          away: Math.max(0, inward(g)),
          time: event.nativeEvent.timestamp,
        });
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const opened =
          inward(g) > latest.current.windowWidth * CONSTANTS.dismissDistance ||
          sampledVelocity(samplesRef.current) > CONSTANTS.dismissVelocity;
        if (opened) {
          latest.current.onOpen();
        }
      },
    });
  }

  return { panHandlers: panResponder.current.panHandlers };
}
