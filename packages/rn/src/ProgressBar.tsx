import * as React from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type ProgressBarTone = 'neutral' | 'success' | 'danger';
export type ProgressBarAnnounce = 'none' | 'milestones' | 'complete';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ProgressBarOverridableBinding =
  | 'track'
  | 'trackHeight'
  | 'radius'
  | 'labelSize'
  | 'labelWeight'
  | 'valueSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'partGap'
  | 'transition'
  | 'indeterminateLoop';

export interface ProgressBarProps {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`; always the accessible name. */
  label: string;
  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown). */
  value?: number | undefined;
  /** Start of the range. */
  min?: number | undefined;
  /** End of the range. */
  max?: number | undefined;
  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage. */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text beside the label. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening. */
  hideLabel?: boolean | undefined;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal. */
  tone?: ProgressBarTone | undefined;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  announce?: ProgressBarAnnounce | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
}

const FILL_TOKEN = {
  neutral: 'colorControlSelectedBackground',
  success: 'colorStatusSuccessIcon',
  danger: 'colorStatusDangerIcon',
} as const satisfies Record<ProgressBarTone, keyof Tokens>;

const COPY = {
  progress: (label: string, value: string): string => `${label}: ${value}`,
  complete: (label: string): string => `${label}: complete`,
  indeterminate: (label: string): string => `${label}: in progress`,
} as const;

const MILESTONES = [25, 50, 75] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function defaultFormatValue(value: number, min: number, max: number): string {
  const percent = max > min ? Math.round(((value - min) / (max - min)) * 100) : 0;
  return `${percent}%`;
}

/**
 * ProgressBar — answers "how much longer" for a task the interface started and can
 * see through to the end. Give it `value` whenever the total is known; the
 * indeterminate form (omit `value`) is for the stretch before it is.
 *
 * When to use: uploads, downloads, imports, multi-step processing, a wizard's
 * overall completion. Not a measured quantity that can go up or down (Meter), not a
 * value the user sets (Slider).
 *
 * Renders a `View` with `accessibilityRole="progressbar"`, `accessibilityLabel`
 * (the accessible name even when `hideLabel` hides the visible label) and
 * `accessibilityValue={{ min, max, now, text }}` — `now`/`text` are omitted while
 * indeterminate, and `accessibilityState={{ busy: true }}` is set instead, mirroring
 * the web build's `aria-busy`. Inside: an optional label row (`Text` label and, when
 * determinate and `showValue`, a `Text` value) and a track `View` holding an
 * `Animated.View` fill. The fill's pixel width animates to the value's fraction of
 * the range over `transition` (`useNativeDriver: false`), snapping under reduced
 * motion. Indeterminate: a one-third-width fill sweeps the track on an `Animated.loop`
 * over `indeterminateLoop`; under reduced motion the sweep is replaced by a static,
 * full-width fill at `opacity.disabled`. `AccessibilityInfo.announceForAccessibility`
 * fires `copy.indeterminate` once on becoming indeterminate, `copy.progress` at each
 * 25/50/75% milestone when `announce="milestones"`, and `copy.complete` once on
 * reaching `max`, all gated on `announce !== 'none'`; the milestone and completion
 * state resets whenever the value moves backward, so a retried task announces again.
 * A non-finite `value` counts as `min`; if `max <= min` the track renders empty and a
 * warning is logged in development.
 */
export function ProgressBar({
  label,
  value,
  min = 0,
  max = 100,
  formatValue = defaultFormatValue,
  showValue = true,
  hideLabel = false,
  tone = 'neutral',
  announce = 'complete',
  overrides,
}: ProgressBarProps): React.JSX.Element {
  const { tokens } = useTheme();
  const reducedMotion = useReducedMotion();

  const indeterminate = value === undefined;
  const validRange = max > min;

  React.useEffect(() => {
    if (__DEV__ && !validRange) {
      console.warn(`ProgressBar: max (${max}) must be greater than min (${min}).`);
    }
  }, [validRange, min, max]);

  const safeValue = !indeterminate && Number.isFinite(value) ? (value as number) : min;
  const clamped = validRange ? clamp(safeValue, min, max) : min;
  const fraction = validRange ? (clamped - min) / (max - min) : 0;
  const displayedValueText = formatValue(clamped, min, max);

  const trackColor = overrides?.track ? (resolveToken(tokens, overrides.track) as string) : tokens.colorBackgroundStrong;
  const trackHeight = overrides?.trackHeight ? (resolveToken(tokens, overrides.trackHeight) as number) : tokens.space2;
  const radius = overrides?.radius ? (resolveToken(tokens, overrides.radius) as number) : tokens.radiusFull;
  const partGap = overrides?.partGap ? (resolveToken(tokens, overrides.partGap) as number) : tokens.space1;
  const transitionDuration = overrides?.transition ? (resolveToken(tokens, overrides.transition) as number) : tokens.motionDurationBase;
  const indeterminateLoopDuration = overrides?.indeterminateLoop
    ? (resolveToken(tokens, overrides.indeterminateLoop) as number)
    : tokens.motionDurationLoop;

  const fillColor = tokens[FILL_TOKEN[tone]];

  // labelSize/labelWeight/valueSize/fontFamily/lineHeight are the composed Text
  // children's own bindings — forwarded to their `overrides`, never resolved here.
  const labelTextOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.labelSize,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };
  const valueTextOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.valueSize,
    lineHeight: overrides?.lineHeight,
  };

  // The determinate fill is animated on `width` in pixels (measured from the track)
  // rather than a percentage string, which `Animated` cannot interpolate everywhere.
  const [trackWidth, setTrackWidth] = React.useState(0);
  const fillWidth = React.useRef(new Animated.Value(0)).current;
  const laidOutWidth = React.useRef(0);

  React.useEffect(() => {
    if (indeterminate) {
      return;
    }
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
      duration: transitionDuration,
      easing: toEasing(tokens.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [indeterminate, fraction, trackWidth, reducedMotion, fillWidth, transitionDuration, tokens.motionEasingStandard]);

  const sweepX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!indeterminate || reducedMotion || trackWidth <= 0) {
      return undefined;
    }
    const sweepWidth = trackWidth / 3; // literal-ok: one third of the track, per the indeterminate sweep spec
    sweepX.setValue(-sweepWidth);
    const animation = Animated.loop(
      Animated.timing(sweepX, {
        toValue: trackWidth,
        duration: indeterminateLoopDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [indeterminate, reducedMotion, trackWidth, indeterminateLoopDuration, sweepX]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  // Announcements: indeterminate once on entry, milestones at 25/50/75, completion
  // once at 100 — all gated on `announce`, and reset on any backward movement so a
  // retried task announces again.
  const prevIndeterminateRef = React.useRef(indeterminate);
  const prevPercentRef = React.useRef<number | null>(null);
  const announcedMilestoneRef = React.useRef(0);
  const completedAnnouncedRef = React.useRef(false);

  React.useEffect(() => {
    if (announce === 'none') {
      return;
    }
    const wasIndeterminate = prevIndeterminateRef.current;
    prevIndeterminateRef.current = indeterminate;

    if (indeterminate) {
      if (!wasIndeterminate) {
        announcedMilestoneRef.current = 0;
        completedAnnouncedRef.current = false;
        prevPercentRef.current = null;
        AccessibilityInfo.announceForAccessibility(COPY.indeterminate(label));
      }
      return;
    }

    const percent = Math.round(fraction * 100);
    const prevPercent = prevPercentRef.current;
    if (prevPercent !== null && percent < prevPercent) {
      announcedMilestoneRef.current = 0;
      completedAnnouncedRef.current = false;
    }
    prevPercentRef.current = percent;

    if (percent >= 100) {
      if (!completedAnnouncedRef.current) {
        completedAnnouncedRef.current = true;
        announcedMilestoneRef.current = 100;
        AccessibilityInfo.announceForAccessibility(COPY.complete(label));
      }
      return;
    }

    if (announce === 'milestones') {
      for (const milestone of MILESTONES) {
        if (percent >= milestone && announcedMilestoneRef.current < milestone) {
          announcedMilestoneRef.current = milestone;
          AccessibilityInfo.announceForAccessibility(COPY.progress(label, formatValue(clamped, min, max)));
        }
      }
    }
  }, [announce, indeterminate, fraction, label, formatValue, clamped, min, max]);

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
  };

  const labelRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  };

  const trackStyle: ViewStyle = {
    height: trackHeight,
    borderRadius: radius,
    backgroundColor: trackColor,
    overflow: 'hidden',
  };

  const fillStyle: Animated.WithAnimatedValue<ViewStyle> = indeterminate
    ? reducedMotion
      ? {
          height: trackHeight,
          borderRadius: radius,
          backgroundColor: fillColor,
          width: '100%',
          opacity: tokens.opacityDisabled,
        }
      : {
          height: trackHeight,
          borderRadius: radius,
          backgroundColor: fillColor,
          width: trackWidth / 3, // literal-ok: one third of the track, per the indeterminate sweep spec
          transform: [{ translateX: sweepX }],
        }
    : {
        height: trackHeight,
        borderRadius: radius,
        backgroundColor: fillColor,
        width: fillWidth,
        // Start edge follows the writing direction under I18nManager because the
        // fill is a normal flex child, not absolutely positioned.
        alignSelf: 'flex-start',
      };

  const showValueText = showValue && !indeterminate;
  const showLabelRow = !hideLabel || showValueText;

  return (
    <View
      testID="ProgressBar"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={indeterminate ? { min, max } : { min, max, now: clamped, text: displayedValueText }}
      accessibilityState={indeterminate ? { busy: true } : undefined}
      style={containerStyle}
    >
      {showLabelRow ? (
        <View style={labelRowStyle}>
          {hideLabel ? null : (
            <View testID="ProgressBar.label">
              <Text size="sm" weight="medium" overrides={labelTextOverrides}>
                {label}
              </Text>
            </View>
          )}
          {showValueText ? (
            <View testID="ProgressBar.valueText">
              <Text size="sm" tone="muted" overrides={valueTextOverrides}>
                {displayedValueText}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View testID="ProgressBar.track" style={trackStyle} onLayout={handleTrackLayout}>
        <Animated.View testID="ProgressBar.fill" style={fillStyle} />
      </View>
    </View>
  );
}
