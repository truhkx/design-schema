import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './Slider.css';

/** Where the value text appears. */
export type SliderShowValue = 'always' | 'hover' | 'never';
/** A single value, or the low and high values of a range. */
export type SliderValue = number | [number, number];
/** One tick mark on the track, optionally labelled. */
export type SliderMark = { value: number; label?: string | undefined };

/** copy.* — used verbatim; `{label}`, `{low}` and `{high}` are the only interpolations. */
const COPY = {
  minimumLabel: '{label} minimum',
  maximumLabel: '{label} maximum',
  rangeText: '{low} – {high}',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  pageUpAction: 'Increase by a page',
  pageDownAction: 'Decrease by a page',
  homeAction: 'Set to minimum',
  endAction: 'Set to maximum',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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
  | 'disabledOpacity'
  | 'transition';

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

/** Hooks the Slider's own CSS reads. Bindings that style a composed Text are forwarded to it instead. */
const ROOT_OVERRIDE_HOOK: Partial<Record<SliderOverridableBinding, string>> = {
  track: '--ds-slider-track',
  trackHeight: '--ds-slider-track-height',
  trackRadius: '--ds-slider-track-radius',
  thumb: '--ds-slider-thumb',
  thumbSize: '--ds-slider-thumb-size',
  thumbShadow: '--ds-slider-thumb-shadow',
  thumbActiveScale: '--ds-slider-thumb-active-scale',
  haloSpread: '--ds-slider-halo-spread',
  mark: '--ds-slider-mark',
  markSize: '--ds-slider-mark-size',
  markLabelGap: '--ds-slider-mark-label-gap',
  bubblePaddingBlock: '--ds-slider-bubble-padding-block',
  bubblePaddingInline: '--ds-slider-bubble-padding-inline',
  bubbleOffset: '--ds-slider-bubble-offset',
  bubbleRadius: '--ds-slider-bubble-radius',
  partGap: '--ds-slider-part-gap',
  labelGap: '--ds-slider-label-gap',
  trackPaddingBlock: '--ds-slider-track-padding-block',
  disabledOpacity: '--ds-slider-disabled-opacity',
  transition: '--ds-slider-transition',
};

interface ResolvedOverrides {
  rootStyle: CSSProperties | undefined;
  label: TextOverrides | undefined;
  value: TextOverrides | undefined;
  markLabel: TextOverrides | undefined;
  helper: TextOverrides | undefined;
}

function resolveOverrides(
  overrides: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined,
): ResolvedOverrides {
  if (!overrides) return { rootStyle: undefined, label: undefined, value: undefined, markLabel: undefined, helper: undefined };
  const rootStyle: Record<string, string> = {};
  const label: TextOverrides = {};
  const value: TextOverrides = {};
  const markLabel: TextOverrides = {};
  const helper: TextOverrides = {};
  for (const binding of Object.keys(overrides) as SliderOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
    switch (binding) {
      case 'fontFamily':
        label.fontFamily = ref;
        value.fontFamily = ref;
        markLabel.fontFamily = ref;
        helper.fontFamily = ref;
        break;
      case 'fontSize':
        label.fontSize = ref;
        break;
      case 'labelWeight':
        label.fontWeight = ref;
        break;
      case 'valueSize':
        value.fontSize = ref;
        break;
      case 'markLabelSize':
        markLabel.fontSize = ref;
        break;
      case 'helperSize':
        helper.fontSize = ref;
        break;
      default:
        break;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, label, value, markLabel, helper };
}

export interface SliderProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue' | 'onChange' | 'className' | 'style'> {
  /** Visible label naming the quantity ("Volume", "Price range"). */
  label: string;
  /** Field name for the Form. A single value registers as its decimal string, a range as two strings. */
  name: string;
  /** Lower bound. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  step?: number | undefined;
  /** With `marks`, snap drag and click to the marks instead of `step` (arrow keys still move by step; PageUp/Down go to the next mark, and past the last mark to `max`/`min`). */
  snapToMarks?: boolean | undefined;
  /** Must have a value other than the default to submit (`copy.required`). */
  required?: boolean | undefined;
  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  invalid?: boolean | undefined;
  /** Controlled value; for a range, a two-number array. */
  value?: number | [number, number] | undefined;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  defaultValue?: number | [number, number] | undefined;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  range?: boolean | undefined;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  formatValue?: ((value: number) => string) | undefined;
  /** Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it). */
  showValue?: SliderShowValue | undefined;
  /** Tick marks on the track, optionally labelled. */
  marks?: { value: number; label?: string | undefined }[] | undefined;
  /** Not adjustable, still readable: thumbs stay focusable but pointer and keys are ignored, and no value is submitted. */
  disabled?: boolean | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Error message. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or composed Text override) to that token. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change while dragging or with keys (number or pair); only when the value actually changed. */
  onChange?: ((value: number | [number, number]) => void) | undefined;
  /** Fired once when the interaction ends (pointer up, key released), and only if that interaction changed the value. */
  onChangeEnd?: ((value: number | [number, number]) => void) | undefined;
}

declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

type ThumbKey = 'single' | 'min' | 'max';
interface Thumb {
  key: ThumbKey;
  /** `null` for a single slider; 0/1 for the low/high thumb of a range. */
  index: 0 | 1 | null;
  value: number;
  /** The live constraint from the other thumb, so Home/End can never cross the thumbs. */
  ariaMin: number;
  ariaMax: number;
}

function decimalsOf(n: number): number {
  const text = String(n);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

function sameValue(a: SliderValue, b: SliderValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
  return a === b;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(Math.max(v, lo), hi);

/**
 * Slider — a bounded numeric value, or a range, chosen by dragging a thumb or with the keyboard.
 *
 * When to use:
 * Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.
 */
export function Slider({
  ref,
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
  formatValue,
  showValue = 'always',
  marks,
  disabled = false,
  description,
  error,
  overrides,
  onChange,
  onChangeEnd,
  id: idProp,
  ...rest
}: SliderProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const controlId = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-slider${generatedId}`);
  const labelId = `${controlId}-label`;
  const descriptionId = `${controlId}-description`;
  const errorId = `${controlId}-error`;

  const validBounds = max > min;
  useEffect(() => {
    if (isDev && !validBounds) console.warn(`Slider: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }, [validBounds, min, max]);

  // A shape that disagrees with `range` falls back silently to that mode's default — no dev warning.
  function normalize(candidate: SliderValue | undefined): SliderValue {
    if (range) {
      if (!Array.isArray(candidate)) return [min, max];
      const lo = clamp(candidate[0], min, max);
      return [lo, clamp(Math.max(candidate[1], lo), min, max)];
    }
    if (typeof candidate !== 'number') return min;
    return clamp(candidate, min, max);
  }

  // "The default": defaultValue when set, otherwise what `value` itself falls back to — clamped to
  // [min, max] so `required` and the initial value share one notion of it.
  const fallback: SliderValue = normalize(defaultValue);
  const [internalValue, setInternalValue] = useState<SliderValue>(fallback);
  const current: SliderValue = normalize(value !== undefined ? value : internalValue);
  // The comparison for "did the value change" is against the last value emitted; the displayed value
  // resets from the prop on every render.
  const latestValue = useRef<SliderValue>(current);
  latestValue.current = current;

  const isDisabled = disabled || (form?.disabled ?? false);
  const errorMessage = error ?? form?.errors[name] ?? (invalid ? COPY.invalid.replace('{label}', label) : undefined);
  const isInvalid = invalid || errorMessage !== undefined;

  // The Form's mode decides when the field re-validates; after a failed submission every mode also
  // re-validates on change. A pointer-driven control has no meaningful blur, so `blur` validates when
  // an interaction ends (pointer or drag release, key-up), not when a thumb loses focus.
  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnInteractionEnd = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Record<ThumbKey, HTMLDivElement | null>>({ single: null, min: null, max: null });
  const [activeKey, setActiveKey] = useState<ThumbKey | null>(null);
  const [focusedKey, setFocusedKey] = useState<ThumbKey | null>(null);
  const dragIndex = useRef<0 | 1 | null | undefined>(undefined);
  const changedInInteraction = useRef(false);

  const format = formatValue ?? ((v: number) => String(v));

  const latest = useRef({ label, required, invalid, error, fallback, disabled: isDisabled, range });
  latest.current = { label, required, invalid, error, fallback, disabled: isDisabled, range };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id: controlId,
      get label() {
        return latest.current.label;
      },
      // The form value types have no number: a single value registers as its decimal string, a range
      // as two strings, which is also what the hidden inputs submit.
      getValue: () => {
        const v = latestValue.current;
        return Array.isArray(v) ? [String(v[0]), String(v[1])] : String(v);
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const l = latest.current;
        if (l.error !== undefined) return l.error;
        if (l.required && sameValue(latestValue.current, l.fallback)) return COPY.required.replace('{label}', l.label);
        if (l.invalid) return COPY.invalid.replace('{label}', l.label);
        return null;
      },
      focus: () => (latest.current.range ? thumbRefs.current.min : thumbRefs.current.single)?.focus(),
    });
  }, [form, name, controlId]);

  const precision = Math.max(decimalsOf(step), decimalsOf(min));

  // The step grid is anchored at `min`; a trailing partial step still clamps to `max`, so the maximum
  // is reachable by drag and click and not only by End.
  function snapToStep(raw: number): number {
    const clamped = clamp(raw, min, max);
    if (!(step > 0)) return clamped;
    const snapped = min + Math.round((clamped - min) / step) * step;
    return clamp(Number(snapped.toFixed(precision)), min, max);
  }

  const markValues = (marks ?? []).map((m) => m.value).sort((a, b) => a - b);
  // Set without any `marks` the flag is inert: drag and click fall back to the step grid.
  const marksSnap = snapToMarks && markValues.length > 0;

  function snapToNearestMark(raw: number): number {
    let nearest = markValues[0];
    if (nearest === undefined) return snapToStep(raw);
    for (const candidate of markValues) {
      if (Math.abs(raw - candidate) < Math.abs(raw - nearest)) nearest = candidate;
    }
    return nearest;
  }

  const snapPointer = (raw: number): number => (marksSnap ? snapToNearestMark(raw) : snapToStep(raw));

  function pageFrom(from: number, direction: 1 | -1): number {
    if (!marksSnap) return snapToStep(from + direction * step * 10);
    if (direction === 1) return markValues.find((v) => v > from) ?? max;
    return [...markValues].reverse().find((v) => v < from) ?? min;
  }

  const [low, high]: [number, number] = Array.isArray(current) ? current : [min, max];
  const single = typeof current === 'number' ? current : min;

  function commit(index: 0 | 1 | null, next: number): void {
    const prev = latestValue.current;
    let nextValue: SliderValue;
    if (index === null) {
      nextValue = clamp(next, min, max);
    } else {
      // The thumbs cannot cross: the lower is clamped to the upper and vice versa.
      const [pLow, pHigh]: [number, number] = Array.isArray(prev) ? prev : [min, max];
      nextValue = index === 0 ? [clamp(Math.min(next, pHigh), min, max), pHigh] : [pLow, clamp(Math.max(next, pLow), min, max)];
    }
    if (sameValue(prev, nextValue)) return;
    latestValue.current = nextValue;
    changedInInteraction.current = true;
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    if (form && validatesOnChange) form.validateField(name);
  }

  function endInteraction(): void {
    if (!changedInInteraction.current) return;
    changedInInteraction.current = false;
    onChangeEnd?.(latestValue.current);
    if (form && validatesOnInteractionEnd) form.validateField(name);
  }

  const percent = (v: number): number => (validBounds ? ((clamp(v, min, max) - min) / (max - min)) * 100 : 0);

  const isRtl = (el: Element): boolean =>
    typeof getComputedStyle === 'function' && getComputedStyle(el).direction === 'rtl';

  /** Pointer math is logical: the ratio is mirrored in a right-to-left layout. */
  function valueAt(clientX: number): number {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    const logical = isRtl(track) ? 1 - ratio : ratio;
    return min + clamp(logical, 0, 1) * (max - min);
  }

  const keyFor = (index: 0 | 1 | null): ThumbKey => (index === null ? 'single' : index === 0 ? 'min' : 'max');

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (isDisabled || event.button !== 0) return;
    event.preventDefault();
    const raw = valueAt(event.clientX);
    // Nearest thumb; when the thumbs coincide, the side of the press decides (exactly on it, the low one).
    const index: 0 | 1 | null = range ? (raw > high || (raw > low && raw - low > high - raw) ? 1 : 0) : null;
    dragIndex.current = index;
    changedInInteraction.current = false;
    setActiveKey(keyFor(index));
    commit(index, snapPointer(raw));
    const target = event.currentTarget;
    if (typeof target.setPointerCapture === 'function') target.setPointerCapture(event.pointerId);
    thumbRefs.current[keyFor(index)]?.focus();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (dragIndex.current === undefined) return;
    commit(dragIndex.current, snapPointer(valueAt(event.clientX)));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (dragIndex.current === undefined) return;
    dragIndex.current = undefined;
    setActiveKey(null);
    const target = event.currentTarget;
    if (typeof target.hasPointerCapture === 'function' && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    endInteraction();
  };

  const handleKeyDown = (thumb: Thumb) => (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    // Keys are ignored while disabled — the page keeps its native scrolling.
    if (isDisabled) return;
    // ArrowLeft/ArrowRight are mirrored in a right-to-left layout, read from the thumb's computed
    // `direction` at keydown; ArrowUp always increases, ArrowDown always decreases, and PageUp/PageDown
    // are not mirrored.
    const rtl = isRtl(event.currentTarget);
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = snapToStep(thumb.value + (rtl ? -step : step));
        break;
      case 'ArrowLeft':
        next = snapToStep(thumb.value + (rtl ? step : -step));
        break;
      case 'ArrowUp':
        next = snapToStep(thumb.value + step);
        break;
      case 'ArrowDown':
        next = snapToStep(thumb.value - step);
        break;
      case 'PageUp':
        next = pageFrom(thumb.value, 1);
        break;
      case 'PageDown':
        next = pageFrom(thumb.value, -1);
        break;
      // Home/End take the live constraint from the other thumb, so they can never cross the thumbs.
      case 'Home':
        next = thumb.ariaMin;
        break;
      case 'End':
        next = thumb.ariaMax;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(thumb.index, next);
  };

  const thumbs: Thumb[] = range
    ? [
        { key: 'min', index: 0, value: low, ariaMin: min, ariaMax: high },
        { key: 'max', index: 1, value: high, ariaMin: low, ariaMax: max },
      ]
    : [{ key: 'single', index: null, value: single, ariaMin: min, ariaMax: max }];

  const fillStart = range ? percent(low) : 0;
  const fillEnd = range ? percent(high) : percent(single);
  const describedBy = [description ? descriptionId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') || undefined;
  const resolved = resolveOverrides(overrides);
  const markList = marks ?? [];
  const labelledMarks = markList.some((m) => m.label);

  const classes = ['ds-slider', isDisabled ? 'ds-slider--disabled' : null, isInvalid ? 'ds-slider--invalid' : null]
    .filter(Boolean)
    .join(' ');

  // disabledOpacity dims the whole root, so the whole root is the inactive user interface component
  // WCAG 1.4.3 exempts from contrast. aria-disabled (a global state) says so on the element that dims,
  // not only on the thumbs; without it the dimmed value text reads as failing text rather than inactive.
  return (
    <div
      {...rest}
      ref={ref}
      data-ds="Slider"
      data-ds-field
      aria-disabled={isDisabled ? 'true' : undefined}
      className={classes}
      style={resolved.rootStyle}
    >
      {/* label row: paints above the thumbs, so a press that lands on it never moves one */}
      <div className="ds-slider__header">
        <Text
          element="span"
          id={labelId}
          data-part="label"
          size="md"
          weight="medium"
          tone="default"
          overrides={resolved.label}
        >
          {label}
        </Text>
        {showValue === 'always' ? (
          <Text element="span" data-part="valueText" size="sm" tone="default" overrides={resolved.value}>
            {range ? COPY.rangeText.replace('{low}', format(low)).replace('{high}', format(high)) : format(single)}
          </Text>
        ) : null}
      </div>
      <div className="ds-slider__control">
        {/* track area: the pointer hit area; the thumbs' minTarget overflows it above and below */}
        <div
          className="ds-slider__area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="ds-slider__rail">
            <div ref={trackRef} className="ds-slider__track" data-part="track">
              <div
                className="ds-slider__fill"
                data-part="fill"
                style={{ insetInlineStart: `${fillStart}%`, inlineSize: `${fillEnd - fillStart}%` }}
              />
            </div>
            {markList.length > 0 ? (
              <div className="ds-slider__tick-marks" data-part="tickMarks" aria-hidden="true">
                {markList.map((mark) => (
                  <span key={`dot-${mark.value}`} className="ds-slider__mark" style={{ insetInlineStart: `${percent(mark.value)}%` }} />
                ))}
              </div>
            ) : null}
            {thumbs.map((thumb) => {
              // Pressed or focused — plain pointer hover never shows the bubble.
              const bubbleVisible = activeKey === thumb.key || focusedKey === thumb.key;
              return (
                <div
                  key={thumb.key}
                  ref={(el) => {
                    thumbRefs.current[thumb.key] = el;
                  }}
                  id={thumb.index === 1 ? undefined : controlId}
                  role="slider"
                  tabIndex={0}
                  data-part="thumb"
                  className={['ds-slider__thumb', activeKey === thumb.key ? 'ds-slider__thumb--active' : null].filter(Boolean).join(' ')}
                  style={{ insetInlineStart: `${percent(thumb.value)}%` }}
                  aria-valuenow={thumb.value}
                  aria-valuemin={thumb.ariaMin}
                  aria-valuemax={thumb.ariaMax}
                  aria-valuetext={format(thumb.value)}
                  aria-labelledby={thumb.index === null ? labelId : undefined}
                  aria-label={
                    thumb.index === 0
                      ? COPY.minimumLabel.replace('{label}', label)
                      : thumb.index === 1
                        ? COPY.maximumLabel.replace('{label}', label)
                        : undefined
                  }
                  aria-describedby={describedBy}
                  aria-orientation="horizontal"
                  aria-disabled={isDisabled ? 'true' : undefined}
                  aria-invalid={isInvalid ? 'true' : undefined}
                  aria-required={required ? 'true' : undefined}
                  onKeyDown={handleKeyDown(thumb)}
                  onKeyUp={endInteraction}
                  onFocus={() => setFocusedKey(thumb.key)}
                  onBlur={() => setFocusedKey(null)}
                >
                  <span className="ds-slider__knob" aria-hidden="true" />
                  {showValue === 'hover' ? (
                    <span
                      className={['ds-slider__bubble', bubbleVisible ? 'ds-slider__bubble--visible' : null].filter(Boolean).join(' ')}
                      data-part="bubble"
                      aria-hidden="true"
                    >
                      <Text element="span" size="sm" tone="default" overrides={resolved.value}>
                        {format(thumb.value)}
                      </Text>
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        {/* mark label row: unparted, below the track area by markLabelGap, and painting above the thumbs */}
        {labelledMarks ? (
          <div className="ds-slider__mark-labels" aria-hidden="true">
            {markList.map((mark) =>
              mark.label ? (
                <span key={`label-${mark.value}`} className="ds-slider__mark-label" style={{ insetInlineStart: `${percent(mark.value)}%` }}>
                  <Text element="span" size="xs" tone="muted" overrides={resolved.markLabel}>
                    {mark.label}
                  </Text>
                </span>
              ) : null,
            )}
          </div>
        ) : null}
      </div>
      {range ? (
        <>
          <input type="hidden" name={name} value={String(low)} disabled={isDisabled} />
          <input type="hidden" name={name} value={String(high)} disabled={isDisabled} />
        </>
      ) : (
        <input type="hidden" name={name} value={String(single)} disabled={isDisabled} />
      )}
      {description ? (
        <Text element="span" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={resolved.helper}>
          {description}
        </Text>
      ) : null}
      {errorMessage ? (
        <div role="alert">
          <Text element="span" id={errorId} data-part="errorMessage" size="sm" tone="danger" overrides={resolved.helper}>
            {errorMessage}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
