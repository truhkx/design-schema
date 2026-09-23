import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Listbox, type ListboxOption, type ListboxValue } from './Listbox';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Search.css';

declare const process: { env: { NODE_ENV?: string } };

export type SearchSize = 'md' | 'lg';

/** One suggestion row: `label` (plus optional `description`) is what the Listbox shows and what fills the query. */
export interface SearchSuggestion {
  value: string;
  label: string;
  description?: string | undefined;
}

/** copy.* — used verbatim; `{count}` is the only interpolation. */
const COPY = {
  clear: 'Clear search',
  submit: 'Search',
  loading: 'Loading suggestions',
  suggestionsCount: { one: '{count} suggestion available', other: '{count} suggestions available' },
  noSuggestions: 'No suggestions',
} as const;

/** constant `statusDebounce`: motion.duration.base × 2, read from the theme at run time. */
const STATUS_DEBOUNCE = { token: '--motion-duration-base', multiply: 2 } as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/** Hooks on the root. `labelWeight` has none: it is forwarded to the label Text (as `fontSize` also is). */
const ROOT_HOOK: Partial<Record<SearchOverridableBinding, string>> = {
  borderWidth: '--ds-search-border-width',
  radius: '--ds-search-radius',
  paddingInline: '--ds-search-padding-inline',
  paddingBlock: '--ds-search-padding-block',
  affixGap: '--ds-search-affix-gap',
  fontFamily: '--ds-search-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-search-font-size',
  lineHeight: '--ds-search-line-height',
  partGap: '--ds-search-part-gap',
  disabledOpacity: '--ds-search-disabled-opacity',
};

/** Hooks on the portaled suggestions popup, which does not inherit from the root. */
const POPUP_HOOK: Partial<Record<SearchOverridableBinding, string>> = {
  suggestionsOffset: '--ds-search-suggestions-offset',
  popupSurface: '--ds-search-popup-surface',
  popupBorder: '--ds-search-popup-border',
  popupBorderWidth: '--ds-search-popup-border-width',
  popupRadius: '--ds-search-popup-radius',
  popupShadow: '--ds-search-popup-shadow',
  layer: '--ds-search-layer',
};

function resolveOverrides(overrides: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined): {
  root: CSSProperties | undefined;
  popup: CSSProperties | undefined;
} {
  const root: Record<string, string> = {};
  const popup: Record<string, string> = {};
  for (const binding of Object.keys(overrides ?? {}) as SearchOverridableBinding[]) {
    const ref = overrides?.[binding];
    if (!ref) continue;
    // Locked bindings have no entry in either table, so they are ignored if passed.
    const rootHook = ROOT_HOOK[binding];
    const popupHook = POPUP_HOOK[binding];
    if (rootHook) root[rootHook] = cssVar(ref);
    else if (popupHook) popup[popupHook] = cssVar(ref);
  }
  return {
    root: Object.keys(root).length ? (root as CSSProperties) : undefined,
    popup: Object.keys(popup).length ? (popup as CSSProperties) : undefined,
  };
}

/** A resolved CSS time (`200ms`, `0.2s`) in ms; `null` when it cannot be read (no theme loaded, jsdom). */
function parseTime(raw: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(raw.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** The hydration gate: false on the server and through hydration, true on a client-only mount. */
const subscribeNothing = (): (() => void) => () => {};

type PopupPosition = {
  vertical: 'top' | 'bottom';
  left: number;
  /** The field edge the popup hangs from; CSS adds `suggestionsOffset` to it. */
  anchor: number;
  minInlineSize: number;
};

/** Below the field, flipped above when it would overflow and there is more room there; never past the inline edge. */
function computePosition(field: DOMRect, popup: DOMRect): PopupPosition {
  const viewportHeight = window.innerHeight;
  const vertical =
    field.bottom + popup.height > viewportHeight && field.top > viewportHeight - field.bottom ? 'top' : 'bottom';
  const width = Math.max(popup.width, field.width);
  const left = Math.max(0, Math.min(field.left, window.innerWidth - width));
  return {
    vertical,
    left,
    anchor: vertical === 'bottom' ? field.bottom : viewportHeight - field.top,
    minInlineSize: field.width,
  };
}

function samePosition(a: PopupPosition | null, b: PopupPosition): boolean {
  return (
    a !== null &&
    a.vertical === b.vertical &&
    a.left === b.left &&
    a.anchor === b.anchor &&
    a.minInlineSize === b.minInlineSize
  );
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
    | 'readOnly'
    | 'onChange'
    | 'onSubmit'
    | 'children'
    | 'className'
    | 'style'
    | 'role'
    | 'autoComplete'
    | 'enterKeyHint'
    | 'aria-autocomplete'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'aria-disabled'
  > {
  /** The accessible name ("Search products", "Search this site"). Visually hidden by default — the glyph and placeholder are the visible cue. */
  label: string;
  /** Show the label above the field, as in a search page rather than a header. */
  showLabel?: boolean | undefined;
  /** Field name; the query key when the form submits to a URL. */
  name?: string | undefined;
  /**
   * Controlled query. When set, it is the query everything reads: submit, a chosen suggestion, the
   * clear button and the Form value all use this prop, never stale typed text; clearing reports
   * onChange("") and the field empties when the caller passes the new value.
   */
  value?: string | undefined;
  /** Initial query. */
  defaultValue?: string | undefined;
  /** Example query, not a label ("Try "invoices from March""). */
  placeholder?: string | undefined;
  /**
   * URL to submit to with GET; when omitted, `onSubmit` handles it and nothing navigates. The URL
   * carries the same trimmed query `onSubmit` receives: the visible input carries no `name`, and a
   * hidden input named `name` is set to the trimmed query (the controlled value or chosen label,
   * never stale DOM text) in the submit handler. Ignored, with a development warning, when Search
   * sits inside a Form component: the enclosing Form owns submission.
   */
  action?: string | undefined;
  /**
   * Suggestions for the current query, shown in a Listbox under the field; choosing one fills the
   * query with the suggestion's `label` — what the user just read — and submits. Provide them from
   * `onChange` (debounced by the caller). Setting the prop at all is what turns the field into a
   * combobox, including an explicitly empty array after a fetch that found nothing, which shows
   * `copy.noSuggestions`; leaving it undefined keeps a plain search field. The list opens on typing
   * and on ArrowDown — never on focus alone — and closes on Escape, Tab, blur or a pointer press
   * outside Search, a chosen suggestion, clear, and every submit attempt. ArrowDown on the last
   * suggestion stays there, as ArrowUp never wraps.
   */
  suggestions?: SearchSuggestion[] | undefined;
  /**
   * Suggestions are being fetched; announced through `copy.loading` whenever `suggestions` is set
   * and this is true, list open or not.
   */
  loading?: boolean | undefined;
  /**
   * Give the field the `search` landmark. Turn off when the Search sits inside another search
   * landmark (a filter within a results page). It is `role="search"` on Search's own form element,
   * not a composed Landmark wrapping it.
   */
  landmark?: boolean | undefined;
  /** lg for a search page's hero field. */
  size?: SearchSize | undefined;
  /**
   * Not editable, still readable and focusable: the input is read-only with aria-disabled, both
   * Buttons are disabled (the clear Button still renders when there is text), every key in the
   * keyboard table is inert, suggestions never open and an open list closes, no event fires, the
   * component dims to `disabledOpacity`, and a disabled Search is not registered with (or submitted
   * by) a Form.
   */
  disabled?: boolean | undefined;
  /** Portal target for the suggestions popup. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SearchOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired on every keystroke with the query; the caller fetches suggestions here. Also fired whenever
   * Search itself changes the text, so a controlled value can follow: with "" before `onClear`
   * (clear button or Escape), and with the suggestion's `label` before `onSubmit` when one is chosen.
   */
  onChange?: ((value: string) => void) | undefined;
  /** Fired on Enter, the submit button, or choosing a suggestion, with the trimmed query. Never with an empty query. */
  onSubmit?: ((value: string) => void) | undefined;
  /** Fired when the field is emptied — by the clear button, or by the Escape that clears it when no suggestions are open. */
  onClear?: (() => void) | undefined;
}

/**
 * Search — Design Schema, category: input.
 *
 * When to use:
 * Use Search for free-text search over a site, an app, or a large dataset: the header search, a search page's main field, a "filter the list" field over more than a couple of dozen rows. Add `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for the one primary search so screen-reader users can jump to it.
 *
 * The root is a `<form>` (role="search" while `landmark`); inside a Form component it is a `<div>`
 * so no form nests in a form, and Search handles Enter and its submit Button itself.
 */
export function Search({
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
  onKeyDown,
  id: idProp,
  ...rest
}: SearchProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const form = useFormContext();
  const inForm = form !== null;
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-search${generatedId}`);
  const labelId = `${id}-label`;
  const listboxId = `${id}-listbox`;

  const rootRef = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const pendingForward = useRef<string | null>(null);
  const pendingQuery = useRef<string | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLElement, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label) {
      console.warn('Search: `label` is required; it is the accessible name of the field.');
    }
  }, [label]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && inForm && action !== undefined) {
      console.warn('Search: `action` is ignored inside a Form; the enclosing Form owns submission.');
    }
  }, [inForm, action]);

  // value ⇄ onChange
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const text = isControlled ? value : internalValue;

  const isDisabled = disabled || (form?.disabled ?? false);
  const hasSuggestions = suggestions !== undefined;
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const showPopup = open && hasSuggestions && !isDisabled;

  // A disabled Search closes an open list.
  if (open && isDisabled) setOpen(false);

  /** Remounts the Listbox with no highlight: the only way to reset its internal active option. */
  const resetHighlight = () => {
    setActiveValue(null);
    setGeneration((g) => g + 1);
  };

  // A new result set (or loading) starts the highlight over.
  const signature = `${loading}|${(suggestions ?? []).map((row) => row.value).join(' ')}`;
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    resetHighlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  // Form registration: the trimmed query under `name` ("" when empty, never omitted); always valid;
  // a disabled Search (its own `disabled` or the Form's) is not registered.
  const latest = useRef({ label, text });
  latest.current = { label, text };
  useEffect(() => {
    if (!form || isDisabled) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => latest.current.text.trim(),
      isDisabled: () => false,
      validate: () => null,
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id, isDisabled]);

  // Anchor to the field; follow scrolling and resizing; forward a queued ArrowDown once the list mounts.
  useLayoutEffect(() => {
    if (!showPopup || !hydrated) {
      setPosition(null);
      return undefined;
    }
    const reposition = () => {
      const field = fieldRef.current;
      const popup = popupRef.current;
      if (!field || !popup) return;
      const next = computePosition(field.getBoundingClientRect(), popup.getBoundingClientRect());
      setPosition((previous) => (samePosition(previous, next) ? previous : next));
    };
    reposition();
    if (pendingForward.current !== null) {
      const key = pendingForward.current;
      pendingForward.current = null;
      listboxRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [showPopup, hydrated, generation, signature]);

  const closeList = () => {
    if (!open) return;
    setActiveValue(null);
    setOpen(false);
  };
  const closeRef = useRef(closeList);
  closeRef.current = closeList;

  // A pointer press or a focus move outside Search (its root and its portaled list) closes the list;
  // both use the same scope, so a press on a shown label or on the submit Button keeps it open.
  useEffect(() => {
    if (!showPopup) return undefined;
    const isOutside = (target: EventTarget | null) =>
      !(target instanceof Node) || (!rootRef.current?.contains(target) && !popupRef.current?.contains(target));
    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) closeRef.current();
    };
    const handleFocusOut = (event: FocusEvent) => {
      // A blur with no new focus target (a window switch) leaves the list open.
      if (event.relatedTarget === null) return;
      if (rootRef.current?.contains(event.target as Node) && isOutside(event.relatedTarget)) closeRef.current();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [showPopup]);

  // Live region: loading whenever suggestions are set and loading (open or not); the count and
  // no-suggestions only while the list is open. Emptied when the list closes.
  const count = loading ? 0 : (suggestions?.length ?? 0);
  const statusKind: 'none' | 'loading' | 'empty' | 'count' =
    hasSuggestions && loading && !isDisabled ? 'loading' : !showPopup ? 'none' : count === 0 ? 'empty' : 'count';
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    if (statusKind === 'none') {
      setAnnounced('');
      return undefined;
    }
    let message: string;
    if (statusKind === 'loading') message = COPY.loading;
    else if (statusKind === 'empty') message = COPY.noSuggestions;
    else {
      // The plural follows the nearest `lang` ancestor, else the runtime locale.
      const locale =
        rootRef.current?.closest('[lang]')?.getAttribute('lang') ||
        (typeof navigator === 'undefined' ? undefined : navigator.language);
      let rules: Intl.PluralRules;
      try {
        rules = new Intl.PluralRules(locale);
      } catch {
        rules = new Intl.PluralRules();
      }
      const phrase = rules.select(count) === 'one' ? COPY.suggestionsCount.one : COPY.suggestionsCount.other;
      message = phrase.replace('{count}', String(count));
    }
    const base = rootRef.current ? parseTime(getComputedStyle(rootRef.current).getPropertyValue(STATUS_DEBOUNCE.token)) : null;
    if (base === null) {
      setAnnounced(message);
      return undefined;
    }
    const timer = setTimeout(() => setAnnounced(message), base * STATUS_DEBOUNCE.multiply);
    return () => clearTimeout(timer);
  }, [statusKind, count]);

  const updateText = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  /**
   * Submits `raw`. Outside a Form every route goes through the native form, so with `action` it is a
   * GET submit; inside a Form Search fires `onSubmit` itself and never submits the enclosing Form.
   * Every attempt closes the list, including one an empty query refuses to send.
   */
  const submit = (raw: string) => {
    if (isDisabled) return;
    closeList();
    if (inForm) {
      const query = raw.trim();
      if (query !== '') onSubmit?.(query);
      return;
    }
    pendingQuery.current = raw;
    (rootRef.current as HTMLFormElement | null)?.requestSubmit();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const query = (pendingQuery.current ?? text).trim();
    pendingQuery.current = null;
    closeList();
    // The field never submits an empty query.
    if (isDisabled || query === '') {
      event.preventDefault();
      return;
    }
    onSubmit?.(query);
    // The form data set is built after this event: the URL carries the trimmed query.
    if (action && queryRef.current) queryRef.current.value = query;
    else event.preventDefault();
  };

  const clear = () => {
    if (isDisabled) return;
    updateText('');
    closeList();
    onClear?.();
    inputRef.current?.focus();
  };

  /** Fills the query with the suggestion's label and submits it; focus stays where it is. */
  const choose = (rowValue: string) => {
    const row = suggestions?.find((candidate) => candidate.value === rowValue);
    if (!row || isDisabled) return;
    updateText(row.label);
    submit(row.label);
  };

  const handleListboxChange = (next: ListboxValue) => {
    const chosen = Array.isArray(next) ? next[0] : next;
    if (chosen !== undefined && chosen !== '') choose(chosen);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    updateText(event.target.value);
    if (hasSuggestions) {
      if (open) resetHighlight();
      else setOpen(true);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (isDisabled) {
      // Every key in the keyboard table is inert; Enter must not submit natively either.
      if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
      }
      return;
    }
    switch (event.key) {
      case 'Enter': {
        event.preventDefault();
        if (showPopup && activeValue !== null) choose(activeValue);
        else submit(text);
        break;
      }
      case 'Escape': {
        if (showPopup) {
          event.preventDefault();
          closeList();
        } else if (text !== '') {
          event.preventDefault();
          clear();
        }
        break;
      }
      case 'ArrowDown': {
        if (!hasSuggestions) break;
        event.preventDefault();
        const target = listboxRef.current;
        if (!showPopup || !target) {
          // Opens and highlights the first once the list mounts.
          pendingForward.current = 'ArrowDown';
          setOpen(true);
        } else {
          // Listbox clamps at the last option, so ArrowDown never wraps.
          target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
        }
        break;
      }
      case 'ArrowUp': {
        // With no highlight, ArrowUp is a no-op; from the first suggestion it returns to the input.
        if (!showPopup || activeValue === null) break;
        event.preventDefault();
        if (activeValue === (loading ? undefined : suggestions?.[0]?.value)) resetHighlight();
        else listboxRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
        break;
      }
      case 'Tab': {
        // Focus moves on natively (to the clear or submit Button); the list closes explicitly.
        closeList();
        break;
      }
      default:
        break;
    }
  };

  const resolved = resolveOverrides(overrides);

  const listOptions: ListboxOption[] = loading
    ? []
    : (suggestions ?? []).map((row) =>
        row.description === undefined
          ? { value: row.value, label: row.label }
          : { value: row.value, label: row.label, description: row.description },
      );

  const classes = ['ds-search', `ds-search--${size}`, isDisabled ? 'ds-search--disabled' : null]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-search__label', showLabel ? null : 'ds-search__label--hidden'].filter(Boolean).join(' ');

  const popupStyle = {
    ...resolved.popup,
    ...(position
      ? {
          left: position.left,
          minInlineSize: position.minInlineSize,
          '--ds-search-anchor': `${position.anchor}px`,
        }
      : null),
  } as CSSProperties;

  const content = (
    <>
      <label htmlFor={id} id={labelId} className={labelClasses} data-part="label">
        <Text
          element="span"
          overrides={{
            fontWeight: overrides?.labelWeight ?? 'font.weight.medium',
            fontSize: overrides?.fontSize ?? (`font.size.${size}` as TokenRef),
          }}
        >
          {label}
        </Text>
      </label>
      <div ref={fieldRef} className="ds-search__field" data-part="field">
        {/* Icon owns its own data-part ("glyph"), so the anatomy name is on the wrapper. */}
        <span className="ds-search__icon" data-part="icon">
          <Icon name="search" size={size === 'lg' ? 'md' : 'sm'} overrides={{ color: 'color.foreground.muted' }} />
        </span>
        <input
          {...rest}
          ref={inputRef}
          id={id}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          className="ds-search__input"
          data-part="input"
          value={text}
          placeholder={placeholder}
          readOnly={isDisabled}
          role={hasSuggestions ? 'combobox' : 'searchbox'}
          aria-autocomplete={hasSuggestions ? 'list' : undefined}
          aria-expanded={hasSuggestions ? (showPopup ? 'true' : 'false') : undefined}
          aria-controls={showPopup && hydrated ? listboxId : undefined}
          aria-activedescendant={
            showPopup && hydrated && activeValue !== null ? `${listboxId}-option-${activeValue}` : undefined
          }
          aria-disabled={isDisabled ? 'true' : undefined}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {text !== '' ? (
          <span className="ds-search__control" data-part="clearButton">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              iconOnly
              label={COPY.clear}
              leadingIcon={<Icon name="close" inline />}
              disabled={isDisabled}
              onClick={clear}
            />
          </span>
        ) : null}
        <span className="ds-search__control" data-part="submitButton">
          <Button
            type={inForm ? 'button' : 'submit'}
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.submit}
            leadingIcon={<Icon name="arrow-right" inline />}
            disabled={isDisabled}
            onClick={inForm ? () => submit(text) : undefined}
          />
        </span>
      </div>
      {action && !inForm ? <input ref={queryRef} type="hidden" name={name} /> : null}
      <div role="status" aria-live="polite" className="ds-search__status">
        {announced}
      </div>
      {showPopup && hydrated
        ? createPortal(
            <div
              ref={popupRef}
              className="ds-search__suggestions"
              data-part="suggestions"
              data-vertical={position?.vertical ?? 'bottom'}
              style={popupStyle}
              // DOM focus never leaves the input while a suggestion is pressed.
              onMouseDown={(event) => event.preventDefault()}
            >
              <Listbox
                key={generation}
                ref={listboxRef}
                id={listboxId}
                label={label}
                embedded
                value=""
                options={listOptions}
                selectionFollowsFocus={false}
                emptyMessage={loading ? COPY.loading : COPY.noSuggestions}
                onChange={handleListboxChange}
                onActiveChange={setActiveValue}
              />
            </div>,
            container ?? document.body,
          )
        : null}
    </>
  );

  if (inForm) {
    return (
      <div
        ref={rootRef as Ref<HTMLDivElement>}
        data-ds="Search"
        data-ds-field=""
        data-part="form"
        role={landmark ? 'search' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        className={classes}
        style={resolved.root}
      >
        {content}
      </div>
    );
  }

  return (
    <form
      ref={rootRef as Ref<HTMLFormElement>}
      data-ds="Search"
      data-ds-field=""
      data-part="form"
      role={landmark ? 'search' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      className={classes}
      style={resolved.root}
      method={action ? 'get' : undefined}
      action={action}
      noValidate
      onSubmit={handleFormSubmit}
    >
      {content}
    </form>
  );
}
