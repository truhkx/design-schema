import * as React from 'react';
import { Animated, I18nManager, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { LayoutChangeEvent, PressableStateCallbackType, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type SegmentedControlSize = 'sm' | 'md';

/** One option. Labels are one word; with `iconOnly` the label becomes the accessible name. */
export type SegmentedControlOption = {
  value: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SegmentedControlOverridableBinding =
  | 'groupPadding'
  | 'groupRadius'
  | 'segmentShadow'
  | 'segmentRadius'
  | 'segmentPaddingInline'
  | 'segmentPaddingBlock'
  | 'segmentGap'
  | 'segmentSpacing'
  | 'selectedWeight'
  | 'paddingBlockSm'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'transition'
  | 'disabledOpacity';

export interface SegmentedControlProps {
  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  label: string;
  /**
   * Two to five options (guidance, not enforced: any count renders, with no warning). Labels
   * are one word; with `iconOnly` the label becomes the accessible name. The icon is an Icon
   * whose `size` is the control's `size`.
   */
  options: SegmentedControlOption[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /**
   * Initially selected value. Defaults to the first enabled option — a segmented control
   * always has a selection. A `value` or `defaultValue` is taken as given, never corrected:
   * one naming a disabled option keeps that segment checked with the pill under it; one
   * matching no option checks nothing and draws no pill.
   */
  defaultValue?: string | undefined;
  /**
   * Show icons only (every option must have one); labels become accessibility labels. An
   * option without `icon` warns in development (once) and shows its label as text instead.
   */
  iconOnly?: boolean | undefined;
  /** Toolbar (`sm`) or standard (`md`) height. */
  size?: SegmentedControlSize | undefined;
  /** Stretch to the container width with equal segments. */
  fill?: boolean | undefined;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: ((value: string) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View` (the radiogroup). */
  ref?: React.Ref<ViewInstance> | undefined;
}

const FONT_SIZE = {
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
} as const satisfies Record<SegmentedControlSize, keyof Tokens>;

type SegmentLayout = { x: number; y: number; width: number; height: number };

const isWeb = Platform.OS === 'web';

/** The DOM element react-native-web renders for a `Pressable`; this package has no DOM lib. */
type WebElement = { setAttribute(name: string, value: string): void; removeAttribute(name: string): void };

/**
 * SegmentedControl — switches a mode: list or grid, day or week, metric or imperial.
 * Exactly one segment is always selected and choosing one takes effect at once; there
 * is nothing to submit, which is what separates it from a RadioGroup in a form.
 *
 * When to use: two to five short, parallel options that change what a region shows or
 * how a tool behaves, switched often with the effect seen immediately. `iconOnly` in
 * toolbars where the icons are unambiguous. Not for a value submitted later
 * (RadioGroup), views of content (Tabs), more than five options (Select), or on/off
 * (Switch).
 *
 * Renders a `View` row with `accessibilityRole="radiogroup"` and `accessibilityLabel`,
 * on `groupBackground` with `groupPadding`, holding one `Pressable` per option with
 * `accessibilityRole="radio"` and `accessibilityState={{ checked, disabled }}`; each
 * segment is its own accessibility stop on native. The pill is an `Animated.View`
 * (hidden from assistive technology) positioned from each segment's measured layout
 * and slid over `transition` with `motion.easing.standard`, snapping under reduced
 * motion. Selection is also carried by the stronger, heavier label and the checked
 * state, never by the pill alone. Every segment reaches `size.target.comfortable`
 * (touch), so `size` changes the type and padding, not the target.
 *
 * Keyboard: on react-native-web the group handles `onKeyDown` — ArrowRight/ArrowDown
 * and ArrowLeft/ArrowUp move focus AND selection to the next/previous enabled segment,
 * wrapping; Home/End to the first/last enabled one — and only the selected segment is
 * a tab stop (roving). iOS/Android deliver no key events to `View`/`Pressable`, so a
 * hardware keyboard reaches each segment as its own stop and Enter/Space press it.
 * With `iconOnly` the label is the segment's accessibility label; native has no hover
 * or focus Tooltip, so none is shown.
 */
export function SegmentedControl({
  label,
  options,
  value,
  defaultValue,
  iconOnly = false,
  size = 'md',
  fill = false,
  onChange,
  overrides,
  ref,
}: SegmentedControlProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rtl = I18nManager.isRTL;

  const enabledOptions = options.filter((option) => option.disabled !== true);
  const firstEnabledValue = enabledOptions[0]?.value;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue ?? firstEnabledValue);
  const currentValue = isControlled ? value : internalValue;

  const hasWarnedIconRef = React.useRef(false);
  React.useEffect(() => {
    if (__DEV__ && iconOnly && !hasWarnedIconRef.current) {
      const missing = options.filter((option) => option.icon === undefined).map((option) => `"${option.value}"`);
      if (missing.length > 0) {
        hasWarnedIconRef.current = true;
        // One message per instance listing every option without an icon.
        console.warn(
          `SegmentedControl: iconOnly is set but ${missing.join(', ')} ${missing.length === 1 ? 'has' : 'have'} no icon; the label is shown as text instead.`,
        );
      }
    }
  }, [iconOnly, options]);

  const groupPadding = overrides?.groupPadding ? (resolveToken(t, overrides.groupPadding) as number) : t.space1;
  const groupRadius = overrides?.groupRadius ? (resolveToken(t, overrides.groupRadius) as number) : t.radiusMd;
  const segmentShadow = overrides?.segmentShadow ? (resolveToken(t, overrides.segmentShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const segmentRadius = overrides?.segmentRadius ? (resolveToken(t, overrides.segmentRadius) as number) : t.radiusSm;
  const segmentPaddingInline = overrides?.segmentPaddingInline ? (resolveToken(t, overrides.segmentPaddingInline) as number) : t.spaceMd;
  const paddingBlockMd = overrides?.segmentPaddingBlock ? (resolveToken(t, overrides.segmentPaddingBlock) as number) : t.space1;
  const paddingBlockSm = overrides?.paddingBlockSm ? (resolveToken(t, overrides.paddingBlockSm) as number) : t.space1;
  const segmentGap = overrides?.segmentGap ? (resolveToken(t, overrides.segmentGap) as number) : t.layoutGapTight;
  const segmentSpacing = overrides?.segmentSpacing ? (resolveToken(t, overrides.segmentSpacing) as number) : t.space0;
  const selectedWeight = overrides?.selectedWeight ? (resolveToken(t, overrides.selectedWeight) as number) : t.fontWeightSemibold;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE[size]];
  const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightMedium;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const segmentLayoutsRef = React.useRef(new Map<string, SegmentLayout>());
  const segmentRefs = React.useRef(new Map<string, ViewInstance>());
  const focusedValueRef = React.useRef<string | undefined>(undefined);
  const hasMeasuredRef = React.useRef(false);
  const pillX = React.useRef(new Animated.Value(0)).current;
  const pillWidth = React.useRef(new Animated.Value(0)).current;
  const pillY = React.useRef(new Animated.Value(0)).current;
  const pillHeight = React.useRef(new Animated.Value(0)).current;

  const updatePill = React.useCallback(
    (optionValue: string): void => {
      const layout = segmentLayoutsRef.current.get(optionValue);
      if (!layout) {
        return;
      }
      // Segments share one row, so only the inline position animates.
      pillY.setValue(layout.y);
      pillHeight.setValue(layout.height);
      if (reducedMotion || !hasMeasuredRef.current) {
        pillX.setValue(layout.x);
        pillWidth.setValue(layout.width);
        hasMeasuredRef.current = true;
        return;
      }
      const easing = toEasing(t.motionEasingStandard);
      Animated.parallel([
        Animated.timing(pillX, { toValue: layout.x, duration: transitionDuration, easing, useNativeDriver: false }),
        Animated.timing(pillWidth, { toValue: layout.width, duration: transitionDuration, easing, useNativeDriver: false }),
      ]).start();
    },
    [reducedMotion, transitionDuration, t.motionEasingStandard, pillX, pillWidth, pillY, pillHeight],
  );

  // A value matching no option checks nothing and draws no pill (never corrected).
  const hasSelectedOption = options.some((option) => option.value === currentValue);

  React.useEffect(() => {
    if (currentValue !== undefined && hasSelectedOption) {
      updatePill(currentValue);
    } else {
      // The pill unmounts; the next selection places it without sliding in from a stale spot.
      hasMeasuredRef.current = false;
    }
  }, [currentValue, hasSelectedOption, updatePill]);

  const handleSegmentLayout = (optionValue: string, event: LayoutChangeEvent): void => {
    const { x, y, width, height } = event.nativeEvent.layout;
    segmentLayoutsRef.current.set(optionValue, { x, y, width, height });
    if (optionValue === currentValue) {
      updatePill(optionValue);
    }
  };

  const select = (optionValue: string): void => {
    const option = options.find((candidate) => candidate.value === optionValue);
    if (!option || option.disabled === true || optionValue === currentValue) {
      return;
    }
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
  };

  // The roving tab stop on web: the selected segment when it is enabled, else the first enabled one.
  const tabStopValue = enabledOptions.some((option) => option.value === currentValue) ? currentValue : firstEnabledValue;

  // react-native-web only: View has no key events on iOS/Android.
  const handleKeyDown = (event: { key?: string; nativeEvent?: { key?: string }; preventDefault?: () => void }): void => {
    const key = event.key ?? event.nativeEvent?.key;
    if (enabledOptions.length === 0 || key === undefined) {
      return;
    }
    // Arrows move from the focused segment, else from the tab stop (the first enabled segment
    // when the value names a disabled option or none).
    const fromValue = focusedValueRef.current ?? tabStopValue;
    const fromIndex = enabledOptions.findIndex((option) => option.value === fromValue);
    const nextKeys = rtl ? ['ArrowLeft', 'ArrowDown'] : ['ArrowRight', 'ArrowDown'];
    const prevKeys = rtl ? ['ArrowRight', 'ArrowUp'] : ['ArrowLeft', 'ArrowUp'];
    let targetIndex: number;
    if (nextKeys.includes(key)) {
      targetIndex = fromIndex < 0 ? 0 : (fromIndex + 1) % enabledOptions.length;
    } else if (prevKeys.includes(key)) {
      targetIndex = fromIndex <= 0 ? enabledOptions.length - 1 : fromIndex - 1;
    } else if (key === 'Home') {
      targetIndex = 0;
    } else if (key === 'End') {
      targetIndex = enabledOptions.length - 1;
    } else {
      return;
    }
    event.preventDefault?.();
    const target = enabledOptions[targetIndex]!;
    segmentRefs.current.get(target.value)?.focus();
    select(target.value);
  };

  const keyProps: Record<string, unknown> = isWeb ? { onKeyDown: handleKeyDown } : {};

  const styleTokens: SegmentStyleTokens = {
    paddingInline: segmentPaddingInline,
    paddingBlock: size === 'sm' ? paddingBlockSm : paddingBlockMd,
    gap: segmentGap,
    // minTarget: React Native is touch, so every segment reaches size.target.comfortable.
    minTarget: t.sizeTargetComfortable,
    disabledOpacity,
    focusRingColor: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    // segmentRadius: the pill's corners, which the focus ring shares.
    radius: segmentRadius,
    fontFamily,
    fontSize,
    fontWeight,
    selectedWeight,
    lineHeightMultiplier,
    color: t.colorForegroundMuted,
    selectedColor: t.colorForegroundStrong,
    // The glyph is an Icon at the control's own size, as on every other platform.
    iconSize: size,
  };

  const groupStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: fill ? 'stretch' : 'flex-start',
    position: 'relative',
    gap: segmentSpacing,
    padding: groupPadding,
    borderRadius: groupRadius,
    backgroundColor: t.colorBackgroundStrong,
  };

  const pillStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    left: 0,
    top: pillY,
    width: pillWidth,
    height: pillHeight,
    borderRadius: segmentRadius,
    backgroundColor: t.colorBackground,
    transform: [{ translateX: pillX }],
    ...segmentShadow,
  };

  return (
    <View
      ref={ref}
      {...keyProps}
      testID="SegmentedControl"
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={groupStyle}
    >
      {hasSelectedOption ? (
        <Animated.View
          testID="SegmentedControl.indicator"
          style={pillStyle}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
      {options.map((option) => (
        <Segment
          key={option.value}
          option={option}
          selected={option.value === currentValue}
          tabStop={option.value === tabStopValue}
          iconOnly={iconOnly}
          fill={fill}
          styleTokens={styleTokens}
          onSelect={select}
          onMeasured={handleSegmentLayout}
          onFocusChange={(optionValue, focused) => {
            focusedValueRef.current = focused
              ? optionValue
              : focusedValueRef.current === optionValue
                ? undefined
                : focusedValueRef.current;
          }}
          registerRef={(optionValue, instance) => {
            if (instance) {
              segmentRefs.current.set(optionValue, instance);
            } else {
              segmentRefs.current.delete(optionValue);
            }
          }}
        />
      ))}
    </View>
  );
}

interface SegmentStyleTokens {
  paddingInline: number;
  paddingBlock: number;
  gap: number;
  minTarget: number;
  disabledOpacity: number;
  focusRingColor: string;
  focusRingWidth: number;
  radius: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  selectedWeight: number;
  lineHeightMultiplier: number;
  color: string;
  selectedColor: string;
  iconSize: SegmentedControlSize;
}

interface SegmentProps {
  option: SegmentedControlOption;
  selected: boolean;
  tabStop: boolean;
  iconOnly: boolean;
  fill: boolean;
  styleTokens: SegmentStyleTokens;
  onSelect: (value: string) => void;
  onMeasured: (value: string, event: LayoutChangeEvent) => void;
  onFocusChange: (value: string, focused: boolean) => void;
  registerRef: (value: string, instance: ViewInstance | null) => void;
}

/** One segment. Its own component so focus state does not re-render the whole group. */
function Segment({
  option,
  selected,
  tabStop,
  iconOnly,
  fill,
  styleTokens: s,
  onSelect,
  onMeasured,
  onFocusChange,
  registerRef,
}: SegmentProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const disabled = option.disabled === true;
  const foreground = selected ? s.selectedColor : s.color;
  const nodeRef = React.useRef<ViewInstance | null>(null);

  // react-native-web 0.21 ignores `accessibilityState` and `focusable`, so neither the disabled
  // state nor the roving tab stop would reach the DOM: every segment renders `tabindex="0"` and no
  // segment is announced as disabled. Both are set on the node itself here, as Tabs, Button and
  // Checkbox do — passing Pressable's own `disabled` prop instead would drop the segment out of the
  // accessibility tree, which the press guard exists to avoid. The attribute is also what keeps the
  // dimmed disabled segment out of axe's contrast check (WCAG 1.4.3 exempts inactive components,
  // and `opacity.disabled` over `color.foreground.muted` cannot reach 4.5:1).
  React.useEffect(() => {
    if (!isWeb) {
      return;
    }
    const node = nodeRef.current as unknown as WebElement | null;
    if (node === null) {
      return;
    }
    if (disabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
    // The group is one tab stop: the selected segment, or the first enabled one. A disabled
    // segment is never a stop (it has nothing to reach), but stays in the tree and readable.
    node.setAttribute('tabindex', tabStop && !disabled ? '0' : '-1');
  }, [disabled, tabStop]);

  const rowStyle = (_state: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: fill ? 1 : 0,
    flexShrink: fill ? 1 : 0,
    flexBasis: fill ? 0 : 'auto',
    gap: s.gap,
    minWidth: s.minTarget,
    minHeight: s.minTarget,
    paddingHorizontal: s.paddingInline,
    paddingVertical: s.paddingBlock,
    borderWidth: s.focusRingWidth,
    borderColor: focused ? s.focusRingColor : 'transparent',
    borderRadius: s.radius,
    opacity: disabled ? s.disabledOpacity : 1,
  });

  // With `iconOnly`, a segment whose option has no icon shows its label so it never renders empty.
  const showIcon = option.icon !== undefined;
  const showLabel = !iconOnly || !showIcon;

  const labelStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: toFontWeight(selected ? s.selectedWeight : s.fontWeight),
    lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
    color: foreground,
  };

  return (
    <Pressable
      ref={(instance: ViewInstance | null) => {
        nodeRef.current = instance;
        registerRef(option.value, instance);
      }}
      testID="SegmentedControl.segment"
      accessibilityRole="radio"
      // An `iconOnly` segment carries its label as the accessible name; a segment showing its
      // label as text is named by that text, and gets no label of its own. No
      // `accessibilityHint` either: it would only repeat the name, and a press already selects.
      accessibilityLabel={showLabel ? undefined : option.label}
      accessibilityState={{ checked: selected, disabled }}
      // `role="radio"` requires `aria-checked`, and react-native-web 0.21 ignores
      // `accessibilityState`, so the checked state reaches the DOM through this mirror (native
      // merges both); `aria-disabled` and `tabindex` are set in the effect above.
      aria-checked={selected}
      // Never the native `disabled` prop: it would drop the segment from the focus order.
      onPress={() => {
        if (!disabled) {
          onSelect(option.value);
        }
      }}
      onFocus={() => {
        setFocused(true);
        onFocusChange(option.value, true);
      }}
      onBlur={() => {
        setFocused(false);
        onFocusChange(option.value, false);
      }}
      onLayout={(event) => onMeasured(option.value, event)}
      style={rowStyle}
    >
      {showIcon ? (
        <View testID="SegmentedControl.segmentIcon" accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={option.icon!} size={s.iconSize} color={foreground} />
        </View>
      ) : null}
      {!showLabel ? null : (
        <RNText numberOfLines={1} style={labelStyle} testID="SegmentedControl.segmentLabel">
          {option.label}
        </RNText>
      )}
    </Pressable>
  );
}
