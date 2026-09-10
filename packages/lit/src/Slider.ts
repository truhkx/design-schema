import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
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
  label?: string;
}

/** A single value, or `[min, max]` for `range`. */
export type SliderValue = number | [number, number];

/** Detail carried by the `change` and `change-end` CustomEvents. */
export interface SliderChangeDetail {
  value: SliderValue;
}

/** copy.minimumLabel */
const COPY_MINIMUM = (label: string): string => `${label} minimum`;
/** copy.maximumLabel */
const COPY_MAXIMUM = (label: string): string => `${label} maximum`;
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;

/** Keys handled by the keyboard model; used to know when a held key's `keyup` should end the interaction. */
const NAV_KEYS = new Set(['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

let idCounter = 0;
function nextSliderId(): string {
  idCounter += 1;
  return `ds-slider-${idCounter}`;
}

/**
 * Overridable style hooks; see the `overrides` property. `fill`, `thumbBorder`,
 * `markLabelColor`, `valueColor`, `bubbleSurface`, `bubbleText`,
 * `descriptionText`, `minTarget`, `focusRing` and `focusRingWidth` are locked
 * and excluded.
 */
export type SliderOverridableBinding =
  | 'track'
  | 'trackHeight'
  | 'trackRadius'
  | 'thumb'
  | 'thumbBorderWidth'
  | 'thumbSize'
  | 'thumbShadow'
  | 'thumbActiveScale'
  | 'mark'
  | 'markSize'
  | 'markLabelSize'
  | 'valueSize'
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
  thumbBorderWidth: '--ds-slider-thumb-border-width',
  thumbSize: '--ds-slider-thumb-size',
  thumbShadow: '--ds-slider-thumb-shadow',
  thumbActiveScale: '--ds-slider-thumb-active-scale',
  mark: '--ds-slider-mark',
  markSize: '--ds-slider-mark-size',
  markLabelSize: '--ds-slider-mark-label-size',
  valueSize: '--ds-slider-value-size',
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
 * `<ds-slider label="Volume" name="volume" min="0" max="100">` renders a label
 * row, a track with a fill, and one `<div role="slider" tabindex="0">` thumb
 * per value in its shadow root (two, sharing tab stops natively, when
 * `range`). Pointer Events with `setPointerCapture` on the track drive
 * dragging and track clicks; the full keyboard table (arrows, Page Up/Down,
 * Home/End) is implemented on each thumb. The element is form-associated
 * (`ElementInternals`, a `FormData` with two entries under `name` for a
 * range); dispatches composed `change` (`{ value }`, on every change) and
 * `change-end` (`{ value }`, once per interaction) CustomEvents.
 *
 * ## When to use
 *
 * Use a Slider for a bounded numeric value where approximate is fine and
 * immediate feedback matters. Use `range` for "between" filters. Add `marks`
 * when a few values are meaningful stops. Pair it with a NumberInput
 * (`showValue: never`) when exact entry also matters.
 *
 * @fires change - Fired on every value change while dragging or with keys, with `{ value }` in `detail`.
 * @fires change-end - Fired once when the interaction ends (pointer up, key released), with `{ value }` in `detail`.
 * @csspart label - The `<ds-text>` naming the quantity (anatomy: label).
 * @csspart description - The helper text (anatomy: description).
 * @csspart track - The track (anatomy: track).
 * @csspart fill - The filled portion of the track (anatomy: fill).
 * @csspart thumb - Each `role="slider"` thumb (anatomy: thumb).
 * @csspart value - The beside-label value text, shown when `showValue: always` (anatomy: valueText).
 * @csspart valueText - The drag/focus value bubble, shown when `showValue: hover` (anatomy: valueText).
 * @csspart tickMarks - Each tick mark (anatomy: tickMarks).
 * @csspart error - The `role="alert"` error message region (anatomy: errorMessage).
 */
@customElement('ds-slider')
export class DsSlider extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-slider-font-family);
      --ds-slider-track: var(--color-background-strong);
      --ds-slider-track-height: var(--space-1);
      --ds-slider-track-radius: var(--radius-full);
      --ds-slider-thumb: var(--color-control-background);
      --ds-slider-thumb-border-width: var(--border-width-focus);
      --ds-slider-thumb-size: var(--space-5);
      --ds-slider-thumb-shadow: var(--shadow-raised);
      --ds-slider-thumb-active-scale: var(--opacity-disabled);
      --ds-slider-mark: var(--color-border-strong);
      --ds-slider-mark-size: var(--space-1);
      --ds-slider-mark-label-size: var(--font-size-xs);
      --ds-slider-value-size: var(--font-size-sm);
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
      gap: var(--space-2);
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

    /* trackPaddingBlock: room for the thumb's minTarget hit area and halo */
    .track-wrapper {
      box-sizing: border-box;
      padding-block: var(--ds-slider-track-padding-block);
      margin-block-start: var(--ds-slider-part-gap);
    }

    :host([disabled]) .track-wrapper {
      opacity: var(--ds-slider-disabled-opacity);
    }

    /* track: color.background.strong */
    .track {
      position: relative;
      block-size: var(--ds-slider-track-height);
      border-radius: var(--ds-slider-track-radius);
      background: var(--ds-slider-track);
      touch-action: none;
    }

    /* fill: color.control.selectedBackground, locked */
    .fill {
      position: absolute;
      inset-block: 0;
      border-radius: var(--ds-slider-track-radius);
      background: var(--color-control-selected-background);
      pointer-events: none;
    }

    /* mark: color.border.strong */
    .mark {
      position: absolute;
      inset-block-start: 50%;
      inline-size: var(--ds-slider-mark-size);
      block-size: var(--ds-slider-mark-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-mark);
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* markLabelColor: color.foreground.muted, locked */
    .mark-label {
      position: absolute;
      inset-block-start: calc(var(--ds-slider-mark-size) + var(--ds-slider-part-gap));
      inset-inline-start: 50%;
      transform: translateX(-50%);
      font-size: var(--ds-slider-mark-label-size);
      color: var(--color-foreground-muted);
      white-space: nowrap;
    }

    /* minTarget: size.target.comfortable hit area, locked; visually smaller than the hit area */
    .thumb {
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
    }

    :host([disabled]) .thumb {
      cursor: not-allowed;
    }

    .thumb-visual {
      position: relative;
      box-sizing: border-box;
      inline-size: var(--ds-slider-thumb-size);
      block-size: var(--ds-slider-thumb-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-thumb);
      /* thumbBorder: color.control.selectedBackground, locked */
      border: var(--ds-slider-thumb-border-width) solid var(--color-control-selected-background);
      box-shadow: var(--ds-slider-thumb-shadow);
    }

    /* thumbActiveScale: a halo of the fill color at this opacity, thumbSize larger on each side (space.2) */
    .halo {
      position: absolute;
      inset: calc(-1 * var(--space-2));
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }
    .thumb.is-active .halo {
      opacity: var(--ds-slider-thumb-active-scale);
    }

    @media (prefers-reduced-motion: reduce) {
      .halo {
        transition: none;
      }
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, both locked */
    .thumb:focus-visible {
      outline: none;
    }
    .thumb:focus-visible .thumb-visual {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* bubbleSurface: color.inverse.surface, locked; bubbleText forwarded to the composed ds-text */
    .bubble {
      position: absolute;
      inset-block-end: calc(100% + var(--ds-slider-part-gap));
      inset-inline-start: 50%;
      transform: translateX(-50%);
      box-sizing: border-box;
      padding-block: var(--space-1);
      padding-inline: var(--space-2);
      border-radius: var(--radius-sm);
      background: var(--color-inverse-surface);
      white-space: nowrap;
      pointer-events: none;
    }

    /* errorText: color.foreground.danger */
    .error {
      margin-block-start: var(--ds-slider-part-gap);
      font-size: var(--ds-slider-helper-size);
      color: var(--ds-slider-error-text);
    }
    .error:empty {
      display: none;
    }
  `;

  /** Visible label naming the quantity. Also the accessible name (or its basis, for a range). */
  @property() label = '';

  /** Field name for the Form. A range contributes two entries under this name. */
  @property() name = '';

  /** Lower bound. */
  @property({ type: Number }) min = 0;

  /** Upper bound. */
  @property({ type: Number }) max = 100;

  /** Arrow-key increment and snapping granularity. */
  @property({ type: Number }) step = 1;

  /** With `marks`, snap drag and click to the marks instead of `step` (keys still move by step, PageUp/Down by mark). */
  @property({ type: Boolean }) snapToMarks = false;

  /** Must have a value other than the default to submit. */
  @property({ type: Boolean }) required = false;

  /** Controlled value; for a range, `[min, max]`. Omit for an uncontrolled slider. */
  @property({ attribute: false }) value?: SliderValue;

  /** Initial value (or pair) for an uncontrolled slider. Defaults to `min` (or `[min, max]`). */
  @property({ attribute: false }) defaultValue?: SliderValue;

  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  @property({ type: Boolean, reflect: true }) range = false;

  /** Renders the displayed and announced value. Defaults to the plain number. */
  @property({ attribute: false }) formatValue?: (value: number) => string;

  /** Where the value text appears: beside the label, as a bubble while dragging/focused, or never (visually). */
  @property({ reflect: true, attribute: 'show-value' }) showValue: SliderShowValue = 'always';

  /** Tick marks on the track, optionally labelled. */
  @property({ attribute: false }) marks: SliderMark[] = [];

  /** Not adjustable. Stays visible, readable and focusable (WCAG 2.1.1); interaction is guarded, not removed. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Persistent helper text. */
  @property() description?: string;

  /** Per-instance style overrides: `{ trackRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SliderOverridableBinding, TokenRef>>;

  private errorValue?: string;

  /** The error message. Setting it implies `invalid`. */
  @property()
  get error(): string | undefined {
    return this.errorValue;
  }
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Synchronous so that `checkValidity()` right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /** Marks the slider as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  /** Uncontrolled value (seeded from `defaultValue`, or the current bounds, when nothing else is set). */
  @state() private internalValue?: SliderValue;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  /** Index of the thumb currently being dragged (halo + bubble). */
  @state() private draggingIndex: number | null = null;

  /** Index of the thumb currently focused (bubble in `showValue: hover`). */
  @state() private focusedIndex: number | null = null;

  /** Set by `keydown` so the matching `keyup` knows to fire `change-end`. */
  private pendingEndIndex: number | null = null;

  private readonly instanceId = nextSliderId();

  @query('.track') private readonly trackEl!: HTMLDivElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The current value (or pair), resolved from `value`, `internalValue`, `defaultValue`, then the bounds. */
  get currentValue(): SliderValue {
    if (this.value !== undefined) {
      return this.value;
    }
    if (this.internalValue !== undefined) {
      return this.internalValue;
    }
    if (this.defaultValue !== undefined) {
      return this.defaultValue;
    }
    return this.range ? [Number(this.min), Number(this.max)] : Number(this.min);
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    return this.internals.validity;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  checkValidity(): boolean {
    this.syncInternals();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this.syncInternals();
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.value = undefined;
    this.internalValue = undefined;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state !== 'string') {
      return;
    }
    const restored = Number(state);
    if (!Number.isNaN(restored)) {
      this.value = restored;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Slider');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    this.warnInDev(changed);
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render() {
    const value = this.currentValue;
    const displayText = this.formatDisplay(value);
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : ''].filter((id) => id !== '').join(' ') ||
      undefined;
    const loPercent = this.range ? this.percentFor(this.pairValue()[0]) : 0;
    const hiPercent = this.range ? this.percentFor(this.pairValue()[1]) : this.percentFor(value as number);

    return html`
      <div class="row">
        <ds-text id=${this.labelId} part="label" size="md" weight="medium" .overrides=${this.labelTextOverrides}
          >${this.label}</ds-text
        >
        ${this.showValue === 'always'
          ? html`<ds-text part="value" size="sm" .overrides=${this.valueTextOverrides}>${displayText}</ds-text>`
          : nothing}
      </div>
      ${this.description
        ? html`<ds-text
            id="description"
            part="description"
            size="sm"
            tone="muted"
            .overrides=${this.descriptionTextOverrides}
            >${this.description}</ds-text
          >`
        : nothing}
      ${this.range
        ? html`
            <span id=${this.minLabelId} class="visually-hidden">${COPY_MINIMUM(this.label)}</span>
            <span id=${this.maxLabelId} class="visually-hidden">${COPY_MAXIMUM(this.label)}</span>
          `
        : nothing}
      <div class="track-wrapper" aria-describedby=${ifDefined(describedBy)}>
        <div
          class="track"
          part="track"
          @pointerdown=${this.handleTrackPointerDown}
          @pointermove=${this.handleTrackPointerMove}
          @pointerup=${this.handleTrackPointerUp}
          @pointercancel=${this.handleTrackPointerUp}
        >
          <div
            class="fill"
            part="fill"
            style=${styleMap({ insetInlineStart: `${loPercent}%`, inlineSize: `${hiPercent - loPercent}%` })}
          ></div>
          ${this.marks.map((mark) => this.renderMark(mark))}
          ${this.renderThumb(0)} ${this.range ? this.renderThumb(1) : nothing}
        </div>
      </div>
      <div id="error" class="error" part="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderMark(mark: SliderMark) {
    const percent = this.percentFor(mark.value);
    return html`
      <div class="mark" part="tickMarks" aria-hidden="true" style=${styleMap({ insetInlineStart: `${percent}%` })}>
        ${mark.label ? html`<span class="mark-label">${mark.label}</span>` : nothing}
      </div>
    `;
  }

  private renderThumb(index: number) {
    const isDisabled = this.isDisabled;
    const thumbValue = this.thumbValue(index);
    const percent = this.percentFor(thumbValue);
    const text = this.formatOne(thumbValue);
    const labelledBy = this.range ? (index === 0 ? this.minLabelId : this.maxLabelId) : this.labelId;
    const showBubble = this.showValue === 'hover' && (this.draggingIndex === index || this.focusedIndex === index);

    return html`
      <div
        class=${classMap({ thumb: true, 'is-active': this.draggingIndex === index })}
        part="thumb"
        role="slider"
        tabindex="0"
        aria-valuenow=${thumbValue}
        aria-valuemin=${Number(this.min)}
        aria-valuemax=${Number(this.max)}
        aria-valuetext=${text}
        aria-labelledby=${labelledBy}
        aria-orientation="horizontal"
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        style=${styleMap({ insetInlineStart: `${percent}%` })}
        @keydown=${(event: KeyboardEvent) => this.handleThumbKeydown(event, index)}
        @keyup=${(event: KeyboardEvent) => this.handleThumbKeyup(event, index)}
        @focus=${() => this.handleThumbFocus(index)}
        @blur=${() => this.handleThumbBlur(index)}
      >
        <div class="thumb-visual">
          <div class="halo"></div>
        </div>
        ${showBubble
          ? html`<div class="bubble" part="valueText">
              <ds-text size="sm" element="span" .overrides=${this.bubbleTextOverrides}>${text}</ds-text>
            </div>`
          : nothing}
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get labelId(): string {
    return `${this.instanceId}-label`;
  }

  private get minLabelId(): string {
    return `${this.instanceId}-min`;
  }

  private get maxLabelId(): string {
    return `${this.instanceId}-max`;
  }

  private get thumbEls(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.thumb'));
  }

  private pairValue(): [number, number] {
    const value = this.currentValue;
    return Array.isArray(value) ? value : [Number(this.min), Number(this.max)];
  }

  private thumbValue(index: number): number {
    return this.range ? this.pairValue()[index] : (this.currentValue as number);
  }

  private formatOne(value: number): string {
    return this.formatValue ? this.formatValue(value) : String(value);
  }

  private formatDisplay(value: SliderValue): string {
    return Array.isArray(value) ? `${this.formatOne(value[0])} – ${this.formatOne(value[1])}` : this.formatOne(value);
  }

  private percentFor(value: number): number {
    const min = Number(this.min);
    const max = Number(this.max);
    if (!(max > min)) {
      return 0;
    }
    const clamped = Math.min(max, Math.max(min, value));
    return ((clamped - min) / (max - min)) * 100;
  }

  /** Rounds to the nearest `step` from `min`, then clamps to the bounds. */
  private snap(value: number): number {
    const min = Number(this.min);
    const max = Number(this.max);
    const step = Number(this.step) || 1;
    const steps = Math.round((value - min) / step);
    const snapped = Math.min(max, Math.max(min, min + steps * step));
    return Math.round(snapped * 1e9) / 1e9;
  }

  private positionToValue(clientX: number): number {
    const rect = this.trackEl.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    const clamped = Math.min(1, Math.max(0, ratio));
    const min = Number(this.min);
    const max = Number(this.max);
    const raw = min + clamped * (max - min);
    if (this.snapToMarks && this.marks.length > 0) {
      return this.snapToNearestMark(raw);
    }
    return this.snap(raw);
  }

  /** Nearest `marks` value to `value`, used for drag/click when `snapToMarks` is set. */
  private snapToNearestMark(value: number): number {
    return this.marks.reduce(
      (nearest, mark) => (Math.abs(mark.value - value) < Math.abs(nearest - value) ? mark.value : nearest),
      this.marks[0].value,
    );
  }

  private nearestIndex(clientX: number): number {
    if (!this.range) {
      return 0;
    }
    const value = this.positionToValue(clientX);
    const [lo, hi] = this.pairValue();
    return Math.abs(value - lo) <= Math.abs(value - hi) ? 0 : 1;
  }

  private readonly handleTrackPointerDown = (event: PointerEvent): void => {
    if (this.isDisabled) {
      return;
    }
    event.preventDefault();
    const index = this.nearestIndex(event.clientX);
    this.draggingIndex = index;
    this.trackEl.setPointerCapture(event.pointerId);
    this.setThumbValue(index, this.positionToValue(event.clientX));
    this.thumbEls[index]?.focus();
  };

  private readonly handleTrackPointerMove = (event: PointerEvent): void => {
    if (this.draggingIndex === null) {
      return;
    }
    this.setThumbValue(this.draggingIndex, this.positionToValue(event.clientX));
  };

  private readonly handleTrackPointerUp = (event: PointerEvent): void => {
    if (this.draggingIndex === null) {
      return;
    }
    if (this.trackEl.hasPointerCapture(event.pointerId)) {
      this.trackEl.releasePointerCapture(event.pointerId);
    }
    this.draggingIndex = null;
    this.dispatchChangeEnd();
  };

  private handleThumbKeydown(event: KeyboardEvent, index: number): void {
    if (this.isDisabled) {
      return;
    }
    const step = Number(this.step) || 1;
    let matched = true;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        this.setThumbValue(index, this.thumbValue(index) + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        this.setThumbValue(index, this.thumbValue(index) - step);
        break;
      case 'PageUp':
        this.page(index, 1);
        break;
      case 'PageDown':
        this.page(index, -1);
        break;
      case 'Home':
        this.setThumbValue(index, Number(this.min));
        break;
      case 'End':
        this.setThumbValue(index, Number(this.max));
        break;
      default:
        matched = false;
    }
    if (matched) {
      event.preventDefault();
      this.pendingEndIndex = index;
    }
  }

  private handleThumbKeyup(event: KeyboardEvent, index: number): void {
    if (this.pendingEndIndex === index && NAV_KEYS.has(event.key)) {
      this.pendingEndIndex = null;
      this.dispatchChangeEnd();
    }
  }

  private handleThumbFocus(index: number): void {
    this.focusedIndex = index;
  }

  private handleThumbBlur(index: number): void {
    if (this.focusedIndex === index) {
      this.focusedIndex = null;
    }
  }

  /** PageUp/PageDown: ten steps, or to the next mark when `marks` is set. */
  private page(index: number, direction: 1 | -1): void {
    const current = this.thumbValue(index);
    if (this.marks.length > 0) {
      const sorted = [...this.marks.map((mark) => mark.value)].sort((a, b) => a - b);
      const next =
        direction === 1
          ? (sorted.find((candidate) => candidate > current) ?? Number(this.max))
          : ([...sorted].reverse().find((candidate) => candidate < current) ?? Number(this.min));
      this.setThumbValue(index, next);
      return;
    }
    const step = Number(this.step) || 1;
    this.setThumbValue(index, current + direction * step * 10);
  }

  private setThumbValue(index: number, raw: number): void {
    if (this.isDisabled) {
      return;
    }
    const snapped = this.snap(raw);
    if (this.range) {
      const [lo, hi] = this.pairValue();
      const next: [number, number] = index === 0 ? [Math.min(snapped, hi), hi] : [lo, Math.max(snapped, lo)];
      if (next[0] === lo && next[1] === hi) {
        return;
      }
      this.commitValue(next);
    } else {
      if (snapped === this.currentValue) {
        return;
      }
      this.commitValue(snapped);
    }
  }

  private commitValue(next: SliderValue): void {
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
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

  private get labelTextOverrides(): Partial<Record<TextOverridableBinding, TokenRef>> {
    const result: Partial<Record<TextOverridableBinding, TokenRef>> = {};
    if (this.overrides?.fontFamily) {
      result.fontFamily = this.overrides.fontFamily;
    }
    if (this.overrides?.fontSize) {
      result.fontSize = this.overrides.fontSize;
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

  private get descriptionTextOverrides(): Partial<Record<TextOverridableBinding, TokenRef>> {
    const result: Partial<Record<TextOverridableBinding, TokenRef>> = {};
    if (this.overrides?.fontFamily) {
      result.fontFamily = this.overrides.fontFamily;
    }
    if (this.overrides?.helperSize) {
      result.fontSize = this.overrides.helperSize;
    }
    return result;
  }

  /** bubbleText: color.inverse.foreground, locked — forwarded as a fixed override, like Tooltip's popup text. */
  private get bubbleTextOverrides(): Partial<Record<TextOverridableBinding, TokenRef>> {
    return { color: 'color.inverse.foreground' };
  }

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }
    const value = this.currentValue;
    if (Array.isArray(value)) {
      const formData = new FormData();
      formData.append(this.name, String(value[0]));
      formData.append(this.name, String(value[1]));
      this.internals.setFormValue(formData);
    } else {
      this.internals.setFormValue(String(value));
    }

    const anchor = this.thumbEls[0];
    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else if (this.required && this.isAtDefault) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  /** Whether the current value is still the untouched default, for `required`. */
  private get isAtDefault(): boolean {
    const initial =
      this.defaultValue !== undefined
        ? this.defaultValue
        : this.range
          ? [Number(this.min), Number(this.max)]
          : Number(this.min);
    const current = this.currentValue;
    return Array.isArray(initial) && Array.isArray(current)
      ? initial[0] === current[0] && initial[1] === current[1]
      : initial === current;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SliderOverridableBinding[]) {
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
      console.warn(`<ds-slider> needs max (${this.max}) greater than min (${this.min}).`, this);
    }
    if (changed.has('range') || changed.has('value') || changed.has('defaultValue')) {
      const value = this.value ?? this.defaultValue;
      if (value !== undefined && this.range !== Array.isArray(value)) {
        console.warn(
          `<ds-slider range=${this.range}> expects ${this.range ? 'a [min, max] pair' : 'a single number'} for value/defaultValue.`,
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
