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
import './Landmark.js';
import type { DsListbox, ListboxChangeDetail, ListboxItem } from './Listbox.js';

export type SearchSize = 'md' | 'lg';

/** A single suggestion (anatomy: suggestions). */
export interface SearchSuggestion {
  value: string;
  label: string;
  description?: string;
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
 * `foreground`, `placeholder`, `iconColor`, `border`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
export type SearchOverridableBinding =
  | 'borderFocus'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockLg'
  | 'affixGap'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'suggestionsOffset'
  | 'disabledOpacity';

const HOOKS: Record<SearchOverridableBinding, string> = {
  borderFocus: '--ds-search-border-focus',
  borderWidth: '--ds-search-border-width',
  radius: '--ds-search-radius',
  paddingInline: '--ds-search-padding-inline',
  paddingBlock: '--ds-search-padding-block',
  paddingBlockLg: '--ds-search-padding-block-lg',
  affixGap: '--ds-search-affix-gap',
  fontFamily: '--ds-search-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-search-font-size',
  lineHeight: '--ds-search-line-height',
  suggestionsOffset: '--ds-search-suggestions-offset',
  disabledOpacity: '--ds-search-disabled-opacity',
};

/** copy.clear */
const COPY_CLEAR = 'Clear search';
/** copy.submit */
const COPY_SUBMIT = 'Search';
/** copy.loading */
const COPY_LOADING = 'Loading suggestions';
/** copy.suggestionsCount */
const COPY_SUGGESTIONS_COUNT = (count: number): string => `${count} suggestions available`;
/** copy.noSuggestions */
const COPY_NO_SUGGESTIONS = 'No suggestions';

/** How long the live-region status waits before announcing, so fast typing does not spam a screen reader. Not a design token — an interaction timing, not a motion one; mirrors `<ds-combobox>`. */
const STATUS_DEBOUNCE_MS = 500;

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** `input` or `internals.ariaActiveDescendantElement`-capable element, for the cross-shadow-root activedescendant reflection Chromium ships. */
type ActiveDescendantHost = HTMLInputElement & { ariaActiveDescendantElement?: Element | null };

/**
 * `<ds-search>` — Search (category: input, APG pattern: combobox).
 *
 * `<ds-search label="Search products" name="q" action="/search">` renders a
 * `<form>` inside the shadow root, wrapped in a composed `<ds-landmark
 * role="search">` (named by `label`) when `landmark` is set, with a visually-hidden `<label>`, a
 * decorative "search" `Icon`, a `type="search"` `<input>`, a clear `Button`
 * shown once there is text, and a submit `Button`. Submitting dispatches a
 * composed `submit` CustomEvent with the trimmed query; when `action` is set
 * it also builds a light-DOM `<form method="get">` on demand and submits it,
 * since the shadow `<form>` never participates in page navigation. Passing
 * `suggestions` (even an empty array, once fetching starts) turns the field
 * into a combobox: the input takes `role="combobox"` with
 * `aria-activedescendant`, and a popup composing `<ds-listbox>` renders in
 * the same shadow root so activedescendant resolves; choosing a suggestion
 * fills the query and submits. The popup uses the Popover API when available,
 * a `position: fixed` fallback otherwise.
 *
 * ## When to use
 *
 * Use Search for free-text search over a site, an app, or a large dataset.
 * Add `suggestions` when the backend can offer completions or recent
 * queries; keep `landmark` on for the one primary search so screen-reader
 * users can jump to it.
 *
 * ## When not to use
 *
 * Not for a field that takes a specific value (Input), for choosing from a
 * known list (Select or Combobox), or for a filter that applies instantly to
 * a short list already on screen. Do not put two search landmarks on a page.
 *
 * @fires change - Fired on every keystroke with the query, with `{ value }` in `detail`.
 * @fires submit - Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query in `{ value }`.
 * @fires clear - Fired when the field is emptied via the clear button or Escape.
 * @csspart landmark - The composed `<ds-landmark role="search">` wrapping the form (anatomy: landmark).
 * @csspart label - The visually-hidden-by-default `<label>` (anatomy: label).
 * @csspart field - The bordered pill wrapper around icon, input and buttons (anatomy: field).
 * @csspart icon - The decorative leading `<ds-icon>` (anatomy: icon).
 * @csspart input - The `type="search"` `<input>` (anatomy: input).
 * @csspart clearButton - The button that empties the field (anatomy: clearButton).
 * @csspart submitButton - The button that submits the query (anatomy: submitButton).
 * @csspart suggestions - The positioned popup composing `<ds-listbox>` (anatomy: suggestions).
 * @csspart status - The visually-hidden `role="status"` live region.
 */
@customElement('ds-search')
export class DsSearch extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline-block;
      inline-size: 100%;
      font-family: var(--font-family-body);
      --ds-search-border-focus: var(--color-border-focus);
      --ds-search-border-width: var(--border-width-thin);
      --ds-search-radius: var(--radius-full);
      --ds-search-padding-inline: var(--space-md);
      --ds-search-padding-block: var(--space-sm);
      --ds-search-padding-block-lg: var(--space-md);
      --ds-search-affix-gap: var(--layout-gap-tight);
      --ds-search-font-family: var(--font-family-body);
      --ds-search-font-size: var(--font-size-md);
      --ds-search-line-height: var(--font-line-height-normal);
      --ds-search-suggestions-offset: var(--space-1);
      --ds-search-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    /* fontSize: font.size.{size} */
    :host([size='lg']) {
      --ds-search-font-size: var(--font-size-lg);
    }

    form {
      display: block;
      margin: 0;
      padding: 0;
    }

    .label {
      display: block;
      margin-block-end: var(--space-1);
      font-size: var(--ds-search-font-size);
      font-weight: var(--font-weight-medium);
      line-height: var(--ds-search-line-height);
      color: var(--color-foreground);
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

    /* background / border: color.control.background / color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-search-affix-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-search-padding-block);
      padding-inline: var(--ds-search-padding-inline);
      border: var(--ds-search-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-search-radius);
      background: var(--color-control-background);
      transition:
        border-color var(--motion-duration-fast) var(--motion-easing-standard),
        padding var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* paddingBlockLg: space.md, vertical padding at size lg */
    :host([size='lg']) .field {
      padding-block: var(--ds-search-padding-block-lg);
    }

    @media (prefers-reduced-motion: reduce) {
      .field,
      .popup {
        transition: none;
      }
    }

    /*
     * focusRingWidth (locked) replaces borderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-within {
      border-color: var(--ds-search-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-search-padding-inline) - (var(--border-width-focus) - var(--ds-search-border-width))
      );
      padding-block: calc(
        var(--ds-search-padding-block) - (var(--border-width-focus) - var(--ds-search-border-width))
      );
    }
    :host([size='lg']) .field:focus-within {
      padding-block: calc(
        var(--ds-search-padding-block-lg) - (var(--border-width-focus) - var(--ds-search-border-width))
      );
    }

    .field.disabled {
      opacity: var(--ds-search-disabled-opacity);
    }
    .field.disabled .input {
      cursor: not-allowed;
    }

    /* iconColor: color.foreground.muted, locked */
    .icon {
      flex: none;
      color: var(--color-foreground-muted);
    }

    /* foreground / placeholder: color.foreground / color.foreground.muted, locked */
    .input {
      flex: 1 1 auto;
      min-inline-size: 0;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      font-family: var(--ds-search-font-family);
      font-size: var(--ds-search-font-size);
      line-height: var(--ds-search-line-height);
      color: var(--color-foreground);
      appearance: none;
      -webkit-appearance: none;
    }

    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /* The system's own clear Button replaces the native one (web platform notes). */
    .input::-webkit-search-cancel-button {
      display: none;
    }

    .popup {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border-style: solid;
      border-width: var(--border-width-thin);
      border-color: var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-overlay-surface);
      box-shadow: var(--shadow-overlay);
      z-index: var(--layer-dropdown);
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      overflow: auto;
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--motion-duration-fast) var(--motion-easing-standard),
        transform var(--motion-duration-fast) var(--motion-easing-standard);
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

    .status-text {
      display: block;
      padding-block: var(--space-sm);
      padding-inline: var(--space-md);
    }

    .listbox {
      display: block;
    }
  `;

  /** Accessible name ("Search products"). Visually hidden unless `showLabel`. */
  @property() label!: string;

  /** Show the label above the field, as in a search page rather than a header. */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) showLabel = false;

  /** Field name; the query key when the form submits to a URL. */
  @property() name = 'q';

  /** Controlled query. Omit for uncontrolled. */
  @property() value?: string;

  /** Initial query for an uncontrolled field. */
  @property({ attribute: 'default-value' }) defaultValue?: string;

  /** Example query, not a label ("Try "invoices from March""). */
  @property() placeholder?: string;

  /** URL to submit to with GET. When omitted, `submit` handles it and nothing navigates. */
  @property() action?: string;

  /**
   * Suggestions for the current query, shown in a Listbox under the field.
   * Omit entirely for a plain search field; pass an array (even empty, while
   * fetching) to turn the field into a combobox. A property, not an
   * attribute — provide it from `change` (debounced by the caller).
   */
  @property({ attribute: false }) suggestions?: SearchSuggestion[];

  /** Suggestions are being fetched; announced through `copy.loading`. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /**
   * Wrap in the `search` Landmark. Boolean attributes cannot express `false`
   * while the default is `true`, so the attribute is the negation —
   * `no-landmark` present means this is `false`.
   */
  @property({
    attribute: 'no-landmark',
    reflect: true,
    converter: {
      fromAttribute: (value: string | null): boolean => value === null,
      toAttribute: (value: boolean): string | null => (value ? null : ''),
    },
  })
  landmark = true;

  /** `lg` for a search page's hero field. */
  @property({ reflect: true }) size: SearchSize = 'md';

  /** Not editable, still readable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SearchOverridableBinding, TokenRef>>;

  /** Whether the suggestions popup is open. Not exposed as a property — see the generator's gap notes. */
  @state() private isOpen = false;

  /** Id (within the composed Listbox's own shadow root) of the active suggestion, mirrored onto the input's `aria-activedescendant`. */
  @state() private activeDescendantId?: string;

  /** Debounced text for the `status` live region. */
  @state() private announcedStatus = '';

  @query('#input') private readonly inputEl?: HTMLInputElement;
  @query('#listbox') private readonly listboxEl?: DsListbox;
  @query('#popup') private readonly popupEl?: HTMLElement;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private wasOpen = false;
  private activateFirstOnOpen = false;
  private statusTimer?: ReturnType<typeof setTimeout>;

  /** Light-DOM `<form>` this element creates on demand to navigate to `action` (a shadow-root form does not participate in the page). */
  private navigationForm?: HTMLFormElement;

  /** The current string value of the field. */
  get currentValue(): string {
    return this.value ?? this.defaultValue ?? '';
  }

  /** Whether `suggestions` turns this field into a combobox. */
  private get hasSuggestionsFeature(): boolean {
    return this.suggestions !== undefined;
  }

  private get listboxOptions(): ListboxItem[] {
    return (this.suggestions ?? []).map((item) => ({
      value: item.value,
      label: item.label,
      description: item.description,
    }));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Search');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    clearTimeout(this.statusTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('suggestions') && !this.hasSuggestionsFeature) {
      this.isOpen = false;
    }
  }

  protected override updated(): void {
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
    const isDisabled = this.disabled;
    const value = this.currentValue;
    const showClear = value !== '';
    const hasSuggestions = this.hasSuggestionsFeature;
    const items = this.suggestions ?? [];

    const form = html`
      <form id="form" part="form" @submit=${this.handleFormSubmit}>
        <label
          id="label"
          part="label"
          class=${classMap({ label: true, 'visually-hidden': !this.showLabel })}
          for="input"
          >${this.label}</label
        >
        <div class=${classMap({ field: true, disabled: isDisabled })} part="field">
          <ds-icon class="icon" part="icon" name="search"></ds-icon>
          <input
            id="input"
            part="input"
            class="input"
            type="search"
            name=${this.name}
            enterkeyhint="search"
            autocomplete="off"
            role=${hasSuggestions ? 'combobox' : 'searchbox'}
            aria-autocomplete=${hasSuggestions ? 'list' : nothing}
            aria-expanded=${hasSuggestions ? (this.isOpen ? 'true' : 'false') : nothing}
            aria-controls=${hasSuggestions ? 'popup' : nothing}
            aria-activedescendant=${ifDefined(this.activeDescendantId)}
            aria-labelledby="label"
            aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(value)}
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
                  label=${COPY_CLEAR}
                  ?disabled=${isDisabled}
                  @press=${this.handleClearPress}
                  ><ds-icon slot="leading-icon" name="close"></ds-icon
                ></ds-button>
              `
            : nothing}
          <ds-button
            id="submit-button"
            part="submitButton"
            variant="ghost"
            size="sm"
            icon-only
            type="submit"
            label=${COPY_SUBMIT}
            ?disabled=${isDisabled}
            ><ds-icon slot="leading-icon" name="arrow-right"></ds-icon
          ></ds-button>
        </div>
        ${hasSuggestions
          ? html`
              <div
                id="popup"
                class="popup"
                part="suggestions"
                popover=${this.popoverSupported ? 'manual' : nothing}
                ?hidden=${this.popoverSupported ? false : !this.isOpen}
              >
                ${this.loading
                  ? html`<ds-text class="status-text" element="p" tone="muted">${COPY_LOADING}</ds-text>`
                  : items.length === 0
                    ? html`<ds-text class="status-text" element="p" tone="muted">${COPY_NO_SUGGESTIONS}</ds-text>`
                    : html`
                        <ds-listbox
                          id="listbox"
                          part="listbox"
                          class="listbox"
                          labelledBy="label"
                          embedded
                          .options=${this.listboxOptions}
                          .selectionFollowsFocus=${false}
                          @change=${this.handleListboxChange}
                          @active-change=${this.handleListboxActiveChange}
                        ></ds-listbox>
                      `}
              </div>
            `
          : nothing}
        <div id="status" part="status" class="visually-hidden" role="status" aria-live="polite">
          ${this.announcedStatus}
        </div>
      </form>
    `;

    return this.landmark
      ? html`<ds-landmark role="search" .label=${this.label} part="landmark">${form}</ds-landmark>`
      : form;
  }

  private readonly handleInput = (event: InputEvent): void => {
    const next = (event.currentTarget as HTMLInputElement).value;
    this.value = next;
    if (this.hasSuggestionsFeature) {
      this.isOpen = true;
    }
    this.dispatchEvent(
      new CustomEvent<SearchChangeDetail>('change', { detail: { value: next }, bubbles: true, composed: true }),
    );
  };

  private readonly handleInputKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) {
      return;
    }
    const key = event.key;

    if (key === 'Enter') {
      if (this.isOpen && this.listboxEl?.activeValue) {
        event.preventDefault();
        this.commitSuggestion(this.listboxEl.activeValue);
      }
      // Otherwise the native <input type="search"> inside the <form> submits
      // implicitly, handled by `handleFormSubmit`.
      return;
    }
    if (key === 'Escape') {
      if (this.isOpen) {
        event.preventDefault();
        this.closeList(true);
      } else if (this.currentValue !== '') {
        event.preventDefault();
        this.clearQuery();
      }
      return;
    }
    if (key === 'ArrowDown' && this.hasSuggestionsFeature) {
      event.preventDefault();
      if (this.isOpen) {
        this.moveActiveDown();
      } else {
        this.activateFirstOnOpen = true;
        this.isOpen = true;
      }
      return;
    }
    if (key === 'ArrowUp' && this.hasSuggestionsFeature) {
      if (!this.isOpen) {
        return;
      }
      event.preventDefault();
      this.moveActiveUp();
      return;
    }
    if (key === 'Tab') {
      if (this.isOpen) {
        // Hide synchronously so the browser's own Tab traversal (computed right
        // after this handler returns, ahead of Lit's async re-render) does not
        // land inside the now-closing popup.
        this.hidePopupImmediately();
        this.isOpen = false;
      }
    }
  };

  private readonly handleFormSubmit = (event: SubmitEvent): void => {
    // The shadow-root `<form>` never navigates the page; `submitQuery` builds
    // a light-DOM form for that when `action` is set.
    event.preventDefault();
    this.submitQuery(this.currentValue);
  };

  private readonly handleClearPress = (event: CustomEvent): void => {
    event.stopPropagation();
    this.clearQuery();
    this.inputEl?.focus();
  };

  private readonly handleListboxChange = (event: CustomEvent<ListboxChangeDetail>): void => {
    // Internal to the composition; Search dispatches its own `submit`.
    event.stopPropagation();
    const value = event.detail.value;
    if (typeof value === 'string') {
      this.commitSuggestion(value);
    }
  };

  private readonly handleListboxActiveChange = (event: Event): void => {
    event.stopPropagation();
  };

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

  private clearQuery(): void {
    if (this.currentValue === '') {
      return;
    }
    this.value = '';
    this.closeList(false);
    this.dispatchEvent(new CustomEvent<SearchClearDetail>('clear', { bubbles: true, composed: true }));
  }

  private commitSuggestion(value: string): void {
    const item = (this.suggestions ?? []).find((candidate) => candidate.value === value);
    if (!item) {
      return;
    }
    this.value = item.label;
    this.closeList(true);
    this.submitQuery(item.label);
  }

  private submitQuery(query: string): void {
    const trimmed = query.trim();
    if (trimmed === '') {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<SearchSubmitDetail>('submit', { detail: { value: trimmed }, bubbles: true, composed: true }),
    );
    if (this.action) {
      this.navigateTo(trimmed);
    }
  }

  private navigateTo(query: string): void {
    if (!this.navigationForm) {
      const form = document.createElement('form');
      form.method = 'get';
      form.hidden = true;
      const input = document.createElement('input');
      input.type = 'hidden';
      form.appendChild(input);
      this.appendChild(form);
      this.navigationForm = form;
    }
    const form = this.navigationForm;
    form.action = this.action ?? '';
    (form.firstElementChild as HTMLInputElement).name = this.name;
    (form.firstElementChild as HTMLInputElement).value = query;
    form.requestSubmit();
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

  private moveActiveDown(): void {
    if ((this.suggestions ?? []).length === 0) {
      return;
    }
    this.listboxEl?.handleKey(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
  }

  /** From no active suggestion or the first, clears the highlight (back to the input); otherwise moves up one — never wraps to the last. */
  private moveActiveUp(): void {
    const items = this.suggestions ?? [];
    const active = this.listboxEl?.activeValue ?? null;
    const index = active !== null ? items.findIndex((item) => item.value === active) : -1;
    if (this.listboxEl) {
      this.listboxEl.activeValue = index <= 0 ? null : items[index - 1].value;
    }
  }

  private handleOpened(): void {
    if (this.popoverSupported) {
      this.popupEl?.showPopover();
    }
    this.updatePosition();
    this.addGlobalListeners();
    if (this.activateFirstOnOpen && this.listboxEl) {
      const first = (this.suggestions ?? [])[0];
      this.listboxEl.activeValue = first ? first.value : null;
    }
    this.activateFirstOnOpen = false;
  }

  private handleClosed(): void {
    this.removeGlobalListeners();
    this.hidePopupImmediately();
    this.activateFirstOnOpen = false;
    if (this.listboxEl) {
      this.listboxEl.activeValue = null;
    }
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
    const gap = parseFloat(getComputedStyle(popup).getPropertyValue('--ds-search-suggestions-offset')) || 0;

    const overflowsBelow = fieldRect.bottom + gap + popupRect.height > viewportHeight;
    const opensUpward = overflowsBelow && fieldRect.top - gap - popupRect.height >= 0;

    popup.style.top = opensUpward ? 'auto' : `${fieldRect.bottom + gap}px`;
    popup.style.bottom = opensUpward ? `${viewportHeight - fieldRect.top + gap}px` : 'auto';
    popup.style.left = `${fieldRect.left}px`;
    popup.style.minWidth = `${fieldRect.width}px`;
  }

  /** Mirrors the active suggestion onto the input's `aria-activedescendant`, using the cross-shadow-root element reflection where the browser supports it (see the generator's gap notes). */
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
    if (!this.isOpen || !this.hasSuggestionsFeature) {
      return '';
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    const count = (this.suggestions ?? []).length;
    return count === 0 ? COPY_NO_SUGGESTIONS : COPY_SUGGESTIONS_COUNT(count);
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

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SearchOverridableBinding[]) {
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
      console.warn('<ds-search> requires a `label`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-search': DsSearch;
  }
}
