import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

/** Detail carried by the `change` CustomEvent. */
export interface InputChangeDetail {
  value: string;
}

/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;

/**
 * `<ds-input>` — Input (category: input, role: textbox).
 *
 * `<ds-input name="email" type="email" label="Email address">`. The inner
 * `<label for>` and `<input id>` live in the shadow root, which keeps the label
 * association intact. The element is form-associated via `ElementInternals`
 * (`static formAssociated = true`), so a native `<form>` that owns it sees its
 * value and validity, and `<ds-form>` collects it by `name`. Dispatches a
 * composed `change` CustomEvent carrying `{ value }` in `detail`; `focus` and
 * `blur` are the native events, retargeted to the host.
 *
 * ## When to use
 *
 * Use Input for names, emails, passwords, search terms, and short free-text
 * values. Choose `type` for the value so touch keyboards and browser validation
 * match. Provide `description` when the format matters ("Use the email you
 * signed up with"). Set `autocomplete` on web whenever the value is personal
 * data so browsers and assistive tools can fill it.
 *
 * @fires change - Fired on every value change with `{ value }` in `detail`.
 * @fires focus - The native focus event, retargeted to the host (no CustomEvent).
 * @fires blur - The native blur event, retargeted to the host. The usual moment to validate.
 * @csspart label - The `<label>`.
 * @csspart description - The helper text.
 * @csspart field - The native `<input>`.
 * @csspart error - The `role="alert"` error message region.
 */
@customElement('ds-input')
export class DsInput extends LitElement {
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

    .label {
      display: block;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
    }

    .required {
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
    }

    /* descriptionText: color.foreground.muted */
    .description {
      margin-block: var(--space-1) 0;
      margin-inline: 0;
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-muted);
    }

    .field {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--space-1);
      padding-block: var(--space-sm);
      padding-inline: var(--space-md);
      border: var(--border-width-thin) solid var(--color-border-strong);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
    }

    /* placeholder: color.foreground.muted */
    .field::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /* borderFocus + focus-visible ring */
    .field:focus-visible {
      border-color: var(--color-border-focus);
      outline: var(--border-width-focus) solid var(--color-border-focus);
    }

    /* borderInvalid: color.border.danger */
    :host([invalid]) .field {
      border-color: var(--color-border-danger);
    }

    /* disabledOpacity: opacity.disabled on the control; colors are unchanged */
    .field:disabled {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    /* errorText: color.foreground.danger */
    .error {
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--space-1);
    }
  `;

  /** Visible label. Always rendered; never replaced by a placeholder. */
  @property() label = '';

  /** Field name used by the enclosing Form when collecting values. */
  @property() name = '';

  /**
   * Controlled value. Omit for an uncontrolled field. Reading it after the user
   * types returns the current value (like a native input's `.value`).
   */
  @property() value?: string;

  /** Initial value for an uncontrolled field. */
  @property({ attribute: 'default-value' }) defaultValue?: string;

  /** Example input shown while empty. Never the only description of what to enter. */
  @property() placeholder?: string;

  /** Persistent helper text below the label explaining format or purpose. */
  @property() description?: string;

  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  @property({ reflect: true }) type: InputType = 'text';

  /** The field must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Not editable and not submitted. Stays visible and readable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  private errorValue?: string;

  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  @property()
  get error(): string | undefined {
    return this.errorValue;
  }
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Setting `error` implies `invalid`; clearing it removes the invalid state, synchronously
    // so that `checkValidity()` right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /** HTML autocomplete token (e.g. `email`, `given-name`). */
  @property() autocomplete?: string;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#field') private readonly inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The current string value of the field. */
  get currentValue(): string {
    return this.value ?? this.defaultValue ?? '';
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

  /* Form-associated custom element callbacks (invoked by the browser). */

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.value = undefined;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.value = state;
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render() {
    const isDisabled = this.disabled || this.formDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;

    return html`
      <label class="label" part="label" for="field"
        >${this.label}${this.required
          ? html`<span class="required" aria-hidden="true"> (required)</span>`
          : nothing}</label
      >
      ${this.description
        ? html`<p id="description" class="description" part="description">${this.description}</p>`
        : nothing}
      <input
        id="field"
        class="field"
        part="field"
        name=${this.name}
        type=${this.type}
        .value=${live(this.currentValue)}
        placeholder=${ifDefined(this.placeholder)}
        autocomplete=${ifDefined(this.autocomplete)}
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        ?disabled=${isDisabled}
        @input=${this.handleInput}
      />
      <div id="error" class="error" part="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private handleInput(): void {
    const next = this.inputEl.value;
    this.value = next;
    this.dispatchEvent(
      new CustomEvent<InputChangeDetail>('change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    const value = this.currentValue;
    const anchor = this.inputEl;
    if (!anchor) {
      return;
    }
    this.internals.setFormValue(value);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else if (this.required && value.trim() === '') {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else if (!anchor.validity.valid) {
      // Browser validation for the chosen `type` (e.g. email format).
      this.internals.setValidity(anchor.validity, anchor.validationMessage, anchor);
    } else {
      this.internals.setValidity({});
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-input': DsInput;
  }
}
