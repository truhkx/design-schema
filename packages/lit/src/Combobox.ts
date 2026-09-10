import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Icon.js';
import './Button.js';
import './Listbox.js';
import type { DsListbox, ListboxChangeDetail, ListboxGroupOption, ListboxItem, ListboxOption } from './Listbox.js';

export type ComboboxFilter = 'startsWith' | 'contains' | 'none' | 'async';

/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. With `allowCustom`, a value absent from `options` is a custom entry. */
export type ComboboxValue = string | string[];

/** Detail carried by the `change` CustomEvent. */
export interface ComboboxChangeDetail {
  value: ComboboxValue;
}

/** Detail carried by the `input-change` CustomEvent. */
export interface ComboboxInputChangeDetail {
  value: string;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface ComboboxOpenChangeDetail {
  open: boolean;
}

/**
 * Overridable style hooks; see the `overrides` property. `fieldBackground`,
 * `fieldBorder`, `inputColor`, `placeholderColor`, `chipBackground`,
 * `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
export type ComboboxOverridableBinding =
  | 'fieldBorderFocus'
  | 'fieldBorderInvalid'
  | 'fieldBorderWidth'
  | 'fieldRadius'
  | 'fieldPaddingInline'
  | 'fieldPaddingBlock'
  | 'fieldGap'
  | 'chipRadius'
  | 'chipPaddingInline'
  | 'chipPaddingBlock'
  | 'chipGap'
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
  | 'chipSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

const HOOKS: Record<ComboboxOverridableBinding, string> = {
  fieldBorderFocus: '--ds-combobox-field-border-focus',
  fieldBorderInvalid: '--ds-combobox-field-border-invalid',
  fieldBorderWidth: '--ds-combobox-field-border-width',
  fieldRadius: '--ds-combobox-field-radius',
  fieldPaddingInline: '--ds-combobox-field-padding-inline',
  fieldPaddingBlock: '--ds-combobox-field-padding-block',
  fieldGap: '--ds-combobox-field-gap',
  chipRadius: '--ds-combobox-chip-radius',
  chipPaddingInline: '--ds-combobox-chip-padding-inline',
  chipPaddingBlock: '--ds-combobox-chip-padding-block',
  chipGap: '--ds-combobox-chip-gap',
  partGap: '--ds-combobox-part-gap',
  labelWeight: '--ds-combobox-label-weight',
  helperSize: '--ds-combobox-helper-size',
  popupSurface: '--ds-combobox-popup-surface',
  popupBorder: '--ds-combobox-popup-border',
  popupShadow: '--ds-combobox-popup-shadow',
  popupRadius: '--ds-combobox-popup-radius',
  popupOffset: '--ds-combobox-popup-offset',
  layer: '--ds-combobox-layer',
  fontFamily: '--ds-combobox-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-combobox-font-size',
  chipSize: '--ds-combobox-chip-size',
  lineHeight: '--ds-combobox-line-height',
  disabledOpacity: '--ds-combobox-disabled-opacity',
  enter: '--ds-combobox-enter',
};

/** copy.empty */
const COPY_EMPTY = 'No matches';
/** copy.loading */
const COPY_LOADING = 'Loading…';
/** copy.addCustom */
const COPY_ADD_CUSTOM = (value: string): string => `Add "${value}"`;
/** copy.clearLabel */
const COPY_CLEAR_LABEL = 'Clear';
/** copy.toggleLabel */
const COPY_TOGGLE_LABEL = 'Show options';
/** copy.removeChip */
const COPY_REMOVE_CHIP = (label: string): string => `Remove ${label}`;
/** copy.resultCount */
const COPY_RESULT_COUNT = (count: number): string => `${count} results available`;
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** How long the live-region status waits before announcing, so fast typing does not spam a screen reader. Not a design token — an interaction timing, not a motion one; see the generator's gap notes for why this is not `motion.duration.base × 2` as the web platform notes specify. */
const STATUS_DEBOUNCE_MS = 500;

/** Sentinel value for the synthetic "add custom" row injected into the composed Listbox's options. */
const CUSTOM_ENTRY_VALUE = '__ds-combobox-add-custom__';

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

/** `input` or `internals.ariaActiveDescendantElement`-capable element, for the cross-shadow-root activedescendant reflection Chromium ships. */
type ActiveDescendantHost = HTMLInputElement & { ariaActiveDescendantElement?: Element | null };

/**
 * `<ds-combobox>` — Combobox (category: input, APG pattern: combobox).
 *
 * `<ds-combobox label="Assignees" name="assignees" .options=${options}>` is
 * the APG editable combobox with list autocomplete: an
 * `<input role="combobox" aria-autocomplete="list" aria-expanded
 * aria-controls aria-activedescendant>` and a popup composing `<ds-listbox>`
 * in the same shadow root (so activedescendant resolves). Real DOM focus
 * never leaves the input; keys are forwarded to the composed Listbox's own
 * `handleKey`, with `selectionFollowsFocus` disabled so arrow navigation only
 * moves the active option — Enter is what commits. `multiple` renders
 * removable chips before the input; `allowCustom` lets typed text that
 * matches nothing become a value, shown as the first `copy.addCustom` row.
 * The element is form-associated (`FormData` for `multiple`) and the popup
 * uses the Popover API when available, a `position: fixed` fallback
 * otherwise.
 *
 * ## When to use
 *
 * Use a Combobox for long lists (fifty-plus), values typed faster than found
 * (dates, codes), `async` search against a server, and multi-value fields
 * where chips make the selection legible. Use `allowCustom` when new values
 * are legitimate (tags, invitees by email).
 *
 * ## When not to use
 *
 * Not for fewer than about ten options that never grow (Select). Not a
 * search box that navigates to results. Not a date picker. Do not disable
 * typing to get a Select; use Select.
 *
 * @fires change - Fired when the selected value(s) change, with `{ value }` (array with `multiple`) in `detail`.
 * @fires input-change - Fired on every keystroke with the input text, with `{ value }` in `detail`.
 * @fires open-change - Fired when the list opens or closes, with `{ open }` in `detail`.
 * @csspart label - The visible label (anatomy: label).
 * @csspart description - The helper text under the label (anatomy: description).
 * @csspart field - The bordered wrapper around chips, input and buttons (anatomy: field).
 * @csspart chips - The wrapper around chips (anatomy: chips).
 * @csspart chip - Each selected value shown as a chip (anatomy: chip).
 * @csspart chipRemove - Each chip's remove `<ds-button>` (anatomy: chipRemove).
 * @csspart input - The `role="combobox"` `<input>` (anatomy: input).
 * @csspart clearButton - The button that empties value and text (anatomy: clearButton).
 * @csspart toggleButton - The button that opens the full list (anatomy: toggleButton).
 * @csspart popup - The positioned popup surface (anatomy: popup).
 * @csspart listbox - The composed `<ds-listbox>` (anatomy: listbox).
 * @csspart status - The visually-hidden `role="status"` live region (anatomy: status).
 * @csspart errorMessage - The `role="alert"` error message region (anatomy: errorMessage).
 */
@customElement('ds-combobox')
export class DsCombobox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-combobox-field-border-focus: var(--color-border-focus);
      --ds-combobox-field-border-invalid: var(--color-border-danger);
      --ds-combobox-field-border-width: var(--border-width-thin);
      --ds-combobox-field-radius: var(--radius-md);
      --ds-combobox-field-padding-inline: var(--space-md);
      --ds-combobox-field-padding-block: var(--space-sm);
      --ds-combobox-field-gap: var(--layout-gap-tight);
      --ds-combobox-chip-radius: var(--radius-full);
      --ds-combobox-chip-padding-inline: var(--space-2);
      --ds-combobox-chip-padding-block: var(--space-0);
      --ds-combobox-chip-gap: var(--layout-gap-tight);
      --ds-combobox-part-gap: var(--space-1);
      --ds-combobox-label-weight: var(--font-weight-medium);
      --ds-combobox-helper-size: var(--font-size-sm);
      --ds-combobox-popup-surface: var(--color-overlay-surface);
      --ds-combobox-popup-border: var(--color-border);
      --ds-combobox-popup-shadow: var(--shadow-overlay);
      --ds-combobox-popup-radius: var(--radius-md);
      --ds-combobox-popup-offset: var(--space-1);
      --ds-combobox-layer: var(--layer-dropdown);
      --ds-combobox-font-family: var(--font-family-body);
      --ds-combobox-font-size: var(--font-size-md);
      --ds-combobox-chip-size: var(--font-size-sm);
      --ds-combobox-line-height: var(--font-line-height-normal);
      --ds-combobox-disabled-opacity: var(--opacity-disabled);
      --ds-combobox-enter: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .label {
      display: block;
      font-size: var(--ds-combobox-font-size);
      font-weight: var(--ds-combobox-label-weight);
      line-height: var(--ds-combobox-line-height);
    }

    /* descriptionText: color.foreground.muted, locked (set on ds-text via tone="muted") */
    .description {
      margin-block-start: var(--ds-combobox-part-gap);
    }

    /* fieldBackground / fieldBorder: color.background / color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-combobox-field-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-combobox-part-gap);
      padding-block: var(--ds-combobox-field-padding-block);
      padding-inline: var(--ds-combobox-field-padding-inline);
      border: var(--ds-combobox-field-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-combobox-field-radius);
      background: var(--color-background);
      transition:
        border-color var(--ds-combobox-enter) var(--motion-easing-standard),
        padding var(--ds-combobox-enter) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field,
      .popup,
      .toggle-icon {
        transition: none;
      }
    }

    /*
     * focusRingWidth (locked) replaces fieldBorderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-within {
      border-color: var(--ds-combobox-field-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-combobox-field-padding-inline) - (var(--border-width-focus) - var(--ds-combobox-field-border-width))
      );
      padding-block: calc(
        var(--ds-combobox-field-padding-block) - (var(--border-width-focus) - var(--ds-combobox-field-border-width))
      );
    }

    :host([invalid]) .field {
      border-color: var(--ds-combobox-field-border-invalid);
    }
    :host([invalid]) .field:focus-within {
      border-color: var(--ds-combobox-field-border-invalid);
    }

    .chips {
      display: contents;
    }

    /* chipBackground / chipColor: color.background.strong / color.foreground, locked */
    .chip {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--ds-combobox-chip-gap);
      padding-block: var(--ds-combobox-chip-padding-block);
      padding-inline: var(--ds-combobox-chip-padding-inline);
      border-radius: var(--ds-combobox-chip-radius);
      background: var(--color-background-strong);
      color: var(--color-foreground);
      font-size: var(--ds-combobox-chip-size);
      line-height: var(--ds-combobox-line-height);
    }

    /* Chips are truncated past about twenty characters (content guideline), never the value. */
    .chip-label {
      max-inline-size: 20ch;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* inputColor / placeholderColor: color.foreground / color.foreground.muted, locked */
    .input {
      flex: 1 1 auto;
      min-inline-size: 8ch;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      font-family: var(--ds-combobox-font-family);
      font-size: var(--ds-combobox-font-size);
      line-height: var(--ds-combobox-line-height);
      color: var(--color-foreground);
    }

    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    .field.disabled .input,
    .field.disabled .chip {
      opacity: var(--ds-combobox-disabled-opacity);
    }
    .field.disabled .input {
      cursor: not-allowed;
    }

    /* iconColor: color.foreground.muted, locked */
    .clear-icon,
    .toggle-icon,
    .chip-remove-icon {
      color: var(--color-foreground-muted);
    }

    .toggle-icon {
      transition: transform var(--ds-combobox-enter) var(--motion-easing-standard);
    }
    .toggle-icon.is-open {
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
      border-color: var(--ds-combobox-popup-border);
      border-radius: var(--ds-combobox-popup-radius);
      background: var(--ds-combobox-popup-surface);
      box-shadow: var(--ds-combobox-popup-shadow);
      z-index: var(--ds-combobox-layer);
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-combobox-enter) var(--motion-easing-standard),
        transform var(--ds-combobox-enter) var(--motion-easing-standard);
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

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-combobox-helper-size);
      line-height: var(--ds-combobox-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-combobox-part-gap);
    }
  `;

  /** Visible label. Always rendered. */
  @property() label!: string;

  /** Field name for the Form. */
  @property() name!: string;

  /** The full option set, or the current page of results when `filter` is `async`. A property, not an attribute. */
  @property({ attribute: false }) options: ListboxOption[] = [];

  /** Controlled selected value(s). Omit for uncontrolled. */
  @property({ attribute: false }) value?: ComboboxValue;

  /** Initial selected value(s) for an uncontrolled field. */
  @property({ attribute: false }) defaultValue?: ComboboxValue;

  /** Controlled text of the input. Usually uncontrolled; set it to drive `async` filtering. */
  @property({ attribute: 'input-value' }) inputValue?: string;

  /** Pick any number. Selections render as removable chips before the input; the list stays open while toggling. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** Typed text matching no option can be committed as a value. Enter or a comma commits it. */
  @property({ type: Boolean, reflect: true, attribute: 'allow-custom' }) allowCustom = false;

  /** How typing narrows `options`. */
  @property({ reflect: true }) filter: ComboboxFilter = 'contains';

  /** Example input shown while empty. Never the only description. */
  @property() placeholder?: string;

  /** Helper text under the label. */
  @property() description?: string;

  /** Must have a value to submit. */
  @property({ type: Boolean, reflect: true }) required = false;

  /** Not editable, not submitted, still readable and focusable. */
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

  /** For `async`: show the loading row and announce it. Set by the consumer around its request. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /**
   * Show a clear button when there is a value or text. Boolean attributes
   * cannot express `false` while the default is `true`, so the attribute is
   * the negation — `no-clear` present means this is `false`.
   */
  @property({
    attribute: 'no-clear',
    reflect: true,
    converter: {
      fromAttribute: (value: string | null): boolean => value === null,
      toAttribute: (value: boolean): string | null => (value ? null : ''),
    },
  })
  clearable = true;

  /** Per-instance style overrides: `{ fieldRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef>>;

  /** Uncontrolled value (seeded from `defaultValue`). */
  @state() private internalValue?: ComboboxValue;

  /** Uncontrolled input text (seeded from the initial single value's label). */
  @state() private internalText = '';

  /** Whether the popup is open. Not exposed as a property — see the generator's gap notes. */
  @state() private isOpen = false;

  /** Set by the toggle button so the list shows every option, ignoring any currently-typed filter query, until the next keystroke. */
  @state() private showAllOnOpen = false;

  /** Id (within the composed Listbox's own shadow root) of the active option, mirrored onto the input's `aria-activedescendant`. */
  @state() private activeDescendantId?: string;

  /** Debounced text for the `status` live region. */
  @state() private announcedStatus = '';

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#input') private readonly inputEl?: HTMLInputElement;
  @query('#listbox') private readonly listboxEl?: DsListbox;
  @query('#popup') private readonly popupEl?: HTMLElement;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private wasOpen = false;
  private pendingActivate: 'first' | 'last' | null = null;
  private statusTimer?: ReturnType<typeof setTimeout>;

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
  get currentValue(): ComboboxValue | null {
    const value = this.value ?? this.internalValue;
    if (this.multiple) {
      const list = Array.isArray(value) ? value : [];
      return list.length > 0 ? list : null;
    }
    return typeof value === 'string' && value !== '' ? value : null;
  }

  /** The current text of the input. */
  get currentText(): string {
    return this.inputValue ?? this.internalText;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  private get chipValues(): string[] {
    const value = this.currentValue;
    return this.multiple && Array.isArray(value) ? value : [];
  }

  private labelForValue(value: string): string {
    return this.flatItems.find((item) => item.value === value)?.label ?? value;
  }

  /** `options` narrowed per `filter`; `async` and `none` never filter (the consumer or the typeahead does). */
  private get filteredOptions(): ListboxOption[] {
    if (this.filter === 'async' || this.filter === 'none' || this.showAllOnOpen) {
      return this.options;
    }
    const query = this.currentText.trim().toLowerCase();
    if (query === '') {
      return this.options;
    }
    return this.filterOptions(this.options, query);
  }

  private filterOptions(options: ListboxOption[], query: string): ListboxOption[] {
    const result: ListboxOption[] = [];
    for (const option of options) {
      if (isGroupOption(option)) {
        const nested = this.filterOptions(option.options, query);
        if (nested.length > 0) {
          result.push({ group: option.group, options: nested });
        }
        continue;
      }
      const label = option.label.toLowerCase();
      const matches = this.filter === 'startsWith' ? label.startsWith(query) : label.includes(query);
      if (matches) {
        result.push(option);
      }
    }
    return result;
  }

  /** The typed text as an `addCustom` row label, or `undefined` when custom entry does not apply. */
  private get customEntryLabel(): string | undefined {
    if (!this.allowCustom || this.filter === 'async') {
      return undefined;
    }
    const text = this.currentText.trim();
    if (text === '') {
      return undefined;
    }
    const exists = this.flatItems.some(
      (item) => item.label.toLowerCase() === text.toLowerCase() || item.value.toLowerCase() === text.toLowerCase(),
    );
    return exists ? undefined : text;
  }

  /** Options passed to the composed Listbox: filtered, with the synthetic `addCustom` row first, or empty while `loading`. */
  private get listboxOptions(): ListboxOption[] {
    if (this.loading) {
      return [];
    }
    const base = this.filteredOptions;
    const customText = this.customEntryLabel;
    if (customText === undefined) {
      return base;
    }
    const customItem: ListboxItem = { value: CUSTOM_ENTRY_VALUE, label: COPY_ADD_CUSTOM(customText) };
    return [customItem, ...base];
  }

  private get listboxValue(): string[] {
    return this.multiple ? this.chipValues : [];
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Combobox');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    clearTimeout(this.statusTimer);
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
    this.internalText = this.computeInitialText(this.defaultValue);
    this.closeList(false);
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string' && !this.multiple) {
      this.value = state;
    }
  }

  private computeInitialText(initial: ComboboxValue | undefined): string {
    if (!this.multiple && typeof initial === 'string' && initial !== '') {
      return this.labelForValue(initial);
    }
    return '';
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
      this.internalText = this.computeInitialText(this.value ?? this.defaultValue);
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
    void this.syncActiveDescendant();
    this.syncStatus();
    this.warnInDev();
  }

  protected override render() {
    const isDisabled = this.isDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error-message' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;
    const showClear = this.clearable && (this.currentValue !== null || this.currentText !== '');

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
      <div class=${classMap({ field: true, disabled: isDisabled })} part="field">
        ${this.multiple && this.chipValues.length > 0
          ? html`<span class="chips" part="chips">${this.chipValues.map((value) => this.renderChip(value))}</span>`
          : nothing}
        <input
          id="input"
          part="input"
          class="input"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded=${this.isOpen ? 'true' : 'false'}
          aria-controls="popup"
          aria-activedescendant=${ifDefined(this.activeDescendantId)}
          aria-labelledby="label"
          aria-describedby=${ifDefined(describedBy)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          autocomplete="off"
          placeholder=${ifDefined(this.placeholder)}
          .value=${live(this.currentText)}
          ?readonly=${isDisabled}
          @input=${this.handleInput}
          @keydown=${this.handleInputKeydown}
        />
        ${showClear
          ? html`
              <ds-button
                id="clear-button"
                part="clearButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_CLEAR_LABEL}
                ?disabled=${isDisabled}
                @press=${this.handleClearPress}
                ><ds-icon class="clear-icon" slot="leading-icon" name="close"></ds-icon
              ></ds-button>
            `
          : nothing}
        <ds-button
          id="toggle-button"
          part="toggleButton"
          variant="ghost"
          size="sm"
          icon-only
          label=${COPY_TOGGLE_LABEL}
          ?disabled=${isDisabled}
          @press=${this.handleTogglePress}
          ><ds-icon
            class=${classMap({ 'toggle-icon': true, 'is-open': this.isOpen })}
            slot="leading-icon"
            name="chevron-down"
          ></ds-icon
        ></ds-button>
      </div>
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
          labelledBy="label"
          .options=${this.listboxOptions}
          .value=${this.listboxValue}
          .selectionFollowsFocus=${false}
          empty-message=${this.loading ? COPY_LOADING : COPY_EMPTY}
          ?multiple=${this.multiple}
          ?disabled=${isDisabled}
          @change=${this.handleListboxChange}
          @active-change=${this.handleListboxActiveChange}
        ></ds-listbox>
      </div>
      <div id="status" part="status" class="visually-hidden" role="status" aria-live="polite">
        ${this.announcedStatus}
      </div>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderChip(value: string) {
    const label = this.labelForValue(value);
    return html`
      <span class="chip" part="chip">
        <span class="chip-label">${label}</span>
        <ds-button
          class="chip-remove"
          part="chipRemove"
          variant="ghost"
          size="sm"
          icon-only
          label=${COPY_REMOVE_CHIP(label)}
          ?disabled=${this.isDisabled}
          @press=${(event: CustomEvent) => this.handleChipRemovePress(event, value)}
          ><ds-icon class="chip-remove-icon" slot="leading-icon" name="close"></ds-icon
        ></ds-button>
      </span>
    `;
  }

  private readonly handleInput = (event: InputEvent): void => {
    const next = (event.currentTarget as HTMLInputElement).value;
    if (this.inputValue === undefined) {
      this.internalText = next;
    }
    this.showAllOnOpen = false;
    if (this.filter === 'none') {
      this.openList(null);
      void this.activateTypeaheadMatch(next);
    } else {
      this.openList(null);
    }
    this.dispatchEvent(
      new CustomEvent<ComboboxInputChangeDetail>('input-change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  };

  private async activateTypeaheadMatch(text: string): Promise<void> {
    const query = text.trim().toLowerCase();
    if (query === '') {
      return;
    }
    await this.updateComplete;
    const match = this.flatItems.find((item) => item.disabled !== true && item.label.toLowerCase().startsWith(query));
    if (match && this.listboxEl) {
      this.listboxEl.activeValue = match.value;
    }
  }

  private readonly handleInputKeydown = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const key = event.key;

    if (key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      this.openList(null);
      return;
    }
    if (key === 'ArrowDown') {
      event.preventDefault();
      if (this.isOpen) {
        this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      } else {
        this.openList('first');
      }
      return;
    }
    if (key === 'ArrowUp') {
      event.preventDefault();
      if (this.isOpen) {
        this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      } else {
        this.openList('last');
      }
      return;
    }
    if (key === 'Enter') {
      if (this.isOpen) {
        event.preventDefault();
        this.commitActive();
      }
      return;
    }
    if (key === 'Escape') {
      if (this.isOpen) {
        event.preventDefault();
        this.closeList(false);
      } else if (this.clearable && this.currentText !== '') {
        event.preventDefault();
        this.clearText();
      }
      return;
    }
    if (key === 'Tab') {
      if (this.isOpen) {
        // Commit and hide synchronously so the browser's own Tab traversal
        // (computed right after this handler returns, ahead of Lit's async
        // re-render) does not land inside the now-closing popup. Single-select
        // never commits an active option on Tab (typing intent is ambiguous).
        this.hidePopupImmediately();
        this.isOpen = false;
      }
      return;
    }
    if (key === 'Backspace' && this.multiple) {
      const input = event.currentTarget as HTMLInputElement;
      if (input.value === '' && this.chipValues.length > 0) {
        event.preventDefault();
        this.removeLastChip();
      }
    }
  };

  private commitActive(): void {
    const active = this.listboxEl?.activeValue ?? null;
    if (active !== null) {
      this.commitOptionValue(active);
      return;
    }
    if (this.allowCustom) {
      const text = this.currentText.trim();
      if (text !== '') {
        this.commitCustomValue(text);
      }
    }
  }

  private commitOptionValue(value: string): void {
    if (value === CUSTOM_ENTRY_VALUE) {
      this.commitCustomValue(this.currentText.trim());
      return;
    }
    const item = this.flatItems.find((candidate) => candidate.value === value);
    if (!item || item.disabled) {
      return;
    }
    if (this.multiple) {
      this.toggleChipValue(item.value);
      this.setText('');
    } else {
      this.setSingleValue(item.value);
      this.setText(item.label);
      this.closeList(true);
    }
  }

  private commitCustomValue(text: string): void {
    if (text === '') {
      return;
    }
    if (this.multiple) {
      this.addChipValue(text);
      this.setText('');
    } else {
      this.setSingleValue(text);
      this.setText(text);
      this.closeList(true);
    }
  }

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    // Internal to the composition; the host dispatches its own `change`.
    event.stopPropagation();
    const value = event.detail.value;
    if (this.multiple) {
      const next = Array.isArray(value) ? value : [];
      if (next.includes(CUSTOM_ENTRY_VALUE)) {
        this.commitCustomValue(this.currentText.trim());
        return;
      }
      this.commitValue(next);
      this.setText('');
    } else {
      const next = typeof value === 'string' ? value : '';
      this.commitOptionValue(next);
    }
  };

  private readonly handleListboxActiveChange = (event: Event): void => {
    event.stopPropagation();
  };

  private readonly handleClearPress = (event: CustomEvent): void => {
    event.stopPropagation();
    this.clearAll();
  };

  private readonly handleTogglePress = (event: CustomEvent): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    if (this.isOpen) {
      this.closeList(true);
    } else {
      this.showAllOnOpen = true;
      this.openList(null);
    }
  };

  private handleChipRemovePress(event: CustomEvent, value: string): void {
    event.stopPropagation();
    this.removeChipValue(value);
    this.inputEl?.focus();
  }

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) {
      return;
    }
    this.closeList(false);
  };

  private readonly handleReposition = (): void => {
    if (this.isOpen) {
      this.updatePosition();
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.closeList(false);
  };

  private setText(text: string): void {
    if (this.inputValue === undefined) {
      this.internalText = text;
    }
  }

  private clearText(): void {
    this.setText('');
  }

  private clearAll(): void {
    if (this.multiple) {
      this.commitValue([]);
    } else if (this.currentValue !== null) {
      this.commitValue('');
    }
    this.clearText();
    this.inputEl?.focus();
  }

  private setSingleValue(value: string): void {
    this.commitValue(value);
  }

  private toggleChipValue(value: string): void {
    if (this.chipValues.includes(value)) {
      this.removeChipValue(value);
    } else {
      this.addChipValue(value);
    }
  }

  private addChipValue(value: string): void {
    if (this.chipValues.includes(value)) {
      return;
    }
    this.commitValue([...this.chipValues, value]);
  }

  private removeChipValue(value: string): void {
    this.commitValue(this.chipValues.filter((entry) => entry !== value));
  }

  private removeLastChip(): void {
    const values = this.chipValues;
    if (values.length === 0) {
      return;
    }
    this.commitValue(values.slice(0, -1));
  }

  private commitValue(next: ComboboxValue): void {
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<ComboboxChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private openList(activate: 'first' | 'last' | null): void {
    if (this.isOpen) {
      if (activate) {
        this.activateEdge(activate);
      } else if (this.listboxEl) {
        this.listboxEl.activeValue = null;
      }
      return;
    }
    if (this.isDisabled) {
      return;
    }
    this.pendingActivate = activate;
    this.isOpen = true;
  }

  private closeList(restoreFocus: boolean): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    if (restoreFocus) {
      this.inputEl?.focus();
    }
  }

  private activateEdge(edge: 'first' | 'last'): void {
    this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: edge === 'first' ? 'Home' : 'End' }));
  }

  private handleOpened(): void {
    if (this.popoverSupported) {
      this.popupEl?.showPopover();
    }
    this.updatePosition();
    this.addGlobalListeners();
    if (this.pendingActivate && this.listboxEl) {
      this.activateEdge(this.pendingActivate);
    } else if (this.listboxEl) {
      this.listboxEl.activeValue = null;
    }
    this.pendingActivate = null;
    this.dispatchOpenChange(true);
  }

  private handleClosed(): void {
    this.removeGlobalListeners();
    this.hidePopupImmediately();
    this.showAllOnOpen = false;
    if (this.listboxEl) {
      this.listboxEl.activeValue = null;
    }
    this.dispatchOpenChange(false);
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
    const field = this.renderRoot.querySelector<HTMLElement>('.field');
    const popup = this.popupEl;
    if (!field || !popup) {
      return;
    }
    const fieldRect = field.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(popup).getPropertyValue('--ds-combobox-popup-offset')) || 0;

    const overflowsBelow = fieldRect.bottom + gap + popupRect.height > viewportHeight;
    const opensUpward = overflowsBelow && fieldRect.top - gap - popupRect.height >= 0;

    popup.style.top = opensUpward ? 'auto' : `${fieldRect.bottom + gap}px`;
    popup.style.bottom = opensUpward ? `${viewportHeight - fieldRect.top + gap}px` : 'auto';
    popup.style.left = `${fieldRect.left}px`;
    popup.style.minWidth = `${fieldRect.width}px`;
  }

  private dispatchOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent<ComboboxOpenChangeDetail>('open-change', { detail: { open }, bubbles: true, composed: true }),
    );
  }

  /** Mirrors the active option onto the input's `aria-activedescendant`, using the cross-shadow-root element reflection where the browser supports it (see the generator's gap notes). */
  private async syncActiveDescendant(): Promise<void> {
    await this.listboxEl?.updateComplete;
    const active = this.listboxEl?.activeValue ?? null;
    const optionEl =
      active !== null ? this.listboxEl?.renderRoot.querySelector<HTMLElement>(`[data-value="${CSS.escape(active)}"]`) : null;
    const id = optionEl?.id;
    if (id !== this.activeDescendantId) {
      this.activeDescendantId = id;
    }
    const input = this.inputEl as ActiveDescendantHost | undefined;
    if (input && 'ariaActiveDescendantElement' in input) {
      input.ariaActiveDescendantElement = optionEl ?? null;
    }
  }

  private computeStatusText(): string {
    if (!this.isOpen) {
      return '';
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    const count = flattenOptions(this.filteredOptions).length;
    return count === 0 ? COPY_EMPTY : COPY_RESULT_COUNT(count);
  }

  /** Debounces the `status` live region so fast typing announces once it settles. */
  private syncStatus(): void {
    const next = this.computeStatusText();
    if (next === this.announcedStatus) {
      return;
    }
    clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      this.announcedStatus = next;
    }, STATUS_DEBOUNCE_MS);
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
    const anchor = this.inputEl;
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
    for (const binding of Object.keys(HOOKS) as ComboboxOverridableBinding[]) {
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
      console.warn('<ds-combobox> requires a `label`.', this);
    }
    if (!this.name) {
      console.warn('<ds-combobox> requires a `name`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-combobox': DsCombobox;
  }
}
