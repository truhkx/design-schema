import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

/** Detail carried by the `change` CustomEvent. */
export interface CheckboxChangeDetail {
  checked: boolean;
}

/** copy.required — the Form renders this on a failed submit; ElementInternals reports it too. */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Overridable style hooks; see the `overrides` property. `controlBorder`, `controlSelectedBackground`, `indicator`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type CheckboxOverridableBinding =
  | 'controlBackground'
  | 'controlBorderWidth'
  | 'indicatorStroke'
  | 'pressedOverlay'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<CheckboxOverridableBinding, string> = {
  controlBackground: '--ds-checkbox-control-background',
  controlBorderWidth: '--ds-checkbox-control-border-width',
  indicatorStroke: '--ds-checkbox-indicator-stroke',
  pressedOverlay: '--ds-checkbox-pressed-overlay',
  controlBorderInvalid: '--ds-checkbox-control-border-invalid',
  controlSize: '--ds-checkbox-control-size',
  controlRadius: '--ds-checkbox-control-radius',
  gap: '--ds-checkbox-gap',
  partGap: '--ds-checkbox-part-gap',
  labelSize: '--ds-checkbox-label-size',
  labelWeight: '--ds-checkbox-label-weight',
  helperSize: '--ds-checkbox-helper-size',
  fontFamily: `--ds-checkbox-font-family`,
  lineHeight: '--ds-checkbox-line-height',
  disabledOpacity: '--ds-checkbox-disabled-opacity',
  transition: '--ds-checkbox-transition',
};

/**
 * `<ds-checkbox>` — Checkbox (category: input, APG pattern: checkbox).
 *
 * `<ds-checkbox name="updates" label="Send me product updates">`. A native
 * `<input type="checkbox">` styled with `appearance: none` lives in the shadow
 * root (with `delegatesFocus`), labelled by a `<label for>` in the same root.
 * The element is form-associated via `ElementInternals`
 * (`setFormValue(checked ? value : null)`), so a native `<form>` sees it, and
 * `<ds-form>` collects it by `name` like `ds-input` (its `value` when checked,
 * no key otherwise). The inner native `change` is not composed, so a composed
 * `change` CustomEvent with `{ checked }` is re-dispatched from the host.
 * `checked` behaves like a native input: the `checked` attribute is the initial
 * state only and the property tracks the live state, so it is not reflected.
 *
 * ## When to use
 *
 * Use a Checkbox for one independent option ("Remember me"), for terms and
 * consent (`required`), or several with the same `name` when the user may pick
 * any number of items. Use `indeterminate` on a "select all" parent when only
 * some of its children are checked. For a setting that applies immediately,
 * use Switch instead.
 *
 * @fires change - Fired when the checked state changes with `{ checked }` in `detail`.
 * @csspart control - The native `<input type="checkbox">` (anatomy: control, indicator).
 * @csspart label - The `<label>`.
 * @csspart description - The helper text.
 * @csspart error - The `role="alert"` error message region.
 */
@customElement('ds-checkbox')
export class DsCheckbox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-checkbox-font-family);
      --ds-checkbox-control-background: var(--color-control-background);
      --ds-checkbox-control-border-width: var(--border-width-thin);
      --ds-checkbox-indicator-stroke: var(--border-width-focus);
      --ds-checkbox-pressed-overlay: var(--opacity-disabled);
      --ds-checkbox-control-border-invalid: var(--color-border-danger);
      --ds-checkbox-control-size: var(--space-5);
      --ds-checkbox-control-radius: var(--radius-sm);
      --ds-checkbox-gap: var(--space-2);
      --ds-checkbox-part-gap: var(--space-1);
      --ds-checkbox-label-size: var(--font-size-md);
      --ds-checkbox-label-weight: var(--font-weight-regular);
      --ds-checkbox-helper-size: var(--font-size-sm);
      --ds-checkbox-font-family: var(--font-family-body);
      --ds-checkbox-line-height: var(--font-line-height-normal);
      --ds-checkbox-disabled-opacity: var(--opacity-disabled);
      --ds-checkbox-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* minTarget: the whole row is the hit area */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-checkbox-gap);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    .control {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--ds-checkbox-control-size);
      block-size: var(--ds-checkbox-control-size);
      margin: 0;
      /* Center the control on the first line of the label. */
      margin-block-start: calc(
        (var(--ds-checkbox-label-size) * var(--ds-checkbox-line-height) - var(--ds-checkbox-control-size)) / 2
      );
      border-width: var(--ds-checkbox-control-border-width);
      border-style: solid;
      border-color: var(--color-control-border);
      border-radius: var(--ds-checkbox-control-radius);
      background: var(--ds-checkbox-control-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition:
        background-color var(--ds-checkbox-transition) var(--motion-easing-standard),
        border-color var(--ds-checkbox-transition) var(--motion-easing-standard);
    }

    /* pressedOverlay: while pressed, the box shows controlSelectedBackground at this opacity */
    .control:active:not(:checked):not(:indeterminate)::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--color-control-selected-background);
      opacity: var(--ds-checkbox-pressed-overlay);
    }
    :host([disabled]) .control:active::before {
      content: none;
    }

    /* indicator: check mark and mixed dash at indicatorStroke, drawn at controlSize minus 2 × space.1 */
    .control::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity var(--ds-checkbox-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .control,
      .control::after {
        transition: none;
      }
    }

    /* controlSelectedBackground: checked and indeterminate fill; the border takes the same color */
    .control:checked,
    .control:indeterminate {
      border-color: var(--color-control-selected-background);
      background: var(--color-control-selected-background);
    }

    .control:checked::after {
      inline-size: calc((var(--ds-checkbox-control-size) - 2 * var(--space-1)) * 0.5);
      block-size: calc(var(--ds-checkbox-control-size) - 2 * var(--space-1));
      margin-block-start: calc(var(--space-1) * -0.5);
      border-inline-end: var(--ds-checkbox-indicator-stroke) solid var(--color-control-selected-foreground);
      border-block-end: var(--ds-checkbox-indicator-stroke) solid var(--color-control-selected-foreground);
      transform: rotate(45deg) scale(0.8);
      opacity: 1;
    }

    .control:indeterminate::after {
      inline-size: calc(var(--ds-checkbox-control-size) - 2 * var(--space-1));
      block-size: var(--ds-checkbox-indicator-stroke);
      background: var(--color-control-selected-foreground);
      opacity: 1;
    }

    /* controlBorderInvalid */
    :host([invalid]) .control {
      border-color: var(--ds-checkbox-control-border-invalid);
    }

    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabled: stays focusable; dimmed with disabledOpacity */
    :host([disabled]) .row {
      opacity: var(--ds-checkbox-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) .control {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
      min-inline-size: 0;
    }

    .label {
      font-size: var(--ds-checkbox-label-size);
      font-weight: var(--ds-checkbox-label-weight);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .required {
      color: var(--color-foreground-muted);
    }

    .description {
      margin: 0;
      font-size: var(--ds-checkbox-helper-size);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground-muted);
    }

    .error {
      font-size: var(--ds-checkbox-helper-size);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground-danger);
    }
    .error:empty {
      display: none;
    }
  `;

  /** Visible label. Clicking or tapping it toggles the control. */
  @property() label = '';

  /** Field name used by the enclosing Form when collecting values. */
  @property() name = '';

  /** The value submitted when checked. Lets several checkboxes share a `name`. */
  @property() value = 'on';

  /** Controlled checked state. Omit for an uncontrolled control. The attribute is the initial state only; not reflected. */
  @property({ type: Boolean }) checked?: boolean;

  /** Initial state for an uncontrolled control. */
  @property({ type: Boolean, attribute: 'default-checked' }) defaultChecked = false;

  /** Shows the mixed indicator. Visual and announced only; the submitted value still follows `checked`. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;

  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Must be checked to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Persistent helper text below the label. */
  @property() description?: string;

  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef>>;

  private errorValue?: string;

  /** The error message. Setting it implies `invalid`. Say what to do. */
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

  /** Uncontrolled checked state (seeded from `defaultChecked`). */
  @state() private internalChecked = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#control') private readonly inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Checkbox');
  }

  /** Whether the control is currently checked. */
  get currentChecked(): boolean {
    return this.checked ?? this.internalChecked;
  }

  /** The value the Form collects: `value` when checked, otherwise `null` (no key). */
  get currentValue(): string | null {
    return this.currentChecked ? this.value : null;
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
    this.checked = undefined;
    this.internalChecked = this.defaultChecked;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.checked = state === this.value;
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalChecked = this.defaultChecked;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    // `indeterminate` has no attribute; it is a DOM property only.
    this.inputEl.indeterminate = this.indeterminate;
    this.syncInternals();
  }

  protected override render() {
    const isDisabled = this.disabled || this.formDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;

    return html`
      <div class="row" @click=${this.handleRowClick}>
        <input
          id="control"
          class="control"
          part="control"
          type="checkbox"
          name=${this.name}
          value=${this.value}
          .checked=${live(this.currentChecked)}
          aria-checked=${ifDefined(this.indeterminate ? 'mixed' : undefined)}
          aria-describedby=${ifDefined(describedBy)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          @click=${this.handleControlClick}
          @change=${this.handleChange}
        />
        <div class="text">
          <label class="label" part="label" for="control"
            >${this.label}${this.required
              ? html`<span class="required" aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
              : nothing}</label
          >
          ${this.description
            ? html`<p id="description" class="description" part="description">${this.description}</p>`
            : nothing}
          <div id="error" class="error" part="error" role="alert">${this.error ?? ''}</div>
        </div>
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** Clicks on the description (or the row's empty space) toggle the control too. */
  private handleRowClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target === this.inputEl || target.closest('label') !== null) {
      // The label click already forwards to the input; the input handles itself.
      return;
    }
    if (this.isDisabled) {
      return;
    }
    this.inputEl.click();
  }

  /** Disabled uses aria-disabled so the control stays focusable; click and change are both guarded. */
  private handleControlClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private handleChange(event: Event): void {
    if (this.isDisabled) {
      event.preventDefault();
      this.requestUpdate();
      return;
    }
    const next = this.inputEl.checked;
    // Toggling a mixed checkbox clears the mixed state.
    this.indeterminate = false;
    if (this.checked !== undefined) {
      this.checked = next;
    } else {
      this.internalChecked = next;
    }
    this.dispatchEvent(
      new CustomEvent<CheckboxChangeDetail>('change', {
        detail: { checked: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Mirror value and validity into ElementInternals so an owning native form sees them. */
  private syncInternals(): void {
    const anchor = this.inputEl;
    if (!anchor) {
      return;
    }
    const checked = this.currentChecked;
    this.internals.setFormValue(checked && !this.isDisabled ? this.value : null);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, `${this.label} is invalid`, anchor);
    } else if (this.required && !checked) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CheckboxOverridableBinding[]) {
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
    'ds-checkbox': DsCheckbox;
  }
}
