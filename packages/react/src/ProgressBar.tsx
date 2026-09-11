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

/** Bindings owned by the root; the label/value sizing bindings are forwarded into the composed Text
 * elements' own `overrides` contract instead, since Text already exposes them. */
const ROOT_OVERRIDE_HOOK: Partial<Record<ProgressBarOverridableBinding, string | undefined>> = {
  track: '--ds-progress-bar-track',
  trackHeight: '--ds-progress-bar-track-height',
  radius: '--ds-progress-bar-radius',
  partGap: '--ds-progress-bar-part-gap',
  transition: '--ds-progress-bar-transition',
  indeterminateLoop: '--ds-progress-bar-indeterminate-loop',
};

function overridesToStyle(overrides: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelTextOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const valueTextOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};

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

export interface ProgressBarProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'> {
  /** What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`. */
  label: string;
  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown). */
  value?: number | undefined;
  /** Start of the range. */
  min?: number | undefined;
  /** End of the range. */
  max?: number | undefined;
  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage. */
  formatValue?: ((value: number, min: number, max: number) => string) | undefined;
  /** Show the value text beside the label. Ignored when indeterminate. */
  showValue?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening. */
  hideLabel?: boolean | undefined;
  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal. */
  tone?: ProgressBarTone | undefined;
  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`. */
  announce?: ProgressBarAnnounce | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;
}

const TONE_CLASS: Record<ProgressBarTone, string> = {
  neutral: 'ds-progress-bar--neutral',
  success: 'ds-progress-bar--success',
  danger: 'ds-progress-bar--danger',
};

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
  className,
  style,
  ...rest
}: ProgressBarProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `ds-progress-bar${generatedId}`;
  const labelId = `${id}-label`;

  const determinate = typeof value === 'number' && Number.isFinite(value);
  const validRange = max > min;
  const clamped = determinate && validRange ? Math.min(Math.max(value as number, min), max) : min;
  const percent = determinate && validRange ? ((clamped - min) / (max - min)) * 100 : 0;

  const resolvedFormatValue =
    formatValue ?? ((v: number, mn: number, mx: number) => `${Math.round(((v - mn) / (mx - mn)) * 100)}%`);
  const resolvedValueText = determinate ? resolvedFormatValue(clamped, min, max) : undefined;

  const [liveMessage, setLiveMessage] = useState('');
  const indeterminateAnnouncedRef = useRef(false);
  const completeAnnouncedRef = useRef(false);
  const lastMilestoneRef = useRef(0);

  useEffect(() => {
    if (announce === 'none') return;

    if (!determinate) {
      if (!indeterminateAnnouncedRef.current) {
        indeterminateAnnouncedRef.current = true;
        setLiveMessage(COPY.indeterminate.replace('{label}', label));
      }
      return;
    }
    indeterminateAnnouncedRef.current = false;

    if (clamped >= max) {
      if (!completeAnnouncedRef.current) {
        completeAnnouncedRef.current = true;
        setLiveMessage(COPY.complete.replace('{label}', label));
      }
      return;
    }
    completeAnnouncedRef.current = false;

    if (announce === 'milestones') {
      const milestone = Math.floor(percent / 25) * 25;
      if (milestone > lastMilestoneRef.current) {
        lastMilestoneRef.current = milestone;
        if (milestone > 0) {
          setLiveMessage(
            COPY.progress.replace('{label}', label).replace('{value}', resolvedFormatValue(clamped, min, max)),
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announce, determinate, clamped, min, max, percent, label]);

  const classes = ['ds-progress-bar', TONE_CLASS[tone], className ?? null].filter(Boolean).join(' ');

  const { rootStyle, labelTextOverrides, valueTextOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, labelTextOverrides: undefined, valueTextOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  return (
    <div {...rest} ref={ref} id={id} data-ds="ProgressBar" data-part="container" className={classes} style={mergedStyle}>
      <div className="ds-progress-bar__header">
        <Text
          element="span"
          id={labelId}
          data-part="label"
          size="sm"
          weight="medium"
          className={hideLabel ? 'ds-progress-bar__visually-hidden' : 'ds-progress-bar__label'}
          overrides={labelTextOverrides}
        >
          {label}
        </Text>
        {showValue && determinate ? (
          <Text
            element="span"
            data-part="valueText"
            size="sm"
            tone="muted"
            className="ds-progress-bar__value"
            overrides={valueTextOverrides}
          >
            {resolvedValueText}
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
        {...(determinate
          ? { 'aria-valuenow': clamped, 'aria-valuetext': resolvedValueText }
          : { 'aria-busy': true as const })}
      >
        <div
          className="ds-progress-bar__fill"
          data-part="fill"
          style={determinate ? { inlineSize: `${percent}%` } : undefined}
        />
      </div>
      <div className="ds-progress-bar__visually-hidden" role="status" aria-live="polite">
        {liveMessage}
      </div>
    </div>
  );
};
