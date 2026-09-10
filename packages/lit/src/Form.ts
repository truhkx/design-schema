import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { DsButton } from './Button.js';
import './Input.js';

export type FormValidate = 'submit' | 'blur' | 'change';

/**
 * Detail carried by the `submit` CustomEvent. Input and RadioGroup contribute
 * strings, Switch a boolean, Checkbox its `value` when checked; an unchecked
 * Checkbox, an unselected RadioGroup and a disabled field contribute no key.
 */
export interface FormSubmitDetail {
  values: Record<string, string | boolean>;
}

/** Detail carried by the `invalid` CustomEvent. */
export interface FormInvalidDetail {
  errors: Record<string, string>;
}

/**
 * The duck-typed interface a light-DOM field must implement to take part in a
 * `<ds-form>`: `ds-input`, `ds-checkbox`, `ds-switch` (when it has a `name`)
 * and `ds-radio-group` all do.
 */
export interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error?: string;
  /** `null` means the field contributes no key to the submitted values. */
  readonly currentValue: string | boolean | null;
  /** Runs the field's own validation (required, format); the message is the field's own copy. */
  checkValidity(): boolean;
  readonly validationMessage: string;
}

/** Light-DOM elements collected as fields, by tag. */
const FIELD_SELECTOR = 'ds-input, ds-checkbox, ds-switch, ds-radio-group';

function isFormField(target: EventTarget | null): target is DsFormField {
  return target instanceof Element && target.matches(FIELD_SELECTOR) && 'currentValue' in target;
}

/** A closed `<ds-disclosure>` without `keep-mounted` hides its fields from the form. */
function isInsideClosedDisclosure(field: Element): boolean {
  let disclosure = field.parentElement?.closest('ds-disclosure') ?? null;
  while (disclosure !== null) {
    const { currentOpen, keepMounted } = disclosure as Element & { currentOpen?: boolean; keepMounted?: boolean };
    if (currentOpen === false && keepMounted !== true) {
      return true;
    }
    disclosure = disclosure.parentElement?.closest('ds-disclosure') ?? null;
  }
  return false;
}

type FormControl = DsFormField | DsButton;

/**
 * `<ds-form>` — Form (category: container, role: form).
 *
 * `<ds-form label="Sign in">` wraps a native `<form novalidate>` in its shadow
 * root and collects light-DOM fields (`<ds-input>`, `<ds-checkbox>`,
 * `<ds-switch name>`, `<ds-radio-group>`) by `name`. Submission is
 * triggered by a `<ds-button type="submit">` (via its composed `press` event),
 * by pressing Enter in a field, or by calling `submit()`. Fields without a
 * `name` and fields inside a closed `<ds-disclosure>` without `keep-mounted`
 * are skipped. On submit every active field is validated through its own
 * `checkValidity()` (so the error text is the field's own copy); a field with
 * an `error` is invalid. If anything fails, the error summary (or the first
 * invalid field when `errorSummary` is off) receives focus and `invalid` fires
 * with `{ errors }`; otherwise `submit` fires with `{ values }`. The component
 * never navigates, so `preventDefault()` on `submit` is unnecessary.
 *
 * ## When to use
 *
 * Use Form whenever two or more fields are submitted together, and for any
 * single field whose submission has consequences (sign-in, search with side
 * effects). Place actions (submit, cancel) at the end in a Stack. Give the form
 * a `label` when the page contains more than one.
 *
 * @fires submit - Fired when the form is submitted and every field is valid. `detail.values` is keyed by field name.
 * @fires invalid - Fired when submission is blocked by validation. `detail.errors` is keyed by field name.
 * @slot - Fields (Input etc.), layout (Stack), and at least one Button with `type="submit"`.
 * @csspart form - The native `<form>` (anatomy: container).
 * @csspart error-summary - The `role="alert"` summary rendered above the fields.
 */
@customElement('ds-form')
export class DsForm extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    /* gap: space.lg between fields and between fields and actions */
    form {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      margin: 0;
    }

    .summary {
      box-sizing: border-box;
      padding: var(--space-md);
      border: var(--border-width-thin) solid var(--color-border-danger);
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-danger);
      background: var(--color-background-subtle);
    }

    .summary:focus-visible,
    .summary-link:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .summary-title {
      margin: 0;
      font-weight: var(--font-weight-semibold);
    }

    .summary-list {
      margin-block: var(--space-sm) 0;
      margin-inline: 0;
      padding-inline-start: var(--space-lg);
    }

    .summary-link {
      color: inherit;
    }
  `;

  /** Identifier for the form, used for analytics and as the base of generated ids. */
  @property() name?: string;

  /** Accessible name for the form landmark, e.g. "Sign in". Rendered as aria-label. */
  @property() label?: string;

  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  @property() validate: FormValidate = 'submit';

  /** Disables every field and action inside. Use while submitting. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  @property({ type: Boolean, attribute: 'error-summary' }) errorSummary = true;

  /** Current validation errors keyed by field name. */
  @state() private errors: Record<string, string> = {};

  /** Whether the summary is shown (only after a failed submission). */
  @state() private summaryVisible = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#summary') private readonly summaryEl!: HTMLElement | null;

  private readonly internals: ElementInternals;

  /** Fields whose `error` was written by this form (so it can be cleared again). */
  private readonly ownedErrors = new Set<DsFormField>();

  /** Controls this form disabled (so individually disabled ones are left alone). */
  private readonly disabledByForm = new Set<FormControl>();

  private readonly observer = new MutationObserver(() => this.applyDisabled());

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.addEventListener('press', this.handlePress);
    this.addEventListener('keydown', this.handleKeydown);
    // Native `focusout` (bubbling, composed) — never a CustomEvent named after a native event.
    this.addEventListener('focusout', this.handleFieldFocusout);
    this.addEventListener('change', this.handleFieldChange);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer.observe(this, { childList: true, subtree: true });
    if (this.internals.form) {
      console.warn('<ds-form> must not be nested inside another form.');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  /** Every named light-DOM field inside the form (Input, Checkbox, Switch with a `name`, RadioGroup), except those inside a closed Disclosure without `keep-mounted`. */
  get fields(): DsFormField[] {
    return Array.from(this.querySelectorAll(FIELD_SELECTOR))
      .filter(isFormField)
      .filter((field) => field.name !== '' && !isInsideClosedDisclosure(field));
  }

  /** Fields that take part in validation and submission (not disabled). */
  private get activeFields(): DsFormField[] {
    return this.fields.filter((field) => !field.disabled);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /**
   * Validate every active field and, if all pass, dispatch `submit` with the
   * collected values; otherwise dispatch `invalid` and move focus to the errors.
   */
  submit(): void {
    if (this.isDisabled) {
      return;
    }

    const fields = this.activeFields;
    const errors: Record<string, string> = {};
    for (const field of fields) {
      this.ensureId(field);
      const message = this.validateField(field);
      this.applyFieldError(field, message);
      if (message !== undefined) {
        errors[field.name] = message;
      }
    }
    this.errors = errors;

    if (Object.keys(errors).length > 0) {
      this.summaryVisible = this.errorSummary;
      this.dispatchEvent(
        new CustomEvent<FormInvalidDetail>('invalid', {
          detail: { errors },
          bubbles: true,
          composed: true,
        }),
      );
      void this.focusErrors(fields);
      return;
    }

    this.summaryVisible = false;
    const values: Record<string, string | boolean> = {};
    for (const field of fields) {
      const value = field.currentValue;
      if (value !== null) {
        values[field.name] = value;
      }
    }
    this.dispatchEvent(
      new CustomEvent<FormSubmitDetail>('submit', {
        detail: { values },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override updated(changed: PropertyValues): void {
    // `formDisabled` is private, so PropertyValues<this> cannot name it; use the untyped map.
    if (changed.has('disabled') || changed.has('formDisabled')) {
      this.applyDisabled();
    }
  }

  protected override render() {
    const entries = Object.entries(this.errors);
    const count = entries.length;
    const showSummary = this.summaryVisible && this.errorSummary && count > 0;

    return html`
      <form
        part="form"
        novalidate
        name=${ifDefined(this.name)}
        aria-label=${ifDefined(this.label)}
        @submit=${this.handleNativeSubmit}
      >
        ${showSummary
          ? html`
              <div id="summary" class="summary" part="error-summary" role="alert" tabindex="-1">
                <p class="summary-title">
                  ${count === 1 ? '1 problem with this form' : `${count} problems with this form`}
                </p>
                <ul class="summary-list">
                  ${entries.map(
                    ([fieldName, message]) => html`
                      <li>
                        <a
                          class="summary-link"
                          href=${`#${this.fieldId(fieldName)}`}
                          @click=${(event: Event) => this.focusField(event, fieldName)}
                          >${this.fieldLabel(fieldName)}: ${message}</a
                        >
                      </li>
                    `,
                  )}
                </ul>
              </div>
            `
          : nothing}
        <slot></slot>
      </form>
    `;
  }

  /* ---- event handling ---- */

  private readonly handlePress = (event: Event): void => {
    const target = event.target;
    if (target instanceof DsButton && target.type === 'submit') {
      this.submit();
    }
  };

  private readonly handleKeydown = (event: Event): void => {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Enter' || event.isComposing) {
      return;
    }
    // Light-DOM fields have no form owner, so implicit submission is done here.
    if (isFormField(event.target)) {
      event.preventDefault();
      this.submit();
    }
  };

  private readonly handleFieldFocusout = (event: Event): void => {
    if (this.validate !== 'blur' || !(event instanceof FocusEvent) || !isFormField(event.target)) {
      return;
    }
    // Focus moving between controls inside the same field (e.g. radios) retargets to the field itself.
    if (event.relatedTarget === event.target) {
      return;
    }
    this.validateOne(event.target);
  };

  private readonly handleFieldChange = (event: Event): void => {
    if (this.validate === 'change' && isFormField(event.target)) {
      this.validateOne(event.target);
    }
  };

  private handleNativeSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  /* ---- validation ---- */

  private validateField(field: DsFormField): string | undefined {
    if (field.error && !this.ownedErrors.has(field)) {
      return field.error;
    }
    if (this.ownedErrors.has(field)) {
      // Clear our previous message so the field re-validates its own state.
      field.error = undefined;
      this.ownedErrors.delete(field);
    }
    // The message is the field's own copy (e.g. copy.required: "{label} is required.").
    return field.checkValidity() ? undefined : field.validationMessage;
  }

  private applyFieldError(field: DsFormField, message: string | undefined): void {
    if (message === undefined) {
      if (this.ownedErrors.has(field)) {
        field.error = undefined;
        this.ownedErrors.delete(field);
      }
      return;
    }
    if (field.error !== message) {
      field.error = message;
      this.ownedErrors.add(field);
    }
  }

  private validateOne(field: DsFormField): void {
    if (field.disabled) {
      return;
    }
    const message = this.validateField(field);
    this.applyFieldError(field, message);
    const next = { ...this.errors };
    if (message === undefined) {
      delete next[field.name];
    } else {
      next[field.name] = message;
    }
    this.errors = next;
  }

  private async focusErrors(fields: DsFormField[]): Promise<void> {
    await this.updateComplete;
    if (this.errorSummary && this.summaryEl) {
      this.summaryEl.focus();
      return;
    }
    const firstInvalid = fields.find((field) => field.name in this.errors);
    firstInvalid?.focus();
  }

  /* ---- ids and focus ---- */

  private ensureId(field: DsFormField): string {
    if (field.id === '') {
      field.id = `${this.name ?? 'form'}-${field.name}`;
    }
    return field.id;
  }

  private fieldId(fieldName: string): string {
    const field = this.fields.find((candidate) => candidate.name === fieldName);
    return field ? this.ensureId(field) : `${this.name ?? 'form'}-${fieldName}`;
  }

  private fieldLabel(fieldName: string): string {
    return this.fields.find((candidate) => candidate.name === fieldName)?.label ?? fieldName;
  }

  private focusField(event: Event, fieldName: string): void {
    const field = this.fields.find((candidate) => candidate.name === fieldName);
    if (field) {
      event.preventDefault();
      field.focus();
    }
  }

  /* ---- disabled propagation ---- */

  private applyDisabled(): void {
    const controls: FormControl[] = [
      ...Array.from(this.querySelectorAll(FIELD_SELECTOR)).filter(isFormField),
      ...Array.from(this.querySelectorAll('ds-button')),
    ];

    if (this.isDisabled) {
      for (const control of controls) {
        if (!control.disabled) {
          control.disabled = true;
          this.disabledByForm.add(control);
        }
      }
      return;
    }

    for (const control of this.disabledByForm) {
      control.disabled = false;
    }
    this.disabledByForm.clear();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-form': DsForm;
  }
}
