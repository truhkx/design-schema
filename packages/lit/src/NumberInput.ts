import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';
import './Button.js';
import './Icon.js';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';
export type NumberInputSize = 'sm' | 'md';

/** Detail carried by the `change` CustomEvent. */
export interface NumberInputChangeDetail {
  /** The new numeric value; `undefined` when the field is empty. */
  value: number | undefined;
}

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`, `affixColor`,
 * `descriptionText`, `errorText`, `minTarget`, `minTargetSm` and
 * `focusRingWidth` are locked and excluded.
 */
export type NumberInputOverridableBinding =
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'stepperGap'
  | 'stepperDivider'
  | 'stepperDividerWidth'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

const HOOKS: Record<NumberInputOverridableBinding, string> = {
  borderInvalid: '--ds-number-input-border-invalid',
  borderWidth: '--ds-number-input-border-width',
  radius: '--ds-number-input-radius',
  paddingInline: '--ds-number-input-padding-inline',
  paddingBlock: '--ds-number-input-padding-block',
  affixGap: '--ds-number-input-affix-gap',
  stepperGap: '--ds-number-input-stepper-gap',
  stepperDivider: '--ds-number-input-stepper-divider',
  stepperDividerWidth: '--ds-number-input-stepper-divider-width',
  partGap: '--ds-number-input-part-gap',
  labelWeight: '--ds-number-input-label-weight',
  helperSize: '--ds-number-input-helper-size',
  fontFamily: '--ds-number-input-font-family',
  fontSize: '--ds-number-input-font-size',
  lineHeight: '--ds-number-input-line-height',
  disabledOpacity: '--ds-number-input-disabled-opacity',
};

/** copy.* — used verbatim; `{label}`, `{min}` and `{max}` are the only interpolations. */
const COPY = {
  increment: 'Increase',
  decrement: 'Decrease',
  required: '{label} is required.',
  invalid: '{label} must be a number.',
  outOfRange: '{label} must be between {min} and {max}.',
  outOfRangeMin: '{label} must be {min} or more.',
  outOfRangeMax: '{label} must be {max} or less.',
  currencyMissing: 'format "currency" needs a currency code.',
  requiredIndicator: ' (required)',
} as const;

/** The environment locale's decimal and group separators. */
function localeSeparators(): { decimal: string; group: string } {
  const parts = new Intl.NumberFormat().formatToParts(12345.6);
  return {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
  };
}

/** Decimal places in `step` (`0.01` → 2), the default `precision`. */
function decimalsInStep(step: number): number {
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

type Parsed = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number };

/**
 * Lenient parse of what people type or what the field displays: group
 * separators and any other character (currency symbol, percent sign, unit) are
 * ignored; a leading minus and the locale's or a period decimal separator are
 * kept. Text with no digits at all is `invalid`.
 */
function parseTyped(raw: string): Parsed {
  const trimmed = raw.trim();
  if (trimmed === '') return { kind: 'empty' };
  const { decimal } = localeSeparators();
  // "." is a decimal only when the locale's own decimal is absent from the text:
  // de-DE "1.234,5" is 1234.5, and "1.5" is 1.5.
  const periodIsDecimal = decimal === '.' || !trimmed.includes(decimal);
  let digits = '';
  let negative = false;
  let seenDecimal = false;
  for (const ch of trimmed) {
    if (ch >= '0' && ch <= '9') digits += ch;
    else if (ch === '-' && digits === '' && !seenDecimal) negative = true;
    else if ((ch === decimal || (ch === '.' && periodIsDecimal)) && !seenDecimal) {
      seenDecimal = true;
      digits += '.';
    }
  }
  if (!/\d/.test(digits)) return { kind: 'invalid' };
  const num = Number(`${negative ? '-' : ''}${digits.startsWith('.') ? `0${digits}` : digits}`);
  return Number.isFinite(num) ? { kind: 'number', value: num } : { kind: 'invalid' };
}

/** Whether Intl knows `unit` as a unit identifier. */
function isIntlUnit(unit: string): boolean {
  try {
    new Intl.NumberFormat(undefined, { style: 'unit', unit });
    return true;
  } catch {
    return false;
  }
}

/** A resolved CSS time (`200ms`, `0.2s`) in ms; `undefined` when it cannot be read. */
function parseTime(value: string): number | undefined {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return undefined;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** A number property read from an attribute is `null` once the attribute is removed. */
function finite(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * `<ds-number-input>` — NumberInput (category: input, APG pattern: spinbutton).
 *
 * `<ds-number-input label="Quantity" name="qty" min="1" max="99">` renders
 * Input's wrapper in its shadow root — a native `<label for>`, the description
 * Text, a bordered field and the error Text — around a single `<input
 * type="text" inputmode="decimal" role="spinbutton" autocomplete="off">`
 * carrying `aria-valuenow/min/max/text`. Optional leading/trailing text sits
 * inside the field, and (unless `hide-steppers`) two `<ds-button variant="ghost"
 * size="sm" icon-only>` steppers with minus/plus icons sit flush at its end,
 * forwarded `tabindex="-1"` so the input stays the single tab stop while the
 * buttons keep their own names in the accessibility tree — `ds-button` is
 * `aria-disabled`, never natively disabled, so a subtree hidden from assistive
 * technology around them would be focusable-but-hidden (axe `aria-hidden-focus`).
 * Typing is parsed leniently on every keystroke; on blur and Enter the
 * value is rounded to `precision`, clamped to `min`/`max` (reporting the clamp
 * with the out-of-range copy) and re-formatted with `Intl.NumberFormat`.
 *
 * The element is form-associated (`ElementInternals`, `setFormValue` with the
 * plain number as a string) and implements `DsFormField`; `<ds-form>` discovers
 * it by `data-ds-field` and submits on Enter after the commit. Dispatches a
 * composed `change` CustomEvent carrying `{ value }` (a number or `undefined`).
 *
 * ## When to use
 *
 * Use a NumberInput for any exact numeric value: quantities, amounts,
 * measurements, ages, counts. Choose `format` so the field reads as the thing
 * it holds (`currency` with a code, `percent`, a `unit`). Set `min`, `max` and
 * `step` whenever they exist. Pair with a Slider when a feel for the scale
 * helps.
 *
 * @fires change - On each valid keystroke, each step, and on blur after clamping/rounding, with `{ value }` in `detail`.
 */
@customElement('ds-number-input')
export class DsNumberInput extends LitElement {
  static formAssociated: boolean = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-number-input-border-invalid: var(--color-border-danger);
      --ds-number-input-border-width: var(--border-width-thin);
      --ds-number-input-radius: var(--radius-md);
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-affix-gap: var(--layout-gap-tight);
      --ds-number-input-stepper-gap: var(--layout-gap-none);
      --ds-number-input-stepper-divider: var(--color-border);
      --ds-number-input-stepper-divider-width: var(--border-width-thin);
      --ds-number-input-part-gap: var(--space-1);
      --ds-number-input-label-weight: var(--font-weight-medium);
      --ds-number-input-helper-size: var(--font-size-sm);
      --ds-number-input-font-family: var(--font-family-body);
      --ds-number-input-font-size: var(--font-size-md);
      --ds-number-input-line-height: var(--font-line-height-normal);
      --ds-number-input-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock by size; fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-number-input-padding-inline: var(--space-2);
      --ds-number-input-padding-block: var(--space-1);
      --ds-number-input-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-font-size: var(--font-size-md);
    }

    /* partGap: between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-number-input-part-gap);
      position: relative;
      font-family: var(--ds-number-input-font-family);
    }

    /*
     * disabledOpacity: the label, description, input and affix parts dim. The
     * description part is a wrapper this element owns, so the dimming never
     * reaches into the composed ds-text. The field frame and the error message
     * are not dimmed, and the stepper Buttons take disabled instead, dimming
     * once through their own style.
     */
    .group.disabled [data-part='label'],
    .group.disabled [data-part='description'],
    .group.disabled [data-part='input'],
    .group.disabled [data-part='prefix'],
    .group.disabled [data-part='suffix'] {
      opacity: var(--ds-number-input-disabled-opacity);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* labelWeight: font.weight.medium on the label part */
    [data-part='label'] {
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      font-weight: var(--ds-number-input-label-weight);
      line-height: var(--ds-number-input-line-height);
      color: var(--color-foreground);
    }

    /*
     * background, border (locked); borderWidth, radius, paddingInline, affixGap.
     * --field-border is the width actually drawn — borderWidth normally, and
     * focusRingWidth while the input has focus. Both paddings subtract the
     * difference, so swapping to the ring neither grows nor shifts the field.
     */
    [data-part='field'] {
      --field-border: var(--ds-number-input-border-width);
      --field-ring-delta: calc(var(--field-border) - var(--ds-number-input-border-width));
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      padding-inline: calc(var(--ds-number-input-padding-inline) - var(--field-ring-delta));
      gap: var(--ds-number-input-affix-gap);
      border: var(--field-border) solid var(--color-border-strong);
      border-radius: var(--ds-number-input-radius);
      background: var(--color-background);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'] {
        transition: none;
      }
    }

    /* minTargetSm: the field height floor at size sm */
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--size-target-min);
    }

    /* The steppers sit flush at the end of the field. */
    [data-part='field'].has-steppers {
      padding-inline-end: 0;
    }

    /*
     * borderFocus / focusRingWidth (locked): the ring is the field's own border,
     * drawn while the input matches :focus-visible — no outline, as Input.
     */
    [data-part='field']:has([data-part='input']:focus-visible) {
      --field-border: var(--border-width-focus);
      border-color: var(--color-border-focus);
    }

    /* borderInvalid */
    [data-part='field'].invalid,
    [data-part='field'].invalid:has([data-part='input']:focus-visible) {
      border-color: var(--ds-number-input-border-invalid);
    }

    /* foreground (locked); paddingBlock, fontSize, lineHeight */
    [data-part='input'] {
      flex: 1 1 auto;
      min-inline-size: 0;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      /* paddingBlock, shrunk by the focus-ring width difference inherited from the field */
      padding-block: calc(var(--ds-number-input-padding-block) - var(--field-ring-delta));
      border: 0;
      outline: none;
      background: transparent;
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      color: var(--color-foreground);
      appearance: none;
      -webkit-appearance: none;
    }

    /* placeholder: color.foreground.muted (locked) */
    [data-part='input']::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    .group.disabled [data-part='input'] {
      cursor: not-allowed;
    }

    /* affixColor: color.foreground.muted (locked) */
    [data-part='prefix'],
    [data-part='suffix'] {
      display: inline-flex;
      align-items: center;
      color: var(--color-foreground-muted);
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      white-space: nowrap;
    }

    /* stepperGap between the two Buttons; stepperDivider / stepperDividerWidth is the hairline before them */
    .steppers {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: var(--ds-number-input-stepper-gap);
      border-inline-start: var(--ds-number-input-stepper-divider-width) solid var(--ds-number-input-stepper-divider);
    }

    [data-part='decrementButton'],
    [data-part='incrementButton'] {
      display: inline-flex;
    }
  `;

  /** Visible label (visually hidden with `hideLabel`); the accessible name. */
  @property() accessor label = '';

  /** Field name for the Form. The collected value is the number, or nothing when empty. */
  @property() accessor name = '';

  /** Controlled numeric value. `null` is a controlled empty field; `undefined` leaves the field uncontrolled. */
  @property({ attribute: false }) accessor value: number | null | undefined;

  /** Initial value. */
  @property({ attribute: 'default-value', type: Number }) accessor defaultValue: number | undefined;

  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  @property({ type: Number }) accessor min: number | undefined;

  /** Upper bound. */
  @property({ type: Number }) accessor max: number | undefined;

  /** Increment for the buttons and arrow keys. Also the rounding granularity when `precision` is omitted. */
  @property({ type: Number }) accessor step = 1;

  /** Decimal places to keep and display (a whole number). Defaults to the decimals in `step`. */
  @property({ type: Number }) accessor precision: number | undefined;

  /** Locale formatting of the displayed value via Intl.NumberFormat. The underlying value is always a plain number. */
  @property({ type: String, reflect: true }) accessor format: NumberInputFormat = 'decimal';

  /** ISO 4217 code for `format: currency` (e.g. USD). */
  @property() accessor currency: string | undefined;

  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as the suffix. */
  @property() accessor unit: string | undefined;

  /** Static text before the value inside the field ("$"), when `format` cannot express it. Ignored under `format: currency`. */
  @property({ attribute: 'leading-text' }) accessor leadingText: string | undefined;

  /** Static text after the value inside the field ("kg", "%"). */
  @property({ attribute: 'trailing-text' }) accessor trailingText: string | undefined;

  /** Hide the increment/decrement buttons. Arrow keys work regardless. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-steppers' }) accessor hideSteppers = false;

  /** Example value shown while empty. */
  @property() accessor placeholder: string | undefined;

  /** Helper text. */
  @property() accessor description: string | undefined;

  /** Must have a value to submit. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Visually hide the label (it remains the accessible name). */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  @property({ type: String, reflect: true }) accessor size: NumberInputSize = 'md';

  /** Not editable, not submitted, still readable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field invalid. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue: string | undefined;

  /** Error message; implies invalid. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Synchronous, so validity is correct right after the assignment.
    if (value) {
      this.invalid = true;
    } else if (old) {
      this.invalid = false;
    }
    this.syncInternals();
  }

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** The uncontrolled value, seeded from `defaultValue` on first render. */
  @state() private accessor internalValue: number | undefined;

  /** The text in the input: formatted after a commit or step, what the user typed while typing. */
  @state() private accessor text = '';

  /** The typed text has no digits ("-", "."): copy.invalid. */
  @state() private accessor textInvalid = false;

  /** The out-of-range message from the last blur-time clamp; cleared by the next edit. */
  @state() private accessor rangeMessage: string | undefined;

  /** Which bound the last clamp hit, for the validity flag. */
  private rangeSide: 'under' | 'over' | undefined;

  /** Disabled by an owning native form / fieldset. */
  @state() private accessor formDisabled = false;

  @query('#input') private accessor inputEl!: HTMLInputElement | null;

  private readonly internals: ElementInternals = this.attachInternals();

  private seeded = false;
  /** Set while the text on screen is what the user typed, so the echo of that number does not reformat it. */
  private typing = false;
  private lastSynced: { value: number | undefined; formatKey: string } | undefined;
  private warnedCurrency = false;

  private repeatTimer: number | undefined;
  private pointerStepped = false;

  /** The committed number: `value` when controlled, the uncontrolled value otherwise. */
  get valueAsNumber(): number | undefined {
    if (this.value !== undefined) {
      return finite(this.value);
    }
    return this.seeded ? this.internalValue : finite(this.defaultValue);
  }

  /** The value `<ds-form>` collects: the plain number as a string, or `null` when empty. */
  get currentValue(): string | null {
    const num = this.valueAsNumber;
    return num === undefined ? null : String(num);
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  /** The field's own message, by validation order: error, required, invalid, range. */
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
    this.internalValue = finite(this.defaultValue);
    this.textInvalid = false;
    this.rangeMessage = undefined;
    this.typing = false;
    this.lastSynced = undefined;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (typeof restored === 'string' && this.value === undefined) {
      const parsed = parseTyped(restored);
      this.internalValue = parsed.kind === 'number' ? parsed.value : undefined;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'NumberInput');
    this.setAttribute('data-ds-field', '');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopRepeat();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.seeded) {
      this.seeded = true;
      this.internalValue = finite(this.defaultValue);
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    this.syncText();
    if (import.meta.env.DEV && this.format === 'currency' && !this.currency && !this.warnedCurrency) {
      this.warnedCurrency = true;
      console.warn(`<ds-number-input> ${COPY.currencyMissing}`, this);
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const committed = this.valueAsNumber;
    const message = this.displayedMessage;
    const isInvalid = this.invalid || this.textInvalid || message !== undefined;
    const describedBy = [this.description ? 'description' : '', message ? 'error' : ''].filter(Boolean).join(' ');
    const leading = this.resolvedLeading;
    const trailing = this.resolvedTrailing;
    const valueText =
      committed === undefined ? undefined : `${leading ?? ''}${this.display(committed)}${trailing ? ` ${trailing}` : ''}`;
    const textOverrides = this.textOverrides;
    const lo = finite(this.min);
    const hi = finite(this.max);

    return html`
      <div class=${classMap({ group: true, disabled: isDisabled })}>
        <label
          class=${classMap({ 'visually-hidden': this.hideLabel })}
          part="label"
          data-part="label"
          for="input"
          >${this.label}${this.required ? COPY.requiredIndicator : nothing}</label
        >
        ${this.description
          ? html`<div id="description" part="description" data-part="description">
              <ds-text element="p" size="sm" tone="muted" .overrides=${textOverrides}
                >${this.description}</ds-text
              >
            </div>`
          : nothing}
        <div
          class=${classMap({ 'has-steppers': !this.hideSteppers, invalid: isInvalid })}
          part="field"
          data-part="field"
        >
          ${leading
            ? html`<span part="prefix" data-part="prefix" aria-hidden="true">${leading}</span>`
            : nothing}
          <input
            id="input"
            part="input"
            data-part="input"
            type="text"
            inputmode="decimal"
            role="spinbutton"
            autocomplete="off"
            name=${this.name}
            .value=${live(this.text)}
            placeholder=${ifDefined(this.placeholder)}
            aria-valuenow=${ifDefined(committed)}
            aria-valuemin=${ifDefined(lo)}
            aria-valuemax=${ifDefined(hi)}
            aria-valuetext=${ifDefined(valueText)}
            aria-describedby=${ifDefined(describedBy || undefined)}
            aria-invalid=${ifDefined(isInvalid ? 'true' : undefined)}
            aria-required=${ifDefined(this.required ? 'true' : undefined)}
            aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
            ?readonly=${isDisabled}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            @blur=${this.handleBlur}
          />
          ${trailing
            ? html`<span part="suffix" data-part="suffix" aria-hidden="true">${trailing}</span>`
            : nothing}
          ${this.hideSteppers
            ? nothing
            : html`<span class="steppers">
                <span
                  part="decrementButton"
                  data-part="decrementButton"
                  @pointerdown=${(event: PointerEvent) => this.handleStepperPointerDown(event, -1)}
                  @pointerup=${this.stopRepeat}
                  @pointerleave=${this.endPointerStep}
                  @pointercancel=${this.endPointerStep}
                  @click=${(event: MouseEvent) => this.handleStepperClick(event, -1)}
                  @press=${this.stopInnerPress}
                  ><ds-button
                    variant="ghost"
                    size="sm"
                    icon-only
                    label=${COPY.decrement}
                    tabindex="-1"
                    ?disabled=${isDisabled || this.atMin}
                    ><ds-icon slot="leading-icon" name="minus" inline></ds-icon></ds-button
                ></span>
                <span
                  part="incrementButton"
                  data-part="incrementButton"
                  @pointerdown=${(event: PointerEvent) => this.handleStepperPointerDown(event, 1)}
                  @pointerup=${this.stopRepeat}
                  @pointerleave=${this.endPointerStep}
                  @pointercancel=${this.endPointerStep}
                  @click=${(event: MouseEvent) => this.handleStepperClick(event, 1)}
                  @press=${this.stopInnerPress}
                  ><ds-button
                    variant="ghost"
                    size="sm"
                    icon-only
                    label=${COPY.increment}
                    tabindex="-1"
                    ?disabled=${isDisabled || this.atMax}
                    ><ds-icon slot="leading-icon" name="plus" inline></ds-icon></ds-button
                ></span>
              </span>`}
        </div>
        ${message
          ? html`<ds-text
              id="error"
              role="alert"
              part="errorMessage"
              data-part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${textOverrides}
              >${message}</ds-text
            >`
          : nothing}
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get digits(): number {
    const step = finite(this.step) ?? 1;
    return Math.max(0, Math.trunc(finite(this.precision) ?? decimalsInStep(step)));
  }

  private get stepSize(): number {
    const step = finite(this.step);
    return step !== undefined && step > 0 ? step : 1;
  }

  private get unitKnown(): boolean {
    return this.format === 'unit' && !!this.unit && isIntlUnit(this.unit);
  }

  /** currency draws its own symbol, so leadingText would show two. */
  private get resolvedLeading(): string | undefined {
    return this.format === 'currency' ? undefined : this.leadingText || undefined;
  }

  /** An unknown unit falls back to decimal formatting and shows the literal as trailingText. */
  private get resolvedTrailing(): string | undefined {
    if (this.trailingText) return this.trailingText;
    return this.format === 'unit' && this.unit && !this.unitKnown ? this.unit : undefined;
  }

  private get atMin(): boolean {
    const lo = finite(this.min);
    const current = this.valueAsNumber;
    return lo !== undefined && current !== undefined && current <= lo;
  }

  private get atMax(): boolean {
    const hi = finite(this.max);
    const current = this.valueAsNumber;
    return hi !== undefined && current !== undefined && current >= hi;
  }

  private display(num: number): string {
    const base: Intl.NumberFormatOptions = { minimumFractionDigits: this.digits, maximumFractionDigits: this.digits };
    if (this.format === 'currency') {
      return new Intl.NumberFormat(undefined, { ...base, style: 'currency', currency: this.currency || 'USD' }).format(num);
    }
    // percent stores the number as typed (25) and divides by 100 only for display.
    if (this.format === 'percent') {
      return new Intl.NumberFormat(undefined, { ...base, style: 'percent' }).format(num / 100);
    }
    if (this.unitKnown) {
      return new Intl.NumberFormat(undefined, { ...base, style: 'unit', unit: this.unit! }).format(num);
    }
    return new Intl.NumberFormat(undefined, base).format(num);
  }

  /** Reformat whenever the committed value or its formatting changes, except for the echo of the user's own typing. */
  private syncText(): void {
    const committed = this.valueAsNumber;
    const formatKey = `${this.format}|${this.digits}|${this.currency ?? ''}|${this.unit ?? ''}`;
    const prev = this.lastSynced;
    if (prev && Object.is(prev.value, committed) && prev.formatKey === formatKey) return;
    this.lastSynced = { value: committed, formatKey };
    if (prev && this.typing && prev.formatKey === formatKey) {
      const typed = parseTyped(this.text);
      if (Object.is(typed.kind === 'number' ? typed.value : undefined, committed)) return;
    }
    this.typing = false;
    this.text = committed === undefined ? '' : this.display(committed);
    this.textInvalid = false;
  }

  /** The message by the doc's precedence: error, required, invalid, then a reported clamp. */
  private get message(): string | undefined {
    const withLabel = (copy: string): string => copy.replace('{label}', this.label);
    if (this.error) return this.error;
    if (this.required && this.valueAsNumber === undefined && !this.textInvalid) return withLabel(COPY.required);
    if (this.invalid || this.textInvalid) return withLabel(COPY.invalid);
    return this.rangeMessage;
  }

  /** The error text shown: every message except a required miss the user has not been told about yet. */
  private get displayedMessage(): string | undefined {
    const message = this.message;
    if (message === undefined) return undefined;
    if (this.error || this.invalid || this.textInvalid || this.rangeMessage) return message;
    return undefined;
  }

  private rangeCopy(): string {
    const lo = finite(this.min);
    const hi = finite(this.max);
    const withLabel = (copy: string): string => copy.replace('{label}', this.label);
    if (lo !== undefined && hi !== undefined) {
      return withLabel(COPY.outOfRange).replace('{min}', this.display(lo)).replace('{max}', this.display(hi));
    }
    if (lo !== undefined) return withLabel(COPY.outOfRangeMin).replace('{min}', this.display(lo));
    return withLabel(COPY.outOfRangeMax).replace('{max}', hi === undefined ? '' : this.display(hi));
  }

  private clamp(num: number): number {
    const lo = finite(this.min);
    const hi = finite(this.max);
    let next = num;
    if (lo !== undefined && next < lo) next = lo;
    if (hi !== undefined && next > hi) next = hi;
    return next;
  }

  /** Reports a changed value: uncontrolled fields show it at once, controlled ones once `value` is rebound. */
  private report(next: number | undefined): void {
    if (Object.is(next, this.valueAsNumber)) return;
    if (this.value === undefined) {
      this.internalValue = next;
    } else {
      this.requestUpdate();
    }
    this.dispatchEvent(
      new CustomEvent<NumberInputChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private stepBy(delta: number): void {
    if (this.isDisabled) return;
    const current = this.valueAsNumber;
    const lo = finite(this.min);
    const hi = finite(this.max);
    // From empty, up goes to `min ?? 0` and down to `max ?? 0`.
    const target = current === undefined ? (delta > 0 ? (lo ?? 0) : (hi ?? 0)) : current + delta;
    this.typing = false;
    this.textInvalid = false;
    this.rangeMessage = undefined;
    this.report(this.clamp(roundTo(target, this.digits)));
  }

  private setTo(target: number): void {
    if (this.isDisabled) return;
    this.typing = false;
    this.textInvalid = false;
    this.rangeMessage = undefined;
    this.report(roundTo(target, this.digits));
  }

  /** Blur and Enter: round to precision, clamp, reformat, and report a clamp rather than hide it. */
  private commit(): void {
    this.typing = false;
    const parsed = parseTyped(this.inputEl?.value ?? this.text);
    if (parsed.kind !== 'number') {
      this.textInvalid = parsed.kind === 'invalid';
      this.rangeMessage = undefined;
      this.report(undefined);
      if (parsed.kind === 'empty') this.text = '';
      return;
    }
    const rounded = roundTo(parsed.value, this.digits);
    const next = this.clamp(rounded);
    this.textInvalid = false;
    this.rangeSide = next === rounded ? undefined : next > rounded ? 'under' : 'over';
    this.rangeMessage = next === rounded ? undefined : this.rangeCopy();
    this.report(next);
    const shown = this.valueAsNumber;
    this.text = shown === undefined ? '' : this.display(shown);
  }

  private handleInput(event: Event): void {
    if (this.isDisabled) return;
    const raw = (event.currentTarget as HTMLInputElement).value;
    this.typing = true;
    this.text = raw;
    this.rangeMessage = undefined;
    const parsed = parseTyped(raw);
    // Keystrokes that do not yet form a number ("-", ".") are left alone until blur.
    if (parsed.kind === 'invalid') return;
    this.textInvalid = false;
    this.report(parsed.kind === 'number' ? parsed.value : undefined);
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (this.isDisabled) return;
    const step = this.stepSize;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.stepBy(step);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.stepBy(-step);
        break;
      case 'PageUp':
        event.preventDefault();
        this.stepBy(step * 10);
        break;
      case 'PageDown':
        event.preventDefault();
        this.stepBy(-step * 10);
        break;
      case 'Home': {
        const lo = finite(this.min);
        if (lo !== undefined) {
          event.preventDefault();
          this.setTo(lo);
        }
        break;
      }
      case 'End': {
        const hi = finite(this.max);
        if (hi !== undefined) {
          event.preventDefault();
          this.setTo(hi);
        }
        break;
      }
      case 'Enter':
        // Commit only; the keydown bubbles on to an enclosing <ds-form>, which submits the committed number.
        this.commit();
        break;
      default:
        break;
    }
  }

  private handleBlur(): void {
    if (!this.isDisabled) this.commit();
  }

  private readonly stopInnerPress = (event: Event): void => {
    // The steppers are internal; the composite reports `change`, not the Buttons' `press`.
    event.stopPropagation();
  };

  private readonly stopRepeat = (): void => {
    if (this.repeatTimer !== undefined) {
      window.clearTimeout(this.repeatTimer);
      this.repeatTimer = undefined;
    }
  };

  /** A press that ends without a click (the pointer left the button) must not swallow the next one. */
  private readonly endPointerStep = (): void => {
    this.stopRepeat();
    this.pointerStepped = false;
  };

  /** Hold-to-repeat timings read from the resolved theme at pointerdown; `undefined` steps once. */
  private repeatTimings(): { delay: number; interval: number } | undefined {
    const style = getComputedStyle(this);
    const delay = parseTime(style.getPropertyValue('--motion-duration-base'));
    const interval = parseTime(style.getPropertyValue('--motion-duration-fast'));
    return delay !== undefined && interval !== undefined && delay > 0 && interval > 0 ? { delay, interval } : undefined;
  }

  private handleStepperPointerDown(event: PointerEvent, direction: 1 | -1): void {
    // Keep focus where it is: the input stays the single tab stop.
    event.preventDefault();
    this.stopRepeat();
    this.pointerStepped = true;
    if (this.isDisabled || (direction > 0 ? this.atMax : this.atMin)) return;
    this.stepBy(direction * this.stepSize);
    const timings = this.repeatTimings();
    if (!timings) return;
    const tick = (): void => {
      if (this.isDisabled || (direction > 0 ? this.atMax : this.atMin)) {
        this.stopRepeat();
        return;
      }
      this.stepBy(direction * this.stepSize);
      this.repeatTimer = window.setTimeout(tick, timings.interval);
    };
    this.repeatTimer = window.setTimeout(tick, timings.delay);
  }

  private handleStepperClick(event: MouseEvent, direction: 1 | -1): void {
    // A pointer press already stepped; a click with no pointer (assistive tech, synthetic) steps here.
    if (this.pointerStepped) {
      this.pointerStepped = false;
      return;
    }
    event.preventDefault();
    if (this.isDisabled || (direction > 0 ? this.atMax : this.atMin)) return;
    this.stepBy(direction * this.stepSize);
  }

  /** helperSize, fontFamily and lineHeight forwarded to the description and error Text. */
  private get textOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const o = this.overrides;
    if (!o) return undefined;
    return { fontSize: o.helperSize, fontFamily: o.fontFamily, lineHeight: o.lineHeight };
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as NumberInputOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  /** Mirror value and validity into ElementInternals so an owning form sees them. */
  private syncInternals(): void {
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }
    this.internals.setFormValue(this.currentValue);
    const anchor = this.inputEl ?? undefined;
    const message = this.message;
    if (message === undefined) {
      this.internals.setValidity({});
    } else if (!this.error && this.required && this.valueAsNumber === undefined && !this.textInvalid) {
      this.internals.setValidity({ valueMissing: true }, message, anchor);
    } else if (!this.error && !this.invalid && !this.textInvalid && this.rangeMessage) {
      const flags: ValidityStateFlags = this.rangeSide === 'under' ? { rangeUnderflow: true } : { rangeOverflow: true };
      this.internals.setValidity(flags, message, anchor);
    } else {
      this.internals.setValidity({ customError: true }, message, anchor);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-number-input': DsNumberInput;
  }
}
