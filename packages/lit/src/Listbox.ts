import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Stack.js';
import './Text.js';
import type { IconName, IconOverridableBinding } from './Icon.js';

export type ListboxMaxVisible = '5' | '8' | '12' | 'all';

/** A single selectable entry (anatomy: option, optionLabel, optionDescription, optionIcon). */
export interface ListboxItem {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
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
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.loading */
const COPY_LOADING = 'Loading…';
/**
 * copy.selectedCount — Listbox renders no count itself; exported for the
 * surrounding UI (a Select trigger, a Combobox) that shows the selection summary.
 */
export const LISTBOX_COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;

/** How long a typed-character run is remembered for typeahead. An interaction timing, not a motion token. */
const TYPEAHEAD_RESET_MS = 500;

/** optionSelectedCheck (locked) forwarded to the composed Icon's `color` binding. */
const CHECK_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.control.selectedBackground',
};

/** Overridable style hooks; see the `overrides` property. Locked bindings are excluded. */
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

/** Surface bindings the popup owns while `embedded`; their overrides are no-ops then. */
const EMBEDDED_NO_OP: ReadonlySet<ListboxOverridableBinding> = new Set(['border', 'borderWidth', 'radius']);

/** Negates a boolean attribute: `no-selection-follows-focus` present means `selectionFollowsFocus` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean => value === null,
  toAttribute: (value: boolean): string | null => (value ? null : ''),
};

type LabelledElement = HTMLElement & { ariaLabelledByElements?: Element[] | null | undefined };

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
 * `<ds-listbox label="Assignees" multiple .options=${options}>` renders one
 * `role="listbox"` `<div tabindex="0">` in its shadow root with
 * `role="option"` rows (and `role="group"` sections for grouped entries). It
 * is a single tab stop: arrow keys, Home/End, PageUp/PageDown and typeahead
 * move `aria-activedescendant` between the option rows instead of moving DOM
 * focus, which works because list and options share this shadow root.
 * `options` and `value` are properties. Choosing an option fires a composed
 * `change` (`detail.value`, an array in option order with `multiple`); moving
 * the active option fires `active-change`. Controlled when `value` is set: the
 * list shows a new selection only once `value` changes.
 *
 * The element is form-associated: `setFormValue` receives a string for
 * single-select and a `FormData` with one entry per value for `multiple`, the
 * shape a native `<select multiple>` submits. The host carries
 * `data-ds-field` for `<ds-form>`.
 *
 * `handleKey(event)` and `activeValue` are public so `<ds-select>`,
 * `<ds-combobox>` and `<ds-search>` can forward their own keydowns and keep
 * their activedescendant in sync.
 *
 * ## When to use
 *
 * A standalone picker whose options stay visible (five to twenty entries), a
 * transfer list, `multiple` for "pick any". Set `selectionFollowsFocus` false
 * (`no-selection-follows-focus`) when selecting has side effects.
 *
 * ## When not to use
 *
 * Not for two to seven options that fit without scrolling (RadioGroup or
 * Checkboxes), not for actions (Menu) or navigation (Links).
 *
 * @fires change - The selection changed; `detail.value` is the new value (array when `multiple`).
 * @fires active-change - The active option changed; `detail.value` is its value, or null.
 */
@customElement('ds-listbox')
export class DsListbox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
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

    [data-part='list'] {
      --ds-listbox-frame: var(--ds-listbox-border-width);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--ds-listbox-list-padding);
      border-style: solid;
      border-width: var(--ds-listbox-border-width);
      border-color: var(--ds-listbox-border);
      border-radius: var(--ds-listbox-radius);
      /* surface: color.background, locked */
      background: var(--color-background);
      font-family: var(--ds-listbox-font-family);
      font-size: var(--ds-listbox-font-size);
      line-height: var(--ds-listbox-line-height);
      overflow-y: auto;
      outline: none;
      /* maxVisible: rows × the first rendered row's measured height (the doc's row formula until measured) */
      max-block-size: calc(
        var(
            --ds-listbox-row-size,
            calc(var(--ds-listbox-font-size) * var(--ds-listbox-line-height) + 2 * var(--ds-listbox-option-padding-block))
          ) *
          var(--ds-listbox-rows) + 2 * var(--ds-listbox-list-padding) + 2 * var(--ds-listbox-frame)
      );
    }

    :host([max-visible='5']) [data-part='list'] {
      --ds-listbox-rows: 5;
    }
    :host(:not([max-visible])) [data-part='list'],
    :host([max-visible='8']) [data-part='list'] {
      --ds-listbox-rows: 8;
    }
    :host([max-visible='12']) [data-part='list'] {
      --ds-listbox-rows: 12;
    }
    :host([max-visible='all']) [data-part='list'] {
      max-block-size: none;
      overflow-y: visible;
    }

    /* embedded: the popup owns border, surface and radius; listPadding stays */
    :host([embedded]) [data-part='list'] {
      --ds-listbox-frame: 0;
      border-style: none;
      border-width: 0;
      border-radius: 0;
      background: none;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='list']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    :host([disabled]) [data-part='list'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }

    [data-part='group'] {
      display: flex;
      flex-direction: column;
    }

    [data-part='groupLabel'] {
      padding-block: var(--ds-listbox-group-label-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      font-size: var(--ds-listbox-group-label-size);
      font-weight: var(--ds-listbox-group-label-weight);
      /* groupLabelColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    [data-part='option'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it */
    [data-part='option'][data-active] {
      background: var(--color-background-subtle);
    }

    /* optionSelectedWeight: selection is shown by weight (and the check with multiple), never color alone */
    [data-part='option'][aria-selected='true'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    [data-part='option'][aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) [data-part='option'][aria-disabled='true'] {
      opacity: 1;
    }

    /* optionSelectedCheck: always rendered with multiple (invisible when unselected) so labels align */
    [data-part='optionCheck'] {
      flex: none;
      visibility: hidden;
    }
    [data-part='option'][aria-selected='true'] [data-part='optionCheck'] {
      visibility: visible;
    }

    [data-part='optionIcon'] {
      flex: none;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    [data-part='optionDescription'] {
      font-size: var(--ds-listbox-option-description-size);
      /* optionDescriptionColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    .empty {
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }
  `;

  /** Accessible name of the list. Ignored when `labelledBy` resolves to an element. */
  @property() accessor label!: string;

  /** Id of a visible element that labels the list (in the document or the composing shadow root). */
  @property() accessor labelledBy: string | undefined;

  /** Flat or grouped options in display order. A property, not an attribute. */
  @property({ attribute: false }) accessor options: ListboxOption[] = [];

  /** Allow any number of selections; the value becomes an array and selection toggles. */
  @property({ type: Boolean, reflect: true }) accessor multiple = false;

  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  @property({ attribute: false }) accessor value: ListboxValue | undefined;

  /** Initial selection (or array) for an uncontrolled list. */
  @property({ attribute: false }) accessor defaultValue: ListboxValue | undefined;

  /**
   * Single-select only: arrow keys, Home/End, PageUp/PageDown and typeahead
   * select as they move. Exposed as the negated attribute
   * `no-selection-follows-focus`.
   */
  @property({ attribute: 'no-selection-follows-focus', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor selectionFollowsFocus = true;

  /** At least one option must be selected to submit when inside a Form. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Marks the list invalid (aria-invalid) and shows `copy.invalid`. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue: string | undefined;
  private invalidFromError = false;

  /** Error message rendered below the list and linked by aria-describedby. Setting it implies `invalid`. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    if (value) {
      if (!this.invalid) {
        this.invalidFromError = true;
        this.invalid = true;
      }
    } else if (this.invalidFromError) {
      this.invalidFromError = false;
      this.invalid = false;
    }
    this.syncInternals();
    this.requestUpdate('error', old);
  }

  /** The list lives inside a popup that owns border, surface and radius; the list draws none of its own. */
  @property({ type: Boolean, reflect: true }) accessor embedded = false;

  /** The option active when the list first receives focus; wins when it names an enabled option. */
  @property({ attribute: 'initial-active-value' }) accessor initialActiveValue: string | undefined;

  /** Options are being fetched: `copy.loading` replaces the empty message and the list is aria-busy. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** The whole list is inert but readable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Field name for Form collection. Multiple values are collected as an array. */
  @property() accessor name = '';

  /** Shown when `options` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) accessor emptyMessage: string | undefined;

  /** Height in rows before the list scrolls; `all` never scrolls. */
  @property({ attribute: 'max-visible', reflect: true }) accessor maxVisible: ListboxMaxVisible = '8';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ListboxOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled selection, seeded from `defaultValue`. */
  @state() private accessor internalValue: ListboxValue | undefined;

  /** The option carrying `aria-activedescendant`; public so composing popups can read and set it. */
  @state() accessor activeValue: string | null = null;

  /** Disabled by an owning native form or fieldset. */
  @state() private accessor formDisabled = false;

  @query('[data-part=list]') private accessor listEl!: HTMLElement | null;

  private readonly instanceId = `ds-listbox-${++listboxInstanceCount}`;
  private typeaheadQuery = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get flatItems(): ListboxItem[] {
    return flattenOptions(this.options);
  }

  private get enabledItems(): ListboxItem[] {
    return this.flatItems.filter((item) => item.disabled !== true);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): ListboxValue | null {
    const value = this.value !== undefined ? this.value : this.internalValue;
    if (this.multiple) {
      const list = Array.isArray(value) ? value : typeof value === 'string' && value !== '' ? [value] : [];
      return list.length > 0 ? list : null;
    }
    return typeof value === 'string' && value !== '' ? value : null;
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** The field's own copy string for its current validity, or '' when valid. */
  get validationMessage(): string {
    return this.computeValidationMessage() ?? '';
  }

  private get selectedSet(): Set<string> {
    const value = this.currentValue;
    return new Set(value === null ? [] : Array.isArray(value) ? value : [value]);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Listbox');
    this.setAttribute('data-ds-field', '');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.typeaheadTimer);
  }

  override focus(options?: FocusOptions): void {
    this.listEl?.focus(options);
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
    this.internalValue = this.defaultValue;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (typeof restored === 'string') {
      this.internalValue = restored;
    } else if (restored instanceof FormData) {
      this.internalValue = restored.getAll(this.name).filter((entry): entry is string => typeof entry === 'string');
    }
  }

  /** Forward a keydown from a composing element (Select, Combobox, Search) into the listbox keyboard model. */
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
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveBy(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveBy(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveToIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveToIndex(this.enabledItems.length - 1);
        break;
      case 'PageDown':
        event.preventDefault();
        this.moveBy(this.pageSize());
        break;
      case 'PageUp':
        event.preventDefault();
        this.moveBy(-this.pageSize());
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
      default:
        if (key.length === 1 && /[a-z]/i.test(key)) {
          this.handleTypeahead(key);
        }
    }
  };

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
    }
    if (changed.has('overrides') || changed.has('embedded')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    this.syncInternals();
    this.syncLabelledBy();
    if (changed.has('options') || changed.has('maxVisible')) {
      this.measureRow();
    }
    if (import.meta.env.DEV && !this.label && !this.labelledBy) {
      console.warn('<ds-listbox> requires a `label` or `labelledBy`.', this);
    }
  }

  protected override render(): TemplateResult {
    const items = this.flatItems;
    const optionIds = new Map<string, string>();
    items.forEach((item, index) => optionIds.set(item.value, `${this.instanceId}-option-${index}`));
    const activeId = this.activeValue !== null ? optionIds.get(this.activeValue) : undefined;
    const message = this.errorValue || (this.invalid ? COPY_INVALID(this.label ?? '') : '');

    return html`
      <ds-stack gap="tight">
        <div
          data-part="list"
          part="list"
          role="listbox"
          tabindex=${this.isDisabled ? -1 : 0}
          aria-label=${ifDefined(this.label || undefined)}
          aria-multiselectable=${ifDefined(this.multiple ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-describedby=${ifDefined(message ? 'errorMessage' : undefined)}
          aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
          aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
          aria-activedescendant=${ifDefined(activeId)}
          @keydown=${this.handleKey}
          @focus=${this.handleListFocus}
        >
          ${items.length === 0 ? this.renderEmpty() : this.renderOptionList(this.options, optionIds)}
        </div>
        <div id="errorMessage" data-part="errorMessage" part="errorMessage" role="alert" ?hidden=${!message}>
          ${message ? html`<ds-text element="p" size="sm" tone="danger">${message}</ds-text>` : nothing}
        </div>
      </ds-stack>
    `;
  }

  private renderEmpty(): TemplateResult {
    return html`<div class="empty">
      <ds-text data-part="emptyState" part="emptyState" element="p" tone="muted"
        >${this.loading ? COPY_LOADING : this.emptyMessage || COPY_EMPTY}</ds-text
      >
    </div>`;
  }

  private renderOptionList(options: ListboxOption[], optionIds: Map<string, string>): unknown[] {
    let groupCounter = 0;
    const render = (list: ListboxOption[]): unknown[] =>
      list.map((option) => {
        if (isGroupOption(option)) {
          if (flattenOptions(option.options).length === 0) {
            return nothing;
          }
          const labelId = `${this.instanceId}-group-${groupCounter++}`;
          return html`
            <div data-part="group" part="group" role="group" aria-labelledby=${labelId}>
              <div data-part="groupLabel" part="groupLabel" id=${labelId}>${option.group}</div>
              ${render(option.options)}
            </div>
          `;
        }
        return this.renderOption(option, optionIds.get(option.value)!);
      });
    return render(options);
  }

  private renderOption(item: ListboxItem, id: string): TemplateResult {
    const disabled = this.isDisabled || item.disabled === true;
    const selected = this.selectedSet.has(item.value);
    return html`
      <div
        id=${id}
        data-part="option"
        part="option"
        role="option"
        data-value=${item.value}
        ?data-active=${this.activeValue === item.value}
        aria-selected=${selected ? 'true' : 'false'}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        @click=${() => this.handleOptionClick(item)}
        @pointermove=${() => this.handleOptionPointer(item)}
      >
        ${this.multiple
          ? html`<ds-icon data-part="optionCheck" part="optionCheck" name="check" size="sm" .overrides=${CHECK_OVERRIDES}></ds-icon>`
          : nothing}
        ${item.icon
          ? html`<ds-icon data-part="optionIcon" part="optionIcon" name=${item.icon} size="sm"></ds-icon>`
          : nothing}
        <span class="option-text">
          <span data-part="optionLabel" part="optionLabel">${item.label}</span>
          ${item.description
            ? html`<span data-part="optionDescription" part="optionDescription">${item.description}</span>`
            : nothing}
        </span>
      </div>
    `;
  }

  private readonly handleListFocus = (): void => {
    if (this.activeValue !== null) {
      return;
    }
    const items = this.enabledItems;
    const initial =
      this.initialActiveValue !== undefined
        ? items.find((item) => item.value === this.initialActiveValue)
        : undefined;
    const selected = items.find((item) => this.selectedSet.has(item.value));
    const target = initial ?? selected ?? items[0];
    if (target) {
      this.setActive(target.value);
    }
  };

  private handleOptionClick(item: ListboxItem): void {
    if (this.isDisabled || item.disabled === true) {
      return;
    }
    this.setActive(item.value);
    this.selectActive();
  }

  private handleOptionPointer(item: ListboxItem): void {
    if (this.isDisabled || item.disabled === true) {
      return;
    }
    this.setActive(item.value);
  }

  private activeIndex(): number {
    return this.activeValue === null ? -1 : this.enabledItems.findIndex((item) => item.value === this.activeValue);
  }

  /** Arrows and Page keys: clamp at the first and last enabled option, never wrap. */
  private moveBy(delta: number): void {
    const count = this.enabledItems.length;
    const current = this.activeIndex();
    // Nothing active yet: ArrowDown/PageDown start at the top, ArrowUp/PageUp at the bottom.
    const start = current === -1 ? (delta > 0 ? -1 : count) : current;
    this.moveToIndex(start + delta);
  }

  /** Moves the active option and, in single-select with `selectionFollowsFocus`, selects it. */
  private moveToIndex(index: number): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const item = items[Math.max(0, Math.min(items.length - 1, index))]!;
    this.setActive(item.value);
    if (!this.multiple && this.selectionFollowsFocus) {
      this.selectSingle(item.value);
    }
  }

  /** The visible row count PageUp/PageDown move by. */
  private pageSize(): number {
    return this.maxVisible === 'all' ? this.enabledItems.length : Number(this.maxVisible);
  }

  private extendSelection(delta: 1 | -1): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const current = this.activeIndex();
    const start = current === -1 ? (delta > 0 ? -1 : items.length) : current;
    const item = items[Math.max(0, Math.min(items.length - 1, start + delta))]!;
    this.setActive(item.value);
    const set = this.selectedSet;
    if (!set.has(item.value)) {
      set.add(item.value);
      this.commitValue(this.orderValues(set));
    }
  }

  private toggleSelectAll(): void {
    const items = this.enabledItems;
    if (items.length === 0) {
      return;
    }
    const set = this.selectedSet;
    const allSelected = items.every((item) => set.has(item.value));
    this.commitValue(allSelected ? [] : this.orderValues(new Set([...set, ...items.map((item) => item.value)])));
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadQuery = '';
    }, TYPEAHEAD_RESET_MS);
    const next = this.typeaheadQuery + char.toLowerCase();
    // Repeating one letter cycles through the options starting with it.
    const cycling = next.length > 1 && [...next].every((c) => c === next[0]);
    const query = cycling ? next[0]! : next;
    this.typeaheadQuery = next;

    const items = this.enabledItems;
    const current = this.activeIndex();
    const from = query.length === 1 ? current + 1 : Math.max(current, 0);
    for (let offset = 0; offset < items.length; offset++) {
      const index = (from + offset) % items.length;
      if (items[index]!.label.toLowerCase().startsWith(query)) {
        this.moveToIndex(index);
        return;
      }
    }
  }

  private selectActive(): void {
    const item = this.enabledItems.find((candidate) => candidate.value === this.activeValue);
    if (!item) {
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
      this.selectSingle(item.value);
    }
  }

  private selectSingle(value: string): void {
    if (this.currentValue !== value) {
      this.commitValue(value);
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
      .querySelector(`[data-part=option][data-value="${CSS.escape(this.activeValue)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  /** Uncontrolled: stores the value. Controlled: only reports it; the list updates when `value` changes. */
  private commitValue(next: ListboxValue): void {
    if (this.value === undefined) {
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

  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage(): string | null {
    const label = this.label ?? '';
    if (this.required && this.currentValue === null) {
      return COPY_REQUIRED(label);
    }
    if (this.errorValue) {
      return this.errorValue;
    }
    if (this.invalid) {
      return COPY_INVALID(label);
    }
    return null;
  }

  private syncInternals(): void {
    const value = this.currentValue;
    if (this.isDisabled || value === null || !this.name) {
      this.internals.setFormValue(null);
    } else if (Array.isArray(value)) {
      const data = new FormData();
      for (const entry of value) {
        data.append(this.name, entry);
      }
      this.internals.setFormValue(data);
    } else {
      this.internals.setFormValue(value);
    }

    const message = this.computeValidationMessage();
    if (message === null) {
      this.internals.setValidity({});
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, message, this.listEl ?? undefined);
    } else {
      this.internals.setValidity({ customError: true }, message, this.listEl ?? undefined);
    }
  }

  /** `labelledBy` names an element outside this shadow root, so it is linked by element reference. */
  private syncLabelledBy(): void {
    const list = this.listEl as LabelledElement | null;
    if (!list || !('ariaLabelledByElements' in list)) {
      return;
    }
    const root = this.getRootNode() as Document | ShadowRoot;
    const target = this.labelledBy ? root.getElementById(this.labelledBy) : null;
    list.ariaLabelledByElements = target ? [target] : null;
  }

  /** Measures the first rendered row so `maxVisible` counts real rows. */
  private measureRow(): void {
    const list = this.listEl;
    if (!list) {
      return;
    }
    const row = list.querySelector<HTMLElement>('[data-part=option], [data-part=groupLabel]');
    const size = row?.getBoundingClientRect().height ?? 0;
    if (size > 0) {
      list.style.setProperty('--ds-listbox-row-size', `${size}px`);
    } else {
      list.style.removeProperty('--ds-listbox-row-size');
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ListboxOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined || (this.embedded && EMBEDDED_NO_OP.has(binding))) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-listbox': DsListbox;
  }
}
