import * as React from 'react';
import { Animated, Pressable, Text as RNText, View } from 'react-native';
import type { LayoutChangeEvent, PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type SegmentedControlSize = 'sm' | 'md';

/** One option. `value` is a short identifier. */
export type SegmentedControlOption = { value: string; label: string; icon?: IconName | undefined; disabled?: boolean | undefined };

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
  options: SegmentedControlOption[];
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
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value. The change takes effect immediately. */
  onChange?: ((value: string) => void) | undefined;
}

const FONT_SIZE_TOKEN = {
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
} as const satisfies Record<SegmentedControlSize, keyof Tokens>;

type SegmentLayout = { x: number; width: number };

/**
 * SegmentedControl — switches a mode: list or grid, day or week, metric or
 * imperial. Exactly one segment is always selected and choosing one takes effect
 * at once; there is nothing to submit, which is what separates it from a
 * RadioGroup borrowing its semantics.
 *
 * When to use: two to five short, parallel options that change what a region
 * shows or how a tool behaves, switched often with the effect seen immediately.
 * Use `iconOnly` in toolbars only when the icons are unambiguous. Do not use it
 * for a value submitted later (RadioGroup), for views of content (Tabs), or with
 * no selection.
 *
 * Renders a `View` with `accessibilityRole="radiogroup"` and `accessibilityLabel`,
 * a background from `groupBackground`, and a row of `Pressable`s with
 * `accessibilityRole="radio"` and `accessibilityState={{ checked, disabled }}` per
 * option. The pill is an `Animated.View` positioned from each segment's measured
 * `onLayout` rect, sliding between segments over `transition` with
 * `motion.easing.standard` and snapping instead under reduced motion. Selection is
 * carried by the checked state plus the stronger, heavier text — never by the
 * pill's low contrast alone.
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * arrow-key/Home/End movement is a web keyboard model with no RN equivalent (the
 * same limit `RadioGroup` and `Tabs` document) — every segment is its own
 * accessibility stop and touching one always selects it immediately.
 */
export function SegmentedControl({
  label,
  options,
  value,
  defaultValue,
  iconOnly = false,
  size = 'md',
  fill = false,
  overrides,
  onChange,
}: SegmentedControlProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const firstEnabledValue = options.find((option) => option.disabled !== true)?.value ?? options[0]?.value;
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
  const segmentPaddingInline = overrides?.segmentPaddingInline
    ? (resolveToken(t, overrides.segmentPaddingInline) as number)
    : t.spaceMd;
  const paddingBlockMd = overrides?.segmentPaddingBlock ? (resolveToken(t, overrides.segmentPaddingBlock) as number) : t.space1;
  const paddingBlockSm = overrides?.paddingBlockSm ? (resolveToken(t, overrides.paddingBlockSm) as number) : t.space1;
  const segmentPaddingBlock = size === 'sm' ? paddingBlockSm : paddingBlockMd;
  const segmentGap = overrides?.segmentGap ? (resolveToken(t, overrides.segmentGap) as number) : t.layoutGapTight;
  const segmentSpacing = overrides?.segmentSpacing ? (resolveToken(t, overrides.segmentSpacing) as number) : t.space0;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightMedium;
  const selectedWeight = overrides?.selectedWeight ? (resolveToken(t, overrides.selectedWeight) as number) : t.fontWeightSemibold;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const groupBackground = t.colorBackgroundStrong;
  const segmentColor = t.colorForegroundMuted;
  const segmentSelectedColor = t.colorForegroundStrong;
  const segmentSelectedBackground = t.colorBackground;
  const minTarget = t.sizeTargetComfortable;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;

  const segmentLayoutsRef = React.useRef(new Map<string, SegmentLayout>());
  const hasMeasuredRef = React.useRef(false);
  const indicatorOffset = React.useRef(new Animated.Value(0)).current;
  const indicatorWidth = React.useRef(new Animated.Value(0)).current;

  const updateIndicator = React.useCallback(
    (optionValue: string): void => {
      const layout = segmentLayoutsRef.current.get(optionValue);
      if (!layout) {
        return;
      }
      if (reducedMotion || !hasMeasuredRef.current) {
        indicatorOffset.setValue(layout.x);
        indicatorWidth.setValue(layout.width);
        hasMeasuredRef.current = true;
        return;
      }
      Animated.parallel([
        Animated.timing(indicatorOffset, {
          toValue: layout.x,
          duration: transitionDuration,
          easing: toEasing(t.motionEasingStandard),
          useNativeDriver: false,
        }),
        Animated.timing(indicatorWidth, {
          toValue: layout.width,
          duration: transitionDuration,
          easing: toEasing(t.motionEasingStandard),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [reducedMotion, transitionDuration, t.motionEasingStandard, indicatorOffset, indicatorWidth],
  );

  React.useEffect(() => {
    if (currentValue === undefined) {
      return;
    }
    updateIndicator(currentValue);
  }, [currentValue, updateIndicator]);

  const handleSegmentLayout = (optionValue: string, event: LayoutChangeEvent): void => {
    const { x, width } = event.nativeEvent.layout;
    segmentLayoutsRef.current.set(optionValue, { x, width });
    if (optionValue === currentValue) {
      updateIndicator(optionValue);
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

  const groupStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: fill ? 'stretch' : 'flex-start',
    position: 'relative',
    gap: segmentSpacing,
    backgroundColor: groupBackground,
    borderRadius: groupRadius,
    padding: groupPadding,
  };

  const indicatorStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: indicatorWidth,
    backgroundColor: segmentSelectedBackground,
    borderRadius: segmentRadius,
    transform: [{ translateX: indicatorOffset }],
    ...segmentShadow,
  };

  const styleTokens: SegmentStyleTokens = {
    paddingInline: segmentPaddingInline,
    paddingBlock: segmentPaddingBlock,
    gap: segmentGap,
    minTarget,
    disabledOpacity,
    focusRingColor,
    focusRingWidth,
    fontFamily,
    fontSize,
    fontWeight,
    selectedWeight,
    lineHeightMultiplier,
    color: segmentColor,
    selectedColor: segmentSelectedColor,
  };

  return (
    <View testID="SegmentedControl" accessibilityRole="radiogroup" accessibilityLabel={label} style={groupStyle}>
      <Animated.View style={indicatorStyle} testID="SegmentedControl.indicator" pointerEvents="none" />
      {options.map((option) => (
        <Segment
          key={option.value}
          option={option}
          selected={option.value === currentValue}
          iconOnly={iconOnly}
          fill={fill}
          styleTokens={styleTokens}
          onSelect={select}
          onMeasured={handleSegmentLayout}
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
  iconOnly: boolean;
  fill: boolean;
  styleTokens: SegmentStyleTokens;
  onSelect: (value: string) => void;
  onMeasured: (value: string, event: LayoutChangeEvent) => void;
}

/** One segment. Its own component so focus/press state does not re-render the whole group. */
function Segment({ option, selected, iconOnly, fill, styleTokens: s, onSelect, onMeasured }: SegmentProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const disabled = option.disabled === true;
  const foreground = selected ? s.selectedColor : s.color;

  const rowStyle = (_state: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: fill ? 1 : 0,
    flexBasis: fill ? 0 : undefined,
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

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={option.label}
      accessibilityState={{ checked: selected, disabled }}
      // Never the native `disabled` prop: it would drop the segment from the focus order.
      onPress={() => {
        if (!disabled) {
          onSelect(option.value);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={(event) => onMeasured(option.value, event)}
      style={rowStyle}
      testID="SegmentedControl.segment"
    >
      {option.icon !== undefined ? (
        <View accessibilityElementsHidden importantForAccessibility="no">
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
