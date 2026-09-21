import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { keyed } from 'lit/directives/keyed.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type ProgressBarTone = 'neutral' | 'success' | 'danger';
export type ProgressBarAnnounce = 'none' | 'milestones' | 'complete';

/** Announcement copy, used verbatim. `{label}` and `{value}` are the only parameters. */
const COPY = {
  progress: '{label}: {value}',
  complete: '{label}: complete',
  indeterminate: '{label}: in progress',
} as const;

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => params[key] ?? match);
}

/** No locale prop: the runtime's default locale formats every percentage, including the "0%" of an invalid range. */
const PERCENT = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });

/** The same arithmetic the fill uses, so a non-zero `min` reads correctly without a custom formatter. */
function defaultFormatValue(value: number, min: number, max: number): string {
  return PERCENT.format(max > min ? (value - min) / (max - min) : 0);
}

/** Announcement tiers: `floor(fraction × TIERS)`; tier `TIERS` is `max`. */
const TIERS = 4;

/** A missing, unparseable or non-finite number is not a range end: it falls back to the prop's default. */
function finite(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** The invalid `min`/`max` pairs already reported, so each distinct one warns once. */
const warnedRanges = new Set<string>();

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
  | 'labelGap'
  | 'transition'
  | 'indeterminateLoop'
  | 'sweepEasing';

type ProgressBarOverrides = Partial<Record<ProgressBarOverridableBinding, TokenRef | undefined>>;
type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

/**
 * Bindings realised as a hook on `:host`. The forwarded-only bindings (labelSize, labelWeight,
 * valueSize, fontFamily, lineHeight) have no hook here and the shadow CSS never sets a
 * `--ds-text-*` hook: they reach the composed `ds-text` children only through their `overrides`,
 * since nothing in the shadow root could read a hook without restyling the child.
 */
const HOOKS: Partial<Record<ProgressBarOverridableBinding, string>> = {
  track: '--ds-progress-bar-track',
  trackHeight: '--ds-progress-bar-track-height',
  radius: '--ds-progress-bar-radius',
  partGap: '--ds-progress-bar-part-gap',
  labelGap: '--ds-progress-bar-label-gap',
  transition: '--ds-progress-bar-transition',
  indeterminateLoop: '--ds-progress-bar-indeterminate-loop',
  sweepEasing: '--ds-progress-bar-sweep-easing',
};

/** Drops unset entries so the composed Text keeps its own defaults, and its `overrides` stays `undefined`. */
function compact(overrides: TextOverrides): TextOverrides | undefined {
  const out: TextOverrides = {};
  for (const key of Object.keys(overrides) as TextOverridableBinding[]) {
    const ref = overrides[key];
    if (ref) out[key] = ref;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** What the bar has already announced. Tiers are recorded for every `announce` value, including `none`. */
interface AnnounceRecord {
  mounted: boolean;
  indeterminate: boolean;
  validRange: boolean;
  tier: number;
  complete: boolean;
}

/**
 * `<ds-progress-bar>` — ProgressBar (category: feedback, APG pattern: progressbar).
 *
 * `<ds-progress-bar label="Uploading photos" value="42">` renders a header row
 * (the label and, when `showValue` and determinate, the formatted value, both
 * `<ds-text>`), then a track and fill in its shadow root. `role="progressbar"`,
 * `aria-label` (from `label`) and `aria-valuemin`/`aria-valuemax`/
 * `aria-valuenow`/`aria-valuetext` are plain attributes on the host — not
 * `ElementInternals` — because the accessible-value tooling reads attributes,
 * and `aria-labelledby` cannot reach the label inside the shadow root.
 * Omitting `value` renders an indeterminate sweep and sets `aria-busy="true"`
 * instead of `aria-valuenow`/`aria-valuetext`. A visually-hidden
 * `role="status" aria-live="polite"` region in the shadow root announces
 * `copy.progress` / `copy.complete` / `copy.indeterminate` per `announce`; it is
 * not an anatomy part and takes no `part`. The bar itself is never focusable.
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
      --ds-progress-bar-track: var(--color-background-strong);
      --ds-progress-bar-track-height: var(--space-2);
      --ds-progress-bar-radius: var(--radius-full);
      --ds-progress-bar-part-gap: var(--space-1);
      --ds-progress-bar-label-gap: var(--space-2);
      --ds-progress-bar-transition: var(--motion-duration-base);
      --ds-progress-bar-indeterminate-loop: var(--motion-duration-loop);
      --ds-progress-bar-sweep-easing: var(--motion-easing-standard);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: space.1 between the label row and the track */
    [data-part='container'] {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--ds-progress-bar-part-gap);
      min-inline-size: 0;
    }

    /* labelGap: space.2 between the label (inline start) and the value text (inline end) */
    [data-part='header'] {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-progress-bar-label-gap);
    }

    /* hideLabel with visible value text: the hidden label leaves the flow, the value text stays at the end. */
    [data-part='header'].label-hidden {
      justify-content: flex-end;
    }

    /* track: color.background.strong; trackHeight: space.2; radius: radius.full (the track clips the fill) */
    [data-part='track'] {
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      inline-size: 100%;
      block-size: var(--ds-progress-bar-track-height);
      border-radius: var(--ds-progress-bar-radius);
      background-color: var(--ds-progress-bar-track);
    }

    /* fill: color.control.selectedBackground, locked — the color guaranteed 3:1 against the page. */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: 0;
      border-radius: var(--ds-progress-bar-radius);
      background-color: var(--color-control-selected-background);
    }
    /* fillSuccess: color.status.success.icon, locked */
    :host([tone='success']) [data-part='fill'] {
      background-color: var(--color-status-success-icon);
    }
    /* fillDanger: color.status.danger.icon, locked */
    :host([tone='danger']) [data-part='fill'] {
      background-color: var(--color-status-danger-icon);
    }

    /* The sweeping fill is one third of the track: geometry, not a token. */
    [data-part='fill'].indeterminate {
      inline-size: calc(100% / 3);
    }

    /* transition: fill inline-size change over motion.duration.base with motion.easing.standard. */
    @media (prefers-reduced-motion: no-preference) {
      [data-part='fill']:not(.indeterminate) {
        transition: inline-size var(--ds-progress-bar-transition) var(--motion-easing-standard);
      }

      /* indeterminateLoop + sweepEasing: the fill travels from wholly before the track to wholly after it. */
      [data-part='fill'].indeterminate {
        animation: ds-progress-bar-sweep var(--ds-progress-bar-indeterminate-loop)
          var(--ds-progress-bar-sweep-easing) infinite;
      }
      :host(:dir(rtl)) [data-part='fill'].indeterminate {
        animation-name: ds-progress-bar-sweep-rtl;
      }
    }

    /* Reduced motion: no sweep — the fill is static and full-width at opacity.disabled, keeping its tone. */
    @media (prefers-reduced-motion: reduce) {
      [data-part='fill'].indeterminate {
        inline-size: 100%;
        opacity: var(--opacity-disabled);
      }
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

    /* Visually hidden: the hidden label, the empty header row, and the live region. */
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
  `;

  /**
   * What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`, and
   * always the accessible name, mirrored to `aria-label` on the host. An empty label removes
   * `aria-label` and leaves the bar unnamed, with no development warning.
   */
  @property({ type: String }) accessor label: string = '';

  /**
   * Progress so far, between `min` and `max`. Omit (undefined or null) for an indeterminate bar (the
   * end is unknown). Clamped to `min`…`max` for the fill, the accessible value, `formatValue`'s
   * argument and the announcement tiers; a non-finite number (NaN, Infinity) is treated as `min`.
   */
  @property({ type: Number }) accessor value: number | null | undefined;

  /** Start of the range. A non-finite number is treated as the default, 0. */
  @property({ type: Number }) accessor min: number = 0;

  /** End of the range. A non-finite number is treated as the default, 100. */
  @property({ type: Number }) accessor max: number = 100;

  /**
   * Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage over the whole range —
   * `(value − min) / (max − min)`, the same arithmetic the fill uses, so a non-zero `min` reads
   * correctly without a custom formatter — rounded to a whole number in the runtime's default locale
   * (there is no locale prop), so 99.5% of the way shows "100%" before completion; completion is only
   * the clamped value reaching `max`. Called with the clamped value. Rounding is for the text only;
   * the fill uses the exact fraction. A `max` at or below `min` is not a range: the bar renders empty,
   * exposes `min` as its value with the given bounds, shows and exposes "0%" unless a custom formatter
   * says otherwise, makes no progress or completion announcements, and warns in development.
   */
  @property({ attribute: false })
  accessor formatValue: ((value: number, min: number, max: number) => string) | undefined;

  /**
   * Show the value text at the end of the label row. Ignored when indeterminate. A boolean attribute
   * can only turn things on, so the attribute is the negated `hide-value` (reflected).
   */
  @property({ attribute: 'hide-value', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor showValue: boolean = true;

  /**
   * Visually hide the label (it remains the accessible name), for bars inside a Card whose heading
   * already says what is happening. The value text, when shown, stays at the inline end of the row;
   * with no visible value text either the row takes no space, but the header element stays so the
   * `label` part still has a home.
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-label' }) accessor hideLabel: boolean = false;

  /**
   * Neutral while running; `success` at completion, `danger` when the task failed part-way. Recolors
   * the fill only — the colour is never the only signal, so pair it with a text status elsewhere.
   */
  @property({ type: String, reflect: true }) accessor tone: ProgressBarTone = 'neutral';

  /** What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. */
  @property({ type: String, reflect: true }) accessor announce: ProgressBarAnnounce = 'complete';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: ProgressBarOverrides | undefined;

  /** Text currently in the live region. */
  @state() private accessor liveMessage: string = '';

  /** Bumped per announcement so the message node is replaced, and a repeated text is read again. */
  @state() private accessor liveSeq: number = 0;

  private record: AnnounceRecord = {
    mounted: false,
    indeterminate: false,
    validRange: false,
    tier: 0,
    complete: false,
  };

  /** An announcement made before the first render, spoken once the live region has rendered empty. */
  private pendingMessage: string | undefined;

  private frame = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ProgressBar');
    this.setAttribute('role', 'progressbar');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    cancelAnimationFrame(this.frame);
  }

  /** Whether `value` is omitted (the end of the task is unknown). */
  get isIndeterminate(): boolean {
    return this.value === undefined || this.value === null;
  }

  /** The exposed range: a non-finite bound falls back to the prop's default, and `max ≤ min` is not a range. */
  private get bounds(): { min: number; max: number; valid: boolean } {
    const min = finite(this.min, 0);
    const max = finite(this.max, 100);
    return { min, max, valid: max > min };
  }

  /** `value` clamped to `min`…`max`: the accessible value. Indeterminate, non-finite or not a range resolve to `min`. */
  get clampedValue(): number {
    const { min, max, valid } = this.bounds;
    if (this.isIndeterminate || !valid) return min;
    return Math.min(max, Math.max(min, finite(this.value, min)));
  }

  /** The filled fraction, `(value − min) / (max − min)`. Exact: the rounding is for the text only. */
  get fraction(): number {
    const { min, max, valid } = this.bounds;
    if (this.isIndeterminate || !valid) return 0;
    return (this.clampedValue - min) / (max - min);
  }

  /** The value text — the same string as `aria-valuetext` and as `{value}` in an announcement. */
  get displayText(): string {
    const { min, max } = this.bounds;
    return (this.formatValue ?? defaultFormatValue)(this.clampedValue, min, max);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (import.meta.env.DEV) {
      this.warnInvalidRange();
    }
    if (!this.hasUpdated || changed.has('value') || changed.has('min') || changed.has('max')) {
      this.updateAnnouncements();
    }
  }

  protected override firstUpdated(): void {
    const message = this.pendingMessage;
    if (message === undefined) return;
    this.pendingMessage = undefined;
    // Text already in a newly inserted region is often not read, so the first message waits a frame,
    // by which time the live region has rendered empty.
    this.frame = requestAnimationFrame(() => this.emit(message));
  }

  protected override updated(): void {
    this.syncHostAria();
  }

  protected override render(): TemplateResult {
    const indeterminate = this.isIndeterminate;
    const showValueText = this.showValue && !indeterminate;
    const o = this.overrides;
    const labelText = html`<ds-text
      part="label"
      data-part="label"
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
    >`;

    return html`
      <div part="container" data-part="container">
        <!-- With nothing visible in it the row takes no space, but the header element stays with its
             data-part and the label inside it; with only the value text visible it aligns to the end. -->
        <div
          part="header"
          data-part="header"
          class=${classMap({
            'visually-hidden': this.hideLabel && !showValueText,
            'label-hidden': this.hideLabel && showValueText,
          })}
        >
          ${this.hideLabel && showValueText
            ? html`<span class="visually-hidden">${labelText}</span>`
            : labelText}
          ${showValueText
            ? html`<ds-text
                part="valueText"
                data-part="valueText"
                element="span"
                size="sm"
                tone="muted"
                .overrides=${compact({
                  fontSize: o?.valueSize,
                  fontFamily: o?.fontFamily,
                  lineHeight: o?.lineHeight,
                })}
                >${this.displayText}</ds-text
              >`
            : nothing}
        </div>
        <div part="track" data-part="track">
          <div
            part="fill"
            data-part="fill"
            class=${classMap({ indeterminate })}
            style=${indeterminate ? nothing : styleMap({ inlineSize: `${this.fraction * 100}%` })}
          ></div>
        </div>
        <!-- Not an anatomy part: the bar is never focusable, so progress is learned from here. -->
        <div class="visually-hidden" role="status" aria-live="polite">
          ${this.liveMessage ? keyed(this.liveSeq, html`<span>${this.liveMessage}</span>`) : nothing}
        </div>
      </div>
    `;
  }

  /**
   * `role` and the `aria-*` values as plain host attributes, written only when they change — an
   * unconditional write would queue a mutation record for anything observing the host.
   */
  private syncHostAria(): void {
    const { min, max } = this.bounds;
    const indeterminate = this.isIndeterminate;
    this.setOrRemove('aria-label', this.label || null);
    this.setOrRemove('aria-valuemin', String(min));
    this.setOrRemove('aria-valuemax', String(max));
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
   * The announcement rules. Tiers are `floor(fraction × 4)` (74.6% is tier 2, 75% is tier 3; tier 4
   * is `max`) and recorded for every `announce` value, so switching it mid-task never replays them.
   * The state reached at mount — and the one reached when an invalid range becomes valid — is
   * recorded silently; entering the indeterminate state resets the record and is announced once.
   * `milestones` announces the highest newly entered tier 1–3 with `copy.progress`; reaching `max`
   * announces `copy.complete`, never `copy.progress` with "100%". A lower tier resets the record, so
   * a retried task announces its progress again on the way up.
   */
  private updateAnnouncements(): void {
    const r = this.record;
    const firstRun = !r.mounted;
    r.mounted = true;
    const { max, valid } = this.bounds;

    if (this.isIndeterminate) {
      // Tracked even while indeterminate, so a value arriving later is not mistaken for entering the range.
      r.validRange = valid;
      if (firstRun || !r.indeterminate) {
        r.indeterminate = true;
        // Entering the state resets the record: the first known value afterwards announces its tier
        // under `milestones`, and completion is armed again.
        r.tier = 0;
        r.complete = false;
        if (this.announce !== 'none') this.say(COPY.indeterminate);
      }
      return;
    }
    r.indeterminate = false;

    const enteredRange = valid && !r.validRange;
    r.validRange = valid;
    // With `max` at or below `min` nothing is announced and no tier is recorded.
    if (!valid) return;

    const tier = Math.floor(this.fraction * TIERS);
    const complete = this.clampedValue >= max;

    // Progress reached at mount (or when the range becomes valid) is recorded silently.
    if (firstRun || enteredRange) {
      r.tier = tier;
      r.complete = complete;
      return;
    }

    // Moving backward re-arms the tiers above the new one, and dropping below `max` re-arms completion.
    if (tier < r.tier) r.tier = tier;
    if (!complete) r.complete = false;

    if (complete && !r.complete) {
      r.complete = true;
      r.tier = tier;
      if (this.announce !== 'none') this.say(COPY.complete);
      return;
    }
    if (tier > r.tier) {
      // An update crossing several tiers makes one announcement, for the highest.
      r.tier = tier;
      if (this.announce === 'milestones') this.say(COPY.progress);
    }
  }

  /** `{value}` is the formatted value text — the same string as `aria-valuetext` — never the raw number. */
  private say(template: string): void {
    const message = interpolate(template, {
      label: this.label,
      value: this.isIndeterminate ? '' : this.displayText,
    });
    if (this.hasUpdated) {
      this.emit(message);
    } else {
      this.pendingMessage = message;
    }
  }

  private emit(message: string): void {
    this.liveMessage = message;
    this.liveSeq += 1;
  }

  /** Developer-facing, never shown to users, and warned once per distinct invalid pair. */
  private warnInvalidRange(): void {
    const { min, max, valid } = this.bounds;
    if (valid) return;
    const pair = `${min}:${max}`;
    if (warnedRanges.has(pair)) return;
    warnedRanges.add(pair);
    console.warn(`ProgressBar: \`max\` (${max}) must be greater than \`min\` (${min}); the bar renders empty.`);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ProgressBarOverridableBinding[]) {
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
    'ds-progress-bar': DsProgressBar;
  }
}
