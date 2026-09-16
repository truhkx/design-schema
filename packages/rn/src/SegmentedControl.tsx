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
export type SegmentedControlOption = { value: string; label: string; icon?: IconName; disabled?: boolean };

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
  /** Two to five options. Labels are one word; with `iconOnly` the label becomes the accessible name. */
  options: { value: string; label: string; icon?: IconName; disabled?: boolean }[];
  /** Controlled selected value. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected value. Defaults to the first enabled option — a segmented control always has a selection. */
  defaultValue?: string | undefined;
  /** Show icons only (every option must have one); labels become accessible names. */
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

  React.useEffect(() => {
    if (__DEV__ && iconOnly) {
      options.forEach((option) => {
        if (option.icon === undefined) {
          console.warn(`SegmentedControl: option "${option.value}" has no icon, but iconOnly is set.`);
        }
      });
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

  React.useEffect(() => {
    if (currentValue !== undefined) {
      updatePill(currentValue);
    }
  }, [currentValue, updatePill]);

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

  // react-native-web only: View has no key events on iOS/Android.
  const handleKeyDown = (event: { key?: string; nativeEvent?: { key?: string }; preventDefault?: () => void }): void => {
    const key = event.key ?? event.nativeEvent?.key;
    if (enabledOptions.length === 0 || key === undefined) {
      return;
    }
    const fromValue = focusedValueRef.current ?? currentValue;
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

  // The roving tab stop on web: the selected segment, or the first enabled one.
  const tabStopValue = enabledOptions.some((option) => option.value === currentValue) ? currentValue : firstEnabledValue;

  const styleTokens: SegmentStyleTokens = {
    paddingInline: segmentPaddingInline,
    paddingBlock: size === 'sm' ? paddingBlockSm : paddingBlockMd,
    gap: segmentGap,
    // minTarget: React Native is touch, so every segment reaches size.target.comfortable.
    minTarget: t.sizeTargetComfortable,
    disabledOpacity,
    focusRingColor: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    fontFamily,
    fontSize,
    fontWeight,
    selectedWeight,
    lineHeightMultiplier,
    color: t.colorForegroundMuted,
    selectedColor: t.colorForegroundStrong,
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
      <Animated.View
        testID="SegmentedControl.indicator"
        style={pillStyle}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
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
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  selectedWeight: number;
  lineHeightMultiplier: number;
  color: string;
  selectedColor: string;
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
    opacity: disabled ? s.disabledOpacity : 1,
  });

  const labelStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: toFontWeight(selected ? s.selectedWeight : s.fontWeight),
    lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
    color: foreground,
  };

  // Roving tab stop on react-native-web; on native every segment stays its own stop.
  const webFocusProps: Record<string, unknown> = isWeb ? { focusable: tabStop && !disabled } : {};

  return (
    <Pressable
      ref={(instance: ViewInstance | null) => registerRef(option.value, instance)}
      testID="SegmentedControl.segment"
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ checked: selected, disabled }}
      {...webFocusProps}
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
      {option.icon !== undefined ? (
        <View testID="SegmentedControl.segmentIcon" accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={option.icon} size="sm" color={foreground} />
        </View>
      ) : null}
      {iconOnly ? null : (
        <RNText numberOfLines={1} style={labelStyle} testID="SegmentedControl.segmentLabel">
          {option.label}
        </RNText>
      )}
    </Pressable>
  );
}
