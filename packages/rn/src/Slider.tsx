import * as React from 'react';
import { AccessibilityInfo, Animated, I18nManager, PanResponder, Platform, View, findNodeHandle } from 'react-native';
import type { AccessibilityActionEvent, GestureResponderEvent, LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFieldsetContext } from './Fieldset';
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
  | 'haloSpread'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'markLabelGap'
  | 'valueSize'
  | 'bubblePaddingBlock'
  | 'bubblePaddingInline'
  | 'bubbleOffset'
  | 'bubbleRadius'
  | 'labelWeight'
  | 'partGap'
  | 'labelGap'
  | 'trackPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'helperSize'
  | 'errorText'
  | 'disabledOpacity'
  | 'transition';

export interface SliderProps {
  /** Visible label naming the quantity ("Volume", "Price range"). A range's thumbs are named from `copy.minimumLabel`/`copy.maximumLabel`. */
  label: string;
  /** Field name for the Form: a single value registers as its decimal string, a range as two strings. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the adjustable actions and snapping granularity for drag and press. */
  step?: number | undefined;
  /** With `marks`, snap drag and press to the marks instead of `step` (increment/decrement still move by step; the page actions go to the next mark, and past the last mark to `max`/`min`). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default (`defaultValue`, else `min` or `[min, max]`) to submit (`copy.required`). */
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
  /** Where the value text appears: always beside the label, only while pressed or focused (as a bubble above the thumb), or not at all. */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. Values snap to marks only with `snapToMarks`. */
  marks?: SliderMark[] | undefined;
  /** Not adjustable, still readable: thumbs stay accessible, but gestures and actions are ignored and no value is submitted. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or through an accessibility action (number or pair); only when the value actually changed. */
  onValueChange?: ((value: SliderValue) => void) | undefined;
  /** Fired once when the interaction ends (release, or an accessibility action), and only if that interaction changed the value. */
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
  pageUpAction: 'Increase by a page',
  pageDownAction: 'Decrease by a page',
  homeAction: 'Set to minimum',
  endAction: 'Set to maximum',
} as const;

/**
 * `increment`/`decrement` are the standard adjustable actions (VoiceOver swipe, TalkBack
 * volume keys) and take no label. PageUp/PageDown/Home/End have no native gesture, so they
 * are custom actions in the platform's Actions menu, labelled from copy.
 */
const THUMB_ACTIONS = [
  { name: 'increment' },
  { name: 'decrement' },
  { name: 'pageUp', label: COPY.pageUpAction },
  { name: 'pageDown', label: COPY.pageDownAction },
  { name: 'home', label: COPY.homeAction },
  { name: 'end', label: COPY.endAction },
] as const;

/** PageUp/PageDown move by ten steps. */
const PAGE_STEPS = 10;

type ThumbKind = 'single' | 'min' | 'max';

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
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];
  }
  return a === b;
}

/** Removes floating-point drift from step arithmetic (0.1 + 0.2) so values stay on the step grid. */
function tidy(value: number): number {
  return Math.round(value * 1e9) / 1e9; // literal-ok: float rounding precision, not a size
}

/** Snaps a pointer position: to the nearest mark with `snapToMarks`, otherwise to the step grid. */
function snapValue(raw: number, min: number, max: number, step: number, snapMarks: readonly SliderMark[] | undefined): number {
  const clamped = clamp(raw, min, max);
  if (snapMarks !== undefined && snapMarks.length > 0) {
    let nearest = snapMarks[0]!.value;
    for (const mark of snapMarks) {
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

/** Ten steps in `direction`; with `snapToMarks`, the next mark, and past the last mark the bound. */
function pagedValue(current: number, direction: 1 | -1, min: number, max: number, step: number, snapMarks: readonly SliderMark[] | undefined): number {
  if (snapMarks !== undefined && snapMarks.length > 0) {
    const sorted = snapMarks.map((mark) => mark.value).sort((a, b) => a - b);
    const next = direction > 0 ? sorted.find((v) => v > current) : sorted.reverse().find((v) => v < current);
    return clamp(next ?? (direction > 0 ? max : min), min, max);
  }
  return clamp(tidy(current + direction * step * PAGE_STEPS), min, max);
}

function resolveOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref ? (resolveToken(t, ref) as T) : fallback;
}

interface ThumbStyleTokens {
  thumbSize: number;
  thumbBorderWidth: number;
  thumbColor: string;
  thumbBorderColor: string;
  thumbShadow: Tokens['shadowRaised'];
  haloColor: string;
  haloSpread: number;
  haloOpacity: number;
  minTarget: number;
  focusRing: string;
  focusRingWidth: number;
  bubbleSurface: string;
  bubbleText: string;
  bubbleRadius: number;
  bubblePaddingBlock: number;
  bubblePaddingInline: number;
  bubbleOffset: number;
  motionEasingStandard: readonly number[];
  transitionDuration: number;
}

interface SliderThumbProps {
  kind: ThumbKind;
  value: number;
  /** Position along the track, 0–1, on the slider's own scale. */
  fraction: number;
  /** The live constraint: the other thumb's value bounds this one in a range. */
  min: number;
  max: number;
  disabled: boolean;
  pressed: boolean;
  accessibilityLabel: string;
  formatValue: (value: number) => string;
  showBubble: boolean;
  bubbleTypography: { fontFamily: TokenRef | undefined; fontSize: TokenRef | undefined };
  reducedMotion: boolean;
  onGrant: (kind: ThumbKind) => void;
  onDrag: (dx: number) => void;
  onRelease: () => void;
  onAction: (kind: ThumbKind, action: string) => void;
  styleTokens: ThumbStyleTokens;
  ref?: React.Ref<ViewInstance> | undefined;
}

/** Fades `visible` in and out over the `transition` binding, or snaps when motion is reduced. */
function useFade(visible: boolean, reducedMotion: boolean, duration: number, easing: readonly number[]): Animated.Value {
  const anim = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  const target = React.useRef(visible ? 1 : 0);
  React.useEffect(() => {
    const toValue = visible ? 1 : 0;
    if (toValue === target.current) {
      return;
    }
    target.current = toValue;
    if (reducedMotion) {
      anim.setValue(toValue);
      return;
    }
    Animated.timing(anim, { toValue, duration, easing: toEasing(easing), useNativeDriver: false }).start();
  }, [visible, reducedMotion, anim, duration, easing]);
  return anim;
}

/**
 * One thumb: a `View` (not `Pressable`) carrying a `PanResponder`'s handlers directly, since
 * spreading `panHandlers` onto `Pressable` fights its own responder. The adjustable role and
 * accessibility actions are the non-gesture path; the drag is additive. A `latest` ref keeps
 * the responder's closures current without recreating the `PanResponder` mid-gesture.
 */
function SliderThumb({
  kind,
  value,
  fraction,
  min,
  max,
  disabled,
  pressed,
  accessibilityLabel,
  formatValue,
  showBubble,
  bubbleTypography,
  reducedMotion,
  onGrant,
  onDrag,
  onRelease,
  onAction,
  styleTokens: st,
  ref,
}: SliderThumbProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);

  const latest = React.useRef({ disabled, onGrant, onDrag, onRelease });
  latest.current = { disabled, onGrant, onDrag, onRelease };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.disabled,
      onMoveShouldSetPanResponder: () => !latest.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => latest.current.onGrant(kind),
      onPanResponderMove: (_evt, gesture) => latest.current.onDrag(gesture.dx),
      onPanResponderRelease: () => latest.current.onRelease(),
      onPanResponderTerminate: () => latest.current.onRelease(),
    }),
  ).current;

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (!latest.current.disabled) {
      onAction(kind, event.nativeEvent.actionName);
    }
  };

  // Halo and bubble appearance follow the `transition` binding; the thumb itself tracks the finger with no transition.
  const haloAnim = useFade(pressed, reducedMotion, st.transitionDuration, st.motionEasingStandard);
  const bubbleAnim = useFade(showBubble && (pressed || focused), reducedMotion, st.transitionDuration, st.motionEasingStandard);

  const haloSize = st.thumbSize + st.haloSpread * 2;
  // The ring sits outside the knob's border, offset from it by its own width.
  const ringSize = st.thumbSize + (st.focusRingWidth + st.focusRingWidth) * 2;

  // `start`/`marginStart` follow writing direction, so the thumb mirrors in right-to-left.
  const hitStyle: ViewStyle = {
    position: 'absolute',
    start: `${fraction * 100}%`,
    top: '50%',
    width: st.minTarget,
    height: st.minTarget,
    marginTop: -(st.minTarget / 2),
    marginStart: -(st.minTarget / 2),
    alignItems: 'center',
    justifyContent: 'center',
  };

  const haloStyle: Animated.WithAnimatedValue<ViewStyle> = {
    position: 'absolute',
    width: haloSize,
    height: haloSize,
    borderRadius: haloSize / 2,
    backgroundColor: st.haloColor,
    opacity: haloAnim.interpolate({ inputRange: [0, 1], outputRange: [0, st.haloOpacity] }),
  };

  const ringStyle: ViewStyle = {
    position: 'absolute',
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
    borderWidth: st.focusRingWidth,
    borderColor: st.focusRing,
  };

  const knobStyle: ViewStyle = {
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
    bottom: st.minTarget + st.bubbleOffset,
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
            <Text size="sm" tone="default" overrides={bubbleTypography}>
              {formatValue(value)}
            </Text>
          </TextForegroundContext.Provider>
        </Animated.View>
      ) : null}
      <Animated.View pointerEvents="none" style={haloStyle} />
      {focused ? <View pointerEvents="none" style={ringStyle} /> : null}
      <View pointerEvents="none" style={knobStyle} />
    </View>
  );
}

/**
 * Slider — a bounded numeric value (or, with `range`, a minimum and a maximum) chosen by
 * feel: the thumb sits on the value, the fill shows how much, and every value the drag
 * reaches is also reachable through the adjustable accessibility actions.
 *
 * When to use: a bounded value where approximate is fine and the scale has meaning across
 * its whole width — volume, brightness, a price range. Use `range` for "between" filters,
 * `marks` for meaningful stops, and pair with a NumberInput (`showValue: never`) when exact
 * entry also matters. Not for exact values, more than about a hundred steps without marks,
 * or two or three discrete choices.
 *
 * Each thumb is its own adjustable element: increment/decrement move by `step`; PageUp,
 * PageDown, Home and End are custom actions labelled from copy. Dragging a thumb, or
 * pressing and dragging anywhere on the track area (which moves the nearest thumb), snaps to
 * `step`, or to the marks with `snapToMarks`. `onValueChange` fires on every change,
 * `onSlidingComplete` once per interaction (release, or each accessibility action), and
 * neither fires when the value did not change. A range's thumbs cannot cross; each thumb's
 * `accessibilityValue` min/max is the live constraint from the other. `disabled` (or a
 * disabled Form or Fieldset) dims the whole slider with `disabledOpacity` and leaves it
 * readable but inert. Inside a Form the field registers once: its value as a decimal
 * string, or a range as two strings; `validate: blur` runs when an interaction ends.
 * Hardware-keyboard keys are not handled on native; the accessibility actions cover them.
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
  const fieldset = useFieldsetContext();
  const reducedMotion = useReducedMotion();
  const rtl = I18nManager.isRTL;

  const snapMarks = snapToMarks && marks !== undefined && marks.length > 0 ? marks : undefined;

  const [internalValue, setInternalValue] = React.useState<SliderValue>(() => defaultValue ?? (range ? [min, max] : min));

  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
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

  // The value as last reported, so a gesture's next move and its end see its changes before a re-render.
  const reportedRef = React.useRef<SliderValue>(normalized);
  reportedRef.current = normalized;

  // "The default" for `required` is `defaultValue` when set, otherwise what `value` falls back to.
  const requiredDefault: SliderValue = defaultValue ?? (range ? [min, max] : min);

  const validateValue = (candidate: SliderValue): string | null => {
    if (error !== undefined && error !== '') {
      return error;
    }
    if (required && isSameSliderValue(candidate, requiredDefault)) {
      return COPY.required(label);
    }
    if (invalid) {
      return COPY.invalid(label);
    }
    return null;
  };

  /** Bounds for a thumb: the scale, narrowed by the other thumb in a range. */
  const boundsFor = (kind: ThumbKind): [number, number] => {
    const base = reportedRef.current;
    if (!Array.isArray(base)) {
      return [min, max];
    }
    return kind === 'min' ? [min, base[1]] : [base[0], max];
  };

  const valueOf = (kind: ThumbKind): number => {
    const base = reportedRef.current;
    return Array.isArray(base) ? (kind === 'max' ? base[1] : base[0]) : base;
  };

  const report = (kind: ThumbKind, next: number): void => {
    const base = reportedRef.current;
    const [lo, hi] = boundsFor(kind);
    const bounded = clamp(next, lo, hi);
    const nextValue: SliderValue = Array.isArray(base) ? (kind === 'min' ? [bounded, base[1]] : [base[0], bounded]) : bounded;
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

  /** Ends an interaction that began at `start`: reports it only if it changed the value. */
  const complete = (start: SliderValue): void => {
    const final = reportedRef.current;
    if (isSameSliderValue(start, final)) {
      return;
    }
    onSlidingComplete?.(final);
    // A pointer-driven control has no meaningful blur: `validate: blur` runs when an interaction ends.
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(final));
    }
  };

  // Gesture state shared by the thumbs' and the track area's responders.
  const [activeKind, setActiveKind] = React.useState<ThumbKind | null>(null);
  const gesture = React.useRef<{ kind: ThumbKind; origin: number; start: SliderValue } | null>(null);
  const trackWidthRef = React.useRef(0);

  const rawFromDx = (origin: number, dx: number): number => {
    const width = trackWidthRef.current;
    return width <= 0 ? origin : origin + ((rtl ? -dx : dx) / width) * (max - min);
  };

  const beginGesture = (kind: ThumbKind, origin: number): void => {
    gesture.current = { kind, origin, start: reportedRef.current };
    setActiveKind(kind);
  };

  const dragGesture = (dx: number): void => {
    const g = gesture.current;
    if (g !== null) {
      report(g.kind, snapValue(rawFromDx(g.origin, dx), min, max, step, snapMarks));
    }
  };

  const endGesture = (): void => {
    const g = gesture.current;
    gesture.current = null;
    setActiveKind(null);
    if (g !== null) {
      complete(g.start);
    }
  };

  const handleAction = (kind: ThumbKind, action: string): void => {
    const current = valueOf(kind);
    const [lo, hi] = boundsFor(kind);
    let next: number;
    switch (action) {
      case 'increment':
        next = tidy(current + step);
        break;
      case 'decrement':
        next = tidy(current - step);
        break;
      case 'pageUp':
        next = pagedValue(current, 1, min, max, step, snapMarks);
        break;
      case 'pageDown':
        next = pagedValue(current, -1, min, max, step, snapMarks);
        break;
      case 'home':
        next = lo;
        break;
      case 'end':
        next = hi;
        break;
      default:
        return;
    }
    // Each action is a complete interaction.
    const start = reportedRef.current;
    report(kind, next);
    complete(start);
  };

  /** The thumb a track press at `raw` moves: in a range, the nearer one (ties go to the low thumb). */
  const nearestKind = (raw: number): ThumbKind => {
    const base = reportedRef.current;
    if (!Array.isArray(base)) {
      return 'single';
    }
    const [low, high] = base;
    if (raw <= low) {
      return 'min';
    }
    if (raw >= high) {
      return 'max';
    }
    return raw - low <= high - raw ? 'min' : 'max';
  };

  const latest = React.useRef({ isDisabled, rtl, min, max, nearestKind, beginGesture, dragGesture, endGesture });
  latest.current = { isDisabled, rtl, min, max, nearestKind, beginGesture, dragGesture, endGesture };

  // A press on the track area (outside a thumb) moves the nearest thumb there and keeps dragging it.
  // The rail and marks ignore touches, so `locationX` is always relative to the track area.
  const trackResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.isDisabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const width = trackWidthRef.current;
        if (width <= 0) {
          return;
        }
        const cur = latest.current;
        const x = cur.rtl ? width - evt.nativeEvent.locationX : evt.nativeEvent.locationX;
        const raw = cur.min + (x / width) * (cur.max - cur.min);
        cur.beginGesture(cur.nearestKind(raw), raw);
        cur.dragGesture(0);
      },
      onPanResponderMove: (_evt, g) => latest.current.dragGesture(g.dx),
      onPanResponderRelease: () => latest.current.endGesture(),
      onPanResponderTerminate: () => latest.current.endGesture(),
    }),
  ).current;

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
        const nodeHandle = node === null ? null : findNodeHandle(node);
        if (nodeHandle != null) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
      },
    }),
    [],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    // A disabled slider submits no value.
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  const formError = form?.errors[name];
  // The error region shows `error`, else the message the Form reported, else `copy.invalid` when `invalid`.
  const displayedError =
    error !== undefined && error !== '' ? error : formError !== undefined ? formError : invalid ? COPY.invalid(label) : undefined;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const trackColor = resolveOr(t, overrides?.track, t.colorBackgroundStrong);
  const trackHeight = resolveOr(t, overrides?.trackHeight, t.space1);
  const trackRadius = resolveOr(t, overrides?.trackRadius, t.radiusFull);
  const markColor = resolveOr(t, overrides?.mark, t.colorBorderStrong);
  const markSize = resolveOr(t, overrides?.markSize, t.space1);
  const markLabelSize = resolveOr(t, overrides?.markLabelSize, t.fontSizeXs);
  const markLabelGap = resolveOr(t, overrides?.markLabelGap, t.space1);
  const partGap = resolveOr(t, overrides?.partGap, t.space1);
  const labelGap = resolveOr(t, overrides?.labelGap, t.space2);
  const trackPaddingBlock = resolveOr(t, overrides?.trackPaddingBlock, t.space3);
  const disabledOpacity = resolveOr(t, overrides?.disabledOpacity, t.opacityDisabled);
  // `fill` and `thumbBorder` share the locked selected-control token.
  const controlSelected = t.colorControlSelectedBackground;

  const thumbStyleTokens: ThumbStyleTokens = {
    thumbSize: resolveOr(t, overrides?.thumbSize, t.space5),
    thumbBorderWidth: t.borderWidthFocus,
    thumbColor: resolveOr(t, overrides?.thumb, t.colorControlBackground),
    thumbBorderColor: controlSelected,
    thumbShadow: resolveOr(t, overrides?.thumbShadow, t.shadowRaised),
    haloColor: controlSelected,
    haloSpread: resolveOr(t, overrides?.haloSpread, t.space2),
    haloOpacity: resolveOr(t, overrides?.thumbActiveScale, t.opacityDisabled),
    minTarget: t.sizeTargetComfortable,
    focusRing: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    bubbleSurface: t.colorInverseSurface,
    bubbleText: t.colorInverseForeground,
    bubbleRadius: resolveOr(t, overrides?.bubbleRadius, t.radiusSm),
    bubblePaddingBlock: resolveOr(t, overrides?.bubblePaddingBlock, t.space1),
    bubblePaddingInline: resolveOr(t, overrides?.bubblePaddingInline, t.space2),
    bubbleOffset: resolveOr(t, overrides?.bubbleOffset, t.space1),
    motionEasingStandard: t.motionEasingStandard,
    transitionDuration: resolveOr(t, overrides?.transition, t.motionDurationFast),
  };

  const displayValueText = range ? COPY.rangeText(formatValue(rangeLow), formatValue(rangeHigh)) : formatValue(singleValue);

  const markList = marks ?? [];
  const markLabels = markList.filter((mark) => mark.label !== undefined);

  const fontFamily = overrides?.fontFamily;
  const helperTypography = { fontFamily, fontSize: overrides?.helperSize };
  const valueTypography = { fontFamily, fontSize: overrides?.valueSize };

  const thumbShared = {
    disabled: isDisabled,
    formatValue,
    showBubble: showValue === 'hover',
    bubbleTypography: valueTypography,
    reducedMotion,
    onGrant: (kind: ThumbKind) => beginGesture(kind, valueOf(kind)),
    onDrag: dragGesture,
    onRelease: endGesture,
    onAction: handleAction,
    styleTokens: thumbStyleTokens,
  };

  const lowFraction = percentOf(rangeLow, min, max);
  const highFraction = percentOf(rangeHigh, min, max);
  const singleFraction = percentOf(singleValue, min, max);

  return (
    <View ref={ref} testID="Slider" style={{ flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: labelGap }}>
        <View testID="Slider.label">
          <Text size="md" weight="medium" tone="default" overrides={{ fontFamily, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight }}>
            {label}
          </Text>
        </View>
        {showValue === 'always' ? (
          <View testID="Slider.valueText" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Text size="sm" tone="default" overrides={valueTypography}>
              {displayValueText}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'column', gap: markLabelGap }}>
        <View style={{ justifyContent: 'center', paddingVertical: trackPaddingBlock }} onLayout={handleTrackLayout} {...trackResponder.panHandlers}>
          <View
            testID="Slider.track"
            pointerEvents="none"
            style={{ height: trackHeight, borderRadius: trackRadius, backgroundColor: trackColor, overflow: 'hidden' }}
          >
            <View
              testID="Slider.fill"
              style={{
                position: 'absolute',
                start: range ? `${lowFraction * 100}%` : 0,
                width: `${(range ? highFraction - lowFraction : singleFraction) * 100}%`,
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
              style={{ position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 }}
            >
              {markList.map((mark) => (
                <View
                  key={mark.value}
                  style={{
                    position: 'absolute',
                    start: `${percentOf(mark.value, min, max) * 100}%`,
                    top: '50%',
                    width: markSize,
                    height: markSize,
                    marginStart: -(markSize / 2),
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
                fraction={lowFraction}
                min={min}
                max={rangeHigh}
                pressed={activeKind === 'min'}
                accessibilityLabel={COPY.minimumLabel(label)}
              />
              <SliderThumb
                {...thumbShared}
                kind="max"
                value={rangeHigh}
                fraction={highFraction}
                min={rangeLow}
                max={max}
                pressed={activeKind === 'max'}
                accessibilityLabel={COPY.maximumLabel(label)}
              />
            </>
          ) : (
            <SliderThumb
              {...thumbShared}
              ref={firstThumbRef}
              kind="single"
              value={singleValue}
              fraction={singleFraction}
              min={min}
              max={max}
              pressed={activeKind === 'single'}
              accessibilityLabel={label}
            />
          )}
        </View>
        {/* The slider grows by the label line only when some mark has a label. */}
        {markLabels.length > 0 ? (
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ height: toLineHeight(markLabelSize, t.fontLineHeightNormal) }}
          >
            {markLabels.map((mark) => (
              <View
                key={mark.value}
                style={{
                  position: 'absolute',
                  start: `${percentOf(mark.value, min, max) * 100}%`,
                  transform: [{ translateX: rtl ? '50%' : '-50%' }],
                }}
              >
                <Text size="xs" tone="muted" overrides={{ fontFamily, fontSize: overrides?.markLabelSize }}>
                  {mark.label}
                </Text>
              </View>
            ))}
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
      {displayedError !== undefined ? (
        <View testID="Slider.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperTypography}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
