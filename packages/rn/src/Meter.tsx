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
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw
   * number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a
   * whole number ("32%").
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

/**
 * Meter — shows how much of something there is against a known scale. Its shape is
 * a bar because people read fullness at a glance; its meaning is the number.
 *
 * When to use: a measurement with a fixed range — storage or quota used, battery,
 * password strength, a score out of ten. The consumer decides the tone from thresholds
 * it owns; the meter just paints. Not for task progress (ProgressBar, planned).
 *
 * Renders an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and
 * `accessibilityValue={{ min, max, now: clamped, text }}`, where `text` is always set:
 * `valueText`, else the rounded percentage web and Lit announce. Inside: a header row of
 * two composed `Text`s and a track `View` (`overflow: 'hidden'`) holding the fill. The
 * track is measured with `onLayout` and the fill's pixel width animates over `transition`
 * (`useNativeDriver: false`); it snaps before the width is known, on resize, and under
 * reduced motion. A non-finite `value` counts as `min`; if `max <= min` the track renders
 * empty, `now` is `min`, "0%" is shown, and a warning is logged in development.
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

  const validRange = max > min;
  React.useEffect(() => {
    if (__DEV__ && !validRange) {
      console.warn(`Meter: max (${max}) must be greater than min (${min}).`);
    }
  }, [validRange, min, max]);

  const safeValue = Number.isFinite(value) ? value : min;
  const clamped = validRange ? Math.min(max, Math.max(min, safeValue)) : min;
  const fraction = validRange ? (clamped - min) / (max - min) : 0;
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
    // Only a change to `value` animates; the first layout and resizes snap.
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
    const track: ViewStyle = {
      height: trackHeight,
      borderRadius: radius,
      backgroundColor: t.colorBackgroundStrong,
      overflow: 'hidden',
    };
    return { container, header, track };
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
      role="meter"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: clamped, text: announcedValue }}
      style={styles.container}
    >
      <View testID="Meter.header" style={styles.header}>
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
        {hideValue ? null : (
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
        )}
      </View>
      <View testID="Meter.track" style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View testID="Meter.fill" style={fillStyle} />
      </View>
    </View>
  );
}
