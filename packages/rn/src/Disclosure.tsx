import * as React from 'react';
import { Animated, I18nManager, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { PressableStateCallbackType, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

/** Heading level for the trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/**
 * Why the state changed. `keyboard` never fires natively — `Pressable` cannot tell a
 * hardware Enter/Space activation from a touch — so a trigger press always reports
 * `pointer`; `controlled` is a consumer-driven `open` prop change.
 */
export type DisclosureToggleReason = 'pointer' | 'keyboard' | 'controlled';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DisclosureOverridableBinding =
  | 'triggerPaddingBlock'
  | 'triggerPaddingInline'
  | 'triggerGap'
  | 'triggerFontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight'
  | 'triggerRadius'
  | 'panelPaddingBlock'
  | 'panelPaddingInline'
  | 'disabledOpacity'
  | 'transition';

export interface DisclosureProps {
  /** The trigger's label. Also the trigger's accessible name. Says what will be revealed. */
  summary: string;
  /** The content of the panel. Rendered only while open (not merely hidden). A plain string is wrapped in the system `Text`. */
  children: React.ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean | undefined;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean | undefined;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean | undefined;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields, so the Form still collects them while the disclosure is closed. */
  keepMounted?: boolean | undefined;
  /**
   * When set, the summary is marked `accessibilityRole="header"` so the disclosure
   * appears in the screen reader's heading list. Native has no heading levels, so the
   * value itself changes nothing beyond that.
   */
  headingLevel?: DisclosureHeadingLevel | undefined;
  /** Fired after the state changes, with the new boolean `open` and a reason. */
  onToggle?: ((open: boolean, reason: DisclosureToggleReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

/** Chevron rotation: pointing along the reading direction when closed, down when open. */
const CHEVRON_CLOSED = '0deg';
const CHEVRON_OPEN = '90deg';
/** `chevron-left` points the other way, so it turns the other way to land on the same down-pointing shape. */
const CHEVRON_OPEN_RTL = '-90deg';

/**
 * Disclosure — a button that reveals content beneath it. Deliberately plain: no
 * border, no card, no animation of the panel.
 *
 * When to use: hide secondary content that some users need and most do not —
 * optional settings, long explanations, FAQ answers. Stack several to make an
 * accordion; each is independent. Do not hide content most users need, and do not
 * use it as a fake tab set.
 *
 * Renders a `Pressable` trigger with `accessibilityRole="button"`,
 * `accessibilityLabel={summary}` and `accessibilityState={{ expanded, disabled }}`,
 * containing the chevron `Icon` and the summary text (`accessibilityRole="header"`
 * when `headingLevel` is set). The panel renders below only while open, or with
 * `display: 'none'` and hidden from accessibility while closed under `keepMounted`.
 * There is no `aria-controls` equivalent, and focus cannot be handed back to the
 * trigger when the panel closes (native has no focus-within). The chevron mirrors to
 * `chevron-left` under `I18nManager.isRTL` and rotates over `transition`, snapping
 * under reduced motion.
 */
export function Disclosure({
  summary,
  children,
  open,
  defaultOpen = false,
  disabled = false,
  keepMounted = false,
  headingLevel,
  onToggle,
  overrides,
  ref,
}: DisclosureProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rtl = I18nManager.isRTL;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  // A controlled `open` change the trigger's own press already reported ('pointer') is not
  // reported again; one the consumer made on their own fires with 'controlled'.
  const mountedRef = React.useRef(false);
  const previousOpenRef = React.useRef(isOpen);
  const selfEmittedRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousOpenRef.current = isOpen;
      return;
    }
    if (isControlled && previousOpenRef.current !== isOpen && selfEmittedRef.current !== isOpen) {
      onToggle?.(isOpen, 'controlled');
    }
    selfEmittedRef.current = null;
    previousOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isControlled]);

  const triggerPaddingBlock = overrides?.triggerPaddingBlock
    ? (resolveToken(t, overrides.triggerPaddingBlock) as number)
    : t.spaceSm;
  const triggerPaddingInline = overrides?.triggerPaddingInline
    ? (resolveToken(t, overrides.triggerPaddingInline) as number)
    : t.spaceSm;
  const triggerGap = overrides?.triggerGap ? (resolveToken(t, overrides.triggerGap) as number) : t.space2;
  const triggerFontFamily = overrides?.triggerFontFamily
    ? (resolveToken(t, overrides.triggerFontFamily) as string)
    : t.fontFamilyBody;
  const triggerFontSize = overrides?.triggerFontSize
    ? (resolveToken(t, overrides.triggerFontSize) as number)
    : t.fontSizeMd;
  const triggerFontWeight = overrides?.triggerFontWeight
    ? (resolveToken(t, overrides.triggerFontWeight) as number)
    : t.fontWeightMedium;
  const triggerRadius = overrides?.triggerRadius ? (resolveToken(t, overrides.triggerRadius) as number) : t.radiusMd;
  const panelPaddingBlock = overrides?.panelPaddingBlock
    ? (resolveToken(t, overrides.panelPaddingBlock) as number)
    : t.spaceSm;
  const panelPaddingInline = overrides?.panelPaddingInline
    ? (resolveToken(t, overrides.panelPaddingInline) as number)
    : t.spaceSm;
  const disabledOpacity = overrides?.disabledOpacity
    ? (resolveToken(t, overrides.disabledOpacity) as number)
    : t.opacityDisabled;
  const transitionDuration = overrides?.transition
    ? (resolveToken(t, overrides.transition) as number)
    : t.motionDurationBase;

  // `useReducedMotion` reads `false` until the OS answers, so the first run snaps rather
  // than trusting it: nothing animates on first render.
  const animationReadyRef = React.useRef(false);
  React.useEffect(() => {
    const toValue = isOpen ? 1 : 0;
    if (reducedMotion || !animationReadyRef.current) {
      animationReadyRef.current = true;
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      // A transform, not a layout prop; react-native-web has no native animated module.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isOpen, reducedMotion, rotation, transitionDuration, t.motionEasingStandard]);

  const handlePress = (): void => {
    if (disabled) {
      return;
    }
    const next = !isOpen;
    if (isControlled) {
      selfEmittedRef.current = next;
    } else {
      setInternalOpen(next);
    }
    onToggle?.(next, 'pointer');
  };

  const triggerStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: triggerGap,
    minHeight: t.sizeTargetMin,
    minWidth: t.sizeTargetMin,
    paddingVertical: triggerPaddingBlock,
    paddingHorizontal: triggerPaddingInline,
    borderRadius: triggerRadius,
    backgroundColor: (pressed || hovered) && !disabled ? t.colorBackgroundSubtle : 'transparent',
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
    opacity: disabled ? disabledOpacity : 1,
  });

  const summaryStyle: TextStyle = {
    fontFamily: triggerFontFamily,
    fontSize: triggerFontSize,
    fontWeight: toFontWeight(triggerFontWeight),
    lineHeight: toLineHeight(triggerFontSize, t.fontLineHeightNormal),
    color: t.colorForeground,
    flexShrink: 1,
  };

  const chevronStyle: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: [CHEVRON_CLOSED, rtl ? CHEVRON_OPEN_RTL : CHEVRON_OPEN],
        }),
      },
    ],
  };

  const panelStyle: ViewStyle = {
    paddingVertical: panelPaddingBlock,
    paddingHorizontal: panelPaddingInline,
    display: isOpen ? 'flex' : 'none',
  };

  return (
    <View ref={ref} testID="Disclosure">
      <Pressable
        testID="Disclosure.trigger"
        accessibilityRole="button"
        accessibilityLabel={summary}
        accessibilityState={{ expanded: isOpen, disabled }}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        style={triggerStyle}
      >
        <Animated.View testID="Disclosure.triggerIcon" style={chevronStyle}>
          {/* The glyph tracks the trigger text through the same token as `triggerFontSize`. */}
          <Icon
            name={rtl ? 'chevron-left' : 'chevron-right'}
            color={t.colorForegroundMuted}
            overrides={{ size: overrides?.triggerFontSize ?? 'font.size.md' }}
          />
        </Animated.View>
        <RNText accessibilityRole={headingLevel !== undefined ? 'header' : undefined} style={summaryStyle}>
          {summary}
        </RNText>
      </Pressable>
      {isOpen || keepMounted ? (
        <View
          testID="Disclosure.panel"
          style={panelStyle}
          accessibilityElementsHidden={!isOpen}
          importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
        >
          {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
        </View>
      ) : null}
    </View>
  );
}
