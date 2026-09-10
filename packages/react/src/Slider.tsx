import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './Slider.css';

export type SliderShowValue = 'always' | 'hover' | 'never';
export type SliderValue = number | [number, number];
/** One tick mark. Values snap to `step`; marks are decoration plus PageUp/PageDown stops. */
export type SliderMark = { value: number; label?: string };

/** copy.* — used verbatim; `{label}`/`{low}`/`{high}` are replaced as noted. */
const COPY = {
  minimumLabel: '{label} minimum',
  maximumLabel: '{label} maximum',
  rangeText: '{low} – {high}',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/** Bindings owned by the root; fontSize/labelWeight/valueSize/helperSize/fontFamily/errorText are
 * forwarded into the composed Text elements' own `overrides` contract instead, since Text already
 * exposes them (the same split Meter and RadioGroup use). */
const ROOT_OVERRIDE_HOOK: Partial<Record<SliderOverridableBinding, string>> = {
  track: '--ds-slider-track',
  trackHeight: '--ds-slider-track-height',
  trackRadius: '--ds-slider-track-radius',
  thumb: '--ds-slider-thumb',
  thumbBorderWidth: '--ds-slider-thumb-border-width',
  thumbSize: '--ds-slider-thumb-size',
  thumbShadow: '--ds-slider-thumb-shadow',
  thumbActiveScale: '--ds-slider-thumb-active-scale',
  mark: '--ds-slider-mark',
  markSize: '--ds-slider-mark-size',
  markLabelSize: '--ds-slider-mark-label-size',
  partGap: '--ds-slider-part-gap',
  trackPaddingBlock: '--ds-slider-track-padding-block',
  disabledOpacity: '--ds-slider-disabled-opacity',
  transition: '--ds-slider-transition',
};

function overridesToStyle(overrides: Partial<Record<SliderOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  descriptionTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  errorTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const descriptionTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const errorTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};

  for (const binding of Object.keys(overrides) as SliderOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) {
      rootStyle[rootHook] = cssVar(ref);
      continue;
    }
    switch (binding) {
      case 'fontFamily':
        labelTextOverrides.fontFamily = ref;
        descriptionTextOverrides.fontFamily = ref;
        valueTextOverrides.fontFamily = ref;
        errorTextOverrides.fontFamily = ref;
        break;
      case 'fontSize':
        labelTextOverrides.fontSize = ref;
        break;
      case 'labelWeight':
        labelTextOverrides.fontWeight = ref;
        break;
      case 'valueSize':
        valueTextOverrides.fontSize = ref;
        break;
      case 'helperSize':
        descriptionTextOverrides.fontSize = ref;
        errorTextOverrides.fontSize = ref;
        break;
      case 'errorText':
        errorTextOverrides.color = ref;
        break;
    }
  }

  return { rootStyle: rootStyle as CSSProperties, labelTextOverrides, descriptionTextOverrides, valueTextOverrides, errorTextOverrides };
}

export interface SliderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue' | 'onChange'> {
  /** Visible label naming the quantity ("Volume", "Price range"). Also the accessible name. */
  label: string;
  /** Field name for the Form. A range contributes `[min, max]`. */
  name: string;
  /** Lower bound. */
  min?: number;
  /** Upper bound. */
  max?: number;
  /** Arrow-key increment and snapping granularity. */
  step?: number;
  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark). */
  snapToMarks?: boolean;
  /** Must have a value other than the default to submit (`copy.required`). */
  required?: boolean;
  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  invalid?: boolean;
  /** Controlled value; for a range, a two-number array. */
  value?: SliderValue;
  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  defaultValue?: SliderValue;
  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  range?: boolean;
  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  formatValue?: (value: number) => string;
  /** Where the value text appears: always beside the label, only while dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput beside the slider shows it). */
  showValue?: SliderShowValue;
  /** Tick marks on the track, optionally labelled. */
  marks?: SliderMark[];
  /** Not adjustable, still readable. */
  disabled?: boolean;
  /** Helper text. */
  description?: string;
  /** Error message. */
  error?: string;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SliderOverridableBinding, TokenRef>>;
  /** Fired on every value change while dragging or with keys (number or pair). */
  onChange?: (value: SliderValue) => void;
  /** Fired once when the interaction ends (pointer up, key released). Use for expensive effects. */
  onChangeEnd?: (value: SliderValue) => void;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

type ThumbKey = 'single' | 'min' | 'max';
interface ThumbDescriptor {
  key: ThumbKey;
  /** `null` for a non-range slider; 0/1 identify which end of a range this thumb is. */
  index: 0 | 1 | null;
  value: number;
  ariaMin: number;
  ariaMax: number;
  ariaLabelledBy: string;
}

/**
 * Slider — Design Schema, category: input.
 *
 * When to use:
 * Use a Slider for a bounded numeric value where approximate is fine and immediate feedback
 * matters, and where the scale has meaning across its whole width. Use `range` for "between"
 * filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it
 * with a NumberInput (`showValue: never`) when exact entry also matters.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-slider${generatedId}`);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const minLabelId = `${id}-min-label`;
  const maxLabelId = `${id}-max-label`;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Record<ThumbKey, HTMLDivElement | null>>({ single: null, min: null, max: null });

  const validRange = max > min;
  useEffect(() => {
    if (isDev && !validRange) console.warn(`Slider: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }, [validRange, min, max]);

  const effectiveDefault: SliderValue = defaultValue ?? (range ? [min, max] : min);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<SliderValue>(effectiveDefault);
  const current = isControlled ? (value as SliderValue) : internalValue;
  const latestValueRef = useRef<SliderValue>(current);
  latestValueRef.current = current;

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

  // [draggingKey] the pressed thumb (halo); [focusedKey] the focused thumb (hover-mode bubble).
  const [draggingKey, setDraggingKey] = useState<ThumbKey | null>(null);
  const [focusedKey, setFocusedKey] = useState<ThumbKey | null>(null);
  const draggingRef = useRef(false);
  const activeIndexRef = useRef<0 | 1 | null>(null);
  const keyChangedRef = useRef(false);

  const resolvedFormatValue = formatValue ?? ((v: number) => String(v));

  const latest = useRef({ label, disabled: isDisabled, required, invalid, error, effectiveDefault });
  latest.current = { label, disabled: isDisabled, required, invalid, error, effectiveDefault };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => {
        const v = latestValueRef.current;
        return Array.isArray(v) ? [String(v[0]), String(v[1])] : String(v);
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp, effectiveDefault: currentDefault } =
          latest.current;
        if (errorProp !== undefined) return errorProp;
        const v = latestValueRef.current;
        const atDefault = Array.isArray(v) && Array.isArray(currentDefault)
          ? v[0] === currentDefault[0] && v[1] === currentDefault[1]
          : v === currentDefault;
        if (isRequired && atDefault) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => (range ? thumbRefs.current.min : thumbRefs.current.single)?.focus(),
    });
  }, [form, name, id, range]);

  function percentFor(v: number): number {
    if (!validRange) return 0;
    return (Math.min(Math.max(v, min), max) - min) / (max - min) * 100;
  }

  function snapValue(raw: number): number {
    const clamped = Math.min(Math.max(raw, min), max);
    if (!(step > 0)) return clamped;
    const steps = Math.round((clamped - min) / step);
    return Math.min(Math.max(min + steps * step, min), max);
  }

  function sortedMarkValues(): number[] {
    return marks && marks.length > 0 ? [...marks].map((m) => m.value).sort((a, b) => a - b) : [];
  }

  /** Nearest mark to `raw`; falls back to `step` snapping when there are no marks. */
  function snapToNearestMark(raw: number): number {
    const values = sortedMarkValues();
    if (values.length === 0) return snapValue(raw);
    let nearest = values[0];
    let bestDistance = Math.abs(raw - nearest);
    for (const candidate of values) {
      const distance = Math.abs(raw - candidate);
      if (distance < bestDistance) {
        nearest = candidate;
        bestDistance = distance;
      }
    }
    return nearest;
  }

  /** Drag/click snapping: marks when `snapToMarks`, otherwise `step`. Keys always snap to `step` (see `handleThumbKeyDown`). */
  function snapForPointer(raw: number): number {
    return snapToMarks ? snapToNearestMark(raw) : snapValue(raw);
  }

  function pageStep(from: number, direction: 1 | -1): number {
    const values = sortedMarkValues();
    if (values.length === 0) return from + direction * step * 10;
    if (direction === 1) {
      const next = values.find((v) => v > from);
      return next ?? values[values.length - 1];
    }
    const reversed = [...values].reverse();
    const prev = reversed.find((v) => v < from);
    return prev ?? values[0];
  }

  function commitValue(next: SliderValue) {
    if (!isControlled) setInternalValue(next);
    latestValueRef.current = next;
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  }

  function updateThumb(index: 0 | 1 | null, raw: number, snap: (raw: number) => number = snapValue) {
    const snapped = snap(raw);
    if (index === null) {
      commitValue(snapped);
      return;
    }
    const [low, high]: [number, number] = Array.isArray(current) ? current : [min, max];
    commitValue(index === 0 ? [Math.min(snapped, high), high] : [low, Math.max(snapped, low)]);
  }

  const [lowValue, highValue]: [number, number] = range && Array.isArray(current) ? current : [min, max];
  const singleValue = !range && typeof current === 'number' ? current : min;

  const thumbs: ThumbDescriptor[] = range
    ? [
        { key: 'min', index: 0, value: lowValue, ariaMin: min, ariaMax: highValue, ariaLabelledBy: minLabelId },
        { key: 'max', index: 1, value: highValue, ariaMin: lowValue, ariaMax: max, ariaLabelledBy: maxLabelId },
      ]
    : [{ key: 'single', index: null, value: singleValue, ariaMin: min, ariaMax: max, ariaLabelledBy: labelId }];

  const fillStartPercent = range ? percentFor(lowValue) : 0;
  const fillEndPercent = range ? percentFor(highValue) : percentFor(singleValue);

  function valueFromClientX(clientX: number): number {
    const rail = trackRef.current;
    if (!rail) return min;
    const rect = rail.getBoundingClientRect();
    const rtl = getComputedStyle(rail).direction === 'rtl';
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    const clampedRatio = Math.min(Math.max(rtl ? 1 - ratio : ratio, 0), 1);
    return min + clampedRatio * (max - min);
  }

  function nearestThumbIndex(raw: number): 0 | 1 | null {
    if (!range) return null;
    const distLow = Math.abs(raw - lowValue);
    const distHigh = Math.abs(raw - highValue);
    return distLow <= distHigh ? 0 : 1;
  }

  const handleBodyPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isDisabled || event.button !== 0) return;
    event.preventDefault();
    const raw = valueFromClientX(event.clientX);
    const index = nearestThumbIndex(raw);
    activeIndexRef.current = index;
    draggingRef.current = true;
    const key: ThumbKey = index === null ? 'single' : index === 0 ? 'min' : 'max';
    setDraggingKey(key);
    updateThumb(index, raw, snapForPointer);
    event.currentTarget.setPointerCapture(event.pointerId);
    thumbRefs.current[key]?.focus();
  };

  const handleBodyPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateThumb(activeIndexRef.current, valueFromClientX(event.clientX), snapForPointer);
  };

  const handleBodyPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDraggingKey(null);
    onChangeEnd?.(latestValueRef.current);
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleThumbKeyDown = (descriptor: ThumbDescriptor) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = descriptor.value + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = descriptor.value - step;
        break;
      case 'PageUp':
        next = pageStep(descriptor.value, 1);
        break;
      case 'PageDown':
        next = pageStep(descriptor.value, -1);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    updateThumb(descriptor.index, next);
    keyChangedRef.current = true;
  };

  const handleThumbKeyUp = () => {
    if (keyChangedRef.current) {
      keyChangedRef.current = false;
      onChangeEnd?.(latestValueRef.current);
      if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
    }
  };

  const handleThumbFocus = (key: ThumbKey) => () => setFocusedKey(key);
  const handleThumbBlur = () => setFocusedKey(null);

  const setThumbRef = (key: ThumbKey) => (el: HTMLDivElement | null) => {
    thumbRefs.current[key] = el;
  };

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const { rootStyle, labelTextOverrides, descriptionTextOverrides, valueTextOverrides, errorTextOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, labelTextOverrides: undefined, descriptionTextOverrides: undefined, valueTextOverrides: undefined, errorTextOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const classes = [
    'ds-slider',
    isDisabled ? 'ds-slider--disabled' : null,
    isInvalid ? 'ds-slider--invalid' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} ref={ref} id={id} data-ds="Slider" className={classes} style={mergedStyle}>
      <div className="ds-slider__header">
        <Text
          element="span"
          id={labelId}
          data-part="label"
          weight="medium"
          className="ds-slider__label"
          overrides={labelTextOverrides}
        >
          {label}
        </Text>
        {showValue === 'always' ? (
          <Text
            element="span"
            data-part="valueText"
            size="sm"
            className="ds-slider__value"
            overrides={valueTextOverrides}
          >
            {range
              ? COPY.rangeText.replace('{low}', resolvedFormatValue(lowValue)).replace('{high}', resolvedFormatValue(highValue))
              : resolvedFormatValue(singleValue)}
          </Text>
        ) : null}
      </div>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-slider__description"
          overrides={descriptionTextOverrides}
        >
          {description}
        </Text>
      ) : null}
      <div
        className="ds-slider__body"
        onPointerDown={handleBodyPointerDown}
        onPointerMove={handleBodyPointerMove}
        onPointerUp={handleBodyPointerUp}
        onPointerCancel={handleBodyPointerUp}
      >
        <div ref={trackRef} className="ds-slider__track" data-part="track">
          <div
            className="ds-slider__fill"
            data-part="fill"
            style={{ insetInlineStart: `${fillStartPercent}%`, inlineSize: `${fillEndPercent - fillStartPercent}%` }}
          />
        </div>
        {marks && marks.length > 0 ? (
          <div className="ds-slider__marks" data-part="tickMarks" aria-hidden="true">
            {marks.map((mark) => (
              <span key={mark.value} className="ds-slider__mark" style={{ insetInlineStart: `${percentFor(mark.value)}%` }}>
                {mark.label ? <span className="ds-slider__mark-label">{mark.label}</span> : null}
              </span>
            ))}
          </div>
        ) : null}
        {thumbs.map((descriptor) => {
          const showBubble = showValue === 'hover' && (draggingKey === descriptor.key || focusedKey === descriptor.key);
          const thumbClasses = ['ds-slider__thumb', draggingKey === descriptor.key ? 'ds-slider__thumb--active' : null]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={descriptor.key}
              ref={setThumbRef(descriptor.key)}
              role="slider"
              tabIndex={0}
              data-part="thumb"
              className={thumbClasses}
              style={{ insetInlineStart: `${percentFor(descriptor.value)}%` }}
              aria-valuenow={descriptor.value}
              aria-valuemin={descriptor.ariaMin}
              aria-valuemax={descriptor.ariaMax}
              aria-valuetext={resolvedFormatValue(descriptor.value)}
              aria-labelledby={descriptor.ariaLabelledBy}
              aria-orientation="horizontal"
              aria-disabled={isDisabled ? 'true' : undefined}
              aria-describedby={describedBy || undefined}
              onKeyDown={handleThumbKeyDown(descriptor)}
              onKeyUp={handleThumbKeyUp}
              onFocus={handleThumbFocus(descriptor.key)}
              onBlur={handleThumbBlur}
            >
              <span className="ds-slider__thumb-knob" aria-hidden="true" />
              {showBubble ? (
                <span className="ds-slider__bubble" data-part="valueText">
                  {resolvedFormatValue(descriptor.value)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {range ? (
        <>
          <span id={minLabelId} className="ds-slider__visually-hidden">
            {COPY.minimumLabel.replace('{label}', label)}
          </span>
          <span id={maxLabelId} className="ds-slider__visually-hidden">
            {COPY.maximumLabel.replace('{label}', label)}
          </span>
        </>
      ) : null}
      {range ? (
        <>
          <input type="hidden" name={name} value={String(lowValue)} disabled={isDisabled} />
          <input type="hidden" name={name} value={String(highValue)} disabled={isDisabled} />
        </>
      ) : (
        <input type="hidden" name={name} value={String(singleValue)} disabled={isDisabled} />
      )}
      {resolvedError ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          className="ds-slider__error"
          overrides={errorTextOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
});
