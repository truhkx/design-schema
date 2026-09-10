import * as React from 'react';
import { Animated, Text as RNText, View } from 'react-native';
import type { LayoutChangeEvent, TextStyle, ViewStyle } from 'react-native';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

export interface MeterProps {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB"). Omit to show and announce the percentage. */
  valueText?: string;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns. */
  tone?: MeterTone;
  /** Hides the visible value text. The accessible value is always exposed. */
  hideValue?: boolean;
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
 * When to use: Use a Meter for a measurement with a fixed range: storage or quota
 * used, battery, password strength, a score out of ten. Let the consumer decide the
 * tone from thresholds it understands; the meter just paints. Provide `valueText`
 * whenever the raw percentage is not what a person would say. Do not use it for
 * task progress (ProgressBar, planned).
 *
 * Renders an `accessible` `View` with `role="meter"` (RN ≥ 0.73; react-native-web
 * renders the ARIA role, native maps it to the nearest trait), `accessibilityLabel`
 * and `accessibilityValue={{ min, max, now: clamped, text: valueText }}` — `text` only
 * when `valueText` is given, so the platform otherwise announces the percentage.
 * Inside: a label row of two `Text` elements and a track `View` with `overflow:
 * 'hidden'` holding the fill. The track is measured with `onLayout` and the fill's
 * pixel width animates with `Animated` over `transition` (`useNativeDriver: false`),
 * snapping when reduce motion is on. Nothing is interactive. A non-finite `value`
 * counts as `min`; if `max <= min` the track renders empty, `now` is `min`, and a
 * warning is logged in development.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  tone = 'info',
  hideValue = false,
}: MeterProps): React.JSX.Element {
  const { tokens } = useTheme();
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
  const percent = Math.round(fraction * 100);
  const displayedValue = valueText ?? `${percent}%`;

  // The fill is animated on `width` in pixels (measured from the track) rather than
  // a percentage string, which `Animated` cannot interpolate on every platform.
  const [trackWidth, setTrackWidth] = React.useState(0);
  const fillWidth = React.useRef(new Animated.Value(0)).current;
  const laidOutWidth = React.useRef(0);

  React.useEffect(() => {
    const toValue = trackWidth * fraction;
    // Only a change to `value` animates; the first layout and resizes snap so the
    // bar never sweeps in on mount or on rotation.
    const resized = laidOutWidth.current !== trackWidth;
    laidOutWidth.current = trackWidth;
    if (reducedMotion || resized) {
      fillWidth.setValue(toValue);
      return;
    }
    Animated.timing(fillWidth, {
      toValue,
      duration: tokens.motionDurationBase,
      easing: toEasing(tokens.motionEasingStandard),
      // Layout properties cannot use the native driver.
      useNativeDriver: false,
    }).start();
  }, [fraction, trackWidth, reducedMotion, fillWidth, tokens.motionDurationBase, tokens.motionEasingStandard]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: tokens.space1,
  };

  const labelRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: tokens.space2,
  };

  const labelStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeSm,
    fontWeight: toFontWeight(tokens.fontWeightMedium),
    lineHeight: toLineHeight(tokens.fontSizeSm, tokens.fontLineHeightNormal),
    color: tokens.colorForeground,
    flexShrink: 1,
  };

  const valueStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontSize: tokens.fontSizeSm,
    fontWeight: toFontWeight(tokens.fontWeightRegular),
    lineHeight: toLineHeight(tokens.fontSizeSm, tokens.fontLineHeightNormal),
    color: tokens.colorForegroundMuted,
  };

  const trackStyle: ViewStyle = {
    height: tokens.space2,
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens.colorBackgroundStrong,
    overflow: 'hidden',
  };

  const fillStyle: Animated.WithAnimatedObject<ViewStyle> = {
    height: tokens.space2,
    borderRadius: tokens.radiusFull,
    backgroundColor: tokens[FILL_TOKEN[tone]],
    width: fillWidth,
    // Start edge follows the writing direction under I18nManager because the fill
    // is a normal flex child, not absolutely positioned.
    alignSelf: 'flex-start',
  };

  return (
    <View
      // One accessibility element: the label and value are announced together and
      // the visible label row is not read a second time.
      accessible
      role="meter"
      accessibilityLabel={label}
      // Without `text`, the platform announces `now` against `min`…`max` as a percentage.
      accessibilityValue={{ min, max, now: clamped, text: valueText }}
      style={containerStyle}
    >
      <View style={labelRowStyle}>
        <RNText allowFontScaling style={labelStyle}>
          {label}
        </RNText>
        {hideValue ? null : (
          <RNText allowFontScaling style={valueStyle}>
            {displayedValue}
          </RNText>
        )}
      </View>
      <View style={trackStyle} onLayout={handleTrackLayout}>
        <Animated.View style={fillStyle} />
      </View>
    </View>
  );
}
