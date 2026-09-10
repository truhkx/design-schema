import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text, type TextOverridableBinding } from './Text';
import { Button } from './Button';
import { Listbox, type ListboxOption, type ListboxValue } from './Listbox';
import { useFormContext } from './FormContext';
import './Combobox.css';

export type ComboboxValue = string | string[];
export type ComboboxFilter = 'startsWith' | 'contains' | 'none' | 'async';

/** copy.* — used verbatim; `{label}`/`{value}`/`{count}` are replaced as noted per string. */
const COPY = {
  empty: 'No matches',
  loading: 'Loading…',
  addCustom: 'Add "{value}"',
  clearLabel: 'Clear',
  toggleLabel: 'Show options',
  removeChip: 'Remove {label}',
  resultCount: '{count} results available',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
};

/** debounce for the live status region: `motion.duration.base` × 2 (the doc calls out ~500ms). Not itself a token. */
const STATUS_DEBOUNCE_MS = 500;

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight`/`helperSize` are forwarded to the composed `Text` label/description's
 * own `overrides`, since Text already owns those bindings.
 */
export type ComboboxOverridableBinding =
  | 'fieldBorderFocus'
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

const ROOT_OVERRIDE_HOOK: Partial<Record<ComboboxOverridableBinding, string>> = {
  fieldBorderFocus: '--ds-combobox-field-border-focus',
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
  fontFamily: '--ds-combobox-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-combobox-font-size',
  chipSize: '--ds-combobox-chip-size',
  lineHeight: '--ds-combobox-line-height',
  disabledOpacity: '--ds-combobox-disabled-opacity',
};

/** The popup is portaled, so its own bindings — and the ones its nested Listbox reads via the
 * sanctioned CSS custom-property escape hatch — are set on the popup node itself. */
const POPUP_OVERRIDE_HOOK: Partial<Record<ComboboxOverridableBinding, string>> = {
  popupSurface: '--ds-combobox-popup-surface',
  popupBorder: '--ds-combobox-popup-border',
  popupShadow: '--ds-combobox-popup-shadow',
  popupRadius: '--ds-combobox-popup-radius',
  popupOffset: '--ds-combobox-popup-offset',
  layer: '--ds-combobox-layer',
  enter: '--ds-combobox-enter',
};

function resolveOverrides(overrides: Partial<Record<ComboboxOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  popupStyle: CSSProperties;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const popupStyle: Record<string, string> = {};
  const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  for (const binding of Object.keys(overrides) as ComboboxOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    if (binding === 'labelWeight') {
      labelOverrides.fontWeight = ref;
      continue;
    }
    if (binding === 'helperSize') {
      descriptionOverrides.fontSize = ref;
      continue;
    }
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) {
      rootStyle[rootHook] = cssVar(ref);
      continue;
    }
    const popupHook = POPUP_OVERRIDE_HOOK[binding];
    if (popupHook) popupStyle[popupHook] = cssVar(ref);
  }
  return {
    rootStyle: rootStyle as CSSProperties,
    popupStyle: popupStyle as CSSProperties,
    labelOverrides,
    descriptionOverrides,
  };
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

type ComboboxRow = { value: string; label: string; disabled?: boolean };

function isGroup(option: ListboxOption): option is { group: string; options: ListboxOption[] } {
  return 'group' in option;
}

/** Depth-first rows, dropping group wrappers — used to resolve a value to its label and to filter. */
function flattenRows(options: ListboxOption[]): ComboboxRow[] {
  const result: ComboboxRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

/** Filters a (possibly grouped) option tree by a row predicate, dropping groups left empty. */
function filterTree(options: ListboxOption[], predicate: (row: ComboboxRow) => boolean): ListboxOption[] {
  const result: ListboxOption[] = [];
  for (const option of options) {
    if (isGroup(option)) {
      const children = filterTree(option.options, predicate);
      if (children.length > 0) result.push({ group: option.group, options: children });
    } else if (predicate(option)) {
      result.push(option);
    }
  }
  return result;
}

/** Case- and diacritic-insensitive comparison key. */
const DIACRITIC_MARKS = new RegExp('[̀-ͯ]', 'g');

function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITIC_MARKS, '').toLowerCase();
}

function toArray(value: ComboboxValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function labelFor(value: string, rows: ComboboxRow[]): string {
  return rows.find((row) => row.value === value)?.label ?? value;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Moves focus to the next (or previous) document-order tabbable element relative to `anchor`, ignoring `exclude`. */
function focusAdjacent(anchor: HTMLElement | null, exclude: HTMLElement | null, direction: 1 | -1) {
  if (!anchor) return;
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !exclude || !exclude.contains(element),
  );
  const index = all.indexOf(anchor);
  if (index === -1) return;
  all[index + direction]?.focus();
}

type ResolvedPosition = { style: CSSProperties; vertical: 'top' | 'bottom' };

/** Positions the popup below (or above, on overflow) the field, left-aligned and at least as wide as it. */
function computePosition(fieldRect: DOMRect, popupRect: DOMRect): ResolvedPosition {
  const viewportHeight = window.innerHeight;
  let vertical: 'top' | 'bottom' = 'bottom';
  if (fieldRect.bottom + popupRect.height > viewportHeight && fieldRect.top - popupRect.height >= 0) {
    vertical = 'top';
  }
  const style: Record<string, string | number> = {
    left: fieldRect.left,
    '--ds-combobox-field-width': `${fieldRect.width}px`,
  };
  if (vertical === 'bottom') style.top = fieldRect.bottom;
  else style.bottom = viewportHeight - fieldRect.top;
  return { style: style as CSSProperties, vertical };
}

export interface ComboboxProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'required'
    | 'disabled'
    | 'onChange'
    | 'children'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'autoComplete'
  > {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxOption[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue;
  /** Initial value(s). */
  defaultValue?: ComboboxValue;
  /** Controlled text of the input. Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string;
  /**
   * Pick many: selected options appear as chips before the input, each removable; the list stays
   * open while toggling; Backspace in an empty input removes the last chip.
   */
  multiple?: boolean;
  /**
   * Typed text that matches no option can be committed as a value (tags, emails). Enter or a
   * separator (comma) commits it; the list shows `copy.addCustom` as the first row.
   */
  allowCustom?: boolean;
  /**
   * How typing narrows `options`: by prefix, by substring (default), not at all (the list is a
   * picker; typing only moves the active option), or by the consumer (`async`).
   */
  filter?: ComboboxFilter;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string;
  /** Helper text under the label. */
  description?: string;
  /** Must have a value to submit. */
  required?: boolean;
  /** Not editable, not submitted, still readable and focusable. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  loading?: boolean;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean;
  /** Portal target for the popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef>>;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: (value: ComboboxValue) => void;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: (text: string) => void;
  /** Fired when the list opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Combobox — Design Schema, category: input.
 *
 * When to use:
 * Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be
 * typed faster than found (dates, codes), for `async` search against a server, and for multi-value
 * fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when
 * new values are legitimate (tags, invitees by email) and never when the value must exist (a
 * customer id). Use `filter: none` when the list is short but chips are wanted.
 *
 * Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use
 * it as a search box that navigates to results. Do not use it to pick a date. Do not disable
 * typing to get a Select; use Select.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    name,
    options,
    value,
    defaultValue,
    inputValue,
    multiple = false,
    allowCustom = false,
    filter = 'contains',
    placeholder,
    description,
    required = false,
    disabled = false,
    invalid = false,
    error,
    loading = false,
    clearable = true,
    container,
    overrides,
    onChange,
    onInputChange,
    onOpenChange,
    id: idProp,
    className,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-combobox${generatedId}`);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const statusId = `${id}-status`;
  const listboxId = `${id}-listbox`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const pendingForward = useRef<string | null>(null);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ComboboxValue | undefined>(defaultValue ?? (multiple ? [] : undefined));
  const selected = isControlled ? value : internalValue;

  const rows = useMemo(() => flattenRows(options), [options]);

  const isTextControlled = inputValue !== undefined;
  const [internalText, setInternalText] = useState<string>(() => {
    if (multiple) return '';
    const initial = typeof defaultValue === 'string' ? defaultValue : typeof value === 'string' ? value : undefined;
    return initial ? labelFor(initial, rows) : '';
  });
  const text = isTextControlled ? (inputValue as string) : internalText;

  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [forceFullList, setForceFullList] = useState(false);
  const [listboxGeneration, setListboxGeneration] = useState(0);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);
  const [statusText, setStatusText] = useState('');

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;
  const isLoading = filter === 'async' && loading;

  // Text-select fields mirror the current single selection's label whenever it changes from
  // outside; while the popup is open and the user is typing, `selected` itself has not changed
  // yet, so live filtering is never clobbered by this.
  useEffect(() => {
    if (isTextControlled || multiple) return;
    if (typeof selected === 'string' && selected !== '') setInternalText(labelFor(selected, rows));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  if (isDev && !label) {
    console.warn('Combobox: `label` is required and becomes the input’s accessible name.');
  }

  const latest = useRef({ label, required, disabled: isDisabled, selected, multiple, invalid, error });
  latest.current = { label, required, disabled: isDisabled, selected, multiple, invalid, error };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => {
        const { selected: current, multiple: isMultiple } = latest.current;
        if (isMultiple) {
          const values = toArray(current);
          return values.length > 0 ? values : undefined;
        }
        return typeof current === 'string' && current !== '' ? current : undefined;
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, selected: current, multiple: isMultiple, invalid: isInvalidProp, error: errorProp } =
          latest.current;
        if (errorProp !== undefined) return errorProp;
        const hasSelection = isMultiple ? toArray(current).length > 0 : typeof current === 'string' && current !== '';
        if (isRequired && !hasSelection) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const commitValue = (next: ComboboxValue) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const updateText = (next: string) => {
    if (!isTextControlled) setInternalText(next);
    onInputChange?.(next);
  };

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const openList = () => {
    if (open || isDisabled) return;
    changeOpen(true);
  };

  const closeList = () => {
    if (!open) return;
    setActiveValue(null);
    changeOpen(false);
  };

  // Filtered (and, for `allowCustom`, augmented) option tree handed to the Listbox.
  const normalizedQuery = normalize((forceFullList || filter === 'none' ? '' : text).trim());
  const filteredTree = useMemo(() => {
    if (filter === 'async' || filter === 'none' || normalizedQuery === '') return options;
    const predicate = (row: ComboboxRow) => {
      const label = normalize(row.label);
      return filter === 'startsWith' ? label.startsWith(normalizedQuery) : label.includes(normalizedQuery);
    };
    return filterTree(options, predicate);
  }, [options, filter, normalizedQuery]);

  const trimmedText = text.trim();
  const showCustomRow =
    allowCustom &&
    trimmedText !== '' &&
    !rows.some((row) => normalize(row.label) === normalize(trimmedText) || normalize(row.value) === normalize(trimmedText));

  const displayOptions: ListboxOption[] = useMemo(() => {
    const tree = showCustomRow
      ? [{ value: trimmedText, label: COPY.addCustom.replace('{value}', trimmedText) }, ...filteredTree]
      : filteredTree;
    if (isLoading) return [{ value: '__loading__', label: COPY.loading, disabled: true }, ...tree];
    return tree;
  }, [filteredTree, showCustomRow, trimmedText, isLoading]);

  const displayRowCount = useMemo(() => flattenRows(filteredTree).length, [filteredTree]);

  // Live announcement of result count / loading / empty, debounced so it does not chatter per keystroke.
  useEffect(() => {
    if (!open) {
      setStatusText('');
      return undefined;
    }
    const timer = setTimeout(() => {
      if (isLoading) setStatusText(COPY.loading);
      else if (displayRowCount === 0) setStatusText(COPY.empty);
      else setStatusText(COPY.resultCount.replace('{count}', String(displayRowCount)));
    }, STATUS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [open, isLoading, displayRowCount]);

  // Position the popup; reposition while scrolling or resizing.
  useLayoutEffect(() => {
    if (!open) {
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
      setPopupStyle(result.style);
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
  }, [open, listboxGeneration]);

  // A pointer click or focus move outside, or the window losing focus, closes.
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

  const toggleChip = (optionValue: string) => {
    const current = toArray(selected);
    commitValue(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
  };

  const commitCustomValue = (raw: string) => {
    if (multiple) {
      const current = toArray(selected);
      if (!current.includes(raw)) commitValue([...current, raw]);
      updateText('');
    } else {
      commitValue(raw);
      updateText(raw);
      closeList();
    }
  };

  const handleListboxChange = (next: ListboxValue) => {
    if (multiple) {
      commitValue(next as ComboboxValue);
      updateText('');
      inputRef.current?.focus();
    } else {
      commitValue(next as ComboboxValue);
      updateText(labelFor(next as string, rows));
      closeList();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    setForceFullList(false);
    setActiveValue(null);
    // `none` never filters, so the option set — and the Listbox's internal active-option state —
    // has no reason to reset; every other mode narrows the set and reopens with no active option.
    if (filter !== 'none') setListboxGeneration((g) => g + 1);
    if (multiple && allowCustom && raw.includes(',')) {
      const parts = raw.split(',');
      const toCommit = parts
        .slice(0, -1)
        .map((part) => part.trim())
        .filter(Boolean);
      const remainder = parts[parts.length - 1];
      if (toCommit.length > 0) {
        const current = toArray(selected);
        const next = [...current];
        for (const part of toCommit) if (!next.includes(part)) next.push(part);
        commitValue(next);
      }
      updateText(remainder);
    } else {
      updateText(raw);
    }
    openList();
  };

  const handleInputClick = () => {
    if (isDisabled) return;
    openList();
  };

  const handleFieldMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) inputRef.current?.focus();
  };

  const handleClear = () => {
    updateText('');
    if (multiple) commitValue([]);
    else commitValue('');
    inputRef.current?.focus();
  };

  const handleToggleClick = () => {
    if (isDisabled) return;
    if (open) {
      closeList();
      return;
    }
    setForceFullList(true);
    setListboxGeneration((g) => g + 1);
    openList();
    inputRef.current?.focus();
  };

  const handleRemoveChip = (chipValue: string) => {
    const current = toArray(selected);
    commitValue(current.filter((v) => v !== chipValue));
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        // Shift is never forwarded: Listbox's own shift+arrow range-select is not part of this
        // component's keyboard model, only plain ArrowDown/ArrowUp.
        event.preventDefault();
        openList();
        if (!event.altKey) dispatchToListbox('ArrowDown');
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        openList();
        dispatchToListbox('ArrowUp');
        break;
      }
      case 'Enter': {
        if (!open) break;
        event.preventDefault();
        if (activeValue) {
          if (multiple) toggleChip(activeValue);
          else dispatchToListbox('Enter');
        } else if (allowCustom && trimmedText !== '') {
          commitCustomValue(trimmedText);
        }
        break;
      }
      case 'Escape': {
        if (open) {
          event.preventDefault();
          closeList();
        } else if (clearable && text !== '') {
          event.preventDefault();
          updateText('');
        }
        break;
      }
      case 'Tab': {
        if (open) {
          event.preventDefault();
          const anchor = inputRef.current;
          const popup = popupRef.current;
          closeList();
          focusAdjacent(anchor, popup, event.shiftKey ? -1 : 1);
        }
        break;
      }
      case 'Backspace': {
        if (multiple && text === '') {
          const current = toArray(selected);
          if (current.length > 0) {
            event.preventDefault();
            commitValue(current.slice(0, -1));
          }
        }
        break;
      }
      default:
        break;
    }
  };

  const resolved = overrides ? resolveOverrides(overrides) : undefined;
  const mergedStyle = resolved?.rootStyle || style ? { ...resolved?.rootStyle, ...style } : undefined;
  const mergedPopupStyle = { ...popupStyle, ...resolved?.popupStyle };

  const classes = [
    'ds-combobox',
    isInvalid ? 'ds-combobox--invalid' : null,
    isDisabled ? 'ds-combobox--disabled' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null, statusId]
    .filter(Boolean)
    .join(' ');

  const chips = multiple ? toArray(selected).map((v) => ({ value: v, label: labelFor(v, rows) })) : [];
  const hasValue = multiple ? chips.length > 0 : typeof selected === 'string' && selected !== '';
  const showClear = clearable && !isDisabled && (hasValue || text !== '');

  const labelNode = (
    <label htmlFor={id} id={labelId} className="ds-combobox__label" data-part="label">
      <Text
        element="span"
        weight="medium"
        overrides={Object.keys(resolved?.labelOverrides ?? {}).length ? resolved!.labelOverrides : undefined}
      >
        {label}
        {required ? <span className="ds-combobox__required">{COPY.requiredIndicator}</span> : null}
      </Text>
    </label>
  );

  const descriptionNode = description ? (
    <Text
      element="p"
      id={descriptionId}
      size="sm"
      tone="muted"
      data-part="description"
      overrides={Object.keys(resolved?.descriptionOverrides ?? {}).length ? resolved!.descriptionOverrides : undefined}
    >
      {description}
    </Text>
  ) : null;

  const errorNode = resolvedError ? (
    <Text element="span" id={errorId} role="alert" size="sm" tone="danger" data-part="errorMessage">
      {resolvedError}
    </Text>
  ) : null;

  const activeDescendant = open && activeValue ? `${listboxId}-option-${activeValue}` : undefined;
  const popupClasses = ['ds-combobox__popup', entered ? 'ds-combobox__popup--entered' : null].filter(Boolean).join(' ');

  return (
    <div data-ds="Combobox" data-part="root" className={classes} style={mergedStyle}>
      {labelNode}
      {descriptionNode}
      <div
        ref={fieldRef}
        className="ds-combobox__field"
        data-part="field"
        onMouseDown={handleFieldMouseDown}
      >
        {chips.map((chip) => (
          <span key={chip.value} className="ds-combobox__chip" data-part="chip">
            <span className="ds-combobox__chip-label">{chip.label}</span>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              label={COPY.removeChip.replace('{label}', chip.label)}
              leadingIcon={<Icon name="close" inline />}
              disabled={isDisabled}
              data-part="chipRemove"
              onClick={() => handleRemoveChip(chip.value)}
            />
          </span>
        ))}
        <input
          {...rest}
          ref={inputRef}
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeDescendant}
          aria-haspopup="listbox"
          aria-describedby={describedBy || undefined}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          autoComplete="off"
          data-part="input"
          className="ds-combobox__input"
          value={text}
          placeholder={chips.length === 0 ? placeholder : undefined}
          readOnly={isDisabled ? true : rest.readOnly}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {showClear ? (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.clearLabel}
            leadingIcon={<Icon name="close" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
            data-part="clearButton"
            onClick={handleClear}
          />
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          label={COPY.toggleLabel}
          leadingIcon={<Icon name="chevron-down" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
          disabled={isDisabled}
          data-part="toggleButton"
          onClick={handleToggleClick}
        />
      </div>
      {multiple
        ? chips.map((chip) => <input key={chip.value} type="hidden" name={name} value={chip.value} disabled={isDisabled} />)
        : typeof selected === 'string' && selected !== ''
          ? <input type="hidden" name={name} value={selected} disabled={isDisabled} />
          : null}
      {errorNode}
      <div id={statusId} data-part="status" role="status" aria-live="polite" className="ds-combobox__status">
        {statusText}
      </div>
      {open
        ? createPortal(
            <div ref={popupRef} data-part="popup" data-vertical={vertical} className={popupClasses} style={mergedPopupStyle}>
              {/* Remounted on every narrowing keystroke: Listbox owns its active-option state
                  internally with no external reset hook, so a fresh key is how "opens with no
                  active option" (per the keyboard model) is guaranteed after each filter change. */}
              <Listbox
                key={listboxGeneration}
                ref={listboxRef}
                id={listboxId}
                label={label}
                labelledBy={labelId}
                options={displayOptions}
                multiple={multiple}
                value={selected}
                selectionFollowsFocus={false}
                disabled={isDisabled}
                emptyMessage={isLoading ? COPY.loading : COPY.empty}
                onChange={handleListboxChange}
                onActiveChange={setActiveValue}
              />
            </div>,
            container ?? document.body,
          )
        : null}
    </div>
  );
});
