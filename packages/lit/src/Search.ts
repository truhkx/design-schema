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
import type { DsListbox, ListboxChangeDetail, ListboxItem } from './Listbox.js';

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
  | 'popupRadius'
  | 'popupShadow'
  | 'partGap'
  | 'disabledOpacity';

const HOOKS: Record<SearchOverridableBinding, string> = {
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
  popupRadius: '--ds-search-popup-radius',
  popupShadow: '--ds-search-popup-shadow',
  partGap: '--ds-search-part-gap',
  disabledOpacity: '--ds-search-disabled-opacity',
};

/** Bindings drawn by the suggestions popup; no-ops while `suggestions` is undefined. */
const POPUP_BINDINGS: ReadonlySet<SearchOverridableBinding> = new Set([
  'suggestionsOffset',
  'popupSurface',
  'popupBorder',
  'popupRadius',
  'popupShadow',
]);

/** copy.clear */
const COPY_CLEAR = 'Clear search';
/** copy.submit */
const COPY_SUBMIT = 'Search';
/** copy.loading */
const COPY_LOADING = 'Loading suggestions';
/** copy.suggestionsCount (plural by `count`) */
const COPY_SUGGESTIONS_COUNT_ONE = '{count} suggestion available';
const COPY_SUGGESTIONS_COUNT_OTHER = '{count} suggestions available';
/** copy.noSuggestions */
const COPY_NO_SUGGESTIONS = 'No suggestions';

/** iconColor (locked): color.foreground.muted, forwarded to the composed Icons' `color` binding. */
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

/**
 * `<ds-search>` — Search (category: input, APG pattern: combobox).
 *
 * `<ds-search label="Search products" action="/search">` renders a shadow
 * `<form role="search">` (the landmark; `no-landmark` drops the role) with a
 * native `<label for>` (visually hidden unless `show-label`), a pill field
 * holding a decorative "search" `<ds-icon>`, an `<input type="search">`, the
 * clear `<ds-button>` while there is text and the submit `<ds-button>`,
 * always rendered.
 *
 * Enter, the submit button and a chosen suggestion dispatch a composed
 * `submit` CustomEvent with the trimmed query; an empty query never submits.
 * When `action` is set the element also submits a light-DOM
 * `<form method="get">` it creates on demand, since the shadow form does not
 * take part in page navigation.
 *
 * Setting `suggestions` at all (even `[]`) makes the input a combobox: an
 * embedded `<ds-listbox>` in a popup under the field (Popover API, with a
 * `position: fixed` fallback), arrow keys move the highlight while focus stays
 * in the input, and a polite status region announces loading, no suggestions
 * or the count. The option rows live in the Listbox's own shadow root, which
 * an `aria-activedescendant` IDREF cannot reach, so the highlighted label is
 * exposed through `aria-describedby` on a live element, as `<ds-combobox>`
 * does.
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
 * @fires change - Every keystroke; `detail.value` is the query as typed.
 * @fires submit - Enter, the submit button, or a chosen suggestion; `detail.value` is the submitted query.
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
      --ds-search-popup-radius: var(--radius-md);
      --ds-search-popup-shadow: var(--shadow-overlay);
      --ds-search-part-gap: var(--space-1);
      --ds-search-disabled-opacity: var(--opacity-disabled);
      font-family: var(--ds-search-font-family);
      font-size: var(--ds-search-font-size);
      line-height: var(--ds-search-line-height);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock by size: lg → space.md */
    :host([size='lg']) {
      --ds-search-padding-block: var(--space-md);
    }

    /* fontSize: font.size.{size} */
    :host([size='lg']) {
      --ds-search-font-size: var(--font-size-lg);
    }

    [data-part='form'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-search-part-gap);
      margin: 0;
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

    /* background / border (locked): color.control.background / color.border.strong */
    [data-part='field'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-search-affix-gap);
      inline-size: 100%;
      /* minTarget (locked): size.target.comfortable */
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-search-padding-block);
      padding-inline: var(--ds-search-padding-inline);
      border-style: solid;
      border-width: var(--ds-search-border-width);
      border-color: var(--color-border-strong);
      border-radius: var(--ds-search-radius);
      background: var(--color-control-background);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* borderFocus + focusRingWidth (locked): the focus width replaces the border width; padding shrinks by the difference */
    [data-part='field']:focus-within {
      border-color: var(--color-border-focus);
      border-width: var(--border-width-focus);
      padding-block: calc(var(--ds-search-padding-block) - (var(--border-width-focus) - var(--ds-search-border-width)));
      padding-inline: calc(
        var(--ds-search-padding-inline) - (var(--border-width-focus) - var(--ds-search-border-width))
      );
    }

    :host([disabled]) [data-part='field'] {
      opacity: var(--ds-search-disabled-opacity);
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
      color: var(--color-foreground);
      font: inherit;
      appearance: none;
    }

    :host([disabled]) [data-part='input'] {
      cursor: not-allowed;
    }

    /* placeholder (locked): color.foreground.muted */
    [data-part='input']::placeholder {
      color: var(--color-foreground-muted);
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
      border-width: var(--border-width-thin);
      border-color: var(--ds-search-popup-border);
      border-radius: var(--ds-search-popup-radius);
      background: var(--ds-search-popup-surface);
      box-shadow: var(--ds-search-popup-shadow);
      color: var(--color-foreground);
      z-index: var(--layer-dropdown);
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

  /** URL to submit to with GET; when omitted, `submit` handles it and nothing navigates. */
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

  /** Not editable, still readable. */
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

  @query('[data-part=input]') private accessor inputEl!: HTMLInputElement | null;
  @query('[data-part=field]') private accessor fieldEl!: HTMLElement | null;
  @query('[data-part=suggestions]') private accessor popupEl!: HTMLElement | null;
  @query('[data-part=listbox]') private accessor listboxEl!: DsListbox | null;

  /** A shadow-DOM form never navigates the page, so `action` submits this light-DOM one. */
  private navigationForm: HTMLFormElement | undefined;
  private readonly internals: ElementInternals;
  private shown = false;
  private warned = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** The query, controlled or not. */
  get currentValue(): string {
    return this.value ?? this.internalValue;
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

  private get isCombobox(): boolean {
    return this.suggestions !== undefined;
  }

  /** What the Listbox shows: nothing while loading, so its empty row carries `copy.loading`. */
  private get listOptions(): ListboxItem[] {
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
    this.shown = false;
  }

  override focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
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
    if (!this.isCombobox) {
      this.open = false;
    }
    if (!this.open) {
      this.activeValue = null;
    } else if (this.activeValue !== null && !this.listOptions.some((item) => item.value === this.activeValue)) {
      this.activeValue = null;
    }
  }

  protected override updated(): void {
    this.internals.setFormValue(this.currentValue);
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
    if (import.meta.env.DEV && !this.warned) {
      this.warned = true;
      if (!this.label) console.warn('<ds-search> requires a `label`.', this);
    }
  }

  protected override render(): TemplateResult {
    const value = this.currentValue;
    const combobox = this.isCombobox;
    const activeLabel =
      this.activeValue === null ? '' : (this.listOptions.find((item) => item.value === this.activeValue)?.label ?? '');

    return html`
      <form
        data-part="form"
        part="form"
        role=${ifDefined(this.landmark ? 'search' : undefined)}
        @submit=${this.handleFormSubmit}
      >
        <label
          id="label"
          data-part="label"
          part="label"
          class=${classMap({ 'visually-hidden': !this.showLabel })}
          for="input"
          ><ds-text>${this.label}</ds-text></label
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
            name=${this.name}
            enterkeyhint="search"
            autocomplete="off"
            role=${combobox ? 'combobox' : 'searchbox'}
            aria-autocomplete=${ifDefined(combobox ? 'list' : undefined)}
            aria-expanded=${ifDefined(combobox ? String(this.open) : undefined)}
            aria-controls=${ifDefined(combobox ? 'suggestions' : undefined)}
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
                ><ds-icon slot="leading-icon" name="close" .overrides=${ICON_OVERRIDES}></ds-icon
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
            ><ds-icon slot="leading-icon" name="arrow-right" .overrides=${ICON_OVERRIDES}></ds-icon
          ></ds-button>
        </div>
        <span id="active-option" class="visually-hidden" aria-live="polite">${activeLabel}</span>
        <div id="status" data-part="status" class="visually-hidden" role="status" aria-live="polite">
          ${this.statusText()}
        </div>
        ${combobox
          ? html`<div
              id="suggestions"
              data-part="suggestions"
              part="suggestions"
              popover=${ifDefined(POPOVER_SUPPORTED ? 'manual' : undefined)}
              ?hidden=${!POPOVER_SUPPORTED && !this.open}
            >
              <ds-listbox
                data-part="listbox"
                embedded
                labelledBy="label"
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
    this.dispatchEvent(
      new CustomEvent<SearchChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        const active = this.open ? this.activeItem() : undefined;
        if (active) {
          this.chooseSuggestion(active);
        } else {
          this.submitQuery(this.currentValue);
        }
        break;
      }
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          this.open = false;
        } else if (this.currentValue !== '') {
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
    this.submitQuery(this.currentValue);
  };

  private readonly handleSubmitPress = (event: Event): void => {
    event.stopPropagation();
    if (!this.disabled) {
      this.submitQuery(this.currentValue);
    }
  };

  private readonly handleClearPress = (event: Event): void => {
    event.stopPropagation();
    this.clearQuery();
    this.inputEl?.focus();
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    event.stopPropagation();
    const item = this.listOptions.find((entry) => entry.value === event.detail.value);
    if (item) {
      this.chooseSuggestion(item);
    }
  };

  private readonly stopInternalEvent = (event: Event): void => {
    event.stopPropagation();
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private readonly handleReposition = (): void => {
    this.updatePosition();
  };

  private activeItem(): ListboxItem | undefined {
    return this.activeValue === null ? undefined : this.listOptions.find((item) => item.value === this.activeValue);
  }

  /** Fills the query with the suggestion's label, what the user just read, and submits it. */
  private chooseSuggestion(item: ListboxItem): void {
    if (this.value === undefined) {
      this.internalValue = item.label;
    }
    this.open = false;
    this.inputEl?.focus();
    this.submitQuery(item.label);
  }

  private clearQuery(): void {
    if (this.currentValue === '') {
      return;
    }
    if (this.value === undefined) {
      this.internalValue = '';
    }
    this.open = false;
    this.dispatchEvent(new CustomEvent<SearchClearDetail>('clear', { bubbles: true, composed: true }));
  }

  /** Dispatches `submit` with the trimmed query and, with `action`, submits the light-DOM GET form. Never an empty query. */
  private submitQuery(query: string): void {
    const trimmed = query.trim();
    if (trimmed === '') {
      return;
    }
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<SearchSubmitDetail>('submit', { detail: { value: trimmed }, bubbles: true, composed: true }),
    );
    if (this.action) {
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
    const field = form.firstElementChild as HTMLInputElement;
    field.name = this.name;
    field.value = query;
    // `submit()` fires no native `submit` event, which would otherwise bubble through the host beside the CustomEvent.
    form.submit();
  }

  /** Loading, no suggestions, or the plural count, while the list is open. */
  private statusText(): string {
    if (!this.open) {
      return '';
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    const count = this.listOptions.length;
    if (count === 0) {
      return COPY_NO_SUGGESTIONS;
    }
    const locale = this.closest('[lang]')?.getAttribute('lang') || navigator.language;
    const template = new Intl.PluralRules(locale).select(count) === 'one' ? COPY_SUGGESTIONS_COUNT_ONE : COPY_SUGGESTIONS_COUNT_OTHER;
    return template.replace('{count}', String(count));
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
    const offset = parseFloat(getComputedStyle(this).getPropertyValue(HOOKS.suggestionsOffset)) || 0;
    const above = fieldRect.bottom + offset + popupHeight > viewportHeight && fieldRect.top - offset - popupHeight >= 0;

    popup.style.top = above ? 'auto' : `${fieldRect.bottom + offset}px`;
    popup.style.bottom = above ? `${viewportHeight - fieldRect.top + offset}px` : 'auto';
    popup.style.left = `${fieldRect.left}px`;
    popup.style.minInlineSize = `${fieldRect.width}px`;
  }

  /** Sets each overridden hook; popup bindings apply only while the popup exists. */
  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SearchOverridableBinding[]) {
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
