import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** Shape of each entry in `options`. */
export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

/** Detail carried by the `change` CustomEvent. */
export interface RadioGroupChangeDetail {
  value: string;
}

/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/**
 * `<ds-radio-group>` — RadioGroup (category: input, APG pattern: radio).
 *
 * `<ds-radio-group name="plan" label="Plan" .options=${[...]}>` renders a
 * `<fieldset>` with a `<legend>` and one native `<input type="radio">` per
 * option inside its shadow root, where the shared `name` groups them natively.
 * `options` is a property, not an attribute. Native radios sharing a `name`
 * provide roving tabindex and arrow-key movement; per-option `disabled` is the
 * native attribute so arrow movement skips it, while a `disabled` group uses
 * `aria-disabled` and click/change guards so it stays focusable but inert.
 * The element is form-associated (`setFormValue(value)`), and `<ds-form>`
 * collects it by `name` like `ds-input` (no key while nothing is selected).
 * The inner native `change` is not composed, so a composed `change`
 * CustomEvent with `{ value }` is re-dispatched from the host.
 *
 * ## When to use
 *
 * Use a RadioGroup when the user must pick exactly one of two to about seven
 * options and seeing them all helps the decision — plan tiers, shipping
 * methods. Give options a `description` when the label alone does not tell
 * them apart. Leave the group unselected when the choice is consequential and
 * you want a deliberate answer.
 *
 * @fires change - Fired when the selection changes with `{ value }` in `detail`.
 * @csspart group - The `<fieldset>` (anatomy: group).
 * @csspart legend - The `<legend>`.
 * @csspart description - The group helper text.
 * @csspart radio - Each native `<input type="radio">` (anatomy: radio, radioIndicator).
 * @csspart radio-label - Each option's `<label>`.
 * @csspart radio-description - Each option's helper text.
 * @csspart error - The `role="alert"` error message region.
 */
@customElement('ds-radio-group')
export class DsRadioGroup extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    fieldset {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    /* A <legend> does not take part in the fieldset's flex gap, so partGap below it is a margin. */
    legend {
      margin-block-end: var(--space-1);
      padding: 0;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
    }

    .required {
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
    }

    .description {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-muted);
    }

    /* listGap: between options; horizontal wraps rather than overflows */
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    :host([orientation='horizontal']) .list {
      flex-direction: row;
      flex-wrap: wrap;
      column-gap: var(--space-4);
      row-gap: var(--space-2);
    }

    /* minTarget: each option row is the hit area */
    .option {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    .radio {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--space-5);
      block-size: var(--space-5);
      margin: 0;
      margin-block-start: calc((var(--font-size-md) * var(--font-line-height-normal) - var(--space-5)) / 2);
      border: var(--border-width-thin) solid var(--color-control-border);
      border-radius: var(--radius-full);
      background: var(--color-control-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* indicator: the centre dot, controlSize minus 2 × space.1 in diameter */
    .radio::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      inline-size: calc(var(--space-5) - 2 * var(--space-1) - 2 * var(--border-width-thin));
      block-size: calc(var(--space-5) - 2 * var(--space-1) - 2 * var(--border-width-thin));
      border-radius: var(--radius-full);
      background: var(--color-control-selected-background);
      transform: scale(0);
      transition: transform var(--motion-duration-fast) var(--motion-easing-standard);
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

    :host([invalid]) .radio {
      border-color: var(--color-border-danger);
    }

    .radio:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    :host([disabled]) .option,
    .option.is-disabled {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }
    :host([disabled]) .radio,
    .radio:disabled {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-inline-size: 0;
    }

    .label {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-regular);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .error {
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-danger);
    }
    .error:empty {
      display: none;
    }
  `;

  /** The group's legend — the question the options answer. Always visible. */
  @property() label = '';

  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  @property() name = '';

  /** The options in display order. Two to about seven. A property, not an attribute. */
  @property({ attribute: false }) options: RadioGroupOption[] = [];

  /** Controlled selected value. Omit for an uncontrolled group. */
  @property() value?: string;

  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  @property({ attribute: 'default-value' }) defaultValue?: string;

  /** Layout of the options. Horizontal only for two or three short labels. */
  @property({ reflect: true }) orientation: RadioGroupOrientation = 'vertical';

  /** An option must be selected to submit. Shown in the legend, not only by color. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Disables every option. Individual options use `options[].disabled`. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Persistent helper text under the legend. */
  @property() description?: string;

  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  private errorValue?: string;

  /** The group's error message. Setting it implies `invalid`. */
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

  /** Uncontrolled selection (seeded from `defaultValue`). */
  @state() private internalValue?: string;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The currently selected option value, or `null` when nothing is selected (no key in the Form). */
  get currentValue(): string | null {
    const value = this.value ?? this.internalValue;
    return value === undefined || value === '' ? null : value;
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
    this.internalValue = this.defaultValue;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.value = state;
    }
  }

  protected override willUpdate(): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render() {
    const groupDisabled = this.disabled || this.formDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;
    const selected = this.currentValue;
    const groupId = this.id || this.name || 'radio-group';

    return html`
      <fieldset
        part="group"
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(groupDisabled ? 'true' : undefined)}
      >
        <legend part="legend"
          >${this.label}${this.required
            ? html`<span class="required" aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
            : nothing}</legend
        >
        ${this.description
          ? html`<p id="description" class="description" part="description">${this.description}</p>`
          : nothing}
        <div class="list">
          ${this.options.map((option, index) => {
            const id = `${groupId}-${option.value}`;
            const optionDisabled = option.disabled === true;
            return html`
              <div
                class="option ${optionDisabled ? 'is-disabled' : ''}"
                @click=${(event: MouseEvent) => this.handleRowClick(event, index)}
              >
                <input
                  id=${id}
                  class="radio"
                  part="radio"
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
                  <label class="label" part="radio-label" for=${id}>${option.label}</label>
                  ${option.description
                    ? html`<p id="${id}-description" class="description" part="radio-description">
                        ${option.description}
                      </p>`
                    : nothing}
                </div>
              </div>
            `;
          })}
        </div>
        <div id="error" class="error" part="error" role="alert">${this.error ?? ''}</div>
      </fieldset>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get radios(): HTMLInputElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  }

  private isOptionDisabled(option: RadioGroupOption): boolean {
    return this.isDisabled || option.disabled === true;
  }

  private handleRowClick(event: MouseEvent, index: number): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target instanceof HTMLInputElement || target.closest('label') !== null) {
      return;
    }
    const radio = this.radios[index];
    const option = this.options[index];
    if (radio !== undefined && option !== undefined && !this.isOptionDisabled(option)) {
      radio.click();
    }
  }

  /** A disabled group uses aria-disabled so the radios stay focusable; click and change are guarded. */
  private handleRadioClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private handleChange(event: Event, option: RadioGroupOption): void {
    if (this.isDisabled) {
      event.preventDefault();
      this.requestUpdate();
      return;
    }
    this.select(option.value);
  }

  private select(next: string): void {
    if (next === this.currentValue) {
      return;
    }
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
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
    const anchor = this.radios.find((radio) => radio.checked) ?? this.radios[0];
    this.internals.setFormValue(value === null || this.isDisabled ? null : value);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, `${this.label} is invalid`, anchor);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-radio-group': DsRadioGroup;
  }
}
