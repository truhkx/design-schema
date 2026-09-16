import * as React from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import type { LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
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
  /**
   * Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range —
   * `(value − min) / (max − min)`, the same arithmetic the fill uses.
   */
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
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
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

/** Milestone tiers are quarters of the range: 1–3 announce `copy.progress`, 4 is completion. */
const TIERS = 4;

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
 * Renders an `accessible` `View` with `accessibilityRole="progressbar"`,
 * `accessibilityLabel` (the accessible name even when `hideLabel` hides the visible
 * label) and `accessibilityValue={{ min, max, now, text }}` — an indeterminate bar
 * carries `min` and `max` only and sets `accessibilityState={{ busy: true }}`. Inside:
 * an optional label row (`Text` label and, when determinate and `showValue`, a muted
 * `Text` value) and a track `View` holding an `Animated.View` fill. The fill's width
 * animates to the value's fraction of the range over `transition`, snapping under
 * reduced motion. Indeterminate: a one-third-width fill sweeps the track on a linear
 * `Animated.loop` over `indeterminateLoop`, not started under reduced motion, where a
 * static full-width fill at `opacity.disabled` replaces it.
 *
 * Announcements (`AccessibilityInfo.announceForAccessibility`, skipped for
 * `announce="none"`): `copy.indeterminate` each time the bar becomes indeterminate,
 * including on mount; `copy.progress` at 25/50/75% for `milestones` (only the highest
 * tier crossed by one change); `copy.complete` once on reaching `max`. A value that
 * moves backward resets the announced tiers to where it now is. The bar is never
 * focusable. If `max <= min` the track renders empty and a development warning is logged.
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
  ref,
}: ProgressBarProps): React.JSX.Element {
  const { tokens } = useTheme();
  const reducedMotion = useReducedMotion();

  const indeterminate = value === undefined;
  const validRange = max > min;

  React.useEffect(() => {
    if (__DEV__ && !validRange) {
      console.warn(`ProgressBar: max (${max}) must be greater than min (${min}); the bar renders empty.`);
    }
  }, [validRange, min, max]);

  const safeValue = value !== undefined && Number.isFinite(value) ? value : min;
  const clamped = validRange ? clamp(safeValue, min, max) : min;
  const fraction = validRange ? (clamped - min) / (max - min) : 0;
  const valueText = formatValue(clamped, min, max);

  const trackColor = overrides?.track ? (resolveToken(tokens, overrides.track) as string) : tokens.colorBackgroundStrong;
  const trackHeight = overrides?.trackHeight ? (resolveToken(tokens, overrides.trackHeight) as number) : tokens.space2;
  const radius = overrides?.radius ? (resolveToken(tokens, overrides.radius) as number) : tokens.radiusFull;
  const partGap = overrides?.partGap ? (resolveToken(tokens, overrides.partGap) as number) : tokens.space1;
  const transitionDuration = overrides?.transition ? (resolveToken(tokens, overrides.transition) as number) : tokens.motionDurationBase;
  const loopDuration = overrides?.indeterminateLoop
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

  // The determinate fill animates `width` in pixels measured from the track;
  // `Animated` cannot interpolate percentage strings on every platform.
  const [trackWidth, setTrackWidth] = React.useState(0);
  const fillWidth = React.useRef(new Animated.Value(0)).current;
  const laidOutWidth = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (indeterminate) {
      return;
    }
    const toValue = trackWidth * fraction;
    // Only a change to `value` animates; the first layout and resizes snap.
    const resized = laidOutWidth.current !== trackWidth;
    laidOutWidth.current = trackWidth;
    if (reducedMotion || resized || trackWidth <= 0) {
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
  const sweepWidth = trackWidth / 3; // literal-ok: one third of the track, per the indeterminate sweep spec

  React.useEffect(() => {
    if (!indeterminate || reducedMotion || trackWidth <= 0) {
      return undefined;
    }
    sweepX.setValue(-sweepWidth);
    // Linear easing so the restart of the loop has no visible seam.
    const animation = Animated.loop(
      Animated.timing(sweepX, {
        toValue: trackWidth,
        duration: loopDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [indeterminate, reducedMotion, trackWidth, sweepWidth, loopDuration, sweepX]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  // Announcement state is tracked whatever `announce` is, so switching it on later
  // does not replay tiers the bar has already passed.
  const wasIndeterminate = React.useRef<boolean | null>(null);
  const previousFraction = React.useRef<number | null>(null);
  const announcedTier = React.useRef(0);

  React.useEffect(() => {
    const entered = indeterminate && wasIndeterminate.current !== true;
    wasIndeterminate.current = indeterminate;

    if (indeterminate) {
      previousFraction.current = null;
      announcedTier.current = 0;
      if (entered && announce !== 'none') {
        AccessibilityInfo.announceForAccessibility(COPY.indeterminate(label));
      }
      return;
    }
    if (!validRange) {
      return;
    }

    const tier = Math.floor(fraction * TIERS);
    const previous = previousFraction.current;
    previousFraction.current = fraction;
    if (previous !== null && fraction < previous) {
      announcedTier.current = tier;
      return;
    }
    if (tier <= announcedTier.current) {
      return;
    }
    announcedTier.current = tier;

    if (announce === 'none') {
      return;
    }
    if (tier >= TIERS) {
      AccessibilityInfo.announceForAccessibility(COPY.complete(label));
    } else if (announce === 'milestones') {
      AccessibilityInfo.announceForAccessibility(COPY.progress(label, valueText));
    }
  }, [announce, indeterminate, validRange, fraction, label, valueText]);

  const containerStyle: ViewStyle = { flexDirection: 'column', gap: partGap };

  const labelRowStyle: ViewStyle = { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' };

  const trackStyle: ViewStyle = {
    height: trackHeight,
    borderRadius: radius,
    backgroundColor: trackColor,
    overflow: 'hidden',
  };

  const fillStyle: Animated.WithAnimatedValue<ViewStyle> = indeterminate
    ? reducedMotion
      ? { height: trackHeight, borderRadius: radius, backgroundColor: fillColor, width: '100%', opacity: tokens.opacityDisabled }
      : {
          height: trackHeight,
          borderRadius: radius,
          backgroundColor: fillColor,
          width: sweepWidth,
          transform: [{ translateX: sweepX }],
        }
    : { height: trackHeight, borderRadius: radius, backgroundColor: fillColor, width: fillWidth, alignSelf: 'flex-start' };

  const showValueText = showValue && !indeterminate;
  const showLabelRow = !hideLabel || showValueText;

  return (
    <View
      ref={ref}
      testID="ProgressBar"
      accessible
      focusable={false}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={indeterminate ? { min, max } : { min, max, now: clamped, text: valueText }}
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
                {valueText}
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
