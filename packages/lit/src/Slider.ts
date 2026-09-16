import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type SliderShowValue = 'always' | 'hover' | 'never';

/** Shape of each entry in `marks`. */
export interface SliderMark {
  value: number;
  label?: string | undefined;
}

/** A single value, or `[low, high]` for `range`. */
export type SliderValue = number | [number, number];

/** Detail carried by the `change` and `change-end` CustomEvents. */
export interface SliderChangeDetail {
  value: SliderValue;
}

/** copy.minimumLabel */
const COPY_MINIMUM = (label: string): string => `${label} minimum`;
/** copy.maximumLabel */
const COPY_MAXIMUM = (label: string): string => `${label} maximum`;
/** copy.rangeText */
const COPY_RANGE = (low: string, high: string): string => `${low} – ${high}`;
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;

/** Keys handled by the keyboard model; their `keyup` ends the interaction. */
const NAV_KEYS = new Set(['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

/** Keyboard table: PageUp/PageDown move by this many steps when there are no marks. */
const PAGE_STEPS = 10;

/**
 * Overridable style hooks; see the `overrides` property. `fill`, `thumbBorder`,
 * `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`,
 * `bubbleText`, `descriptionText`, `minTarget`, `focusRing` and
 * `focusRingWidth` are locked and excluded.
 */
export type SliderOverridableBinding =
  | 'track'
  | 'trackHeight'
  | 'trackRadius'
  | 'thumb'
  | 'thumbSize'
  | 'thumbShadow'
  | 'thumbActiveScale'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'valueSize'
  | 'bubbleRadius'
  | 'labelWeight'
  | 'partGap'
  | 'trackPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'helperSize'
  | 'errorText'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<SliderOverridableBinding, string> = {
  track: '--ds-slider-track',
  trackHeight: '--ds-slider-track-height',
  trackRadius: '--ds-slider-track-radius',
  thumb: '--ds-slider-thumb',
  thumbSize: '--ds-slider-thumb-size',
  thumbShadow: '--ds-slider-thumb-shadow',
  thumbActiveScale: '--ds-slider-thumb-active-scale',
  mark: '--ds-slider-mark',
  markSize: '--ds-slider-mark-size',
  markLabelSize: '--ds-slider-mark-label-size',
  valueSize: '--ds-slider-value-size',
  bubbleRadius: '--ds-slider-bubble-radius',
  labelWeight: '--ds-slider-label-weight',
  partGap: '--ds-slider-part-gap',
  trackPaddingBlock: '--ds-slider-track-padding-block',
  fontFamily: '--ds-slider-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-slider-font-size',
  helperSize: '--ds-slider-helper-size',
  errorText: '--ds-slider-error-text',
  disabledOpacity: '--ds-slider-disabled-opacity',
  transition: '--ds-slider-transition',
};

/**
 * `<ds-slider>` — Slider (category: input, APG pattern: slider-multithumb).
 *
 * `<ds-slider label="Price range" name="price" range min="0" max="500" step="10">`
 * renders a label row, a track with a fill and tick marks, and one
 * `<div role="slider" tabindex="0">` thumb per value in its shadow root (two
 * for `range`, each its own tab stop). Pointer Events with `setPointerCapture`
 * on the track drive dragging and track clicks (the nearest thumb moves); the
 * keyboard table (arrows, Page Up/Down, Home/End) is implemented on each thumb.
 * The element is form-associated (`ElementInternals`; a range submits two
 * entries under `name`) and dispatches composed `change` (`{ value }`, on every
 * change) and `change-end` (`{ value }`, once per interaction) CustomEvents.
 *
 * `value` is controlled: when it is set, the element reports `change` and shows
 * the new value only once the property is updated. Otherwise the element keeps
 * its own value, seeded from `defaultValue`.
 *
 * @fires change - Every value change while dragging or with keys, `{ value }` in `detail`.
 * @fires change-end - Once when the interaction ends (pointer up, key released), `{ value }` in `detail`.
 */
@customElement('ds-slider')
export class DsSlider extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--ds-slider-font-family);
      --ds-slider-track: var(--color-background-strong);
      --ds-slider-track-height: var(--space-1);
      --ds-slider-track-radius: var(--radius-full);
      --ds-slider-thumb: var(--color-control-background);
      --ds-slider-thumb-size: var(--space-5);
      --ds-slider-thumb-shadow: var(--shadow-raised);
      --ds-slider-thumb-active-scale: var(--opacity-disabled);
      --ds-slider-mark: var(--color-border-strong);
      --ds-slider-mark-size: var(--space-1);
      --ds-slider-mark-label-size: var(--font-size-xs);
      --ds-slider-value-size: var(--font-size-sm);
      --ds-slider-bubble-radius: var(--radius-sm);
      --ds-slider-label-weight: var(--font-weight-medium);
      --ds-slider-part-gap: var(--space-1);
      --ds-slider-track-padding-block: var(--space-3);
      --ds-slider-font-family: var(--font-family-body);
      --ds-slider-font-size: var(--font-size-md);
      --ds-slider-helper-size: var(--font-size-sm);
      --ds-slider-error-text: var(--color-foreground-danger);
      --ds-slider-disabled-opacity: var(--opacity-disabled);
      --ds-slider-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-slider-part-gap);
    }

    .visually-hidden {
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

    /* trackPaddingBlock: room for the thumb, its halo and the minTarget hit area */
    .track-area {
      box-sizing: border-box;
      padding-block: var(--ds-slider-track-padding-block);
    }

    :host([disabled]) .track-area {
      opacity: var(--ds-slider-disabled-opacity);
    }

    /* track, trackHeight, trackRadius */
    [data-part='track'] {
      position: relative;
      block-size: var(--ds-slider-track-height);
      border-radius: var(--ds-slider-track-radius);
      background: var(--ds-slider-track);
      touch-action: none;
    }

    /* fill: color.control.selectedBackground, locked */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      border-radius: var(--ds-slider-track-radius);
      background: var(--color-control-selected-background);
      pointer-events: none;
    }

    /* mark, markSize */
    [data-part='tickMarks'] {
      position: absolute;
      inset-block-start: 50%;
      inline-size: var(--ds-slider-mark-size);
      block-size: var(--ds-slider-mark-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-mark);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    :host(:dir(rtl)) [data-part='tickMarks'] {
      transform: translate(50%, -50%);
    }

    /* markLabelColor: color.foreground.muted, locked; markLabelSize */
    .mark-label {
      position: absolute;
      inset-block-start: calc(var(--ds-slider-mark-size) + var(--ds-slider-track-padding-block));
      inset-inline-start: 50%;
      transform: translateX(-50%);
      font-size: var(--ds-slider-mark-label-size);
      color: var(--color-foreground-muted);
      white-space: nowrap;
    }
    :host([has-mark-labels]) .track-area {
      padding-block-end: calc(var(--ds-slider-track-padding-block) * 2 + var(--ds-slider-mark-label-size));
    }

    /* minTarget: size.target.comfortable hit area, locked; the visible thumb is thumbSize */
    [data-part='thumb'] {
      position: absolute;
      inset-block-start: 50%;
      inline-size: var(--size-target-comfortable);
      block-size: var(--size-target-comfortable);
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      touch-action: none;
      outline: none;
    }
    :host(:dir(rtl)) [data-part='thumb'] {
      transform: translate(50%, -50%);
    }

    :host([disabled]) [data-part='thumb'] {
      cursor: not-allowed;
    }

    /* thumb, thumbSize, thumbShadow; thumbBorder + thumbBorderWidth locked */
    .thumb-visual {
      position: relative;
      box-sizing: border-box;
      inline-size: var(--ds-slider-thumb-size);
      block-size: var(--ds-slider-thumb-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-thumb);
      border: var(--border-width-focus) solid var(--color-control-selected-background);
      box-shadow: var(--ds-slider-thumb-shadow);
    }

    /* thumbActiveScale: a halo of the fill color at this opacity, space.2 larger on each side */
    .halo {
      position: absolute;
      inset: calc(-1 * var(--space-2));
      z-index: -1;
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }
    .is-active .halo {
      opacity: var(--ds-slider-thumb-active-scale);
    }

    /* focusRing / focusRingWidth, both locked */
    [data-part='thumb']:focus-visible .thumb-visual {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* bubbleSurface / bubbleText (locked), bubbleRadius. The composed ds-text reads
       color.foreground, so the bubble scopes that token to the inverse foreground. */
    [data-part='bubble'] {
      --color-foreground: var(--color-inverse-foreground);
      position: absolute;
      inset-block-end: calc(50% + var(--ds-slider-thumb-size));
      inset-inline-start: 50%;
      transform: translateX(-50%);
      box-sizing: border-box;
      padding-block: var(--space-1);
      padding-inline: var(--space-2);
      border-radius: var(--ds-slider-bubble-radius);
      background: var(--color-inverse-surface);
      white-space: nowrap;
      pointer-events: none;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .halo,
      [data-part='bubble'] {
        transition: none;
      }
    }

    /* errorText: the composed ds-text (tone danger) reads color.foreground.danger */
    [data-part='errorMessage'] {
      --color-foreground-danger: var(--ds-slider-error-text);
    }
    [data-part='errorMessage']:empty {
      display: none;
    }
  `;

  /** Visible label naming the quantity ("Volume", "Price range"). */
  @property() accessor label = '';

  /** Field name for the Form. A range contributes `[min, max]`. */
  @property() accessor name = '';

  /** Lower bound. */
  @property({ type: Number }) accessor min = 0;

  /** Upper bound. */
  @property({ type: Number }) accessor max = 100;

  private stepValue: number | undefined;

  /** Arrow-key increment and snapping granularity for drag, click and keys. Defaults to 1. */
  get step(): number {
    return this.stepValue ?? 1;
  }
  @property({ type: Number })
  set step(value: number | undefined) {
    const old = this.stepValue;
    this.stepValue = value === undefined || Number.isNaN(Number(value)) ? undefined : Number(value);
    this.requestUpdate('step', old);
  }

  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark). */
  @property({ type: Boolean, reflect: true, attribute: 'snap-to-marks' }) accessor snapToMarks = false;

  /** Must have a value other than the default to submit (`copy.required`). */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Controlled value; for a range, a two-number array. */
  @property({ attribute: false }) accessor value: SliderValue | undefined;

  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  @property({ attribute: false }) accessor defaultValue: SliderValue | undefined;

  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  @property({ type: Boolean, reflect: true }) accessor range = false;

  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  @property({ attribute: false }) accessor formatValue: ((value: number) => string) | undefined;

  /** Where the value text appears: beside the label, as a bubble while dragging or focused, or not at all. */
  @property({ reflect: true, attribute: 'show-value' }) accessor showValue: SliderShowValue = 'always';

  /** Tick marks on the track, optionally labelled. */
  @property({ attribute: false }) accessor marks: SliderMark[] | undefined;

  /** Not adjustable, still readable (and focusable). */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Helper text. */
  @property() accessor description: string | undefined;

  /** Per-instance style overrides: `{ trackRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SliderOverridableBinding, TokenRef | undefined>>
    | undefined;

  private errorValue: string | undefined;

  /** Error message. Setting it marks the slider invalid. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value ?? undefined;
    // Synchronous, so `checkValidity()` right after the assignment is already correct.
    this.invalid = Boolean(value);
    this.syncValidity();
    this.requestUpdate('error', old);
  }

  /** Marks the slider invalid (`copy.invalid` when no `error`). */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  /** Uncontrolled value, seeded from `defaultValue`. */
  @state() private accessor internalValue: SliderValue | undefined;

  /** Disabled by an owning fieldset or form. */
  @state() private accessor formDisabled = false;

  /** Thumb being dragged (halo and bubble). */
  @state() private accessor draggingIndex: number | null = null;

  /** Thumb holding focus (bubble in `showValue: hover`). */
  @state() private accessor focusedIndex: number | null = null;

  /** Set by a handled `keydown` so the matching `keyup` fires `change-end`. */
  private pendingKeyEnd: number | null = null;

  @query('[data-part="track"]') private accessor trackEl!: HTMLDivElement | null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The value shown: `value` when controlled, otherwise the internal value, `defaultValue`, then the bounds. */
  get currentValue(): SliderValue {
    if (this.value !== undefined) return this.value;
    if (this.internalValue !== undefined) return this.internalValue;
    return this.fallbackValue;
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  /** The field's own copy: `error`, `copy.invalid` or `copy.required`; empty when valid. */
  get validationMessage(): string {
    return this.messageFor();
  }

  checkValidity(): boolean {
    this.syncValidity();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this.syncValidity();
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.internalValue = undefined;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (typeof restored === 'string') {
      const n = Number(restored);
      if (!Number.isNaN(n)) this.internalValue = n;
    } else if (restored instanceof FormData) {
      const entries = restored.getAll(this.name).map((entry) => Number(entry));
      if (entries.length === 2 && entries.every((n) => !Number.isNaN(n))) {
        this.internalValue = [entries[0]!, entries[1]!];
      }
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Slider');
    this.setAttribute('data-ds-field', '');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (changed.has('marks')) this.toggleAttribute('has-mark-labels', (this.marks ?? []).some((m) => Boolean(m.label)));
    this.warnInDev(changed);
  }

  protected override updated(): void {
    this.syncFormValue();
    this.syncValidity();
  }

  protected override render(): TemplateResult {
    const value = this.currentValue;
    const [lo, hi] = this.range ? this.pairValue() : [Number(this.min), this.singleValue()];
    const loPercent = this.range ? this.percentFor(lo) : 0;
    const hiPercent = this.percentFor(hi);
    const message = this.visibleMessage();
    const valueText = Array.isArray(value)
      ? COPY_RANGE(this.formatOne(value[0]), this.formatOne(value[1]))
      : this.formatOne(value);

    return html`
      <div class="row">
        <ds-text
          id="label"
          part="label"
          data-part="label"
          element="span"
          size="md"
          weight="medium"
          .overrides=${this.labelOverrides}
          >${this.label}</ds-text
        >
        ${this.showValue === 'always'
          ? html`<ds-text
              part="valueText"
              data-part="valueText"
              element="span"
              size="sm"
              aria-hidden="true"
              .overrides=${this.valueOverrides}
              >${valueText}</ds-text
            >`
          : nothing}
      </div>
      ${this.range
        ? html`<span id="minimum-label" class="visually-hidden">${COPY_MINIMUM(this.label)}</span>
            <span id="maximum-label" class="visually-hidden">${COPY_MAXIMUM(this.label)}</span>`
        : nothing}
      <div class="track-area">
        <div
          part="track"
          data-part="track"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @pointercancel=${this.handlePointerUp}
        >
          <div
            part="fill"
            data-part="fill"
            style=${styleMap({ insetInlineStart: `${loPercent}%`, inlineSize: `${hiPercent - loPercent}%` })}
          ></div>
          ${(this.marks ?? []).map(
            (mark) => html`<span
              part="tickMarks"
              data-part="tickMarks"
              aria-hidden="true"
              style=${styleMap({ insetInlineStart: `${this.percentFor(mark.value)}%` })}
              >${mark.label ? html`<span class="mark-label">${mark.label}</span>` : nothing}</span
            >`,
          )}
          ${this.renderThumb(0)} ${this.range ? this.renderThumb(1) : nothing}
        </div>
      </div>
      ${this.description
        ? html`<ds-text
            id="description"
            part="description"
            data-part="description"
            size="sm"
            tone="muted"
            .overrides=${this.helperOverrides}
            >${this.description}</ds-text
          >`
        : nothing}
      <div id="error" part="errorMessage" data-part="errorMessage" role="alert">${message
        ? html`<ds-text size="sm" tone="danger" .overrides=${this.helperOverrides}>${message}</ds-text>`
        : nothing}</div>
    `;
  }

  private renderThumb(index: number): TemplateResult {
    const thumbValue = this.thumbValue(index);
    const text = this.formatOne(thumbValue);
    const [lo, hi] = this.range ? this.pairValue() : [Number(this.min), Number(this.max)];
    // A range thumb's bounds are the live constraint from the other thumb.
    const valueMin = this.range && index === 1 ? lo : Number(this.min);
    const valueMax = this.range && index === 0 ? hi : Number(this.max);
    const labelledBy = this.range ? (index === 0 ? 'minimum-label' : 'maximum-label') : 'label';
    const describedBy =
      [this.description ? 'description' : '', this.visibleMessage() ? 'error' : ''].filter(Boolean).join(' ') ||
      undefined;
    const showBubble =
      this.showValue === 'hover' && (this.draggingIndex === index || this.focusedIndex === index);

    return html`
      <div
        class=${classMap({ 'is-active': this.draggingIndex === index })}
        part="thumb"
        data-part="thumb"
        role="slider"
        tabindex="0"
        aria-valuenow=${thumbValue}
        aria-valuemin=${valueMin}
        aria-valuemax=${valueMax}
        aria-valuetext=${text}
        aria-labelledby=${labelledBy}
        aria-describedby=${ifDefined(describedBy)}
        aria-orientation="horizontal"
        aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        style=${styleMap({ insetInlineStart: `${this.percentFor(thumbValue)}%` })}
        @keydown=${(event: KeyboardEvent) => this.handleKeydown(event, index)}
        @keyup=${(event: KeyboardEvent) => this.handleKeyup(event, index)}
        @focus=${() => {
          this.focusedIndex = index;
        }}
        @blur=${() => {
          if (this.focusedIndex === index) this.focusedIndex = null;
        }}
      >
        <div class="thumb-visual"><div class="halo"></div></div>
        ${showBubble
          ? html`<div part="bubble" data-part="bubble" aria-hidden="true">
              <ds-text size="sm" element="span" .overrides=${this.valueOverrides}>${text}</ds-text>
            </div>`
          : nothing}
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** What `value` falls back to: `defaultValue`, else `min` (or `[min, max]`). Also the `required` baseline. */
  private get fallbackValue(): SliderValue {
    if (this.defaultValue !== undefined) return this.defaultValue;
    return this.range ? [Number(this.min), Number(this.max)] : Number(this.min);
  }

  private pairValue(): [number, number] {
    const value = this.currentValue;
    return Array.isArray(value) ? value : [Number(this.min), Number(this.max)];
  }

  private singleValue(): number {
    const value = this.currentValue;
    return Array.isArray(value) ? value[0] : value;
  }

  private thumbValue(index: number): number {
    return this.range ? this.pairValue()[index === 0 ? 0 : 1] : this.singleValue();
  }

  private formatOne(value: number): string {
    return this.formatValue ? this.formatValue(value) : String(value);
  }

  private percentFor(value: number): number {
    const min = Number(this.min);
    const max = Number(this.max);
    if (!(max > min)) return 0;
    return ((this.clamp(value) - min) / (max - min)) * 100;
  }

  private clamp(value: number): number {
    return Math.min(Number(this.max), Math.max(Number(this.min), value));
  }

  /** Nearest multiple of `step` from `min`, clamped to the bounds. */
  private snapToStep(value: number): number {
    const min = Number(this.min);
    const step = this.step > 0 ? this.step : 1;
    const snapped = min + Math.round((value - min) / step) * step;
    // Drop floating-point residue from fractional steps (0.1 * 3).
    const decimals = (String(step).split('.')[1] ?? '').length;
    return this.clamp(Number(snapped.toFixed(decimals)));
  }

  /** Drag and click snap to marks with `snapToMarks`, or when `step` is omitted; otherwise to `step`. */
  private snapPointerValue(value: number): number {
    const marks = this.marks ?? [];
    if (marks.length > 0 && (this.snapToMarks || this.stepValue === undefined)) {
      let nearest = marks[0]!.value;
      for (const mark of marks) {
        if (Math.abs(mark.value - value) < Math.abs(nearest - value)) nearest = mark.value;
      }
      return this.clamp(nearest);
    }
    return this.snapToStep(value);
  }

  /** Logical position on the track (mirrored in right-to-left) to a raw value. */
  private valueAt(clientX: number): number {
    const rect = this.trackEl?.getBoundingClientRect();
    if (!rect || rect.width === 0) return Number(this.min);
    let ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    if (getComputedStyle(this).direction === 'rtl') ratio = 1 - ratio;
    return Number(this.min) + ratio * (Number(this.max) - Number(this.min));
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.isDisabled || event.button !== 0) return;
    event.preventDefault();
    const raw = this.valueAt(event.clientX);
    let index = 0;
    if (this.range) {
      const [lo, hi] = this.pairValue();
      const toLo = Math.abs(raw - lo);
      const toHi = Math.abs(raw - hi);
      // A tie (coincident thumbs) goes to the thumb on the side of the press.
      index = toLo < toHi || (toLo === toHi && raw < lo) ? 0 : 1;
    }
    this.draggingIndex = index;
    this.trackEl?.setPointerCapture(event.pointerId);
    this.moveThumb(index, this.snapPointerValue(raw));
    this.renderRoot.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.draggingIndex === null) return;
    this.moveThumb(this.draggingIndex, this.snapPointerValue(this.valueAt(event.clientX)));
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.draggingIndex === null) return;
    if (this.trackEl?.hasPointerCapture(event.pointerId)) this.trackEl.releasePointerCapture(event.pointerId);
    this.draggingIndex = null;
    this.dispatchChangeEnd();
  };

  private handleKeydown(event: KeyboardEvent, index: number): void {
    if (!NAV_KEYS.has(event.key)) return;
    // Disabled: still focusable and readable, but the keys do nothing (and are not swallowed).
    if (this.isDisabled) return;
    event.preventDefault();
    const current = this.thumbValue(index);
    const step = this.step > 0 ? this.step : 1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        this.moveThumb(index, this.snapToStep(current + step));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveThumb(index, this.snapToStep(current - step));
        break;
      case 'PageUp':
        this.moveThumb(index, this.pageTarget(current, 1));
        break;
      case 'PageDown':
        this.moveThumb(index, this.pageTarget(current, -1));
        break;
      case 'Home':
        this.moveThumb(index, Number(this.min));
        break;
      case 'End':
        this.moveThumb(index, Number(this.max));
        break;
    }
    this.pendingKeyEnd = index;
  }

  private handleKeyup(event: KeyboardEvent, index: number): void {
    if (this.pendingKeyEnd !== index || !NAV_KEYS.has(event.key)) return;
    this.pendingKeyEnd = null;
    this.dispatchChangeEnd();
  }

  /** PageUp/PageDown: to the next mark in that direction when there are marks, otherwise ten steps. */
  private pageTarget(current: number, direction: 1 | -1): number {
    const marks = (this.marks ?? []).map((mark) => mark.value).sort((a, b) => a - b);
    if (marks.length > 0) {
      const next =
        direction === 1 ? marks.find((v) => v > current) : [...marks].reverse().find((v) => v < current);
      return this.clamp(next ?? (direction === 1 ? Number(this.max) : Number(this.min)));
    }
    return this.snapToStep(current + direction * PAGE_STEPS * (this.step > 0 ? this.step : 1));
  }

  /** Moves one thumb to an already-snapped value, keeping a range's thumbs from crossing. */
  private moveThumb(index: number, target: number): void {
    if (this.isDisabled) return;
    let next: SliderValue;
    if (this.range) {
      const [lo, hi] = this.pairValue();
      next = index === 0 ? [Math.min(target, hi), hi] : [lo, Math.max(target, lo)];
      if (next[0] === lo && next[1] === hi) return;
    } else {
      if (target === this.singleValue()) return;
      next = target;
    }
    // Controlled: report only; the element shows the new value once `value` changes.
    if (this.value === undefined) this.internalValue = next;
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private dispatchChangeEnd(): void {
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change-end', {
        detail: { value: this.currentValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private get labelOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    return {
      fontFamily: this.overrides?.fontFamily,
      fontSize: this.overrides?.fontSize,
      fontWeight: this.overrides?.labelWeight,
    };
  }

  private get valueOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    return { fontFamily: this.overrides?.fontFamily, fontSize: this.overrides?.valueSize };
  }

  private get helperOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    return { fontFamily: this.overrides?.fontFamily, fontSize: this.overrides?.helperSize };
  }

  /** The message the error region shows: `error`, else `copy.invalid` while `invalid`. */
  private visibleMessage(): string {
    if (this.error) return this.error;
    return this.invalid ? COPY_INVALID(this.label) : '';
  }

  /** Validation in the form contract's order: required, then invalid. */
  private messageFor(): string {
    if (this.isDisabled) return '';
    if (this.required && this.isAtDefault) return COPY_REQUIRED(this.label);
    return this.visibleMessage();
  }

  private get isAtDefault(): boolean {
    const initial = this.fallbackValue;
    const current = this.currentValue;
    if (Array.isArray(initial) || Array.isArray(current)) {
      return Array.isArray(initial) && Array.isArray(current) && initial[0] === current[0] && initial[1] === current[1];
    }
    return initial === current;
  }

  private syncFormValue(): void {
    if (this.isDisabled || !this.name) {
      this.internals.setFormValue(null);
      return;
    }
    const value = this.currentValue;
    if (Array.isArray(value)) {
      const data = new FormData();
      data.append(this.name, String(value[0]));
      data.append(this.name, String(value[1]));
      this.internals.setFormValue(data);
    } else {
      this.internals.setFormValue(String(value));
    }
  }

  private syncValidity(): void {
    const message = this.messageFor();
    const anchor = this.renderRoot?.querySelector<HTMLElement>('[role="slider"]') ?? undefined;
    if (!message) {
      this.internals.setValidity({});
    } else if (this.required && this.isAtDefault && !this.isDisabled) {
      this.internals.setValidity({ valueMissing: true }, message, anchor);
    } else {
      this.internals.setValidity({ customError: true }, message, anchor);
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SliderOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) this.style.removeProperty(HOOKS[binding]);
      else this.style.setProperty(HOOKS[binding], cssVar(ref));
    }
  }

  private warnInDev(changed: PropertyValues): void {
    if (!import.meta.env.DEV) return;
    if ((changed.has('min') || changed.has('max')) && !(Number(this.max) > Number(this.min))) {
      console.warn(`<ds-slider> needs max (${this.max}) greater than min (${this.min}).`, this);
    }
    if (changed.has('range') || changed.has('value') || changed.has('defaultValue')) {
      const value = this.value ?? this.defaultValue;
      if (value !== undefined && this.range !== Array.isArray(value)) {
        console.warn(
          `<ds-slider${this.range ? ' range' : ''}> expects ${this.range ? 'a [low, high] pair' : 'a single number'} for value/defaultValue.`,
          this,
        );
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-slider': DsSlider;
  }
}
