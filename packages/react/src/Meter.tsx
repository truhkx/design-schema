import { forwardRef, useEffect, useId, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
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

/** Bindings owned by the root; `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` are forwarded
 * into the composed Text elements' own `overrides` contract instead, since Text already exposes them. */
const ROOT_OVERRIDE_HOOK: Partial<Record<MeterOverridableBinding, string>> = {
  trackHeight: '--ds-meter-track-height',
  radius: '--ds-meter-radius',
  partGap: '--ds-meter-part-gap',
  labelGap: '--ds-meter-label-gap',
  transition: '--ds-meter-transition',
};

function overridesToStyle(overrides: Partial<Record<MeterOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};

  for (const binding of Object.keys(overrides) as MeterOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) {
      rootStyle[rootHook] = cssVar(ref);
      continue;
    }
    switch (binding) {
      case 'labelSize':
        labelTextOverrides.fontSize = ref;
        break;
      case 'labelWeight':
        labelTextOverrides.fontWeight = ref;
        break;
      case 'valueSize':
        valueTextOverrides.fontSize = ref;
        break;
      case 'fontFamily':
        labelTextOverrides.fontFamily = ref;
        valueTextOverrides.fontFamily = ref;
        break;
      case 'lineHeight':
        labelTextOverrides.lineHeight = ref;
        valueTextOverrides.lineHeight = ref;
        break;
    }
  }

  return { rootStyle: rootStyle as CSSProperties, labelTextOverrides, valueTextOverrides };
}

export interface MeterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'> {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%"). */
  valueText?: string;
  /** Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns — the meter does not decide what is "too full". */
  tone?: MeterTone;
  /** Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding one). The accessible value is always exposed. */
  hideValue?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<MeterOverridableBinding, TokenRef>>;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * Meter — Design Schema, category: data.
 *
 * When to use:
 * Use a Meter for a measurement with a fixed range: storage or quota used, battery, password
 * strength, a score out of ten, a budget consumed. Let the consumer decide the tone from
 * thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText`
 * whenever the raw percentage is not what a person would say.
 */
export const Meter = forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    label,
    valueText,
    tone = 'info',
    hideValue = false,
    overrides,
    id: idProp,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? `ds-meter${generatedId}`;
  const labelId = `${id}-label`;

  const validRange = max > min;
  useEffect(() => {
    if (isDev && !validRange) console.warn(`Meter: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }, [validRange, min, max]);

  // A non-finite value is treated as `min`; with an invalid range the meter is empty at `min`.
  const safeValue = Number.isFinite(value) ? value : min;
  const clamped = validRange ? Math.min(Math.max(safeValue, min), max) : min;
  const percent = validRange ? ((clamped - min) / (max - min)) * 100 : 0;
  const resolvedValueText = valueText ?? `${Math.round(percent)}%`;

  const classes = ['ds-meter', `ds-meter--${tone}`, className ?? null].filter(Boolean).join(' ');

  const { rootStyle, labelTextOverrides, valueTextOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, labelTextOverrides: undefined, valueTextOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  return (
    <div {...rest} ref={ref} id={id} data-ds="Meter" data-part="container" className={classes} style={mergedStyle}>
      <div className="ds-meter__header">
        <Text
          element="span"
          id={labelId}
          data-part="label"
          size="sm"
          weight="medium"
          className="ds-meter__label"
          overrides={labelTextOverrides}
        >
          {label}
        </Text>
        {hideValue ? null : (
          <Text
            element="span"
            data-part="valueText"
            size="sm"
            tone="muted"
            className="ds-meter__value"
            overrides={valueTextOverrides}
          >
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
        <div className="ds-meter__fill" data-part="fill" style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  );
});
