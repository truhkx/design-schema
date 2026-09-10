import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type ProgressBarTone = 'neutral' | 'success' | 'danger';
export type ProgressBarAnnounce = 'none' | 'milestones' | 'complete';

/** copy.progress */
const COPY_PROGRESS = (label: string, value: string): string => `${label}: ${value}`;
/** copy.complete */
const COPY_COMPLETE = (label: string): string => `${label}: complete`;
/** copy.indeterminate */
const COPY_INDETERMINATE = (label: string): string => `${label}: in progress`;

/** Negates a boolean attribute: `hide-value` present means `showValue` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * Overridable style hooks; see the `overrides` property. `fill`, `fillSuccess`,
 * `fillDanger`, `labelColor` and `valueColor` are locked and excluded.
 */
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

const HOOKS: Record<ProgressBarOverridableBinding, string> = {
  track: '--ds-progress-bar-track',
  trackHeight: '--ds-progress-bar-track-height',
  radius: '--ds-progress-bar-radius',
  labelSize: '--ds-progress-bar-label-size',
  labelWeight: '--ds-progress-bar-label-weight',
  valueSize: '--ds-progress-bar-value-size',
  fontFamily: '--ds-progress-bar-font-family',
  lineHeight: '--ds-progress-bar-line-height',
  partGap: '--ds-progress-bar-part-gap',
  transition: '--ds-progress-bar-transition',
  indeterminateLoop: '--ds-progress-bar-indeterminate-loop',
};

/**
 * `<ds-progress-bar>` — ProgressBar (category: feedback, APG pattern: progressbar).
 *
 * `<ds-progress-bar label="Uploading photos" value="42">` renders a label row
 * (label and, when `showValue`, the formatted value, both `<ds-text>`), a
 * track and fill in its shadow root. `role="progressbar"` and
 * `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-valuetext` are set on
 * the host as plain attributes — not through `ElementInternals` — because the
 * accessible-name/value computation the test suite uses only sees real
 * attributes, though real assistive tech reads either. Omitting `value`
 * renders an indeterminate sweep and sets `aria-busy="true"` instead of
 * `aria-valuenow`. A visually-hidden `aria-live="polite"` region in the
 * shadow root announces `copy.progress` / `copy.complete` / `copy.indeterminate`
 * per `announce`. The bar itself is never focusable.
 *
 * ## When to use
 *
 * Use a ProgressBar for a task the interface started and can see through to
 * the end: uploads, downloads, imports, a wizard's overall completion. Give
 * it `value` whenever the total is known; use the indeterminate form only
 * until the total is known. Set `announce: milestones` for long tasks the
 * user may leave and come back to; `complete` (the default) is right for
 * anything under a minute. For a measured quantity that can go up or down,
 * use Meter instead.
 *
 * @csspart container - The wrapper (anatomy: container).
 * @csspart label - The visible label (anatomy: label).
 * @csspart valueText - The value text (anatomy: valueText).
 * @csspart track - The track (anatomy: track).
 * @csspart fill - The filled portion (anatomy: fill).
 */
@customElement('ds-progress-bar')
export class DsProgressBar extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-progress-bar-font-family);
      --ds-progress-bar-track: var(--color-background-strong);
      --ds-progress-bar-track-height: var(--space-2);
      --ds-progress-bar-radius: var(--radius-full);
      --ds-progress-bar-label-size: var(--font-size-sm);
      --ds-progress-bar-label-weight: var(--font-weight-medium);
      --ds-progress-bar-value-size: var(--font-size-sm);
      --ds-progress-bar-font-family: var(--font-family-body);
      --ds-progress-bar-line-height: var(--font-line-height-normal);
      --ds-progress-bar-part-gap: var(--space-1);
      --ds-progress-bar-transition: var(--motion-duration-base);
      --ds-progress-bar-indeterminate-loop: var(--motion-duration-loop);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
    }

    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
      line-height: var(--ds-progress-bar-line-height);
    }

    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* track: color.background.strong */
    .track {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground, locked (neutral fill) */
    .fill {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon, locked */
    :host([tone='success']) .fill {
      background: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon, locked */
    :host([tone='danger']) .fill {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      .fill:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop: a fill one third of the track width sweeping start to end, repeating */
      .fill.indeterminate {
        inline-size: 33.333%;
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop) linear infinite;
      }
      @keyframes ds-progress-bar-sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(300%);
        }
      }
    }

    /* Reduced motion: no sweep at all — a static, half-opacity track instead. */
    @media (prefers-reduced-motion: reduce) {
      .fill.indeterminate {
        display: none;
      }
      .track.indeterminate {
        opacity: var(--opacity-disabled);
      }
    }
  `;

  /** What is progressing ("Uploading photos"). The accessible name, visible unless `hideLabel`. */
  @property() label = '';

  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar. */
  @property({ type: Number }) value?: number;

  /** Start of the range. */
  @property({ type: Number }) min = 0;

  /** End of the range. */
  @property({ type: Number }) max = 100;

  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage of `max`. */
  @property({ attribute: false }) formatValue?: (value: number, max: number) => string;

  /** Show the value text beside the label. Ignored when indeterminate. Exposed as the negated `hide-value` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  @property({ attribute: 'hide-value', converter: NEGATED_BOOLEAN_CONVERTER })
  showValue = true;

  /** Visually hides the label; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-label' }) hideLabel = false;

  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. */
  @property({ reflect: true }) tone: ProgressBarTone = 'neutral';

  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  @property({ reflect: true }) announce: ProgressBarAnnounce = 'complete';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (fill, fillSuccess, fillDanger, labelColor, valueColor) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<ProgressBarOverridableBinding, TokenRef>>;

  /** Text of the last announcement made to the live region. */
  @state() private liveMessage = '';

  /** Highest 25%-tier (0/25/50/75/100) already announced, for `announce: milestones`. */
  private announcedMilestone = 0;

  /** Whether `copy.complete` has already been announced for the current run. */
  private announcedComplete = false;

  /** Whether `copy.indeterminate` has already been announced for the current indeterminate run. */
  private announcedIndeterminate = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ProgressBar');
    this.setAttribute('role', 'progressbar');
  }

  /** Whether `value` is omitted (the end of the task is unknown). */
  get isIndeterminate(): boolean {
    return this.value === undefined;
  }

  /** `value` clamped to `min`…`max`. `min` when indeterminate, non-finite, or `max <= min`. */
  get clampedValue(): number {
    const min = Number(this.min);
    const max = Number(this.max);
    const value = Number(this.value);
    if (this.isIndeterminate || !(max > min) || !Number.isFinite(value)) {
      return min;
    }
    return Math.min(max, Math.max(min, value));
  }

  /** Fill percentage, 0–100. 0 when indeterminate. */
  get percent(): number {
    if (this.isIndeterminate) {
      return 0;
    }
    const min = Number(this.min);
    const max = Number(this.max);
    if (!(max > min)) {
      return 0;
    }
    return ((this.clampedValue - min) / (max - min)) * 100;
  }

  /** The formatted value text, from `formatValue` or the default percentage of `max`. */
  get displayText(): string {
    const max = Number(this.max);
    if (this.formatValue) {
      return this.formatValue(this.clampedValue, max);
    }
    const ratio = max !== 0 ? this.clampedValue / max : 0;
    return `${Math.round(ratio * 100)}%`;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    this.warnInDev(changed);
  }

  protected override updated(): void {
    this.syncHostAria();
    this.updateAnnouncements();
  }

  protected override render() {
    const indeterminate = this.isIndeterminate;

    return html`
      <div class="container" part="container">
        <div class="row">
          <ds-text
            part="label"
            size="sm"
            weight="medium"
            class=${classMap({ 'visually-hidden': this.hideLabel })}
            .overrides=${this.labelTextOverrides}
            >${this.label}</ds-text
          >
          ${this.showValue && !indeterminate
            ? html`<ds-text part="valueText" size="sm" tone="muted" .overrides=${this.valueTextOverrides}
                >${this.displayText}</ds-text
              >`
            : nothing}
        </div>
        <div class=${classMap({ track: true, indeterminate })} part="track">
          <div
            class=${classMap({ fill: true, indeterminate })}
            part="fill"
            style=${indeterminate ? nothing : styleMap({ inlineSize: `${this.percent}%` })}
          ></div>
        </div>
        <div class="visually-hidden" aria-live="polite">${this.liveMessage}</div>
      </div>
    `;
  }

  /** `role`/`aria-value*` as plain host attributes — see the class doc for why not `ElementInternals`. */
  private syncHostAria(): void {
    this.setAttribute('aria-valuemin', String(Number(this.min)));
    this.setAttribute('aria-valuemax', String(Number(this.max)));
    if (this.label) {
      this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
    }
    if (this.isIndeterminate) {
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuetext');
      this.setAttribute('aria-busy', 'true');
    } else {
      this.setAttribute('aria-valuenow', String(this.clampedValue));
      this.setAttribute('aria-valuetext', this.displayText);
      this.removeAttribute('aria-busy');
    }
  }

  /** Drives the live region from `announce`, per `copy.progress` / `copy.complete` / `copy.indeterminate`. */
  private updateAnnouncements(): void {
    if (this.announce === 'none') {
      return;
    }
    if (this.isIndeterminate) {
      this.announcedMilestone = 0;
      this.announcedComplete = false;
      if (!this.announcedIndeterminate) {
        this.announcedIndeterminate = true;
        this.liveMessage = COPY_INDETERMINATE(this.label);
      }
      return;
    }
    this.announcedIndeterminate = false;

    const percent = this.percent;
    if (percent >= 100) {
      this.announcedMilestone = 100;
      if (!this.announcedComplete) {
        this.announcedComplete = true;
        this.liveMessage = COPY_COMPLETE(this.label);
      }
      return;
    }
    this.announcedComplete = false;

    if (this.announce !== 'milestones') {
      return;
    }
    const tier = Math.floor(percent / 25) * 25;
    if (tier !== this.announcedMilestone) {
      this.announcedMilestone = tier;
      if (tier > 0) {
        this.liveMessage = COPY_PROGRESS(this.label, this.displayText);
      }
    }
  }

  private get labelTextOverrides(): Partial<Record<TextOverridableBinding, TokenRef>> {
    const result: Partial<Record<TextOverridableBinding, TokenRef>> = {};
    if (this.overrides?.fontFamily) {
      result.fontFamily = this.overrides.fontFamily;
    }
    if (this.overrides?.labelSize) {
      result.fontSize = this.overrides.labelSize;
    }
    if (this.overrides?.labelWeight) {
      result.fontWeight = this.overrides.labelWeight;
    }
    return result;
  }

  private get valueTextOverrides(): Partial<Record<TextOverridableBinding, TokenRef>> {
    const result: Partial<Record<TextOverridableBinding, TokenRef>> = {};
    if (this.overrides?.fontFamily) {
      result.fontFamily = this.overrides.fontFamily;
    }
    if (this.overrides?.valueSize) {
      result.fontSize = this.overrides.valueSize;
    }
    return result;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ProgressBarOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(changed: PropertyValues): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if ((changed.has('min') || changed.has('max')) && !(Number(this.max) > Number(this.min))) {
      console.warn(`<ds-progress-bar> needs max (${this.max}) greater than min (${this.min}).`, this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-progress-bar': DsProgressBar;
  }
}
