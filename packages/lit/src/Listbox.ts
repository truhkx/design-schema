import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import type { IconName } from './Icon.js';

export type ListboxMaxVisible = '5' | '8' | '12' | 'all';

/** A single selectable entry (anatomy: option, optionLabel, optionDescription, optionIcon). */
export interface ListboxItem {
  value: string;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
}

/** A labelled group of entries (anatomy: group, groupLabel). */
export interface ListboxGroupOption {
  group: string;
  options: ListboxOption[];
}

/** Flat or grouped entry in `options`. */
export type ListboxOption = ListboxItem | ListboxGroupOption;

/** `value`/`defaultValue` shape: a single value, or with `multiple` an array. */
export type ListboxValue = string | string[];

/** Detail carried by the `change` CustomEvent. */
export interface ListboxChangeDetail {
  value: ListboxValue;
}

/** Detail carried by the `active-change` CustomEvent. */
export interface ListboxActiveChangeDetail {
  value: string | null;
}

/** copy.empty */
const COPY_EMPTY = 'No options';
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.loading */
const COPY_LOADING = 'Loading…';
/**
 * The schema's `invalid` prop description references `copy.invalid`, but the
 * component's own `copy` block does not define it (only `empty`, `required`,
 * `selectedCount` and `loading` are listed) — see the generator's gap notes.
 * Matches the fallback message used by Input/Select for the same situation.
 */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/**
 * copy.selectedCount — not part of Listbox's own anatomy (nothing here renders a
 * count), so it is exported for composing components (a Select trigger, a
 * Combobox input) that show the selection summary elsewhere in their UI.
 */
export const LISTBOX_COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;

/** How long a typed-character run is remembered for typeahead before it resets. Not a design token — an interaction timing, not a motion one. */
const TYPEAHEAD_RESET_MS = 500;

/** Overridable style hooks; see the `overrides` property. `surface`, `optionColor`, `optionDescriptionColor`, `optionActiveBackground`, `optionSelectedCheck`, `groupLabelColor`, `emptyColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type ListboxOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'listPadding'
  | 'optionPaddingBlock'
  | 'optionPaddingInline'
  | 'optionGap'
  | 'optionRadius'
  | 'optionDescriptionSize'
  | 'optionSelectedWeight'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'groupLabelPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

const HOOKS: Record<ListboxOverridableBinding, string> = {
  border: '--ds-listbox-border',
  borderWidth: '--ds-listbox-border-width',
  radius: '--ds-listbox-radius',
  listPadding: '--ds-listbox-list-padding',
  optionPaddingBlock: '--ds-listbox-option-padding-block',
  optionPaddingInline: '--ds-listbox-option-padding-inline',
  optionGap: '--ds-listbox-option-gap',
  optionRadius: '--ds-listbox-option-radius',
  optionDescriptionSize: '--ds-listbox-option-description-size',
  optionSelectedWeight: '--ds-listbox-option-selected-weight',
  groupLabelSize: '--ds-listbox-group-label-size',
  groupLabelWeight: '--ds-listbox-group-label-weight',
  groupLabelPaddingBlock: '--ds-listbox-group-label-padding-block',
  fontFamily: '--ds-listbox-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-listbox-font-size',
  lineHeight: '--ds-listbox-line-height',
  disabledOpacity: '--ds-listbox-disabled-opacity',
};

let listboxInstanceCount = 0;

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
 * `<ds-listbox>` — Listbox (category: input, APG pattern: listbox).
 *
 * `<ds-listbox label="Assignees" .options=${options}>` renders one
 * `role="listbox"` `<div tabindex="0">` in its shadow root, with
 * `role="option"` children for each entry (and `role="group"` wrappers for
 * grouped entries). It is a single tab stop: arrow keys, Home/End,
 * PageUp/PageDown and typeahead move `aria-activedescendant` between the
 * option children instead of moving real DOM focus, which works because the
 * list and its options share this shadow root. `options` and `value` are
 * properties, not attributes (arrays/unions are not attribute-safe). Choosing
 * an option fires a composed `change` CustomEvent with the new value (an
 * array in option order when `multiple`); moving the active option fires
 * `active-change`. The element is form-associated: `setFormValue` receives a
 * plain string for single-select and a `FormData` with one entry per value
 * for `multiple`, the same shape a native `<select multiple>` submits.
 * `handleKey` and `activeValue` are public so a future `<ds-combobox>` can
 * forward its input's keydowns into a composed listbox and keep its own
 * `aria-activedescendant` in sync.
 *
 * ## When to use
 *
 * Use a standalone Listbox when the options should stay visible: a settings
 * picker with five to twenty entries, a transfer list. Use `multiple` for
 * "pick any". Set `selectionFollowsFocus: false` when selecting has side
 * effects, so arrow-key browsing does not trigger them.
 *
 * ## When not to use
 *
 * Not for two to seven options that fit without scrolling (RadioGroup or
 * Checkboxes), not for actions (Menu) or navigation (Links).
 *
 * @fires change - Fired when the selection changes, with `{ value }` (array when `multiple`) in `detail`.
 * @fires active-change - Fired as the active option changes, with `{ value }` in `detail`.
 * @csspart list - The `role="listbox"` container (anatomy: list).
 * @csspart group - Each grouped section (anatomy: group).
 * @csspart group-label - Each group's non-interactive heading row (anatomy: groupLabel).
 * @csspart option - Each `role="option"` row (anatomy: option).
 * @csspart option-label - An option's label (anatomy: optionLabel).
 * @csspart option-description - An option's second line (anatomy: optionDescription).
 * @csspart option-icon - An option's leading `<ds-icon>` (anatomy: optionIcon).
 * @csspart option-check - An option's selected-state `<ds-icon>`, always rendered so labels align (anatomy: optionCheck).
 * @csspart empty-state - The `<ds-text>` shown when `options` is empty (anatomy: emptyState).
 * @csspart error-message - The `role="alert"` error message region. Not in this component's anatomy (gap: the schema defines `error` and `error-identification` but no matching part).
 */
@customElement('ds-listbox')
export class DsListbox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      --ds-listbox-border: var(--color-border-strong);
      --ds-listbox-border-width: var(--border-width-thin);
      --ds-listbox-radius: var(--radius-md);
      --ds-listbox-list-padding: var(--space-1);
      --ds-listbox-option-padding-block: var(--space-sm);
      --ds-listbox-option-padding-inline: var(--space-md);
      --ds-listbox-option-gap: var(--layout-gap-normal);
      --ds-listbox-option-radius: var(--radius-sm);
      --ds-listbox-option-description-size: var(--font-size-sm);
      --ds-listbox-option-selected-weight: var(--font-weight-medium);
      --ds-listbox-group-label-size: var(--font-size-xs);
      --ds-listbox-group-label-weight: var(--font-weight-semibold);
      --ds-listbox-group-label-padding-block: var(--space-1);
      --ds-listbox-font-family: var(--font-family-body);
      --ds-listbox-font-size: var(--font-size-md);
      --ds-listbox-line-height: var(--font-line-height-normal);
      --ds-listbox-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    /* surface: color.background, locked */
    .list {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--ds-listbox-list-padding);
      border-style: solid;
      border-width: var(--ds-listbox-border-width);
      border-color: var(--ds-listbox-border);
      border-radius: var(--ds-listbox-radius);
      background: var(--color-background);
      font-family: var(--ds-listbox-font-family);
      font-size: var(--ds-listbox-font-size);
      line-height: var(--ds-listbox-line-height);
      overflow-y: auto;
      outline: none;
      /* maxVisible: rows × one option's measured block size */
      max-block-size: calc(
        (
            var(--ds-listbox-font-size) * var(--ds-listbox-line-height) + 2 * var(--ds-listbox-option-padding-block)
          ) * var(--ds-listbox-rows, 8)
      );
    }

    .list.is-max-visible-all {
      max-block-size: none;
      overflow-y: visible;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .list:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    :host([disabled]) .list {
      cursor: not-allowed;
    }

    .group {
      display: flex;
      flex-direction: column;
    }

    /* groupLabelColor: color.foreground.muted, locked */
    .group-label {
      padding-block: var(--ds-listbox-group-label-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      font-size: var(--ds-listbox-group-label-size);
      font-weight: var(--ds-listbox-group-label-weight);
      color: var(--color-foreground-muted);
    }

    /* minTarget: size.target.min, locked */
    .option {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it, so active is never hover-only */
    .option.is-active {
      background: var(--color-background-subtle);
    }

    .option[aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }

    /* optionSelectedWeight: selection is marked by weight and the check, never color alone */
    .option[aria-selected='true'] .option-label {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    /* optionSelectedCheck: color.control.selectedBackground, locked; always rendered (invisible when unselected) so labels align */
    .option-check {
      flex: none;
      color: var(--color-control-selected-background);
      visibility: hidden;
    }
    .option[aria-selected='true'] .option-check {
      visibility: visible;
    }

    .option-icon {
      flex: none;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    .option-label {
      min-inline-size: 0;
    }

    /* optionDescriptionColor: color.foreground.muted, locked */
    .option-description {
      font-size: var(--ds-listbox-option-description-size);
      color: var(--color-foreground-muted);
    }

    .empty {
      display: block;
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }

    /* embedded: the popup that composes this list owns border, surface and radius */
    .list.is-embedded {
      border-style: none;
      border-radius: 0;
      background: none;
    }

    /* errorText: not a binding in this component's schema (gap) — styled like Input/Select's own errorText token */
    .error {
      font-size: var(--ds-listbox-option-description-size);
      line-height: var(--ds-listbox-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-listbox-list-padding);
    }
  `;

  /** Accessible name of the list. Ignored when `labelledBy` is set. */
  @property() label!: string;

  /** Id of a visible element (in this shadow root) that labels the list, taking priority over `label`. */
  @property() labelledBy?: string;

  /** Flat or grouped options in display order. A property, not an attribute. */
  @property({ attribute: false }) options: ListboxOption[] = [];

  /** Allow any number of selections; the value becomes an array. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  @property({ attribute: false }) value?: ListboxValue;

  /** Initial selection (or array) for an uncontrolled list. */
  @property({ attribute: false }) defaultValue?: ListboxValue;

  /**
   * Single-select only: arrow keys select as they move. Boolean attributes
   * cannot express `false` while the default is `true`, so the attribute is
   * the negation — `no-selection-follows-focus` present means this is `false`.
   */
  @property({
    attribute: 'no-selection-follows-focus',
    converter: {
      fromAttribute: (value: string | null): boolean => value === null,
      toAttribute: (value: boolean): string | null => (value ? null : ''),
    },
  })
  selectionFollowsFocus = true;

  /** At least one option must be selected to submit when inside a Form. */
  @property({ type: Boolean, reflect: true }) required = false;

  /**
   * Marks the list invalid. Usually set by the Form; can be set directly.
   * Not listed under this component's `platforms.lit.reflect`, so it is not
   * reflected to a host attribute — style consumers read the `.error` text
   * instead, as the schema defines no invalid-specific style binding.
   */
  @property({ type: Boolean }) invalid = false;

  private errorValue?: string;

  /** Error message rendered below the list and linked by aria-describedby. Setting it implies `invalid`. */
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

  /** The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; this list draws none of its own. */
  @property({ type: Boolean }) embedded = false;

  /** The whole list is inert but readable. Individual options use `options[].disabled`. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Field name for Form collection. Multiple values are collected as an array. */
  @property() name = '';

  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) emptyMessage?: string;

  /** Height in rows before the list scrolls; `all` never scrolls. */
  @property({ attribute: 'max-visible' }) maxVisible: ListboxMaxVisible = '8';

  /** The option active when the list first receives focus. Defaults to the first selected item, else the first enabled item. */
  @property({ attribute: 'default-active-value' }) defaultActiveValue?: string;

  /** Options are being fetched (async Combobox); shows `copy.loading` in place of the empty message and marks the list aria-busy. */
  @property({ type: Boolean }) loading = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<ListboxOverridableBinding, TokenRef>>;

  /** Uncontrolled selection (seeded from `defaultValue`). */
  @state() private internalValue?: ListboxValue;

  /**
   * The option currently carrying `aria-activedescendant`, public so a
   * composing `<ds-combobox>` can read it and keep its own activedescendant
   * in sync.
   */
  @state() activeValue: string | null = null;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('.list') private readonly listEl?: HTMLElement;

  private readonly instanceId = `ds-listbox-${++listboxInstanceCount}`;
  private typeaheadQuery = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout>;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** Every selectable item, groups flattened, in document order. */
  private get flatItems(): ListboxItem[] {
    return flattenOptions(this.options);
  }

  private get enabledItems(): ListboxItem[] {
    return this.flatItems.filter((item) => item.disabled !== true);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** The current selection: a value, an array (`multiple`), or `null` when nothing is selected (no key in the Form). */
  get currentValue(): ListboxValue | null {
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Listbox');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.typeaheadTimer);
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
    this.warnInDev();
  }

  protected override render() {
    const items = this.flatItems;
    const isEmpty = items.length === 0;
    const optionIds = new Map<string, string>();
    items.forEach((item, index) => optionIds.set(item.value, `${this.instanceId}-option-${index}`));
    const activeId = this.activeValue !== null ? optionIds.get(this.activeValue) : undefined;
    const rowsStyle =
      this.maxVisible === 'all' ? {} : { '--ds-listbox-rows': this.maxVisible };

    return html`
      <div
        id="list"
        class=${classMap({
          list: true,
          'is-max-visible-all': this.maxVisible === 'all',
          'is-embedded': this.embedded,
        })}
        style=${styleMap(rowsStyle)}
        part="list"
        role="listbox"
        tabindex=${this.isDisabled ? -1 : 0}
        aria-label=${ifDefined(this.labelledBy ? undefined : this.label)}
        aria-labelledby=${ifDefined(this.labelledBy)}
        aria-multiselectable=${ifDefined(this.multiple ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-describedby=${ifDefined(this.error ? 'error-message' : undefined)}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
        aria-activedescendant=${ifDefined(activeId)}
        @keydown=${this.handleKey}
        @focus=${this.handleListFocus}
      >
        ${isEmpty
          ? html`<ds-text class="empty" part="empty-state" tone="muted"
              >${this.loading ? COPY_LOADING : this.emptyMessage || COPY_EMPTY}</ds-text
            >`
          : this.renderOptionList(this.options, optionIds)}
      </div>
      <div id="error-message" part="error-message" class="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderOptionList(options: ListboxOption[], optionIds: Map<string, string>) {
    let groupCounter = 0;
    const render = (opts: ListboxOption[]): unknown[] =>
      opts.map((option) => {
        if (isGroupOption(option)) {
          const labelId = `${this.instanceId}-group-${groupCounter++}`;
          return html`
            <div class="group" part="group" role="group" aria-labelledby=${labelId}>
              <div class="group-label" part="group-label" id=${labelId}>${option.group}</div>
              ${render(option.options)}
            </div>
          `;
        }
        return this.renderOption(option, optionIds.get(option.value)!);
      });
    return render(options);
  }

  private renderOption(item: ListboxItem, id: string) {
    const disabled = this.isDisabled || item.disabled === true;
    const selected = this.selectedSet.has(item.value);
    const active = this.activeValue === item.value;
    return html`
      <div
        id=${id}
        class=${classMap({ option: true, 'is-active': active })}
        part="option"
        role="option"
        data-value=${item.value}
        aria-selected=${selected ? 'true' : 'false'}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        @click=${() => this.handleOptionClick(item)}
        @pointerenter=${() => this.handleOptionPointerEnter(item)}
      >
        <ds-icon class="option-check" part="option-check" name="check"></ds-icon>
        ${item.icon ? html`<ds-icon class="option-icon" part="option-icon" name=${item.icon}></ds-icon>` : nothing}
        <div class="option-text">
          <span class="option-label" part="option-label">${item.label}</span>
          ${item.description
            ? html`<span class="option-description" part="option-description">${item.description}</span>`
            : nothing}
        </div>
      </div>
    `;
  }

  /** Public so a composing `<ds-combobox>` can forward its input's keydowns here. */
  readonly handleKey = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const key = event.key;

    if (this.multiple && event.shiftKey && (key === 'ArrowDown' || key === 'ArrowUp')) {
      event.preventDefault();
      this.extendSelection(key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (this.multiple && (event.ctrlKey || event.metaKey) && key.toLowerCase() === 'a') {
      event.preventDefault();
      this.toggleSelectAll();
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.setActiveEdge('first');
        break;
      case 'End':
        event.preventDefault();
        this.setActiveEdge('last');
        break;
      case ' ':
        event.preventDefault();
        this.selectActive();
        break;
      case 'Enter':
        if (!this.multiple) {
          event.preventDefault();
          this.selectActive();
        }
        break;
      case 'PageDown':
        event.preventDefault();
        this.pageActive(1);
        break;
      case 'PageUp':
        event.preventDefault();
        this.pageActive(-1);
        break;
      default:
        if (key.length === 1 && /[a-z]/i.test(key)) {
          this.handleTypeahead(key);
        }
    }
  };

  private readonly handleListFocus = (): void => {
    if (this.activeValue !== null) {
      return;
    }
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const preferred =
      this.defaultActiveValue !== undefined
        ? items.find((item) => item.value === this.defaultActiveValue)
        : undefined;
    const selected = items.find((item) => this.selectedSet.has(item.value));
    this.setActive((preferred ?? selected ?? items[0]).value);
  };

  private handleOptionClick(item: ListboxItem): void {
    if (this.isDisabled || item.disabled) {
      return;
    }
    this.setActive(item.value);
    this.selectActive();
  }

  private handleOptionPointerEnter(item: ListboxItem): void {
    if (this.isDisabled || item.disabled) {
      return;
    }
    this.setActive(item.value);
  }

  private moveActive(delta: number): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const currentIndex = this.activeValue ? items.findIndex((item) => item.value === this.activeValue) : -1;
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    const item = items[nextIndex];
    this.setActive(item.value);
    if (!this.multiple && this.selectionFollowsFocus) {
      this.commitValue(item.value);
    }
  }

  private setActiveEdge(edge: 'first' | 'last'): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const item = edge === 'first' ? items[0] : items[items.length - 1];
    this.setActive(item.value);
  }

  private pageActive(direction: 1 | -1): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const pageSize = this.maxVisible === 'all' ? items.length : Number(this.maxVisible);
    const currentIndex = this.activeValue
      ? items.findIndex((item) => item.value === this.activeValue)
      : direction === 1
        ? -1
        : items.length;
    let nextIndex = currentIndex + direction * pageSize;
    nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    this.setActive(items[nextIndex].value);
  }

  private extendSelection(delta: number): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const currentIndex = this.activeValue ? items.findIndex((item) => item.value === this.activeValue) : -1;
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    const item = items[nextIndex];
    this.setActive(item.value);
    const set = this.selectedSet;
    set.add(item.value);
    this.commitValue(this.orderValues(set));
  }

  private toggleSelectAll(): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const allSelected = items.every((item) => this.selectedSet.has(item.value));
    this.commitValue(allSelected ? [] : items.map((item) => item.value));
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadQuery += char.toLowerCase();
    const query = this.typeaheadQuery;
    const match = this.enabledItems.find((item) => item.label.toLowerCase().startsWith(query));
    if (match) {
      this.setActive(match.value);
    }
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadQuery = '';
    }, TYPEAHEAD_RESET_MS);
  }

  private selectActive(): void {
    if (this.activeValue === null) {
      return;
    }
    const item = this.flatItems.find((candidate) => candidate.value === this.activeValue);
    if (!item || item.disabled) {
      return;
    }
    if (this.multiple) {
      const set = this.selectedSet;
      if (set.has(item.value)) {
        set.delete(item.value);
      } else {
        set.add(item.value);
      }
      this.commitValue(this.orderValues(set));
    } else {
      this.commitValue(item.value);
    }
  }

  private orderValues(set: Set<string>): string[] {
    return this.flatItems.filter((item) => set.has(item.value)).map((item) => item.value);
  }

  private setActive(value: string | null): void {
    if (this.activeValue === value) {
      return;
    }
    this.activeValue = value;
    this.dispatchEvent(
      new CustomEvent<ListboxActiveChangeDetail>('active-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
    void this.scrollActiveIntoView();
  }

  private async scrollActiveIntoView(): Promise<void> {
    await this.updateComplete;
    if (this.activeValue === null) {
      return;
    }
    this.renderRoot
      .querySelector(`[data-value="${CSS.escape(this.activeValue)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  private commitValue(next: ListboxValue): void {
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<ListboxChangeDetail>('change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Mirrors value and validity into ElementInternals. `currentValue` can be
   * an array (`multiple`), which is outside `DsFormField`'s
   * `string | boolean | null` contract — see the generator's gap notes;
   * `<ds-form>` does not currently discover `<ds-listbox>` by tag.
   */
  private syncInternals(): void {
    const value = this.currentValue;
    if (this.multiple) {
      if (this.isDisabled || value === null) {
        this.internals.setFormValue(null);
      } else {
        const formData = new FormData();
        for (const entry of value as string[]) {
          formData.append(this.name, entry);
        }
        this.internals.setFormValue(formData);
      }
    } else {
      this.internals.setFormValue(this.isDisabled || value === null ? null : (value as string));
    }

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, this.listEl);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label), this.listEl);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), this.listEl);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ListboxOverridableBinding[]) {
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
    if (!this.label && !this.labelledBy) {
      console.warn('<ds-listbox> requires a `label` or `labelledBy`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-listbox': DsListbox;
  }
}
