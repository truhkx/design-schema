import * as React from 'react';
import { AccessibilityInfo, Animated, I18nManager, View } from 'react-native';
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
  | 'labelGap'
  | 'transition'
  | 'indeterminateLoop'
  | 'indeterminateReducedOpacity'
  | 'sweepEasing';

export interface ProgressBarProps {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`; always the accessible name. */
  label: string;
  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the end is
   * unknown). Clamped to `min`…`max`; a non-finite number is treated as `min`.
   */
  value?: number | null | undefined;
  /** Start of the range. A non-finite number is treated as the default, 0. */
  min?: number | undefined;
  /** End of the range. A non-finite number is treated as the default, 100. */
  max?: number | undefined;
  /**
   * Renders the value text ("42%", "3 of 12 files"), called with the clamped value. Defaults to a whole-number
   * percentage over the whole range — `(value − min) / (max − min)`, the same arithmetic the fill uses.
   */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text at the end of the label row. Ignored when indeterminate. */
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

/** Announcement tiers are quarters of the range: 1–3 announce `copy.progress`, 4 is `max` (completion). */
const TIERS = 4;

/** Invalid min/max pairs already warned about, for the life of the process: a second bar with the same bad range, or a remount, stays silent. */
const warnedRanges = new Set<string>();

function defaultFormatValue(value: number, min: number, max: number): string {
  const fraction = max > min ? (value - min) / (max - min) : 0;
  return new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
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
 * Renders an `accessible` `View` with `role="progressbar"`,
 * `accessibilityLabel` (the accessible name even when `hideLabel` hides the visible
 * label) and `accessibilityValue={{ min, max, now, text }}` — an indeterminate bar
 * carries `min` and `max` only and sets `accessibilityState={{ busy: true }}`. The bar
 * is never focusable. The fill's width animates to the value's fraction over
 * `transition`, snapping under reduced motion. Indeterminate: a one-third-width fill
 * sweeps from wholly before the track's inline start to wholly past its inline end
 * (leftward under `I18nManager.isRTL`) over `indeterminateLoop` with `sweepEasing`; under
 * reduced motion no loop starts and the fill is drawn full-width at `indeterminateReducedOpacity`.
 *
 * Announcements (`AccessibilityInfo.announceForAccessibility`): the tier is
 * `floor(fraction × 4)` and is tracked whatever `announce` is. The state at mount is
 * recorded silently, except that a bar mounting indeterminate announces
 * `copy.indeterminate`, as it does each later time it becomes indeterminate.
 * `milestones` announces `copy.progress` once for the highest tier 1–3 entered by an
 * update; reaching `max` announces `copy.complete` (for `milestones` and `complete`).
 * Moving to a lower tier resets the record to that tier, and entering the indeterminate
 * state resets it to tier 0, so the first known value afterwards announces again. With
 * `max <= min` the bar renders empty, reports `now = min`, records no tier, announces no
 * progress or completion, and warns in development; the tier the range arrives at when it
 * becomes valid again is recorded silently, as at mount.
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
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const indeterminate = value === undefined || value === null;

  // A non-finite bound falls back to its default, on every platform.
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 100;
  const validRange = safeMax > safeMin;

  // Development warning: an inverted or empty range is not a range. Warned once per distinct pair.
  React.useEffect(() => {
    if (!__DEV__ || validRange) return;
    const key = `${safeMin}/${safeMax}`;
    if (warnedRanges.has(key)) return;
    warnedRanges.add(key);
    console.warn(`ProgressBar: \`max\` (${safeMax}) must be greater than \`min\` (${safeMin}); the bar renders empty.`);
  }, [validRange, safeMin, safeMax]);

  const safeValue = typeof value === 'number' && Number.isFinite(value) ? value : safeMin;
  const clamped = validRange ? Math.min(safeMax, Math.max(safeMin, safeValue)) : safeMin;
  const fraction = validRange ? (clamped - safeMin) / (safeMax - safeMin) : 0;
  // Rounding is for the text only; the fill width uses the exact fraction. Nothing formats
  // a value while indeterminate, and a range that is not a range reads "0%".
  const valueText = indeterminate
    ? ''
    : validRange
      ? formatValue(clamped, safeMin, safeMax)
      : defaultFormatValue(safeMin, safeMin, safeMax);

  const trackColor = overrides?.track ? (resolveToken(t, overrides.track) as string) : t.colorBackgroundStrong;
  const trackHeight = overrides?.trackHeight ? (resolveToken(t, overrides.trackHeight) as number) : t.space2;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusFull;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const labelGap = overrides?.labelGap ? (resolveToken(t, overrides.labelGap) as number) : t.space2;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationBase;
  const loopDuration = overrides?.indeterminateLoop
    ? (resolveToken(t, overrides.indeterminateLoop) as number)
    : t.motionDurationLoop;
  const sweepEasing = overrides?.sweepEasing
    ? (resolveToken(t, overrides.sweepEasing) as Tokens['motionEasingStandard'])
    : t.motionEasingStandard;
  const reducedOpacity = overrides?.indeterminateReducedOpacity
    ? (resolveToken(t, overrides.indeterminateReducedOpacity) as number)
    : t.opacityDisabled;

  const fillColor = t[FILL_TOKEN[tone]];

  // The determinate fill animates `width` in measured pixels: a percentage cannot be interpolated.
  const [trackWidth, setTrackWidth] = React.useState(0);
  const fillWidth = React.useRef(new Animated.Value(0)).current;
  const laidOutWidth = React.useRef(0);

  React.useEffect(() => {
    if (indeterminate) {
      return;
    }
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
  }, [indeterminate, fraction, trackWidth, reducedMotion, fillWidth, transitionDuration, t.motionEasingStandard]);

  const sweepX = React.useRef(new Animated.Value(0)).current;
  const sweepWidth = trackWidth / 3; // literal-ok: the sweep fill is one third of the track, per the indeterminateLoop binding

  React.useEffect(() => {
    if (!indeterminate || reducedMotion || trackWidth === 0) {
      return undefined;
    }
    // The fill sits at the track's inline start (flex-start). It begins wholly before the
    // start edge and ends wholly past the end edge, so the eased restart has no seam.
    const rtl = I18nManager.isRTL;
    const from = rtl ? sweepWidth : -sweepWidth;
    const to = rtl ? -trackWidth : trackWidth;
    sweepX.setValue(from);
    const animation = Animated.loop(
      Animated.timing(sweepX, {
        toValue: to,
        duration: loopDuration,
        easing: toEasing(sweepEasing),
        useNativeDriver: false,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [indeterminate, reducedMotion, trackWidth, sweepWidth, loopDuration, sweepEasing, sweepX]);

  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth((prev) => (prev === width ? prev : width));
  };

  // Announcement record, tracked whatever `announce` is, so switching it mid-task
  // never replays tiers already passed.
  const wasIndeterminate = React.useRef(false);
  const recordedTier = React.useRef(0);
  // The next determinate tier is recorded without announcing: true at mount, and again
  // whenever the range has been invalid, since neither is progress the user made.
  const recordSilently = React.useRef(true);

  React.useEffect(() => {
    if (indeterminate) {
      // Entering the indeterminate state (including at mount) announces once, resets the
      // record to tier 0 and re-arms completion, so the first known value afterwards speaks.
      if (!wasIndeterminate.current) {
        wasIndeterminate.current = true;
        recordedTier.current = 0;
        recordSilently.current = false;
        if (announce !== 'none') {
          AccessibilityInfo.announceForAccessibility(COPY.indeterminate(label));
        }
      }
      return;
    }
    wasIndeterminate.current = false;

    if (!validRange) {
      // Not a range: no tier is recorded, and the one the bar arrives at when the range
      // becomes valid is recorded silently.
      recordSilently.current = true;
      return;
    }

    const tier = Math.floor(fraction * TIERS);
    if (recordSilently.current) {
      recordSilently.current = false;
      recordedTier.current = tier;
      return;
    }
    if (tier <= recordedTier.current) {
      // Backward: the tiers above re-arm (completion included), the ones below stay announced.
      recordedTier.current = tier;
      return;
    }
    // Several tiers crossed at once make one announcement, for the highest.
    recordedTier.current = tier;

    if (announce === 'none') {
      return;
    }
    if (tier >= TIERS) {
      AccessibilityInfo.announceForAccessibility(COPY.complete(label));
    } else if (announce === 'milestones') {
      AccessibilityInfo.announceForAccessibility(COPY.progress(label, valueText));
    }
  }, [announce, indeterminate, validRange, fraction, label, valueText]);

  const showValueText = showValue && !indeterminate;
  const showHeader = !hideLabel || showValueText;

  const styles = React.useMemo(() => {
    const container: ViewStyle = { flexDirection: 'column', gap: partGap };
    const header: ViewStyle = {
      flexDirection: 'row',
      // With the label hidden the value text stays at the inline end.
      justifyContent: hideLabel ? 'flex-end' : 'space-between',
      alignItems: 'baseline',
      gap: labelGap,
    };
    // A long label wraps onto more lines inside the row rather than pushing the value text out.
    const labelWrapper: ViewStyle = { flexShrink: 1, minWidth: 0 };
    // The value text never wraps; the label gives way instead.
    const valueWrapper: ViewStyle = { flexShrink: 0 };
    const track: ViewStyle = {
      height: trackHeight,
      borderRadius: radius,
      backgroundColor: trackColor,
      overflow: 'hidden',
    };
    return { container, header, labelWrapper, valueWrapper, track };
  }, [partGap, labelGap, hideLabel, trackHeight, radius, trackColor]);

  const fillStyle: Animated.WithAnimatedValue<ViewStyle> = indeterminate
    ? reducedMotion
      ? { height: trackHeight, borderRadius: radius, backgroundColor: fillColor, width: '100%', opacity: reducedOpacity }
      : {
          height: trackHeight,
          borderRadius: radius,
          backgroundColor: fillColor,
          width: sweepWidth,
          alignSelf: 'flex-start',
          transform: [{ translateX: sweepX }],
        }
    : { height: trackHeight, borderRadius: radius, backgroundColor: fillColor, width: fillWidth, alignSelf: 'flex-start' };

  return (
    <View
      ref={ref}
      testID="ProgressBar"
      // One accessibility element: the name, value and busy state announce together.
      accessible
      focusable={false}
      role="progressbar"
      accessibilityLabel={label}
      aria-label={label}
      // An indeterminate bar carries the bounds only: it never names a progress it does not know.
      accessibilityValue={indeterminate ? { min: safeMin, max: safeMax } : { min: safeMin, max: safeMax, now: clamped, text: valueText }}
      accessibilityState={indeterminate ? { busy: true } : undefined}
      // The aria-* aliases carry the same value and busy state. React Native merges them
      // into `accessibilityValue` / `accessibilityState`; react-native-web forwards only these.
      aria-valuemin={safeMin}
      aria-valuemax={safeMax}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={indeterminate ? undefined : valueText}
      aria-busy={indeterminate ? true : undefined}
      style={styles.container}
    >
      {showHeader ? (
        <View testID="ProgressBar.header" style={styles.header}>
          {hideLabel ? null : (
            <View testID="ProgressBar.label" style={styles.labelWrapper}>
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
          )}
          {showValueText ? (
            <View testID="ProgressBar.valueText" style={styles.valueWrapper}>
              <Text
                size="sm"
                tone="muted"
                overrides={{
                  fontSize: overrides?.valueSize,
                  fontFamily: overrides?.fontFamily,
                  lineHeight: overrides?.lineHeight,
                }}
              >
                {valueText}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View testID="ProgressBar.track" style={styles.track} onLayout={handleTrackLayout}>
        <Animated.View testID="ProgressBar.fill" style={fillStyle} />
      </View>
    </View>
  );
}
