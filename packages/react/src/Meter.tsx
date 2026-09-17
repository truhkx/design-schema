import { useEffect, useId, type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import './Meter.css';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/** Bindings realised as hooks on the root. The rest are forwarded to the composed Texts' `overrides`. */
const ROOT_OVERRIDE_HOOK: Partial<Record<MeterOverridableBinding, string>> = {
  trackHeight: '--ds-meter-track-height',
  radius: '--ds-meter-radius',
  partGap: '--ds-meter-part-gap',
  labelGap: '--ds-meter-label-gap',
  transition: '--ds-meter-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type MeterOverrides = Partial<Record<MeterOverridableBinding, TokenRef | undefined>>;

function rootStyle(overrides: MeterOverrides): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as MeterOverridableBinding[]) {
    const hook = ROOT_OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    // Locked and forwarded bindings have no root hook; ignore them here.
    if (hook === undefined || !ref) continue;
    style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/** Drops unset entries so the Text keeps its own defaults. */
function compact(overrides: TextOverrides): TextOverrides | undefined {
  const out: TextOverrides = {};
  for (const key of Object.keys(overrides) as TextOverridableBinding[]) {
    const ref = overrides[key];
    if (ref) out[key] = ref;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export interface MeterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'className' | 'style'> {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number | undefined;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number | undefined;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw number
   * ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%").
   */
  valueText?: string | undefined;
  /**
   * Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from
   * thresholds it owns — the meter does not decide what is "too full".
   */
  tone?: MeterTone | undefined;
  /**
   * Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding
   * one). The accessible value is always exposed.
   */
  hideValue?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: MeterOverrides | undefined;
}

declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const PERCENT = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

/**
 * Meter — Design Schema, category: data.
 *
 * When to use:
 * Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a
 * score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands
 * ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not
 * what a person would say.
 */
export function Meter({
  ref,
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  tone = 'info',
  hideValue = false,
  overrides,
  ...rest
}: MeterProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  // Per-instance styling goes only through `overrides`; strip anything an untyped caller passes.
  const { className: _className, style: _style, ...forwarded } = rest as typeof rest & {
    className?: unknown;
    style?: unknown;
  };
  const labelId = useId();

  const validRange = max > min;
  useEffect(() => {
    if (isDev && !validRange) console.warn(`Meter: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }, [validRange, min, max]);

  // A non-finite value is treated as `min`; with an invalid range the meter is empty at `min`.
  const safeValue = Number.isFinite(value) ? value : min;
  const clamped = validRange ? Math.min(Math.max(safeValue, min), max) : min;
  const fraction = validRange ? (clamped - min) / (max - min) : 0;
  // Rounding is for the text only; the fill uses the exact fraction.
  const resolvedValueText = valueText ?? PERCENT.format(fraction);

  const labelOverrides = compact({
    fontSize: overrides?.labelSize,
    fontWeight: overrides?.labelWeight,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  });
  const valueOverrides = compact({
    fontSize: overrides?.valueSize,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  });

  return (
    <div
      {...forwarded}
      ref={ref}
      data-ds="Meter"
      data-part="container"
      className={`ds-meter ds-meter--${tone}`}
      style={overrides ? rootStyle(overrides) : undefined}
    >
      <div className="ds-meter__header" data-part="header">
        <Text
          element="span"
          size="sm"
          weight="medium"
          tone="default"
          id={labelId}
          data-part="label"
          overrides={labelOverrides}
        >
          {label}
        </Text>
        {hideValue ? null : (
          <Text element="span" size="sm" tone="muted" data-part="valueText" overrides={valueOverrides}>
            {resolvedValueText}
          </Text>
        )}
      </div>
      <div
        className="ds-meter__track"
        data-part="track"
        role="meter"
        aria-labelledby={labelId}
        aria-valuenow={clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={resolvedValueText}
      >
        <div className="ds-meter__fill" data-part="fill" style={{ inlineSize: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}
