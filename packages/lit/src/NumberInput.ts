import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';
import './Button.js';
import './Icon.js';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';

/** Detail carried by the `change` CustomEvent. */
export interface NumberInputChangeDetail {
  value: number | undefined;
}

/** Negates a boolean attribute: `hide-steppers` present means `showSteppers` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `affixColor`, `descriptionText`,
 * `errorText`, `minTarget` and `focusRingWidth` are locked and excluded.
 */
export type NumberInputOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'stepperGap'
  | 'stepperDivider'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

const HOOKS: Record<NumberInputOverridableBinding, string> = {
  borderFocus: '--ds-number-input-border-focus',
  borderInvalid: '--ds-number-input-border-invalid',
  borderWidth: '--ds-number-input-border-width',
  radius: '--ds-number-input-radius',
  paddingInline: '--ds-number-input-padding-inline',
  paddingBlock: '--ds-number-input-padding-block',
  affixGap: '--ds-number-input-affix-gap',
  stepperGap: '--ds-number-input-stepper-gap',
  stepperDivider: '--ds-number-input-stepper-divider',
  partGap: '--ds-number-input-part-gap',
  labelWeight: '--ds-number-input-label-weight',
  helperSize: '--ds-number-input-helper-size',
  fontFamily: '--ds-number-input-font-family',
  fontSize: '--ds-number-input-font-size',
  lineHeight: '--ds-number-input-line-height',
  disabledOpacity: '--ds-number-input-disabled-opacity',
};

/** copy.increment */
const COPY_INCREMENT = 'Increase';
/** copy.decrement */
const COPY_DECREMENT = 'Decrease';
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} must be a number.`;
/** copy.outOfRange */
const COPY_OUT_OF_RANGE = (label: string, min: number, max: number): string => `${label} must be between ${min} and ${max}.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Keys handled by the keyboard model, all acting on the first (only) tab stop, the input itself. */
const STEP_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']);

let idCounter = 0;
function nextNumberInputId(): string {
  idCounter += 1;
  return `ds-number-input-${idCounter}`;
}

/**
 * `<ds-number-input>` — NumberInput (category: input, APG pattern: spinbutton).
 *
 * `<ds-number-input label="Quantity" name="qty" min="1" max="99">` renders a
 * label, description, and a bordered field in its shadow root holding an
 * optional prefix, a single `<input type="text" inputmode="decimal"
 * role="spinbutton">`, an optional suffix, and (when `showSteppers`) two
 * `<ds-button ghost sm icon-only>` steppers separated from the field by a
 * hairline, `tabindex="-1"` and `aria-hidden` since the arrow keys on the
 * input do their job. Typing is sanitized to digits, a leading minus and one
 * decimal separator as it happens; the value is parsed on every keystroke and
 * re-formatted with `Intl.NumberFormat` (honoring `format`) on blur, after
 * rounding to `precision` and clamping to `min`/`max`. The element is
 * form-associated (`ElementInternals`) and implements `DsFormField`.
 * Dispatches a composed `change` CustomEvent carrying `{ value }` (a number or
 * `undefined`) in `detail`.
 *
 * ## When to use
 *
 * Use a NumberInput for any exact numeric value: quantities, amounts,
 * measurements, ages, counts. Choose `format` so the field reads as the thing
 * it holds. Set `min`, `max` and `step` whenever they exist. Pair with a
 * Slider when a feel for the scale helps.
 *
 * @fires change - Fired on every valid keystroke, on each step, and on blur after clamping/rounding, with `{ value }` in `detail`.
 * @csspart label - The `<ds-text>` naming the quantity (anatomy: label).
 * @csspart description - The helper text (anatomy: description).
 * @csspart field - The bordered wrapper (anatomy: field).
 * @csspart input - The native `<input>` (anatomy: input).
 * @csspart prefix - Static text before the value (anatomy: prefix).
 * @csspart suffix - Static text after the value (anatomy: suffix).
 * @csspart decrementButton - The decrement `<ds-button>` (anatomy: decrementButton).
 * @csspart incrementButton - The increment `<ds-button>` (anatomy: incrementButton).
 * @csspart errorMessage - The `role="alert"` error message region (anatomy: errorMessage).
 */
@customElement('ds-number-input')
export class DsNumberInput extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-number-input-font-family);
      --ds-number-input-border-focus: var(--color-border-focus);
      --ds-number-input-border-invalid: var(--color-border-danger);
      --ds-number-input-border-width: var(--border-width-thin);
      --ds-number-input-radius: var(--radius-md);
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-affix-gap: var(--layout-gap-tight);
      --ds-number-input-stepper-gap: var(--layout-gap-none);
      --ds-number-input-stepper-divider: var(--color-border);
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

    /* background: color.background, locked; border: color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      inline-size: 100%;
      margin-block-start: var(--ds-number-input-part-gap);
      padding-inline-start: var(--ds-number-input-padding-inline);
      border: var(--ds-number-input-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-number-input-radius);
      background: var(--color-background);
      gap: var(--ds-number-input-affix-gap);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field {
        transition: none;
      }
    }

    .field:not(.has-steppers) {
      padding-inline-end: var(--ds-number-input-padding-inline);
    }

    /* focusRingWidth (locked) / borderFocus */
    .field:focus-within {
      border-color: var(--ds-number-input-border-focus);
      outline: var(--border-width-focus) solid var(--ds-number-input-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* borderInvalid: color.border.danger */
    :host([invalid]) .field {
      border-color: var(--ds-number-input-border-invalid);
    }
    :host([invalid]) .field:focus-within {
      border-color: var(--ds-number-input-border-invalid);
    }

    /* disabledOpacity: opacity.disabled; the field stays focusable and readable (readonly, not disabled) */
    .field.disabled {
      opacity: var(--ds-number-input-disabled-opacity);
      cursor: not-allowed;
    }

    /* foreground: color.foreground, locked */
    .input {
      flex: 1 1 auto;
      min-inline-size: 0;
      box-sizing: border-box;
      min-block-size: var(--size-target-comfortable);
      margin: 0;
      padding: 0;
      padding-block: var(--ds-number-input-padding-block);
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

    /* placeholder: color.foreground.muted, locked */
    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    .field.disabled .input {
      cursor: not-allowed;
    }

    /* affixColor: color.foreground.muted, locked */
    .affix {
      display: inline-flex;
      align-items: center;
      color: var(--color-foreground-muted);
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      white-space: nowrap;
    }

    /* stepperDivider: color.border; stepperGap: layout.gap.none between the two buttons */
    .steppers {
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
      gap: var(--ds-number-input-stepper-gap);
      border-inline-start: var(--border-width-thin) solid var(--ds-number-input-stepper-divider);
    }

    .stepper {
      align-self: stretch;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-number-input-helper-size);
      line-height: var(--ds-number-input-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-number-input-part-gap);
    }
  `;

  /** Visible label naming the quantity. Its accessible-name basis (via `aria-labelledby`; see class doc). */
  @property() label = '';

  /** Field name for the Form. The collected value is a number, or undefined when empty. */
  @property() name = '';

  /** Lower bound. Clamps on blur/Enter; disables the decrement stepper at it. */
  @property({ type: Number }) min?: number;

  /** Upper bound. Clamps on blur/Enter; disables the increment stepper at it. */
  @property({ type: Number }) max?: number;

  /** Increment for the steppers and arrow keys, and the rounding granularity when `precision` is omitted. */
  @property({ type: Number }) step = 1;

  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  @property({ type: Number }) precision?: number;

  /** Locale formatting of the displayed value. The underlying value is always a plain number. */
  @property({ reflect: true }) format: NumberInputFormat = 'decimal';

  /** ISO 4217 code for `format: currency`. */
  @property() currency?: string;

  /** Intl unit identifier for `format: unit`, or a literal shown as `suffix` when it is not one. */
  @property() unit?: string;

  /**
   * Static text before the value, for cases `format` cannot express. Typed
   * `string | null` (not `| undefined`) because it collides with the native,
   * readonly `Element.prefix` (namespace prefix) that `DsNumberInput`
   * inherits; `null` means no prefix.
   */
  @property({ type: String }) prefix: string | null = null;

  /** Static text after the value. */
  @property() suffix?: string;

  /** Shows the increment/decrement steppers. Arrow keys work regardless. Exposed as the negated `hide-steppers` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  @property({ attribute: 'hide-steppers', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  showSteppers = true;

  /** Example value shown while empty. */
  @property() placeholder?: string;

  /** Helper text. */
  @property() description?: string;

  /** Controlled numeric value. `undefined` means empty. */
  @property({ attribute: false }) value?: number;

  /** Initial value for an uncontrolled field. */
  @property({ attribute: false }) defaultValue?: number;

  /** Must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Not editable, not submitted, still readable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Marks the field invalid. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  private errorValue?: string;

  /** Error message; implies `invalid`. */
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

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef>>;

  /** Uncontrolled value, seeded from `defaultValue` through the `currentValue` fallback chain. */
  @state() private internalValue?: number;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  /** Whether the input currently has focus; drives raw-text vs. formatted display. */
  @state() private isFocused = false;

  /** The uncommitted, sanitized text shown while focused. */
  @state() private rawText = '';

  private readonly instanceId = nextNumberInputId();

  private repeatTimeoutId?: number;
  private repeatIntervalId?: number;

  @query('#input') private readonly inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The current value, resolved from `value`, `internalValue`, then `defaultValue`. */
  get currentValue(): number | undefined {
    if (this.value !== undefined) {
      return this.value;
    }
    if (this.internalValue !== undefined) {
      return this.internalValue;
    }
    return this.defaultValue;
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
    // Both cleared: `currentValue` falls back to `defaultValue`, matching a native reset.
    this.value = undefined;
    this.internalValue = undefined;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state !== 'string' || state === '') {
      return;
    }
    const restored = Number(state);
    if (Number.isFinite(restored)) {
      this.value = restored;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'NumberInput');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearRepeat();
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
    const isDisabled = this.disabled || this.formDisabled;
    const value = this.currentValue;
    const displayText = this.isFocused ? this.rawText : value !== undefined ? this.formatDisplay(value) : '';
    const valueText = value !== undefined ? this.formatDisplay(value) : undefined;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : ''].filter((id) => id !== '').join(' ') ||
      undefined;

    return html`
      <ds-text id=${this.labelId} part="label" weight="medium" .overrides=${this.labelTextOverrides}
        >${this.label}${this.required
          ? html`<span aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
          : nothing}</ds-text
      >
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
      <div class=${classMap({ field: true, disabled: isDisabled, 'has-steppers': this.showSteppers })} part="field">
        ${this.prefix ? html`<span class="affix" part="prefix">${this.prefix}</span>` : nothing}
        <input
          id="input"
          part="input"
          class="input"
          type="text"
          inputmode="decimal"
          role="spinbutton"
          autocomplete="off"
          name=${this.name}
          .value=${live(displayText)}
          placeholder=${ifDefined(this.placeholder)}
          aria-labelledby=${this.labelId}
          aria-describedby=${ifDefined(describedBy)}
          aria-valuenow=${ifDefined(value)}
          aria-valuemin=${ifDefined(this.min)}
          aria-valuemax=${ifDefined(this.max)}
          aria-valuetext=${ifDefined(valueText)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          ?readonly=${isDisabled}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}
        />
        ${this.suffix ? html`<span class="affix" part="suffix">${this.suffix}</span>` : nothing}
        ${this.showSteppers
          ? html`
              <div class="steppers">
                <ds-button
                  class="stepper"
                  part="decrementButton"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${COPY_DECREMENT}
                  tabindex="-1"
                  aria-hidden="true"
                  ?disabled=${isDisabled || this.atMin}
                  @pointerdown=${(event: PointerEvent) => this.handleStepperPointerDown(event, -1)}
                  @press=${this.stopInnerPress}
                >
                  <ds-icon slot="leading-icon" name="minus" inline></ds-icon>
                </ds-button>
                <ds-button
                  class="stepper"
                  part="incrementButton"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${COPY_INCREMENT}
                  tabindex="-1"
                  aria-hidden="true"
                  ?disabled=${isDisabled || this.atMax}
                  @pointerdown=${(event: PointerEvent) => this.handleStepperPointerDown(event, 1)}
                  @press=${this.stopInnerPress}
                >
                  <ds-icon slot="leading-icon" name="plus" inline></ds-icon>
                </ds-button>
              </div>
            `
          : nothing}
      </div>
      <div id="error" class="error" part="errorMessage" role="alert">${this.error ?? ''}</div>
    `;
  }

  private get labelId(): string {
    return `${this.instanceId}-label`;
  }

  private get atMin(): boolean {
    return this.min !== undefined && this.currentValue !== undefined && this.currentValue <= this.min;
  }

  private get atMax(): boolean {
    return this.max !== undefined && this.currentValue !== undefined && this.currentValue >= this.max;
  }

  private get resolvedPrecision(): number {
    if (this.precision !== undefined) {
      return this.precision;
    }
    const text = String(this.step);
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : text.length - dot - 1;
  }

  private readonly stopInnerPress = (event: Event): void => {
    // The steppers are internal pointer conveniences; their `press` should not read as a
    // consumer-facing event alongside the `change` this component already dispatches.
    event.stopPropagation();
  };

  private handleFocus(): void {
    this.isFocused = true;
    const value = this.currentValue;
    this.rawText = value !== undefined ? this.plainString(value) : '';
  }

  private handleBlur(): void {
    this.commit();
    this.isFocused = false;
  }

  private handleInput(): void {
    if (this.disabled || this.formDisabled) {
      return;
    }
    this.rawText = this.sanitizeInput(this.inputEl.value);
    this.commitValue(this.parseNumber(this.rawText));
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.formDisabled) {
      return;
    }
    if (STEP_KEYS.has(event.key)) {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : -1;
      const multiplier = event.key === 'PageUp' || event.key === 'PageDown' ? 10 : 1;
      this.adjustValue(direction, multiplier);
      return;
    }
    if (event.key === 'Home' && this.min !== undefined) {
      event.preventDefault();
      this.commitAndSync(this.min);
      return;
    }
    if (event.key === 'End' && this.max !== undefined) {
      event.preventDefault();
      this.commitAndSync(this.max);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commit();
      // Light-DOM ancestor: `<ds-form>` collects fields by querying its own subtree, so this
      // reaches it directly without crossing a shadow boundary.
      const form = this.closest('ds-form') as (HTMLElement & { submit?: () => void }) | null;
      form?.submit?.();
    }
  }

  private readonly handleStepperPointerDown = (event: PointerEvent, direction: 1 | -1): void => {
    if (this.disabled || this.formDisabled) {
      return;
    }
    // Keeps focus off the button, so the input stays the field's single tab stop.
    event.preventDefault();
    this.adjustValue(direction, 1);
    this.clearRepeat();
    this.repeatTimeoutId = window.setTimeout(() => {
      this.repeatIntervalId = window.setInterval(
        () => this.adjustValue(direction, 1),
        this.durationMs('--motion-duration-fast', 120),
      );
    }, this.durationMs('--motion-duration-base', 200));
    const stop = (): void => {
      this.clearRepeat();
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  private clearRepeat(): void {
    if (this.repeatTimeoutId !== undefined) {
      window.clearTimeout(this.repeatTimeoutId);
      this.repeatTimeoutId = undefined;
    }
    if (this.repeatIntervalId !== undefined) {
      window.clearInterval(this.repeatIntervalId);
      this.repeatIntervalId = undefined;
    }
  }

  private durationMs(varName: string, fallback: number): number {
    const raw = getComputedStyle(this).getPropertyValue(varName).trim();
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  /** ArrowUp/Down and PageUp/Down by `step` (×10 for Page), and stepper presses. */
  private adjustValue(direction: 1 | -1, multiplier: number): void {
    const current = this.currentValue;
    const next = current === undefined ? (direction === 1 ? (this.min ?? 0) : (this.max ?? 0)) : current + direction * this.step * multiplier;
    const resolved = this.roundToPrecision(this.clampToBounds(next));
    if (resolved === current) {
      return;
    }
    this.commitValue(resolved);
    this.rawText = this.plainString(resolved);
  }

  /** Home/End: jump straight to a defined bound. */
  private commitAndSync(target: number): void {
    const resolved = this.roundToPrecision(target);
    this.commitValue(resolved);
    this.rawText = this.plainString(resolved);
  }

  /** Rounds and clamps the typed value on blur/Enter, reporting `outOfRange` when required and clamped. */
  private commit(): void {
    const parsed = this.parseNumber(this.rawText);
    if (parsed === undefined) {
      this.commitValue(undefined);
      return;
    }
    const rounded = this.roundToPrecision(parsed);
    const clamped = this.clampToBounds(rounded);
    if (this.required && this.min !== undefined && this.max !== undefined && clamped !== rounded) {
      this.error = COPY_OUT_OF_RANGE(this.label, this.min, this.max);
    }
    this.commitValue(clamped);
    this.rawText = this.plainString(clamped);
  }

  private commitValue(next: number | undefined): void {
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<NumberInputChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private clampToBounds(value: number): number {
    let result = value;
    if (this.min !== undefined) {
      result = Math.max(this.min, result);
    }
    if (this.max !== undefined) {
      result = Math.min(this.max, result);
    }
    return result;
  }

  private roundToPrecision(value: number): number {
    const factor = 10 ** this.resolvedPrecision;
    return Math.round(value * factor) / factor;
  }

  /** Keeps digits, a leading minus, and one decimal separator (the locale's, or a period). */
  private sanitizeInput(raw: string): string {
    const decimalSep = this.localeDecimalSeparator();
    let out = '';
    let seenDecimal = false;
    for (const ch of raw) {
      if (ch === '-' && out === '') {
        out += ch;
      } else if (ch >= '0' && ch <= '9') {
        out += ch;
      } else if (!seenDecimal && (ch === '.' || ch === decimalSep)) {
        out += ch;
        seenDecimal = true;
      }
    }
    return out;
  }

  private parseNumber(text: string): number | undefined {
    if (text === '' || text === '-') {
      return undefined;
    }
    const decimalSep = this.localeDecimalSeparator();
    const normalized = decimalSep === '.' ? text : text.replace(decimalSep, '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private plainString(value: number): string {
    const decimalSep = this.localeDecimalSeparator();
    const fixed = value.toFixed(this.resolvedPrecision);
    return decimalSep === '.' ? fixed : fixed.replace('.', decimalSep);
  }

  private localeDecimalSeparator(): string {
    const part = new Intl.NumberFormat().formatToParts(1.1).find((entry) => entry.type === 'decimal');
    return part?.value ?? '.';
  }

  private formatDisplay(value: number): string {
    const precision = this.resolvedPrecision;
    if (this.format === 'percent') {
      return this.safeFormat({ style: 'percent' }, value / 100, value);
    }
    if (this.format === 'currency') {
      return this.safeFormat({ style: 'currency', currency: this.currency ?? 'USD' }, value, value);
    }
    if (this.format === 'unit' && this.unit) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'unit',
          unit: this.unit,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value);
      } catch {
        return `${this.plainFormat(value)} ${this.unit}`;
      }
    }
    return this.plainFormat(value);
  }

  private plainFormat(value: number): string {
    const precision = this.resolvedPrecision;
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  }

  private safeFormat(options: Intl.NumberFormatOptions, formatValue: number, fallbackValue: number): string {
    const precision = this.resolvedPrecision;
    try {
      return new Intl.NumberFormat(undefined, {
        ...options,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(formatValue);
    } catch {
      return this.plainFormat(fallbackValue);
    }
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

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    const isDisabled = this.disabled || this.formDisabled;
    if (isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }

    const value = this.currentValue;
    this.internals.setFormValue(value === undefined ? null : String(value));

    const anchor = this.inputEl;
    if (!anchor) {
      return;
    }

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else if (this.required && value === undefined) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
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

  private warnInDev(changed: PropertyValues): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (
      (changed.has('min') || changed.has('max')) &&
      this.min !== undefined &&
      this.max !== undefined &&
      this.max < this.min
    ) {
      console.warn(`<ds-number-input> needs max (${this.max}) greater than or equal to min (${this.min}).`, this);
    }
    if (changed.has('format') && this.format === 'currency' && !this.currency) {
      console.warn('<ds-number-input format="currency"> should set `currency` (e.g. "USD"); defaulting to USD.', this);
    }
    if (changed.has('format') && this.format === 'unit' && !this.unit) {
      console.warn('<ds-number-input format="unit"> requires `unit` to format with Intl; it will show as plain.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-number-input': DsNumberInput;
  }
}
