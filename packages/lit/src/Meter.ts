import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';

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

const HOOKS: Record<MeterOverridableBinding, string> = {
  trackHeight: '--ds-meter-track-height',
  radius: '--ds-meter-radius',
  labelSize: '--ds-meter-label-size',
  labelWeight: '--ds-meter-label-weight',
  valueSize: '--ds-meter-value-size',
  fontFamily: '--ds-meter-font-family',
  lineHeight: '--ds-meter-line-height',
  partGap: '--ds-meter-part-gap',
  labelGap: '--ds-meter-label-gap',
  transition: '--ds-meter-transition',
};

const PERCENT = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

/** A reflected number attribute that is missing or unparseable falls back to `fallback`. */
function finite(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * `<ds-meter>` — Meter (category: data, APG pattern: meter).
 *
 * `<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">`
 * renders a label row and a `<div role="meter">` track in its shadow root. The
 * label is a `<ds-text element="span">` referenced by `aria-labelledby`, which
 * resolves within the one shadow root. `tone`, `value`, `min` and `max`
 * reflect as attributes (numbers as strings, parsed as numbers). Nothing is
 * interactive: no focus, no events, no hover.
 *
 * The fill width is `(value − min) / (max − min)` of the track, clamped to
 * 0–100%; a non-finite `value` is treated as `min`. When `max ≤ min` the track
 * renders empty, `aria-valuenow` is `min`, and a development warning names the
 * bounds.
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
      --ds-meter-label-size: var(--font-size-sm);
      --ds-meter-label-weight: var(--font-weight-medium);
      --ds-meter-value-size: var(--font-size-sm);
      --ds-meter-font-family: var(--font-family-body);
      --ds-meter-line-height: var(--font-line-height-normal);
      --ds-meter-part-gap: var(--space-1);
      --ds-meter-label-gap: var(--space-2);
      --ds-meter-transition: var(--motion-duration-base);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: vertical gap between the label row and the track */
    [data-part='container'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-meter-part-gap);
    }

    /* labelGap: horizontal gap between the label and the value text */
    [data-part='header'] {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-meter-label-gap);
    }

    /*
     * label and valueText are ds-text elements (labelColor via tone="default", valueColor via tone="muted", both locked).
     * Their bindings arrive through the child's overrides property; the documented --ds-text-* hooks are also set from
     * the meter's hooks so a CSS-level --ds-meter-* override reaches them.
     */
    [data-part='label'] {
      --ds-text-font-size: var(--ds-meter-label-size);
      --ds-text-font-weight: var(--ds-meter-label-weight);
      --ds-text-font-family: var(--ds-meter-font-family);
      --ds-text-line-height: var(--ds-meter-line-height);
    }
    [data-part='valueText'] {
      --ds-text-font-size: var(--ds-meter-value-size);
      --ds-text-font-family: var(--ds-meter-font-family);
      --ds-text-line-height: var(--ds-meter-line-height);
      text-align: end;
    }

    /* track: color.background.strong, locked; the radius clips the fill to the rounded ends */
    [data-part='track'] {
      overflow: hidden;
      block-size: var(--ds-meter-track-height);
      border-radius: var(--ds-meter-radius);
      background: var(--color-background-strong);
    }

    /* fill: color.status.{tone}.icon, locked */
    [data-part='fill'] {
      block-size: 100%;
      background: var(--color-status-info-icon);
    }
    :host([tone='success']) [data-part='fill'] {
      background: var(--color-status-success-icon);
    }
    :host([tone='warning']) [data-part='fill'] {
      background: var(--color-status-warning-icon);
    }
    :host([tone='danger']) [data-part='fill'] {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      [data-part='fill'] {
        transition: inline-size var(--ds-meter-transition) var(--motion-easing-standard);
      }
    }
  `;

  /** The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too. */
  @property({ type: Number, reflect: true }) accessor value: number = 0;

  /** Lower bound of the range. */
  @property({ type: Number, reflect: true }) accessor min: number = 0;

  /** Upper bound of the range. Must be greater than `min`. */
  @property({ type: Number, reflect: true }) accessor max: number = 100;

  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  @property() accessor label: string = '';

  /** Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB"). */
  @property({ attribute: 'value-text' }) accessor valueText: string | undefined;

  /** Fill color. `info` is the neutral brand fill; the consumer sets the others from thresholds it owns. */
  @property({ type: String, reflect: true }) accessor tone: MeterTone = 'info';

  /** Hides the visible value text. The accessible value is always exposed. */
  @property({ type: Boolean, attribute: 'hide-value' }) accessor hideValue: boolean = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (track, fill, labelColor, valueColor) are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<MeterOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Meter');
  }

  private get bounds(): { min: number; max: number; valid: boolean } {
    const min = finite(this.min, 0);
    const max = finite(this.max, 100);
    return { min, max, valid: max > min };
  }

  /** `value` clamped to the range: the accessible value. Non-finite values and `max ≤ min` resolve to `min`. */
  get clampedValue(): number {
    const { min, max, valid } = this.bounds;
    const value = this.value;
    if (!valid || typeof value !== 'number' || !Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  /** The filled fraction of the track, 0–1. */
  get fraction(): number {
    const { min, max, valid } = this.bounds;
    return valid ? (this.clampedValue - min) / (max - min) : 0;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if ((changed.has('min') || changed.has('max')) && import.meta.env.DEV && !this.bounds.valid) {
      console.warn(`<ds-meter> needs max (${this.max}) greater than min (${this.min}); rendering an empty track.`, this);
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
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
          <ds-text
            id="label"
            part="label"
            data-part="label"
            element="span"
            size="sm"
            weight="medium"
            tone="default"
            .overrides=${{
              fontSize: o?.labelSize,
              fontWeight: o?.labelWeight,
              fontFamily: o?.fontFamily,
              lineHeight: o?.lineHeight,
            }}
            >${this.label}</ds-text
          >
          ${this.hideValue
            ? nothing
            : html`<ds-text
                part="valueText"
                data-part="valueText"
                element="span"
                size="sm"
                tone="muted"
                .overrides=${{ fontSize: o?.valueSize, fontFamily: o?.fontFamily, lineHeight: o?.lineHeight }}
                >${displayed}</ds-text
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

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as MeterOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
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
