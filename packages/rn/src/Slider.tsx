import * as React from 'react';
import { AccessibilityInfo, Animated, PanResponder, Platform, StyleSheet, View, findNodeHandle } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text, TextForegroundContext } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type SliderShowValue = 'always' | 'hover' | 'never';

export interface SliderMark {
  value: number;
  label?: string | undefined;
}

export type SliderValue = number | [number, number];

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SliderOverridableBinding =
  | 'track'
  | 'trackHeight'
  | 'trackRadius'
  | 'thumb'
  | 'thumbSize'
  | 'thumbShadow'
  | 'thumbActiveScale'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'valueSize'
  | 'bubbleRadius'
  | 'labelWeight'
  | 'partGap'
  | 'trackPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'helperSize'
  | 'errorText'
  | 'disabledOpacity'
  | 'transition';

export interface SliderProps {
  /** Visible label naming the quantity ("Volume", "Price range"). A range's thumbs are named via `copy.minimumLabel`/`copy.maximumLabel`. */
  label: string;
  /** Field name for the Form. A range contributes `[min, max]`. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  step?: number | undefined;
  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by `step`, PageUp/Down by mark). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default to submit (`copy.required`). */
  required?: boolean | undefined;
  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  invalid?: boolean | undefined;
  /** Controlled value; for a range, a two-number array. */
  value?: SliderValue | undefined;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  defaultValue?: SliderValue | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  range?: boolean | undefined;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  formatValue?: ((value: number) => string) | undefined;
  /** Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all. */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. Values snap to marks when `step` is omitted. */
  marks?: SliderMark[] | undefined;
  /** Not adjustable, still readable. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or via an accessibility action (number or pair). */
  onValueChange?: ((value: SliderValue) => void) | undefined;
  /** Fired once when the interaction ends (drag release, accessibility action). Use for expensive effects. */
  onSlidingComplete?: ((value: SliderValue) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  minimumLabel: (label: string): string => `${label} minimum`,
  maximumLabel: (label: string): string => `${label} maximum`,
  rangeText: (low: string, high: string): string => `${low} – ${high}`,
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
} as const;

/**
 * `increment`/`decrement` are the standard adjustable actions (VoiceOver swipe, TalkBack
 * volume keys). The other four stand in for Home/End/PageUp/PageDown and live in the
 * platform's Actions menu, which needs a label; the doc has no copy for them.
 */
const THUMB_ACTIONS = [
  { name: 'increment' },
  { name: 'decrement' },
  { name: 'home', label: 'Home' },
  { name: 'end', label: 'End' },
  { name: 'pageup', label: 'Page Up' },
  { name: 'pagedown', label: 'Page Down' },
] as const;

/** PageUp/PageDown move by this many steps. */
const PAGE_STEPS = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function percentOf(value: number, min: number, max: number): number {
  if (max <= min) {
    return 0;
  }
  return clamp((value - min) / (max - min), 0, 1);
}

function isSameSliderValue(a: SliderValue, b: SliderValue): boolean {
  return Array.isArray(a) && Array.isArray(b) ? a[0] === b[0] && a[1] === b[1] : a === b;
}

/** Removes floating-point drift from step arithmetic (0.1 + 0.2) so values stay on the step grid. */
function tidy(value: number): number {
  return Math.round(value * 1e9) / 1e9; // literal-ok: float rounding precision, not a size
}

/** Snaps a drag position: to the nearest mark when marks snap, otherwise to the step grid. */
function snapValue(raw: number, min: number, max: number, step: number, marks: readonly SliderMark[] | undefined): number {
  const clamped = clamp(raw, min, max);
  if (marks !== undefined && marks.length > 0) {
    let nearest = marks[0]!.value;
    for (const mark of marks) {
      if (Math.abs(clamped - mark.value) < Math.abs(clamped - nearest)) {
        nearest = mark.value;
      }
    }
    return clamp(nearest, min, max);
  }
  if (step <= 0) {
    return clamped;
  }
  return clamp(tidy(min + Math.round((clamped - min) / step) * step), min, max);
}

/** Ten steps in `direction` (PageUp/PageDown), or to the next/previous mark when marks snap. */
function pagedValue(current: number, direction: 1 | -1, min: number, max: number, step: number, marks: readonly SliderMark[] | undefined): number {
  if (marks !== undefined && marks.length > 0) {
    const sorted = marks.map((mark) => mark.value).sort((a, b) => a - b);
    const candidates = direction > 0 ? sorted.filter((v) => v > current) : sorted.filter((v) => v < current).reverse();
    return clamp(candidates[0] ?? current, min, max);
  }
  return clamp(tidy(current + direction * step * PAGE_STEPS), min, max);
}

type ThumbKind = 'single' | 'min' | 'max';

interface ThumbStyleTokens {
  thumbSize: number;
  thumbBorderWidth: number;
  thumbColor: string;
  thumbBorderColor: string;
  thumbShadow: Tokens['shadowRaised'];
  fillColor: string;
  haloInset: number;
  haloOpacity: number;
  minTarget: number;
  focusRing: string;
  focusRingWidth: number;
  bubbleSurface: string;
  bubbleText: string;
  bubbleRadius: number;
  bubblePaddingBlock: number;
  bubblePaddingInline: number;
  motionEasingStandard: readonly number[];
  transitionDuration: number;
}

interface SliderThumbProps {
  kind: ThumbKind;
  value: number;
  /** The live constraint: the other thumb's value bounds this one in a range. */
  min: number;
  max: number;
  /** The slider's own bounds, which map a drag distance to a value. */
  scaleMin: number;
  scaleMax: number;
  step: number;
  snapMarks: readonly SliderMark[] | undefined;
  pageMarks: readonly SliderMark[] | undefined;
  disabled: boolean;
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  showBubble: boolean;
  bubbleTypography: { fontFamily: TokenRef | undefined; fontSize: TokenRef | undefined };
  reducedMotion: boolean;
  trackWidthRef: React.RefObject<number>;
  onChange: (kind: ThumbKind, next: number) => void;
  onEnd: () => void;
  styleTokens: ThumbStyleTokens;
  ref?: React.Ref<ViewInstance> | undefined;
}

/**
 * One thumb: a `View` (not `Pressable`) carrying a `PanResponder`'s handlers directly,
 * since spreading `panHandlers` onto `Pressable` fights its own responder. The
 * adjustable role and accessibility actions are the non-gesture path; the drag is
 * additive. A `latest` ref keeps the responder's closures current without recreating
 * the `PanResponder` mid-gesture.
 */
function SliderThumb({
  kind,
  value,
  min,
  max,
  scaleMin,
  scaleMax,
  step,
  snapMarks,
  pageMarks,
  disabled,
  accessibilityLabel,
  formatValue,
  showBubble,
  bubbleTypography,
  reducedMotion,
  trackWidthRef,
  onChange,
  onEnd,
  styleTokens: st,
  ref,
}: SliderThumbProps): React.JSX.Element {
  const [dragging, setDragging] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const dragStartValue = React.useRef(value);

  const latest = React.useRef({ value, min, max, scaleMin, scaleMax, step, snapMarks, pageMarks, disabled, onChange, onEnd });
  latest.current = { value, min, max, scaleMin, scaleMax, step, snapMarks, pageMarks, disabled, onChange, onEnd };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        dragStartValue.current = latest.current.value;
        setDragging(true);
      },
      onPanResponderMove: (_evt, gesture) => {
        const width = trackWidthRef.current;
        if (width <= 0) {
          return;
        }
        const cur = latest.current;
        const raw = dragStartValue.current + (gesture.dx / width) * (cur.scaleMax - cur.scaleMin);
        const next = clamp(snapValue(raw, cur.scaleMin, cur.scaleMax, cur.step, cur.snapMarks), cur.min, cur.max);
        if (next !== cur.value) {
          cur.onChange(kind, next);
        }
      },
      onPanResponderRelease: () => {
        setDragging(false);
        latest.current.onEnd();
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        latest.current.onEnd();
      },
    }),
  ).current;

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    const cur = latest.current;
    if (cur.disabled) {
      return;
    }
    let next: number;
    switch (event.nativeEvent.actionName) {
      case 'increment':
        next = clamp(tidy(cur.value + cur.step), cur.min, cur.max);
        break;
      case 'decrement':
        next = clamp(tidy(cur.value - cur.step), cur.min, cur.max);
        break;
      case 'pageup':
        next = clamp(pagedValue(cur.value, 1, cur.scaleMin, cur.scaleMax, cur.step, cur.pageMarks), cur.min, cur.max);
        break;
      case 'pagedown':
        next = clamp(pagedValue(cur.value, -1, cur.scaleMin, cur.scaleMax, cur.step, cur.pageMarks), cur.min, cur.max);
        break;
      case 'home':
        next = cur.min;
        break;
      case 'end':
        next = cur.max;
        break;
      default:
        return;
    }
    if (next === cur.value) {
      return;
    }
    cur.onChange(kind, next);
    cur.onEnd();
  };

  // Halo and bubble appearance follow the `transition` binding; the thumb itself tracks the finger with no transition.
  const haloAnim = React.useRef(new Animated.Value(0)).current;
  const haloTarget = React.useRef(0);
  React.useEffect(() => {
    const toValue = dragging ? 1 : 0;
    if (toValue === haloTarget.current) {
      return;
    }
    haloTarget.current = toValue;
    if (reducedMotion) {
      haloAnim.setValue(toValue);
      return;
    }
    Animated.timing(haloAnim, {
      toValue,
      duration: st.transitionDuration,
      easing: toEasing(st.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [dragging, reducedMotion, haloAnim, st.transitionDuration, st.motionEasingStandard]);

  const bubbleVisible = showBubble && (dragging || focused);
  const bubbleAnim = React.useRef(new Animated.Value(0)).current;
  const bubbleTarget = React.useRef(0);
  React.useEffect(() => {
    const toValue = bubbleVisible ? 1 : 0;
    if (toValue === bubbleTarget.current) {
      return;
    }
    bubbleTarget.current = toValue;
    if (reducedMotion) {
      bubbleAnim.setValue(toValue);
      return;
    }
    Animated.timing(bubbleAnim, {
      toValue,
      duration: st.transitionDuration,
      easing: toEasing(st.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [bubbleVisible, reducedMotion, bubbleAnim, st.transitionDuration, st.motionEasingStandard]);

  const percent = percentOf(value, scaleMin, scaleMax);
  // The halo extends `space.2` past the thumb on every side.
  const haloSize = st.thumbSize + st.haloInset * 2;

  const hitStyle: ViewStyle = {
    position: 'absolute',
    left: `${percent * 100}%`,
    top: '50%',
    width: st.minTarget,
    height: st.minTarget,
    marginLeft: -(st.minTarget / 2),
    marginTop: -(st.minTarget / 2),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: st.minTarget / 2,
    borderWidth: st.focusRingWidth,
    borderColor: focused ? st.focusRing : 'transparent',
  };

  const haloStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    width: haloSize,
    height: haloSize,
    borderRadius: haloSize / 2,
    backgroundColor: st.fillColor,
    opacity: haloAnim.interpolate({ inputRange: [0, 1], outputRange: [0, st.haloOpacity] }),
  };

  const thumbStyle: ViewStyle = {
    width: st.thumbSize,
    height: st.thumbSize,
    borderRadius: st.thumbSize / 2,
    backgroundColor: st.thumbColor,
    borderWidth: st.thumbBorderWidth,
    borderColor: st.thumbBorderColor,
    ...st.thumbShadow,
  };

  const bubbleStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    bottom: st.minTarget,
    paddingVertical: st.bubblePaddingBlock,
    paddingHorizontal: st.bubblePaddingInline,
    borderRadius: st.bubbleRadius,
    backgroundColor: st.bubbleSurface,
    opacity: bubbleAnim,
  };

  return (
    <View
      ref={ref}
      testID="Slider.thumb"
      accessible
      focusable
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
      accessibilityState={{ disabled }}
      accessibilityActions={THUMB_ACTIONS}
      onAccessibilityAction={handleAccessibilityAction}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...panResponder.panHandlers}
      style={hitStyle}
    >
      {showBubble ? (
        <Animated.View
          testID="Slider.bubble"
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={bubbleStyle}
        >
          {/* bubbleText is locked to color.inverse.foreground; Text reads it from the surface context. */}
          <TextForegroundContext.Provider value={st.bubbleText}>
            <Text size="sm" overrides={bubbleTypography}>
              {formatValue(value)}
            </Text>
          </TextForegroundContext.Provider>
        </Animated.View>
      ) : null}
      <Animated.View pointerEvents="none" style={haloStyle} />
      <View pointerEvents="none" style={thumbStyle} />
    </View>
  );
}

/**
 * Slider — a bounded numeric value (or, with `range`, a minimum and a maximum) chosen
 * by feel: the thumb sits on the value, the fill shows how much, and every value the
 * drag reaches is also reachable through the adjustable accessibility actions.
 *
 * When to use: a bounded value where approximate is fine and the scale has meaning
 * across its whole width — volume, brightness, a price range. Use `range` for
 * "between" filters, `marks` for meaningful stops, and pair with a NumberInput
 * (`showValue: never`) when exact entry also matters. Not for exact values, more than
 * about a hundred steps without marks, or two or three discrete choices.
 *
 * Each thumb is its own adjustable element: increment/decrement move by `step`,
 * Home/End/PageUp/PageDown are custom actions. Drag snaps to `step`, or to the marks
 * when `snapToMarks` is set or `step` is omitted. `onValueChange` fires on every
 * change, `onSlidingComplete` once per interaction (drag release, or each accessibility
 * action). A range's thumbs cannot cross; each thumb's `accessibilityValue` min/max is
 * the live constraint from the other. `disabled` dims with `disabledOpacity` and stays
 * focusable and readable but inert. Inside a Form the field registers once: its value
 * as a string, or a range as the `[low, high]` pair of strings.
 */
export function Slider({
  label,
  name,
  min = 0,
  max = 100,
  step: stepProp,
  snapToMarks = false,
  required = false,
  invalid = false,
  value,
  defaultValue,
  range = false,
  formatValue = String,
  showValue = 'always',
  marks,
  disabled = false,
  description,
  error,
  overrides,
  onValueChange,
  onSlidingComplete,
  ref,
}: SliderProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();

  const step = stepProp ?? 1;
  const hasMarks = marks !== undefined && marks.length > 0;
  // Drag snaps to marks with `snapToMarks`, or when `step` is omitted; PageUp/Down move by mark in the same cases.
  const snapMarks = hasMarks && (snapToMarks || stepProp === undefined) ? marks : undefined;

  const fallbackValue: SliderValue = range ? [min, max] : min;
  const defaultRef = React.useRef<SliderValue>(defaultValue ?? fallbackValue);
  const [internalValue, setInternalValue] = React.useState<SliderValue>(defaultRef.current);

  const isDisabled = disabled || (form?.disabled ?? false);
  const currentValue = value ?? internalValue;

  React.useEffect(() => {
    if (__DEV__ && !(max > min)) {
      console.warn(`Slider: max (${max}) must be greater than min (${min}).`);
    }
  }, [min, max]);

  const singleValue = !range && typeof currentValue === 'number' ? clamp(currentValue, min, max) : min;
  const [rangeLowRaw, rangeHighRaw] = range && Array.isArray(currentValue) ? currentValue : [min, max];
  const rangeLow = clamp(Math.min(rangeLowRaw, rangeHighRaw), min, max);
  const rangeHigh = clamp(Math.max(rangeLowRaw, rangeHighRaw), min, max);
  const normalized: SliderValue = range ? [rangeLow, rangeHigh] : singleValue;

  // The value as last reported, so an interaction's end reports what its changes reported even before a re-render.
  const reportedRef = React.useRef<SliderValue>(normalized);
  reportedRef.current = normalized;

  const validateValue = React.useCallback(
    (candidate: SliderValue): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && isSameSliderValue(candidate, defaultRef.current)) {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [required, label, error, invalid],
  );

  const handleChange = (kind: ThumbKind, next: number): void => {
    const base = reportedRef.current;
    let nextValue: SliderValue;
    if (Array.isArray(base)) {
      nextValue = kind === 'min' ? [Math.min(next, base[1]), base[1]] : [base[0], Math.max(next, base[0])];
    } else {
      nextValue = next;
    }
    if (isSameSliderValue(nextValue, base)) {
      return;
    }
    reportedRef.current = nextValue;
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(nextValue));
    }
  };

  const handleEnd = (): void => {
    const final = reportedRef.current;
    onSlidingComplete?.(final);
    // A pointer-driven control has no blur: `validate: blur` runs at the end of an interaction.
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(final));
    }
  };

  const trackWidthRef = React.useRef(0);
  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  };

  const firstThumbRef = React.useRef<ViewInstance>(null);

  const latestForm = React.useRef({ normalized, validateValue, label });
  latestForm.current = { normalized, validateValue, label };

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      get label() {
        return latestForm.current.label;
      },
      getValue: () => {
        const current = latestForm.current.normalized;
        return Array.isArray(current) ? [String(current[0]), String(current[1])] : String(current);
      },
      validate: () => latestForm.current.validateValue(latestForm.current.normalized),
      focus: () => {
        const node = firstThumbRef.current;
        const handleNode = node === null ? null : findNodeHandle(node);
        if (handleNode != null) {
          AccessibilityInfo.setAccessibilityFocus(handleNode);
        }
      },
    }),
    [],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  const formError = form?.errors[name];
  // Precedence: `error` prop → the Form's validation result (required, invalid) → `invalid` on its own.
  const displayedError =
    error !== undefined && error !== '' ? error : formError !== undefined ? formError : invalid ? COPY.invalid(label) : undefined;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const trackColor = overrides?.track ? (resolveToken(t, overrides.track) as string) : t.colorBackgroundStrong;
  const trackHeight = overrides?.trackHeight ? (resolveToken(t, overrides.trackHeight) as number) : t.space1;
  const trackRadius = overrides?.trackRadius ? (resolveToken(t, overrides.trackRadius) as number) : t.radiusFull;
  const thumbColor = overrides?.thumb ? (resolveToken(t, overrides.thumb) as string) : t.colorControlBackground;
  const thumbSize = overrides?.thumbSize ? (resolveToken(t, overrides.thumbSize) as number) : t.space5;
  const thumbShadow = overrides?.thumbShadow ? (resolveToken(t, overrides.thumbShadow) as Tokens['shadowRaised']) : t.shadowRaised;
  const haloOpacity = overrides?.thumbActiveScale ? (resolveToken(t, overrides.thumbActiveScale) as number) : t.opacityDisabled;
  const markColor = overrides?.mark ? (resolveToken(t, overrides.mark) as string) : t.colorBorderStrong;
  const markSize = overrides?.markSize ? (resolveToken(t, overrides.markSize) as number) : t.space1;
  const markLabelSize = overrides?.markLabelSize ? (resolveToken(t, overrides.markLabelSize) as number) : t.fontSizeXs;
  const bubbleRadius = overrides?.bubbleRadius ? (resolveToken(t, overrides.bubbleRadius) as number) : t.radiusSm;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const trackPaddingBlock = overrides?.trackPaddingBlock ? (resolveToken(t, overrides.trackPaddingBlock) as number) : t.space3;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const errorColor = overrides?.errorText ? (resolveToken(t, overrides.errorText) as string) : undefined;
  // `fill` and `thumbBorder` share the locked selected-control token.
  const controlSelected = t.colorControlSelectedBackground;

  const thumbStyleTokens: ThumbStyleTokens = {
    thumbSize,
    thumbBorderWidth: t.borderWidthFocus,
    thumbColor,
    thumbBorderColor: controlSelected,
    thumbShadow,
    fillColor: controlSelected,
    haloInset: t.space2,
    haloOpacity,
    minTarget: t.sizeTargetComfortable,
    focusRing: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    bubbleSurface: t.colorInverseSurface,
    bubbleText: t.colorInverseForeground,
    bubbleRadius,
    bubblePaddingBlock: t.space1,
    bubblePaddingInline: t.space2,
    motionEasingStandard: t.motionEasingStandard,
    transitionDuration,
  };

  const displayValueText = range ? COPY.rangeText(formatValue(rangeLow), formatValue(rangeHigh)) : formatValue(singleValue);

  const markList = marks ?? [];
  const markLabels = markList.filter((mark) => mark.label !== undefined);

  const typography = { fontFamily: overrides?.fontFamily };
  const helperTypography = { ...typography, fontSize: overrides?.helperSize };

  const thumbShared = {
    scaleMin: min,
    scaleMax: max,
    step,
    snapMarks,
    pageMarks: snapMarks,
    disabled: isDisabled,
    formatValue,
    showBubble: showValue === 'hover',
    bubbleTypography: { ...typography, fontSize: overrides?.valueSize },
    reducedMotion,
    trackWidthRef,
    onChange: handleChange,
    onEnd: handleEnd,
    styleTokens: thumbStyleTokens,
  };

  const errorMessage = (
    <Text size="sm" tone={errorColor === undefined ? 'danger' : 'default'} overrides={helperTypography}>
      {displayedError}
    </Text>
  );

  return (
    <View ref={ref} testID="Slider" style={{ flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: partGap }}>
        <View testID="Slider.label">
          <Text weight="medium" overrides={{ ...typography, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight }}>
            {label}
          </Text>
        </View>
        {showValue === 'always' ? (
          <View testID="Slider.valueText" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text size="sm" overrides={{ ...typography, fontSize: overrides?.valueSize }}>
              {displayValueText}
            </Text>
          </View>
        ) : null}
      </View>
      {description !== undefined ? (
        <View testID="Slider.description">
          <Text size="sm" tone="muted" overrides={helperTypography}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={{ justifyContent: 'center', paddingVertical: trackPaddingBlock }} onLayout={handleTrackLayout}>
        <View testID="Slider.track" style={{ height: trackHeight, borderRadius: trackRadius, backgroundColor: trackColor, overflow: 'hidden' }}>
          <View
            testID="Slider.fill"
            style={{
              position: 'absolute',
              left: range ? `${percentOf(rangeLow, min, max) * 100}%` : 0,
              width: `${(range ? percentOf(rangeHigh, min, max) - percentOf(rangeLow, min, max) : percentOf(singleValue, min, max)) * 100}%`,
              height: trackHeight,
              borderRadius: trackRadius,
              backgroundColor: controlSelected,
            }}
          />
        </View>
        {markList.length > 0 ? (
          <View
            testID="Slider.tickMarks"
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={StyleSheet.absoluteFill}
          >
            {markList.map((mark) => (
              <View
                key={mark.value}
                style={{
                  position: 'absolute',
                  left: `${percentOf(mark.value, min, max) * 100}%`,
                  top: '50%',
                  width: markSize,
                  height: markSize,
                  marginLeft: -(markSize / 2),
                  marginTop: -(markSize / 2),
                  borderRadius: markSize / 2,
                  backgroundColor: markColor,
                }}
              />
            ))}
          </View>
        ) : null}
        {range ? (
          <>
            <SliderThumb
              {...thumbShared}
              ref={firstThumbRef}
              kind="min"
              value={rangeLow}
              min={min}
              max={rangeHigh}
              accessibilityLabel={COPY.minimumLabel(label)}
            />
            <SliderThumb
              {...thumbShared}
              kind="max"
              value={rangeHigh}
              min={rangeLow}
              max={max}
              accessibilityLabel={COPY.maximumLabel(label)}
            />
          </>
        ) : (
          <SliderThumb {...thumbShared} ref={firstThumbRef} kind="single" value={singleValue} min={min} max={max} accessibilityLabel={label} />
        )}
      </View>
      {markLabels.length > 0 ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ minHeight: toLineHeight(markLabelSize, t.fontLineHeightNormal) }}
        >
          {markLabels.map((mark) => (
            <View
              key={mark.value}
              style={{ position: 'absolute', left: `${percentOf(mark.value, min, max) * 100}%`, transform: [{ translateX: '-50%' }] }}
            >
              <Text size="xs" tone="muted" overrides={{ ...typography, fontSize: overrides?.markLabelSize }}>
                {mark.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {displayedError !== undefined ? (
        <View testID="Slider.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          {errorColor === undefined ? (
            errorMessage
          ) : (
            <TextForegroundContext.Provider value={errorColor}>{errorMessage}</TextForegroundContext.Provider>
          )}
        </View>
      ) : null}
    </View>
  );
}
