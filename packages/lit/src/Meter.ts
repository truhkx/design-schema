import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';

export type MeterTone = 'info' | 'success' | 'warning' | 'danger';

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
      font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
      line-height: var(--font-line-height-normal);
    }

    .label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground);
    }

    .value {
      font-size: var(--font-size-sm);
      color: var(--color-foreground-muted);
      text-align: end;
    }

    /* track: color.background.strong, trackHeight, radius.full, clipping the fill */
    .track {
      overflow: hidden;
      block-size: var(--space-2);
      border-radius: var(--radius-full);
      background: var(--color-background-strong);
    }

    /* fill: color.status.{tone}.icon */
    .fill {
      block-size: 100%;
      inline-size: 0;
      border-radius: var(--radius-full);
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
        transition: inline-size var(--motion-duration-base) var(--motion-easing-standard);
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
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-meter': DsMeter;
  }
}
