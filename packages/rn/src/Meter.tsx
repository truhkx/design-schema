import * as React from 'react';
import { Animated, View } from 'react-native';
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type MeterOverridableBinding =
  | 'trackHeight'
  | 'radius'
  | 'labelSize'
  | 'labelWeight'
  | 'valueSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'partGap'
  | 'labelGap'
  | 'transition';

export interface MeterProps {
  /**
   * The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the
   * clamped number too, exact and unrounded (only the percentage text is rounded). A non-finite
   * `value` is treated as `min`.
   */
  value: number;
  /** Lower bound of the range. A non-finite `min` (NaN, Infinity) is treated as 0. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. A non-finite `max` (NaN, Infinity) is treated as 100. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw
   * number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a
   * whole number ("32%"), from the runtime's default locale.
   */
  valueText?: string | undefined;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns. */
  tone?: MeterTone | undefined;
  /** Hides the visible value text. The accessible value is always exposed. */
  hideValue?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View` (the element carrying `role="meter"`). */
  ref?: React.Ref<ViewInstance> | undefined;
}

const FILL_TOKEN = {
  info: 'colorStatusInfoIcon',
  success: 'colorStatusSuccessIcon',
  warning: 'colorStatusWarningIcon',
  danger: 'colorStatusDangerIcon',
} as const satisfies Record<MeterTone, keyof Tokens>;

/** Invalid min/max pairs already warned about, for the life of the process: a second Meter with the same bad range, or a remount, stays silent. */
const warnedRanges = new Set<string>();

/**
 * Meter — shows how much of something there is against a known scale. Its shape is
 * a bar because people read fullness at a glance; its meaning is the number.
 *
 * When to use: a measurement with a fixed range — storage or quota used, battery,
 * password strength, a score out of ten. The consumer decides the tone from thresholds
 * it owns; the meter just paints. Not for task progress (ProgressBar).
 *
 * Renders an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and
 * `accessibilityValue={{ min, max, now: clamped, text }}`, where `text` is always set:
 * `valueText`, else the rounded percentage web and Lit announce. Inside: a header row of
 * two composed `Text`s — each in a plain `View` the Meter owns, since `Text` takes no
 * `testID` — and a track `View` (`overflow: 'hidden'`) holding the fill. The track is
 * measured with `onLayout` and the fill's pixel width animates over `transition`
 * (`useNativeDriver: false`); it snaps before the width is known, on first layout, on
 * resize, and under reduced motion. A non-finite `value` counts as `min`, a non-finite
 * `min`/`max` as its default; if `max <= min` the track renders empty, `now` is `min`,
 * "0%" is shown and announced, and development warns once per distinct invalid pair.
 * Nothing here is interactive: no focus, no events, no hover.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  tone = 'info',
  hideValue = false,
  overrides,
  ref,
}: MeterProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  // A non-finite bound falls back to its default, on every platform.
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 100;
  const validRange = safeMax > safeMin;

  // Development warning: an inverted or empty range. Warned once per distinct invalid pair.
  React.useEffect(() => {
    if (!__DEV__ || validRange) return;
    const key = `${safeMin}/${safeMax}`;
    if (warnedRanges.has(key)) return;
    warnedRanges.add(key);
    console.warn(`Meter: \`max\` (${safeMax}) must be greater than \`min\` (${safeMin}).`);
  }, [validRange, safeMin, safeMax]);

  const safeValue = Number.isFinite(value) ? value : safeMin;
  const clamped = validRange ? Math.min(safeMax, Math.max(safeMin, safeValue)) : safeMin;
  const fraction = validRange ? (clamped - safeMin) / (safeMax - safeMin) : 0;
  // Rounding is for the text only; the fill width uses the exact fraction.
  const percentText = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
  const announcedValue = valueText ?? percentText;

  const trackHeight = overrides?.trackHeight ? (resolveToken(t, overrides.trackHeight) as number) : t.space2;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusFull;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const labelGap = overrides?.labelGap ? (resolveToken(t, overrides.labelGap) as number) : t.space2;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationBase;

  // The fill animates `width` in measured pixels: a percentage cannot be interpolated.
  const [trackWidth, setTrackWidth] = React.useState(0);
  const fillWidth = React.useRef(new Animated.Value(0)).current;
  const laidOutWidth = React.useRef(0);

  React.useEffect(() => {
    const toValue = trackWidth * fraction;
    // Only a change to the fraction animates; the first layout and resizes snap, and so
    // does an update where both move at once.
    const resized = laidOutWidth.current !== trackWidth;
    laidOutWidth.current = trackWidth;
    if (reducedMotion || resized || trackWidth === 0) {
      fillWidth.setValue(toValue);
      return;
    }
    Animated.timing(fillWidth, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [fraction, trackWidth, reducedMotion, fillWidth, transitionDuration, t.motionEasingStandard]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  const styles = React.useMemo(() => {
    const container: ViewStyle = { flexDirection: 'column', gap: partGap };
    const header: ViewStyle = {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: labelGap,
    };
    // A long label wraps onto more lines inside the row rather than truncating.
    const labelWrapper: ViewStyle = { flexShrink: 1 };
    // The value text never wraps; the label gives way instead.
    const valueWrapper: ViewStyle = { flexShrink: 0 };
    const track: ViewStyle = {
      height: trackHeight,
      borderRadius: radius,
      backgroundColor: t.colorBackgroundStrong,
      overflow: 'hidden',
    };
    return { container, header, labelWrapper, valueWrapper, track };
  }, [partGap, labelGap, trackHeight, radius, t.colorBackgroundStrong]);

  const fillStyle: Animated.WithAnimatedValue<ViewStyle> = {
    height: trackHeight,
    borderRadius: radius,
    backgroundColor: t[FILL_TOKEN[tone]],
    width: fillWidth,
    alignSelf: 'flex-start',
  };

  return (
    <View
      ref={ref}
      testID="Meter"
      // One accessibility element: label and value announce together.
      accessible
      // Not a control: the bar takes no focus, as on ProgressBar.
      focusable={false}
      role="meter"
      accessibilityLabel={label}
      aria-label={label}
      accessibilityValue={{ min: safeMin, max: safeMax, now: clamped, text: announcedValue }}
      // The aria-* aliases carry the same value. React Native merges them into
      // `accessibilityValue`; react-native-web forwards only these, and role="meter"
      // requires aria-valuenow on the DOM.
      aria-valuemin={safeMin}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={announcedValue}
      style={styles.container}
    >
      <View testID="Meter.header" style={styles.header}>
        <View testID="Meter.label" style={styles.labelWrapper}>
          <Text
            size="sm"
            weight="medium"
            tone="default"
            overrides={{
              fontSize: overrides?.labelSize,
              fontWeight: overrides?.labelWeight,
              fontFamily: overrides?.fontFamily,
              lineHeight: overrides?.lineHeight,
            }}
          >
            {label}
          </Text>
        </View>
        {hideValue ? null : (
          <View testID="Meter.valueText" style={styles.valueWrapper}>
            <Text
              size="sm"
              tone="muted"
              overrides={{
                fontSize: overrides?.valueSize,
                fontFamily: overrides?.fontFamily,
                lineHeight: overrides?.lineHeight,
              }}
            >
              {announcedValue}
            </Text>
          </View>
        )}
      </View>
      <View testID="Meter.track" style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View testID="Meter.fill" style={fillStyle} />
      </View>
    </View>
  );
}
