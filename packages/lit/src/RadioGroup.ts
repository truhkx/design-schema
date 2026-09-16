import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { TextOverridableBinding } from './Text.js';
import './Text.js';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** Shape of each entry in `options`. */
export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
}

/** Detail carried by the `change` CustomEvent. */
export interface RadioGroupChangeDetail {
  /** The value of the selected option. */
  value: string;
}

/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Overridable style hooks; see the `overrides` property. `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type RadioGroupOverridableBinding =
  | 'controlBorderWidth'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'optionGap'
  | 'listGap'
  | 'partGap'
  | 'legendSize'
  | 'legendWeight'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<RadioGroupOverridableBinding, string> = {
  controlBorderWidth: '--ds-radio-group-control-border-width',
  controlBorderInvalid: '--ds-radio-group-control-border-invalid',
  controlSize: '--ds-radio-group-control-size',
  controlRadius: '--ds-radio-group-control-radius',
  optionGap: '--ds-radio-group-option-gap',
  listGap: '--ds-radio-group-list-gap',
  partGap: '--ds-radio-group-part-gap',
  legendSize: '--ds-radio-group-legend-size',
  legendWeight: '--ds-radio-group-legend-weight',
  labelSize: '--ds-radio-group-label-size',
  labelWeight: '--ds-radio-group-label-weight',
  helperSize: '--ds-radio-group-helper-size',
  fontFamily: '--ds-radio-group-font-family',
  lineHeight: '--ds-radio-group-line-height',
  disabledOpacity: '--ds-radio-group-disabled-opacity',
  transition: '--ds-radio-group-transition',
};

/** Keys a disabled group swallows so native radio movement and selection stay inert. */
const GUARDED_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' ']);

/**
 * `<ds-radio-group>` — RadioGroup (category: input, APG pattern: radio).
 *
 * `<ds-radio-group name="plan" label="Plan" .options=${[...]}>` renders a
 * `<fieldset role="radiogroup">` with a `<legend>` and one native
 * `<input type="radio">` per option inside its shadow root, where the shared
 * `name` groups them natively: roving tabindex, arrow movement and Space come
 * from the browser and are not reimplemented. Per-option `disabled` is the
 * native attribute so arrow movement skips it; a `disabled` group uses
 * `aria-disabled` plus click, key and change guards so it stays focusable but
 * inert. The indicator dot is the radio's `::after` and has no hook.
 *
 * The element is form-associated (`setFormValue(value)`) and carries
 * `data-ds-field`, so `<ds-form>` collects the selected value, or no key while
 * nothing is selected. The inner native `change` is not composed, so a composed
 * `change` CustomEvent with `{ value }` is re-dispatched from the host.
 *
 * ## When to use
 *
 * Use a RadioGroup when the user must pick exactly one of two to about seven
 * options and seeing them all helps the decision — plan tiers, shipping
 * methods. Give options a `description` when the label alone does not tell
 * them apart. Leave the group unselected when the choice is consequential and
 * you want a deliberate answer.
 *
 * @fires change - Fired when the selection changes, with `{ value }` in `detail`.
 */
@customElement('ds-radio-group')
export class DsRadioGroup extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--ds-radio-group-font-family);
      --ds-radio-group-control-border-width: var(--border-width-thin);
      --ds-radio-group-control-border-invalid: var(--color-border-danger);
      --ds-radio-group-control-size: var(--space-5);
      --ds-radio-group-control-radius: var(--radius-full);
      --ds-radio-group-option-gap: var(--space-2);
      --ds-radio-group-list-gap: var(--space-2);
      --ds-radio-group-part-gap: var(--space-1);
      --ds-radio-group-legend-size: var(--font-size-md);
      --ds-radio-group-legend-weight: var(--font-weight-medium);
      --ds-radio-group-label-size: var(--font-size-md);
      --ds-radio-group-label-weight: var(--font-weight-regular);
      --ds-radio-group-helper-size: var(--font-size-sm);
      --ds-radio-group-font-family: var(--font-family-body);
      --ds-radio-group-line-height: var(--font-line-height-normal);
      --ds-radio-group-disabled-opacity: var(--opacity-disabled);
      --ds-radio-group-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: between legend, description, list and error */
    fieldset {
      display: flex;
      flex-direction: column;
      gap: var(--ds-radio-group-part-gap);
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    /* legendColor, legendSize, legendWeight. A <legend> does not take part in the fieldset's flex gap, so partGap below it is a margin. */
    legend {
      margin-block-end: var(--ds-radio-group-part-gap);
      padding: 0;
      font-size: var(--ds-radio-group-legend-size);
      font-weight: var(--ds-radio-group-legend-weight);
      line-height: var(--ds-radio-group-line-height);
      color: var(--color-foreground);
    }

    /* listGap: between options; horizontal wraps rather than overflows */
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--ds-radio-group-list-gap);
    }
    :host([orientation='horizontal']) .list {
      flex-direction: row;
      flex-wrap: wrap;
    }

    /* minTarget: each option row is the hit area; optionGap between radio and label */
    .option {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-radio-group-option-gap);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    .radio {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--ds-radio-group-control-size);
      block-size: var(--ds-radio-group-control-size);
      margin: 0;
      margin-block-start: calc(
        (var(--ds-radio-group-label-size) * var(--ds-radio-group-line-height) - var(--ds-radio-group-control-size)) / 2
      );
      border-width: var(--ds-radio-group-control-border-width);
      border-style: solid;
      border-color: var(--color-control-border);
      border-radius: var(--ds-radio-group-control-radius);
      background: var(--color-control-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: border-color var(--ds-radio-group-transition) var(--motion-easing-standard);
    }

    /* indicator: the centre dot, controlSize minus 2 × space.1 in diameter */
    .radio::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      inline-size: calc(var(--ds-radio-group-control-size) - 2 * var(--space-1));
      block-size: calc(var(--ds-radio-group-control-size) - 2 * var(--space-1));
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      transform: scale(0);
      transition: transform var(--ds-radio-group-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .radio,
      .radio::after {
        transition: none;
      }
    }

    /* controlSelectedBackground: selected border color; the fill stays controlBackground */
    .radio:checked {
      border-color: var(--color-control-selected-background);
    }
    .radio:checked::after {
      transform: scale(1);
    }

    /* controlBorderInvalid */
    :host([invalid]) .radio {
      border-color: var(--ds-radio-group-control-border-invalid);
    }

    /* focusRing, focusRingWidth */
    .radio:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabledOpacity: a disabled group dims every option, a disabled option dims its row */
    :host([disabled]) .option,
    .option.disabled {
      opacity: var(--ds-radio-group-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) .radio,
    :host([disabled]) .label,
    .option.disabled .radio,
    .option.disabled .label {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-radio-group-part-gap);
      min-inline-size: 0;
    }

    /* labelColor, labelSize, labelWeight */
    .label {
      font-size: var(--ds-radio-group-label-size);
      font-weight: var(--ds-radio-group-label-weight);
      line-height: var(--ds-radio-group-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }
  `;

  /** The group's legend — the question the options answer. Always visible. */
  @property() accessor label = '';

  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  @property() accessor name = '';

  /** The options in display order. Two to about seven. A property, not an attribute. */
  @property({ attribute: false }) accessor options: RadioGroupOption[] = [];

  /** Controlled selected value. Omit for an uncontrolled group. */
  @property() accessor value: string | undefined;

  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  @property({ type: String, reflect: true }) accessor orientation: RadioGroupOrientation = 'vertical';

  /** An option must be selected to submit. Shown in the legend, not only by color. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  /** Disables every option. Individual options use `options[].disabled`. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Persistent helper text under the legend. */
  @property() accessor description: string | undefined;

  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>>
    | undefined;

  private errorValue: string | undefined;

  /** The group's error message. Setting it marks the group invalid. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Synchronous so that `checkValidity()` right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /** Uncontrolled selection, seeded from `defaultValue`. */
  @state() private accessor internalValue: string | undefined;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'RadioGroup');
    this.setAttribute('data-ds-field', '');
  }

  /** The value `<ds-form>` collects: the selected option value, or `null` when nothing is selected. */
  get currentValue(): string | null {
    const value = this.value ?? this.internalValue;
    return value === undefined || value === '' ? null : value;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  /** The field's own copy: the error, then copy.required, then copy.invalid; empty when valid. */
  get validationMessage(): string {
    if (this.error) {
      return this.error;
    }
    if (this.required && this.currentValue === null) {
      return COPY_REQUIRED(this.label);
    }
    return this.invalid ? COPY_INVALID(this.label) : '';
  }

  checkValidity(): boolean {
    this.syncInternals();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this.syncInternals();
    return this.internals.reportValidity();
  }

  /** Focus lands on the selected radio, or the first enabled one when none is selected — the group's one tab stop. */
  override focus(options?: FocusOptions): void {
    const radios = this.radios;
    const target = radios.find((radio) => radio.checked) ?? radios.find((radio) => !radio.disabled);
    if (target) {
      target.focus(options);
    } else {
      super.focus(options);
    }
  }

  /* Form-associated custom element callbacks (invoked by the browser). */

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.internalValue = this.defaultValue;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.internalValue = state;
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render(): TemplateResult {
    const groupDisabled = this.isDisabled;
    const message = this.displayedError;
    const describedBy = [this.description ? 'description' : '', message ? 'error' : ''].filter(Boolean).join(' ');
    const selected = this.currentValue;
    const groupId = this.name || 'radio-group';
    const textOverrides = this.textOverrides;

    return html`
      <fieldset
        role="radiogroup"
        part="group"
        data-part="group"
        aria-describedby=${ifDefined(describedBy || undefined)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(groupDisabled ? 'true' : undefined)}
        @keydown=${this.handleKeydown}
      >
        <legend part="legend" data-part="legend">${this.label}${this.required ? COPY_REQUIRED_INDICATOR : nothing}</legend>
        ${this.description
          ? html`<ds-text
              id="description"
              part="description"
              data-part="description"
              element="p"
              size="sm"
              tone="muted"
              .overrides=${textOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        <div class="list">
          ${this.options.map((option, index) => {
            const id = `${groupId}-${option.value}`;
            const optionDisabled = option.disabled === true;
            return html`
              <div
                class=${classMap({ option: true, disabled: optionDisabled })}
                @click=${(event: MouseEvent) => this.handleRowClick(event, index)}
              >
                <input
                  id=${id}
                  class="radio"
                  part="radio"
                  data-part="radio"
                  type="radio"
                  name=${this.name}
                  value=${option.value}
                  .checked=${live(selected === option.value)}
                  ?disabled=${optionDisabled}
                  aria-describedby=${ifDefined(option.description ? `${id}-description` : undefined)}
                  aria-disabled=${ifDefined(groupDisabled ? 'true' : undefined)}
                  @click=${this.handleRadioClick}
                  @change=${(event: Event) => this.handleChange(event, option)}
                />
                <div class="text">
                  <label class="label" part="radioLabel" data-part="radioLabel" for=${id}>${option.label}</label>
                  ${option.description
                    ? html`<ds-text
                        id="${id}-description"
                        part="radioDescription"
                        data-part="radioDescription"
                        element="p"
                        size="sm"
                        tone="muted"
                        .overrides=${textOverrides}
                        >${option.description}</ds-text
                      >`
                    : nothing}
                </div>
              </div>
            `;
          })}
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
      </fieldset>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get radios(): HTMLInputElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  }

  /** Validation precedence, as Input: `error`, then copy.required, then copy.invalid — rendered only while invalid. */
  private get displayedError(): string {
    if (this.error) {
      return this.error;
    }
    if (!this.invalid) {
      return '';
    }
    return this.required && this.currentValue === null ? COPY_REQUIRED(this.label) : COPY_INVALID(this.label);
  }

  /** helperSize, fontFamily and lineHeight forwarded to the description and error Text. */
  private get textOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const o = this.overrides;
    if (!o) {
      return undefined;
    }
    return { fontSize: o.helperSize, fontFamily: o.fontFamily, lineHeight: o.lineHeight };
  }

  /** Clicks on an option's description or empty row space select it too: the whole row is the hit area. */
  private handleRowClick(event: MouseEvent, index: number): void {
    const target = event.target;
    const radio = this.radios[index];
    const option = this.options[index];
    if (!(target instanceof Element) || radio === undefined || option === undefined) {
      return;
    }
    // The input handles itself, and a label click is already forwarded to it natively.
    if (target === radio || target.closest('label') !== null) {
      return;
    }
    if (this.isDisabled || option.disabled === true) {
      return;
    }
    radio.focus();
    radio.click();
  }

  /** A disabled group keeps its radios focusable (aria-disabled); the click is cancelled so nothing is selected. */
  private handleRadioClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
    }
  }

  /** A disabled group swallows the native arrow movement and Space selection. */
  private handleKeydown(event: KeyboardEvent): void {
    if (this.isDisabled && GUARDED_KEYS.has(event.key)) {
      event.preventDefault();
    }
  }

  private handleChange(event: Event, option: RadioGroupOption): void {
    event.stopPropagation();
    if (this.isDisabled || option.disabled === true) {
      // `live` restores the radios' checked state from the current selection.
      this.requestUpdate();
      return;
    }
    const next = option.value;
    if (next === this.currentValue) {
      return;
    }
    if (this.value === undefined) {
      this.internalValue = next;
    } else {
      // Controlled: the new state shows only once `value` changes.
      this.requestUpdate();
    }
    this.dispatchEvent(
      new CustomEvent<RadioGroupChangeDetail>('change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    const value = this.currentValue;
    const radios = this.radios;
    const anchor = radios.find((radio) => radio.checked) ?? radios.find((radio) => !radio.disabled);
    this.internals.setFormValue(value === null || this.isDisabled ? null : value);

    if (this.error || this.invalid) {
      this.internals.setValidity({ customError: true }, this.validationMessage, anchor);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as RadioGroupOverridableBinding[]) {
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
    'ds-radio-group': DsRadioGroup;
  }
}
