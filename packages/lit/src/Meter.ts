import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

/** Overridable style hooks; see the `overrides` property. `track`, `fill`, `labelColor` and `valueColor` are locked and excluded. */
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

type MeterOverrides = Partial<Record<MeterOverridableBinding, TokenRef | undefined>>;
type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

/**
 * Bindings realised as a hook on `:host`. The forwarded-only bindings (labelSize, labelWeight,
 * valueSize, fontFamily, lineHeight) have no hook here and the shadow CSS never sets a
 * `--ds-text-*` hook: they reach the composed `ds-text` children only through their `overrides`.
 */
const HOOKS: Partial<Record<MeterOverridableBinding, string>> = {
  trackHeight: '--ds-meter-track-height',
  radius: '--ds-meter-radius',
  partGap: '--ds-meter-part-gap',
  labelGap: '--ds-meter-label-gap',
  transition: '--ds-meter-transition',
};

/** No locale prop: the runtime's default locale formats every percentage, including the "0%" of an invalid range. */
const PERCENT = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

/** The invalid `min`/`max` pairs already reported, so each distinct one warns once. */
const warnedRanges = new Set<string>();

/** A reflected number attribute that is missing, unparseable or non-finite falls back to `fallback`. */
function finite(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Drops unset entries so the composed Text keeps its own defaults, and its `overrides` stays `undefined`. */
function compact(overrides: TextOverrides): TextOverrides | undefined {
  const out: TextOverrides = {};
  for (const key of Object.keys(overrides) as TextOverridableBinding[]) {
    const ref = overrides[key];
    if (ref) out[key] = ref;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * `<ds-meter>` — Meter (category: data, APG pattern: meter).
 *
 * `<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">`
 * renders a label row and a `<div role="meter">` track in its shadow root. The
 * label is a `<ds-text element="span">` referenced by `aria-labelledby`, which
 * resolves within the one shadow root; `data-ds` sits on the root wrapper, a
 * different element from the one carrying the role. `tone`, `value`, `min` and
 * `max` reflect as attributes (numbers as strings, parsed as numbers). Nothing
 * is interactive: no focus, no events, no hover.
 *
 * The fill width is `(value − min) / (max − min)` of the track, clamped to
 * 0–100%; a non-finite `value` is treated as `min`, and a non-finite `min` or
 * `max` as its default (0, 100). When `max ≤ min` the track renders empty,
 * `aria-valuenow` is `min`, the text reads "0%" and a development warning names
 * the bounds once per distinct invalid pair.
 *
 * ## When to use
 *
 * A measurement with a fixed range: storage used, battery, password strength.
 * The consumer sets `tone` from thresholds it owns; the meter just paints. For
 * the progress of a task, use ProgressBar.
 */
@customElement('ds-meter')
export class DsMeter extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-meter-track-height: var(--space-2);
      --ds-meter-radius: var(--radius-full);
      --ds-meter-part-gap: var(--space-1);
      --ds-meter-label-gap: var(--space-2);
      --ds-meter-transition: var(--motion-duration-base);
      /* Locked: out of the overrides type, but still themeable from document CSS. */
      --ds-meter-track: var(--color-background-strong);
      --ds-meter-fill: var(--color-status-info-icon);
      /* locked labelColor / valueColor: declared for the CSS escape hatch and the naming codemod; the
         colours come from the composed Texts' tone="default" / tone="muted" (same tokens), so no rule
         restyles the children */
      --ds-meter-label-color: var(--color-foreground);
      --ds-meter-value-color: var(--color-foreground-muted);
    }
    :host([tone='success']) {
      --ds-meter-fill: var(--color-status-success-icon);
    }
    :host([tone='warning']) {
      --ds-meter-fill: var(--color-status-warning-icon);
    }
    :host([tone='danger']) {
      --ds-meter-fill: var(--color-status-danger-icon);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: vertical gap between the label row and the track */
    [data-part='container'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-meter-part-gap);
      min-inline-size: 0;
    }

    /*
     * labelGap: horizontal gap between the label and the value text. The label wraps onto more
     * lines inside the row; neither text is truncated.
     */
    [data-part='header'] {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-meter-label-gap);
    }

    /* Meter-owned wrappers around the composed Texts: the long label wraps, the value never does. */
    [data-part='label'] {
      flex-shrink: 1;
      min-inline-size: 0;
    }
    [data-part='valueText'] {
      flex-shrink: 0;
    }

    /* track: color.background.strong, locked. Deliberately low-contrast; the text identifies the meter. */
    [data-part='track'] {
      overflow: hidden;
      inline-size: 100%;
      block-size: var(--ds-meter-track-height);
      border-radius: var(--ds-meter-radius);
      background-color: var(--ds-meter-track);
    }

    /* fill: color.status.{tone}.icon, locked — the step guaranteed 3:1 against the page background. */
    [data-part='fill'] {
      block-size: 100%;
      border-radius: var(--ds-meter-radius);
      background-color: var(--ds-meter-fill);
    }

    /* transition: fill width change, with motion.easing.standard; instant under reduced motion. */
    @media (prefers-reduced-motion: no-preference) {
      [data-part='fill'] {
        transition: inline-size var(--ds-meter-transition) var(--motion-easing-standard);
      }
    }
  `;

  /**
   * The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the
   * clamped number too, exact and unrounded (`aria-valuenow="3.14159"`) — only the percentage
   * text is rounded.
   */
  @property({ type: Number, reflect: true }) accessor value: number = 0;

  /** Lower bound of the range. A missing, unparseable or non-finite `min` is treated as 0. */
  @property({ type: Number, reflect: true }) accessor min: number = 0;

  /** Upper bound of the range. Must be greater than `min`. A missing, unparseable or non-finite `max` is treated as 100. */
  @property({ type: Number, reflect: true }) accessor max: number = 100;

  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  @property() accessor label: string = '';

  /**
   * Human-readable value shown at the end of the label row and announced instead of the raw number
   * ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole
   * number ("32%"). Attribute `value-text`, not reflected.
   */
  @property({ attribute: 'value-text' }) accessor valueText: string | undefined;

  /**
   * Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger`
   * from thresholds it owns — the meter does not decide what is "too full".
   */
  @property({ type: String, reflect: true }) accessor tone: MeterTone = 'info';

  /**
   * Hides the visible value text (a boolean attribute can only turn things on, so the flag is the
   * hiding one). The accessible value is always exposed. Attribute `hide-value`, not reflected.
   */
  @property({ type: Boolean, attribute: 'hide-value' }) accessor hideValue: boolean = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (track, fill, labelColor, valueColor) are ignored. */
  @property({ attribute: false }) accessor overrides: MeterOverrides | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Meter');
  }

  /** The exposed range: a non-finite bound is not a range end, so it falls back to the prop's default. */
  private get bounds(): { min: number; max: number; valid: boolean } {
    const min = finite(this.min, 0);
    const max = finite(this.max, 100);
    return { min, max, valid: max > min };
  }

  /** `value` clamped to the range: the accessible value. A non-finite value, and `max ≤ min`, resolve to `min`. */
  get clampedValue(): number {
    const { min, max, valid } = this.bounds;
    if (!valid) return min;
    const value = finite(this.value, min);
    return Math.min(max, Math.max(min, value));
  }

  /** The filled fraction of the track, 0–1. Exact: the rounding is for the text only. */
  get fraction(): number {
    const { min, max, valid } = this.bounds;
    return valid ? (this.clampedValue - min) / (max - min) : 0;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (import.meta.env.DEV) {
      this.warnInvalidRange();
    }
  }

  protected override render(): TemplateResult {
    const { min, max } = this.bounds;
    const fraction = this.fraction;
    const displayed = this.valueText ?? PERCENT.format(fraction);
    const o = this.overrides;

    return html`
      <div part="container" data-part="container">
        <div part="header" data-part="header">
          <span part="label" data-part="label"
            ><ds-text
              id="label"
              element="span"
              size="sm"
              weight="medium"
              tone="default"
              .overrides=${compact({
                fontSize: o?.labelSize,
                fontWeight: o?.labelWeight,
                fontFamily: o?.fontFamily,
                lineHeight: o?.lineHeight,
              })}
              >${this.label}</ds-text
            ></span
          >
          ${this.hideValue
            ? nothing
            : html`<span part="valueText" data-part="valueText"
                ><ds-text
                  element="span"
                  size="sm"
                  tone="muted"
                  .overrides=${compact({
                    fontSize: o?.valueSize,
                    fontFamily: o?.fontFamily,
                    lineHeight: o?.lineHeight,
                  })}
                  >${displayed}</ds-text
                ></span
              >`}
        </div>
        <div
          part="track"
          data-part="track"
          role="meter"
          aria-labelledby="label"
          aria-valuenow=${String(this.clampedValue)}
          aria-valuemin=${String(min)}
          aria-valuemax=${String(max)}
          aria-valuetext=${displayed}
        >
          <div part="fill" data-part="fill" style=${styleMap({ inlineSize: `${fraction * 100}%` })}></div>
        </div>
      </div>
    `;
  }

  /** Developer-facing, never shown to users, and warned once per distinct invalid pair. */
  private warnInvalidRange(): void {
    const { min, max, valid } = this.bounds;
    if (valid) return;
    const pair = `${min}:${max}`;
    if (warnedRanges.has(pair)) return;
    warnedRanges.add(pair);
    console.warn(`Meter: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as MeterOverridableBinding[]) {
      const hook = HOOKS[binding];
      if (hook === undefined) continue;
      const ref = this.overrides?.[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-meter': DsMeter;
  }
}
