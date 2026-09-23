import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Listbox.js';
import './Text.js';
import type { IconOverridableBinding } from './Icon.js';
import type {
  DsListbox,
  ListboxActiveChangeDetail,
  ListboxChangeDetail,
  ListboxGroup,
  ListboxOption,
  ListboxItem,
  ListboxOverridableBinding,
} from './Listbox.js';
import type { TextOverridableBinding } from './Text.js';

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
 * `triggerBorder`, `triggerBorderFocus`, `valueColor`, `placeholderColor`,
 * `chevron`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm` and
 * `focusRingWidth` are locked and excluded.
 */
export type SelectOverridableBinding =
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
  | 'chevronReserve'
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
  | 'fontWeight'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

/**
 * The bindings with a `:host` hook. `labelWeight` and `helperSize` reach the
 * composed Texts only through their `overrides`, so they declare none.
 */
type HookedBinding = Exclude<SelectOverridableBinding, 'labelWeight' | 'helperSize'>;

const HOOKS: Record<HookedBinding, string> = {
  triggerBorderInvalid: '--ds-select-trigger-border-invalid',
  triggerBorderWidth: '--ds-select-trigger-border-width',
  triggerRadius: '--ds-select-trigger-radius',
  triggerPaddingInline: '--ds-select-trigger-padding-inline',
  triggerPaddingBlock: '--ds-select-trigger-padding-block',
  triggerGap: '--ds-select-trigger-gap',
  chevronReserve: '--ds-select-chevron-reserve',
  partGap: '--ds-select-part-gap',
  popupSurface: '--ds-select-popup-surface',
  popupBorder: '--ds-select-popup-border',
  popupBorderWidth: '--ds-select-popup-border-width',
  popupShadow: '--ds-select-popup-shadow',
  popupRadius: '--ds-select-popup-radius',
  popupOffset: '--ds-select-popup-offset',
  layer: '--ds-select-layer',
  fontFamily: '--ds-select-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-select-font-size',
  fontWeight: '--ds-select-font-weight',
  lineHeight: '--ds-select-line-height',
  disabledOpacity: '--ds-select-disabled-opacity',
  enter: '--ds-select-enter',
};

/**
 * The doc's `copy.*`, verbatim. `done` is the phone sheet's footer button: only
 * the React Native picker renders it, web and Lit declare the key and never
 * show it.
 */
const COPY = {
  placeholder: 'Select…',
  selectedCount: '{count} selected',
  done: 'Done',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
} as const;

/** `copy.selectedCount` — one string, the count formatted for the runtime's locale, never concatenated. */
const COPY_SELECTED_COUNT = (count: number): string =>
  COPY.selectedCount.replace('{count}', new Intl.NumberFormat().format(count));

/** `copy.required` / `copy.invalid`, which name the field. */
const COPY_REQUIRED = (label: string): string => COPY.required.replace('{label}', label);
const COPY_INVALID = (label: string): string => COPY.invalid.replace('{label}', label);

/** chevron (locked): color.foreground.muted, forwarded to the composed Icon's `color` binding. */
const CHEVRON_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.foreground.muted',
};

/**
 * Forward defaults. Every forward into a composed child carries the resolved
 * token — the consumer's override, else this default — because the children
 * have no size or weight prop that would reproduce the Select's own bindings.
 */
const FONT_FAMILY: TokenRef = 'font.family.body'; // literal-ok: a TokenRef forwarded to Text, not a font stack
const LINE_HEIGHT: TokenRef = 'font.lineHeight.normal';
/** helperSize: font.size.sm */
const HELPER_SIZE: TokenRef = 'font.size.sm';
/** labelWeight: font.weight.medium */
const LABEL_WEIGHT: TokenRef = 'font.weight.medium';
/** fontWeight: font.weight.regular — the trigger's value text only. */
const VALUE_WEIGHT: TokenRef = 'font.weight.regular';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

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

function sameValue(a: SelectValue | null, b: SelectValue | null): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((entry, index) => entry === b[index]);
  }
  return a === b;
}

/**
 * `<ds-select>` — Select (category: input, APG pattern: combobox, select-only).
 *
 * `<ds-select label="Country" name="country" .options=${options}>` renders a
 * `<label for>` wrapping `<ds-text>`, a `<button role="combobox"
 * aria-haspopup="listbox">` trigger showing the value and a `chevron-down`
 * `<ds-icon>`, and a popup wrapping an embedded `<ds-listbox>`. The popup uses
 * the Popover API (`popover="manual"`) when available and a `position: fixed`
 * fallback on `layer.dropdown` otherwise, placed below the trigger (flipped
 * above at the viewport edge) and at least as wide as it.
 *
 * DOM focus stays on the trigger while the popup is open: its keys are
 * forwarded to the Listbox's `handleKey`. `aria-activedescendant` cannot reach
 * an option inside the Listbox's shadow root, so the active option's label is
 * exposed through `aria-describedby` on a live element instead.
 *
 * `value` and `open` are controlled when set (the element reports `change` /
 * `open-change` and waits for the property), uncontrolled from `defaultValue`
 * and an internal closed state otherwise. The element is form-associated
 * (`setFormValue`, a `FormData` with one entry per value for `multiple`) and
 * carries `data-ds-field` for `<ds-form>`. `native="always"` renders a native
 * `<select>` with the same label, description and error wiring and no popup;
 * `auto` and `never` both render the popup on web.
 *
 * ## When to use
 *
 * A form field with about seven to fifty options people recognise on sight;
 * `multiple` for tags or memberships when a set of Checkboxes would be too long.
 *
 * ## When not to use
 *
 * Not for two to six options (RadioGroup), actions (Menu), switching modes
 * (SegmentedControl) or on/off (Switch). Use Combobox when typing to filter is
 * faster than scrolling.
 *
 * @fires change - The value changed; `detail.value` (an array with `multiple`).
 * @fires open-change - The popup opened or closed; `detail.open`.
 */
@customElement('ds-select')
export class DsSelect extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-select-trigger-border-invalid: var(--color-border-danger);
      --ds-select-trigger-border-width: var(--border-width-thin);
      --ds-select-trigger-radius: var(--radius-md);
      --ds-select-trigger-padding-inline: var(--space-md);
      --ds-select-trigger-padding-block: var(--space-sm);
      --ds-select-trigger-gap: var(--layout-gap-normal);
      --ds-select-chevron-reserve: var(--font-size-sm);
      --ds-select-part-gap: var(--space-1);
      --ds-select-popup-surface: var(--color-overlay-surface);
      --ds-select-popup-border: var(--color-border);
      --ds-select-popup-border-width: var(--border-width-thin);
      --ds-select-popup-shadow: var(--shadow-overlay);
      --ds-select-popup-radius: var(--radius-md);
      --ds-select-popup-offset: var(--space-1);
      --ds-select-layer: var(--layer-dropdown);
      --ds-select-font-family: var(--font-family-body);
      --ds-select-font-size: var(--font-size-md);
      --ds-select-font-weight: var(--font-weight-regular);
      --ds-select-line-height: var(--font-line-height-normal);
      --ds-select-disabled-opacity: var(--opacity-disabled);
      --ds-select-enter: var(--motion-duration-fast);
      /* Locked bindings: out of the overrides type, but still themeable from page CSS. */
      --ds-select-trigger-background: var(--color-background);
      --ds-select-trigger-border: var(--color-border-strong);
      --ds-select-trigger-border-focus: var(--color-border-focus);
      --ds-select-min-target: var(--size-target-comfortable);
      --ds-select-min-target-sm: var(--size-target-min);
      --ds-select-focus-ring-width: var(--border-width-focus);
      /* Realised by the composed Texts' tones (default / muted / muted / danger); declared for the
         naming codemod, not read here, since a hook cannot reach a child's shadow tree. */
      --ds-select-value-color: var(--color-foreground);
      --ds-select-placeholder-color: var(--color-foreground-muted);
      --ds-select-description-text: var(--color-foreground-muted);
      --ds-select-error-text: var(--color-foreground-danger);
      font-family: var(--ds-select-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* triggerPaddingBlock: by size (sm → space.1); fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-select-trigger-padding-block: var(--space-1);
      --ds-select-font-size: var(--font-size-sm);
    }

    .group {
      display: grid;
      gap: var(--ds-select-part-gap);
    }

    /* disabledOpacity: the whole field dims, as Input does */
    .group.disabled {
      opacity: var(--ds-select-disabled-opacity);
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

    /* The <label for> wraps the composed Text, which carries data-part="label". */
    label {
      display: block;
    }

    /* triggerBackground / triggerBorder: color.background / color.border.strong, locked */
    [data-part='trigger'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-select-trigger-gap);
      inline-size: 100%;
      /* minTarget: size.target.comfortable, locked */
      min-block-size: var(--ds-select-min-target);
      margin: 0;
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border-style: solid;
      border-width: var(--ds-select-trigger-border-width);
      border-color: var(--ds-select-trigger-border);
      border-radius: var(--ds-select-trigger-radius);
      background: var(--ds-select-trigger-background);
      color: var(--color-foreground);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      font-weight: var(--ds-select-font-weight);
      line-height: var(--ds-select-line-height);
      text-align: start;
      cursor: pointer;
    }

    /* minTargetSm: size.target.min, locked — the trigger floor at sm */
    :host([size='sm']) [data-part='trigger'] {
      min-block-size: var(--ds-select-min-target-sm);
    }

    /* triggerBorderFocus + focusRingWidth (locked): the focus width replaces the border width; padding
       shrinks by the difference, unclamped, so the trigger does not shift */
    [data-part='trigger']:focus-visible {
      outline: none;
      border-color: var(--ds-select-trigger-border-focus);
      border-width: var(--ds-select-focus-ring-width);
      padding-block: calc(
        var(--ds-select-trigger-padding-block) - (var(--ds-select-focus-ring-width) - var(--ds-select-trigger-border-width))
      );
      padding-inline: calc(
        var(--ds-select-trigger-padding-inline) - (var(--ds-select-focus-ring-width) - var(--ds-select-trigger-border-width))
      );
    }

    :host([invalid]) [data-part='trigger'],
    :host([invalid]) [data-part='trigger']:focus-visible {
      border-color: var(--ds-select-trigger-border-invalid);
    }

    .group.disabled [data-part='trigger'] {
      cursor: not-allowed;
    }

    /* valueColor / placeholderColor (locked): the composed Text's default / muted tone */
    [data-part='value'] {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    [data-part='chevron'] {
      flex: none;
    }

    [data-part='popup'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      /* popupOffset: the gap on the side the popup opens */
      margin: 0;
      margin-block: var(--ds-select-popup-offset);
      padding: 0;
      overflow: hidden;
      border-style: solid;
      border-width: var(--ds-select-popup-border-width);
      border-color: var(--ds-select-popup-border);
      border-radius: var(--ds-select-popup-radius);
      background: var(--ds-select-popup-surface);
      box-shadow: var(--ds-select-popup-shadow);
      color: var(--color-foreground);
      z-index: var(--ds-select-layer);
      opacity: 1;
      /* enter: popup fade */
      transition: opacity var(--ds-select-enter) var(--motion-easing-standard);
    }

    @starting-style {
      [data-part='popup'] {
        opacity: 0;
      }
    }

    [data-part='listbox'] {
      display: block;
    }

    .native {
      display: grid;
    }

    .native > * {
      grid-area: 1 / 1;
    }

    .native [data-part='trigger'] {
      display: block;
      appearance: none;
    }

    /* chevronReserve: the inline-end space the native <select> leaves for the chevron glyph, added
       to triggerPaddingInline and triggerGap. Single only — <select multiple> has no dropdown. */
    :host(:not([multiple])) .native [data-part='trigger'] {
      padding-inline-end: calc(
        var(--ds-select-trigger-padding-inline) + var(--ds-select-trigger-gap) + var(--ds-select-chevron-reserve)
      );
    }

    :host(:not([multiple])) .native [data-part='trigger']:focus-visible {
      padding-inline-end: calc(
        var(--ds-select-trigger-padding-inline) + var(--ds-select-trigger-gap) + var(--ds-select-chevron-reserve) -
          (var(--ds-select-focus-ring-width) - var(--ds-select-trigger-border-width))
      );
    }

    .native-chevron {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-inline: var(--ds-select-trigger-padding-inline);
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='popup'] {
        transition: none;
      }
    }
  `;

  /** Visible label. Always rendered. */
  @property() accessor label = '';

  /** Field name for the Form. */
  @property() accessor name = '';

  /** The options, passed through to the Listbox. A property, not an attribute. */
  @property({ attribute: false }) accessor options: ListboxItem[] = [];

  /** Controlled value (array with `multiple`). Omit for an uncontrolled field. */
  @property({ attribute: false }) accessor value: SelectValue | undefined;

  /** Initial value (array with `multiple`). */
  @property({ attribute: false }) accessor defaultValue: SelectValue | undefined;

  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  @property() accessor placeholder: string | undefined;

  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** sm for pickers inside toolbars and calendar headers. */
  @property({ type: String, reflect: true }) accessor size: SelectSize = 'md';

  /** Controlled popup state. Omit for the trigger-driven default. */
  @property({ type: Boolean }) accessor open: boolean | undefined;

  /** Pick any number. The trigger shows the labels (two or fewer) or `copy.selectedCount`; the popup stays open while toggling. */
  @property({ type: Boolean, reflect: true }) accessor multiple = false;

  /** Helper text under the label. */
  @property() accessor description: string | undefined;

  /** Must have a value to submit. Shown in the label, not only by color. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Not openable and not submitted. Stays visible and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field invalid. Usually set by the Form. */
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

  /** `auto` and `never` render the styled popup on web; `always` renders a native `<select>`. */
  @property({ type: String, reflect: true }) accessor native: SelectNative = 'auto';

  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SelectOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled value, seeded from `defaultValue`. */
  @state() private accessor internalValue: SelectValue | undefined;

  /** Uncontrolled popup state. */
  @state() private accessor internalOpen = false;

  /** The Listbox's active option while the popup is open. */
  @state() private accessor activeValue: string | null = null;

  /** Disabled by an owning native form or fieldset. */
  @state() private accessor formDisabled = false;

  @query('[data-part=trigger]') private accessor triggerEl!: HTMLElement | null;
  @query('[data-part=popup]') private accessor popupEl!: HTMLElement | null;
  @query('[data-part=listbox]') private accessor listboxEl!: DsListbox | null;

  private readonly internals: ElementInternals;
  private shown = false;
  private warned = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.addEventListener('focusout', this.handleFocusOut);
  }

  private get flatItems(): ListboxOption[] {
    return flattenOptions(this.options);
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get usesPopup(): boolean {
    return this.native !== 'always';
  }

  /** Whether the popup is open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  /** `disabled` wins over a controlled `open`: a disabled Select never shows its popup. */
  private get showsPopup(): boolean {
    return this.usesPopup && this.currentOpen && !this.isDisabled;
  }

  /** The current selection: a value, an array with `multiple`, or null when nothing is selected. */
  get currentValue(): SelectValue | null {
    const value = this.value !== undefined ? this.value : this.internalValue;
    if (this.multiple) {
      const list = Array.isArray(value) ? value : typeof value === 'string' && value !== '' ? [value] : [];
      return list.length > 0 ? list : null;
    }
    const single = Array.isArray(value) ? value[0] : value;
    return typeof single === 'string' && single !== '' ? single : null;
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
    this.setAttribute('data-ds', 'Select');
    this.setAttribute('data-ds-field', '');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    this.shown = false;
  }

  override focus(options?: FocusOptions): void {
    this.triggerEl?.focus(options);
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

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    const isOpen = this.showsPopup;
    if (isOpen && !this.shown) {
      // The popup opens with the selected (or first) option active.
      this.activeValue = this.defaultActiveValue();
    } else if (!isOpen) {
      this.activeValue = null;
    }
  }

  protected override updated(): void {
    this.syncInternals();
    const isOpen = this.showsPopup;
    if (isOpen && !this.shown) {
      this.shown = true;
      this.showPopup();
    } else if (!isOpen && this.shown) {
      this.shown = false;
      this.hidePopup();
    }
    if (import.meta.env.DEV && !this.warned) {
      this.warned = true;
      if (!this.label) console.warn('<ds-select> requires a `label`.', this);
      if (!this.name) console.warn('<ds-select> requires a `name`.', this);
    }
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const message = this.errorValue || (this.invalid ? COPY_INVALID(this.label) : '');
    const describedBy = [
      this.description ? 'description' : '',
      message ? 'error' : '',
      this.showsPopup ? 'active-option' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const o = this.overrides;
    const helperOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontSize: o?.helperSize ?? HELPER_SIZE,
      fontFamily: o?.fontFamily ?? FONT_FAMILY,
      lineHeight: o?.lineHeight ?? LINE_HEIGHT,
    };
    // fontSize: font.size.{size}, so the label and value follow `size` unless overridden.
    const fontSize: TokenRef = o?.fontSize ?? (`font.size.${this.size}` as TokenRef);
    const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontWeight: o?.labelWeight ?? LABEL_WEIGHT,
      fontSize,
      fontFamily: o?.fontFamily ?? FONT_FAMILY,
      lineHeight: o?.lineHeight ?? LINE_HEIGHT,
    };

    return html`
      <div class=${classMap({ group: true, disabled: isDisabled })}>
        <label
          id="label"
          for="trigger"
          class=${classMap({ 'visually-hidden': this.hideLabel })}
          @click=${this.handleLabelClick}
          ><ds-text data-part="label" part="label" element="span" weight="medium" .overrides=${labelOverrides}
            >${this.label}${this.required ? COPY.requiredIndicator : nothing}</ds-text
          ></label
        >
        ${this.description
          ? html`<ds-text
              id="description"
              data-part="description"
              part="description"
              element="span"
              size="sm"
              tone="muted"
              .overrides=${helperOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        ${this.usesPopup
          ? this.renderPopupField(isDisabled, describedBy, fontSize)
          : this.renderNativeField(isDisabled, describedBy)}
        ${message
          ? html`<ds-text
              id="error"
              role="alert"
              data-part="errorMessage"
              part="errorMessage"
              element="span"
              size="sm"
              tone="danger"
              .overrides=${helperOverrides}
              >${message}</ds-text
            >`
          : nothing}
      </div>
    `;
  }

  private renderPopupField(isDisabled: boolean, describedBy: string, fontSize: TokenRef): TemplateResult {
    const o = this.overrides;
    const valueOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontSize,
      fontWeight: o?.fontWeight ?? VALUE_WEIGHT,
      fontFamily: o?.fontFamily ?? FONT_FAMILY,
      lineHeight: o?.lineHeight ?? LINE_HEIGHT,
    };
    // fontSize is not forwarded: the popup does not follow `size`, so options keep Listbox's own.
    const listboxOverrides: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> = {
      fontFamily: o?.fontFamily ?? FONT_FAMILY,
      lineHeight: o?.lineHeight ?? LINE_HEIGHT,
    };
    const isOpen = this.showsPopup;
    const labels = this.displayLabels();
    const text =
      labels.length === 0
        ? this.placeholder || COPY.placeholder
        : labels.length <= 2
          ? labels.join(', ')
          : COPY_SELECTED_COUNT(labels.length);
    const activeLabel =
      this.activeValue === null ? '' : (this.flatItems.find((item) => item.value === this.activeValue)?.label ?? '');

    return html`
      <button
        id="trigger"
        data-part="trigger"
        part="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${isOpen ? 'true' : 'false'}
        aria-controls="popup"
        aria-labelledby="label"
        aria-describedby=${ifDefined(describedBy || undefined)}
        aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        <ds-text
          id="value"
          data-part="value"
          part="value"
          element="span"
          tone=${labels.length === 0 ? 'muted' : 'default'}
          .overrides=${valueOverrides}
          >${text}</ds-text
        >
        <ds-icon
          data-part="chevron"
          part="chevron"
          name="chevron-down"
          size="sm"
          .overrides=${CHEVRON_OVERRIDES}
        ></ds-icon>
      </button>
      <span id="active-option" class="visually-hidden" aria-live="polite">${isOpen ? activeLabel : ''}</span>
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
          embedded
          label=${this.label}
          .labelledBy=${'label'}
          .selectionFollowsFocus=${false}
          .options=${this.options}
          .value=${this.multiple ? (this.currentValue ?? []) : (this.currentValue ?? '')}
          .initialActiveValue=${this.activeValue ?? undefined}
          .activeValue=${this.activeValue}
          .overrides=${listboxOverrides}
          ?multiple=${this.multiple}
          @change=${this.handleListboxChange}
          @active-change=${this.handleListboxActiveChange}
        ></ds-listbox>
      </div>
    `;
  }

  private renderNativeField(isDisabled: boolean, describedBy: string): TemplateResult {
    const selected = this.selectedSet;
    const renderOptions = (options: ListboxItem[]): unknown[] =>
      options.map((option) =>
        isGroupOption(option)
          ? html`<optgroup label=${option.group}>${renderOptions(option.options)}</optgroup>`
          : html`<option
              value=${option.value}
              .selected=${live(selected.has(option.value))}
              ?disabled=${option.disabled === true}
            >
              ${option.label}
            </option>`,
      );

    return html`
      <div class="native">
        <select
          id="trigger"
          data-part="trigger"
          part="trigger"
          ?multiple=${this.multiple}
          ?disabled=${isDisabled}
          ?required=${this.required}
          aria-describedby=${ifDefined(describedBy || undefined)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          @change=${this.handleNativeChange}
        >
          ${this.multiple
            ? nothing
            : html`<option value="" .selected=${live(selected.size === 0)}>
                ${this.placeholder || COPY.placeholder}
              </option>`}
          ${renderOptions(this.options)}
        </select>
        ${this.multiple
          ? nothing
          : html`<span class="native-chevron"
              ><ds-icon data-part="chevron" part="chevron" name="chevron-down" size="sm" .overrides=${CHEVRON_OVERRIDES}></ds-icon
            ></span>`}
      </div>
    `;
  }

  private displayLabels(): string[] {
    const value = this.currentValue;
    if (value === null) {
      return [];
    }
    const labelByValue = new Map(this.flatItems.map((item) => [item.value, item.label] as const));
    return (Array.isArray(value) ? value : [value]).map((entry) => labelByValue.get(entry) ?? entry);
  }

  private defaultActiveValue(): string | null {
    const items = this.flatItems.filter((item) => item.disabled !== true);
    const selected = this.selectedSet;
    return (items.find((item) => selected.has(item.value)) ?? items[0])?.value ?? null;
  }

  /** The label focuses the trigger; it never activates it. */
  private readonly handleLabelClick = (event: Event): void => {
    if (!this.usesPopup) {
      return;
    }
    event.preventDefault();
    this.triggerEl?.focus();
  };

  private readonly handleTriggerClick = (): void => {
    if (this.isDisabled) {
      return;
    }
    this.requestOpen(!this.currentOpen, true);
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const key = event.key;

    if (!this.currentOpen) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        this.requestOpen(true, false);
      }
      return;
    }

    switch (key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.requestOpen(false, true);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.multiple) {
          // Listbox's Enter is a no-op with `multiple`, so Select toggles the active option itself.
          this.toggleActive();
        } else {
          this.commitActive();
          this.requestOpen(false, true);
        }
        break;
      case 'Tab':
        // No preventDefault: focus moves on.
        if (!this.multiple) {
          this.commitActive();
        }
        this.requestOpen(false, false);
        break;
      case ' ':
        this.listboxEl?.handleKey(event);
        if (!this.multiple) {
          this.requestOpen(false, true);
        }
        break;
      default:
        this.listboxEl?.handleKey(event);
    }
  };

  /** Keeps DOM focus on the trigger while the pointer works the list. */
  private readonly handlePopupMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private readonly handlePopupClick = (event: MouseEvent): void => {
    if (this.multiple) {
      return;
    }
    const option = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.getAttribute('role') === 'option');
    if (option && option.getAttribute('aria-disabled') !== 'true') {
      this.requestOpen(false, true);
    }
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    // Internal to the composition; the host dispatches its own `change`.
    event.stopPropagation();
    this.commitValue(event.detail.value);
  };

  private readonly handleListboxActiveChange = (event: CustomEvent<ListboxActiveChangeDetail>): void => {
    event.stopPropagation();
    this.activeValue = event.detail.value;
  };

  private readonly handleNativeChange = (event: Event): void => {
    const select = event.currentTarget as HTMLSelectElement;
    this.commitValue(
      this.multiple ? Array.from(select.selectedOptions, (option) => option.value) : select.value,
    );
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.requestOpen(false, false);
    }
  };

  /** Focus leaving the element closes the popup. */
  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (this.showsPopup && next instanceof Node && next !== this && !this.contains(next)) {
      this.requestOpen(false, false);
    }
  };

  private readonly handleReposition = (): void => {
    this.updatePosition();
  };

  /** Single-select: commits the active option. */
  private commitActive(): void {
    const item = this.flatItems.find((candidate) => candidate.value === this.activeValue);
    if (item && item.disabled !== true) {
      this.commitValue(item.value);
    }
  }

  /** `multiple`: toggles the active option, keeping the value in option order as the Listbox does. */
  private toggleActive(): void {
    const item = this.flatItems.find((candidate) => candidate.value === this.activeValue);
    if (!item || item.disabled === true) {
      return;
    }
    const selected = this.selectedSet;
    if (selected.has(item.value)) {
      selected.delete(item.value);
    } else {
      selected.add(item.value);
    }
    const known = this.flatItems.map((candidate) => candidate.value);
    this.commitValue([
      ...known.filter((value) => selected.has(value)),
      ...[...selected].filter((value) => !known.includes(value)),
    ]);
  }

  /** Reports the new popup state; only an uncontrolled element applies it. */
  private requestOpen(next: boolean, restoreFocus: boolean): void {
    if (this.currentOpen === next || (next && this.isDisabled)) {
      return;
    }
    if (this.open === undefined) {
      this.internalOpen = next;
      if (!next) {
        // Hide at once so a Tab computed right after this handler does not land in the list.
        this.hidePopup();
      }
    }
    this.dispatchEvent(
      new CustomEvent<SelectOpenChangeDetail>('open-change', { detail: { open: next }, bubbles: true, composed: true }),
    );
    if (!next && restoreFocus) {
      this.triggerEl?.focus();
    }
  }

  /** Reports a changed value; only an uncontrolled element stores it. */
  private commitValue(next: SelectValue): void {
    const normalized: SelectValue | null = Array.isArray(next) ? (next.length > 0 ? next : null) : next || null;
    if (sameValue(normalized, this.currentValue)) {
      return;
    }
    if (this.value === undefined) {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<SelectChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
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

  /** Below the trigger, flipped above when it would overflow the viewport; at least as wide as the trigger. */
  private updatePosition(): void {
    const trigger = this.triggerEl;
    const popup = this.popupEl;
    if (!trigger || !popup || !this.shown) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const popupHeight = popup.getBoundingClientRect().height;
    const viewportHeight = document.documentElement.clientHeight;
    // popupOffset is the popup's block margin, resolved by the browser.
    const offset = parseFloat(getComputedStyle(popup).marginBlockStart) || 0;
    const above =
      triggerRect.bottom + offset + popupHeight > viewportHeight && triggerRect.top - offset - popupHeight >= 0;

    popup.style.top = above ? 'auto' : `${triggerRect.bottom}px`;
    popup.style.bottom = above ? `${viewportHeight - triggerRect.top}px` : 'auto';
    popup.style.left = `${triggerRect.left}px`;
    popup.style.minInlineSize = `${triggerRect.width}px`;
  }

  /** Validation in the doc's order: required, then invalid (`error` text, else `copy.invalid`). */
  private computeValidationMessage(): string | null {
    if (this.required && this.currentValue === null) {
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
    const value = this.currentValue;
    const isDisabled = this.isDisabled;
    if (isDisabled || value === null || !this.name) {
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

    const message = isDisabled ? null : this.computeValidationMessage();
    const anchor = this.triggerEl ?? undefined;
    if (message === null) {
      this.internals.setValidity({});
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, message, anchor);
    } else {
      this.internals.setValidity({ customError: true }, message, anchor);
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as HookedBinding[]) {
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
    'ds-select': DsSelect;
  }
}
