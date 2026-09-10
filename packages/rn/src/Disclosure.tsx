import * as React from 'react';
import { Animated, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

/** Heading level for the trigger. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;

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
  /** Fired after the state changes, with the new boolean `open`. */
  onToggle?: (open: boolean) => void;
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
 * chevron rotates with `Animated` over `transition`, or snaps when the OS reduce
 * motion setting is on. The trigger meets the minimum target and never drops its
 * disabled state from the tree.
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
}: DisclosureProps): React.JSX.Element {
  const { tokens } = useTheme();
  const reducedMotion = useReducedMotion();
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen);
  const [focused, setFocused] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const rotation = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  React.useEffect(() => {
    const toValue = isOpen ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, {
      toValue,
      duration: tokens.motionDurationBase,
      easing: toEasing(tokens.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isOpen, reducedMotion, rotation, tokens.motionDurationBase, tokens.motionEasingStandard]);

  const handlePress = (): void => {
    if (disabled) {
      return;
    }
    const next = !isOpen;
    if (open === undefined) {
      setInternalOpen(next);
    }
    onToggle?.(next);
  };

  const triggerStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: tokens.space2,
    minHeight: tokens.sizeTargetMin,
    minWidth: tokens.sizeTargetMin,
    paddingVertical: tokens.spaceSm,
    paddingHorizontal: tokens.spaceSm,
    borderRadius: tokens.radiusMd,
    backgroundColor: pressed && !disabled ? tokens.colorBackgroundSubtle : 'transparent',
    borderWidth: tokens.borderWidthFocus,
    borderColor: focused ? tokens.colorBorderFocus : 'transparent',
    opacity: disabled ? tokens.opacityDisabled : 1,
  });

  const summaryStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeMd,
    fontWeight: toFontWeight(tokens.fontWeightMedium),
    lineHeight: toLineHeight(tokens.fontSizeMd, tokens.fontLineHeightNormal),
    color: tokens.colorForeground,
    flexShrink: 1,
  };

  // The chevron is 1em: a square of the font size holding a rotated, two-sided
  // bordered box whose visible corner points right at rest.
  const chevronBox = tokens.fontSizeMd;
  const chevronArm = Math.round(chevronBox / 2);
  const chevronFrameStyle: Animated.WithAnimatedObject<ViewStyle> = {
    width: chevronBox,
    height: chevronBox,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: [CHEVRON_CLOSED, CHEVRON_OPEN] }),
      },
    ],
  };
  const chevronShapeStyle: ViewStyle = {
    width: chevronArm,
    height: chevronArm,
    borderTopWidth: tokens.borderWidthFocus,
    borderRightWidth: tokens.borderWidthFocus,
    borderColor: tokens.colorForegroundMuted,
    transform: [{ rotate: '45deg' }, { translateX: -Math.round(chevronArm / 4) }],
  };

  const panelStyle: ViewStyle = {
    paddingVertical: tokens.spaceSm,
    paddingHorizontal: tokens.spaceSm,
    display: isOpen ? 'flex' : 'none',
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={summary}
        accessibilityState={{ expanded: isOpen, disabled }}
        onPress={handlePress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={triggerStyle}
      >
        <Animated.View style={chevronFrameStyle} accessibilityElementsHidden importantForAccessibility="no">
          <View style={chevronShapeStyle} />
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
