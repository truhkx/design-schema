import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref, type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text } from './Text';
import { Button } from './Button';
import { Listbox, type ListboxOption, type ListboxValue } from './Listbox';
import './Search.css';

export type SearchSize = 'md' | 'lg';

/** One suggestion row: `value` is what fills the query and submits; `label` (plus optional `description`) is what the Listbox shows. */
export interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}

/** copy.* — used verbatim; `{count}` is replaced by the suggestion count. */
const COPY = {
  clear: 'Clear search',
  submit: 'Search',
  loading: 'Loading suggestions',
  suggestionsCount: '{count} suggestions available',
  noSuggestions: 'No suggestions',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const ROOT_OVERRIDE_HOOK: Record<Exclude<SearchOverridableBinding, 'suggestionsOffset'>, string> = {
  borderFocus: '--ds-search-border-focus',
  borderWidth: '--ds-search-border-width',
  radius: '--ds-search-radius',
  paddingInline: '--ds-search-padding-inline',
  paddingBlock: '--ds-search-padding-block',
  paddingBlockLg: '--ds-search-padding-block-lg',
  affixGap: '--ds-search-affix-gap',
  fontFamily: '--ds-search-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-search-font-size',
  lineHeight: '--ds-search-line-height',
  disabledOpacity: '--ds-search-disabled-opacity',
};

/** The suggestions popup is portaled, so its own hook — read by the sanctioned CSS custom-property escape hatch — is set on the popup node itself. */
function resolveOverrides(overrides: Partial<Record<SearchOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  popupStyle: CSSProperties;
} {
  const rootStyle: Record<string, string> = {};
  const popupStyle: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SearchOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    if (binding === 'suggestionsOffset') {
      popupStyle['--ds-search-suggestions-offset'] = cssVar(ref);
      continue;
    }
    rootStyle[ROOT_OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return { rootStyle: rootStyle as CSSProperties, popupStyle: popupStyle as CSSProperties };
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

type ResolvedPosition = { style: CSSProperties; vertical: 'top' | 'bottom' };

/** Positions the suggestions popup below (or above, on overflow) the field, left-aligned and at least as wide as it. */
function computePosition(fieldRect: DOMRect, popupRect: DOMRect): ResolvedPosition {
  const viewportHeight = window.innerHeight;
  let vertical: 'top' | 'bottom' = 'bottom';
  if (fieldRect.bottom + popupRect.height > viewportHeight && fieldRect.top - popupRect.height >= 0) {
    vertical = 'top';
  }
  const style: Record<string, string | number> = {
    left: fieldRect.left,
    '--ds-search-field-width': `${fieldRect.width}px`,
  };
  if (vertical === 'bottom') style.top = fieldRect.bottom;
  else style.bottom = viewportHeight - fieldRect.top;
  return { style: style as CSSProperties, vertical };
}

export interface SearchProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'size'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'disabled'
    | 'onChange'
    | 'onSubmit'
    | 'children'
    | 'role'
    | 'aria-describedby'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'autoComplete'
  > {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /** Field name; the query key when the form submits to a URL. */
  name?: string | undefined;
  /** Controlled query. */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /** URL to submit to with GET; when omitted, `onSubmit` handles it and nothing navigates. */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one fills the
   * query and submits. Provide them from `onChange` (debounced by the caller). With suggestions
   * the field becomes a Combobox: same keys, `aria-activedescendant`.
   */
  suggestions?: SearchSuggestion[] | undefined;
  /** Suggestions are being fetched; announced through `copy.loading`. */
  loading?: boolean | undefined;
  /** Wrap in the `search` landmark role. Turn off when the Search sits inside another search landmark. */
  landmark?: boolean | undefined;
  /** lg for a search page's hero field. */
  size?: SearchSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Portal target for the suggestions popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every keystroke with the query; the caller fetches suggestions here. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the (trimmed) query. */
  onSubmit?: ((value: string) => void) | undefined;
  /** Fired when the clear button empties the field. */
  onClear?: (() => void) | undefined;
}

/**
 * Search — Design Schema, category: input.
 *
 * When to use:
 * Use Search for free-text search over a site, an app, or a large dataset: the header search, a
 * search page's main field, a "filter the list" field over more than a couple of dozen rows. Add
 * `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for
 * the one primary search so screen-reader users can jump to it.
 *
 * Do not use Search for a field that takes a specific value (an order number: Input), for choosing
 * from a known list (Select or Combobox), or for a filter that applies instantly to a short list
 * already on screen (an Input labelled "Filter" is honest about what it does). Do not put two
 * search landmarks on a page.
 */
export const Search = function Search({
  ref,
  label,
  showLabel = false,
  name = 'q',
  value,
  defaultValue,
  placeholder,
  action,
  suggestions,
  loading = false,
  landmark = true,
  size = 'md',
  disabled = false,
  container,
  overrides,
  onChange,
  onSubmit,
  onClear,
  id: idProp,
  className,
  style,
  onFocus,
  onBlur,
  ...rest
}: SearchProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `ds-search${generatedId}`;
  const labelId = `${id}-label`;
  const statusId = `${id}-status`;
  const listboxId = `${id}-listbox`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const pendingForward = useRef<string | null>(null);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const text = isControlled ? (value as string) : internalValue;

  const hasSuggestions = suggestions !== undefined;
  const suggestionRows = suggestions ?? [];

  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [listboxGeneration, setListboxGeneration] = useState(0);
  const [popupPosition, setPopupPosition] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);
  const [statusText, setStatusText] = useState('');

  if (isDev && !label) {
    console.warn('Search: `label` is required and becomes the field’s accessible name.');
  }

  // A fresh suggestion set (a different query's results): highlight starts over.
  useEffect(() => {
    setActiveValue(null);
    setListboxGeneration((g) => g + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);

  useEffect(() => {
    if (!open || !hasSuggestions) {
      setStatusText('');
      return;
    }
    if (loading) setStatusText(COPY.loading);
    else if (suggestionRows.length === 0) setStatusText(COPY.noSuggestions);
    else setStatusText(COPY.suggestionsCount.replace('{count}', String(suggestionRows.length)));
  }, [open, hasSuggestions, loading, suggestionRows.length]);

  // Position the popup; reposition while scrolling or resizing; forward a queued arrow key once it mounts.
  useLayoutEffect(() => {
    if (!open || !hasSuggestions) {
      setEntered(false);
      return undefined;
    }
    const field = fieldRef.current;
    const popup = popupRef.current;
    if (!field || !popup) return undefined;

    const reposition = () => {
      const fieldRect = field.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const result = computePosition(fieldRect, popupRect);
      setPopupPosition(result.style);
      setVertical(result.vertical);
    };
    reposition();

    if (pendingForward.current) {
      const key = pendingForward.current;
      pendingForward.current = null;
      listboxRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }

    if (prefersReducedMotion()) setEntered(true);
    else requestAnimationFrame(() => setEntered(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, hasSuggestions, listboxGeneration]);

  // A pointer click or focus move outside, or the window losing focus, closes the popup.
  useEffect(() => {
    if (!open) return undefined;
    const isOutside = (target: Node | null) =>
      !target || (!popupRef.current?.contains(target) && !fieldRef.current?.contains(target));
    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target as Node)) closeList();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (isOutside(event.relatedTarget as Node | null)) closeList();
    };
    const handleWindowBlur = () => closeList();
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('blur', handleWindowBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openList = () => {
    if (open || disabled || !hasSuggestions) return;
    setOpen(true);
  };

  const closeList = () => {
    if (!open) return;
    setActiveValue(null);
    setOpen(false);
  };

  /** Dispatches a native, bubbling keydown at the Listbox root so its internal active-option state
   * advances without DOM focus ever leaving the input; queued if the popup has not mounted yet. */
  const dispatchToListbox = (key: string) => {
    const target = listboxRef.current;
    if (!target) {
      pendingForward.current = key;
      return;
    }
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  };

  const updateText = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const submitQuery = (query: string) => {
    closeList();
    onSubmit?.(query);
    if (action) {
      const url = new URL(action, window.location.href);
      url.searchParams.set(name, query);
      window.location.assign(url.toString());
    }
  };

  const trySubmit = () => {
    if (disabled) return;
    if (open && activeValue) {
      const target = suggestionRows.find((row) => row.value === activeValue);
      if (target) {
        updateText(target.value);
        submitQuery(target.value);
        return;
      }
    }
    const trimmed = text.trim();
    if (trimmed === '') return;
    submitQuery(trimmed);
  };

  const handleClear = () => {
    updateText('');
    closeList();
    onClear?.();
    inputRef.current?.focus();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trySubmit();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateText(event.target.value);
    setActiveValue(null);
    if (hasSuggestions) openList();
  };

  const handleInputClick = () => {
    if (hasSuggestions) openList();
  };

  const handleFocus = (event: ReactFocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    if (hasSuggestions) openList();
  };

  const handleListboxChange = (nextValue: ListboxValue) => {
    const chosen = Array.isArray(nextValue) ? nextValue[0] : nextValue;
    if (chosen === undefined) return;
    updateText(chosen);
    submitQuery(chosen);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        trySubmit();
        break;
      }
      case 'Escape': {
        event.preventDefault();
        if (open) closeList();
        else if (text !== '') handleClear();
        break;
      }
      case 'ArrowDown': {
        if (!hasSuggestions) break;
        event.preventDefault();
        openList();
        dispatchToListbox('ArrowDown');
        break;
      }
      case 'ArrowUp': {
        if (!hasSuggestions || !open) break;
        event.preventDefault();
        const firstValue = suggestionRows[0]?.value;
        if (activeValue !== null && activeValue === firstValue) setActiveValue(null);
        else dispatchToListbox('ArrowUp');
        break;
      }
      default:
        break;
    }
  };

  const resolved = overrides ? resolveOverrides(overrides) : undefined;
  const mergedStyle = resolved?.rootStyle || style ? { ...resolved?.rootStyle, ...style } : undefined;
  const mergedPopupStyle = { ...popupPosition, ...resolved?.popupStyle };

  const classes = ['ds-search', `ds-search--${size}`, disabled ? 'ds-search--disabled' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const showClear = text !== '';
  const showPopup = open && hasSuggestions;
  const activeDescendant = showPopup && activeValue ? `${listboxId}-option-${activeValue}` : undefined;

  const listboxOptions: ListboxOption[] = suggestionRows.map((row) => ({
    value: row.value,
    label: row.label,
    description: row.description,
  }));

  const popupClasses = ['ds-search__suggestions', entered ? 'ds-search__suggestions--entered' : null]
    .filter(Boolean)
    .join(' ');

  const labelClasses = ['ds-search__label', showLabel ? null : 'ds-search__visually-hidden'].filter(Boolean).join(' ');

  return (
    <form
      data-ds="Search"
      role={landmark ? 'search' : undefined}
      className={classes}
      style={mergedStyle}
      onSubmit={handleFormSubmit}
    >
      <label htmlFor={id} id={labelId} data-part="label" className={labelClasses}>
        <Text element="span" weight="medium">
          {label}
        </Text>
      </label>
      <div ref={fieldRef} className="ds-search__field" data-part="field">
        <span className="ds-search__icon" data-part="icon" aria-hidden="true">
          <Icon name="search" inline />
        </span>
        <input
          {...rest}
          ref={inputRef}
          id={id}
          name={name}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          role={hasSuggestions ? 'combobox' : undefined}
          aria-autocomplete={hasSuggestions ? 'list' : undefined}
          aria-expanded={hasSuggestions ? (showPopup ? 'true' : 'false') : undefined}
          aria-controls={hasSuggestions ? listboxId : undefined}
          aria-activedescendant={activeDescendant}
          aria-describedby={statusId}
          aria-disabled={disabled ? 'true' : undefined}
          data-part="input"
          className="ds-search__input"
          value={text}
          placeholder={placeholder}
          readOnly={disabled ? true : rest.readOnly}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={onBlur}
        />
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.clear}
            leadingIcon={<Icon name="close" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
            disabled={disabled}
            data-part="clearButton"
            onClick={handleClear}
          />
        ) : null}
        {action ? (
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.submit}
            leadingIcon={<Icon name="arrow-right" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
            disabled={disabled}
            data-part="submitButton"
          />
        ) : null}
      </div>
      <div id={statusId} data-part="status" role="status" aria-live="polite" className="ds-search__status">
        {statusText}
      </div>
      {showPopup
        ? createPortal(
            <div ref={popupRef} data-part="suggestions" data-vertical={vertical} className={popupClasses} style={mergedPopupStyle}>
              <Listbox
                key={listboxGeneration}
                ref={listboxRef}
                id={listboxId}
                label={label}
                labelledBy={labelId}
                options={listboxOptions}
                selectionFollowsFocus={false}
                disabled={disabled}
                emptyMessage={loading ? COPY.loading : COPY.noSuggestions}
                onChange={handleListboxChange}
                onActiveChange={setActiveValue}
              />
            </div>,
            container ?? document.body,
          )
        : null}
    </form>
  );
};
