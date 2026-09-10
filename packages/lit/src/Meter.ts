import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

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
  fontFamily: `--ds-meter-font-family`,
  lineHeight: '--ds-meter-line-height',
  partGap: '--ds-meter-part-gap',
  labelGap: '--ds-meter-label-gap',
  transition: '--ds-meter-transition',
};

/**
 * `<ds-meter>` — Meter (category: data, APG pattern: meter).
 *
 * `<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">`
 * renders a label row and a `<div role="meter">` track in its shadow root,
 * labelled by the shadow label element through `aria-labelledby` (which works
 * within one shadow root). `value`, `min` and `max` reflect as attributes
 * (numbers as strings; converted with `Number`). Nothing is interactive: no
 * focus, no events, no hover.
 *
 * ## When to use
 *
 * Use a Meter for a measurement with a fixed range: storage or quota used,
 * battery, password strength, a score out of ten. Let the consumer decide the
 * tone from thresholds it understands; the meter just paints. Provide
 * `valueText` whenever the raw percentage is not what a person would say. For
 * the progress of a task, use ProgressBar (planned) instead.
 *
 * @csspart container - The wrapper (anatomy: container).
 * @csspart label - The visible label (anatomy: label).
 * @csspart value - The value text (anatomy: valueText).
 * @csspart track - The `role="meter"` track (anatomy: track).
 * @csspart fill - The filled portion (anatomy: fill).
 */
@customElement('ds-meter')
export class DsMeter extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-meter-font-family);
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

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--ds-meter-part-gap);
    }

    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-meter-label-gap);
      line-height: var(--ds-meter-line-height);
    }

    /* labelColor: color.foreground, locked */
    .label {
      font-size: var(--ds-meter-label-size);
      font-weight: var(--ds-meter-label-weight);
      color: var(--color-foreground);
    }

    /* valueColor: color.foreground.muted, locked */
    .value {
      font-size: var(--ds-meter-value-size);
      color: var(--color-foreground-muted);
      text-align: end;
    }

    /* track: color.background.strong, locked; trackHeight, radius clip the fill */
    .track {
      overflow: hidden;
      block-size: var(--ds-meter-track-height);
      border-radius: var(--ds-meter-radius);
      background: var(--color-background-strong);
    }

    /* fill: color.status.{tone}.icon, locked */
    .fill {
      block-size: 100%;
      inline-size: 0;
      border-radius: var(--ds-meter-radius);
      background: var(--color-status-info-icon);
    }
    :host([tone='info']) .fill {
      background: var(--color-status-info-icon);
    }
    :host([tone='success']) .fill {
      background: var(--color-status-success-icon);
    }
    :host([tone='warning']) .fill {
      background: var(--color-status-warning-icon);
    }
    :host([tone='danger']) .fill {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      .fill {
        transition: inline-size var(--ds-meter-transition) var(--motion-easing-standard);
      }
    }
  `;

  /** The current measurement. Clamped to `min`…`max`. */
  @property({ type: Number, reflect: true }) value = 0;

  /** Lower bound of the range. */
  @property({ type: Number, reflect: true }) min = 0;

  /** Upper bound of the range. Must be greater than `min`. */
  @property({ type: Number, reflect: true }) max = 100;

  /** Visible label naming the measurement ("Storage used"). Also the accessible name. */
  @property() label = '';

  /** Human-readable value shown at the end of the label row and announced instead of the raw number. */
  @property({ attribute: 'value-text' }) valueText?: string;

  /** Fill color. `info` is the neutral fill; the consumer sets the others from thresholds it owns. */
  @property({ reflect: true }) tone: MeterTone = 'info';

  /** Hides the visible value text. The accessible value is always exposed. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-value' }) hideValue = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (track, fill, labelColor, valueColor) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<MeterOverridableBinding, TokenRef>>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Meter');
  }

  /** `value` clamped to the range (the accessible value). Non-finite values and `max <= min` resolve to `min`. */
  get clampedValue(): number {
    const min = Number(this.min);
    const max = Number(this.max);
    const value = Number(this.value);
    if (!(max > min) || !Number.isFinite(value)) {
      return min;
    }
    return Math.min(max, Math.max(min, value));
  }

  /** Fill percentage, 0–100. */
  get percent(): number {
    const min = Number(this.min);
    const max = Number(this.max);
    if (!(max > min)) {
      return 0;
    }
    return ((this.clampedValue - min) / (max - min)) * 100;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if ((changed.has('min') || changed.has('max')) && import.meta.env.DEV && !(Number(this.max) > Number(this.min))) {
      console.warn(`<ds-meter> needs max (${this.max}) greater than min (${this.min}).`, this);
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render() {
    const percent = Math.round(this.percent);
    const displayed = this.valueText ?? `${percent}%`;

    return html`
      <div class="container" part="container">
        <div class="row">
          <span id="label" class="label" part="label">${this.label}</span>
          ${this.hideValue ? nothing : html`<span class="value" part="value">${displayed}</span>`}
        </div>
        <div
          class="track"
          part="track"
          role="meter"
          aria-labelledby="label"
          aria-valuenow=${this.clampedValue}
          aria-valuemin=${Number(this.min)}
          aria-valuemax=${Number(this.max)}
          aria-valuetext=${ifDefined(this.valueText)}
        >
          <div class="fill" part="fill" style=${styleMap({ inlineSize: `${percent}%` })}></div>
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
