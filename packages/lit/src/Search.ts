import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Icon.js';
import './Button.js';
import './Listbox.js';
import type { IconOverridableBinding, IconSize } from './Icon.js';
import type { DsListbox, ListboxChangeDetail, ListboxOption } from './Listbox.js';
import type { TextOverridableBinding } from './Text.js';

export type SearchSize = 'md' | 'lg';

/** One entry of `suggestions` (anatomy: suggestions). */
export interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}

/** Detail carried by the `change` CustomEvent. */
export interface SearchChangeDetail {
  value: string;
}

/** Detail carried by the `submit` CustomEvent. */
export interface SearchSubmitDetail {
  value: string;
}

/** Detail carried by the `clear` CustomEvent (none). */
export type SearchClearDetail = void;

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `iconColor`, `border`, `borderFocus`,
 * `minTarget` and `focusRingWidth` are locked and excluded.
 */
export type SearchOverridableBinding =
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'suggestionsOffset'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupBorderWidth'
  | 'popupRadius'
  | 'popupShadow'
  | 'layer'
  | 'partGap'
  | 'labelWeight'
  | 'disabledOpacity';

/**
 * `labelWeight` is forwarded to the label Text's `fontWeight` override and has
 * no `--ds-search-*` hook: an unread custom property would look like a working one.
 */
type HookedBinding = Exclude<SearchOverridableBinding, 'labelWeight'>;

const HOOKS: Record<HookedBinding, string> = {
  borderWidth: '--ds-search-border-width',
  radius: '--ds-search-radius',
  paddingInline: '--ds-search-padding-inline',
  paddingBlock: '--ds-search-padding-block',
  affixGap: '--ds-search-affix-gap',
  fontFamily: '--ds-search-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-search-font-size',
  lineHeight: '--ds-search-line-height',
  suggestionsOffset: '--ds-search-suggestions-offset',
  popupSurface: '--ds-search-popup-surface',
  popupBorder: '--ds-search-popup-border',
  popupBorderWidth: '--ds-search-popup-border-width',
  popupRadius: '--ds-search-popup-radius',
  popupShadow: '--ds-search-popup-shadow',
  layer: '--ds-search-layer',
  partGap: '--ds-search-part-gap',
  disabledOpacity: '--ds-search-disabled-opacity',
};

/** Bindings drawn by the suggestions popup; no-ops while `suggestions` is undefined. */
const POPUP_BINDINGS: ReadonlySet<HookedBinding> = new Set<HookedBinding>([
  'suggestionsOffset',
  'popupSurface',
  'popupBorder',
  'popupBorderWidth',
  'popupRadius',
  'popupShadow',
  'layer',
]);

/** copy.clear */
const COPY_CLEAR = 'Clear search';
/** copy.submit */
const COPY_SUBMIT = 'Search';
/** copy.loading */
const COPY_LOADING = 'Loading suggestions';
/** copy.suggestionsCount (plural by `count`) */
const COPY_SUGGESTIONS_COUNT: Record<'one' | 'other', string> = {
  one: '{count} suggestion available',
  other: '{count} suggestions available',
};
/** copy.noSuggestions */
const COPY_NO_SUGGESTIONS = 'No suggestions';

/** constant `statusDebounce`: `motion.duration.base` × 2, read from the token at run time. */
const STATUS_DEBOUNCE = { token: '--motion-duration-base', multiply: 2 } as const;

/** iconColor (locked): color.foreground.muted, forwarded to the leading search Icon's `color` binding only. */
const ICON_OVERRIDES: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
  color: 'color.foreground.muted',
};

/** The glyph keeps its proportion to the text: `sm` at size md, `md` at size lg. */
const GLYPH_SIZE: Record<SearchSize, IconSize> = { md: 'sm', lg: 'md' };

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** Negates a boolean attribute: `no-landmark` present means `landmark` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** A computed `<time>` value (`150ms`, `0.15s`) in milliseconds. */
function parseDuration(value: string): number {
  const text = value.trim();
  const amount = parseFloat(text);
  if (Number.isNaN(amount)) return 0;
  return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount;
}

/**
 * `<ds-search>` — Search (category: input, APG pattern: combobox).
 *
 * `<ds-search label="Search products" action="/search">` renders a shadow
 * `<form role="search">` (the landmark and form parts; `no-landmark` drops the
 * role) with a native `<label for>` holding a `<ds-text>` (visually hidden
 * unless `show-label`), a pill field holding a decorative "search"
 * `<ds-icon>`, an `<input type="search">`, the clear `<ds-button>` while there
 * is text and the submit `<ds-button>`, always rendered.
 *
 * Enter, the submit button and a chosen suggestion dispatch a composed
 * `submit` CustomEvent with the trimmed query; an empty query never submits.
 * When `action` is set the element also submits a light-DOM
 * `<form method="get">` it creates on demand, since the shadow form does not
 * take part in page navigation. Inside `<ds-form>` `action` is ignored.
 *
 * Setting `suggestions` at all (even `[]`) makes the input a combobox: an
 * embedded `<ds-listbox>` in a popup under the field (Popover API, with a
 * `position: fixed` fallback), arrow keys move the highlight while focus stays
 * in the input, and a polite status region announces loading, no suggestions
 * or the count after `motion.duration.base × 2`. The option rows live in the
 * Listbox's own shadow root, which an `aria-activedescendant` IDREF cannot
 * reach, so the highlighted label is exposed through `aria-describedby` on a
 * live element, as `<ds-combobox>` does.
 *
 * `value` is controlled when set (the element reports `change` and waits for
 * the property), uncontrolled from `defaultValue` otherwise. The element is
 * form-associated and carries `data-ds-field` for `<ds-form>`.
 *
 * ## When to use
 *
 * Free-text search over a site, an app, or a large dataset. Add `suggestions`
 * when the backend can offer completions; keep `landmark` on for the one
 * primary search.
 *
 * ## When not to use
 *
 * Not for a specific value (Input), choosing from a known list (Select or
 * Combobox), or an instant filter over a short list already on screen. Never
 * two search landmarks on a page.
 *
 * @fires change - Every keystroke, and whenever Search changes the text itself ("" before `clear`, a chosen label before `submit`); `detail.value` is the query.
 * @fires submit - Enter, the submit button, or a chosen suggestion; `detail.value` is the trimmed query, never empty.
 * @fires clear - The field was emptied by the clear button or Escape.
 */
@customElement('ds-search')
export class DsSearch extends LitElement {
  static formAssociated: boolean = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-search-border-width: var(--border-width-thin);
      --ds-search-radius: var(--radius-full);
      --ds-search-padding-inline: var(--space-md);
      --ds-search-padding-block: var(--space-sm);
      --ds-search-affix-gap: var(--layout-gap-tight);
      --ds-search-font-family: var(--font-family-body);
      --ds-search-font-size: var(--font-size-md);
      --ds-search-line-height: var(--font-line-height-normal);
      --ds-search-suggestions-offset: var(--space-1);
      --ds-search-popup-surface: var(--color-overlay-surface);
      --ds-search-popup-border: var(--color-border);
      --ds-search-popup-border-width: var(--border-width-thin);
      --ds-search-popup-radius: var(--radius-md);
      --ds-search-popup-shadow: var(--shadow-overlay);
      --ds-search-layer: var(--layer-dropdown);
      --ds-search-part-gap: var(--space-1);
      --ds-search-disabled-opacity: var(--opacity-disabled);
      /* Locked bindings: out of the overrides type, but still hooks for page CSS. */
      --ds-search-background: var(--color-control-background);
      --ds-search-foreground: var(--color-foreground);
      --ds-search-placeholder: var(--color-foreground-muted);
      --ds-search-border: var(--color-border-strong);
      --ds-search-border-focus: var(--color-border-focus);
      --ds-search-min-target: var(--size-target-comfortable);
      --ds-search-focus-ring-width: var(--border-width-focus);
      font-family: var(--ds-search-font-family);
      font-size: var(--ds-search-font-size);
      line-height: var(--ds-search-line-height);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock by size: lg → space.md; fontSize: font.size.{size} */
    :host([size='lg']) {
      --ds-search-padding-block: var(--space-md);
      --ds-search-font-size: var(--font-size-lg);
    }

    [data-part='form'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-search-part-gap);
      margin: 0;
    }

    /* disabledOpacity: the label, glyph and input dim; the field frame keeps its
       border and background, and the Buttons dim once through their own
       disabled style rather than through a dimmed ancestor. */
    :host([disabled]) [data-part='label'],
    :host([disabled]) [data-part='icon'],
    :host([disabled]) [data-part='input'] {
      opacity: var(--ds-search-disabled-opacity);
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

    label {
      display: block;
    }

    /* background / border (locked): color.control.background / color.border.strong */
    [data-part='field'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-search-affix-gap);
      inline-size: 100%;
      /* minTarget (locked): size.target.comfortable */
      min-block-size: var(--ds-search-min-target);
      padding-block: var(--ds-search-padding-block);
      padding-inline: var(--ds-search-padding-inline);
      border-style: solid;
      border-width: var(--ds-search-border-width);
      border-color: var(--ds-search-border);
      border-radius: var(--ds-search-radius);
      background: var(--ds-search-background);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* borderFocus + focusRingWidth (locked): only while the input itself is focused; the focus width replaces the border width and padding shrinks by the difference */
    [data-part='field']:has([data-part='input']:focus-visible) {
      border-color: var(--ds-search-border-focus);
      border-width: var(--ds-search-focus-ring-width);
      padding-block: calc(
        var(--ds-search-padding-block) - (var(--ds-search-focus-ring-width) - var(--ds-search-border-width))
      );
      padding-inline: calc(
        var(--ds-search-padding-inline) - (var(--ds-search-focus-ring-width) - var(--ds-search-border-width))
      );
    }

    [data-part='icon'],
    [data-part='clearButton'],
    [data-part='submitButton'] {
      flex: none;
    }

    /* foreground (locked): color.foreground */
    [data-part='input'] {
      flex: 1;
      box-sizing: border-box;
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--ds-search-foreground);
      font: inherit;
      appearance: none;
    }

    :host([disabled]) [data-part='input'] {
      cursor: not-allowed;
    }

    /* placeholder (locked): color.foreground.muted */
    [data-part='input']::placeholder {
      color: var(--ds-search-placeholder);
      opacity: 1;
    }

    /* The system clear Button replaces the browser's own. */
    [data-part='input']::-webkit-search-cancel-button {
      display: none;
    }

    [data-part='suggestions'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      overflow: hidden;
      border-style: solid;
      border-width: var(--ds-search-popup-border-width);
      border-color: var(--ds-search-popup-border);
      border-radius: var(--ds-search-popup-radius);
      background: var(--ds-search-popup-surface);
      box-shadow: var(--ds-search-popup-shadow);
      color: var(--ds-search-foreground);
      z-index: var(--ds-search-layer);
      opacity: 1;
      transition: opacity var(--motion-duration-fast) var(--motion-easing-standard);
    }

    [data-part='suggestions'][hidden] {
      display: none;
    }

    @starting-style {
      [data-part='suggestions'] {
        opacity: 0;
      }
    }

    [data-part='listbox'] {
      display: block;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'],
      [data-part='suggestions'] {
        transition: none;
      }
    }
  `;

  /** The accessible name ("Search products"). Visually hidden unless `showLabel`. */
  @property() accessor label = '';

  /** Show the label above the field, as on a search page rather than in a header. */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) accessor showLabel = false;

  /** Field name; the query key when the form submits to a URL. */
  @property() accessor name = 'q';

  /** Controlled query. Omit for uncontrolled. */
  @property() accessor value: string | undefined;

  /** Initial query for an uncontrolled field. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** Example query, not a label. */
  @property() accessor placeholder: string | undefined;

  /**
   * URL to submit to with GET; when omitted, `submit` handles it and nothing
   * navigates. Ignored, with a development warning, inside `<ds-form>`.
   */
  @property() accessor action: string | undefined;

  /**
   * Suggestions for the current query. Setting the property at all (an empty
   * array included) turns the field into a combobox; undefined keeps a plain
   * search field. A property, not an attribute.
   */
  @property({ attribute: false }) accessor suggestions: SearchSuggestion[] | undefined;

  /** Suggestions are being fetched; announced through `copy.loading`. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Give the form the `search` landmark role. Exposed as the negated attribute `no-landmark`. */
  @property({ attribute: 'no-landmark', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor landmark = true;

  /** `lg` for a search page's hero field. */
  @property({ type: String, reflect: true }) accessor size: SearchSize = 'md';

  /** Not editable, still readable and focusable; inert, fires nothing, and not submitted by a Form. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SearchOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled query, seeded from `defaultValue`. */
  @state() private accessor internalValue = '';

  /** Whether the suggestions popup is open. */
  @state() private accessor open = false;

  /** The highlighted suggestion's value, or null for none (focus is always the input). */
  @state() private accessor activeValue: string | null = null;

  /** The status region's text, updated `statusDebounce` after the wanted text settles. */
  @state() private accessor announcedStatus = '';

  @query('[data-part=input]') private accessor inputEl!: HTMLInputElement | null;
  @query('[data-part=field]') private accessor fieldEl!: HTMLElement | null;
  @query('[data-part=suggestions]') private accessor popupEl!: HTMLElement | null;
  @query('[data-part=listbox]') private accessor listboxEl!: DsListbox | null;

  /** A shadow-DOM form never navigates the page, so `action` submits this light-DOM one. */
  private navigationForm: HTMLFormElement | undefined;
  private readonly internals: ElementInternals;
  private shown = false;
  private warnedLabel = false;
  private warnedAction = false;
  private pendingStatus = '';
  private statusTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The value `<ds-form>` collects: the trimmed query ("" when empty, never omitted). */
  get currentValue(): string {
    return this.query.trim();
  }

  /** Search has no required state; present for the `DsFormField` contract. */
  get required(): boolean {
    return false;
  }

  /** Search never fails validation; present for the `DsFormField` contract. */
  get validationMessage(): string {
    return '';
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** The query as shown, controlled or not. */
  private get query(): string {
    return this.value ?? this.internalValue;
  }

  private get isCombobox(): boolean {
    return this.suggestions !== undefined;
  }

  /**
   * Inside `<ds-form>` the enclosing Form owns submission. The walk crosses
   * shadow boundaries through `getRootNode().host`, since a Search composed
   * into another element's shadow root is still inside the light-DOM Form that
   * element sits in, and `closest()` alone stops at the shadow boundary.
   */
  private get insideForm(): boolean {
    let node: Element | null = this;
    while (node) {
      if (node.closest('ds-form') !== null) {
        return true;
      }
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return false;
  }

  /** What the Listbox shows: nothing while loading, so its empty row carries `copy.loading`. */
  private get listOptions(): ListboxOption[] {
    if (this.loading) {
      return [];
    }
    return (this.suggestions ?? []).map((item) => ({
      value: item.value,
      label: item.label,
      description: item.description,
    }));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Search');
    this.setAttribute('data-ds-field', '');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    clearTimeout(this.statusTimer);
    this.shown = false;
  }

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }

  /** Always valid: Search has no required or invalid state. */
  checkValidity(): boolean {
    return true;
  }

  reportValidity(): boolean {
    return true;
  }

  formResetCallback(): void {
    this.internalValue = this.defaultValue ?? '';
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue ?? '';
    }
    if (changed.has('overrides') || changed.has('suggestions')) {
      this.applyOverrides();
    }
    if (!this.isCombobox || this.disabled) {
      this.open = false;
    }
    if (!this.open) {
      this.activeValue = null;
    } else if (this.activeValue !== null && !this.listOptions.some((item) => item.value === this.activeValue)) {
      this.activeValue = null;
    }
    this.scheduleStatus(this.statusText());
  }

  protected override updated(): void {
    this.internals.setFormValue(this.disabled ? null : this.currentValue);
    if (this.open && !this.shown) {
      this.shown = true;
      this.showPopup();
    } else if (!this.open && this.shown) {
      this.shown = false;
      this.hidePopup();
    } else if (this.open) {
      this.updatePosition();
    }
    if (this.listboxEl && this.listboxEl.activeValue !== this.activeValue) {
      this.listboxEl.activeValue = this.activeValue;
    }
    if (import.meta.env.DEV) {
      if (!this.warnedLabel && !this.label) {
        this.warnedLabel = true;
        console.warn('<ds-search> requires a `label`.', this);
      }
      if (!this.warnedAction && this.action && this.insideForm) {
        this.warnedAction = true;
        console.warn('<ds-search> ignores `action` inside <ds-form>: the enclosing Form owns submission.', this);
      }
    }
  }

  protected override render(): TemplateResult {
    const value = this.query;
    const combobox = this.isCombobox;
    const activeLabel = this.activeItem()?.label ?? '';
    const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontWeight: this.overrides?.labelWeight ?? 'font.weight.medium',
      fontSize: this.overrides?.fontSize ?? (`font.size.${this.size}` as TokenRef),
    };

    return html`
      <form
        data-part="form"
        part="form"
        role=${ifDefined(this.landmark ? 'search' : undefined)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        @submit=${this.handleFormSubmit}
        @focusout=${this.handleFocusOut}
      >
        <label class=${classMap({ 'visually-hidden': !this.showLabel })} for="input"
          ><ds-text data-part="label" part="label" element="span" .overrides=${labelOverrides}
            >${this.label}</ds-text
          ></label
        >
        <div data-part="field" part="field">
          <ds-icon
            data-part="icon"
            part="icon"
            name="search"
            size=${GLYPH_SIZE[this.size]}
            .overrides=${ICON_OVERRIDES}
          ></ds-icon>
          <input
            id="input"
            data-part="input"
            part="input"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            role=${combobox ? 'combobox' : 'searchbox'}
            aria-autocomplete=${ifDefined(combobox ? 'list' : undefined)}
            aria-expanded=${ifDefined(combobox ? String(this.open) : undefined)}
            aria-controls=${ifDefined(combobox && this.open ? 'suggestions' : undefined)}
            aria-describedby=${ifDefined(activeLabel ? 'active-option' : undefined)}
            aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(value)}
            ?readonly=${this.disabled}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
          />
          ${value !== ''
            ? html`<ds-button
                data-part="clearButton"
                part="clearButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_CLEAR}
                ?disabled=${this.disabled}
                @press=${this.handleClearPress}
                ><ds-icon slot="leading-icon" name="close"></ds-icon
              ></ds-button>`
            : nothing}
          <ds-button
            data-part="submitButton"
            part="submitButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_SUBMIT}
            ?disabled=${this.disabled}
            @press=${this.handleSubmitPress}
            ><ds-icon slot="leading-icon" name="arrow-right"></ds-icon
          ></ds-button>
        </div>
        <span id="active-option" class="visually-hidden" aria-live="polite">${activeLabel}</span>
        <div id="status" data-part="status" class="visually-hidden" role="status" aria-live="polite">
          ${this.announcedStatus}
        </div>
        ${combobox
          ? html`<div
              data-part="suggestions"
              part="suggestions"
              popover=${ifDefined(POPOVER_SUPPORTED ? 'manual' : undefined)}
              ?hidden=${!POPOVER_SUPPORTED && !this.open}
              @mousedown=${this.handlePopupMouseDown}
            >
              <ds-listbox
                id="suggestions"
                data-part="listbox"
                label=${this.label}
                embedded
                .value=${''}
                .options=${this.listOptions}
                .selectionFollowsFocus=${false}
                empty-message=${this.loading ? COPY_LOADING : COPY_NO_SUGGESTIONS}
                @change=${this.handleListboxChange}
                @active-change=${this.stopInternalEvent}
              ></ds-listbox>
            </div>`
          : nothing}
      </form>
    `;
  }

  private readonly handleInput = (event: Event): void => {
    if (this.disabled) {
      return;
    }
    const next = (event.currentTarget as HTMLInputElement).value;
    if (this.value === undefined) {
      this.internalValue = next;
    } else {
      // Controlled: the input shows the new text only once `value` changes.
      this.requestUpdate();
    }
    if (this.isCombobox) {
      this.open = true;
      this.activeValue = null;
    }
    this.emitChange(next);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      // Every key in the keyboard table is inert; Enter must not submit the shadow form either.
      if (event.key === 'Enter') event.preventDefault();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const active = this.open ? this.activeItem() : undefined;
        if (active) {
          this.chooseSuggestion(active);
        } else {
          this.submitQuery(this.query);
        }
        break;
      }
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          this.open = false;
        } else if (this.query !== '') {
          event.preventDefault();
          this.clearQuery();
        }
        break;
      case 'ArrowDown': {
        if (!this.isCombobox) {
          return;
        }
        event.preventDefault();
        const items = this.listOptions;
        if (!this.open) {
          this.open = true;
          this.activeValue = items[0]?.value ?? null;
          return;
        }
        const index = items.findIndex((item) => item.value === this.activeValue);
        const next = items[Math.min(index + 1, items.length - 1)];
        if (next) {
          this.activeValue = next.value;
        }
        break;
      }
      case 'ArrowUp': {
        if (!this.isCombobox || !this.open || this.activeValue === null) {
          return;
        }
        event.preventDefault();
        const items = this.listOptions;
        const index = items.findIndex((item) => item.value === this.activeValue);
        this.activeValue = index <= 0 ? null : (items[index - 1]?.value ?? null);
        break;
      }
      case 'Tab':
        if (this.open) {
          this.open = false;
        }
        break;
    }
  };

  private readonly handleFormSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    if (!this.disabled) {
      this.submitQuery(this.query);
    }
  };

  private readonly handleSubmitPress = (event: Event): void => {
    event.stopPropagation();
    if (!this.disabled) {
      this.submitQuery(this.query);
    }
  };

  private readonly handleClearPress = (event: Event): void => {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.clearQuery();
    this.inputEl?.focus();
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    event.stopPropagation();
    const item = this.listOptions.find((entry) => entry.value === event.detail.value);
    if (item && !this.disabled) {
      this.chooseSuggestion(item);
    }
  };

  /** A press on a suggestion keeps focus in the input: focus moves by one route only (clear). */
  private readonly handlePopupMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
  };

  private readonly stopInternalEvent = (event: Event): void => {
    event.stopPropagation();
  };

  /** Focus leaving the element (Tab, blur to another control) closes the list. */
  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (this.open && next instanceof Node && next !== this && !this.contains(next) && !this.renderRoot.contains(next)) {
      this.open = false;
    }
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private readonly handleReposition = (): void => {
    this.updatePosition();
  };

  private activeItem(): ListboxOption | undefined {
    return this.activeValue === null ? undefined : this.listOptions.find((item) => item.value === this.activeValue);
  }

  private emitChange(value: string): void {
    this.dispatchEvent(
      new CustomEvent<SearchChangeDetail>('change', { detail: { value }, bubbles: true, composed: true }),
    );
  }

  /** Fills the query with the suggestion's label, what the user just read, reports it, and submits it. */
  private chooseSuggestion(item: ListboxOption): void {
    if (this.value === undefined) {
      this.internalValue = item.label;
    }
    // Focus stays where it is after a choice.
    this.open = false;
    this.emitChange(item.label);
    this.submitQuery(item.label);
  }

  /** Empties the field: `change("")`, then `clear`. */
  private clearQuery(): void {
    if (this.query === '') {
      return;
    }
    if (this.value === undefined) {
      this.internalValue = '';
    }
    this.open = false;
    this.emitChange('');
    this.dispatchEvent(new CustomEvent<SearchClearDetail>('clear', { bubbles: true, composed: true }));
  }

  /** Dispatches `submit` with the trimmed query and, with `action` outside `<ds-form>`, submits the light-DOM GET form. Never an empty query. */
  private submitQuery(query: string): void {
    const trimmed = query.trim();
    if (trimmed === '') {
      return;
    }
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<SearchSubmitDetail>('submit', { detail: { value: trimmed }, bubbles: true, composed: true }),
    );
    if (this.action && !this.insideForm) {
      this.submitNavigationForm(this.action, trimmed);
    }
  }

  private submitNavigationForm(action: string, query: string): void {
    let form = this.navigationForm;
    if (!form) {
      form = document.createElement('form');
      form.method = 'get';
      form.hidden = true;
      const field = document.createElement('input');
      field.type = 'hidden';
      form.append(field);
      this.navigationForm = form;
    }
    if (!form.isConnected) {
      this.append(form);
    }
    form.action = action;
    // The query key lives on this hidden input, never on the visible one: the URL
    // must carry the trimmed query (the controlled value or the chosen label),
    // not whatever text the input happens to hold.
    const field = form.firstElementChild as HTMLInputElement;
    field.name = this.name;
    field.value = query;
    // `submit()` fires no native `submit` event, which would otherwise bubble through the host beside the CustomEvent.
    form.submit();
  }

  /**
   * Loading whenever `suggestions` is set and `loading` is true, list open or
   * not (a fetch the user triggered is worth hearing about); no suggestions or
   * the plural count only while the list is open.
   */
  private statusText(): string {
    if (this.isCombobox && this.loading && !this.disabled) {
      return COPY_LOADING;
    }
    if (!this.open) {
      return '';
    }
    const count = this.listOptions.length;
    if (count === 0) {
      return COPY_NO_SUGGESTIONS;
    }
    const locale = this.nearestLang() || navigator.language;
    const form = new Intl.PluralRules(locale).select(count) === 'one' ? 'one' : 'other';
    return COPY_SUGGESTIONS_COUNT[form].replace('{count}', String(count));
  }

  /** The `lang` of the nearest ancestor that sets one, crossing shadow roots. */
  private nearestLang(): string {
    let node: Element | null = this;
    while (node) {
      const lang = node.closest('[lang]')?.getAttribute('lang');
      if (lang) {
        return lang;
      }
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : null;
    }
    return '';
  }

  /** Writes the status region `statusDebounce` after the wanted text last changed; clears it at once. */
  private scheduleStatus(next: string): void {
    if (next === this.pendingStatus) {
      return;
    }
    this.pendingStatus = next;
    clearTimeout(this.statusTimer);
    if (next === '') {
      this.announcedStatus = '';
      return;
    }
    const delay = parseDuration(getComputedStyle(this).getPropertyValue(STATUS_DEBOUNCE.token)) * STATUS_DEBOUNCE.multiply;
    if (delay <= 0) {
      // No theme loaded (or a stylesheet that does not carry the token): announce at once.
      this.announcedStatus = next;
      return;
    }
    this.statusTimer = setTimeout(() => {
      this.announcedStatus = next;
    }, delay);
  }

  private showPopup(): void {
    const popup = this.popupEl;
    if (!popup) {
      return;
    }
    if (POPOVER_SUPPORTED && !popup.matches(':popover-open')) {
      popup.showPopover();
    }
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
    this.updatePosition();
    void this.listboxEl?.updateComplete.then(() => this.updatePosition());
  }

  private hidePopup(): void {
    this.removeGlobalListeners();
    const popup = this.popupEl;
    if (POPOVER_SUPPORTED && popup?.matches(':popover-open')) {
      popup.hidePopover();
    }
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  /** Anchors the popup under the field, flipping above it when it would overflow the viewport. */
  private updatePosition(): void {
    const field = this.fieldEl;
    const popup = this.popupEl;
    if (!field || !popup || !this.shown) {
      return;
    }
    const fieldRect = field.getBoundingClientRect();
    const popupHeight = popup.getBoundingClientRect().height;
    const viewportHeight = document.documentElement.clientHeight;
    // suggestionsOffset is folded into the popup's own position (never a margin
    // applied afterwards): place it below first, then read the resolved offset back.
    const offsetRef = `var(${HOOKS.suggestionsOffset})`;
    popup.style.bottom = 'auto';
    popup.style.top = `calc(${fieldRect.bottom}px + ${offsetRef})`;
    const offset = Math.max(0, parseFloat(getComputedStyle(popup).top) - fieldRect.bottom) || 0;
    const above = fieldRect.bottom + offset + popupHeight > viewportHeight && fieldRect.top - offset - popupHeight >= 0;

    if (above) {
      popup.style.top = 'auto';
      popup.style.bottom = `calc(${viewportHeight - fieldRect.top}px + ${offsetRef})`;
    }
    popup.style.left = `${fieldRect.left}px`;
    popup.style.minInlineSize = `${fieldRect.width}px`;
  }

  /** Sets each overridden hook; popup bindings apply only while the popup exists. */
  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as HookedBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined || (!this.isCombobox && POPUP_BINDINGS.has(binding))) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-search': DsSearch;
  }
}
