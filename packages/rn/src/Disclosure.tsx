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
  | 'triggerLineHeight'
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
  /** The trigger stretches across its container, so the whole row is the hit area (and the hover fill runs edge to edge). The icon and summary stay at the start. */
  fullWidth?: boolean | undefined;
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

/** The part of a DOM element react-native-web hands back for a `View`; `Platform.OS === 'web'` only. */
type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

/** Each overridable binding's default token, the one place its path is written. */
const DEFAULT_TOKEN = {
  triggerPaddingBlock: 'space.sm',
  triggerPaddingInline: 'space.sm',
  triggerGap: 'space.2',
  triggerFontFamily: 'font.family.body',
  triggerFontSize: 'font.size.md',
  triggerFontWeight: 'font.weight.medium',
  triggerLineHeight: 'font.lineHeight.normal',
  triggerRadius: 'radius.md',
  panelPaddingBlock: 'space.sm',
  panelPaddingInline: 'space.sm',
  disabledOpacity: 'opacity.disabled',
  transition: 'motion.duration.base',
} as const satisfies Record<DisclosureOverridableBinding, TokenRef>;

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
  fullWidth = false,
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

  // react-native-web 0.21 ignores `accessibilityState`, so the disabled state would never reach the
  // DOM, and passing Pressable's own `disabled` would drop the trigger from the tab order — which
  // `accessibilityState.disabled` plus a press guard exists to avoid. So on web the attribute is set
  // on the DOM node itself: the trigger stays focusable and is still announced (and audited) as
  // disabled, which is also what keeps the dimmed trigger out of axe's contrast check, as in Button.
  const triggerRef = React.useRef<ViewInstance>(null);
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = triggerRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (disabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
  }, [disabled]);

  // Controlled: a press is reported at once (the state changes only when the consumer echoes it),
  // and the `open` change that echoes that request does not fire again; any other `open` change
  // reports 'controlled'. Uncontrolled: the press is reported after the new state has committed.
  // Only the latest request is remembered, and the next `open` change clears it. Nothing fires on mount.
  // The latest handler, so the effect below never calls one from an earlier render.
  const onToggleRef = React.useRef(onToggle);
  onToggleRef.current = onToggle;
  const previousOpenRef = React.useRef(isOpen);
  const selfEmittedRef = React.useRef<boolean | null>(null);
  const pendingPressRef = React.useRef(false);
  React.useEffect(() => {
    if (previousOpenRef.current === isOpen) return;
    previousOpenRef.current = isOpen;
    const echo = selfEmittedRef.current === isOpen;
    selfEmittedRef.current = null;
    const pressed = pendingPressRef.current;
    pendingPressRef.current = false;
    if (isControlled) {
      if (!echo) onToggleRef.current?.(isOpen, 'controlled');
    } else if (pressed) {
      onToggleRef.current?.(isOpen, 'pointer');
    }
  }, [isOpen, isControlled]);

  const tokenFor = (binding: DisclosureOverridableBinding): TokenRef =>
    overrides?.[binding] ?? DEFAULT_TOKEN[binding];
  const triggerPaddingBlock = resolveToken(t, tokenFor('triggerPaddingBlock')) as number;
  const triggerPaddingInline = resolveToken(t, tokenFor('triggerPaddingInline')) as number;
  const triggerGap = resolveToken(t, tokenFor('triggerGap')) as number;
  const triggerFontFamily = resolveToken(t, tokenFor('triggerFontFamily')) as string;
  const triggerFontSizeToken = tokenFor('triggerFontSize');
  const triggerFontSize = resolveToken(t, triggerFontSizeToken) as number;
  const triggerFontWeight = resolveToken(t, tokenFor('triggerFontWeight')) as number;
  const triggerLineHeight = resolveToken(t, tokenFor('triggerLineHeight')) as number;
  const triggerRadius = resolveToken(t, tokenFor('triggerRadius')) as number;
  const panelPaddingBlock = resolveToken(t, tokenFor('panelPaddingBlock')) as number;
  const panelPaddingInline = resolveToken(t, tokenFor('panelPaddingInline')) as number;
  const disabledOpacity = resolveToken(t, tokenFor('disabledOpacity')) as number;
  const transitionDuration = resolveToken(t, tokenFor('transition')) as number;

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
    // `Pressable` cannot tell a hardware Enter/Space from a tap, so a press is always 'pointer'.
    if (isControlled) {
      selfEmittedRef.current = next;
      onToggle?.(next, 'pointer');
    } else {
      pendingPressRef.current = true;
      setInternalOpen(next);
    }
  };

  const triggerStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    // Start-aligned so the hover fill hugs the summary; `fullWidth` makes the whole row the trigger.
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
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
    lineHeight: toLineHeight(triggerFontSize, triggerLineHeight),
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
        ref={triggerRef}
        testID="Disclosure.trigger"
        accessibilityRole="button"
        accessibilityLabel={summary}
        aria-label={summary}
        accessibilityState={{ expanded: isOpen, disabled }}
        // react-native-web 0.21 ignores `accessibilityState`; this mirror is what carries the
        // expanded state to the DOM (native merges both). `aria-disabled` is set in the effect above.
        aria-expanded={isOpen}
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
            overrides={{ size: triggerFontSizeToken }}
          />
        </Animated.View>
        {/*
          The schema's stopgap: a plain `Text` carrying the same trigger bindings. The package
          `Text` takes all four typography overrides but has no `accessibilityRole` prop, so it
          cannot carry the header role `headingLevel` asks for.
        */}
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
