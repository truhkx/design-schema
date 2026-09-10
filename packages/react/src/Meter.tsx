import { forwardRef, useEffect, useId, type ComponentPropsWithoutRef } from 'react';
import { Text } from './Text';
import './Meter.css';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

export interface MeterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'> {
  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  value: number;
  /** Lower bound of the range. */
  min?: number;
  /** Upper bound of the range. Must be greater than `min`. */
  max?: number;
  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  label: string;
  /** Human-readable value shown at the end of the label row and announced instead of the raw number. Omit for the percentage. */
  valueText?: string;
  /** Fill color. `info` is the neutral fill; the consumer sets the others from thresholds it owns. */
  tone?: MeterTone;
  /** Hides the visible value text. The accessible value is always exposed. */
  hideValue?: boolean;
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
  { value, min = 0, max = 100, label, valueText, tone = 'info', hideValue = false, id: idProp, className, ...rest },
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

  return (
    <div {...rest} ref={ref} id={id} className={classes}>
      <div className="ds-meter__header">
        <Text element="span" id={labelId} size="sm" weight="medium" className="ds-meter__label">
          {label}
        </Text>
        {hideValue ? null : (
          <Text element="span" size="sm" tone="muted" className="ds-meter__value">
            {resolvedValueText}
          </Text>
        )}
      </div>
      <div
        className="ds-meter__track"
        role="meter"
        aria-labelledby={labelId}
        aria-valuenow={clamped}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={resolvedValueText}
      >
        <div className="ds-meter__fill" style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  );
});
