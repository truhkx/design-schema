import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
export type InputSize = 'sm' | 'md';

/** Detail carried by the `change` CustomEvent. */
export interface InputChangeDetail {
  value: string;
}

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `errorText`, `descriptionText`,
 * `minTarget` and `focusRingWidth` are locked and excluded.
 */
export type InputOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockSm'
  | 'paddingInlineSm'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'minTargetSm'
  | 'disabledOpacity';

const HOOKS: Record<InputOverridableBinding, string> = {
  borderFocus: '--ds-input-border-focus',
  borderInvalid: '--ds-input-border-invalid',
  borderWidth: '--ds-input-border-width',
  radius: '--ds-input-radius',
  paddingInline: '--ds-input-padding-inline',
  paddingBlock: '--ds-input-padding-block',
  paddingBlockSm: '--ds-input-padding-block-sm',
  paddingInlineSm: '--ds-input-padding-inline-sm',
  partGap: '--ds-input-part-gap',
  fontFamily: `--ds-input-font-family`,
  fontSize: '--ds-input-font-size',
  labelWeight: '--ds-input-label-weight',
  helperSize: '--ds-input-helper-size',
  lineHeight: '--ds-input-line-height',
  minTargetSm: '--ds-input-min-target-sm',
  disabledOpacity: '--ds-input-disabled-opacity',
};

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

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-input-border-focus: var(--color-border-focus);
      --ds-input-border-invalid: var(--color-border-danger);
      --ds-input-border-width: var(--border-width-thin);
      --ds-input-radius: var(--radius-md);
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-padding-inline-sm: var(--space-2);
      --ds-input-padding-block-sm: var(--space-1);
      --ds-input-part-gap: var(--space-1);
      --ds-input-font-family: var(--font-family-body);
      --ds-input-font-size: var(--font-size-md);
      --ds-input-label-weight: var(--font-weight-medium);
      --ds-input-helper-size: var(--font-size-sm);
      --ds-input-line-height: var(--font-line-height-normal);
      --ds-input-min-target-sm: var(--size-target-min);
      --ds-input-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
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

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-input-font-size: var(--font-size-sm);
    }

    .label {
      display: block;
      font-size: var(--ds-input-font-size);
      font-weight: var(--ds-input-label-weight);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
    }

    .required {
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
    }

    /* descriptionText: color.foreground.muted, locked */
    .description {
      margin-block: var(--ds-input-part-gap) 0;
      margin-inline: 0;
      font-size: var(--ds-input-helper-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground-muted);
    }

    .field {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-input-part-gap);
      padding-block: var(--ds-input-padding-block);
      padding-inline: var(--ds-input-padding-inline);
      border: var(--ds-input-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-input-radius);
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
      transition:
        border-color var(--motion-duration-fast) var(--motion-easing-standard),
        padding var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field {
        transition: none;
      }
    }

    /* paddingBlockSm / paddingInlineSm / minTargetSm replace the md bindings at size sm */
    :host([size='sm']) .field {
      min-block-size: var(--ds-input-min-target-sm);
      padding-block: var(--ds-input-padding-block-sm);
      padding-inline: var(--ds-input-padding-inline-sm);
    }

    /* placeholder: color.foreground.muted, locked */
    .field::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /*
     * focusRingWidth (locked) replaces borderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-visible {
      border-color: var(--ds-input-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(var(--ds-input-padding-inline) - (var(--border-width-focus) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block) - (var(--border-width-focus) - var(--ds-input-border-width)));
    }

    :host([size='sm']) .field:focus-visible {
      padding-inline: calc(var(--ds-input-padding-inline-sm) - (var(--border-width-focus) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block-sm) - (var(--border-width-focus) - var(--ds-input-border-width)));
    }

    /* borderInvalid: color.border.danger */
    :host([invalid]) .field {
      border-color: var(--ds-input-border-invalid);
    }
    :host([invalid]) .field:focus-visible {
      border-color: var(--ds-input-border-invalid);
    }

    /*
     * disabledOpacity: opacity.disabled on the control; colors are unchanged.
     * Disabled fields stay focusable and readable (aria-disabled + readonly),
     * never the native disabled attribute, which would drop them from the tab order.
     */
    .field.disabled {
      opacity: var(--ds-input-disabled-opacity);
      cursor: not-allowed;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-input-helper-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-input-part-gap);
    }
  `;

  /** Visible label. Always rendered; never replaced by a placeholder. */
  @property() accessor label = '';

  /** Field name used by the enclosing Form when collecting values. */
  @property() accessor name = '';

  /**
   * Controlled value. Omit for an uncontrolled field. Reading it after the user
   * types returns the current value (like a native input's `.value`).
   */
  @property() accessor value: string | undefined;

  /** Initial value for an uncontrolled field. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** Example input shown while empty. Never the only description of what to enter. */
  @property() accessor placeholder: string | undefined;

  /** Persistent helper text below the label explaining format or purpose. */
  @property() accessor description: string | undefined;

  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  @property({ reflect: true }) accessor type: InputType = 'text';

  /** Visually hide the label (it remains the accessible name via the native `<label for>`). */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /**
   * sm swaps paddingBlock/paddingInline/minTarget for their Sm bindings and the
   * font size to font.size.sm; nothing else changes. Not listed under this
   * component's `platforms.lit.reflect`, but reflected anyway since the size
   * variants are expressed as CSS attribute selectors, matching Search's `size`.
   */
  @property({ reflect: true }) accessor size: InputSize = 'md';

  /** The field must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Not editable and not submitted. Stays visible and readable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue?: string | undefined;

  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Setting `error` implies `invalid`; clearing it removes the invalid state, synchronously
    // so that `checkValidity()` right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /** HTML autocomplete token (e.g. `email`, `given-name`). */
  @property() accessor autocomplete: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#field') private accessor inputEl!: HTMLInputElement;

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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Input');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render(): TemplateResult {
    const isDisabled = this.disabled || this.formDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;

    return html`
      <label
        class=${classMap({ label: true, 'visually-hidden': this.hideLabel })}
        part="label"
        for="field"
        >${this.label}${this.required
          ? html`<span class="required" aria-hidden="true"> (required)</span>`
          : nothing}</label
      >
      ${this.description
        ? html`<p id="description" class="description" part="description">${this.description}</p>`
        : nothing}
      <input
        id="field"
        class=${classMap({ field: true, disabled: isDisabled })}
        part="field"
        name=${this.name}
        type=${this.type}
        .value=${live(this.currentValue)}
        placeholder=${ifDefined(this.placeholder)}
        autocomplete=${ifDefined(this.autocomplete)}
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        ?readonly=${isDisabled}
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

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as InputOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    const value = this.currentValue;
    const anchor = this.inputEl;
    if (!anchor) {
      return;
    }

    // Disabled fields are visible and focusable but excluded from submission and
    // validation, matching a native disabled control, without using the native
    // `disabled` attribute (which would drop the field from the tab order).
    if (this.disabled || this.formDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
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
