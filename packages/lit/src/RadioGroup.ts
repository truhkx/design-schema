import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { DsFormField } from './Form.js';
import type { TextOverridableBinding } from './Text.js';
import './Text.js';

/** Layout of the options. */
export type RadioGroupOrientation = 'vertical' | 'horizontal';

/** Shape of each entry in `options`. */
export interface RadioGroupOption {
  /** Short identifier (letters, digits, dashes); it becomes part of an element id. */
  value: string;
  /** The option's own label. */
  label: string;
  /** One line: price, timing, consequence. */
  description?: string | undefined;
  /** Natively disabled, so arrow movement skips it. */
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
  | 'indicatorInset'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'optionPaddingBlock'
  | 'optionTextGap'
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

/** Hooks on `:host`. `helperSize` has none: it reaches the description, radioDescription and error Texts only through their `overrides`. */
const HOOKS: Record<Exclude<RadioGroupOverridableBinding, 'helperSize'>, string> = {
  controlBorderWidth: '--ds-radio-group-control-border-width',
  indicatorInset: '--ds-radio-group-indicator-inset',
  controlBorderInvalid: '--ds-radio-group-control-border-invalid',
  controlSize: '--ds-radio-group-control-size',
  controlRadius: '--ds-radio-group-control-radius',
  optionPaddingBlock: '--ds-radio-group-option-padding-block',
  optionTextGap: '--ds-radio-group-option-text-gap',
  optionGap: '--ds-radio-group-option-gap',
  listGap: '--ds-radio-group-list-gap',
  partGap: '--ds-radio-group-part-gap',
  legendSize: '--ds-radio-group-legend-size',
  legendWeight: '--ds-radio-group-legend-weight',
  labelSize: '--ds-radio-group-label-size',
  labelWeight: '--ds-radio-group-label-weight',
  fontFamily: '--ds-radio-group-font-family',
  lineHeight: '--ds-radio-group-line-height',
  disabledOpacity: '--ds-radio-group-disabled-opacity',
  transition: '--ds-radio-group-transition',
};

/** Keys a disabled group swallows: native radios move and select on the arrows and Space regardless of aria-disabled. */
const GUARDED_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' ']);

/**
 * `<ds-radio-group>` — RadioGroup (category: input, APG pattern: radio).
 *
 * `<ds-radio-group name="plan" label="Plan" .options=${[...]}>` renders a
 * `<fieldset role="radiogroup">` with a `<legend>` and one native
 * `<input type="radio">` per option inside its shadow root, where the shared
 * `name` groups them natively: one tab stop, roving tabindex, arrow movement
 * and Space come from the browser and are not reimplemented. Per-option
 * `disabled` is the native attribute so arrow movement skips it; a `disabled`
 * group uses `aria-disabled` plus click, key and change guards so it stays
 * focusable but inert. The indicator dot is a real node — a span inside the
 * option's label, laid over the `appearance: none` input with
 * `pointer-events: none` and carrying `part`/`data-part="radioIndicator"` — not
 * a pseudo-element of the input, which Firefox does not render on form controls.
 *
 * The element is form-associated (`setFormValue(value)`) and carries
 * `data-ds-field`, so `<ds-form>` collects the selected value, or no key while
 * nothing is selected, and validates it when focus leaves the whole group. The
 * inner native `change` is not composed, so a composed `change` CustomEvent
 * with `{ value }` is re-dispatched from the host.
 *
 * `ds-form` keeps its own messages (the summary and the `invalid` event) and
 * does not set `invalid` here, so the displayed error is `error`, else — only
 * while `invalid` — copy.required or copy.invalid. An app marks a group that
 * `ds-form` failed by setting `invalid` or `error` from that event.
 *
 * ## When to use
 *
 * Use a RadioGroup when the user must pick exactly one of two to about seven
 * options and seeing them all helps the decision — plan tiers, shipping
 * methods. Give options a `description` when the label alone does not tell
 * them apart. Set `defaultValue` when there is a sensible default; leave the
 * group unselected when the choice is consequential and you want a deliberate
 * answer. For a yes/no use Checkbox or Switch.
 *
 * @fires change - Fired when the selection changes, with `{ value }` in `detail`.
 */
@customElement('ds-radio-group')
export class DsRadioGroup extends LitElement implements DsFormField {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-radio-group-control-border-width: var(--border-width-thin);
      --ds-radio-group-indicator-inset: var(--space-1);
      --ds-radio-group-control-border-invalid: var(--color-border-danger);
      --ds-radio-group-control-size: var(--space-5);
      --ds-radio-group-control-radius: var(--radius-full);
      --ds-radio-group-option-padding-block: var(--space-1);
      --ds-radio-group-option-text-gap: var(--space-1);
      --ds-radio-group-option-gap: var(--space-2);
      --ds-radio-group-list-gap: var(--space-2);
      --ds-radio-group-part-gap: var(--space-1);
      --ds-radio-group-legend-size: var(--font-size-md);
      --ds-radio-group-legend-weight: var(--font-weight-medium);
      --ds-radio-group-label-size: var(--font-size-md);
      --ds-radio-group-label-weight: var(--font-weight-regular);
      --ds-radio-group-font-family: var(--font-family-body);
      --ds-radio-group-line-height: var(--font-line-height-normal);
      --ds-radio-group-disabled-opacity: var(--opacity-disabled);
      --ds-radio-group-transition: var(--motion-duration-fast);
      /* Locked: out of the overrides type, but they keep their hook so page CSS can re-theme them
         and the naming codemod can rename them. */
      --ds-radio-group-control-background: var(--color-control-background);
      --ds-radio-group-control-border: var(--color-control-border);
      --ds-radio-group-control-selected-background: var(--color-control-selected-background);
      --ds-radio-group-indicator: var(--color-control-selected-background);
      --ds-radio-group-legend-color: var(--color-foreground);
      --ds-radio-group-label-color: var(--color-foreground);
      --ds-radio-group-description-text: var(--color-foreground-muted);
      --ds-radio-group-error-text: var(--color-foreground-danger);
      --ds-radio-group-focus-ring: var(--color-border-focus);
      --ds-radio-group-focus-ring-width: var(--border-width-focus);
      --ds-radio-group-min-target: var(--size-target-comfortable);
      /* helperSize has no hook: it reaches the composed Texts only through their overrides. */
    }

    /* descriptionText, errorText: the Texts' tone draws them; the parent's hook feeds Text's own
       documented --ds-text-color hook on the child host, never the child's shadow tree. */
    [data-part='description'],
    [data-part='radioDescription'] {
      --ds-text-color: var(--ds-radio-group-description-text);
    }
    [data-part='errorMessage'] {
      --ds-text-color: var(--ds-radio-group-error-text);
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

    /* legendColor, legendSize, legendWeight, fontFamily, lineHeight: the legend's own rule.
       A <legend> does not take part in the fieldset's flex gap, so partGap below it is a margin. */
    legend {
      margin-block-end: var(--ds-radio-group-part-gap);
      padding: 0;
      color: var(--ds-radio-group-legend-color);
      font-family: var(--ds-radio-group-font-family);
      font-size: var(--ds-radio-group-legend-size);
      font-weight: var(--ds-radio-group-legend-weight);
      line-height: var(--ds-radio-group-line-height);
    }

    /* listGap: between options, on either axis; horizontal wraps rather than overflows */
    .list {
      display: flex;
      gap: var(--ds-radio-group-list-gap);
      flex-direction: column;
    }
    :host([orientation='horizontal']) .list {
      flex-direction: row;
      flex-wrap: wrap;
    }

    /* The option row — radio, radioLabel and radioDescription. minTarget tall, optionPaddingBlock
       around it, and the whole row is the hit area. Not an anatomy part, so it carries no data-part. */
    .option {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: var(--ds-radio-group-control-size) minmax(0, 1fr);
      column-gap: var(--ds-radio-group-option-gap);
      row-gap: var(--ds-radio-group-option-text-gap);
      align-items: center;
      align-content: center;
      min-block-size: var(--ds-radio-group-min-target);
      padding-block: var(--ds-radio-group-option-padding-block);
      cursor: pointer;
    }

    /* controlBackground, controlBorder, controlBorderWidth, controlSize, controlRadius: a native
       input drawn with the control tokens, never a hidden input under a fake box. */
    .radio {
      box-sizing: border-box;
      grid-column: 1;
      grid-row: 1;
      display: block;
      inline-size: var(--ds-radio-group-control-size);
      block-size: var(--ds-radio-group-control-size);
      margin: 0;
      padding: 0;
      border: var(--ds-radio-group-control-border-width) solid var(--ds-radio-group-control-border);
      border-radius: var(--ds-radio-group-control-radius);
      background-color: var(--ds-radio-group-control-background);
      cursor: inherit;
      appearance: none;
      -webkit-appearance: none;
    }

    /* controlSelectedBackground: selected border color; the fill stays controlBackground */
    .radio:checked {
      border-color: var(--ds-radio-group-control-selected-background);
    }

    /* focusRing, focusRingWidth: the radio's border becomes the focus ring, replacing
       controlBorderWidth/controlBorder; the option row is not outlined. The transparent outline
       keeps a ring in forced-colors mode. */
    .radio:focus-visible {
      outline: var(--ds-radio-group-focus-ring-width) solid transparent;
      border-width: var(--ds-radio-group-focus-ring-width);
      border-color: var(--ds-radio-group-focus-ring);
    }

    /* controlBorderInvalid: aria-invalid lives on the fieldset only, so the state comes from the host.
       Border-colour precedence is invalid, then selected, then rest; focus does not replace it —
       a focused invalid radio keeps the danger colour and takes only the focus width. */
    :host([invalid]) .radio,
    :host([invalid]) .radio:focus-visible {
      border-color: var(--ds-radio-group-control-border-invalid);
    }

    /* labelColor, labelSize, labelWeight, fontFamily, lineHeight: the label's own rule. Positioned,
       so the indicator inside it can be laid over the radio in column 1 of the same grid row; both
       are centred in that row, so their centres line up whatever the label's height. */
    .label {
      position: relative;
      grid-column: 2;
      grid-row: 1;
      color: var(--ds-radio-group-label-color);
      font-family: var(--ds-radio-group-font-family);
      font-size: var(--ds-radio-group-label-size);
      font-weight: var(--ds-radio-group-label-weight);
      line-height: var(--ds-radio-group-line-height);
      cursor: inherit;
    }

    /* indicator, indicatorInset: the centre dot, controlSize minus 2 × indicatorInset across, always
       a circle (it does not follow controlRadius). A real span inside the label, pulled back over the
       input by controlSize + optionGap and in by indicatorInset; pointer-events: none so a click on
       it reaches the input. Its size is fixed and it fades rather than scales, so the thicker focus
       border eats into the inset rather than shrinking the dot. */
    .indicator {
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(
        var(--ds-radio-group-indicator-inset) - var(--ds-radio-group-option-gap) -
          var(--ds-radio-group-control-size)
      );
      inline-size: calc(var(--ds-radio-group-control-size) - 2 * var(--ds-radio-group-indicator-inset));
      block-size: calc(var(--ds-radio-group-control-size) - 2 * var(--ds-radio-group-indicator-inset));
      margin-block: auto;
      border-radius: var(--radius-full);
      background-color: var(--ds-radio-group-indicator);
      opacity: 0;
      pointer-events: none;
    }
    .radio:checked + .label .indicator {
      opacity: 1;
    }

    /* optionTextGap is the row-gap above; the description sits under the label, not under the radio */
    .option-description {
      grid-column: 2;
      grid-row: 2;
    }

    /* disabledOpacity dims option rows only, once: an option dims its own row, a disabled group
       every row, and legend, description and errorMessage stay at full opacity. */
    .list.disabled .option,
    .option.disabled {
      opacity: var(--ds-radio-group-disabled-opacity);
      cursor: not-allowed;
    }

    /* transition: the selected border color and the dot's opacity, fading in and out, with
       motion.easing.standard. The focus border (color and width) and the invalid border switch
       instantly, so neither is in the transition and both states clear it. */
    @media (prefers-reduced-motion: no-preference) {
      .radio {
        transition: border-color var(--ds-radio-group-transition) var(--motion-easing-standard);
      }
      .indicator {
        transition: opacity var(--ds-radio-group-transition) var(--motion-easing-standard);
      }
      .radio:focus-visible,
      :host([invalid]) .radio {
        transition: none;
      }
    }
  `;

  /** The group's legend — the question the options answer. Always visible. */
  @property() accessor label = '';

  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  @property() accessor name = '';

  /** The options in display order. Two to about seven; more than that is a Select. A property, not an attribute. */
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

  /** Per-instance style overrides: `{ controlSize: 'space.6' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>>
    | undefined;

  private errorValue: string | undefined;

  /** The group's error message. Setting it marks the group invalid. Say what to do. */
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

  /** `defaultValue` as it stood at first render; what a form reset returns to. */
  private initialValue: string | undefined;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`), or by `ds-fieldset`. */
  @state() private accessor formDisabled = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'RadioGroup');
    // No value: the group has a real blur moment — focus leaving the whole fieldset.
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

  /** The field's own copy, in the same order as the displayed error: `error`, then copy.required, then copy.invalid; empty when valid. */
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

  /** Focus lands on the selected radio, else the first enabled one — the group's one tab stop. `delegatesFocus` alone would pick the first in tree order. */
  override focus(options?: FocusOptions): void {
    const target = this.focusTarget;
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

  /** Back to the initial selection: `defaultValue` as read at first render, else nothing. */
  formResetCallback(): void {
    this.internalValue = this.initialValue;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.internalValue = state;
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    // `defaultValue` is read once, at first render; a later assignment is a no-op, like a React state initialiser.
    if (!this.hasUpdated) {
      this.initialValue = this.defaultValue;
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
    // Ids do not cross the shadow root, so a group without a name still gets stable ones.
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
        @click=${this.handleGroupClick}
        @keydown=${this.handleKeydown}
      >
        <legend part="legend" data-part="legend">${this.label}${this.required
          ? COPY_REQUIRED_INDICATOR
          : nothing}</legend>
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
        <div class=${classMap({ list: true, disabled: groupDisabled })}>
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
                  @change=${(event: Event) => this.handleChange(event, option)}
                />
                <label class="label" part="radioLabel" data-part="radioLabel" for=${id}
                  ><span class="indicator" part="radioIndicator" data-part="radioIndicator" aria-hidden="true"></span
                  >${option.label}</label
                >
                ${option.description
                  ? html`<ds-text
                      id="${id}-description"
                      class="option-description"
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

  /** The group's one tab stop: the checked radio, else the first enabled one. */
  private get focusTarget(): HTMLInputElement | undefined {
    const radios = this.radios;
    return radios.find((radio) => radio.checked) ?? radios.find((radio) => !radio.disabled);
  }

  /** Rendered error, as Input: `error`, then — only while invalid — copy.required when required and nothing is selected, else copy.invalid. */
  private get displayedError(): string {
    if (this.error) {
      return this.error;
    }
    if (!this.invalid) {
      return '';
    }
    return this.required && this.currentValue === null ? COPY_REQUIRED(this.label) : COPY_INVALID(this.label);
  }

  /** helperSize, fontFamily and lineHeight forwarded to the description, radioDescription and error Texts. */
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

  /** A disabled group keeps its radios focusable (aria-disabled); clicks are cancelled on the fieldset so nothing is selected. */
  private handleGroupClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
    }
  }

  /** A disabled group swallows the native arrow movement and Space selection, which aria-disabled does not stop. */
  private handleKeydown(event: KeyboardEvent): void {
    if (this.isDisabled && GUARDED_KEYS.has(event.key)) {
      event.preventDefault();
    }
  }

  private handleChange(event: Event, option: RadioGroupOption): void {
    // The native change is not composed; the host re-dispatches a composed one.
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
    // A disabled field is left out of submission and validity, as a native disabled control is.
    if (this.isDisabled) {
      this.internals.setFormValue(null);
      this.internals.setValidity({});
      return;
    }

    const value = this.currentValue;
    const anchor = this.focusTarget;
    this.internals.setFormValue(value);

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const [binding, hook] of Object.entries(HOOKS) as [keyof typeof HOOKS, string][]) {
      const ref = this.overrides?.[binding];
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
