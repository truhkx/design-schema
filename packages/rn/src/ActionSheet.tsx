import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  PanResponderInstance,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
import type { TextOverridableBinding } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

export type ActionSheetActionTone = 'default' | 'danger';

/**
 * One row. `danger` actions are visually distinct and rendered as a group after the
 * others, regardless of their position in the array. Every optional field also accepts
 * an explicit `undefined`, since `Menu` builds these objects that way under
 * `exactOptionalPropertyTypes`.
 */
export type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
};

/** Why `onClose` fired. */
export type ActionSheetCloseReason = 'escape' | 'scrim' | 'cancel' | 'drag';

/** The style bindings a caller may replace with a different token; `surface`, `handle`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `maxWidth`, `focusRing` and `focusRingWidth` are locked. */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'headerPaddingBlock'
  | 'headerGap'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
  | 'titleSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'layer'
  | 'enter'
  | 'exit';

export interface ActionSheetProps {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a dismissal through `onClose` and reports a choice through `onAction`, and the consumer sets `open` to false for both. */
  open: boolean;
  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; when omitted the name is `copy.defaultLabel`. */
  heading?: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. The count is guidance, not enforced: no dev warning outside that range. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close. When false the Cancel row, the divider above it and the drag handle are not rendered, the scrim and the drag do nothing, and Escape still reports through `onClose`; with no `heading` either, the header is not rendered at all. */
  dismissible?: boolean | undefined;
  /** Label of the explicit cancel row. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: ((id: string) => void) | undefined;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: ((reason: ActionSheetCloseReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  cancelLabel: 'Cancel',
  defaultLabel: 'Actions',
} as const;

/** Schema constants without a token; `dragSlop` has one (`space.1`) and is read from the theme. */
const CONSTANTS = {
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance (ratio of sheet height)
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity (px/ms)
} as const;

interface DragSample {
  dy: number;
  time: number;
}

/**
 * ActionSheet — "what can I do with this?" A short list of verbs for one item,
 * reached from an overflow button or a long-press, with the dangerous ones grouped
 * last and an explicit Cancel because thumbs miss.
 *
 * When to use: contextual actions on an item — share, rename, duplicate, delete —
 * opened from an overflow `Button` (`iconOnly`, label "More actions") or a long-press.
 * Keep it to what fits without scrolling; more than eight actions means the item needs
 * its own screen. Put destructive actions last with `tone: "danger"`. Not for
 * navigation, for settings with state, for choosing a value, or for confirming — a
 * danger row opens an `AlertDialog`, it does not itself confirm.
 *
 * Renders a native `Modal` (`visible`, `transparent`, `onRequestClose`,
 * `statusBarTranslucent`) holding a scrim `Pressable` and, inside a `FocusScope`
 * (`trapped`, `restoreFocus`, `autoFocus="none"`, `active` following `open`), an
 * `Animated.View` surface anchored to the bottom that carries `testID="ActionSheet"`,
 * `role="menu"`, `accessibilityViewIsModal` and
 * `accessibilityLabel={heading ?? copy.defaultLabel}` — there is no separate
 * `ActionSheet.surface`. It slides up with `enter` and `motion.easing.standard` and
 * down with `exit` and `motion.easing.exit`, the scrim fading with the same duration
 * and easing, instantly under reduced motion. The sheet sizes to its content up to 90%
 * of the window and the list scrolls inside it.
 *
 * The heading composes `Text` (`size="sm"`, `tone="muted"`) with `fontFamily`,
 * `titleSize` and `lineHeight` always passed through its `overrides` as the resolved
 * token — the default or the caller's — since `Text` otherwise sets its own; `Icon`
 * draws each row's glyph and `Button` (`variant="secondary"`) the Cancel row, each in a
 * wrapping View carrying the part's testID. Rows are `Pressable`s with `role="menuitem"`
 * and `accessibilityState={{ disabled }}`; a press guard, not the native `disabled`
 * prop, makes a disabled row inert so it stays reachable and is announced as disabled.
 * Once the enter transition ends, accessibility focus moves to the first enabled action
 * in display order (the default group, then danger). Two dividers, two rules: the
 * danger-group divider sits among the rows as `role="separator"` and is drawn only when
 * both groups exist; the cancel divider sits above the Cancel row whenever that row is
 * rendered and is hidden from assistive technology.
 *
 * A `PanResponder` on the header (handle and heading) claims a move once it passes
 * `dragSlop` (`space.1`) downward, so a tap is not a drag and nothing fires; the offset
 * counts from where the slop was crossed, so the surface does not jump, and it follows
 * the finger even under reduced motion. On release past `dismissDistance` of the
 * measured surface height, or faster than `dismissVelocity` between the last two move
 * samples (from `nativeEvent.timestamp`, not PanResponder's averaged `vy`), it fires
 * `onClose('drag')` and holds the released offset until the consumer's update renders:
 * `open` false plays the exit from there, `open` still true springs back over `exit`
 * with `motion.easing.standard`. `dismissible={false}` removes the handle, the drag, the
 * Cancel row and its divider and makes the scrim inert; `onRequestClose` (Android back,
 * a hardware Escape) and the VoiceOver escape gesture always report `onClose('escape')`.
 * Choosing an action never closes the sheet itself.
 *
 * Native limits: `Pressable` has no key events, so there are no arrow keys, no Home/End
 * and no roving tabindex — each row is its own accessibility focus stop reached by swipe
 * and Enter/Space are the platform's own activation. There is no wide presentation: the
 * package's `Menu` renders its own trigger and cannot anchor to an external element, so
 * tablets above `maxWidth` get the sheet too and `maxWidth` has no effect here. Rooted
 * in a native `Modal`, the sheet exposes no ref; callers ref their opener.
 */
export function ActionSheet({
  open,
  heading,
  actions,
  dismissible = true,
  cancelLabel,
  onAction,
  onClose,
  overrides,
}: ActionSheetProps): React.JSX.Element | null {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();

  const resolvedCancelLabel = cancelLabel ?? COPY.cancelLabel;
  const accessibleName = heading ?? COPY.defaultLabel;

  // Kept mounted while the exit animation runs; derived during render so the Modal content exists on the open commit.
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  // Bumped after a drag dismiss so an effect can read `open` once the consumer's update has rendered.
  const [dragReleases, setDragReleases] = React.useState(0);

  const progress = React.useRef(new Animated.Value(0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const surfaceHeightRef = React.useRef(0);
  const samplesRef = React.useRef<DragSample[]>([]);
  // Where the slop was crossed; the drag offset counts from there.
  const grantDyRef = React.useRef(0);
  const itemRefs = React.useRef(new Map<string, ViewInstance>());

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const itemPaddingBlock = overrides?.itemPaddingBlock
    ? (resolveToken(t, overrides.itemPaddingBlock) as number)
    : t.spaceSm;
  const itemPaddingInline = overrides?.itemPaddingInline
    ? (resolveToken(t, overrides.itemPaddingInline) as number)
    : t.layoutInsetMd;
  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const headerPaddingBlock = overrides?.headerPaddingBlock
    ? (resolveToken(t, overrides.headerPaddingBlock) as number)
    : t.spaceSm;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapTight;
  const handleHeight = overrides?.handleHeight ? (resolveToken(t, overrides.handleHeight) as number) : t.space1;
  const handleWidth = overrides?.handleWidth ? (resolveToken(t, overrides.handleWidth) as number) : t.space10;
  const handleRadius = overrides?.handleRadius ? (resolveToken(t, overrides.handleRadius) as number) : t.radiusFull;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight
    ? (resolveToken(t, overrides.lineHeight) as number)
    : t.fontLineHeightNormal;
  const dividerColor = overrides?.divider ? (resolveToken(t, overrides.divider) as string) : t.colorBorder;
  const dividerWidth = overrides?.dividerWidth ? (resolveToken(t, overrides.dividerWidth) as number) : t.borderWidthThin;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  // The schema constant `dragSlop`; a constant, not an overridable binding.
  const dragSlop = t.space1;

  // The handle and the drag only exist where dismissing does something, so no affordance lies.
  const canDrag = dismissible;

  // Display order: the default group, then the danger group, whatever the array order.
  const defaultActions = actions.filter((action) => action.tone !== 'danger');
  const dangerActions = actions.filter((action) => action.tone === 'danger');

  const focusFirstEnabledAction = (): void => {
    const target = [...defaultActions, ...dangerActions].find((action) => action.disabled !== true);
    const node = target ? itemRefs.current.get(target.id) : undefined;
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };

  const springBack = (): void => {
    if (reducedMotion || exitDuration === 0) {
      dragY.setValue(0);
      return;
    }
    // A timing animation, not a spring: the theme's motion never bounces.
    Animated.timing(dragY, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  };

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      dragY.setValue(0);
      if (reducedMotion || enterDuration === 0) {
        progress.setValue(1);
        focusFirstEnabledAction();
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
          focusFirstEnabledAction();
        }
      });
      return () => animation.stop();
    }
    if (reducedMotion || exitDuration === 0) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    // Plays from wherever the surface is, including the offset a drag dismiss left it at.
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
    // Runs on the open/closed transition and the mount gate it drives; the animation
    // config and the focus helper are read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  React.useEffect(() => {
    // The release and the consumer's `setState` batch into one render, so `open` here is
    // the consumer's answer to the dismiss: still true means spring back to rest, which
    // also finishes an enter animation the drag interrupted.
    if (dragReleases > 0 && open) {
      springBack();
    }
    // Only a drag release triggers this check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragReleases]);

  // The responder is created once; it reads the current render's values through this ref.
  const latest = React.useRef({ dragSlop, windowHeight, onClose, springBack });
  latest.current = { dragSlop, windowHeight, onClose, springBack };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    const claims = (_: GestureResponderEvent, g: PanResponderGestureState): boolean =>
      g.dy > latest.current.dragSlop && Math.abs(g.dy) > Math.abs(g.dx);
    panResponder.current = PanResponder.create({
      // Capture so a drag that started on the heading is taken over by the header — but
      // only past the slop, so a shorter press is not a drag and nothing fires.
      onMoveShouldSetPanResponderCapture: claims,
      onMoveShouldSetPanResponder: claims,
      onPanResponderGrant: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        samplesRef.current = [];
        grantDyRef.current = g.dy;
      },
      // Follows the finger even under reduced motion: the drag is user-driven.
      onPanResponderMove: (event: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, g.dy - grantDyRef.current);
        dragY.setValue(offset);
        const sample: DragSample = { dy: offset, time: event.nativeEvent.timestamp };
        samplesRef.current = [samplesRef.current[samplesRef.current.length - 1] ?? sample, sample];
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, g.dy - grantDyRef.current);
        const [previous, last] = samplesRef.current;
        const elapsed = previous !== undefined && last !== undefined ? last.time - previous.time : 0;
        // Between the last two move samples, and only downward speed counts.
        const velocity =
          previous !== undefined && last !== undefined && elapsed > 0
            ? Math.max(0, (last.dy - previous.dy) / elapsed)
            : 0;
        const sheetHeight = surfaceHeightRef.current > 0 ? surfaceHeightRef.current : latest.current.windowHeight;
        const dismiss = offset > sheetHeight * CONSTANTS.dismissDistance || velocity > CONSTANTS.dismissVelocity;
        if (!dismiss) {
          latest.current.springBack();
          return;
        }
        latest.current.onClose?.('drag');
        setDragReleases((count) => count + 1);
      },
      onPanResponderTerminate: () => latest.current.springBack(),
    });
  }

  if (!mounted) {
    return null;
  }

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCancelPress = (): void => {
    onClose?.('cancel');
  };

  // Android back, a hardware Escape and the VoiceOver escape gesture: always reported,
  // even when not dismissible; the consumer decides.
  const handleEscape = (): void => {
    onClose?.('escape');
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceHeightRef.current = event.nativeEvent.layout.height;
  };

  const handleActionPress = (id: string): void => {
    onAction?.(id);
  };

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    // The sheet sizes to its content up to BottomSheet's `height: content` cap.
    maxHeight: windowHeight * 0.9, // literal-ok: 90% of the window, BottomSheet's content cap
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    transform: [
      {
        translateY: Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] }), dragY),
      },
    ],
  };

  // The header has no inline binding of its own: it takes the rows' inline padding.
  const headerStyle: ViewStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingVertical: headerPaddingBlock,
    gap: headerGap,
  };

  const handleStyle: ViewStyle = {
    alignSelf: 'center',
    width: handleWidth,
    height: handleHeight,
    borderRadius: handleRadius,
    backgroundColor: t.colorForegroundMuted,
  };

  // Everything past the cap scrolls; below it the list is exactly as tall as its rows.
  const listStyle: ViewStyle = { flexGrow: 0, flexShrink: 1 };

  const dividerStyle: ViewStyle = {
    borderBottomWidth: dividerWidth,
    borderBottomColor: dividerColor,
  };

  // Its vertical padding is headerPaddingBlock, its inline padding the rows'.
  const cancelRowStyle: ViewStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingVertical: headerPaddingBlock,
  };

  const itemRowStyle = (highlighted: boolean, focused: boolean, disabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    // Between icon and label; the rows' own rhythm is itemPaddingBlock, not a gap.
    gap: itemGap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: itemPaddingBlock,
    paddingHorizontal: itemPaddingInline,
    backgroundColor: highlighted ? t.colorBackgroundSubtle : 'transparent',
    // Always drawn so the focus ring costs no layout shift.
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
    opacity: disabled ? t.opacityDisabled : 1,
  });

  const itemLabelStyle = (danger: boolean): TextStyle => ({
    flexShrink: 1,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: danger ? t.colorForegroundDanger : t.colorForeground,
  });

  const registerItemRef =
    (id: string) =>
    (node: ViewInstance | null): void => {
      if (node) itemRefs.current.set(id, node);
      else itemRefs.current.delete(id);
    };

  const renderAction = (action: ActionSheetAction): React.JSX.Element => {
    const danger = action.tone === 'danger';
    return (
      <ActionSheetItemRow
        key={action.id}
        action={action}
        registerRef={registerItemRef(action.id)}
        rowStyle={itemRowStyle}
        labelStyle={itemLabelStyle(danger)}
        iconColor={danger ? t.colorForegroundDanger : t.colorForeground}
        onActivate={handleActionPress}
      />
    );
  };

  // Always sent: Text otherwise applies its own family, size and line height, so the
  // sheet's resolved value — the default token or the caller's override — is passed on.
  const headingOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
    fontFamily: overrides?.fontFamily ?? 'font.family.body',
    fontSize: overrides?.titleSize ?? 'font.size.sm',
    lineHeight: overrides?.lineHeight ?? 'font.lineHeight.normal',
  };

  // With nothing to show the header is not rendered at all — no empty padded strip.
  const showHeader = canDrag || heading !== undefined;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleScrimPress}
            accessible={false}
            testID="ActionSheet.scrim"
          />
        </Animated.View>
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={open} autoFocus="none" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              role="menu"
              accessibilityViewIsModal
              accessibilityLabel={accessibleName}
              onAccessibilityEscape={handleEscape}
              testID="ActionSheet"
            >
              {showHeader ? (
                <View
                  {...(canDrag ? panResponder.current.panHandlers : undefined)}
                  style={headerStyle}
                  testID="ActionSheet.header"
                >
                  {canDrag ? (
                    <View
                      style={handleStyle}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                      testID="ActionSheet.handle"
                    />
                  ) : null}
                  {heading !== undefined ? (
                    <View testID="ActionSheet.heading">
                      <Text size="sm" tone="muted" overrides={headingOverrides}>
                        {heading}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <ScrollView style={listStyle} testID="ActionSheet.list">
                {defaultActions.map(renderAction)}
                {/* Drawn only when both groups exist, and exposed: it separates the menu's rows. */}
                {dangerActions.length > 0 && defaultActions.length > 0 ? (
                  <View style={dividerStyle} role="separator" testID="ActionSheet.divider" />
                ) : null}
                {dangerActions.map(renderAction)}
              </ScrollView>
              {dismissible ? (
                <>
                  {/* Decorative: it only sets the Cancel row apart from the actions. */}
                  <View
                    style={dividerStyle}
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    testID="ActionSheet.divider"
                  />
                  <View style={cancelRowStyle} testID="ActionSheet.cancelButton">
                    <Button label={resolvedCancelLabel} variant="secondary" onPress={handleCancelPress} />
                  </View>
                </>
              ) : null}
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}

interface ActionSheetItemRowProps {
  action: ActionSheetAction;
  registerRef: (node: ViewInstance | null) => void;
  rowStyle: (highlighted: boolean, focused: boolean, disabled: boolean) => ViewStyle;
  labelStyle: TextStyle;
  iconColor: string;
  onActivate: (id: string) => void;
}

/** One action row. Its own component so focus and hover state do not re-render the whole list. */
function ActionSheetItemRow({
  action,
  registerRef,
  rowStyle,
  labelStyle,
  iconColor,
  onActivate,
}: ActionSheetItemRowProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const disabled = action.disabled === true;

  return (
    <Pressable
      ref={registerRef}
      role="menuitem"
      accessibilityLabel={action.label}
      accessibilityState={{ disabled }}
      // Never the native `disabled` prop: it would drop the row from the focus order.
      onPress={() => {
        if (!disabled) onActivate(action.id);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      // itemHover is paint only; React Native has no hover on touch, so pressed paints it too.
      style={({ pressed }) => rowStyle(!disabled && (hovered || pressed), focused, disabled)}
      testID="ActionSheet.item"
    >
      {action.icon !== undefined ? (
        // The glyph is hidden inside the control, never the control itself: the label names the row.
        <View accessibilityElementsHidden importantForAccessibility="no" testID="ActionSheet.itemIcon">
          <Icon name={action.icon} color={iconColor} />
        </View>
      ) : null}
      <RNText style={labelStyle}>{action.label}</RNText>
    </Pressable>
  );
}
