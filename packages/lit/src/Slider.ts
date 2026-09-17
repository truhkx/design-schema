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

/** Keyboard table: PageUp/PageDown change by ten steps (without `snapToMarks`). */
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
  | 'haloSpread'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'markLabelGap'
  | 'valueSize'
  | 'bubblePaddingBlock'
  | 'bubblePaddingInline'
  | 'bubbleOffset'
  | 'bubbleRadius'
  | 'labelWeight'
  | 'partGap'
  | 'labelGap'
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
  haloSpread: '--ds-slider-halo-spread',
  mark: '--ds-slider-mark',
  markSize: '--ds-slider-mark-size',
  markLabelSize: '--ds-slider-mark-label-size',
  markLabelGap: '--ds-slider-mark-label-gap',
  valueSize: '--ds-slider-value-size',
  bubblePaddingBlock: '--ds-slider-bubble-padding-block',
  bubblePaddingInline: '--ds-slider-bubble-padding-inline',
  bubbleOffset: '--ds-slider-bubble-offset',
  bubbleRadius: '--ds-slider-bubble-radius',
  labelWeight: '--ds-slider-label-weight',
  partGap: '--ds-slider-part-gap',
  labelGap: '--ds-slider-label-gap',
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
 * renders a label row, a track area (the pointer hit area) holding the track,
 * its fill and one `<div role="slider" tabindex="0">` thumb per value (two for
 * `range`, each its own tab stop), and the tick marks below it, all in the
 * shadow root. Pointer Events with `setPointerCapture` on the track area drive
 * dragging and track clicks (the nearest thumb moves); the keyboard table
 * (arrows, Page Up/Down, Home/End) is implemented on each thumb. The element is
 * form-associated (`ElementInternals`; a range submits two entries under
 * `name`) and dispatches composed `change` (`{ value }`, on every change) and
 * `change-end` (`{ value }`, once per interaction that changed the value)
 * CustomEvents.
 *
 * `value` is controlled: when it is set, the element reports `change` and shows
 * the new value only once the property is updated. Otherwise the element keeps
 * its own value, seeded from `defaultValue`.
 *
 * @fires change - Every value change while dragging or with keys, `{ value }` in `detail`.
 * @fires change-end - Once when an interaction that changed the value ends (pointer up, key released).
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
      --ds-slider-track: var(--color-background-strong);
      --ds-slider-track-height: var(--space-1);
      --ds-slider-track-radius: var(--radius-full);
      --ds-slider-thumb: var(--color-control-background);
      --ds-slider-thumb-size: var(--space-5);
      --ds-slider-thumb-shadow: var(--shadow-raised);
      --ds-slider-thumb-active-scale: var(--opacity-disabled);
      --ds-slider-halo-spread: var(--space-2);
      --ds-slider-mark: var(--color-border-strong);
      --ds-slider-mark-size: var(--space-1);
      --ds-slider-mark-label-size: var(--font-size-xs);
      --ds-slider-mark-label-gap: var(--space-1);
      --ds-slider-value-size: var(--font-size-sm);
      --ds-slider-bubble-padding-block: var(--space-1);
      --ds-slider-bubble-padding-inline: var(--space-2);
      --ds-slider-bubble-offset: var(--space-1);
      --ds-slider-bubble-radius: var(--radius-sm);
      --ds-slider-label-weight: var(--font-weight-medium);
      --ds-slider-part-gap: var(--space-1);
      --ds-slider-label-gap: var(--space-2);
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

    /* partGap: vertical gap between the label row, the track area and the messages */
    .root {
      display: flex;
      flex-direction: column;
      gap: var(--ds-slider-part-gap);
    }

    /* disabledOpacity: the whole slider (label row, track area, marks, messages) */
    .root.is-disabled {
      opacity: var(--ds-slider-disabled-opacity);
    }

    /* labelGap: between the label and the value text */
    .row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-slider-label-gap);
    }

    /* trackPaddingBlock: the unparted track area around track and thumbs, also the pointer hit area */
    .track-area {
      box-sizing: border-box;
      padding-block: var(--ds-slider-track-padding-block);
      touch-action: none;
    }

    /* track, trackHeight, trackRadius */
    [data-part='track'] {
      position: relative;
      block-size: var(--ds-slider-track-height);
      border-radius: var(--ds-slider-track-radius);
      background: var(--ds-slider-track);
    }

    /* fill: color.control.selectedBackground, locked */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      border-radius: var(--ds-slider-track-radius);
      background: var(--color-control-selected-background);
      pointer-events: none;
    }

    /* tickMarks: dots drawn back up on the track centre line; labels on their own line below the track area */
    [data-part='tickMarks'] {
      position: relative;
      pointer-events: none;
    }
    [data-part='tickMarks'].has-labels {
      padding-block-start: var(--ds-slider-mark-label-gap);
    }

    /* mark, markSize */
    .mark {
      position: absolute;
      inset-block-start: calc(-1 * var(--ds-slider-track-padding-block) - var(--ds-slider-track-height) / 2);
      inline-size: var(--ds-slider-mark-size);
      block-size: var(--ds-slider-mark-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-mark);
      transform: translate(-50%, -50%);
    }
    :host(:dir(rtl)) .mark {
      transform: translate(50%, -50%);
    }

    /* mark labels share one grid cell, each centred under its mark */
    .mark-labels {
      display: grid;
    }
    .mark-label {
      grid-area: 1 / 1;
      justify-self: start;
      position: relative;
      white-space: nowrap;
      transform: translateX(-50%);
    }
    :host(:dir(rtl)) .mark-label {
      transform: translateX(50%);
    }

    /* minTarget: size.target.comfortable hit area centred on the knob, locked */
    [data-part='thumb'] {
      position: absolute;
      z-index: 1;
      inset-block-start: 50%;
      inline-size: var(--size-target-comfortable);
      block-size: var(--size-target-comfortable);
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
    }
    :host(:dir(rtl)) [data-part='thumb'] {
      transform: translate(50%, -50%);
    }

    .root.is-disabled [data-part='thumb'] {
      cursor: not-allowed;
    }

    /* thumb, thumbSize, thumbShadow; thumbBorder + thumbBorderWidth locked */
    .knob {
      position: relative;
      box-sizing: border-box;
      inline-size: var(--ds-slider-thumb-size);
      block-size: var(--ds-slider-thumb-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-thumb);
      border: var(--border-width-focus) solid var(--color-control-selected-background);
      box-shadow: var(--ds-slider-thumb-shadow);
    }

    /* thumbActiveScale + haloSpread: a halo of the fill colour at this opacity, haloSpread beyond the knob */
    .halo {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      inline-size: calc(var(--ds-slider-thumb-size) + 2 * var(--ds-slider-halo-spread));
      block-size: calc(var(--ds-slider-thumb-size) + 2 * var(--ds-slider-halo-spread));
      transform: translate(-50%, -50%);
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }
    [data-part='thumb'].is-active .halo {
      opacity: var(--ds-slider-thumb-active-scale);
    }

    /* focusRing / focusRingWidth, both locked: around the knob, offset by the same width */
    [data-part='thumb']:focus-visible .knob {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* bubbleSurface / bubbleText (locked), padding, offset, radius. The composed ds-text (tone default)
       reads color.foreground, so the bubble re-scopes that token to the inverse foreground. */
    [data-part='bubble'] {
      --color-foreground: var(--color-inverse-foreground);
      position: absolute;
      inset-block-end: calc(100% + var(--ds-slider-bubble-offset));
      inset-inline-start: 50%;
      transform: translateX(-50%);
      box-sizing: border-box;
      padding-block: var(--ds-slider-bubble-padding-block);
      padding-inline: var(--ds-slider-bubble-padding-inline);
      border-radius: var(--ds-slider-bubble-radius);
      background: var(--color-inverse-surface);
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }
    :host(:dir(rtl)) [data-part='bubble'] {
      transform: translateX(50%);
    }
    [data-part='bubble'].is-shown {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      .halo,
      [data-part='bubble'] {
        transition: none;
      }
    }

    [data-part='errorMessage']:empty {
      display: none;
    }
  `;

  /** Visible label naming the quantity ("Volume", "Price range"). */
  @property() accessor label = '';

  /** Field name for the Form. A range submits two entries under this name. */
  @property() accessor name = '';

  /** Lower bound. */
  @property({ type: Number }) accessor min = 0;

  /** Upper bound. */
  @property({ type: Number }) accessor max = 100;

  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  @property({ type: Number }) accessor step = 1;

  /** With `marks`, snap drag and click to the marks instead of `step`; PageUp/Down go to the next mark. */
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

  /** Where the value text appears: beside the label, as a bubble while pressed or focused, or not at all. */
  @property({ reflect: true, attribute: 'show-value' }) accessor showValue: SliderShowValue = 'always';

  /** Tick marks on the track, optionally labelled. */
  @property({ attribute: false }) accessor marks: SliderMark[] | undefined;

  /** Not adjustable, still readable (and focusable); no value is submitted. */
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
    this.errorValue = value || undefined;
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

  /** Thumb being pressed or dragged (halo and bubble). */
  @state() private accessor draggingIndex: number | null = null;

  /** Thumb holding focus (bubble in `showValue: hover`). */
  @state() private accessor focusedIndex: number | null = null;

  /** The message `reportValidity()` last reported; cleared once the field is valid again. */
  @state() private accessor reportedMessage = '';

  /** Value when the current pointer or key interaction began; `null` outside one. */
  private interactionStart: SliderValue | null = null;

  /** Last value reported by `change` in the current interaction. */
  private interactionLast: SliderValue | null = null;

  /** Thumb whose handled `keydown` awaits its `keyup`. */
  private pendingKeyIndex: number | null = null;

  @query('[data-part="track"]') private accessor trackEl!: HTMLDivElement | null;

  @query('.track-area') private accessor trackAreaEl!: HTMLDivElement | null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** DsFormField: the decimal string, or `[low, high]` as two strings for a range; `null` while disabled. */
  get currentValue(): string | [string, string] | null {
    if (this.isDisabled) return null;
    const value = this.resolvedValue;
    return Array.isArray(value) ? [String(value[0]), String(value[1])] : String(value);
  }

  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  /** The field's own copy: `copy.required`, then `error` / `copy.invalid`; empty when valid. */
  get validationMessage(): string {
    return this.messageFor();
  }

  checkValidity(): boolean {
    this.syncValidity();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this.syncValidity();
    this.reportedMessage = this.messageFor();
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.internalValue = undefined;
    this.reportedMessage = '';
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
    if (this.reportedMessage && !this.messageFor()) this.reportedMessage = '';
    this.warnInDev(changed);
  }

  protected override updated(): void {
    this.syncFormValue();
    this.syncValidity();
  }

  protected override render(): TemplateResult {
    const value = this.resolvedValue;
    const [lo, hi] = this.range ? this.pairValue() : [Number(this.min), this.singleValue()];
    const loPercent = this.range ? this.percentFor(lo) : 0;
    const hiPercent = this.percentFor(hi);
    const message = this.visibleMessage();
    const valueText = Array.isArray(value)
      ? COPY_RANGE(this.formatOne(value[0]), this.formatOne(value[1]))
      : this.formatOne(value);

    return html`
      <div class=${classMap({ root: true, 'is-disabled': this.isDisabled })}>
        <div class="row">
          <ds-text
            id="label"
            part="label" data-part="label"
            element="span"
            size="md"
            weight="medium"
            tone="default"
            .overrides=${this.labelOverrides}
            >${this.label}</ds-text
          >
          ${this.showValue === 'always'
            ? html`<ds-text
                part="valueText" data-part="valueText"
                element="span"
                size="sm"
                tone="default"
                aria-hidden="true"
                .overrides=${this.valueOverrides}
                >${valueText}</ds-text
              >`
            : nothing}
        </div>
        <div>
          <div
            class="track-area"
            @pointerdown=${this.handlePointerDown}
            @pointermove=${this.handlePointerMove}
            @pointerup=${this.handlePointerUp}
            @pointercancel=${this.handlePointerUp}
          >
            <div part="track" data-part="track">
              <div
                part="fill" data-part="fill"
                style=${styleMap({ insetInlineStart: `${loPercent}%`, inlineSize: `${hiPercent - loPercent}%` })}
              ></div>
              ${this.renderThumb(0)} ${this.range ? this.renderThumb(1) : nothing}
            </div>
          </div>
          ${this.renderTickMarks()}
        </div>
        ${this.description
          ? html`<ds-text
              id="description"
              part="description" data-part="description"
              element="span"
              size="sm"
              tone="muted"
              .overrides=${this.helperOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        <div id="error" part="errorMessage" data-part="errorMessage" role="alert">${message
          ? html`<ds-text element="span" size="sm" tone="danger" .overrides=${this.helperOverrides}
              >${message}</ds-text
            >`
          : nothing}</div>
      </div>
    `;
  }

  private renderTickMarks(): TemplateResult | typeof nothing {
    const marks = this.marks ?? [];
    if (marks.length === 0) return nothing;
    const labelled = marks.filter((mark) => Boolean(mark.label));
    return html`
      <div
        part="tickMarks" data-part="tickMarks"
        class=${classMap({ 'has-labels': labelled.length > 0 })}
        aria-hidden="true"
      >
        ${marks.map(
          (mark) =>
            html`<span class="mark" style=${styleMap({ insetInlineStart: `${this.percentFor(mark.value)}%` })}></span>`,
        )}
        ${labelled.length > 0
          ? html`<div class="mark-labels">
              ${labelled.map(
                (mark) => html`<span
                  class="mark-label"
                  style=${styleMap({ insetInlineStart: `${this.percentFor(mark.value)}%` })}
                  ><ds-text element="span" size="xs" tone="muted" .overrides=${this.markLabelOverrides}
                    >${mark.label}</ds-text
                  ></span
                >`,
              )}
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderThumb(index: number): TemplateResult {
    const thumbValue = this.thumbValue(index);
    const text = this.formatOne(thumbValue);
    const [lo, hi] = this.range ? this.pairValue() : [Number(this.min), Number(this.max)];
    // A range thumb's bounds are the live constraint from the other thumb.
    const valueMin = this.range && index === 1 ? lo : Number(this.min);
    const valueMax = this.range && index === 0 ? hi : Number(this.max);
    const ariaLabel = this.range ? (index === 0 ? COPY_MINIMUM(this.label) : COPY_MAXIMUM(this.label)) : undefined;
    const describedBy =
      [this.description ? 'description' : '', this.visibleMessage() ? 'error' : ''].filter(Boolean).join(' ') ||
      undefined;
    const bubbleShown = this.draggingIndex === index || this.focusedIndex === index;

    return html`
      <div
        class=${classMap({ 'is-active': this.draggingIndex === index })}
        part="thumb" data-part="thumb"
        role="slider"
        tabindex="0"
        aria-valuenow=${thumbValue}
        aria-valuemin=${valueMin}
        aria-valuemax=${valueMax}
        aria-valuetext=${text}
        aria-label=${ifDefined(ariaLabel)}
        aria-labelledby=${ifDefined(this.range ? undefined : 'label')}
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
        <div class="knob"><div class="halo"></div></div>
        ${this.showValue === 'hover'
          ? html`<div part="bubble" data-part="bubble" class=${classMap({ 'is-shown': bubbleShown })} aria-hidden="true">
              <ds-text element="span" size="sm" tone="default" .overrides=${this.valueOverrides}>${text}</ds-text>
            </div>`
          : nothing}
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** `value` when controlled, otherwise the internal value, then the default. */
  private get resolvedValue(): SliderValue {
    if (this.value !== undefined) return this.value;
    if (this.internalValue !== undefined) return this.internalValue;
    return this.fallbackValue;
  }

  /** What `value` falls back to: `defaultValue`, else `min` (or `[min, max]`). Also the `required` baseline. */
  private get fallbackValue(): SliderValue {
    if (this.defaultValue !== undefined) return this.defaultValue;
    return this.range ? [Number(this.min), Number(this.max)] : Number(this.min);
  }

  private pairValue(): [number, number] {
    const value = this.resolvedValue;
    return Array.isArray(value) ? value : [Number(this.min), Number(this.max)];
  }

  private singleValue(): number {
    const value = this.resolvedValue;
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

  private get stepSize(): number {
    const step = Number(this.step);
    return step > 0 ? step : 1;
  }

  /** Nearest multiple of `step` from `min`, clamped to the bounds. */
  private snapToStep(value: number): number {
    const min = Number(this.min);
    const step = this.stepSize;
    const snapped = min + Math.round((value - min) / step) * step;
    // Drop floating-point residue from fractional steps (0.1 * 3).
    const decimals = (String(step).split('.')[1] ?? '').length;
    return this.clamp(Number(snapped.toFixed(decimals)));
  }

  private get markValues(): number[] {
    return (this.marks ?? []).map((mark) => mark.value).sort((a, b) => a - b);
  }

  /** Drag and click snap to the marks only with `snapToMarks`; otherwise to `step`. */
  private snapPointerValue(value: number): number {
    const marks = this.markValues;
    if (this.snapToMarks && marks.length > 0) {
      let nearest = marks[0]!;
      for (const mark of marks) {
        if (Math.abs(mark - value) < Math.abs(nearest - value)) nearest = mark;
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
    this.beginInteraction();
    this.draggingIndex = index;
    this.trackAreaEl?.setPointerCapture(event.pointerId);
    this.moveThumb(index, this.snapPointerValue(raw));
    this.renderRoot.querySelectorAll<HTMLElement>('[role="slider"]')[index]?.focus();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (this.draggingIndex === null) return;
    this.moveThumb(this.draggingIndex, this.snapPointerValue(this.valueAt(event.clientX)));
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (this.draggingIndex === null) return;
    if (this.trackAreaEl?.hasPointerCapture(event.pointerId)) this.trackAreaEl.releasePointerCapture(event.pointerId);
    this.draggingIndex = null;
    this.endInteraction();
  };

  private handleKeydown(event: KeyboardEvent, index: number): void {
    if (!NAV_KEYS.has(event.key)) return;
    // Disabled: still focusable and readable, but the keys do nothing (and are not swallowed).
    if (this.isDisabled) return;
    event.preventDefault();
    if (this.pendingKeyIndex !== index) this.beginInteraction();
    this.pendingKeyIndex = index;
    const current = this.thumbValue(index);
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        this.moveThumb(index, this.snapToStep(current + this.stepSize));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.moveThumb(index, this.snapToStep(current - this.stepSize));
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
  }

  private handleKeyup(event: KeyboardEvent, index: number): void {
    if (this.pendingKeyIndex !== index || !NAV_KEYS.has(event.key)) return;
    this.pendingKeyIndex = null;
    this.endInteraction();
  }

  /** PageUp/PageDown: ten steps; with `snapToMarks`, the next mark, and past the last mark the bound. */
  private pageTarget(current: number, direction: 1 | -1): number {
    const marks = this.markValues;
    if (this.snapToMarks && marks.length > 0) {
      const next = direction === 1 ? marks.find((v) => v > current) : [...marks].reverse().find((v) => v < current);
      return this.clamp(next ?? (direction === 1 ? Number(this.max) : Number(this.min)));
    }
    return this.snapToStep(current + direction * PAGE_STEPS * this.stepSize);
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
    this.interactionLast = next;
    // Controlled: report only; the element shows the new value once `value` changes.
    if (this.value === undefined) this.internalValue = next;
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private beginInteraction(): void {
    this.interactionStart = this.resolvedValue;
    this.interactionLast = null;
  }

  /** `change-end` once per interaction, only when it changed the value. */
  private endInteraction(): void {
    const start = this.interactionStart;
    const last = this.interactionLast;
    this.interactionStart = null;
    this.interactionLast = null;
    if (start === null || last === null || sameValue(start, last)) return;
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change-end', { detail: { value: last }, bubbles: true, composed: true }),
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

  private get markLabelOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    return { fontFamily: this.overrides?.fontFamily, fontSize: this.overrides?.markLabelSize };
  }

  private get helperOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    return { fontFamily: this.overrides?.fontFamily, fontSize: this.overrides?.helperSize };
  }

  /** The error region: `error`, else the reported validation message, else `copy.invalid` while `invalid`. */
  private visibleMessage(): string {
    if (this.error) return this.error;
    if (this.reportedMessage) return this.reportedMessage;
    return this.invalid ? COPY_INVALID(this.label) : '';
  }

  /** Validation in the form contract's order: required, then invalid. */
  private messageFor(): string {
    if (this.isDisabled) return '';
    if (this.required && this.isAtDefault) return COPY_REQUIRED(this.label);
    if (this.error) return this.error;
    return this.invalid ? COPY_INVALID(this.label) : '';
  }

  private get isAtDefault(): boolean {
    return sameValue(this.fallbackValue, this.resolvedValue);
  }

  private syncFormValue(): void {
    if (this.isDisabled || !this.name) {
      this.internals.setFormValue(null);
      return;
    }
    const value = this.resolvedValue;
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
    // The registration and focus-on-error target is the (low) thumb.
    const anchor = this.renderRoot?.querySelector<HTMLElement>('[role="slider"]') ?? undefined;
    if (!message) {
      this.internals.setValidity({});
    } else if (this.required && this.isAtDefault) {
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

function sameValue(a: SliderValue, b: SliderValue): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a[0] === b[0] && a[1] === b[1];
  }
  return a === b;
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-slider': DsSlider;
  }
}
