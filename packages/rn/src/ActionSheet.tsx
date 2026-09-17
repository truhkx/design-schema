import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  PanResponder,
  Pressable,
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

/** One row. `danger` actions are visually distinct and rendered as a group after the others, regardless of their position in the array. */
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
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. The count is guidance, not enforced. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close. When false the Cancel row, the divider above it and the drag handle are not rendered, the scrim and the drag do nothing, and Escape still reports through `onClose`. */
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

/** Schema constants: `dismissDistance` (ratio of sheet height) and `dismissVelocity` (px/ms, PanResponder's own unit). */
const CONSTANTS = {
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity
} as const;

/**
 * ActionSheet — "what can I do with this?" A short list of verbs for one item,
 * reached from an overflow button or a long-press, with the dangerous one grouped
 * last and an explicit Cancel because thumbs miss.
 *
 * When to use: contextual actions on an item — share, rename, duplicate, delete —
 * opened from an overflow `Button` (`iconOnly`, label "More actions") or a long-press.
 * Keep it to what fits without scrolling; more than eight actions means the item
 * needs its own screen. Put destructive actions last with `tone: "danger"`. Not for
 * navigation, settings with state, choosing a value, or confirming — a danger row
 * opens an `AlertDialog`, it does not itself confirm.
 *
 * Renders a native `Modal` (`visible`, `transparent`, `onRequestClose`,
 * `statusBarTranslucent`) with a full-screen scrim `Pressable` and an `Animated.View`
 * surface (`testID="ActionSheet"`, `role="menu"`, `accessibilityViewIsModal`,
 * `accessibilityLabel={heading ?? copy.defaultLabel}`) anchored to the bottom, sliding
 * up with `enter` and `motion.easing.standard` and down with `exit` and
 * `motion.easing.exit`, the scrim fading alongside (instant under reduced motion). The
 * surface composes `FocusScope` (`trapped`, `restoreFocus`, `autoFocus="none"`), `Text`
 * (`size="sm"`, `tone="muted"`, with `fontFamily`, `titleSize` and `lineHeight`
 * forwarded as its overrides) for the heading, `Icon` for each row's glyph and `Button`
 * (`variant="secondary"`) for the Cancel row — never restyled. Rows are `Pressable`s
 * with `role="menuitem"` and `accessibilityState={{ disabled }}`; a press guard, not
 * the native `disabled` prop, makes disabled rows inert so they stay reachable and are
 * announced as disabled. Once the enter transition ends, accessibility focus moves to
 * the first enabled action in display order.
 *
 * A `PanResponder` on the header (handle plus heading) tracks from the first touch with
 * no slop; released past `dismissDistance` of the measured surface height or faster
 * than `dismissVelocity` it fires `onClose('drag')`, otherwise it springs back with
 * `exit` and `motion.easing.standard` (a tap passes neither threshold, so nothing
 * fires). `dismissible={false}` removes the handle, the drag, the Cancel row and its
 * divider and makes the scrim inert; `onRequestClose` (Android back, hardware Escape)
 * and the VoiceOver escape gesture always report `onClose('escape')`. Choosing an
 * action never closes the sheet itself.
 *
 * Native limits: `Pressable` has no key events, so there are no arrow keys, Home/End
 * or roving tabindex — each row is its own accessibility focus stop and Enter/Space
 * are the platform's own activation. There is no wide presentation: the package's
 * `Menu` renders its own trigger and cannot anchor to an external element, so tablets
 * get the sheet too and `maxWidth` has no effect. Rooted in a native `Modal`, the
 * sheet exposes no ref; callers ref their opener.
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

  const [mounted, setMounted] = React.useState(open);
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const surfaceHeightRef = React.useRef(0);
  const itemRefs = React.useRef(new Map<string, ViewInstance>());
  const openRef = React.useRef(open);
  openRef.current = open;

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const itemPaddingBlock = overrides?.itemPaddingBlock ? (resolveToken(t, overrides.itemPaddingBlock) as number) : t.spaceSm;
  const itemPaddingInline = overrides?.itemPaddingInline
    ? (resolveToken(t, overrides.itemPaddingInline) as number)
    : t.layoutInsetMd;
  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const headerPaddingBlock = overrides?.headerPaddingBlock ? (resolveToken(t, overrides.headerPaddingBlock) as number) : t.spaceSm;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapTight;
  const handleHeight = overrides?.handleHeight ? (resolveToken(t, overrides.handleHeight) as number) : t.space1;
  const handleWidth = overrides?.handleWidth ? (resolveToken(t, overrides.handleWidth) as number) : t.space10;
  const handleRadius = overrides?.handleRadius ? (resolveToken(t, overrides.handleRadius) as number) : t.radiusFull;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const dividerColor = overrides?.divider ? (resolveToken(t, overrides.divider) as string) : t.colorBorder;
  const dividerWidth = overrides?.dividerWidth ? (resolveToken(t, overrides.dividerWidth) as number) : t.borderWidthThin;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const normalActions = actions.filter((action) => action.tone !== 'danger');
  const dangerActions = actions.filter((action) => action.tone === 'danger');

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  const focusFirstEnabledAction = (): void => {
    const target = [...normalActions, ...dangerActions].find((action) => action.disabled !== true);
    const node = target ? itemRefs.current.get(target.id) : undefined;
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  };

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      dragY.setValue(0);
      if (reducedMotion) {
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
    if (reducedMotion) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    // Plays from wherever the surface is, including a drag offset left by a dismiss.
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
    // animation's own config and the focus helper are read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCancelPress = (): void => {
    onClose?.('cancel');
  };

  const handleEscape = (): void => {
    onClose?.('escape');
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceHeightRef.current = event.nativeEvent.layout.height;
  };

  const handleActionPress = (id: string): void => {
    onAction?.(id);
  };

  const springBack = (): void => {
    if (reducedMotion) {
      dragY.setValue(0);
      return;
    }
    Animated.timing(dragY, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  };

  // The responder is created once; it reads the current render's values through this ref.
  const latest = React.useRef({ windowHeight, onClose, springBack });
  latest.current = { windowHeight, onClose, springBack };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    panResponder.current = PanResponder.create({
      // No separate slop: a touch on the header starts tracking, and a tap passes neither threshold.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Follows the finger even under reduced motion: the drag is user-driven.
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        dragY.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const sheetHeight = surfaceHeightRef.current > 0 ? surfaceHeightRef.current : latest.current.windowHeight;
        const dismiss = g.dy > sheetHeight * CONSTANTS.dismissDistance || g.vy > CONSTANTS.dismissVelocity;
        if (!dismiss) {
          latest.current.springBack();
          return;
        }
        latest.current.onClose?.('drag');
        // Hold the release position for the exit transition; if the consumer keeps
        // the sheet open, spring back once the update has rendered.
        setTimeout(() => {
          if (openRef.current) {
            latest.current.springBack();
          }
        }, 0);
      },
      onPanResponderTerminate: () => latest.current.springBack(),
    });
  }

  if (!mounted && !open) {
    return null;
  }

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  const entryTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    maxHeight: windowHeight * 0.9, // literal-ok: 90% of the viewport, BottomSheet's height: content cap
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    transform: [{ translateY: Animated.add(entryTranslateY, dragY) }],
  };

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

  const dividerStyle: ViewStyle = {
    borderBottomWidth: dividerWidth,
    borderBottomColor: dividerColor,
  };

  const cancelRowStyle: ViewStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingVertical: headerPaddingBlock,
  };

  const itemRowStyle = (highlighted: boolean, focused: boolean, disabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: itemGap,
    minHeight: t.sizeTargetComfortable,
    paddingVertical: itemPaddingBlock,
    paddingHorizontal: itemPaddingInline,
    backgroundColor: highlighted ? t.colorBackgroundSubtle : 'transparent',
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

  function renderAction(action: ActionSheetAction): React.JSX.Element {
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
  }

  let headingOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  if (overrides?.fontFamily !== undefined || overrides?.titleSize !== undefined || overrides?.lineHeight !== undefined) {
    headingOverrides = { fontFamily: overrides.fontFamily, fontSize: overrides.titleSize, lineHeight: overrides.lineHeight };
  }

  const showHeader = dismissible || heading !== undefined;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleScrimPress} accessible={false} testID="ActionSheet.scrim" />
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="none" restoreFocus>
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
                <View {...(dismissible ? panResponder.current.panHandlers : null)} style={headerStyle} testID="ActionSheet.header">
                  {dismissible ? (
                    <View style={handleStyle} accessibilityElementsHidden importantForAccessibility="no" testID="ActionSheet.handle" />
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
              <View testID="ActionSheet.list">
                {normalActions.map(renderAction)}
                {dangerActions.length > 0 && normalActions.length > 0 ? (
                  <View style={dividerStyle} role="separator" testID="ActionSheet.divider" />
                ) : null}
                {dangerActions.map(renderAction)}
              </View>
              {dismissible ? (
                <>
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
      // itemHover is paint only; RN has no hover on touch, so pressed paints it too.
      style={({ pressed }) => rowStyle(!disabled && (hovered || pressed), focused, disabled)}
      testID="ActionSheet.item"
    >
      {action.icon !== undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no" testID="ActionSheet.itemIcon">
          <Icon name={action.icon} color={iconColor} />
        </View>
      ) : null}
      <RNText numberOfLines={1} style={labelStyle}>
        {action.label}
      </RNText>
    </Pressable>
  );
}
