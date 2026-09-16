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
};

/** Milestone tiers for `announce: milestones`, as fractions of the range. */
const MILESTONES = [0.25, 0.5, 0.75, 1] as const;

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
  | 'transition'
  | 'indeterminateLoop';

/** Bindings owned by the root; the label/value type bindings are forwarded into the composed Text
 * elements' own `overrides` contract instead, since Text already exposes them. */
const ROOT_OVERRIDE_HOOK: Partial<Record<ProgressBarOverridableBinding, string | undefined>> = {
  track: '--ds-progress-bar-track',
  trackHeight: '--ds-progress-bar-track-height',
  radius: '--ds-progress-bar-radius',
  partGap: '--ds-progress-bar-part-gap',
  transition: '--ds-progress-bar-transition',
  indeterminateLoop: '--ds-progress-bar-indeterminate-loop',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function overridesToStyle(overrides: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  labelTextOverrides: TextOverrides;
  valueTextOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const labelTextOverrides: TextOverrides = {};
  const valueTextOverrides: TextOverrides = {};

  for (const binding of Object.keys(overrides) as ProgressBarOverridableBinding[]) {
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

export interface ProgressBarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'className' | 'style' | 'tabIndex'> {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`. */
  label: string;
  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown). */
  value?: number | undefined;
  /** Start of the range. */
  min?: number | undefined;
  /** End of the range. */
  max?: number | undefined;
  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range — `(value − min) / (max − min)` — the same arithmetic the fill uses, so a non-zero `min` reads correctly without a custom formatter. A `max` at or below `min` is not a range: the bar renders empty and warns in development. */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text beside the label. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening. */
  hideLabel?: boolean | undefined;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal. */
  tone?: ProgressBarTone | undefined;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`, and `copy.indeterminate` is announced once each time the bar enters the indeterminate state. A value that moves backward resets the tiers already announced, so a retried task announces its progress again on the way up. */
  announce?: ProgressBarAnnounce | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function defaultFormatValue(value: number, min: number, max: number): string {
  const fraction = max > min ? (value - min) / (max - min) : 0;
  return `${Math.round(fraction * 100)}%`;
}

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => params[key] ?? match);
}

/** Highest milestone tier (0 = none, 1…4 = 25…100%) the fraction has reached. */
function milestoneTier(fraction: number): number {
  let tier = 0;
  for (const [i, m] of MILESTONES.entries()) if (fraction >= m) tier = i + 1;
  return tier;
}

/**
 * ProgressBar — Design Schema, category: feedback.
 *
 * When to use:
 * Use a ProgressBar for a task the interface started and can see through to the end: uploads,
 * downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value`
 * whenever the total is known; use the indeterminate form only until the total is known, then
 * switch. Set `announce: milestones` for long tasks the user may leave and come back to;
 * `complete` (the default) is right for anything under a minute.
 */
export const ProgressBar = function ProgressBar({
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
  id: idProp,
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
  const generatedId = useId();
  const id = idProp ?? `ds-progress-bar${generatedId}`;
  const labelId = `${id}-label`;

  const validRange = max > min;
  useEffect(() => {
    if (isDev && !validRange) {
      console.warn(`ProgressBar: \`max\` (${max}) must be greater than \`min\` (${min}); the bar renders empty.`);
    }
  }, [validRange, min, max]);

  const determinate = typeof value === 'number' && Number.isFinite(value);
  // With an invalid range the bar is empty at `min`.
  const clamped = determinate && validRange ? Math.min(Math.max(value, min), max) : min;
  const fraction = determinate && validRange ? (clamped - min) / (max - min) : 0;
  const valueText = determinate ? (formatValue ?? defaultFormatValue)(clamped, min, max) : undefined;

  /* Announcements. Each message gets a fresh key so a repeated string is re-inserted and re-read. */
  const [message, setMessage] = useState<{ text: string; key: number }>({ text: '', key: 0 });
  const latest = useRef({ label, valueText });
  latest.current = { label, valueText };
  const track = useRef<{ mounted: boolean; indeterminate: boolean; last: number | undefined; tier: number; complete: boolean }>({
    mounted: false,
    indeterminate: false,
    last: undefined,
    tier: 0,
    complete: false,
  });

  useEffect(() => {
    const t = track.current;
    const say = (template: string): void => {
      const text = interpolate(template, { label: latest.current.label, value: latest.current.valueText ?? '' });
      setMessage((prev) => ({ text, key: prev.key + 1 }));
    };
    const firstRun = !t.mounted;
    t.mounted = true;

    if (!determinate) {
      if (!t.indeterminate) {
        t.indeterminate = true;
        if (announce !== 'none') say(COPY.indeterminate);
      }
      return;
    }
    t.indeterminate = false;
    if (!validRange) return;

    // A value that moves backward resets the tiers already announced, down to where the value now is.
    if (t.last !== undefined && clamped < t.last) {
      t.tier = milestoneTier(fraction);
      t.complete = fraction >= 1;
    }
    t.last = clamped;

    const tier = milestoneTier(fraction);
    const complete = fraction >= 1;
    // Progress reached before the bar was shown is not announced; only movement after mount is.
    if (firstRun) {
      t.tier = tier;
      t.complete = complete;
      return;
    }

    if (complete && !t.complete) {
      t.complete = true;
      t.tier = tier;
      if (announce !== 'none') say(COPY.complete);
      return;
    }
    if (tier > t.tier) {
      t.tier = tier;
      if (announce === 'milestones') say(COPY.progress);
    }
  }, [announce, determinate, validRange, clamped, fraction]);

  const { rootStyle, labelTextOverrides, valueTextOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, labelTextOverrides: undefined, valueTextOverrides: undefined };

  const labelText = (
    <Text element="span" id={labelId} data-part="label" size="sm" weight="medium" overrides={labelTextOverrides}>
      {label}
    </Text>
  );
  const showValueText = showValue && determinate;

  return (
    <div
      {...forwarded}
      ref={ref}
      id={id}
      data-ds="ProgressBar"
      data-part="container"
      className={`ds-progress-bar ds-progress-bar--${tone}`}
      style={rootStyle}
    >
      {hideLabel && !showValueText ? (
        <span className="ds-progress-bar__visually-hidden">{labelText}</span>
      ) : (
        <div className="ds-progress-bar__header">
          {hideLabel ? <span className="ds-progress-bar__visually-hidden">{labelText}</span> : labelText}
          {showValueText ? (
            <Text element="span" data-part="valueText" size="sm" tone="muted" overrides={valueTextOverrides}>
              {valueText}
            </Text>
          ) : null}
        </div>
      )}
      <div
        className="ds-progress-bar__track"
        data-part="track"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={min}
        aria-valuemax={max}
        {...(determinate ? { 'aria-valuenow': clamped, 'aria-valuetext': valueText } : { 'aria-busy': true as const })}
      >
        <div
          className="ds-progress-bar__fill"
          data-part="fill"
          style={determinate ? { inlineSize: `${fraction * 100}%` } : undefined}
        />
      </div>
      <div className="ds-progress-bar__visually-hidden" role="status" aria-live="polite">
        {message.text ? <span key={message.key}>{message.text}</span> : null}
      </div>
    </div>
  );
};
