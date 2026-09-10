import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Icon.js';
import './Listbox.js';
import type { DsListbox, ListboxChangeDetail, ListboxGroupOption, ListboxItem, ListboxOption, ListboxValue } from './Listbox.js';

export type SelectNative = 'auto' | 'always' | 'never';

export type SelectSize = 'sm' | 'md';

/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. */
export type SelectValue = string | string[];

/** Detail carried by the `change` CustomEvent. */
export interface SelectChangeDetail {
  value: SelectValue;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface SelectOpenChangeDetail {
  open: boolean;
}

/**
 * Overridable style hooks; see the `overrides` property. `triggerBackground`,
 * `triggerBorder`, `valueColor`, `placeholderColor`, `chevron`,
 * `descriptionText`, `errorText`, `minTarget` and `focusRingWidth` are locked
 * and excluded.
 */
export type SelectOverridableBinding =
  | 'triggerBorderFocus'
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupShadow'
  | 'popupRadius'
  | 'popupOffset'
  | 'layer'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

const HOOKS: Record<SelectOverridableBinding, string> = {
  triggerBorderFocus: '--ds-select-trigger-border-focus',
  triggerBorderInvalid: '--ds-select-trigger-border-invalid',
  triggerBorderWidth: '--ds-select-trigger-border-width',
  triggerRadius: '--ds-select-trigger-radius',
  triggerPaddingInline: '--ds-select-trigger-padding-inline',
  triggerPaddingBlock: '--ds-select-trigger-padding-block',
  triggerGap: '--ds-select-trigger-gap',
  partGap: '--ds-select-part-gap',
  labelWeight: '--ds-select-label-weight',
  helperSize: '--ds-select-helper-size',
  popupSurface: '--ds-select-popup-surface',
  popupBorder: '--ds-select-popup-border',
  popupShadow: '--ds-select-popup-shadow',
  popupRadius: '--ds-select-popup-radius',
  popupOffset: '--ds-select-popup-offset',
  layer: '--ds-select-layer',
  fontFamily: '--ds-select-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-select-font-size',
  lineHeight: '--ds-select-line-height',
  disabledOpacity: '--ds-select-disabled-opacity',
  enter: '--ds-select-enter',
};

/** copy.placeholder */
const COPY_PLACEHOLDER = 'Select…';
/** copy.selectedCount */
const COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

function isGroupOption(option: ListboxOption): option is ListboxGroupOption {
  return 'group' in option;
}

/** Depth-first list of every selectable item, groups flattened. */
function flattenOptions(options: ListboxOption[]): ListboxItem[] {
  const result: ListboxItem[] = [];
  for (const option of options) {
    if (isGroupOption(option)) {
      result.push(...flattenOptions(option.options));
    } else {
      result.push(option);
    }
  }
  return result;
}

/**
 * `<ds-select>` — Select (category: input, APG pattern: combobox — select-only).
 *
 * `<ds-select label="Country" name="country" .options=${options}>` renders a
 * `<button role="combobox" aria-haspopup="listbox" aria-expanded aria-controls>`
 * showing the current value, and a popup composing `<ds-listbox>` for the
 * options. The popup uses the Popover API (`popover="manual"`,
 * `showPopover()`) for top-layer rendering when the browser supports it, and
 * a `position: fixed` + `layer.dropdown` fallback otherwise, positioned below
 * (flipped above on overflow) the trigger at least as wide as it. Real DOM
 * focus stays on the trigger the whole time the popup is open — keys are
 * forwarded to the composed Listbox's own `handleKey`, so
 * `aria-activedescendant`-style navigation, Home/End/typeahead and
 * Space/Enter selection all come from Listbox's own keyboard model. The
 * element is form-associated (`setFormValue`, `FormData` for `multiple`) and
 * implements the `DsFormField` interface. `native="always"` renders a native
 * `<select>`/`<select multiple>` instead, with the same label/description/
 * error wiring and no popup — `native="auto"` never uses it on web (that is
 * a React Native / phone behavior).
 *
 * ## When to use
 *
 * Use a Select for a form field with about seven to fifty options that people
 * recognise on sight. Use `multiple` for tags or memberships when a set of
 * Checkboxes would be too long. Use `native="always"` on web for forms that
 * must work without JavaScript.
 *
 * ## When not to use
 *
 * Do not use a Select for two to six options; use a RadioGroup so every
 * option is visible. Not for actions (Menu), for switching modes
 * (SegmentedControl), or for on/off (Switch).
 *
 * @fires change - Fired when the value changes, with `{ value }` (array with `multiple`) in `detail`.
 * @fires open-change - Fired when the popup opens or closes, with `{ open }` in `detail`.
 * @csspart label - The field's visible label (anatomy: label).
 * @csspart description - The helper text under the label (anatomy: description).
 * @csspart trigger - The `role="combobox"` button, or the native `<select>` when `native="always"` (anatomy: trigger).
 * @csspart value - The trigger's value text (anatomy: value).
 * @csspart chevron - The trigger's trailing `<ds-icon>` (anatomy: chevron).
 * @csspart popup - The positioned popup surface (anatomy: popup).
 * @csspart listbox - The composed `<ds-listbox>` (anatomy: listbox).
 * @csspart errorMessage - The `role="alert"` error message region (anatomy: errorMessage).
 */
@customElement('ds-select')
export class DsSelect extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-select-trigger-border-focus: var(--color-border-focus);
      --ds-select-trigger-border-invalid: var(--color-border-danger);
      --ds-select-trigger-border-width: var(--border-width-thin);
      --ds-select-trigger-radius: var(--radius-md);
      --ds-select-trigger-padding-inline: var(--space-md);
      --ds-select-trigger-padding-block: var(--space-sm);
      --ds-select-trigger-gap: var(--layout-gap-normal);
      --ds-select-part-gap: var(--space-1);
      --ds-select-label-weight: var(--font-weight-medium);
      --ds-select-helper-size: var(--font-size-sm);
      --ds-select-popup-surface: var(--color-overlay-surface);
      --ds-select-popup-border: var(--color-border);
      --ds-select-popup-shadow: var(--shadow-overlay);
      --ds-select-popup-radius: var(--radius-md);
      --ds-select-popup-offset: var(--space-1);
      --ds-select-layer: var(--layer-dropdown);
      --ds-select-font-family: var(--font-family-body);
      --ds-select-font-size: var(--font-size-md);
      --ds-select-line-height: var(--font-line-height-normal);
      --ds-select-disabled-opacity: var(--opacity-disabled);
      --ds-select-enter: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .label {
      display: block;
      font-size: var(--ds-select-font-size);
      font-weight: var(--ds-select-label-weight);
      line-height: var(--ds-select-line-height);
    }

    /* descriptionText: color.foreground.muted, locked (set on ds-text via tone="muted") */
    .description {
      margin-block-start: var(--ds-select-part-gap);
    }

    /* triggerBackground / triggerBorder: color.background / color.border.strong, locked */
    .trigger {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-select-trigger-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-select-part-gap);
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border: var(--ds-select-trigger-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-select-trigger-radius);
      background: var(--color-background);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground);
      cursor: pointer;
      transition:
        border-color var(--ds-select-enter) var(--motion-easing-standard),
        padding var(--ds-select-enter) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger,
      .popup,
      .chevron {
        transition: none;
      }
    }

    /*
     * focusRingWidth (locked) replaces triggerBorderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the trigger does not shift.
     */
    .trigger:focus-visible {
      border-color: var(--ds-select-trigger-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-select-trigger-padding-inline) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
      );
      padding-block: calc(
        var(--ds-select-trigger-padding-block) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
      );
    }

    :host([invalid]) .trigger {
      border-color: var(--ds-select-trigger-border-invalid);
    }
    :host([invalid]) .trigger:focus-visible {
      border-color: var(--ds-select-trigger-border-invalid);
    }

    .trigger.disabled {
      opacity: var(--ds-select-disabled-opacity);
      cursor: not-allowed;
    }

    /* valueColor: color.foreground, locked */
    .value {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: start;
      color: var(--color-foreground);
    }

    /* placeholderColor: color.foreground.muted, locked */
    .value.placeholder {
      color: var(--color-foreground-muted);
    }

    /* chevron: color.foreground.muted, locked */
    .chevron {
      flex: none;
      color: var(--color-foreground-muted);
      transition: transform var(--ds-select-enter) var(--motion-easing-standard);
    }
    .chevron.is-open {
      transform: rotate(180deg);
    }

    .popup {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border-style: solid;
      border-width: var(--border-width-thin);
      border-color: var(--ds-select-popup-border);
      border-radius: var(--ds-select-popup-radius);
      background: var(--ds-select-popup-surface);
      box-shadow: var(--ds-select-popup-shadow);
      z-index: var(--ds-select-layer);
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-select-enter) var(--motion-easing-standard),
        transform var(--ds-select-enter) var(--motion-easing-standard);
    }

    .popup[hidden] {
      display: none;
    }

    @starting-style {
      .popup:popover-open {
        opacity: 0;
        transform: translateY(var(--space-1));
      }
    }

    .listbox {
      display: block;
    }

    .native-select {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-select-part-gap);
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border: var(--ds-select-trigger-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-select-trigger-radius);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
    }

    .native-select:focus-visible {
      border-color: var(--color-border-focus);
      border-width: var(--border-width-focus);
    }

    :host([invalid]) .native-select {
      border-color: var(--color-border-danger);
    }

    .native-select:disabled {
      opacity: var(--ds-select-disabled-opacity);
      cursor: not-allowed;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-select-helper-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-select-part-gap);
    }
  `;

  /** Visible label. Always rendered. */
  @property() label!: string;

  /** Field name for the Form. */
  @property() name!: string;

  /** The options, passed through to the composed Listbox. A property, not an attribute. */
  @property({ attribute: false }) options: ListboxOption[] = [];

  /** Controlled value (array with `multiple`). Omit for uncontrolled. */
  @property({ attribute: false }) value?: SelectValue;

  /** Initial value (array with `multiple`) for an uncontrolled field. */
  @property({ attribute: false }) defaultValue?: SelectValue;

  /** Shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for `label`. */
  @property() placeholder?: string;

  /** Pick any number. The trigger shows the count (or the labels when two or fewer); the popup stays open while toggling. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** Helper text under the label. */
  @property() description?: string;

  /** Must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Not openable and not submitted. Stays visible and focusable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Marks the field invalid. Usually set by the Form. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  private errorValue?: string;

  /** Error message. Setting it implies `invalid`. */
  @property()
  get error(): string | undefined {
    return this.errorValue;
  }
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Setting `error` implies `invalid`, synchronously so `checkValidity()`
    // right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /**
   * `auto` never uses the platform picker on web (the styled popup below is
   * used); `always` forces a native `<select>` (forms that must work without
   * JS); `never` forces the popup everywhere. `auto` and `never` render
   * identically on this platform.
   */
  @property({ reflect: true }) native: SelectNative = 'auto';

  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SelectOverridableBinding, TokenRef>>;

  /** Uncontrolled value (seeded from `defaultValue`). */
  @state() private internalValue?: SelectValue;

  /** Whether the popup is open. Not exposed as a property — see the generator's gap notes. */
  @state() private isOpen = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#trigger') private readonly triggerEl?: HTMLButtonElement;
  @query('#native-select') private readonly nativeSelectEl?: HTMLSelectElement;
  @query('#listbox') private readonly listboxEl?: DsListbox;
  @query('#popup') private readonly popupEl?: HTMLElement;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private wasOpen = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** Every selectable item, groups flattened, in document order. */
  private get flatItems(): ListboxItem[] {
    return flattenOptions(this.options);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** The current selection: a value, an array (`multiple`), or `null` when nothing is selected (no key in the Form). */
  get currentValue(): SelectValue | null {
    const value = this.value ?? this.internalValue;
    if (this.multiple) {
      const list = Array.isArray(value) ? value : [];
      return list.length > 0 ? list : null;
    }
    return typeof value === 'string' && value !== '' ? value : null;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  private get selectedSet(): Set<string> {
    const value = this.currentValue;
    if (this.multiple) {
      return new Set(Array.isArray(value) ? value : []);
    }
    return new Set(typeof value === 'string' ? [value] : []);
  }

  /** The value passed to the composed Listbox — always defined, so it always stays controlled by this element. */
  private get listboxValue(): ListboxValue {
    const value = this.currentValue;
    if (this.multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === 'string' ? value : '';
  }

  private get displayLabels(): string[] {
    const value = this.currentValue;
    if (value === null) {
      return [];
    }
    const values = Array.isArray(value) ? value : [value];
    const labelByValue = new Map(this.flatItems.map((item) => [item.value, item.label] as const));
    return values.map((entry) => labelByValue.get(entry) ?? entry);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Select');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
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
    this.closePopup(false);
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string' && !this.multiple) {
      this.value = state;
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
    if (this.isOpen !== this.wasOpen) {
      this.wasOpen = this.isOpen;
      if (this.isOpen) {
        this.handleOpened();
      } else {
        this.handleClosed();
      }
    }
    this.warnInDev();
  }

  protected override render() {
    const isDisabled = this.isDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error-message' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;

    if (this.native === 'always') {
      return this.renderNative(isDisabled, describedBy);
    }

    const labels = this.displayLabels;
    const triggerText =
      labels.length === 0
        ? this.placeholder || COPY_PLACEHOLDER
        : this.multiple
          ? labels.length <= 2
            ? labels.join(', ')
            : COPY_SELECTED_COUNT(labels.length)
          : labels[0];

    return html`
      <ds-text id="label" part="label" class="label" element="p" weight="medium"
        >${this.label}${this.required
          ? html`<span aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
          : nothing}</ds-text
      >
      ${this.description
        ? html`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`
        : nothing}
      <button
        id="trigger"
        part="trigger"
        class=${classMap({ trigger: true, disabled: isDisabled })}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this.isOpen ? 'true' : 'false'}
        aria-controls="popup"
        aria-labelledby="label value"
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        <span id="value" part="value" class=${classMap({ value: true, placeholder: labels.length === 0 })}
          >${triggerText}</span
        >
        <ds-icon part="chevron" class=${classMap({ chevron: true, 'is-open': this.isOpen })} name="chevron-down"></ds-icon>
      </button>
      <div
        id="popup"
        class="popup"
        part="popup"
        popover=${this.popoverSupported ? 'manual' : nothing}
        ?hidden=${this.popoverSupported ? false : !this.isOpen}
      >
        <ds-listbox
          id="listbox"
          part="listbox"
          class="listbox"
          label=${this.label}
          .options=${this.options}
          .value=${this.listboxValue}
          ?multiple=${this.multiple}
          ?disabled=${isDisabled}
          @change=${this.handleListboxChange}
        ></ds-listbox>
      </div>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderNative(isDisabled: boolean, describedBy: string | undefined) {
    return html`
      <ds-text id="label" part="label" class="label" element="p" weight="medium"
        >${this.label}${this.required
          ? html`<span aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
          : nothing}</ds-text
      >
      ${this.description
        ? html`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`
        : nothing}
      <select
        id="native-select"
        part="trigger"
        class="native-select"
        name=${this.name}
        ?multiple=${this.multiple}
        ?disabled=${isDisabled}
        ?required=${this.required}
        aria-labelledby="label"
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        @change=${this.handleNativeChange}
      >
        ${!this.multiple
          ? html`<option value="" ?selected=${this.currentValue === null}>${this.placeholder || COPY_PLACEHOLDER}</option>`
          : nothing}
        ${this.renderNativeOptions(this.options)}
      </select>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderNativeOptions(options: ListboxOption[]): unknown[] {
    const selected = this.selectedSet;
    return options.map((option) => {
      if (isGroupOption(option)) {
        return html`<optgroup label=${option.group}>${this.renderNativeOptions(option.options)}</optgroup>`;
      }
      return html`<option value=${option.value} ?selected=${selected.has(option.value)} ?disabled=${option.disabled === true}
        >${option.label}</option
      >`;
    });
  }

  private readonly handleTriggerClick = (): void => {
    if (this.isDisabled) {
      return;
    }
    if (this.isOpen) {
      this.closePopup(false);
    } else {
      this.openPopup();
    }
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const key = event.key;

    if (!this.isOpen) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.openPopup();
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        this.closePopup(true);
        break;
      case 'Tab': {
        // Commit and hide synchronously so the browser's own Tab traversal
        // (computed right after this handler returns, ahead of Lit's async
        // re-render) does not land inside the now-closing popup.
        if (!this.multiple) {
          const active = this.activeOptionItem();
          if (active && !active.disabled) {
            this.commitValue(active.value);
          }
        }
        this.hidePopupImmediately();
        this.isOpen = false;
        break;
      }
      case 'Enter':
        event.preventDefault();
        this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: ' ' }));
        break;
      default:
        this.listboxEl?.handleKey(event);
    }
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    // Internal to the composition; the host dispatches its own `change`.
    event.stopPropagation();
    this.commitValue(event.detail.value);
    if (!this.multiple) {
      this.closePopup(true);
    }
  };

  private readonly handleNativeChange = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    const next: SelectValue = this.multiple
      ? Array.from(select.selectedOptions).map((option) => option.value)
      : select.value;
    this.commitValue(next);
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) {
      return;
    }
    this.closePopup(false);
  };

  private readonly handleReposition = (): void => {
    if (this.isOpen) {
      this.updatePosition();
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.closePopup(false);
  };

  private activeOptionItem(): ListboxItem | undefined {
    const active = this.listboxEl?.activeValue;
    if (!active) {
      return undefined;
    }
    return this.flatItems.find((item) => item.value === active);
  }

  private openPopup(): void {
    if (this.isOpen || this.isDisabled) {
      return;
    }
    this.isOpen = true;
  }

  private closePopup(restoreFocus: boolean): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    if (restoreFocus) {
      this.triggerEl?.focus();
    }
  }

  private handleOpened(): void {
    if (this.popoverSupported) {
      this.popupEl?.showPopover();
    }
    this.updatePosition();
    this.addGlobalListeners();
    if (this.listboxEl) {
      this.listboxEl.activeValue = this.defaultActiveValue();
    }
    this.dispatchOpenChange(true);
  }

  private handleClosed(): void {
    this.removeGlobalListeners();
    this.hidePopupImmediately();
    if (this.listboxEl) {
      this.listboxEl.activeValue = null;
    }
    this.dispatchOpenChange(false);
  }

  private defaultActiveValue(): string | null {
    const items = this.flatItems.filter((item) => item.disabled !== true);
    if (items.length === 0) {
      return null;
    }
    const selected = this.selectedSet;
    const match = items.find((item) => selected.has(item.value));
    return (match ?? items[0]).value;
  }

  private hidePopupImmediately(): void {
    if (this.popoverSupported) {
      if (this.popupEl?.matches(':popover-open')) {
        this.popupEl.hidePopover();
      }
    } else if (this.popupEl) {
      this.popupEl.hidden = true;
    }
  }

  private addGlobalListeners(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  private updatePosition(): void {
    const trigger = this.triggerEl;
    const popup = this.popupEl;
    if (!trigger || !popup) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(popup).getPropertyValue('--ds-select-popup-offset')) || 0;

    const overflowsBelow = triggerRect.bottom + gap + popupRect.height > viewportHeight;
    const opensUpward = overflowsBelow && triggerRect.top - gap - popupRect.height >= 0;

    popup.style.top = opensUpward ? 'auto' : `${triggerRect.bottom + gap}px`;
    popup.style.bottom = opensUpward ? `${viewportHeight - triggerRect.top + gap}px` : 'auto';
    popup.style.left = `${triggerRect.left}px`;
    popup.style.minWidth = `${triggerRect.width}px`;
  }

  private commitValue(next: SelectValue): void {
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<SelectChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private dispatchOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent<SelectOpenChangeDetail>('open-change', { detail: { open }, bubbles: true, composed: true }),
    );
  }

  /** Mirrors value and validity into ElementInternals. */
  private syncInternals(): void {
    const value = this.currentValue;
    const isDisabled = this.isDisabled;

    if (this.multiple) {
      if (isDisabled || value === null) {
        this.internals.setFormValue(null);
      } else {
        const formData = new FormData();
        for (const entry of value as string[]) {
          formData.append(this.name, entry);
        }
        this.internals.setFormValue(formData);
      }
    } else {
      this.internals.setFormValue(isDisabled || value === null ? null : (value as string));
    }

    if (isDisabled) {
      this.internals.setValidity({});
      return;
    }
    const anchor = this.triggerEl ?? this.nativeSelectEl;
    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), anchor);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SelectOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.label) {
      console.warn('<ds-select> requires a `label`.', this);
    }
    if (!this.name) {
      console.warn('<ds-select> requires a `name`.', this);
    }
    if (!this.options || this.options.length === 0) {
      console.warn('<ds-select> requires at least one option in `options`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-select': DsSelect;
  }
}
