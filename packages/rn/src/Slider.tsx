import * as React from 'react';
import { AccessibilityInfo, Animated, PanResponder, Platform, View, findNodeHandle } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
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
  | 'thumbBorderWidth'
  | 'thumbSize'
  | 'thumbShadow'
  | 'thumbActiveScale'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'valueSize'
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
  /** Visible label naming the quantity ("Volume", "Price range"). Named by each thumb via `copy.minimumLabel`/`copy.maximumLabel` in a range. */
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
  /** Where the value text appears: always beside the label, only while dragging (as a bubble above the thumb), or not at all. */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. */
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
}

const COPY = {
  minimumLabel: (label: string): string => `${label} minimum`,
  maximumLabel: (label: string): string => `${label} maximum`,
  rangeText: (low: string, high: string): string => `${low} – ${high}`,
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} is not valid.`,
} as const;

const THUMB_ACTIONS = [
  { name: 'increment', label: 'Increment' },
  { name: 'decrement', label: 'Decrement' },
  { name: 'home', label: 'Set to minimum' },
  { name: 'end', label: 'Set to maximum' },
  { name: 'pageup', label: 'Increase by ten steps' },
  { name: 'pagedown', label: 'Decrease by ten steps' },
] as const;

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

/** Snaps a drag/click position: to the nearest mark when `snapToMarks` is set, otherwise to the step grid. */
function snapValue(
  raw: number,
  min: number,
  max: number,
  step: number,
  snapToMarks: boolean,
  marks: readonly SliderMark[] | undefined,
): number {
  const clamped = clamp(raw, min, max);
  if (snapToMarks && marks !== undefined && marks.length > 0) {
    let nearest = marks[0]!.value;
    let nearestDistance = Math.abs(clamped - nearest);
    for (const mark of marks) {
      const distance = Math.abs(clamped - mark.value);
      if (distance < nearestDistance) {
        nearest = mark.value;
        nearestDistance = distance;
      }
    }
    return clamp(nearest, min, max);
  }
  if (step <= 0) {
    return clamped;
  }
  return clamp(min + Math.round((clamped - min) / step) * step, min, max);
}

/** One `step` in `direction` — keys (and the increment/decrement accessibility actions) always move by `step`, even when `snapToMarks` is set. */
function steppedValue(current: number, direction: 1 | -1, min: number, max: number, step: number): number {
  return clamp(current + direction * step, min, max);
}

/** Ten steps in `direction` (PageUp/PageDown), or to the next/previous mark when `snapToMarks` is set. */
function pagedValue(
  current: number,
  direction: 1 | -1,
  min: number,
  max: number,
  step: number,
  snapToMarks: boolean,
  marks: readonly SliderMark[] | undefined,
): number {
  if (snapToMarks && marks !== undefined && marks.length > 0) {
    const sorted = marks.map((mark) => mark.value).sort((a, b) => a - b);
    const candidates = direction > 0 ? sorted.filter((v) => v > current) : sorted.filter((v) => v < current).reverse();
    return clamp(candidates[0] ?? current, min, max);
  }
  return clamp(current + direction * step * 10, min, max);
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
  bubbleSurface: string;
  motionEasingStandard: readonly number[];
  transitionDuration: number;
}

interface SliderThumbProps {
  kind: ThumbKind;
  value: number;
  min: number;
  max: number;
  step: number;
  snapToMarks: boolean;
  marks: readonly SliderMark[] | undefined;
  disabled: boolean;
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  showBubble: boolean;
  reducedMotion: boolean;
  trackWidthRef: React.MutableRefObject<number>;
  onDrag: (kind: ThumbKind, next: number) => void;
  onDragEnd: () => void;
  styleTokens: ThumbStyleTokens;
}

/**
 * One thumb: a `View` (not `Pressable`) carrying a `PanResponder`'s handlers directly,
 * since spreading `PanResponder.panHandlers` onto `Pressable` fights that component's
 * own gesture responder. `accessible`/`focusable` plus `accessibilityRole="adjustable"`,
 * `accessibilityValue` and the `accessibilityActions` are the non-gesture path:
 * `increment`/`decrement` reach the native swipe-up/down (VoiceOver) and volume-key
 * (TalkBack) gestures directly, while `home`/`end`/`pageup`/`pagedown` — standing in
 * for the keyboard's Home/End/PageUp/PageDown — surface in the platform's custom
 * actions menu (VoiceOver rotor "Actions", TalkBack local context menu). The drag
 * gesture is additive. A `latest` ref keeps the responder's closures current across
 * re-renders without recreating the `PanResponder` (which must stay stable for a
 * gesture in progress).
 */
const SliderThumb = React.forwardRef<ViewInstance, SliderThumbProps>(function SliderThumb(
  {
    kind,
    value,
    min,
    max,
    step,
    snapToMarks,
    marks,
    disabled,
    accessibilityLabel,
    formatValue,
    showBubble,
    reducedMotion,
    trackWidthRef,
    onDrag,
    onDragEnd,
    styleTokens: st,
  },
  ref,
) {
  const [dragging, setDragging] = React.useState(false);
  const dragStartValue = React.useRef(value);

  const latest = React.useRef({ value, min, max, step, snapToMarks, marks, disabled, onDrag, onDragEnd });
  latest.current = { value, min, max, step, snapToMarks, marks, disabled, onDrag, onDragEnd };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: (_evt, gesture) => !latest.current.disabled && Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => {
        dragStartValue.current = latest.current.value;
        setDragging(true);
      },
      onPanResponderMove: (_evt, gesture) => {
        const width = trackWidthRef.current;
        if (width <= 0) {
          return;
        }
        const { min: curMin, max: curMax, step: curStep, snapToMarks: curSnapToMarks, marks: curMarks } = latest.current;
        const raw = dragStartValue.current + (gesture.dx / width) * (curMax - curMin);
        latest.current.onDrag(kind, snapValue(raw, curMin, curMax, curStep, curSnapToMarks, curMarks));
      },
      onPanResponderRelease: () => {
        setDragging(false);
        latest.current.onDragEnd();
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        latest.current.onDragEnd();
      },
    }),
  ).current;

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    const { disabled: curDisabled, value: curValue, min: curMin, max: curMax, step: curStep, snapToMarks: curSnapToMarks, marks: curMarks } =
      latest.current;
    if (curDisabled) {
      return;
    }
    let next: number;
    switch (event.nativeEvent.actionName) {
      case 'increment':
        next = steppedValue(curValue, 1, curMin, curMax, curStep);
        break;
      case 'decrement':
        next = steppedValue(curValue, -1, curMin, curMax, curStep);
        break;
      case 'pageup':
        next = pagedValue(curValue, 1, curMin, curMax, curStep, curSnapToMarks, curMarks);
        break;
      case 'pagedown':
        next = pagedValue(curValue, -1, curMin, curMax, curStep, curSnapToMarks, curMarks);
        break;
      case 'home':
        next = curMin;
        break;
      case 'end':
        next = curMax;
        break;
      default:
        return;
    }
    latest.current.onDrag(kind, next);
    latest.current.onDragEnd();
  };

  const activeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const toValue = dragging ? 1 : 0;
    if (reducedMotion) {
      activeAnim.setValue(toValue);
      return;
    }
    Animated.timing(activeAnim, {
      toValue,
      duration: st.transitionDuration,
      easing: toEasing(st.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [dragging, reducedMotion, activeAnim, st.transitionDuration, st.motionEasingStandard]);

  const percent = percentOf(value, min, max);
  // The halo extends `haloInset` past the thumb on every side, per the schema.
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
  };

  const haloStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    width: haloSize,
    height: haloSize,
    borderRadius: haloSize / 2,
    backgroundColor: st.fillColor,
    opacity: activeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, st.haloOpacity] }),
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

  const bubbleStyle: ViewStyle = {
    position: 'absolute',
    bottom: st.minTarget,
    paddingVertical: st.haloInset / 2,
    paddingHorizontal: st.haloInset,
    borderRadius: st.haloInset,
    backgroundColor: st.bubbleSurface,
  };

  return (
    <View
      ref={ref}
      testID="Slider.thumb"
      accessible
      focusable={!disabled}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
      accessibilityState={{ disabled }}
      accessibilityActions={THUMB_ACTIONS}
      onAccessibilityAction={handleAccessibilityAction}
      {...panResponder.panHandlers}
      style={hitStyle}
    >
      {showBubble && dragging ? (
        <View pointerEvents="none" style={bubbleStyle}>
          <Text size="sm" overrides={{ color: 'color.inverse.foreground' }}>
            {formatValue(value)}
          </Text>
        </View>
      ) : null}
      <Animated.View pointerEvents="none" style={haloStyle} />
      <View pointerEvents="none" style={thumbStyle} />
    </View>
  );
});

/**
 * Slider — lets people choose a bounded numeric value (or, with `range`, a minimum
 * and a maximum) by feel: the thumb sits on the value, the fill shows how much, and
 * every value the pointer can reach is also reachable by keys and accessibility
 * actions.
 *
 * When to use: Use a Slider for a bounded numeric value where approximate is fine
 * and the scale has meaning across its whole width — volume, brightness, a price
 * range. Use `range` for "between" filters. Add `marks` when a few values are
 * meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry
 * also matters. Do not use it for a value that must be exact, for more than about a
 * hundred steps without marks, or for two or three discrete choices
 * (SegmentedControl).
 *
 * Renders a label row, optional helper text, a track with a fill sized from the
 * value(s), optional tick marks, and one `SliderThumb` (two for `range`, each its
 * own tab stop via `accessibilityActions`). Dragging a thumb sets the value from
 * the pointer's horizontal offset, snapped to `step` or, with `snapToMarks`, to the
 * nearest mark (keys and the increment/decrement accessibility actions always move
 * by `step`); `onValueChange` fires on every change, `onSlidingComplete` once per
 * interaction (drag release or an accessibility action). A range's thumbs
 * cannot cross: each drag clamps against the other thumb's current value. The value
 * text shows beside the label (`showValue: always`), as a bubble above the active
 * thumb while dragging (`hover`), or not at all (`never`) — the accessible value
 * (`formatValue`-formatted) is always exposed regardless. `required` fails
 * validation while the value still equals its initial default; `invalid` fails it
 * unconditionally; `error` overrides both. `disabled` dims the whole control with
 * `disabledOpacity` and blocks both the gesture and the accessibility actions while
 * staying focusable and readable. Inside a Form the field registers as a single
 * entry: a single value as its string, a range as the `[min, max]` pair of strings
 * (`FormFieldValue` has no numeric variant).
 */
export function Slider({
  label,
  name,
  min = 0,
  max = 100,
  step = 1,
  snapToMarks = false,
  required = false,
  invalid = false,
  value,
  defaultValue,
  range = false,
  formatValue = (v) => String(v),
  showValue = 'always',
  marks,
  disabled = false,
  description,
  error,
  overrides,
  onValueChange,
  onSlidingComplete,
}: SliderProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();

  const initialValue = React.useRef<SliderValue>(defaultValue ?? (range ? [min, max] : min)).current;
  const [internalValue, setInternalValue] = React.useState<SliderValue>(initialValue);

  const isDisabled = disabled || (form?.disabled ?? false);
  const currentValue = value ?? internalValue;

  const validRange = max > min;
  React.useEffect(() => {
    if (__DEV__ && !validRange) {
      console.warn(`Slider: max (${max}) must be greater than min (${min}).`);
    }
  }, [validRange, min, max]);

  const singleValue = !range && typeof currentValue === 'number' ? clamp(currentValue, min, max) : min;
  const [rangeMinRaw, rangeMaxRaw] = range && Array.isArray(currentValue) ? currentValue : [min, max];
  const rangeMin = clamp(Math.min(rangeMinRaw, rangeMaxRaw), min, max);
  const rangeMax = clamp(Math.max(rangeMinRaw, rangeMaxRaw), min, max);

  const validateValue = React.useCallback(
    (candidate: SliderValue): string | null => {
      // Precedence: `error` prop, then `required`, then `invalid`.
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && isSameSliderValue(candidate, initialValue)) {
        return COPY.required(label);
      }
      if (invalid) {
        return COPY.invalid(label);
      }
      return null;
    },
    [required, label, error, invalid, initialValue],
  );

  const commit = (next: SliderValue, end: boolean): void => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
    if (end) {
      onSlidingComplete?.(next);
    }
    if (form !== null && (form.validateMode === 'change' || (form.validateMode === 'blur' && end))) {
      form.reportValidity(name, validateValue(next));
    }
  };

  const handleDrag = (kind: ThumbKind, nextValue: number): void => {
    if (range) {
      if (kind === 'min') {
        commit([Math.min(nextValue, rangeMax), rangeMax], false);
      } else if (kind === 'max') {
        commit([rangeMin, Math.max(nextValue, rangeMin)], false);
      }
    } else {
      commit(nextValue, false);
    }
  };

  const handleDragEnd = (): void => {
    commit(range ? [rangeMin, rangeMax] : singleValue, true);
  };

  const trackWidthRef = React.useRef(0);
  const handleTrackLayout = (event: LayoutChangeEvent): void => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  };

  const minThumbRef = React.useRef<ViewInstance>(null);
  const maxThumbRef = React.useRef<ViewInstance>(null);
  const singleThumbRef = React.useRef<ViewInstance>(null);

  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const summarised = form !== null && form.errorSummary;

  const latestForm = React.useRef({ singleValue, rangeMin, rangeMax, displayedError, validateValue });
  latestForm.current = { singleValue, rangeMin, rangeMax, displayedError, validateValue };

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () =>
        range ? [String(latestForm.current.rangeMin), String(latestForm.current.rangeMax)] : String(latestForm.current.singleValue),
      validate: () => {
        const current: SliderValue = range
          ? [latestForm.current.rangeMin, latestForm.current.rangeMax]
          : latestForm.current.singleValue;
        return latestForm.current.validateValue(current);
      },
      focus: () => {
        const node = range ? minThumbRef.current : singleThumbRef.current;
        const handleNode = node === null ? null : findNodeHandle(node);
        if (handleNode != null) {
          AccessibilityInfo.setAccessibilityFocus(handleNode);
        }
      },
    }),
    [range],
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

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const trackColor = overrides?.track ? (resolveToken(t, overrides.track) as string) : t.colorBackgroundStrong;
  const trackHeight = overrides?.trackHeight ? (resolveToken(t, overrides.trackHeight) as number) : t.space1;
  const trackRadius = overrides?.trackRadius ? (resolveToken(t, overrides.trackRadius) as number) : t.radiusFull;
  const thumbColor = overrides?.thumb ? (resolveToken(t, overrides.thumb) as string) : t.colorControlBackground;
  const thumbBorderWidth = overrides?.thumbBorderWidth ? (resolveToken(t, overrides.thumbBorderWidth) as number) : t.borderWidthFocus;
  const thumbSize = overrides?.thumbSize ? (resolveToken(t, overrides.thumbSize) as number) : t.space5;
  const thumbShadow = overrides?.thumbShadow ? (resolveToken(t, overrides.thumbShadow) as Tokens['shadowRaised']) : t.shadowRaised;
  const thumbActiveScale = overrides?.thumbActiveScale ? (resolveToken(t, overrides.thumbActiveScale) as number) : t.opacityDisabled;
  const markColor = overrides?.mark ? (resolveToken(t, overrides.mark) as string) : t.colorBorderStrong;
  const markSize = overrides?.markSize ? (resolveToken(t, overrides.markSize) as number) : t.space1;
  const markLabelSize = overrides?.markLabelSize ? (resolveToken(t, overrides.markLabelSize) as number) : t.fontSizeXs;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const trackPaddingBlock = overrides?.trackPaddingBlock ? (resolveToken(t, overrides.trackPaddingBlock) as number) : t.space3;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  // `fill` and `thumbBorder` are the same locked token: the thumb's ring matches the fill it sits at the edge of.
  const controlSelected = t.colorControlSelectedBackground;

  const thumbStyleTokens: ThumbStyleTokens = {
    thumbSize,
    thumbBorderWidth,
    thumbColor,
    thumbBorderColor: controlSelected,
    thumbShadow,
    fillColor: controlSelected,
    haloInset: t.space2,
    haloOpacity: thumbActiveScale,
    minTarget: t.sizeTargetComfortable,
    bubbleSurface: t.colorInverseSurface,
    motionEasingStandard: t.motionEasingStandard,
    transitionDuration,
  };

  const displayValueText = range ? COPY.rangeText(formatValue(rangeMin), formatValue(rangeMax)) : formatValue(singleValue);

  const markList = marks ?? [];
  const markLabels = markList.filter((mark) => mark.label !== undefined);

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const labelRowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: t.space2,
  };

  const trackRowStyle: ViewStyle = {
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: trackPaddingBlock,
  };

  const trackStyle: ViewStyle = {
    height: trackHeight,
    borderRadius: trackRadius,
    backgroundColor: trackColor,
    overflow: 'hidden',
  };

  const fillStyle: ViewStyle = range
    ? {
        position: 'absolute',
        left: `${percentOf(rangeMin, min, max) * 100}%`,
        right: `${(1 - percentOf(rangeMax, min, max)) * 100}%`,
        height: trackHeight,
        borderRadius: trackRadius,
        backgroundColor: controlSelected,
      }
    : {
        position: 'absolute',
        left: 0,
        width: `${percentOf(singleValue, min, max) * 100}%`,
        height: trackHeight,
        borderRadius: trackRadius,
        backgroundColor: controlSelected,
      };

  const markDotStyle = (markValue: number): ViewStyle => ({
    position: 'absolute',
    left: `${percentOf(markValue, min, max) * 100}%`,
    top: '50%',
    width: markSize,
    height: markSize,
    marginLeft: -(markSize / 2),
    marginTop: -(markSize / 2),
    borderRadius: markSize / 2,
    backgroundColor: markColor,
  });

  const markLabelRowStyle: ViewStyle = {
    position: 'relative',
    minHeight: toLineHeight(markLabelSize, t.fontLineHeightNormal),
  };

  const markLabelStyle = (markValue: number): ViewStyle => ({
    position: 'absolute',
    left: `${percentOf(markValue, min, max) * 100}%`,
    transform: [{ translateX: '-50%' }],
  });

  const typographyOverrides = { fontFamily: overrides?.fontFamily };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View testID="Slider" style={containerStyle}>
      <View style={labelRowStyle}>
        <Text weight="medium" overrides={{ ...typographyOverrides, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight }}>
          {label}
        </Text>
        {showValue === 'always' ? (
          <View testID="Slider.valueText">
            <Text size="sm" overrides={{ ...typographyOverrides, fontSize: overrides?.valueSize }}>
              {displayValueText}
            </Text>
          </View>
        ) : null}
      </View>
      {description !== undefined ? (
        <View testID="Slider.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={trackRowStyle} onLayout={handleTrackLayout}>
        <View testID="Slider.track" style={trackStyle}>
          <View testID="Slider.fill" style={fillStyle} />
        </View>
        {markList.map((mark) => (
          <View key={mark.value} testID="Slider.tickMarks" pointerEvents="none" style={markDotStyle(mark.value)} />
        ))}
        {range ? (
          <>
            <SliderThumb
              ref={minThumbRef}
              kind="min"
              value={rangeMin}
              min={min}
              max={max}
              step={step}
              snapToMarks={snapToMarks}
              marks={marks}
              disabled={isDisabled}
              accessibilityLabel={COPY.minimumLabel(label)}
              formatValue={formatValue}
              showBubble={showValue === 'hover'}
              reducedMotion={reducedMotion}
              trackWidthRef={trackWidthRef}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              styleTokens={thumbStyleTokens}
            />
            <SliderThumb
              ref={maxThumbRef}
              kind="max"
              value={rangeMax}
              min={min}
              max={max}
              step={step}
              snapToMarks={snapToMarks}
              marks={marks}
              disabled={isDisabled}
              accessibilityLabel={COPY.maximumLabel(label)}
              formatValue={formatValue}
              showBubble={showValue === 'hover'}
              reducedMotion={reducedMotion}
              trackWidthRef={trackWidthRef}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              styleTokens={thumbStyleTokens}
            />
          </>
        ) : (
          <SliderThumb
            ref={singleThumbRef}
            kind="single"
            value={singleValue}
            min={min}
            max={max}
            step={step}
            snapToMarks={snapToMarks}
            marks={marks}
            disabled={isDisabled}
            accessibilityLabel={label}
            formatValue={formatValue}
            showBubble={showValue === 'hover'}
            reducedMotion={reducedMotion}
            trackWidthRef={trackWidthRef}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            styleTokens={thumbStyleTokens}
          />
        )}
      </View>
      {markLabels.length > 0 ? (
        <View style={markLabelRowStyle}>
          {markLabels.map((mark) => (
            <View key={mark.value} style={markLabelStyle(mark.value)}>
              <Text size="xs" tone="muted" overrides={{ ...typographyOverrides, fontSize: overrides?.markLabelSize }}>
                {mark.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {displayedError !== undefined ? (
        <View testID="Slider.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={{ ...helperOverrides, color: overrides?.errorText }}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
