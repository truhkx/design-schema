import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
export type InputSize = 'sm' | 'md';

/** Detail carried by the `change` CustomEvent. */
export interface InputChangeDetail {
  /** The new value. */
  value: string;
}

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`, `errorText`,
 * `descriptionText`, `minTarget`, `minTargetSm` and `focusRingWidth` are
 * locked and excluded.
 */
export type InputOverridableBinding =
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

/**
 * `helperSize` has no hook: it reaches the description and error text only
 * through the composed Text's `overrides.fontSize`, so page CSS sizes helper
 * text through Text's own hooks (`fontFamily` and `lineHeight` keep their root
 * hooks as well, for the label and the field).
 */
const HOOKS: Record<Exclude<InputOverridableBinding, 'helperSize'>, string> = {
  borderInvalid: '--ds-input-border-invalid',
  borderWidth: '--ds-input-border-width',
  radius: '--ds-input-radius',
  paddingInline: '--ds-input-padding-inline',
  paddingBlock: '--ds-input-padding-block',
  partGap: '--ds-input-part-gap',
  fontFamily: '--ds-input-font-family',
  fontSize: '--ds-input-font-size',
  labelWeight: '--ds-input-label-weight',
  lineHeight: '--ds-input-line-height',
  disabledOpacity: '--ds-input-disabled-opacity',
  transition: '--ds-input-transition',
};

/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/**
 * `<ds-input>` — Input (category: input, role: textbox).
 *
 * `<ds-input name="email" type="email" label="Email address">`. The native
 * `<label for>` and `<input id>` live together in the shadow root, so the label
 * association is always intact; description and error are `<ds-text>` linked
 * with `aria-describedby`, the error carrying `role="alert"`. The element is
 * form-associated via `ElementInternals`, so a native `<form>` that directly
 * contains it sees its value and validity, and `<ds-form>` collects it by
 * `name`. Dispatches a composed `change` CustomEvent carrying `{ value }`;
 * `focus` and `blur` are the native events, retargeted to the host.
 *
 * ## When to use
 *
 * Use Input for names, emails, passwords, search terms, and short free-text
 * values. Choose `type` for the value so touch keyboards and browser validation
 * match. Provide `description` when the format matters ("Use the email you
 * signed up with"). Set `autocomplete` whenever the value is personal data so
 * browsers and assistive tools can fill it.
 *
 * @fires change - Fired on every value change with `{ value }` in `detail`.
 * @fires focus - The native focus event, retargeted to the host (no CustomEvent).
 * @fires blur - The native blur event, retargeted to the host. The usual moment to validate.
 */
@customElement('ds-input')
export class DsInput extends LitElement {
  static formAssociated: boolean = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      /* Locked bindings: out of the overrides API, still themeable from page CSS. */
      --ds-input-background: var(--color-background);
      --ds-input-foreground: var(--color-foreground);
      --ds-input-placeholder: var(--color-foreground-muted);
      --ds-input-border: var(--color-border-strong);
      --ds-input-border-focus: var(--color-border-focus);
      --ds-input-min-target: var(--size-target-comfortable);
      --ds-input-min-target-sm: var(--size-target-min);
      --ds-input-focus-ring-width: var(--border-width-focus);
      --ds-input-error-text: var(--color-foreground-danger);
      --ds-input-description-text: var(--color-foreground-muted);
      --ds-input-border-invalid: var(--color-border-danger);
      --ds-input-border-width: var(--border-width-thin);
      --ds-input-radius: var(--radius-md);
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-part-gap: var(--space-1);
      --ds-input-font-family: var(--font-family-body);
      --ds-input-font-size: var(--font-size-md);
      --ds-input-label-weight: var(--font-weight-medium);
      --ds-input-line-height: var(--font-line-height-normal);
      --ds-input-disabled-opacity: var(--opacity-disabled);
      --ds-input-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock by size; fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-input-padding-inline: var(--space-2);
      --ds-input-padding-block: var(--space-1);
      --ds-input-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-font-size: var(--font-size-md);
    }

    /* partGap: the vertical gap between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-input-part-gap);
      position: relative;
      font-family: var(--ds-input-font-family);
    }

    /* disabledOpacity: the whole field group dims, as Button dims the whole control */
    .group.disabled {
      opacity: var(--ds-input-disabled-opacity);
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
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      font-weight: var(--ds-input-label-weight);
      line-height: var(--ds-input-line-height);
      color: var(--ds-input-foreground);
    }

    /*
     * errorText / descriptionText: the composed Text keeps its danger / muted tone;
     * the parent hook only sets Text's own documented --ds-text-color hook on its
     * host (same token by default), never Text's shadow tree.
     */
    [data-part='description'] {
      --ds-text-color: var(--ds-input-description-text);
    }
    [data-part='errorMessage'] {
      --ds-text-color: var(--ds-input-error-text);
    }

    [data-part='field'] {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--ds-input-min-target);
      margin: 0;
      padding-block: var(--ds-input-padding-block);
      padding-inline: var(--ds-input-padding-inline);
      border: var(--ds-input-border-width) solid var(--ds-input-border);
      border-radius: var(--ds-input-radius);
      outline: none;
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      line-height: var(--ds-input-line-height);
      color: var(--ds-input-foreground);
      background: var(--ds-input-background);
      appearance: none;
      -webkit-appearance: none;
      /* transition: border color only; border width and padding change instantly */
      transition: border-color var(--ds-input-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'] {
        transition: none;
      }
    }

    /* minTargetSm: the field height floor at size sm */
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--ds-input-min-target-sm);
    }

    /* placeholder: color.foreground.muted */
    [data-part='field']::placeholder {
      color: var(--ds-input-placeholder);
      opacity: 1;
    }

    /*
     * The border is the focus ring: focusRingWidth replaces borderWidth, and the
     * padding shrinks by the difference on both axes so the field does not shift
     * — compensating only the inline one would still move it vertically. The
     * compensation is clamped at zero, so a borderWidth override wider than this
     * locked width leaves the padding alone rather than eating into it.
     */
    [data-part='field']:focus-visible {
      border-color: var(--ds-input-border-focus);
      border-width: var(--ds-input-focus-ring-width);
      padding-inline: calc(var(--ds-input-padding-inline) - max(0px, var(--ds-input-focus-ring-width) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block) - max(0px, var(--ds-input-focus-ring-width) - var(--ds-input-border-width)));
    }

    /* borderInvalid: the danger color stays while focused; only the width changes */
    :host([invalid]) [data-part='field'],
    :host([invalid]) [data-part='field']:focus-visible {
      border-color: var(--ds-input-border-invalid);
    }

    .group.disabled [data-part='field'] {
      cursor: not-allowed;
    }
  `;

  /** Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder. */
  @property() accessor label = '';

  /** Field name used by the enclosing Form when collecting values. */
  @property() accessor name = '';

  /** Controlled value. Omit for an uncontrolled field. */
  @property({ attribute: false }) accessor value: string | undefined;

  /** Initial value for an uncontrolled field. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** Example input shown while empty. Never the only description of what to enter. */
  @property() accessor placeholder: string | undefined;

  /** Persistent helper text below the label explaining format or purpose. */
  @property() accessor description: string | undefined;

  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  @property({ type: String, reflect: true }) accessor type: InputType = 'text';

  /** The field must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Visually hide the label (it remains the accessible name). */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  @property({ type: String, reflect: true }) accessor size: InputSize = 'md';

  /** Not editable and not submitted. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue: string | undefined;

  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Setting `error` implies `invalid` and clearing it removes the invalid state,
    // synchronously, so validity is correct right after the assignment.
    if (value) {
      this.invalid = true;
    } else if (old) {
      this.invalid = false;
    }
    this.syncInternals();
  }

  /** HTML autocomplete token (e.g. `email`, `given-name`). WCAG 1.3.5 input purpose. */
  @property() accessor autocomplete: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;

  /** The uncontrolled value once the user has edited it; `undefined` until then. */
  @state() private accessor editedValue: string | undefined;

  /** Disabled by an owning native `<form>` / `<fieldset>` (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#field') private accessor inputEl!: HTMLInputElement | null;

  private readonly internals: ElementInternals = this.attachInternals();

  /** The current string value: `value` when controlled, the uncontrolled value otherwise. */
  get currentValue(): string {
    return this.value ?? this.editedValue ?? this.defaultValue ?? '';
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  get validationMessage(): string {
    this.syncInternals();
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
    this.editedValue = undefined;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (typeof restored === 'string' && this.value === undefined) {
      this.editedValue = restored;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Input');
    this.setAttribute('data-ds-field', '');
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
    const isDisabled = this.isDisabled;
    const message = this.displayedError;
    const describedBy = [this.description ? 'description' : '', message ? 'error' : ''].filter(Boolean).join(' ');
    const textOverrides = this.textOverrides;

    return html`
      <div class=${classMap({ group: true, disabled: isDisabled })}>
        <label
          class=${classMap({ 'visually-hidden': this.hideLabel })}
          part="label"
          data-part="label"
          for="field"
          >${this.label}${this.required ? COPY_REQUIRED_INDICATOR : nothing}</label
        >
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
        <input
          id="field"
          part="field"
          data-part="field"
          name=${this.name}
          type=${this.type}
          .value=${live(this.currentValue)}
          placeholder=${ifDefined(this.placeholder)}
          autocomplete=${ifDefined(this.autocomplete)}
          aria-describedby=${ifDefined(describedBy || undefined)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          ?readonly=${isDisabled}
          @input=${this.handleInput}
        />
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

  /**
   * The message in the error slot, by the doc's precedence: `error`, then
   * copy.required for an empty required field, then copy.invalid. Nothing is
   * shown unless the field is marked invalid.
   */
  private get displayedError(): string {
    if (this.error) {
      return this.error;
    }
    if (!this.invalid) {
      return '';
    }
    // `required` counts only the empty string as empty, as a native field does: whitespace passes.
    return this.required && this.currentValue === '' ? COPY_REQUIRED(this.label) : COPY_INVALID(this.label);
  }

  /**
   * helperSize, fontFamily and lineHeight forwarded to the description and error
   * Text. The object is always passed, with `undefined` for the keys the consumer
   * did not set, rather than withheld — a no-op for Text and one code path
   * instead of two.
   */
  private get textOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> {
    const o = this.overrides;
    return { fontSize: o?.helperSize, fontFamily: o?.fontFamily, lineHeight: o?.lineHeight };
  }

  private handleInput(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    if (this.isDisabled) {
      return;
    }
    const next = input.value;
    if (this.value === undefined) {
      this.editedValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<InputChangeDetail>('change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.value !== undefined) {
      // Controlled, like React: after `change` the field shows `.value` again
      // unless a listener rebound it synchronously; `live()` restores it.
      this.requestUpdate();
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as Exclude<InputOverridableBinding, 'helperSize'>[]) {
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
    // A disabled field is left out of submission and validity, as a native
    // disabled control is, while staying focusable and read-only.
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }

    const value = this.currentValue;
    const anchor = this.inputEl ?? undefined;
    this.internals.setFormValue(value);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.required && value === '') {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else if (anchor && !anchor.validity.valid) {
      // Browser validity for the chosen `type` (e.g. email format), reported with copy.invalid.
      this.internals.setValidity(anchor.validity, COPY_INVALID(this.label), anchor);
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
