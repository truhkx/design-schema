import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { IconOverridableBinding } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';
import './Icon.js';
import './Text.js';

/** Detail carried by the `change` CustomEvent. */
export interface CheckboxChangeDetail {
  /** The new checked state. */
  checked: boolean;
}

/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** indicator (locked): reaches the composed Icon only through its `color` override. */
const INDICATOR_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.control.selectedForeground',
};

/** Overridable style hooks; see the `overrides` property. `controlBorder`, `controlSelectedBackground`, `indicator`, `indicatorStroke`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type CheckboxOverridableBinding =
  | 'controlBackground'
  | 'controlBorderWidth'
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
  pressedOverlay: '--ds-checkbox-pressed-overlay',
  controlBorderInvalid: '--ds-checkbox-control-border-invalid',
  controlSize: '--ds-checkbox-control-size',
  controlRadius: '--ds-checkbox-control-radius',
  gap: '--ds-checkbox-gap',
  partGap: '--ds-checkbox-part-gap',
  labelSize: '--ds-checkbox-label-size',
  labelWeight: '--ds-checkbox-label-weight',
  helperSize: '--ds-checkbox-helper-size',
  fontFamily: '--ds-checkbox-font-family',
  lineHeight: '--ds-checkbox-line-height',
  disabledOpacity: '--ds-checkbox-disabled-opacity',
  transition: '--ds-checkbox-transition',
};

/**
 * `<ds-checkbox>` — Checkbox (category: input, APG pattern: checkbox).
 *
 * `<ds-checkbox name="updates" label="Send me product updates">`. A native
 * `<input type="checkbox">` styled with `appearance: none` lives in the shadow
 * root (with `delegatesFocus`) and is the drawn box; the check mark and mixed
 * dash are `<ds-icon name="check">` / `<ds-icon name="dash">` in an aria-hidden
 * indicator span stacked over it. The `<label for>` sits in the same root, so a
 * click on it toggles natively; a click on the description or the gap is
 * forwarded to the control. The error message sits below the row, outside the
 * hit area.
 *
 * The element is form-associated via `ElementInternals`
 * (`setFormValue(checked ? value : null)`), so a native `<form>` sees it, and
 * `<ds-form>` discovers it by `data-ds-field` and collects the boolean. The inner
 * native `change` is not composed, so a composed `change` CustomEvent with
 * `{ checked }` is re-dispatched from the host. `checked` behaves like a native
 * input: the `checked` attribute is the initial state only and the property
 * tracks the live state, so it is not reflected.
 *
 * ## When to use
 *
 * Use a Checkbox for one independent option ("Remember me"), for terms and
 * consent (`required`), or several, each with its own `name`, when the user may
 * pick any number of items. Use `indeterminate` on a "select all" parent when
 * only some of its children are checked. For a setting that applies
 * immediately, use Switch instead; to pick exactly one of several, use RadioGroup.
 *
 * @fires change - Fired when the user toggles the checked state, with `{ checked }` in `detail`.
 */
@customElement('ds-checkbox')
export class DsCheckbox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-checkbox-control-background: var(--color-control-background);
      --ds-checkbox-control-border-width: var(--border-width-thin);
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

    /* partGap: between the row and the error message below it */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
    }

    /* gap, minTarget: the whole row, gap included, is the hit area; no vertical padding */
    .row {
      display: flex;
      align-items: center;
      gap: var(--ds-checkbox-gap);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    /* The control and its indicator stacked in one cell. */
    .box {
      display: grid;
      flex: none;
    }
    .box > * {
      grid-area: 1 / 1;
    }

    .control {
      box-sizing: border-box;
      inline-size: var(--ds-checkbox-control-size);
      block-size: var(--ds-checkbox-control-size);
      margin: 0;
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

    /* pressedOverlay: an unchecked, not-mixed, enabled box shows controlSelectedBackground at this opacity */
    .row:not(.disabled) .control:active:not(:checked):not(:indeterminate) {
      background: color-mix(
        in srgb,
        var(--color-control-selected-background) calc(var(--ds-checkbox-pressed-overlay) * 100%),
        var(--ds-checkbox-control-background)
      );
    }

    /* controlSelectedBackground: checked and indeterminate fill; the border takes the same color */
    .control:checked,
    .control:indeterminate {
      border-color: var(--color-control-selected-background);
      background: var(--color-control-selected-background);
    }

    /* controlBorderInvalid */
    :host([invalid]) .control {
      border-color: var(--ds-checkbox-control-border-invalid);
    }

    /* focusRing, focusRingWidth */
    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* indicator: the Icon centered in the control; clicks fall through to the input */
    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .control {
        transition: none;
      }
    }

    /* labelColor, labelSize, labelWeight, fontFamily, lineHeight: the label's own rule */
    .label {
      font-family: var(--ds-checkbox-font-family);
      font-size: var(--ds-checkbox-label-size);
      font-weight: var(--ds-checkbox-label-weight);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    /* partGap: between label and description */
    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
      min-inline-size: 0;
    }

    /* disabledOpacity: dims the control (with its indicator) and the label, not the description or error */
    .row.disabled {
      cursor: not-allowed;
    }
    .row.disabled .box,
    .row.disabled .label {
      opacity: var(--ds-checkbox-disabled-opacity);
    }
    .row.disabled .control,
    .row.disabled .label {
      cursor: not-allowed;
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
  `;

  /** Visible label. Clicking or tapping it toggles the control. */
  @property() accessor label = '';

  /** Visually hide the label (it remains the accessible name). */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** Field name used by the enclosing Form when collecting values. */
  @property() accessor name = '';

  /** What a native `<form>` submits under `name` when checked. ds-form ignores it and collects the boolean. */
  @property() accessor value = 'on';

  /** Initial state when the `checked` attribute is absent. */
  @property({ type: Boolean, attribute: 'default-checked' }) accessor defaultChecked = false;

  /** Shows the mixed indicator. Visual and announced only; the submitted value still follows `checked`. */
  @property({ type: Boolean, reflect: true }) accessor indeterminate = false;

  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Must be checked to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  /** Persistent helper text below the label. */
  @property() accessor description: string | undefined;

  /** Per-instance style overrides: `{ controlRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>>
    | undefined;

  private checkedValue: boolean | undefined;

  /** The live checked state, like a native input. The attribute is the initial state only; not reflected. */
  get checked(): boolean {
    return this.checkedValue ?? this.defaultChecked;
  }
  @property({ type: Boolean })
  set checked(value: boolean) {
    const old = this.checked;
    this.checkedValue = value;
    this.requestUpdate('checked', old);
  }

  private errorValue: string | undefined;

  /** The error message. Setting it marks the control invalid. Say what to do. */
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

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  /** A user toggle clears the mixed indicator locally until `indeterminate` changes value again. */
  @state() private accessor mixedCleared = false;

  @query('#control') private accessor inputEl!: HTMLInputElement | null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Checkbox');
    this.setAttribute('data-ds-field', '');
  }

  /** The value `<ds-form>` collects: the checked boolean. */
  get currentValue(): boolean {
    return this.checked;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  /** The field's own copy, in the same order as its validity; empty when valid. */
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

  /* Form-associated custom element callbacks (invoked by the browser). */

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.checked = this.hasAttribute('checked') || this.defaultChecked;
    this.mixedCleared = false;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    this.checked = typeof state === 'string' && state === this.value;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('indeterminate')) {
      this.mixedCleared = false;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    // `indeterminate` has no attribute; it is a DOM property only.
    if (this.inputEl && this.inputEl.indeterminate !== this.showMixed) {
      this.inputEl.indeterminate = this.showMixed;
    }
    this.syncInternals();
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const mixed = this.showMixed;
    const message = this.displayedError;
    const describedBy = [this.description ? 'description' : '', message ? 'error' : ''].filter(Boolean).join(' ');
    const textOverrides = this.textOverrides;
    const glyph = mixed ? 'dash' : this.checked ? 'check' : undefined;

    return html`
      <div class="field">
        <div class=${classMap({ row: true, disabled: isDisabled })} @click=${this.handleRowClick}>
          <span class="box">
            <input
              id="control"
              class="control"
              part="control"
              data-part="control"
              type="checkbox"
              name=${this.name}
              value=${this.value}
              .checked=${live(this.checked)}
              aria-checked=${ifDefined(mixed ? 'mixed' : undefined)}
              aria-describedby=${ifDefined(describedBy || undefined)}
              aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
              aria-required=${ifDefined(this.required ? 'true' : undefined)}
              aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
              @click=${this.handleControlClick}
              @change=${this.handleChange}
            />
            ${glyph
              ? html`<span class="indicator" part="indicator" data-part="indicator" aria-hidden="true"
                  ><ds-icon name=${glyph} size="xs" .overrides=${INDICATOR_OVERRIDES}></ds-icon
                ></span>`
              : nothing}
          </span>
          <div class="text">
            <label
              class=${classMap({ label: true, 'visually-hidden': this.hideLabel })}
              part="label"
              data-part="label"
              for="control"
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
          </div>
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

  private get showMixed(): boolean {
    return this.indeterminate && !this.mixedCleared;
  }

  /** Rendered error, as Input: `error`, then — only while invalid — copy.required when required and unchecked, else copy.invalid. */
  private get displayedError(): string {
    if (this.error) {
      return this.error;
    }
    if (!this.invalid) {
      return '';
    }
    return this.required && !this.checked ? COPY_REQUIRED(this.label) : COPY_INVALID(this.label);
  }

  /** helperSize, fontFamily and lineHeight forwarded to the description and error Text. */
  private get textOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const o = this.overrides;
    if (!o) {
      return undefined;
    }
    return { fontSize: o.helperSize, fontFamily: o.fontFamily, lineHeight: o.lineHeight };
  }

  /** Clicks on the description or the gap toggle the control too. */
  private handleRowClick(event: MouseEvent): void {
    const input = this.inputEl;
    const target = event.target;
    if (!input || !(target instanceof Element)) {
      return;
    }
    // The input handles itself, and a label click is already forwarded to it natively.
    if (target === input || target.closest('label') !== null) {
      return;
    }
    input.focus();
    input.click();
  }

  /** Disabled uses aria-disabled so the control stays focusable; click and change are both guarded. */
  private handleControlClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
    }
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    if (this.isDisabled) {
      event.preventDefault();
      input.checked = this.checked;
      return;
    }
    const next = input.checked;
    if (this.indeterminate) {
      this.mixedCleared = true;
    }
    this.checked = next;
    this.dispatchEvent(
      new CustomEvent<CheckboxChangeDetail>('change', {
        detail: { checked: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Mirror value and validity into ElementInternals, in the same order as Input. */
  private syncInternals(): void {
    // A disabled field is left out of submission and validity, as a native disabled control is.
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }

    const anchor = this.inputEl ?? undefined;
    this.internals.setFormValue(this.checked ? this.value : null);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.required && !this.checked) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
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
