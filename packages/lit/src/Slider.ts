import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type SliderShowValue = 'always' | 'hover' | 'never';

/** One entry of `marks`: a tick on the track, optionally labelled. */
export interface SliderMark {
  value: number;
  label?: string | undefined;
}

/** A single value, or the low and high values of a range. */
export type SliderValue = number | [number, number];

/** Detail carried by the `change` and `change-end` CustomEvents. */
export interface SliderChangeDetail {
  /** The new value, or the low and high values of a range. */
  value: SliderValue;
}

/**
 * Overridable style hooks; see the `overrides` property. `fill`, `thumbBorder`,
 * `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`,
 * `bubbleText`, `descriptionText`, `errorText`, `minTarget`, `focusRing` and
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
  | 'disabledOpacity'
  | 'transition';

/**
 * `fontSize`, `labelWeight`, `helperSize` and `valueSize` have no hook of their
 * own: they are forwarded to the composed Texts' `overrides`.
 */
const HOOKS: Record<SliderOverridableBinding, string | undefined> = {
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
  valueSize: undefined,
  bubblePaddingBlock: '--ds-slider-bubble-padding-block',
  bubblePaddingInline: '--ds-slider-bubble-padding-inline',
  bubbleOffset: '--ds-slider-bubble-offset',
  bubbleRadius: '--ds-slider-bubble-radius',
  labelWeight: undefined,
  partGap: '--ds-slider-part-gap',
  labelGap: '--ds-slider-label-gap',
  trackPaddingBlock: '--ds-slider-track-padding-block',
  fontFamily: '--ds-slider-font-family',
  fontSize: undefined,
  helperSize: undefined,
  disabledOpacity: '--ds-slider-disabled-opacity',
  transition: '--ds-slider-transition',
};

/**
 * copy.* — used verbatim; `{label}`, `{low}` and `{high}` are the only
 * interpolations. `pageUpAction`, `pageDownAction`, `homeAction` and `endAction`
 * are React Native accessibility action labels: web and Lit do not render them.
 */
const COPY = {
  minimumLabel: '{label} minimum',
  maximumLabel: '{label} maximum',
  rangeText: '{low} – {high}',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  pageUpAction: 'Increase by a page',
  pageDownAction: 'Decrease by a page',
  homeAction: 'Set to minimum',
  endAction: 'Set to maximum',
} as const;

/** PageUp/PageDown move by ten steps. */
const PAGE_STEPS = 10;

/** One warning per bad `min:max` pair, so a re-render does not repeat it. */
const warnedRanges = new Set<string>();

/** Decimal places in `step` (`0.1` → 1), so arithmetic on it stays exact. */
function decimalsIn(step: number): number {
  const str = String(step);
  const exp = /e-(\d+)$/.exec(str);
  if (exp) return Number(exp[1]);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

function roundTo(num: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(num * factor) / factor;
}

/** A number property read from an attribute is `null` once the attribute is removed. */
function finite(value: number | null | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Any value as a low/high pair; a single value sits on both ends. */
function toPair(value: SliderValue): [number, number] {
  return Array.isArray(value) ? value : [value, value];
}

function sameValue(a: SliderValue, b: SliderValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
  return a === b;
}

/**
 * `<ds-slider>` — Slider (category: input, APG pattern: slider-multithumb).
 *
 * `<ds-slider label="Price range" name="price" range min="0" max="500" step="10">`
 * renders a label row (the label `<ds-text>` carrying the id `aria-labelledby`
 * resolves within the one shadow root, and the value Text when
 * `show-value="always"`), a track with a fill sized from the value, optional
 * tick marks and their labels, and one or two thumbs — each a
 * `<div role="slider" tabindex="0">` carrying `aria-valuenow/min/max/text` and
 * positioned by percentage. A range's thumbs are named from
 * `copy.minimumLabel` / `copy.maximumLabel`, cannot cross, and each reports the
 * live constraint from the other as its own bound. Pointer Events on the track
 * area move the nearest thumb (ties go to the low thumb) with pointer capture;
 * the keyboard table is implemented on each thumb. Pointer math is logical, so
 * a right-to-left slider mirrors.
 *
 * The element is form-associated (`ElementInternals`) and implements
 * `DsFormField`: `currentValue` is the decimal string, or two strings for a
 * range, which `setFormValue` submits as two `FormData` entries of the same
 * name. `<ds-form>` discovers it by `data-ds-field`; the Lit form contract has
 * no interaction-end hook, so under `validate: blur` it validates on focusout.
 * Dispatches composed `change` on every value change and `change-end` once per
 * interaction that changed the value, both carrying numbers.
 *
 * ## When to use
 *
 * Use a Slider for a bounded numeric value where approximate is fine and
 * immediate feedback matters: volume, brightness, a price range, a zoom level.
 * Use `range` for "between" filters, `marks` when a few values are meaningful
 * stops, and `show-value="never"` when a NumberInput beside it shows the value.
 * Reach for NumberInput instead whenever the value must be exact or is usually
 * typed.
 *
 * @fires change - On every value change while dragging or with keys, with `{ value }` in `detail`.
 * @fires change-end - Once when an interaction that changed the value ends, with `{ value }` in `detail`.
 */
@customElement('ds-slider')
export class DsSlider extends LitElement {
  static formAssociated: boolean = true;

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
      --ds-slider-mark-size: var(--space-2);
      --ds-slider-mark-label-size: var(--font-size-xs);
      --ds-slider-mark-label-gap: var(--space-1);
      --ds-slider-bubble-padding-block: var(--space-1);
      --ds-slider-bubble-padding-inline: var(--space-2);
      --ds-slider-bubble-offset: var(--space-1);
      --ds-slider-bubble-radius: var(--radius-sm);
      --ds-slider-part-gap: var(--space-1);
      --ds-slider-label-gap: var(--space-2);
      --ds-slider-track-padding-block: var(--space-3);
      --ds-slider-font-family: var(--font-family-body);
      --ds-slider-disabled-opacity: var(--opacity-disabled);
      --ds-slider-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: between the label row, the track area and the messages */
    .root {
      display: grid;
      gap: var(--ds-slider-part-gap);
      font-family: var(--ds-slider-font-family);
    }

    /* disabledOpacity: the whole slider stays readable, only dimmer */
    .root.disabled {
      opacity: var(--ds-slider-disabled-opacity);
    }

    /* labelGap: between the label and the value text */
    .label-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--ds-slider-label-gap);
    }

    /* markLabelGap: the track area and the mark label row, outside partGap */
    .track-column {
      display: grid;
      gap: var(--ds-slider-mark-label-gap);
    }

    /*
     * trackPaddingBlock pads the hit area around the rail, never the rail
     * itself, so the thumb and its halo have room and the touch target reaches
     * the comfortable size.
     */
    .track-area {
      position: relative;
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

    /* fill: color.control.selectedBackground (locked) */
    [data-part='fill'] {
      position: absolute;
      inset-block: 0;
      border-radius: var(--ds-slider-track-radius);
      background: var(--color-control-selected-background);
    }

    /* tickMarks: a layer on the track centre line */
    [data-part='tickMarks'] {
      position: absolute;
      inset: 0;
    }

    /* mark, markSize */
    .mark {
      position: absolute;
      inset-block-start: 50%;
      margin-block-start: calc(var(--ds-slider-mark-size) / -2);
      inline-size: var(--ds-slider-mark-size);
      block-size: var(--ds-slider-mark-size);
      border-radius: var(--radius-full);
      background: var(--ds-slider-mark);
    }

    /* The slider grows by one label line only when some mark is labelled. */
    .mark-labels {
      position: relative;
      block-size: calc(var(--ds-slider-mark-label-size) * var(--font-line-height-normal));
    }

    /* A zero-width centring box, so the label centres on its mark in both directions. */
    .mark-label {
      position: absolute;
      inset-block-start: 0;
      inline-size: 0;
      display: flex;
      justify-content: center;
    }

    .mark-label > * {
      white-space: nowrap;
    }

    /* minTarget (locked): the hit area, centred on the knob */
    [data-part='thumb'] {
      position: absolute;
      inset-block-start: 50%;
      margin-block-start: calc(var(--size-target-comfortable) / -2);
      inline-size: var(--size-target-comfortable);
      block-size: var(--size-target-comfortable);
      outline: none;
      touch-action: none;
    }

    /*
     * thumbActiveScale is not a scale: the pressed thumb shows a halo of the
     * fill colour at that opacity, thumbSize + 2 × haloSpread across. It is
     * drawn before the knob, so the knob paints over it.
     */
    [data-part='thumb']::before {
      content: '';
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      inline-size: calc(var(--ds-slider-thumb-size) + var(--ds-slider-halo-spread) * 2);
      block-size: calc(var(--ds-slider-thumb-size) + var(--ds-slider-halo-spread) * 2);
      margin-block-start: calc((var(--ds-slider-thumb-size) + var(--ds-slider-halo-spread) * 2) / -2);
      margin-inline-start: calc((var(--ds-slider-thumb-size) + var(--ds-slider-halo-spread) * 2) / -2);
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      opacity: 0;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }

    [data-part='thumb'].pressed::before {
      opacity: var(--ds-slider-thumb-active-scale);
    }

    /* thumb, thumbSize, thumbShadow; thumbBorder / thumbBorderWidth (locked) */
    [data-part='thumb']::after {
      content: '';
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      box-sizing: border-box;
      inline-size: var(--ds-slider-thumb-size);
      block-size: var(--ds-slider-thumb-size);
      margin-block-start: calc(var(--ds-slider-thumb-size) / -2);
      margin-inline-start: calc(var(--ds-slider-thumb-size) / -2);
      border: var(--border-width-focus) solid var(--color-control-selected-background);
      border-radius: var(--radius-full);
      background: var(--ds-slider-thumb);
      box-shadow: var(--ds-slider-thumb-shadow);
    }

    /* focusRing / focusRingWidth (locked): a ring around the knob, not the hit area */
    [data-part='thumb']:focus-visible::after {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* bubbleOffset: above the top of the thumb's hit area, centred on the knob */
    .bubble-anchor {
      position: absolute;
      inset-block-end: calc(50% + var(--size-target-comfortable) / 2 + var(--ds-slider-bubble-offset));
      inline-size: 0;
      display: flex;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transition: opacity var(--ds-slider-transition) var(--motion-easing-standard);
    }

    .bubble-anchor.shown {
      opacity: 1;
    }

    /*
     * bubbleSurface / bubbleText (locked): an inverse-surface pill, with
     * --color-foreground re-scoped so the Text inside reads as inverse.
     */
    [data-part='bubble'] {
      --color-foreground: var(--color-inverse-foreground);
      padding-block: var(--ds-slider-bubble-padding-block);
      padding-inline: var(--ds-slider-bubble-padding-inline);
      border-radius: var(--ds-slider-bubble-radius);
      background: var(--color-inverse-surface);
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='thumb']::before,
      .bubble-anchor {
        transition: none;
      }
    }
  `;

  /** Visible label naming the quantity ("Volume", "Price range"); the accessible name of the thumbs. */
  @property() accessor label = '';

  /** Field name for the Form. A single value submits as one decimal string, a range as two under this name. */
  @property() accessor name = '';

  /** Lower bound. */
  @property({ type: Number }) accessor min = 0;

  /** Upper bound. */
  @property({ type: Number }) accessor max = 100;

  /** Arrow-key increment and snapping granularity for drag, click and keys. */
  @property({ type: Number }) accessor step = 1;

  /** With `marks`, snap drag and click to the marks instead of `step`. */
  @property({ type: Boolean, reflect: true, attribute: 'snap-to-marks' }) accessor snapToMarks = false;

  /** Must have a value other than the default to submit. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Marks the slider invalid; independent of `error`. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  /** Controlled value; for a range, a two-number array. */
  @property({ attribute: false }) accessor value: SliderValue | undefined;

  /** Initial value (or pair). Defaults to `min` (or `[min, max]`). */
  @property({ attribute: false }) accessor defaultValue: SliderValue | undefined;

  /** Two thumbs choosing a minimum and a maximum; the thumbs cannot cross. */
  @property({ type: Boolean, reflect: true }) accessor range = false;

  /** Renders the displayed and announced value ("$40", "3 h 20 min"). Defaults to the number. */
  @property({ attribute: false }) accessor formatValue: ((value: number) => string) | undefined;

  /** Where the value text appears: beside the label, as a bubble while pressed or focused, or nowhere. */
  @property({ type: String, reflect: true, attribute: 'show-value' }) accessor showValue: SliderShowValue = 'always';

  /** Tick marks on the track, optionally labelled. */
  @property({ attribute: false }) accessor marks: SliderMark[] | undefined;

  /** Not adjustable, still readable: the thumbs stay focusable and nothing is submitted. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Helper text. */
  @property() accessor description: string | undefined;

  /** Error message. Setting it never changes the `invalid` prop; both make the slider aria-invalid. */
  @property() accessor error: string | undefined;

  /** Per-instance style overrides: `{ trackHeight: 'space.2' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SliderOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** The uncontrolled value; `undefined` falls back to `defaultValue`. */
  @state() private accessor internalValue: SliderValue | undefined;

  /** The thumb being dragged, for the halo and the bubble. */
  @state() private accessor pressedIndex: 0 | 1 | undefined;

  /** The thumb holding focus (any focus, not only :focus-visible), for the bubble. */
  @state() private accessor focusedIndex: 0 | 1 | undefined;

  /** Disabled by an owning native form / fieldset. */
  @state() private accessor formDisabled = false;

  @query('[data-part="track"]') private accessor trackEl!: HTMLElement | null;

  private readonly internals: ElementInternals = this.attachInternals();

  /** The value last emitted in the running interaction; the comparison baseline within it. */
  private emitted: SliderValue | undefined;

  private interactionChanged = false;

  /** The value `<ds-form>` collects: the decimal string, or two strings for a range. */
  get currentValue(): string | string[] | null {
    if (this.isDisabled) return null;
    const current = this.resolvedValue;
    return Array.isArray(current) ? [String(current[0]), String(current[1])] : String(current);
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  /** The field's own message, by validation order: error, required, invalid. */
  get validationMessage(): string {
    return this.message ?? '';
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
    this.internalValue = undefined;
    this.emitted = undefined;
    this.interactionChanged = false;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (this.value !== undefined) return;
    if (typeof restored === 'string') {
      const num = Number(restored);
      if (Number.isFinite(num)) this.internalValue = num;
      return;
    }
    if (restored instanceof FormData && this.name) {
      const entries = restored.getAll(this.name).filter((entry): entry is string => typeof entry === 'string');
      const low = Number(entries[0]);
      const high = Number(entries[1]);
      if (Number.isFinite(low) && Number.isFinite(high)) this.internalValue = [low, high];
      else if (Number.isFinite(low)) this.internalValue = low;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Slider');
    this.setAttribute('data-ds-field', '');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (import.meta.env.DEV) {
      this.warnInvalidRange();
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render(): TemplateResult {
    const disabled = this.isDisabled;
    const pair = toPair(this.resolvedValue);
    const message = this.displayedMessage;
    const invalid = this.invalid || (this.error !== undefined && this.error !== '');
    const describedBy = [this.description ? 'description' : '', message ? 'error' : ''].filter(Boolean).join(' ');
    const o = this.overrides;
    const labelOverrides = this.textOverrides({
      fontSize: o?.fontSize,
      fontWeight: o?.labelWeight,
      fontFamily: o?.fontFamily,
    });
    const valueOverrides = this.textOverrides({ fontSize: o?.valueSize, fontFamily: o?.fontFamily });
    const helperOverrides = this.textOverrides({ fontSize: o?.helperSize, fontFamily: o?.fontFamily });
    const markOverrides = this.textOverrides({ fontSize: o?.markLabelSize, fontFamily: o?.fontFamily });
    const marks = this.marks ?? [];
    const labelledMarks = marks.filter((mark) => mark.label !== undefined && mark.label !== '');

    return html`
      <!--
        disabledOpacity dims the whole root, so the whole root is the inactive
        user interface component WCAG 1.4.3 exempts from contrast. aria-disabled
        says so on the element that dims, not only on the thumbs; without it the
        dimmed value text reads to axe as failing text rather than as inactive.
      -->
      <div class=${classMap({ root: true, disabled })} aria-disabled=${ifDefined(disabled ? 'true' : undefined)}>
        <div class="label-row">
          <ds-text
            id="label"
            part="label"
            data-part="label"
            element="span"
            size="md"
            weight="medium"
            tone="default"
            .overrides=${labelOverrides}
            >${this.label}</ds-text
          >
          ${this.showValue === 'always'
            ? html`<ds-text
                part="valueText"
                data-part="valueText"
                element="span"
                size="sm"
                tone="default"
                .overrides=${valueOverrides}
                >${this.valueLabel}</ds-text
              >`
            : nothing}
        </div>
        <div class="track-column">
          <div
            class="track-area"
            @pointerdown=${this.handlePointerDown}
            @pointermove=${this.handlePointerMove}
            @pointerup=${this.handlePointerUp}
            @pointercancel=${this.handlePointerUp}
          >
            <div part="track" data-part="track">
              <div
                part="fill"
                data-part="fill"
                style=${styleMap({
                  insetInlineStart: `${this.range ? this.percent(pair[0]) : 0}%`,
                  inlineSize: `${this.percent(pair[1]) - (this.range ? this.percent(pair[0]) : 0)}%`,
                })}
              ></div>
              ${marks.length > 0
                ? html`<div part="tickMarks" data-part="tickMarks" aria-hidden="true">
                    ${marks.map(
                      (mark) => html`<span
                        class="mark"
                        style=${styleMap({
                          insetInlineStart: `calc(${this.percent(this.clamp(mark.value))}% - var(--ds-slider-mark-size) / 2)`,
                        })}
                      ></span>`,
                    )}
                  </div>`
                : nothing}
              ${this.renderThumb(0, pair, disabled, invalid, describedBy)}
              ${this.range ? this.renderThumb(1, pair, disabled, invalid, describedBy) : nothing}
              ${this.showValue === 'hover'
                ? html`${this.renderBubble(0, pair, valueOverrides)}
                  ${this.range ? this.renderBubble(1, pair, valueOverrides) : nothing}`
                : nothing}
            </div>
          </div>
          ${labelledMarks.length > 0
            ? html`<div class="mark-labels" aria-hidden="true">
                ${labelledMarks.map(
                  (mark) => html`<span
                    class="mark-label"
                    style=${styleMap({ insetInlineStart: `${this.percent(this.clamp(mark.value))}%` })}
                    ><ds-text element="span" size="xs" tone="muted" .overrides=${markOverrides}
                      >${mark.label}</ds-text
                    ></span
                  >`,
                )}
              </div>`
            : nothing}
        </div>
        ${this.description
          ? html`<ds-text
              id="description"
              part="description"
              data-part="description"
              element="span"
              size="sm"
              tone="muted"
              .overrides=${helperOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        ${message
          ? html`<div role="alert">
              <ds-text
                id="error"
                part="errorMessage"
                data-part="errorMessage"
                element="span"
                size="sm"
                tone="danger"
                .overrides=${helperOverrides}
                >${message}</ds-text
              >
            </div>`
          : nothing}
      </div>
    `;
  }

  /**
   * One thumb: the slider element itself, named by the label (single) or by the
   * minimum/maximum copy (range), and bounded by the other thumb in a range.
   */
  private renderThumb(
    index: 0 | 1,
    pair: [number, number],
    disabled: boolean,
    invalid: boolean,
    describedBy: string,
  ): TemplateResult {
    const current = pair[index];
    const low = this.range && index === 1 ? pair[0] : this.minValue;
    const high = this.range && index === 0 ? pair[1] : this.maxValue;
    const thumbLabel = this.range
      ? (index === 0 ? COPY.minimumLabel : COPY.maximumLabel).replace('{label}', this.label)
      : undefined;

    return html`<div
      id=${ifDefined(index === 0 ? 'thumb' : undefined)}
      part="thumb"
      data-part="thumb"
      class=${classMap({ pressed: this.pressedIndex === index })}
      role="slider"
      tabindex="0"
      aria-orientation="horizontal"
      aria-valuenow=${String(current)}
      aria-valuemin=${String(low)}
      aria-valuemax=${String(high)}
      aria-valuetext=${this.format(current)}
      aria-label=${ifDefined(thumbLabel)}
      aria-labelledby=${ifDefined(thumbLabel === undefined ? 'label' : undefined)}
      aria-describedby=${ifDefined(describedBy || undefined)}
      aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
      aria-invalid=${ifDefined(invalid ? 'true' : undefined)}
      aria-required=${ifDefined(this.required ? 'true' : undefined)}
      style=${styleMap({
        insetInlineStart: `calc(${this.percent(current)}% - var(--size-target-comfortable) / 2)`,
      })}
      @keydown=${(event: KeyboardEvent) => this.handleKeydown(event, index)}
      @keyup=${this.handleKeyup}
      @focus=${() => this.handleThumbFocus(index)}
      @blur=${() => this.handleThumbBlur(index)}
    ></div>`;
  }

  /**
   * The value bubble above a thumb under `show-value="hover"`. It stays
   * rendered while inactive so `transition` can fade it, and is always
   * aria-hidden: the thumb's `aria-valuetext` announces the same value.
   */
  private renderBubble(
    index: 0 | 1,
    pair: [number, number],
    valueOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined,
  ): TemplateResult {
    const shown = this.pressedIndex === index || this.focusedIndex === index;
    return html`<span
      class=${classMap({ 'bubble-anchor': true, shown })}
      aria-hidden="true"
      style=${styleMap({ insetInlineStart: `${this.percent(pair[index])}%` })}
      ><span part="bubble" data-part="bubble"
        ><ds-text element="span" size="sm" tone="default" .overrides=${valueOverrides}
          >${this.format(pair[index])}</ds-text
        ></span
      ></span
    >`;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get minValue(): number {
    return finite(this.min, 0);
  }

  private get maxValue(): number {
    const high = finite(this.max, 100);
    return high > this.minValue ? high : this.minValue;
  }

  private get stepSize(): number {
    const step = finite(this.step, 1);
    return step > 0 ? step : 1;
  }

  /** Mark values, clamped into the bounds and in ascending order. */
  private get markValues(): number[] {
    return (this.marks ?? []).map((mark) => this.clamp(mark.value)).sort((a, b) => a - b);
  }

  /** The displayed value: `value` when controlled, the uncontrolled value otherwise, always normalized. */
  private get resolvedValue(): SliderValue {
    return this.normalizeValue(this.value ?? this.internalValue ?? this.defaultValue);
  }

  /** The value the slider falls back to, which `required` compares against. */
  private get pristineValue(): SliderValue {
    return this.normalizeValue(this.defaultValue);
  }

  /** The value text beside the label: one formatted number, or the range copy. */
  private get valueLabel(): string {
    const current = this.resolvedValue;
    return Array.isArray(current)
      ? COPY.rangeText.replace('{low}', this.format(current[0])).replace('{high}', this.format(current[1]))
      : this.format(current);
  }

  private format(value: number): string {
    const formatter = this.formatValue;
    return formatter ? formatter(value) : String(value);
  }

  private clamp(value: number): number {
    return Math.min(this.maxValue, Math.max(this.minValue, value));
  }

  private percent(value: number): number {
    const span = this.maxValue - this.minValue;
    return span > 0 ? ((value - this.minValue) / span) * 100 : 0;
  }

  /**
   * Clamp into the bounds, order a pair, and fill in the fallback for an absent
   * value. Named `normalizeValue` because `normalize` is an HTMLElement member.
   */
  private normalizeValue(raw: SliderValue | undefined): SliderValue {
    if (this.range) {
      // A number where a pair belongs is a shape mismatch: fall back to the
      // range's own default, silently — only `max <= min` warns.
      const pair: [number, number] = Array.isArray(raw) ? raw : [this.minValue, this.maxValue];
      const low = this.clamp(finite(pair[0], this.minValue));
      const high = this.clamp(finite(pair[1], this.maxValue));
      return low <= high ? [low, high] : [high, low];
    }
    // The mirror mismatch — a pair on a single-thumb slider — falls back to `min`.
    if (Array.isArray(raw)) return this.minValue;
    return this.clamp(finite(raw, this.minValue));
  }

  /** Snap a raw value to the marks (with `snapToMarks`) or to the step grid. */
  private snap(raw: number): number {
    const clamped = this.clamp(raw);
    const marks = this.markValues;
    if (this.snapToMarks && marks.length > 0) {
      let best = marks[0]!;
      for (const mark of marks) {
        if (Math.abs(mark - clamped) < Math.abs(best - clamped)) best = mark;
      }
      return best;
    }
    const step = this.stepSize;
    const steps = Math.round((clamped - this.minValue) / step);
    return this.clamp(roundTo(this.minValue + steps * step, decimalsIn(step)));
  }

  /** The first mark past `from` in `direction`; the bound itself past the last one. */
  private markPast(from: number, direction: 1 | -1): number {
    const marks = this.markValues;
    if (direction > 0) return marks.find((mark) => mark > from) ?? this.maxValue;
    return [...marks].reverse().find((mark) => mark < from) ?? this.minValue;
  }

  /** The live value of one thumb: the last emitted one inside an interaction, the displayed one otherwise. */
  private thumbValue(index: 0 | 1): number {
    return toPair(this.emitted ?? this.resolvedValue)[index];
  }

  /** Move one thumb, keeping a range ordered: neither thumb may cross the other. */
  private setThumb(index: 0 | 1, raw: number): void {
    if (this.isDisabled) return;
    const pair = toPair(this.emitted ?? this.resolvedValue);
    const next = this.clamp(raw);
    if (!this.range) {
      this.emit(next);
      return;
    }
    if (index === 0) this.emit([Math.min(next, pair[1]), pair[1]]);
    else this.emit([pair[0], Math.max(next, pair[0])]);
  }

  /**
   * Reports a changed value against the last one emitted in this interaction:
   * an uncontrolled slider shows it at once, a controlled one once `value` is
   * rebound.
   */
  private emit(next: SliderValue): void {
    if (sameValue(next, this.emitted ?? this.resolvedValue)) return;
    this.emitted = next;
    this.interactionChanged = true;
    if (this.value === undefined) this.internalValue = next;
    else this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  /** Pointer up, key up: `change-end` fires once, and only for an interaction that moved the value. */
  private endInteraction(): void {
    const emitted = this.emitted;
    const changed = this.interactionChanged;
    this.emitted = undefined;
    this.interactionChanged = false;
    if (!changed || emitted === undefined) return;
    this.dispatchEvent(
      new CustomEvent<SliderChangeDetail>('change-end', { detail: { value: emitted }, bubbles: true, composed: true }),
    );
  }

  private handleKeydown(event: KeyboardEvent, index: 0 | 1): void {
    if (this.isDisabled) return;
    const step = this.stepSize;
    const digits = decimalsIn(step);
    const current = this.thumbValue(index);
    // ArrowLeft/ArrowRight are mirrored in a right-to-left layout, read from the
    // host's computed direction at keydown, as in Tabs and SegmentedControl.
    // ArrowUp/ArrowDown and the Page keys are never mirrored.
    const rtl = getComputedStyle(this).direction === 'rtl';
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.setThumb(index, roundTo(current + (rtl ? -step : step), digits));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.setThumb(index, roundTo(current + step, digits));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.setThumb(index, roundTo(current + (rtl ? step : -step), digits));
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.setThumb(index, roundTo(current - step, digits));
        break;
      case 'PageUp':
        event.preventDefault();
        this.setThumb(
          index,
          this.snapToMarks && this.markValues.length > 0
            ? this.markPast(current, 1)
            : roundTo(current + step * PAGE_STEPS, digits),
        );
        break;
      case 'PageDown':
        event.preventDefault();
        this.setThumb(
          index,
          this.snapToMarks && this.markValues.length > 0
            ? this.markPast(current, -1)
            : roundTo(current - step * PAGE_STEPS, digits),
        );
        break;
      case 'Home':
        event.preventDefault();
        this.setThumb(index, this.minValue);
        break;
      case 'End':
        event.preventDefault();
        this.setThumb(index, this.maxValue);
        break;
      default:
        break;
    }
  }

  private handleKeyup(): void {
    this.endInteraction();
  }

  private handleThumbFocus(index: 0 | 1): void {
    this.focusedIndex = index;
  }

  private handleThumbBlur(index: 0 | 1): void {
    if (this.focusedIndex === index) this.focusedIndex = undefined;
    // A key held while focus moves away still ends its interaction.
    this.endInteraction();
  }

  /** The thumb the press belongs to: the nearest one, the low thumb on a tie. */
  private nearestThumb(target: number): 0 | 1 {
    if (!this.range) return 0;
    const [low, high] = toPair(this.resolvedValue);
    if (target < low) return 0;
    if (target > high) return 1;
    return target - low <= high - target ? 0 : 1;
  }

  /** Pointer position → a snapped value; logical, so right-to-left mirrors. */
  private valueFromPointer(clientX: number): number | undefined {
    const track = this.trackEl;
    if (!track) return undefined;
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return undefined;
    let ratio = (clientX - rect.left) / rect.width;
    if (getComputedStyle(this).direction === 'rtl') ratio = 1 - ratio;
    return this.snap(this.minValue + ratio * (this.maxValue - this.minValue));
  }

  private handlePointerDown(event: PointerEvent): void {
    if (this.isDisabled || !event.isPrimary) return;
    const target = this.valueFromPointer(event.clientX);
    if (target === undefined) return;
    const index = this.nearestThumb(target);
    // Keep the press from selecting text; focus moves to the thumb explicitly.
    event.preventDefault();
    this.pressedIndex = index;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.thumbAt(index)?.focus();
    this.setThumb(index, target);
  }

  private handlePointerMove(event: PointerEvent): void {
    const index = this.pressedIndex;
    if (index === undefined || this.isDisabled) return;
    const target = this.valueFromPointer(event.clientX);
    if (target === undefined) return;
    this.setThumb(index, target);
  }

  private handlePointerUp(event: PointerEvent): void {
    if (this.pressedIndex === undefined) return;
    const area = event.currentTarget as HTMLElement;
    if (area.hasPointerCapture(event.pointerId)) area.releasePointerCapture(event.pointerId);
    this.pressedIndex = undefined;
    this.endInteraction();
  }

  private thumbAt(index: number): HTMLElement | null {
    return this.renderRoot.querySelectorAll<HTMLElement>('[data-part="thumb"]')[index] ?? null;
  }

  /** Validity order: `error`, then a required miss, then `invalid`. */
  private get message(): string | undefined {
    if (this.error) return this.error;
    if (this.valueMissing) return COPY.required.replace('{label}', this.label);
    if (this.invalid) return COPY.invalid.replace('{label}', this.label);
    return undefined;
  }

  /** `copy.required` is not rendered standalone: it appears once validation reports it. */
  private get displayedMessage(): string | undefined {
    if (this.error) return this.error;
    if (!this.invalid) return undefined;
    return this.message;
  }

  /** A required slider still sitting on its default has no value to submit. */
  private get valueMissing(): boolean {
    return this.required && sameValue(this.resolvedValue, this.pristineValue);
  }

  private textOverrides(
    forwarded: Partial<Record<TextOverridableBinding, TokenRef | undefined>>,
  ): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    return this.overrides ? forwarded : undefined;
  }

  /**
   * A shape mismatch between `range` and `value`/`defaultValue` falls back
   * silently; `max <= min` is the one case the doc asks to warn about.
   */
  private warnInvalidRange(): void {
    const min = finite(this.min, 0);
    const max = finite(this.max, 100);
    if (max > min) return;
    const pair = `${min}:${max}`;
    if (warnedRanges.has(pair)) return;
    warnedRanges.add(pair);
    console.warn(`<ds-slider>: \`max\` (${max}) must be greater than \`min\` (${min}).`);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SliderOverridableBinding[]) {
      const hook = HOOKS[binding];
      if (hook === undefined) continue;
      const ref = this.overrides?.[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }

  /** Mirror the value and validity into ElementInternals so an owning form sees them. */
  private syncInternals(): void {
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }
    const current = this.currentValue;
    if (Array.isArray(current)) {
      if (this.name) {
        const data = new FormData();
        for (const entry of current) data.append(this.name, entry);
        this.internals.setFormValue(data);
      } else {
        this.internals.setFormValue(null);
      }
    } else {
      this.internals.setFormValue(current);
    }
    const anchor = this.thumbAt(0) ?? undefined;
    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.valueMissing) {
      this.internals.setValidity({ valueMissing: true }, COPY.required.replace('{label}', this.label), anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY.invalid.replace('{label}', this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-slider': DsSlider;
  }
}
