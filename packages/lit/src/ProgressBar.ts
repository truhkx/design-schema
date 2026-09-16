import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Stack.js';
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

/** Milestone step for `announce: milestones`, as a percentage of the range. */
const MILESTONE_STEP = 25;

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
 * `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-valuetext` are plain
 * attributes on the host — not `ElementInternals` — because the
 * accessible-value tooling reads attributes. Omitting `value` renders an
 * indeterminate sweep and sets `aria-busy="true"` instead of `aria-valuenow`.
 * A visually-hidden `role="status" aria-live="polite"` region in the shadow
 * root announces `copy.progress` / `copy.complete` / `copy.indeterminate` per
 * `announce`. The bar itself is never focusable.
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
 */
@customElement('ds-progress-bar')
export class DsProgressBar extends LitElement {
  static override styles: CSSResult = css`
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

    /* partGap: space.1 between the label row and the track */
    [data-part='container'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
      line-height: var(--ds-progress-bar-line-height);
    }

    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern */
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

    /* track: color.background.strong; trackHeight: space.2; radius: radius.full */
    [data-part='track'] {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground (locked) */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon (locked) */
    :host([tone='success']) [data-part='fill'] {
      background: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon (locked) */
    :host([tone='danger']) [data-part='fill'] {
      background: var(--color-status-danger-icon);
    }

    @media (prefers-reduced-motion: no-preference) {
      /* transition: fill width change over motion.duration.base */
      [data-part='fill']:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop: a one-third-width fill travelling start to end, repeating */
      [data-part='fill'].indeterminate {
        inline-size: calc(100% / 3);
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop) linear infinite;
      }
      :host(:dir(rtl)) [data-part='fill'].indeterminate {
        animation-name: ds-progress-bar-sweep-rtl;
      }
      @keyframes ds-progress-bar-sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(300%);
        }
      }
      @keyframes ds-progress-bar-sweep-rtl {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(-300%);
        }
      }
    }

    /* Reduced motion: no sweep — a static, half-opacity track (opacity.disabled). */
    @media (prefers-reduced-motion: reduce) {
      [data-part='fill'].indeterminate {
        display: none;
      }
      [data-part='track'].indeterminate {
        opacity: var(--opacity-disabled);
      }
    }
  `;

  /** What is progressing ("Uploading photos", "Importing contacts"). The accessible name; visible unless `hideLabel`. */
  @property({ type: String }) accessor label = '';

  /** Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown). */
  @property({ type: Number }) accessor value: number | undefined;

  /** Start of the range. */
  @property({ type: Number }) accessor min = 0;

  /** End of the range. */
  @property({ type: Number }) accessor max = 100;

  /** Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range. */
  @property({ attribute: false }) accessor formatValue: ((value: number, min: number, max: number) => string) | undefined;

  /** Show the value text beside the label. Ignored when indeterminate. Exposed as the negated `hide-value` attribute. */
  @property({ attribute: 'hide-value', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor showValue = true;

  /** Visually hide the label (it remains the accessible name). */
  @property({ type: Boolean, reflect: true, attribute: 'hide-label' }) accessor hideLabel = false;

  /** Neutral while running; `success` at completion, `danger` when the task failed part-way. Recolors the fill only. */
  @property({ type: String, reflect: true }) accessor tone: ProgressBarTone = 'neutral';

  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  @property({ type: String, reflect: true }) accessor announce: ProgressBarAnnounce = 'complete';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>> | undefined;

  /** Text currently in the live region. */
  @state() private accessor liveMessage = '';

  /** Highest milestone tier (0, 25, 50, 75) already announced in this run. */
  private announcedTier = 0;

  /** Whether `copy.complete` has been announced in this run. */
  private announcedComplete = false;

  /** Whether the bar was indeterminate at the last update (`undefined` before the first). */
  private wasIndeterminate: boolean | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ProgressBar');
    this.setAttribute('role', 'progressbar');
  }

  /** Whether `value` is omitted (the end of the task is unknown). */
  get isIndeterminate(): boolean {
    return this.value === undefined || this.value === null || Number.isNaN(Number(this.value));
  }

  /** Whether `min`…`max` is a range at all. */
  private get isRange(): boolean {
    return Number(this.max) > Number(this.min);
  }

  /** `value` clamped to `min`…`max`; `min` when indeterminate or not a range. */
  get clampedValue(): number {
    const min = Number(this.min);
    if (this.isIndeterminate || !this.isRange) {
      return min;
    }
    return Math.min(Number(this.max), Math.max(min, Number(this.value)));
  }

  /** Fill fraction as a percentage, `(value − min) / (max − min)`; 0 when indeterminate or not a range. */
  get percent(): number {
    if (this.isIndeterminate || !this.isRange) {
      return 0;
    }
    const min = Number(this.min);
    return ((this.clampedValue - min) / (Number(this.max) - min)) * 100;
  }

  /** The value text, from `formatValue` or the default percentage over the range. */
  get displayText(): string {
    if (this.formatValue) {
      return this.formatValue(this.clampedValue, Number(this.min), Number(this.max));
    }
    return `${Math.round(this.percent)}%`;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (import.meta.env.DEV && (changed.has('min') || changed.has('max')) && !this.isRange) {
      console.warn(`<ds-progress-bar> needs max (${this.max}) greater than min (${this.min}); the bar renders empty.`, this);
    }
    this.updateAnnouncements();
  }

  protected override updated(): void {
    this.syncHostAria();
  }

  protected override render(): TemplateResult {
    const indeterminate = this.isIndeterminate;
    return html`
      <div data-part="container" part="container">
        <ds-stack direction="horizontal" justify="between" align="center" gap="tight">
          <span class=${classMap({ 'visually-hidden': this.hideLabel })}>
            <ds-text
              data-part="label"
              part="label"
              element="span"
              size="sm"
              weight="medium"
              .overrides=${this.textOverrides('labelSize', 'labelWeight')}
              >${this.label}</ds-text
            >
          </span>
          ${this.showValue && !indeterminate
            ? html`<ds-text
                data-part="valueText"
                part="valueText"
                element="span"
                size="sm"
                tone="muted"
                .overrides=${this.textOverrides('valueSize')}
                >${this.displayText}</ds-text
              >`
            : nothing}
        </ds-stack>
        <div data-part="track" part="track" class=${classMap({ indeterminate })}>
          <div
            data-part="fill"
            part="fill"
            class=${classMap({ indeterminate })}
            style=${indeterminate ? nothing : styleMap({ inlineSize: `${this.percent}%` })}
          ></div>
        </div>
        <div class="visually-hidden" role="status" aria-live="polite">${this.liveMessage}</div>
      </div>
    `;
  }

  /** `aria-*` as plain host attributes, written only when they change. */
  private syncHostAria(): void {
    const indeterminate = this.isIndeterminate;
    this.setOrRemove('aria-label', this.label || null);
    this.setOrRemove('aria-valuemin', String(Number(this.min)));
    this.setOrRemove('aria-valuemax', String(Number(this.max)));
    this.setOrRemove('aria-valuenow', indeterminate ? null : String(this.clampedValue));
    this.setOrRemove('aria-valuetext', indeterminate ? null : this.displayText);
    this.setOrRemove('aria-busy', indeterminate ? 'true' : null);
  }

  private setOrRemove(name: string, value: string | null): void {
    if (value === null) {
      if (this.hasAttribute(name)) this.removeAttribute(name);
    } else if (this.getAttribute(name) !== value) {
      this.setAttribute(name, value);
    }
  }

  /**
   * Drives the live region per `announce`: `copy.indeterminate` once each time
   * the bar becomes indeterminate, `copy.progress` at each new 25% tier
   * (milestones), `copy.complete` once on reaching `max`. A value that moves
   * backward resets the tiers above it, so a retried task announces again.
   */
  private updateAnnouncements(): void {
    const indeterminate = this.isIndeterminate;
    const entered = indeterminate && this.wasIndeterminate !== true;
    this.wasIndeterminate = indeterminate;

    if (indeterminate) {
      this.announcedTier = 0;
      this.announcedComplete = false;
      if (entered && this.announce !== 'none') {
        this.liveMessage = COPY_INDETERMINATE(this.label);
      }
      return;
    }

    const percent = this.percent;
    const complete = this.isRange && percent >= 100;
    const tier = complete ? 100 : Math.floor(percent / MILESTONE_STEP) * MILESTONE_STEP;

    if (!complete) {
      this.announcedComplete = false;
    }
    if (tier < this.announcedTier) {
      this.announcedTier = tier;
    }
    if (this.announce === 'none') {
      this.announcedTier = Math.max(this.announcedTier, tier);
      this.announcedComplete = complete;
      return;
    }

    if (complete) {
      this.announcedTier = 100;
      if (!this.announcedComplete) {
        this.announcedComplete = true;
        this.liveMessage = COPY_COMPLETE(this.label);
      }
      return;
    }

    if (this.announce === 'milestones' && tier > this.announcedTier) {
      this.announcedTier = tier;
      this.liveMessage = COPY_PROGRESS(this.label, this.displayText);
    }
  }

  private textOverrides(
    size: 'labelSize' | 'valueSize',
    weight?: 'labelWeight',
  ): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    const o = this.overrides;
    const result: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    if (o?.fontFamily) result.fontFamily = o.fontFamily;
    if (o?.lineHeight) result.lineHeight = o.lineHeight;
    if (o?.[size]) result.fontSize = o[size];
    if (weight && o?.[weight]) result.fontWeight = o[weight];
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
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-progress-bar': DsProgressBar;
  }
}
