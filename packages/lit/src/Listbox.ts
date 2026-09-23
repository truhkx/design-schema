import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import type { IconName, IconOverridableBinding } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';

export type ListboxMaxVisible = '5' | '8' | '12' | 'all';

/** A single selectable entry (anatomy: option, optionLabel, optionDescription, optionIcon). */
export interface ListboxOption {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
}

/** A labelled group of entries (anatomy: group, groupLabel). Groups do not nest. */
export interface ListboxGroup {
  group: string;
  options: ListboxOption[];
}

/** The element type of `options`: a flat option or a group. Select and Combobox take the same `ListboxItem[]`. */
export type ListboxItem = ListboxOption | ListboxGroup;

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

/** optionSelectedCheck (locked) forwarded to the composed Icon's `color` binding. */
const CHECK_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.control.selectedBackground',
};

/** optionColor (locked) forwarded to the option icon's `color`, so it matches its row's label. */
const ICON_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.foreground',
};

/** Overridable style hooks; see the `overrides` property. Locked bindings are excluded. */
export type ListboxOverridableBinding =
  | 'border'
  | 'borderInvalid'
  | 'partGap'
  | 'borderWidth'
  | 'radius'
  | 'listPadding'
  | 'optionPaddingBlock'
  | 'optionPaddingInline'
  | 'optionGap'
  | 'optionRadius'
  | 'optionDescriptionSize'
  | 'optionWeight'
  | 'optionSelectedWeight'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'groupLabelPaddingBlock'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'typeaheadReset';

const HOOKS: Record<ListboxOverridableBinding, string> = {
  border: '--ds-listbox-border',
  borderInvalid: '--ds-listbox-border-invalid',
  partGap: '--ds-listbox-part-gap',
  borderWidth: '--ds-listbox-border-width',
  radius: '--ds-listbox-radius',
  listPadding: '--ds-listbox-list-padding',
  optionPaddingBlock: '--ds-listbox-option-padding-block',
  optionPaddingInline: '--ds-listbox-option-padding-inline',
  optionGap: '--ds-listbox-option-gap',
  optionRadius: '--ds-listbox-option-radius',
  optionDescriptionSize: '--ds-listbox-option-description-size',
  optionWeight: '--ds-listbox-option-weight',
  optionSelectedWeight: '--ds-listbox-option-selected-weight',
  groupLabelSize: '--ds-listbox-group-label-size',
  groupLabelWeight: '--ds-listbox-group-label-weight',
  groupLabelPaddingBlock: '--ds-listbox-group-label-padding-block',
  fontFamily: '--ds-listbox-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-listbox-font-size',
  lineHeight: '--ds-listbox-line-height',
  disabledOpacity: '--ds-listbox-disabled-opacity',
  typeaheadReset: '--ds-listbox-typeahead-reset',
};

/** Surface bindings the popup owns while `embedded`; their overrides are no-ops then. */
const EMBEDDED_NO_OP: ReadonlySet<ListboxOverridableBinding> = new Set([
  'border',
  'borderInvalid',
  'borderWidth',
  'radius',
]);

/** Negates a boolean attribute: `no-selection-follows-focus` present means `selectionFollowsFocus` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean => value === null,
  toAttribute: (value: boolean): string | null => (value ? null : ''),
};

/** A resolved `motion.duration.*` custom property (`500ms`, `0.5s`) in milliseconds. */
function parseDuration(value: string): number {
  const text = value.trim();
  const amount = parseFloat(text);
  if (Number.isNaN(amount)) return 0;
  return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount;
}

let listboxInstanceCount = 0;

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

/** Every selectable option in display order, groups flattened. */
function flattenItems(items: ListboxItem[]): ListboxOption[] {
  const result: ListboxOption[] = [];
  for (const item of items) {
    if (isGroup(item)) {
      result.push(...item.options);
    } else {
      result.push(item);
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
 * The list is always named by `label` (`aria-label`); `labelledBy` is accepted
 * for parity but ids do not cross the shadow boundary, so it is never resolved.
 *
 * The element is form-associated: `setFormValue` receives a string for
 * single-select and a `FormData` with one entry per value for `multiple`, the
 * shape a native `<select multiple>` submits. The host carries
 * `data-ds-field` for `<ds-form>`.
 *
 * `handleKey(event)` and `activeValue` are public so `<ds-select>`,
 * `<ds-combobox>` and `<ds-search>` can forward their own keydowns and drive
 * the active option: while `activeValue` is set (a string, or `null` for no
 * active option), forwarded keys move nothing on their own and only report
 * the option they would make active through `active-change`.
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
 * @fires active-change - The active option changed; `detail.value` is its value, or null when the list loses focus.
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
      --ds-listbox-border-invalid: var(--color-border-danger);
      --ds-listbox-part-gap: var(--space-1);
      --ds-listbox-border-width: var(--border-width-thin);
      --ds-listbox-radius: var(--radius-md);
      --ds-listbox-list-padding: var(--space-1);
      --ds-listbox-option-padding-block: var(--space-sm);
      --ds-listbox-option-padding-inline: var(--space-md);
      --ds-listbox-option-gap: var(--layout-gap-normal);
      --ds-listbox-option-radius: var(--radius-sm);
      --ds-listbox-option-description-size: var(--font-size-sm);
      --ds-listbox-option-weight: var(--font-weight-regular);
      --ds-listbox-option-selected-weight: var(--font-weight-medium);
      --ds-listbox-group-label-size: var(--font-size-xs);
      --ds-listbox-group-label-weight: var(--font-weight-semibold);
      --ds-listbox-group-label-padding-block: var(--space-1);
      --ds-listbox-font-family: var(--font-family-body);
      --ds-listbox-font-size: var(--font-size-md);
      --ds-listbox-line-height: var(--font-line-height-normal);
      --ds-listbox-disabled-opacity: var(--opacity-disabled);
      --ds-listbox-typeahead-reset: var(--motion-duration-loop);
      /* Locked bindings: out of the overrides API, still hooks for page CSS and the naming codemod. */
      --ds-listbox-surface: var(--color-background);
      --ds-listbox-option-color: var(--color-foreground);
      --ds-listbox-option-description-color: var(--color-foreground-muted);
      --ds-listbox-option-active-background: var(--color-background-subtle);
      --ds-listbox-option-selected-check: var(--color-control-selected-background);
      --ds-listbox-group-label-color: var(--color-foreground-muted);
      --ds-listbox-min-target: var(--size-target-min);
      --ds-listbox-focus-ring: var(--color-border-focus);
      --ds-listbox-focus-ring-width: var(--border-width-focus);
      /*
       * errorText and emptyColor are realised by the composed Text's tone (danger / muted);
       * these hooks are declared for the hook gate and naming codemod, not read here.
       */
      --ds-listbox-error-text: var(--color-foreground-danger);
      --ds-listbox-empty-color: var(--color-foreground-muted);
    }

    :host([hidden]) {
      display: none;
    }

    /* The root wrapper (not an anatomy part): list, then errorMessage, partGap apart. */
    .root {
      display: flex;
      flex-direction: column;
      gap: var(--ds-listbox-part-gap);
    }

    [data-part='list'] {
      --ds-listbox-frame: var(--ds-listbox-border-width);
      /* Row height from Behavior: max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock), never measured. */
      --ds-listbox-row-size: max(
        var(--ds-listbox-min-target),
        calc(var(--ds-listbox-font-size) * var(--ds-listbox-line-height) + 2 * var(--ds-listbox-option-padding-block))
      );
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--ds-listbox-list-padding);
      border-style: solid;
      border-width: var(--ds-listbox-border-width);
      border-color: var(--ds-listbox-border);
      border-radius: var(--ds-listbox-radius);
      /* surface: color.background, locked */
      background: var(--ds-listbox-surface);
      font-family: var(--ds-listbox-font-family);
      font-size: var(--ds-listbox-font-size);
      line-height: var(--ds-listbox-line-height);
      overflow-y: auto;
      outline: none;
      max-block-size: calc(
        var(--ds-listbox-row-size) * var(--ds-listbox-rows) + 2 * var(--ds-listbox-list-padding) + 2 *
          var(--ds-listbox-frame)
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

    :host([invalid]) [data-part='list'] {
      border-color: var(--ds-listbox-border-invalid);
    }

    /* embedded: the popup owns border, surface and radius; listPadding stays */
    :host([embedded]) [data-part='list'] {
      --ds-listbox-frame: calc(0 * var(--ds-listbox-border-width));
      border-style: none;
      border-width: 0;
      border-radius: 0;
      background: none;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='list']:focus-visible {
      outline: var(--ds-listbox-focus-ring-width) solid var(--ds-listbox-focus-ring);
      outline-offset: calc(-1 * var(--ds-listbox-focus-ring-width));
    }

    /*
     * disabledOpacity dims the list once; the error message, which sits outside
     * the list, stays at full opacity. Keyed on aria-disabled rather than
     * :host([disabled]) so a list disabled by an owning form or fieldset is
     * dimmed the same way.
     */
    [data-part='list'][aria-disabled='true'] {
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
      color: var(--ds-listbox-group-label-color);
    }

    [data-part='option'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--ds-listbox-min-target);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--ds-listbox-option-color);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it */
    [data-part='option'][data-active] {
      background: var(--ds-listbox-option-active-background);
    }

    /* optionWeight is the base row weight; the selected rule below is more specific and wins. */
    [data-part='option'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-weight);
    }

    /* optionSelectedWeight: selection is shown by weight (and the check with multiple), never a row fill */
    [data-part='option'][aria-selected='true'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    [data-part='option'][aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }
    /* A disabled list is dimmed once: its rows are not dimmed again on top of it. */
    [data-part='list'][aria-disabled='true'] [data-part='option'][aria-disabled='true'] {
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
      color: var(--ds-listbox-option-description-color);
    }

    /* The empty/loading row lines up with the rows it replaces. */
    .empty {
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }
  `;

  /** Accessible name of the list, always its `aria-label`, and the `{label}` in `copy.required` / `copy.invalid`. */
  @property() accessor label!: string;

  /**
   * Id of a visible element that labels the list. Accepted for parity with web;
   * never resolved, since ids do not cross shadow roots — `label` names the list.
   */
  @property({ attribute: 'labelled-by' }) accessor labelledBy: string | undefined;

  /** Flat or grouped options in display order. A property, not an attribute. */
  @property({ attribute: false }) accessor options: ListboxItem[] = [];

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

  /** Marks the list invalid (aria-invalid, `borderInvalid` when not embedded) with `copy.invalid`. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue: string | undefined;
  private invalidFromError = false;

  /**
   * Error message rendered below the list and linked by aria-describedby.
   * Implies `invalid`; clearing it never clears an explicitly set `invalid`.
   */
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

  /** The whole list is inert but readable: still focusable, aria-disabled, and keys, hover and clicks do nothing. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Field name for Form collection. Without it nothing is submitted. */
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

  /**
   * Controlled active option, for a host that keeps focus on its own trigger or
   * input (Select, Combobox, Search). Set, it wins over `initialActiveValue`;
   * `null` means no option is active. Omit (undefined) to let the list own it.
   */
  @property({ attribute: false }) accessor activeValue: string | null | undefined;

  /** Uncontrolled active option, used while `activeValue` is undefined. */
  @state() private accessor internalActive: string | null = null;

  /** Text overrides forwarded to the emptyState and errorMessage Texts: the root typeface and line height. */
  private textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
    fontFamily: 'font.family.body', // literal-ok: a TokenRef path, not a font stack
    lineHeight: 'font.lineHeight.normal',
  };

  /** Disabled by an owning native form or fieldset. */
  @state() private accessor formDisabled = false;

  @query('[data-part=list]') private accessor listEl!: HTMLElement | null;

  private readonly instanceId = `ds-listbox-${++listboxInstanceCount}`;
  private readonly errorId = `${this.instanceId}-error`;
  private readonly emptyId = `${this.instanceId}-empty`;
  private typeaheadQuery = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private warnedMissingLabel = false;
  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get flatOptions(): ListboxOption[] {
    return flattenItems(this.options);
  }

  private get enabledOptions(): ListboxOption[] {
    return this.flatOptions.filter((option) => option.disabled !== true);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): ListboxValue | null {
    const value = this.value !== undefined ? this.value : this.internalValue;
    if (this.multiple) {
      // A bare string is read as a one-entry array.
      const list = Array.isArray(value) ? value : typeof value === 'string' && value !== '' ? [value] : [];
      return list.length > 0 ? list : null;
    }
    // Single-select takes an array's first entry.
    const single = Array.isArray(value) ? value[0] : value;
    return typeof single === 'string' && single !== '' ? single : null;
  }

  /** The active option in effect: the controlled `activeValue` when set, else the list's own. */
  private get currentActive(): string | null {
    return this.activeValue !== undefined ? this.activeValue : this.internalActive;
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

  /** True only while DOM focus really sits on the list (a host that forwards keys keeps its own focus). */
  private get listHasFocus(): boolean {
    return this.listEl !== null && this.shadowRoot?.activeElement === this.listEl;
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
        this.moveToIndex(this.enabledOptions.length - 1);
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
        // Enter selects only in single-select; with `multiple` Space toggles.
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
    } else if (changed.has('initialActiveValue')) {
      // Never on mount: on the first render `initialActiveValue` is only resolved when focus arrives.
      this.followInitialActiveValue();
    }
    if (changed.has('overrides') || changed.has('embedded')) {
      this.applyOverrides();
    }
    if (changed.has('overrides')) {
      this.textOverrides = {
        fontFamily: this.overrides?.fontFamily ?? 'font.family.body',
        lineHeight: this.overrides?.lineHeight ?? 'font.lineHeight.normal',
      };
    }
  }

  protected override updated(changed: PropertyValues): void {
    this.syncInternals();
    if (changed.has('activeValue') || changed.has('internalActive')) {
      this.scrollActiveIntoView();
    }
    if (import.meta.env.DEV && !this.label && !this.warnedMissingLabel) {
      this.warnedMissingLabel = true;
      console.warn('<ds-listbox> requires a `label`; it is the list\'s aria-label even with `labelledBy`.', this);
    }
  }

  protected override render(): TemplateResult {
    const flat = this.flatOptions;
    const optionIds = new Map<string, string>();
    flat.forEach((option, index) => optionIds.set(option.value, `${this.instanceId}-option-${index}`));
    // A disabled list keeps its active option in state but shows and points at none.
    const active = this.isDisabled ? null : this.currentActive;
    const activeId = active !== null ? optionIds.get(active) : undefined;
    const message = this.displayedMessage();
    // The empty/loading row and the error message, in reading order.
    const describedBy =
      [flat.length === 0 ? this.emptyId : null, message ? this.errorId : null].filter(Boolean).join(' ') || undefined;

    return html`
      <div class="root">
        <div
          data-part="list"
          part="list"
          role="listbox"
          tabindex=${this.embedded ? '-1' : '0'}
          aria-label=${ifDefined(this.label || undefined)}
          aria-multiselectable=${ifDefined(this.multiple ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-describedby=${ifDefined(describedBy)}
          aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
          aria-disabled=${ifDefined(this.isDisabled ? 'true' : undefined)}
          aria-activedescendant=${ifDefined(activeId)}
          @keydown=${this.handleKey}
          @focus=${this.handleListFocus}
          @blur=${this.handleListBlur}
        >
          ${flat.length === 0 ? this.renderEmpty() : this.renderItems(optionIds, active)}
        </div>
        ${message
          ? html`<ds-text
              id=${this.errorId}
              data-part="errorMessage"
              part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${this.textOverrides}
              >${message}</ds-text
            >`
          : nothing}
      </div>
    `;
  }

  /**
   * A listbox owns only options and groups, so the empty/loading row is hidden
   * from the accessibility tree and reaches the user as the list's description
   * instead — `aria-describedby` resolves hidden text, so the still-focusable
   * empty list announces "No options" either way.
   */
  private renderEmpty(): TemplateResult {
    return html`<div class="empty" id=${this.emptyId} aria-hidden="true">
      <ds-text data-part="emptyState" part="emptyState" element="p" tone="muted" .overrides=${this.textOverrides}
        >${this.loading ? COPY_LOADING : this.emptyMessage || COPY_EMPTY}</ds-text
      >
    </div>`;
  }

  private renderItems(optionIds: Map<string, string>, active: string | null): unknown[] {
    let groupCounter = 0;
    return this.options.map((item) => {
      if (!isGroup(item)) {
        return this.renderOption(item, optionIds.get(item.value)!, active);
      }
      // Empty groups are omitted.
      if (item.options.length === 0) {
        return nothing;
      }
      const labelId = `${this.instanceId}-group-${groupCounter++}`;
      return html`
        <div data-part="group" part="group" role="group" aria-labelledby=${labelId}>
          <div data-part="groupLabel" part="groupLabel" id=${labelId}>${item.group}</div>
          ${item.options.map((option) => this.renderOption(option, optionIds.get(option.value)!, active))}
        </div>
      `;
    });
  }

  private renderOption(option: ListboxOption, id: string, active: string | null): TemplateResult {
    const disabled = this.isDisabled || option.disabled === true;
    const selected = this.selectedSet.has(option.value);
    const descriptionId = option.description ? `${id}-description` : undefined;
    return html`
      <div
        id=${id}
        data-part="option"
        part="option"
        role="option"
        data-value=${option.value}
        ?data-active=${active === option.value}
        aria-selected=${selected ? 'true' : 'false'}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        aria-describedby=${ifDefined(descriptionId)}
        @click=${() => this.handleOptionClick(option)}
        @pointermove=${() => this.handleOptionPointer(option)}
      >
        ${this.multiple
          ? html`<ds-icon
              data-part="optionCheck"
              part="optionCheck"
              name="check"
              size="sm"
              .overrides=${CHECK_OVERRIDES}
            ></ds-icon>`
          : nothing}
        ${option.icon
          ? html`<ds-icon
              data-part="optionIcon"
              part="optionIcon"
              name=${option.icon}
              size="sm"
              .overrides=${ICON_OVERRIDES}
            ></ds-icon>`
          : nothing}
        <span class="option-text">
          <span data-part="optionLabel" part="optionLabel">${option.label}</span>
          ${option.description
            ? html`<span id=${ifDefined(descriptionId)} data-part="optionDescription" part="optionDescription"
                >${option.description}</span
              >`
            : nothing}
        </span>
      </div>
    `;
  }

  /** The displayed message: `error`, else while invalid `copy.required` (required, nothing selected) or `copy.invalid`. */
  private displayedMessage(): string {
    if (this.errorValue) {
      return this.errorValue;
    }
    if (!this.invalid) {
      return '';
    }
    const label = this.label ?? '';
    return this.required && this.currentValue === null ? COPY_REQUIRED(label) : COPY_INVALID(label);
  }

  /** `initialActiveValue` when it names an enabled option, else the first selected, else the first enabled. */
  private initialOption(): ListboxOption | undefined {
    const options = this.enabledOptions;
    const initial =
      this.initialActiveValue !== undefined
        ? options.find((option) => option.value === this.initialActiveValue)
        : undefined;
    const selected = this.selectedSet;
    return initial ?? options.find((option) => selected.has(option.value)) ?? options[0];
  }

  /**
   * `initialActiveValue` changed while the list has no focus (a Combobox updates
   * it as the user types): the active option moves to it silently, without
   * firing `active-change`.
   */
  private followInitialActiveValue(): void {
    const next = this.initialActiveValue;
    if (next === undefined || next === this.internalActive || this.listHasFocus) {
      return;
    }
    // Kept in state even while disabled, so enabling the list picks up where it would have been.
    if (this.enabledOptions.some((option) => option.value === next)) {
      this.internalActive = next;
    }
  }

  /**
   * Real focus on the list: the active option (kept when it names an enabled
   * option, else the resolved initial option) is reported every time, even when
   * its value has not changed, so a host always learns where focus went.
   */
  private readonly handleListFocus = (): void => {
    if (this.isDisabled) {
      return;
    }
    const current = this.currentActive;
    const target =
      this.enabledOptions.find((option) => option.value === current) ?? this.initialOption();
    if (target) {
      this.setActive(target.value, true);
    }
  };

  private readonly handleListBlur = (): void => {
    if (this.isDisabled || this.currentActive === null) {
      return;
    }
    this.setActive(null);
  };

  private handleOptionClick(option: ListboxOption): void {
    if (this.isDisabled || option.disabled === true) {
      return;
    }
    this.setActive(option.value);
    this.selectActive();
  }

  private handleOptionPointer(option: ListboxOption): void {
    if (this.isDisabled || option.disabled === true) {
      return;
    }
    this.setActive(option.value);
  }

  private activeIndex(): number {
    const active = this.currentActive;
    return active === null ? -1 : this.enabledOptions.findIndex((option) => option.value === active);
  }

  /** Arrows and Page keys: clamp at the first and last enabled option, never wrap. */
  private moveBy(delta: number): void {
    const count = this.enabledOptions.length;
    const current = this.activeIndex();
    // Nothing active yet: ArrowDown/PageDown land on the first enabled option, ArrowUp/PageUp on the last.
    if (current === -1) {
      this.moveToIndex(delta > 0 ? 0 : count - 1);
      return;
    }
    this.moveToIndex(current + delta);
  }

  /** Moves the active option and, in single-select with `selectionFollowsFocus`, selects it. */
  private moveToIndex(index: number): void {
    const options = this.enabledOptions;
    if (options.length === 0) {
      return;
    }
    const option = options[Math.max(0, Math.min(options.length - 1, index))]!;
    this.setActive(option.value);
    if (!this.multiple && this.selectionFollowsFocus) {
      this.selectSingle(option.value);
    }
  }

  /** The `maxVisible` row count PageUp/PageDown move by; `all` jumps to the ends. */
  private pageSize(): number {
    return this.maxVisible === 'all' ? this.enabledOptions.length : Number(this.maxVisible);
  }

  /** Shift+Arrow with `multiple`: move and add (never remove) the reached option. */
  private extendSelection(delta: 1 | -1): void {
    const options = this.enabledOptions;
    if (options.length === 0) {
      return;
    }
    const current = this.activeIndex();
    const index = current === -1 ? (delta > 0 ? 0 : options.length - 1) : current + delta;
    const option = options[Math.max(0, Math.min(options.length - 1, index))]!;
    this.setActive(option.value);
    const set = this.selectedSet;
    if (!set.has(option.value)) {
      set.add(option.value);
      this.commitValue(this.orderValues(set));
    }
  }

  /** Ctrl/Cmd+A with `multiple`: select every enabled option, or deselect them all; selected disabled options stay. */
  private toggleSelectAll(): void {
    const enabled = this.enabledOptions.map((option) => option.value);
    if (enabled.length === 0) {
      return;
    }
    const set = this.selectedSet;
    if (enabled.every((value) => set.has(value))) {
      for (const value of enabled) set.delete(value);
    } else {
      for (const value of enabled) set.add(value);
    }
    this.commitValue(this.orderValues(set));
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    // typeaheadReset is read at runtime from the list, never a number written here.
    const reset = parseDuration(getComputedStyle(this.listEl ?? this).getPropertyValue(HOOKS.typeaheadReset));
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadQuery = '';
    }, reset);
    const buffer = this.typeaheadQuery + char.toLowerCase();
    this.typeaheadQuery = buffer;

    const options = this.enabledOptions;
    if (options.length === 0) {
      return;
    }
    // APG: the same character typed over and over cycles through the options starting with it.
    const repeated = buffer.length > 1 && [...buffer].every((letter) => letter === buffer[0]);
    const query = repeated ? buffer[0]! : buffer;
    const current = this.activeIndex();
    // A one-character search always advances past the active option; a longer prefix may keep it.
    const from = current === -1 ? 0 : current;
    const startOffset = current === -1 ? 0 : query.length === 1 ? 1 : 0;

    for (let offset = startOffset; offset < options.length + startOffset; offset++) {
      const index = (from + offset) % options.length;
      if (options[index]!.label.toLowerCase().startsWith(query)) {
        this.moveToIndex(index);
        break;
      }
    }
    // An unreadable reset (no token stylesheet) clears at once: single-character typeahead only.
    if (reset <= 0) {
      clearTimeout(this.typeaheadTimer);
      this.typeaheadQuery = '';
    }
  }

  /** Space/Enter: act on the active option, or the resolved initial option when none is active yet. */
  private selectActive(): void {
    const active = this.currentActive;
    const option =
      active === null
        ? this.initialOption()
        : this.enabledOptions.find((candidate) => candidate.value === active);
    if (!option) {
      return;
    }
    this.setActive(option.value);
    if (this.multiple) {
      const set = this.selectedSet;
      if (set.has(option.value)) {
        set.delete(option.value);
      } else {
        set.add(option.value);
      }
      this.commitValue(this.orderValues(set));
    } else {
      this.selectSingle(option.value);
    }
  }

  private selectSingle(value: string): void {
    if (this.currentValue !== value) {
      this.commitValue(value);
    }
  }

  /** Selected values in option order (selected values not among the options keep their place at the end). */
  private orderValues(set: Set<string>): string[] {
    const known = this.flatOptions.map((option) => option.value);
    return [...known.filter((value) => set.has(value)), ...[...set].filter((value) => !known.includes(value))];
  }

  /**
   * Makes `value` active and reports it. Controlled (`activeValue` set), the
   * list only reports; the host passes the value back. `always` reports an
   * unchanged value too (real focus); every other source is deduped.
   */
  private setActive(value: string | null, always = false): void {
    if (!always && this.currentActive === value) {
      return;
    }
    if (this.activeValue === undefined) {
      this.internalActive = value;
    }
    this.dispatchEvent(
      new CustomEvent<ListboxActiveChangeDetail>('active-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private scrollActiveIntoView(): void {
    const active = this.currentActive;
    if (active === null || this.isDisabled) {
      return;
    }
    this.renderRoot
      .querySelector(`[data-part=option][data-value="${CSS.escape(active)}"]`)
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
