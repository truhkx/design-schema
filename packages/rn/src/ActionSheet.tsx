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
import type { LayoutChangeEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
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

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'headerPaddingBlock'
  | 'titleSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

export interface ActionSheetProps {
  /** Controlled visibility. */
  open: boolean;
  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; when omitted the name is `copy.defaultLabel`. */
  heading?: string | undefined;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close; Escape still reports through `onClose` when false, as in Dialog. */
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

const DRAG_DISMISS_RATIO = 0.25; // literal-ok: fraction of sheet height past which a drag dismisses, matching BottomSheet
const DRAG_DISMISS_VELOCITY = 1.5; // literal-ok: release velocity (px/ms) past which a drag dismisses regardless of distance

/**
 * ActionSheet — "what can I do with this?" A short list of verbs for one item,
 * reached from an overflow button or a long-press, with the dangerous one grouped
 * last and an explicit Cancel because thumbs miss.
 *
 * When to use: Use for contextual actions on an item — share, rename, duplicate,
 * delete — opened from an overflow `Button` (`iconOnly`, label "More actions") or a
 * long-press. Keep it to what fits without scrolling; more than eight actions means
 * the item needs its own screen. Put destructive actions last with `tone: "danger"`.
 * Do not use it for navigation, for settings with state, for choosing a value, or to
 * confirm a decision — its danger row opens an `AlertDialog`, it does not itself
 * confirm.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * scrim `Pressable` and an `Animated.View` surface anchored to the bottom, sliding up
 * on open (skipped under reduced motion). The surface composes `FocusScope`
 * (`trapped`, `restoreFocus`) for the trap and focus-restore-on-close, a handle bar
 * (as `BottomSheet`'s), the system `Text` (`size="sm"`, `tone="muted"`) for the
 * heading, `Icon` for each row's glyph and `Button` (`variant="secondary"`) for the
 * explicit Cancel row — never restyled directly. Rows are `Pressable`s with
 * `accessibilityRole="menuitem"` and `accessibilityState={{ disabled }}` — never the
 * native `disabled` prop, which would drop them from the focus order; a press guard
 * makes disabled rows inert instead. Once the enter animation finishes (or
 * immediately under reduced motion), accessibility focus moves to the first enabled
 * action via `AccessibilityInfo.setAccessibilityFocus`. A `PanResponder` on the
 * header (the handle plus the heading area, always present so there is always a drag
 * target) tracks a downward drag; past 25% of the measured surface height or a fast
 * flick, it fires `onClose('drag')` and continues the motion off-screen with
 * `Animated.decay` at the release velocity (instant, no decay, under reduced
 * motion); otherwise it springs back. `dismissible` (default `true`) gates the
 * scrim, the Cancel row (disabled, not removed, like `BottomSheet`'s close button)
 * and the drag; Escape always reports through `onClose('escape')` regardless, the
 * same convention `Dialog` and `BottomSheet` use. Choosing an action does not close
 * the sheet itself: `onAction` reports the id and the consumer decides, exactly like
 * the web/Lit doc describes ("the consumer performs it and closes").
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * ArrowUp/ArrowDown/Home/End movement and the roving-tabindex model the web doc
 * describes have no equivalent here — each row is instead its own Tab stop, the same
 * convention `Menu` and `RadioGroup` use; Enter/Space activate a focused row through
 * the platform's own accessibility action. The wide-screen presentation ("above
 * `maxWidth`, renders as a `Menu` anchored to the trigger") is not implemented: the
 * package's `Menu` always renders its own trigger `Button` and has no way to anchor
 * to an element rendered elsewhere in the tree, so composing it here would mean
 * duplicating its positioning logic rather than reusing it. ActionSheet therefore
 * always presents as the phone sheet, on tablets too — the mirror image of the limit
 * `Menu`'s own doc comment already acknowledges. The `maxWidth` override is
 * consequently a no-op: the binding governs a breakpoint this platform does not
 * switch on.
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
}: ActionSheetProps): React.JSX.Element {
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

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const itemPaddingBlock = overrides?.itemPaddingBlock ? (resolveToken(t, overrides.itemPaddingBlock) as number) : t.spaceSm;
  const itemPaddingInline = overrides?.itemPaddingInline
    ? (resolveToken(t, overrides.itemPaddingInline) as number)
    : t.layoutInsetMd;
  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const headerPaddingBlock = overrides?.headerPaddingBlock ? (resolveToken(t, overrides.headerPaddingBlock) as number) : t.spaceSm;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const dividerColor = overrides?.divider ? (resolveToken(t, overrides.divider) as string) : t.colorBorder;
  const dividerWidth = overrides?.dividerWidth ? (resolveToken(t, overrides.dividerWidth) as number) : t.borderWidthThin;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const minTarget = t.sizeTargetComfortable;
  const itemHoverColor = t.colorBackgroundSubtle;
  const itemColor = t.colorForeground;
  const itemDangerColor = t.colorForegroundDanger;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;

  const normalActions = actions.filter((action) => action.tone !== 'danger');
  const dangerActions = actions.filter((action) => action.tone === 'danger');

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  const registerItemRef = (id: string) => (node: ViewInstance | null): void => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  const focusFirstEnabledAction = React.useCallback(() => {
    const target = actions.find((action) => action.disabled !== true);
    const node = target ? itemRefs.current.get(target.id) : null;
    const handle = node ? findNodeHandle(node) : null;
    if (handle != null) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, [actions]);

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
    // animation's own config and the focus callback are read fresh each run rather
    // than tracked as deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  React.useEffect(() => {
    if (__DEV__ && actions.length === 0) {
      console.warn('ActionSheet: `actions` is empty; the sheet would open with nothing to choose.');
    } else if (__DEV__ && actions.length > 8) {
      console.warn('ActionSheet: more than eight actions; consider giving this item its own screen instead.');
    }
  }, [actions]);

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCancelPress = (): void => {
    onClose?.('cancel');
  };

  const handleRequestClose = (): void => {
    onClose?.('escape');
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceHeightRef.current = event.nativeEvent.layout.height;
  };

  const handleActionPress = (action: ActionSheetAction): void => {
    if (action.disabled === true) {
      return;
    }
    onAction?.(action.id);
  };

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        // False at touch-start so a tap on the heading is not stolen by the responder;
        // only an actual downward drag claims it.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          dismissible && gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            dragY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = (surfaceHeightRef.current || windowHeight * 0.5) * DRAG_DISMISS_RATIO;
          const shouldDismiss = gestureState.dy > threshold || gestureState.vy > DRAG_DISMISS_VELOCITY;
          if (shouldDismiss) {
            onClose?.('drag');
            if (reducedMotion) {
              dragY.setValue(windowHeight);
            } else {
              Animated.decay(dragY, {
                velocity: Math.max(gestureState.vy, 0.5),
                deceleration: 0.998,
                useNativeDriver: false,
              }).start();
            }
            return;
          }
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
        },
        onPanResponderTerminate: () => {
          if (reducedMotion) {
            dragY.setValue(0);
            return;
          }
          Animated.timing(dragY, { toValue: 0, duration: exitDuration, useNativeDriver: false }).start();
        },
      }),
    [dismissible, dragY, windowHeight, onClose, reducedMotion, exitDuration, t.motionEasingStandard],
  );

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
    maxHeight: windowHeight * 0.9, // literal-ok: proportion of viewport, matching BottomSheet's "content" sizing
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
    transform: [{ translateY: Animated.add(entryTranslateY, dragY) }],
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: itemPaddingInline,
    paddingVertical: headerPaddingBlock,
    gap: t.layoutGapTight, // not named by any binding; matches BottomSheet's handle-to-heading gap
  };

  const handleStyle: ViewStyle = {
    alignSelf: 'center',
    width: t.space10,
    height: t.space1,
    borderRadius: t.radiusFull,
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

  const itemRowStyle = (focused: boolean, disabled: boolean): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: itemGap,
    minHeight: minTarget,
    paddingVertical: itemPaddingBlock,
    paddingHorizontal: itemPaddingInline,
    backgroundColor: focused ? itemHoverColor : 'transparent',
    borderWidth: focusRingWidth,
    borderColor: focused ? focusRingColor : 'transparent',
    opacity: disabled ? t.opacityDisabled : 1,
  });

  const itemLabelStyle = (danger: boolean): TextStyle => ({
    flexShrink: 1,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: danger ? itemDangerColor : itemColor,
  });

  function renderAction(action: ActionSheetAction): React.JSX.Element {
    const danger = action.tone === 'danger';
    return (
      <ActionSheetItemRow
        key={action.id}
        action={action}
        registerRef={registerItemRef(action.id)}
        rowStyle={itemRowStyle}
        labelStyle={itemLabelStyle(danger)}
        iconColor={danger ? itemDangerColor : itemColor}
        onActivate={() => handleActionPress(action)}
      />
    );
  }

  return (
    <Modal visible={mounted} transparent onRequestClose={handleRequestClose} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleScrimPress}
          accessible={false}
          testID="ActionSheet.scrim"
        />
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="none" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              accessibilityViewIsModal
              accessibilityRole="menu"
              accessibilityLabel={accessibleName}
              testID="ActionSheet"
            >
              <View {...panResponder.panHandlers} style={headerStyle} testID="ActionSheet.header">
                <View style={handleStyle} accessibilityElementsHidden importantForAccessibility="no" testID="ActionSheet.handle" />
                {heading !== undefined ? (
                  <Text size="sm" tone="muted" overrides={{ fontSize: overrides?.titleSize, fontFamily: overrides?.fontFamily }}>
                    {heading}
                  </Text>
                ) : null}
              </View>
              <View testID="ActionSheet.list">
                {normalActions.map((action) => renderAction(action))}
                {dangerActions.length > 0 ? (
                  <>
                    <View style={dividerStyle} />
                    {dangerActions.map((action) => renderAction(action))}
                  </>
                ) : null}
              </View>
              <View style={dividerStyle} />
              <View style={cancelRowStyle}>
                <Button
                  label={resolvedCancelLabel}
                  variant="secondary"
                  disabled={!dismissible}
                  onPress={handleCancelPress}
                />
              </View>
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
  rowStyle: (focused: boolean, disabled: boolean) => ViewStyle;
  labelStyle: TextStyle;
  iconColor: string;
  onActivate: () => void;
}

/** One action row. Its own component so focus state does not re-render the whole list. */
function ActionSheetItemRow({
  action,
  registerRef,
  rowStyle,
  labelStyle,
  iconColor,
  onActivate,
}: ActionSheetItemRowProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const disabled = action.disabled === true;

  return (
    <Pressable
      ref={registerRef}
      accessibilityRole="menuitem"
      accessibilityLabel={action.label}
      accessibilityState={{ disabled }}
      // Never the native `disabled` prop: it would drop the row from the focus order.
      onPress={() => {
        if (!disabled) {
          onActivate();
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={rowStyle(focused, disabled)}
      testID="ActionSheet.item"
    >
      {action.icon !== undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={action.icon} color={iconColor} />
        </View>
      ) : null}
      <RNText numberOfLines={1} style={labelStyle}>
        {action.label}
      </RNText>
    </Pressable>
  );
}
