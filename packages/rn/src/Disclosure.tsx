import * as React from 'react';
import { Animated, I18nManager, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

/** Heading level for the trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

/**
 * Why the state changed. `keyboard` never fires natively — `Pressable` has no way to
 * distinguish a hardware Enter/Space activation from a touch (the same limit `Accordion`
 * documents) — so a trigger press always reports `pointer`; `controlled` is a consumer-driven
 * `open` prop change.
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
  /** The content of the panel. Rendered only while open (not merely hidden). */
  children: React.ReactNode;
  /** Controlled open state. Omit for an uncontrolled disclosure. */
  open?: boolean;
  /** Initial state for an uncontrolled disclosure. */
  defaultOpen?: boolean;
  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  disabled?: boolean;
  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields, so the Form still collects them while the disclosure is closed. */
  keepMounted?: boolean;
  /**
   * When set, the summary is marked as a heading so the disclosure appears in the
   * screen reader's heading list. Native has no heading levels, so the value only
   * documents the outline.
   */
  headingLevel?: DisclosureHeadingLevel;
  /** Fired after the state changes, with the new boolean `open` and a reason. */
  onToggle?: (open: boolean, reason: DisclosureToggleReason) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DisclosureOverridableBinding, TokenRef>>;
}

/** Chevron rotation in degrees: pointing right when closed, down when open. */
const CHEVRON_CLOSED = '0deg';
const CHEVRON_OPEN = '90deg';

/**
 * Disclosure — a button that reveals content beneath it. Deliberately plain: no
 * border, no card, no animation of the panel.
 *
 * When to use: Use a Disclosure to hide secondary content that some users need and
 * most do not: optional settings, long explanations, a list of details behind a
 * summary count. Stack several to make an accordion — each is independent. Do not
 * hide content most users need, and do not use it as a fake tab set.
 *
 * Renders a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={summary}`
 * and `accessibilityState={{ expanded: open, disabled }}`, containing the chevron
 * and a `Text` (marked `accessibilityRole="header"` when `headingLevel` is set);
 * the children render in a `View` below only while open, or with `display: 'none'`
 * while closed when `keepMounted` is set. Screen readers read expanded/collapsed
 * from the state; there is no `aria-controls` equivalent, and moving focus back to
 * the trigger on close is not possible on native (no notion of focus-within). The
 * chevron mirrors to `chevron-left` under `I18nManager.isRTL` and rotates toward
 * `chevron-down` with `Animated` over `transition`, or snaps when the OS reduce
 * motion setting is on. `onToggle` reports a reason (`pointer` on every trigger
 * press — see `DisclosureToggleReason` — or `controlled` for an external `open`
 * change). The trigger meets the minimum target and never drops its disabled state
 * from the tree.
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
}: DisclosureProps): React.JSX.Element {
  const { tokens } = useTheme();
  const reducedMotion = useReducedMotion();
  const rtl = I18nManager.isRTL;
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const [focused, setFocused] = React.useState(false);
  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  // Distinguishes an `open` prop change the trigger's own press already reported (reason
  // 'pointer') from one the consumer made on their own (reason 'controlled'); mirrors the web
  // implementation's self-echo tracking so a standard `open`/`onToggle` pairing doesn't double-fire.
  const mountedRef = React.useRef(false);
  const previousOpenRef = React.useRef(isOpen);
  const selfEmittedRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      previousOpenRef.current = isOpen;
      return;
    }
    if (isControlled && previousOpenRef.current !== isOpen) {
      const wasSelfEcho = selfEmittedRef.current === isOpen;
      if (!wasSelfEcho) onToggle?.(isOpen, 'controlled');
    }
    selfEmittedRef.current = null;
    previousOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isControlled]);

  const triggerPaddingBlock = overrides?.triggerPaddingBlock
    ? (resolveToken(tokens, overrides.triggerPaddingBlock) as number)
    : tokens.spaceSm;
  const triggerPaddingInline = overrides?.triggerPaddingInline
    ? (resolveToken(tokens, overrides.triggerPaddingInline) as number)
    : tokens.spaceSm;
  const triggerGap = overrides?.triggerGap ? (resolveToken(tokens, overrides.triggerGap) as number) : tokens.space2;
  const triggerFontFamily = overrides?.triggerFontFamily
    ? (resolveToken(tokens, overrides.triggerFontFamily) as string)
    : tokens.fontFamilyBody;
  const triggerFontSize = overrides?.triggerFontSize
    ? (resolveToken(tokens, overrides.triggerFontSize) as number)
    : tokens.fontSizeMd;
  const triggerFontWeight = overrides?.triggerFontWeight
    ? (resolveToken(tokens, overrides.triggerFontWeight) as number)
    : tokens.fontWeightMedium;
  const triggerRadius = overrides?.triggerRadius
    ? (resolveToken(tokens, overrides.triggerRadius) as number)
    : tokens.radiusMd;
  const panelPaddingBlock = overrides?.panelPaddingBlock
    ? (resolveToken(tokens, overrides.panelPaddingBlock) as number)
    : tokens.spaceSm;
  const panelPaddingInline = overrides?.panelPaddingInline
    ? (resolveToken(tokens, overrides.panelPaddingInline) as number)
    : tokens.spaceSm;
  const disabledOpacity = overrides?.disabledOpacity
    ? (resolveToken(tokens, overrides.disabledOpacity) as number)
    : tokens.opacityDisabled;
  const transitionDuration = overrides?.transition
    ? (resolveToken(tokens, overrides.transition) as number)
    : tokens.motionDurationBase;

  React.useEffect(() => {
    const toValue = isOpen ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(tokens.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isOpen, reducedMotion, rotation, transitionDuration, tokens.motionEasingStandard]);

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
    minHeight: tokens.sizeTargetMin,
    minWidth: tokens.sizeTargetMin,
    paddingVertical: triggerPaddingBlock,
    paddingHorizontal: triggerPaddingInline,
    borderRadius: triggerRadius,
    backgroundColor: pressed && !disabled ? tokens.colorBackgroundSubtle : 'transparent',
    borderWidth: tokens.borderWidthFocus,
    borderColor: focused ? tokens.colorBorderFocus : 'transparent',
    opacity: disabled ? disabledOpacity : 1,
  });

  const summaryStyle: TextStyle = {
    fontFamily: triggerFontFamily,
    fontSize: triggerFontSize,
    fontWeight: toFontWeight(triggerFontWeight),
    lineHeight: toLineHeight(triggerFontSize, tokens.fontLineHeightNormal),
    color: tokens.colorForeground,
    flexShrink: 1,
  };

  // The chevron is 1em, rendered as `chevron-right` (mirrored to `chevron-left` under RTL) and
  // rotated toward `chevron-down` when open. `chevron-left`'s point sits on the opposite side of
  // its glyph, so it needs the opposite rotation direction to land on the same down-pointing
  // shape `chevron-right` reaches at +90deg.
  const chevronName = rtl ? 'chevron-left' : 'chevron-right';
  const chevronOpenAngle = rtl ? '-90deg' : CHEVRON_OPEN;
  const chevronFrameStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [
      {
        rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: [CHEVRON_CLOSED, chevronOpenAngle] }),
      },
    ],
  };

  const panelStyle: ViewStyle = {
    paddingVertical: panelPaddingBlock,
    paddingHorizontal: panelPaddingInline,
    display: isOpen ? 'flex' : 'none',
  };

  return (
    <View testID="Disclosure">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={summary}
        accessibilityState={{ expanded: isOpen, disabled }}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={triggerStyle}
      >
        <Animated.View style={chevronFrameStyle}>
          <Icon
            name={chevronName}
            size="md"
            color={tokens.colorForegroundMuted}
            overrides={overrides?.triggerFontSize ? { size: overrides.triggerFontSize } : undefined}
          />
        </Animated.View>
        <RNText
          accessibilityRole={headingLevel !== undefined ? 'header' : undefined}
          allowFontScaling
          style={summaryStyle}
        >
          {summary}
        </RNText>
      </Pressable>
      {isOpen || keepMounted ? (
        <View
          style={panelStyle}
          accessibilityElementsHidden={!isOpen}
          importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
