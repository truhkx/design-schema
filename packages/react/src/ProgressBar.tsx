import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import './ProgressBar.css';

export type ProgressBarTone = 'neutral' | 'success' | 'danger';
export type ProgressBarAnnounce = 'none' | 'milestones' | 'complete';

const COPY = {
  progress: '{label}: {value}',
  complete: '{label}: complete',
  indeterminate: '{label}: in progress',
} as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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
  | 'sweepEasing';

/** Bindings realised as hooks on the root. The rest are forwarded to the composed Texts' `overrides`. */
const ROOT_OVERRIDE_HOOK: Partial<Record<ProgressBarOverridableBinding, string>> = {
  track: '--ds-progress-bar-track',
  trackHeight: '--ds-progress-bar-track-height',
  radius: '--ds-progress-bar-radius',
  partGap: '--ds-progress-bar-part-gap',
  labelGap: '--ds-progress-bar-label-gap',
  transition: '--ds-progress-bar-transition',
  indeterminateLoop: '--ds-progress-bar-indeterminate-loop',
  sweepEasing: '--ds-progress-bar-sweep-easing',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type ProgressBarOverrides = Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>;

function rootStyle(overrides: ProgressBarOverrides): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ProgressBarOverridableBinding[]) {
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

export interface ProgressBarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'className' | 'style' | 'tabIndex'> {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`. */
  label: string;
  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the end is
   * unknown). Clamped to `min`…`max` for the fill, the accessible value, `formatValue`'s argument and the
   * announcement tiers; a non-finite number (NaN, Infinity) is treated as `min`.
   */
  value?: number | null | undefined;
  /** Start of the range. */
  min?: number | undefined;
  /** End of the range. */
  max?: number | undefined;
  /**
   * Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range —
   * `(value − min) / (max − min)` — rounded to a whole number. Called with the clamped value. A `max` at or
   * below `min` is not a range: the bar renders empty, exposes `min` as its value, shows "0%" unless a custom
   * formatter says otherwise, makes no progress or completion announcements, and warns in development.
   */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text at the end of the label row. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /**
   * Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already
   * says what is happening. The value text, when shown, stays at the end of the row; when there is no visible
   * value text either, the label row takes no space and `partGap` is not applied.
   */
  hideLabel?: boolean | undefined;
  /**
   * Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a
   * text status elsewhere: the color is never the only signal.
   */
  tone?: ProgressBarTone | undefined;
  /**
   * What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each
   * announcement uses `copy.progress` / `copy.complete`, and `copy.indeterminate` is announced once each time
   * the bar enters the indeterminate state. A value that moves backward resets the tiers already announced,
   * so a retried task announces its progress again on the way up.
   */
  announce?: ProgressBarAnnounce | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: ProgressBarOverrides | undefined;
}

declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const PERCENT = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

function defaultFormatValue(value: number, min: number, max: number): string {
  return PERCENT.format(max > min ? (value - min) / (max - min) : 0);
}

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => params[key] ?? match);
}

interface AnnounceRecord {
  mounted: boolean;
  indeterminate: boolean;
  validRange: boolean;
  tier: number;
  complete: boolean;
}

/**
 * ProgressBar — Design Schema, category: feedback.
 *
 * When to use:
 * Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads,
 * imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is
 * known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones`
 * for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a
 * minute.
 */
export function ProgressBar({
  ref,
  label,
  value,
  min = 0,
  max = 100,
  formatValue,
  showValue = true,
  hideLabel = false,
  tone = 'neutral',
  announce = 'complete',
  overrides,
  ...rest
}: ProgressBarProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  // Per-instance styling goes only through `overrides`, and the bar is never focusable;
  // strip anything an untyped caller passes.
  const {
    className: _className,
    style: _style,
    tabIndex: _tabIndex,
    ...forwarded
  } = rest as typeof rest & { className?: unknown; style?: unknown; tabIndex?: unknown };
  const labelId = useId();

  const validRange = max > min;
  useEffect(() => {
    if (isDev && !validRange) {
      console.warn(`ProgressBar: \`max\` (${max}) must be greater than \`min\` (${min}); the bar renders empty.`);
    }
  }, [validRange, min, max]);

  const indeterminate = value === undefined || value === null;
  // A non-finite value is treated as `min`; with an invalid range the bar is empty at `min`.
  const safeValue = !indeterminate && Number.isFinite(value) ? value : min;
  const clamped = validRange ? Math.min(Math.max(safeValue, min), max) : min;
  // The fill uses the exact fraction; rounding is for the text only.
  const fraction = validRange ? (clamped - min) / (max - min) : 0;
  const valueText = indeterminate ? undefined : (formatValue ?? defaultFormatValue)(clamped, min, max);
  const tier = Math.floor(fraction * 4);
  const complete = validRange && clamped >= max;

  /* Announcements. Each message gets a fresh key so a repeated string replaces the node and is read again. */
  const [message, setMessage] = useState<{ text: string; key: number }>({ text: '', key: 0 });
  const latest = useRef({ label, valueText });
  latest.current = { label, valueText };
  const record = useRef<AnnounceRecord>({ mounted: false, indeterminate: false, validRange: false, tier: 0, complete: false });

  useEffect(() => {
    const r = record.current;
    const say = (template: string): void => {
      const text = interpolate(template, { label: latest.current.label, value: latest.current.valueText ?? '' });
      setMessage((prev) => ({ text, key: prev.key + 1 }));
    };
    const firstRun = !r.mounted;
    r.mounted = true;

    if (indeterminate) {
      if (firstRun || !r.indeterminate) {
        r.indeterminate = true;
        if (announce !== 'none') say(COPY.indeterminate);
      }
      return;
    }
    r.indeterminate = false;

    const enteredRange = validRange && !r.validRange;
    r.validRange = validRange;
    if (!validRange) return;

    // Progress reached at mount (or when the range becomes valid) is recorded silently.
    if (firstRun || enteredRange) {
      r.tier = tier;
      r.complete = complete;
      return;
    }

    // Moving to a lower tier resets the record there; dropping below `max` re-arms completion.
    if (tier < r.tier) r.tier = tier;
    if (!complete) r.complete = false;

    if (complete && !r.complete) {
      r.complete = true;
      r.tier = tier;
      if (announce !== 'none') say(COPY.complete);
      return;
    }
    if (tier > r.tier) {
      // Tiers are tracked for every `announce` value, so switching it mid-task never replays them.
      r.tier = tier;
      if (announce === 'milestones') say(COPY.progress);
    }
  }, [announce, indeterminate, validRange, tier, complete]);

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

  const showValueText = showValue && !indeterminate;
  const labelText = (
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
  );

  const headerClass = !showValueText && hideLabel
    ? 'ds-progress-bar__header ds-progress-bar__visually-hidden'
    : hideLabel
      ? 'ds-progress-bar__header ds-progress-bar__header--label-hidden'
      : 'ds-progress-bar__header';

  return (
    <div
      {...forwarded}
      ref={ref}
      data-ds="ProgressBar"
      data-part="container"
      className={`ds-progress-bar ds-progress-bar--${tone}`}
      style={overrides ? rootStyle(overrides) : undefined}
    >
      <div className={headerClass} data-part="header">
        {hideLabel && showValueText ? <span className="ds-progress-bar__visually-hidden">{labelText}</span> : labelText}
        {showValueText ? (
          <Text element="span" size="sm" tone="muted" data-part="valueText" overrides={valueOverrides}>
            {valueText}
          </Text>
        ) : null}
      </div>
      <div
        className="ds-progress-bar__track"
        data-part="track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={min}
        aria-valuemax={max}
        {...(indeterminate ? { 'aria-busy': true as const } : { 'aria-valuenow': clamped, 'aria-valuetext': valueText })}
      >
        <div
          className="ds-progress-bar__fill"
          data-part="fill"
          style={indeterminate ? undefined : { inlineSize: `${fraction * 100}%` }}
        />
      </div>
      <div className="ds-progress-bar__visually-hidden" role="status" aria-live="polite">
        {message.text ? <span key={message.key}>{message.text}</span> : null}
      </div>
    </div>
  );
}
