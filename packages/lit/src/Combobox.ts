import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';
import './Listbox.js';
import './Text.js';
import type {
  DsListbox,
  ListboxActiveChangeDetail,
  ListboxChangeDetail,
  ListboxGroup,
  ListboxOption,
  ListboxItem,
} from './Listbox.js';
import type { IconOverridableBinding } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';

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
 * `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`,
 * `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`,
 * `minTarget`, `inputMinTarget` and `focusRingWidth` are locked and excluded
 * (their `--ds-combobox-*` hooks stay themeable from page CSS; `iconColor` is
 * declared for the hooks gate but reaches the icons through each Icon's `overrides.color`).
 */
export type ComboboxOverridableBinding =
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
  | 'popupBorderWidth'
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

/**
 * The combobox's own hooks. `labelWeight` and `helperSize` have none: they are forwarded to the
 * composed Text's `overrides` (`fontWeight` / `fontSize`), which carries them.
 */
const HOOKS: Record<Exclude<ComboboxOverridableBinding, 'labelWeight' | 'helperSize'>, string> = {
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
  popupSurface: '--ds-combobox-popup-surface',
  popupBorder: '--ds-combobox-popup-border',
  popupBorderWidth: '--ds-combobox-popup-border-width',
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

/** iconColor (locked): forwarded to each composed Icon's own `color` override; no combobox hook. */
const ICON_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.foreground.muted',
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
/** copy.resultCount, plural by count */
const COPY_RESULT_COUNT = {
  one: (count: number): string => `${count} result available`,
  other: (count: number): string => `${count} results available`,
};
/** copy.activeOption */
const COPY_ACTIVE_OPTION = (option: string): string => `${option}`;
/** copy.required */
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
/** copy.invalid */
const COPY_INVALID = (label: string): string => `${label} is not valid.`;
/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** constant `statusDebounce`: `motion.duration.base` × 2, read from the token at run time. */
const STATUS_DEBOUNCE = { token: '--motion-duration-base', multiply: 2 } as const;

/**
 * Value of the synthetic `copy.addCustom` row given to the Listbox. Namespaced so it cannot be
 * confused with a real option value; `commitRow` also checks that the row is really showing.
 */
const CUSTOM_ROW_VALUE = 'ds-combobox:add-custom';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean => value === null,
  toAttribute: (value: boolean): string | null => (value ? null : ''),
};

/** Which option becomes active when the list opens or its rows change. */
type ActiveIntent = 'none' | 'selected' | 'selectedOrFirst' | 'selectedOrLast' | 'typeahead';

const COMBINING_MARKS = /\p{M}/gu;

/** Case- and diacritic-insensitive comparison key. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

function isGroupOption(option: ListboxItem): option is ListboxGroup {
  return 'group' in option;
}

/** Depth-first list of every selectable item, groups flattened. */
function flattenOptions(options: ListboxItem[]): ListboxOption[] {
  const result: ListboxOption[] = [];
  for (const option of options) {
    if (isGroupOption(option)) {
      result.push(...flattenOptions(option.options));
    } else {
      result.push(option);
    }
  }
  return result;
}

/** Keeps the items matching `predicate`, dropping groups left empty. */
function filterOptions(options: ListboxItem[], predicate: (item: ListboxOption) => boolean): ListboxItem[] {
  const result: ListboxItem[] = [];
  for (const option of options) {
    if (isGroupOption(option)) {
      const matching = option.options.filter(predicate);
      if (matching.length > 0) {
        result.push({ group: option.group, options: matching });
      }
    } else if (predicate(option)) {
      result.push(option);
    }
  }
  return result;
}

/** A computed `<time>` value (`150ms`, `0.15s`) in milliseconds. */
function parseDuration(value: string): number {
  const text = value.trim();
  const amount = parseFloat(text);
  if (Number.isNaN(amount)) return 0;
  return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount;
}

function toList(value: ComboboxValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === '' ? [] : [value];
}

/**
 * `<ds-combobox>` — Combobox (category: input, APG pattern: combobox).
 *
 * `<ds-combobox label="Assignees" name="assignees" multiple .options=${options}>`
 * is the APG editable combobox with list autocomplete: a `<label for>`, a field
 * holding the chips (`multiple`), an `<input role="combobox"
 * aria-autocomplete="list" aria-expanded aria-controls>`, a clear and a toggle
 * `<ds-button>` (ghost, sm, icon-only), and a popup wrapping an embedded
 * `<ds-listbox>` in the same shadow root. The popup uses the Popover API
 * (`popover="manual"`) when available and a `position: fixed` fallback on
 * `layer.dropdown` otherwise, placed below the field (flipped above at the
 * viewport edge) and at least as wide as it.
 *
 * DOM focus never leaves the input: ArrowDown/ArrowUp are forwarded to the
 * Listbox's `handleKey`, and Enter commits the active option. The options
 * render inside the Listbox's own shadow root, which an `aria-activedescendant`
 * IDREF on the input cannot reach, so the active option's label is exposed
 * through `aria-describedby` on a live element (`copy.activeOption`), as
 * `<ds-select>` does. The `open` attribute mirrors the effective list state.
 * Result counts, loading and "no matches" are announced
 * by a polite `role="status"` region after `motion.duration.base × 2`.
 *
 * `value`, `open` and `inputValue` are controlled when set (the element
 * reports `change` / `open-change` / `input-change` and waits for the
 * property), uncontrolled otherwise. The element is form-associated
 * (`setFormValue`, a `FormData` with one entry per value for `multiple`) and
 * carries `data-ds-field` for `<ds-form>`.
 *
 * ## When to use
 *
 * Long lists (fifty-plus), values typed faster than found, `async` search
 * against a server, and multi-value fields where chips make the selection
 * legible. `allowCustom` when new values are legitimate (tags, emails).
 *
 * ## When not to use
 *
 * Not for fewer than about ten options that never grow (Select), not a search
 * box that navigates to results, not a date picker.
 *
 * @fires change - The selected value(s) changed; `detail.value` (an array with `multiple`).
 * @fires input-change - The input text changed; `detail.value`.
 * @fires open-change - The list opened or closed; `detail.open`.
 */
@customElement('ds-combobox')
export class DsCombobox extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      /* Locked bindings: not in overrides, but the hook stays so page CSS can re-theme them. */
      --ds-combobox-field-background: var(--color-background);
      --ds-combobox-field-border: var(--color-border-strong);
      --ds-combobox-field-border-focus: var(--color-border-focus);
      --ds-combobox-input-color: var(--color-foreground);
      --ds-combobox-placeholder-color: var(--color-foreground-muted);
      --ds-combobox-chip-background: var(--color-background-strong);
      --ds-combobox-chip-color: var(--color-foreground);
      --ds-combobox-description-text: var(--color-foreground-muted);
      --ds-combobox-error-text: var(--color-foreground-danger);
      /* iconColor is forwarded to each Icon's overrides.color; this declaration only satisfies the locked-hook gate and reaches no child. */
      --ds-combobox-icon-color: var(--color-foreground-muted);
      --ds-combobox-min-target: var(--size-target-comfortable);
      --ds-combobox-input-min-target: var(--size-target-min);
      --ds-combobox-focus-ring-width: var(--border-width-focus);
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
      --ds-combobox-popup-surface: var(--color-overlay-surface);
      --ds-combobox-popup-border: var(--color-border);
      --ds-combobox-popup-border-width: var(--border-width-thin);
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
      font-family: var(--ds-combobox-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    .group {
      display: grid;
      gap: var(--ds-combobox-part-gap);
    }

    /* disabledOpacity: the whole field dims, as Input does */
    .group.disabled {
      opacity: var(--ds-combobox-disabled-opacity);
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

    [data-part='label'] {
      display: block;
    }

    /*
     * descriptionText / errorText (locked): the composed Text keeps its muted / danger tone;
     * the parent hook only sets Text's own documented --ds-text-color hook on its host.
     */
    [data-part='description'] {
      --ds-text-color: var(--ds-combobox-description-text);
    }
    [data-part='errorMessage'] {
      --ds-text-color: var(--ds-combobox-error-text);
    }

    /* fieldBackground / fieldBorder: color.background / color.border.strong, locked */
    [data-part='field'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-combobox-field-gap);
      inline-size: 100%;
      /* minTarget: size.target.comfortable, locked */
      min-block-size: var(--ds-combobox-min-target);
      padding-block: var(--ds-combobox-field-padding-block);
      padding-inline: var(--ds-combobox-field-padding-inline);
      border-style: solid;
      border-width: var(--ds-combobox-field-border-width);
      border-color: var(--ds-combobox-field-border);
      border-radius: var(--ds-combobox-field-radius);
      background: var(--ds-combobox-field-background);
      font-size: var(--ds-combobox-font-size);
      line-height: var(--ds-combobox-line-height);
      /* enter: the field border-color transition */
      transition: border-color var(--ds-combobox-enter) var(--motion-easing-standard);
    }

    /* fieldBorderFocus + focusRingWidth (locked): the focus width replaces the border width; padding shrinks by the difference.
       Tracks the input only, so a focused clear or chip-remove Button shows just its own ring. */
    [data-part='field']:has([data-part='input']:focus-visible) {
      border-color: var(--ds-combobox-field-border-focus);
      border-width: var(--ds-combobox-focus-ring-width);
      padding-block: calc(
        var(--ds-combobox-field-padding-block) -
          max(0px, var(--ds-combobox-focus-ring-width) - var(--ds-combobox-field-border-width))
      );
      padding-inline: calc(
        var(--ds-combobox-field-padding-inline) -
          max(0px, var(--ds-combobox-focus-ring-width) - var(--ds-combobox-field-border-width))
      );
    }

    :host([invalid]) [data-part='field'],
    :host([invalid]) [data-part='field']:has([data-part='input']:focus-visible) {
      border-color: var(--ds-combobox-field-border-invalid);
    }

    .entry {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-combobox-field-gap);
      min-inline-size: 0;
    }

    [data-part='chips'] {
      display: contents;
    }

    /* chipBackground / chipColor: color.background.strong / color.foreground, locked */
    [data-part='chip'] {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--ds-combobox-chip-gap);
      min-inline-size: 0;
      max-inline-size: 100%;
      padding-block: var(--ds-combobox-chip-padding-block);
      padding-inline: var(--ds-combobox-chip-padding-inline);
      border-radius: var(--ds-combobox-chip-radius);
      background: var(--ds-combobox-chip-background);
      color: var(--ds-combobox-chip-color);
      font-size: var(--ds-combobox-chip-size);
    }

    /* A chip truncates once the row runs out of room, never at a fixed character count. */
    .chip-label {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* inputColor: color.foreground, locked */
    [data-part='input'] {
      flex: 1;
      box-sizing: border-box;
      min-inline-size: calc(var(--ds-combobox-font-size) * 4);
      /* inputMinTarget: size.target.min, locked — the input's own floor when chips wrap to several rows */
      min-block-size: var(--ds-combobox-input-min-target);
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--ds-combobox-input-color);
      font: inherit;
    }

    /* placeholderColor: color.foreground.muted, locked */
    [data-part='input']::placeholder {
      color: var(--ds-combobox-placeholder-color);
      opacity: 1;
    }

    .group.disabled [data-part='input'] {
      cursor: not-allowed;
    }

    [data-part='clearButton'],
    [data-part='toggleButton'],
    [data-part='chipRemove'] {
      flex: none;
    }

    [data-part='popup'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      /* popupOffset: the block margin of the fixed popup; only the side facing the field shows */
      margin: 0;
      margin-block: var(--ds-combobox-popup-offset);
      padding: 0;
      overflow: hidden;
      border-style: solid;
      border-width: var(--ds-combobox-popup-border-width);
      border-color: var(--ds-combobox-popup-border);
      border-radius: var(--ds-combobox-popup-radius);
      background: var(--ds-combobox-popup-surface);
      box-shadow: var(--ds-combobox-popup-shadow);
      color: var(--color-foreground);
      z-index: var(--ds-combobox-layer);
      opacity: 1;
      /* enter: popup fade */
      transition: opacity var(--ds-combobox-enter) var(--motion-easing-standard);
    }

    @starting-style {
      [data-part='popup'] {
        opacity: 0;
      }
    }

    [data-part='listbox'] {
      display: block;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'],
      [data-part='popup'] {
        transition: none;
      }
    }
  `;

  /** Visible label. Always rendered. */
  @property() accessor label = '';

  /** Field name for the Form. */
  @property() accessor name = '';

  /** The full option set, or the current page of results when `filter` is `async`. A property, not an attribute. */
  @property({ attribute: false }) accessor options: ListboxItem[] = [];

  /** Controlled selected value(s): an array with `multiple`. Omit for an uncontrolled field. */
  @property({ attribute: false }) accessor value: ComboboxValue | undefined;

  /** Initial value(s). */
  @property({ attribute: false }) accessor defaultValue: ComboboxValue | undefined;

  /**
   * Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default.
   * The `open` attribute mirrors the effective state (controlled or not); the mirror write does not make the element controlled.
   */
  @property({ type: Boolean }) accessor open: boolean | undefined;

  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  @property({ attribute: 'input-value' }) accessor inputValue: string | undefined;

  /** Pick many: selected options appear as removable chips before the input; the list stays open while toggling. */
  @property({ type: Boolean, reflect: true }) accessor multiple = false;

  /** Typed text that matches no option can be committed as a value with Enter or a comma. */
  @property({ type: Boolean, reflect: true, attribute: 'allow-custom' }) accessor allowCustom = false;

  /** How typing narrows `options`. */
  @property({ type: String, reflect: true }) accessor filter: ComboboxFilter = 'contains';

  /** Example input shown while empty. Never the only description. */
  @property() accessor placeholder: string | undefined;

  /** Helper text under the label. */
  @property() accessor description: string | undefined;

  /** Must have a value to submit. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Not editable, not submitted, still readable and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field invalid. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue: string | undefined;
  private invalidFromError = false;

  /** Error message; implies invalid. */
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

  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Show a clear button when there is a value or text. Attribute: `no-clear` turns it off. */
  @property({ attribute: 'no-clear', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER }) accessor clearable = true;

  /** Per-instance style overrides: `{ fieldRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled value, seeded from `defaultValue`. */
  @state() private accessor internalValue: ComboboxValue | undefined;

  /** Uncontrolled input text. */
  @state() private accessor internalText = '';

  /** Uncontrolled popup state. */
  @state() private accessor internalOpen = false;

  /** The Listbox's active option while the popup is open. */
  @state() private accessor activeValue: string | null = null;

  /** Set by the toggle button: this opening shows the unfiltered list until the next keystroke. */
  @state() private accessor showAll = false;

  /** Debounced text of the status live region. */
  @state() private accessor statusText = '';

  /** Disabled by an owning native form or fieldset. */
  @state() private accessor formDisabled = false;

  @query('[data-part=field]') private accessor fieldEl!: HTMLElement | null;
  @query('[data-part=input]') private accessor inputEl!: HTMLInputElement | null;
  @query('[data-part=popup]') private accessor popupEl!: HTMLElement | null;
  @query('[data-part=listbox]') private accessor listboxEl!: DsListbox | null;

  private readonly internals: ElementInternals;
  private shown = false;
  private warned = false;
  /** Set while the element writes its own `open` attribute, so the mirror is not read back as a controlled `open`. */
  private mirroringOpen = false;
  private openIntent: ActiveIntent = 'selectedOrFirst';
  private pendingStatus = '';
  private statusTimer: ReturnType<typeof setTimeout> | undefined;
  /** Labels seen for each value, so a chip keeps its label when async results no longer include it. */
  private readonly labelCache = new Map<string, string>();

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.addEventListener('focusout', this.handleFocusOut);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get isLoading(): boolean {
    return this.filter === 'async' && this.loading;
  }

  /** Whether the list is open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  /** The current text of the input, controlled or not. */
  get currentText(): string {
    return this.inputValue ?? this.internalText;
  }

  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): ComboboxValue | null {
    const list = this.selectedValues;
    if (this.multiple) {
      return list.length > 0 ? list : null;
    }
    return list[0] ?? null;
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** The field's own copy string for its current validity, or '' when valid. */
  get validationMessage(): string {
    return this.computeValidationMessage() ?? '';
  }

  /** Selected values in selection order. */
  private get selectedValues(): string[] {
    const list = toList(this.value !== undefined ? this.value : this.internalValue).filter((entry) => entry !== '');
    return this.multiple ? list : list.slice(0, 1);
  }

  /** `options` narrowed per `filter`; `none`, `async` and a toggle-button opening show them all. */
  private get filteredOptions(): ListboxItem[] {
    const query = normalize(this.currentText.trim());
    if (this.showAll || this.filter === 'none' || this.filter === 'async' || query === '') {
      return this.options;
    }
    return filterOptions(this.options, (item) =>
      this.filter === 'startsWith' ? normalize(item.label).startsWith(query) : normalize(item.label).includes(query),
    );
  }

  /** The synthetic `copy.addCustom` row applies: custom entry on, text typed, and no option matches it by value or label. */
  private get showsCustomRow(): boolean {
    const text = normalize(this.currentText.trim());
    return (
      this.allowCustom &&
      text !== '' &&
      !flattenOptions(this.options).some((item) => normalize(item.value) === text || normalize(item.label) === text)
    );
  }

  /** What the Listbox shows: the filtered options, the custom row first, nothing while loading. */
  private get listOptions(): ListboxItem[] {
    if (this.isLoading) {
      return [];
    }
    const filtered = this.filteredOptions;
    return this.showsCustomRow
      ? [{ value: CUSTOM_ROW_VALUE, label: COPY_ADD_CUSTOM(this.currentText.trim()) }, ...filtered]
      : filtered;
  }

  private get enabledItems(): ListboxOption[] {
    return flattenOptions(this.listOptions).filter((item) => item.disabled !== true);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Combobox');
    this.setAttribute('data-ds-field', '');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    clearTimeout(this.statusTimer);
    this.shown = false;
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (name === 'open' && this.mirroringOpen) {
      return;
    }
    super.attributeChangedCallback(name, old, value);
  }

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
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
    this.internalText = this.multiple ? '' : this.labelFor(toList(this.defaultValue)[0]);
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (typeof restored === 'string') {
      this.internalValue = restored;
    } else if (restored instanceof FormData) {
      this.internalValue = restored.getAll(this.name).filter((entry): entry is string => typeof entry === 'string');
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('options')) {
      for (const item of flattenOptions(this.options)) {
        this.labelCache.set(item.value, item.label);
      }
    }
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
      if (!this.multiple) {
        this.internalText = this.labelFor(this.selectedValues[0]);
      }
    } else if (changed.has('value') && !this.multiple) {
      // A single selection that changes from outside shows its label.
      this.internalText = this.labelFor(this.selectedValues[0]);
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }

    const isOpen = this.currentOpen;
    if (isOpen && !this.shown) {
      this.activeValue = this.resolveIntent(this.openIntent);
      this.openIntent = 'selectedOrFirst';
    } else if (!isOpen) {
      this.activeValue = null;
      this.showAll = false;
    } else if (changed.has('options') || changed.has('loading')) {
      // New results replace the rows under the active option.
      this.activeValue = null;
    } else if (this.activeValue !== null && !this.enabledItems.some((item) => item.value === this.activeValue)) {
      this.activeValue = null;
    }
  }

  protected override updated(changed: PropertyValues): void {
    this.syncInternals();
    const isOpen = this.currentOpen;
    if (this.hasAttribute('open') !== isOpen) {
      this.mirroringOpen = true;
      this.toggleAttribute('open', isOpen);
      this.mirroringOpen = false;
    }
    if (isOpen && !this.shown) {
      this.shown = true;
      this.showPopup();
      if (changed.has('open') && this.open === true) {
        this.claimFocus();
      }
    } else if (!isOpen && this.shown) {
      this.shown = false;
      this.hidePopup();
    } else if (isOpen) {
      this.updatePosition();
    }
    if (changed.has('activeValue') && this.activeValue !== null) {
      void this.scrollActiveIntoView();
    }
    this.syncStatus();
    if (import.meta.env.DEV && !this.warned) {
      this.warned = true;
      if (!this.label) console.warn('<ds-combobox> requires a `label`.', this);
      if (!this.name) console.warn('<ds-combobox> requires a `name`.', this);
    }
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const isOpen = this.currentOpen;
    const message = this.errorValue || (this.invalid ? COPY_INVALID(this.label) : '');
    const describedBy = [
      this.description ? 'description' : '',
      message ? 'error' : '',
      isOpen && this.activeValue !== null ? 'active-option' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const o = this.overrides;
    const helperOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontSize: o?.helperSize,
      fontFamily: o?.fontFamily,
      lineHeight: o?.lineHeight,
    };
    const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontWeight: o?.labelWeight,
      fontSize: o?.fontSize,
      fontFamily: o?.fontFamily,
      lineHeight: o?.lineHeight,
    };
    const selected = this.selectedValues;
    const showClear = this.clearable && (selected.length > 0 || this.currentText !== '');
    const activeLabel =
      this.activeValue === null
        ? ''
        : (flattenOptions(this.listOptions).find((item) => item.value === this.activeValue)?.label ?? '');

    return html`
      <div class=${classMap({ group: true, disabled: isDisabled })}>
        <label id="label" data-part="label" part="label" for="input"
          ><ds-text element="span" weight="medium" .overrides=${labelOverrides}
            >${this.label}${this.required ? COPY_REQUIRED_INDICATOR : nothing}</ds-text
          ></label
        >
        ${this.description
          ? html`<ds-text
              id="description"
              data-part="description"
              part="description"
              element="p"
              size="sm"
              tone="muted"
              .overrides=${helperOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        <div data-part="field" part="field">
          <div class="entry">
            ${this.multiple && selected.length > 0
              ? html`<span data-part="chips" part="chips">${selected.map((entry) => this.renderChip(entry))}</span>`
              : nothing}
            <input
              id="input"
              data-part="input"
              part="input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded=${isOpen ? 'true' : 'false'}
              aria-controls="popup"
              aria-describedby=${ifDefined(describedBy || undefined)}
              aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
              aria-required=${ifDefined(this.required ? 'true' : undefined)}
              aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
              autocomplete="off"
              placeholder=${ifDefined(this.placeholder)}
              .value=${live(this.currentText)}
              ?readonly=${isDisabled}
              @input=${this.handleInput}
              @click=${this.handleInputClick}
              @keydown=${this.handleKeydown}
            />
          </div>
          ${showClear
            ? html`<ds-button
                data-part="clearButton"
                part="clearButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_CLEAR_LABEL}
                ?disabled=${isDisabled}
                @press=${this.handleClearPress}
                ><ds-icon slot="leading-icon" name="close" .overrides=${ICON_OVERRIDES}></ds-icon
              ></ds-button>`
            : nothing}
          <ds-button
            data-part="toggleButton"
            part="toggleButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_TOGGLE_LABEL}
            ?disabled=${isDisabled}
            @press=${this.handleTogglePress}
            ><ds-icon slot="leading-icon" name="chevron-down" .overrides=${ICON_OVERRIDES}></ds-icon
          ></ds-button>
        </div>
        <span id="active-option" class="visually-hidden" aria-live="polite">${activeLabel ? COPY_ACTIVE_OPTION(activeLabel) : ''}</span>
        <div id="status" data-part="status" part="status" class="visually-hidden" role="status" aria-live="polite">
          ${this.statusText}
        </div>
        <div
          id="popup"
          data-part="popup"
          part="popup"
          popover=${ifDefined(POPOVER_SUPPORTED ? 'manual' : undefined)}
          ?hidden=${!POPOVER_SUPPORTED && !isOpen}
          @mousedown=${this.handlePopupMouseDown}
          @click=${this.handlePopupClick}
        >
          <ds-listbox
            data-part="listbox"
            part="listbox"
            label=${this.label}
            embedded
            .selectionFollowsFocus=${false}
            .options=${this.listOptions}
            .value=${this.multiple ? selected : (selected[0] ?? '')}
            .activeValue=${this.activeValue}
            empty-message=${COPY_EMPTY}
            ?loading=${this.isLoading}
            ?multiple=${this.multiple}
            ?disabled=${isDisabled}
            @change=${this.handleListboxChange}
            @active-change=${this.handleListboxActiveChange}
          ></ds-listbox>
        </div>
        <div id="error" data-part="errorMessage" part="errorMessage" role="alert" ?hidden=${!message}>
          ${message
            ? html`<ds-text element="p" size="sm" tone="danger" .overrides=${helperOverrides}>${message}</ds-text>`
            : nothing}
        </div>
      </div>
    `;
  }

  private renderChip(entry: string): TemplateResult {
    const label = this.labelFor(entry);
    return html`<span data-part="chip" part="chip"
      ><span class="chip-label">${label}</span
      ><ds-button
        data-part="chipRemove"
        part="chipRemove"
        variant="ghost"
        size="sm"
        icon-only
        label=${COPY_REMOVE_CHIP(label)}
        ?disabled=${this.isDisabled}
        @press=${(event: Event) => this.handleChipRemove(event, entry)}
        ><ds-icon slot="leading-icon" name="close" .overrides=${ICON_OVERRIDES}></ds-icon></ds-button
    ></span>`;
  }

  /**
   * Opening through the `open` property moves DOM focus to the input — `copy.activeOption` and the
   * status region announce nothing otherwise — unless focus is already inside the field, so a
   * focused clear or chip-remove Button keeps it.
   */
  private claimFocus(): void {
    const input = this.inputEl;
    const active = this.shadowRoot?.activeElement ?? null;
    if (!input || (active !== null && this.fieldEl?.contains(active))) {
      return;
    }
    input.focus({ preventScroll: true });
  }

  private labelFor(entry: string | undefined): string {
    if (entry === undefined) {
      return '';
    }
    return this.labelCache.get(entry) ?? flattenOptions(this.options).find((item) => item.value === entry)?.label ?? entry;
  }

  private resolveIntent(intent: ActiveIntent): string | null {
    const items = this.enabledItems;
    const selected = new Set(this.selectedValues);
    const selectedItem = items.find((item) => selected.has(item.value))?.value;
    switch (intent) {
      case 'none':
        return null;
      case 'selected':
        return selectedItem ?? null;
      case 'selectedOrFirst':
        return selectedItem ?? items[0]?.value ?? null;
      case 'selectedOrLast':
        return selectedItem ?? items[items.length - 1]?.value ?? null;
      case 'typeahead': {
        const text = normalize(this.currentText.trim());
        return text === '' ? null : (items.find((item) => normalize(item.label).startsWith(text))?.value ?? null);
      }
    }
  }

  private readonly handleInput = (event: Event): void => {
    if (this.isDisabled) {
      return;
    }
    this.showAll = false;
    this.setText((event.currentTarget as HTMLInputElement).value);
    this.requestOpen(true, this.filter === 'none' ? 'typeahead' : 'none');
  };

  /** A click in the input opens the full list, as the toggle does, with the selected option active, else the first. */
  private readonly handleInputClick = (): void => {
    if (this.isDisabled || this.currentOpen) {
      return;
    }
    this.showAll = true;
    this.requestOpen(true, 'selectedOrFirst');
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const isOpen = this.currentOpen;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        // Only the keyboard table's combinations act: Ctrl/Cmd/Shift+Arrow and Alt+ArrowUp are not in it.
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          break;
        }
        const down = event.key === 'ArrowDown';
        if (event.altKey) {
          if (!down) break;
          event.preventDefault();
          // Alt+ArrowDown opens with the selected option active, none when nothing is selected; nothing while open.
          if (!isOpen) this.requestOpen(true, 'selected');
          break;
        }
        event.preventDefault();
        if (!isOpen) {
          this.requestOpen(true, down ? 'selectedOrFirst' : 'selectedOrLast');
        } else {
          // Forwarded without modifiers: the Listbox sees only the keys in this table.
          this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: event.key }));
        }
        break;
      }
      case 'Enter':
        if (!isOpen) break;
        event.preventDefault();
        if (this.activeValue !== null) {
          this.commitRow(this.activeValue);
        } else if (this.allowCustom) {
          this.commitCustom(this.currentText.trim());
        }
        break;
      case ',':
        if (!this.allowCustom) break;
        event.preventDefault();
        this.commitCustom(this.currentText.trim());
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          event.stopPropagation();
          this.requestOpen(false);
        } else if (this.clearable && this.currentText !== '') {
          event.preventDefault();
          this.setText('');
        }
        break;
      case 'Tab':
        // No preventDefault: focus moves on, and the active option is not committed.
        if (isOpen) this.requestOpen(false);
        break;
      case 'Backspace': {
        const selected = this.selectedValues;
        if (this.multiple && this.currentText === '' && selected.length > 0) {
          event.preventDefault();
          this.commitValue(selected.slice(0, -1));
        }
        break;
      }
      default:
        break;
    }
  };

  private readonly handleClearPress = (event: Event): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.setText('');
    if (this.selectedValues.length > 0) {
      this.commitValue(this.multiple ? [] : '');
    }
    this.inputEl?.focus();
  };

  private readonly handleTogglePress = (event: Event): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.inputEl?.focus();
    if (this.currentOpen) {
      this.requestOpen(false);
      return;
    }
    this.showAll = true;
    this.requestOpen(true, 'selectedOrFirst');
  };

  private handleChipRemove(event: Event, entry: string): void {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.commitValue(this.selectedValues.filter((candidate) => candidate !== entry));
    this.inputEl?.focus();
  }

  /** Keeps DOM focus in the input while the pointer works the list. */
  private readonly handlePopupMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };

  /** The Listbox reports no change when the already-selected option is pressed; single-select still closes. */
  private readonly handlePopupClick = (event: MouseEvent): void => {
    const current = this.selectedValues[0];
    if (this.multiple || current === undefined) {
      return;
    }
    const option = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.getAttribute('role') === 'option');
    if (option && option.dataset['value'] === current && option.getAttribute('aria-disabled') !== 'true') {
      this.setText(this.labelFor(current));
      this.requestOpen(false);
    }
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    // Internal to the composition; the host dispatches its own `change`.
    event.stopPropagation();
    const next = event.detail.value;
    if (!Array.isArray(next)) {
      this.commitRow(next);
      return;
    }
    const selected = this.selectedValues;
    const toggled = next.find((entry) => !selected.includes(entry)) ?? selected.find((entry) => !next.includes(entry));
    if (toggled !== undefined) {
      this.commitRow(toggled);
    }
  };

  private readonly handleListboxActiveChange = (event: CustomEvent<ListboxActiveChangeDetail>): void => {
    event.stopPropagation();
    this.activeValue = event.detail.value;
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.requestOpen(false);
    }
  };

  /** Focus leaving the element closes the list. */
  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (this.currentOpen && next instanceof Node && next !== this && !this.contains(next)) {
      this.requestOpen(false);
    }
  };

  private readonly handleReposition = (): void => {
    this.updatePosition();
  };

  /** Commits one row: single selects, shows its label and closes; multiple toggles (selection order), clears the text and stays open. */
  private commitRow(entry: string): void {
    if (entry === CUSTOM_ROW_VALUE && this.showsCustomRow) {
      this.commitCustom(this.currentText.trim());
      return;
    }
    const selected = this.selectedValues;
    if (this.multiple) {
      this.commitValue(
        selected.includes(entry) ? selected.filter((candidate) => candidate !== entry) : [...selected, entry],
      );
      this.setText('');
      this.activeValue = entry;
    } else {
      if (entry !== selected[0]) {
        this.commitValue(entry);
      }
      this.setText(this.labelFor(entry));
      this.requestOpen(false);
    }
  }

  /** Commits typed text as a custom value, or the value of the option it matches by value or label. */
  private commitCustom(typed: string): void {
    if (typed === '') {
      return;
    }
    const key = normalize(typed);
    const match = flattenOptions(this.options).find(
      (item) => normalize(item.value) === key || normalize(item.label) === key,
    );
    if (match?.disabled === true) {
      // The `copy.addCustom` row stays suppressed for a disabled match, and the commit does
      // nothing: neither the disabled value nor a custom string.
      return;
    }
    const text = match?.value ?? typed;
    const selected = this.selectedValues;
    if (this.multiple) {
      if (!selected.includes(text)) {
        this.commitValue([...selected, text]);
      }
      this.setText('');
      this.activeValue = null;
    } else {
      if (text !== selected[0]) {
        this.commitValue(text);
      }
      this.setText(match?.label ?? typed);
      this.requestOpen(false);
    }
  }

  /** Reports new input text; only an uncontrolled element stores it. */
  private setText(next: string): void {
    if (next === this.currentText) {
      return;
    }
    if (this.inputValue === undefined) {
      this.internalText = next;
    } else {
      // Re-render so `live()` restores the controlled text until the property changes.
      this.requestUpdate();
    }
    this.dispatchEvent(
      new CustomEvent<ComboboxInputChangeDetail>('input-change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Reports the new list state; only an uncontrolled element applies it. An open list moves its active option per `intent`. */
  private requestOpen(next: boolean, intent: ActiveIntent = 'selectedOrFirst'): void {
    if (next && this.currentOpen) {
      this.activeValue = this.resolveIntent(intent);
      return;
    }
    if (this.currentOpen === next || (next && this.isDisabled)) {
      return;
    }
    this.openIntent = intent;
    if (this.open === undefined) {
      this.internalOpen = next;
      if (!next) {
        // Hide at once so a Tab computed right after this handler does not land in the list.
        this.hidePopup();
      }
    }
    this.dispatchEvent(
      new CustomEvent<ComboboxOpenChangeDetail>('open-change', { detail: { open: next }, bubbles: true, composed: true }),
    );
  }

  /** Reports a changed value; only an uncontrolled element stores it. */
  private commitValue(next: ComboboxValue): void {
    if (this.value === undefined) {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<ComboboxChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  }

  private showPopup(): void {
    const popup = this.popupEl;
    if (!popup) {
      return;
    }
    if (POPOVER_SUPPORTED && !popup.matches(':popover-open')) {
      popup.showPopover();
    }
    this.addGlobalListeners();
    this.updatePosition();
    void this.listboxEl?.updateComplete.then(() => this.updatePosition());
  }

  private hidePopup(): void {
    this.removeGlobalListeners();
    const popup = this.popupEl;
    if (!popup) {
      return;
    }
    if (POPOVER_SUPPORTED) {
      if (popup.matches(':popover-open')) {
        popup.hidePopover();
      }
    } else if (!popup.hidden) {
      popup.hidden = true;
    }
  }

  private addGlobalListeners(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  private async scrollActiveIntoView(): Promise<void> {
    const listbox = this.listboxEl;
    await listbox?.updateComplete;
    if (this.activeValue === null || !listbox) {
      return;
    }
    listbox.renderRoot
      .querySelector(`[data-part=option][data-value="${CSS.escape(this.activeValue)}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  /** Below the field, flipped above when it would overflow the viewport; at least as wide as the field. */
  private updatePosition(): void {
    const field = this.fieldEl;
    const popup = this.popupEl;
    if (!field || !popup || !this.shown) {
      return;
    }
    const fieldRect = field.getBoundingClientRect();
    const popupHeight = popup.getBoundingClientRect().height;
    const viewportHeight = document.documentElement.clientHeight;
    // popupOffset is the popup's block margin: the resolved length, so the flip test counts it.
    const offset = parseFloat(getComputedStyle(popup).marginBlockStart) || 0;
    const above = fieldRect.bottom + offset + popupHeight > viewportHeight && fieldRect.top - offset - popupHeight >= 0;

    popup.style.top = above ? 'auto' : `${fieldRect.bottom}px`;
    popup.style.bottom = above ? `${viewportHeight - fieldRect.top}px` : 'auto';
    popup.style.left = `${fieldRect.left}px`;
    popup.style.minInlineSize = `${fieldRect.width}px`;
  }

  /** The status message for the open list: loading, empty, or the plural result count. */
  private computeStatus(): string {
    if (!this.currentOpen) {
      return '';
    }
    if (this.isLoading) {
      return COPY_LOADING;
    }
    const count = flattenOptions(this.filteredOptions).length;
    if (count === 0) {
      return COPY_EMPTY;
    }
    const locale = this.closest('[lang]')?.getAttribute('lang') || undefined;
    return new Intl.PluralRules(locale).select(count) === 'one'
      ? COPY_RESULT_COUNT.one(count)
      : COPY_RESULT_COUNT.other(count);
  }

  /** Updates the live region `statusDebounce` after the message last changed. */
  private syncStatus(): void {
    const next = this.computeStatus();
    if (next === this.pendingStatus) {
      return;
    }
    this.pendingStatus = next;
    clearTimeout(this.statusTimer);
    if (next === '') {
      this.statusText = '';
      return;
    }
    const delay = parseDuration(getComputedStyle(this).getPropertyValue(STATUS_DEBOUNCE.token)) * STATUS_DEBOUNCE.multiply;
    this.statusTimer = setTimeout(() => {
      this.statusText = next;
    }, delay);
  }

  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage(): string | null {
    if (this.required && this.selectedValues.length === 0) {
      return COPY_REQUIRED(this.label);
    }
    if (this.errorValue) {
      return this.errorValue;
    }
    if (this.invalid) {
      return COPY_INVALID(this.label);
    }
    return null;
  }

  private syncInternals(): void {
    const selected = this.selectedValues;
    const isDisabled = this.isDisabled;
    if (isDisabled || selected.length === 0 || !this.name) {
      this.internals.setFormValue(null);
    } else if (this.multiple) {
      const data = new FormData();
      for (const entry of selected) {
        data.append(this.name, entry);
      }
      this.internals.setFormValue(data);
    } else {
      this.internals.setFormValue(selected[0]!);
    }

    const message = isDisabled ? null : this.computeValidationMessage();
    const anchor = this.inputEl ?? undefined;
    if (message === null) {
      this.internals.setValidity({});
    } else if (this.required && selected.length === 0) {
      this.internals.setValidity({ valueMissing: true }, message, anchor);
    } else {
      this.internals.setValidity({ customError: true }, message, anchor);
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as (keyof typeof HOOKS)[]) {
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
    'ds-combobox': DsCombobox;
  }
}
