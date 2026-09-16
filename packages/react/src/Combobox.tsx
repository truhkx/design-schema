import {
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
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Listbox, type ListboxOption, type ListboxValue } from './Listbox';
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './Combobox.css';

declare const process: { env: { NODE_ENV?: string } };

/** The selected value, or with `multiple` every selected value. */
export type ComboboxValue = string | string[];
export type ComboboxFilter = 'startsWith' | 'contains' | 'none' | 'async';

/** copy.* — used verbatim; `{label}`, `{value}` and `{count}` are the only interpolations. */
const COPY = {
  empty: 'No matches',
  loading: 'Loading…',
  addCustom: 'Add "{value}"',
  clearLabel: 'Clear',
  toggleLabel: 'Show options',
  removeChip: 'Remove {label}',
  resultCount: { one: '{count} result available', other: '{count} results available' },
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
} as const;

/** constant `statusDebounce`: motion.duration.base × 2, read from the token at run time. */
const STATUS_DEBOUNCE = { token: '--motion-duration-base', multiply: 2 } as const;

/** The value of the synthetic `copy.addCustom` row; never a selected value. */
const CUSTOM_ROW_VALUE = 'ds-combobox-custom';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/** Hooks on the root. `labelWeight` and `helperSize` are forwarded to the composed Text instead. */
const ROOT_HOOK: Partial<Record<ComboboxOverridableBinding, string>> = {
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

/** Hooks on the portaled popup, which does not inherit from the root. */
const POPUP_HOOK: Partial<Record<ComboboxOverridableBinding, string>> = {
  popupSurface: '--ds-combobox-popup-surface',
  popupBorder: '--ds-combobox-popup-border',
  popupShadow: '--ds-combobox-popup-shadow',
  popupRadius: '--ds-combobox-popup-radius',
  popupOffset: '--ds-combobox-popup-offset',
  layer: '--ds-combobox-layer',
  enter: '--ds-combobox-enter',
};

type ResolvedOverrides = {
  root: CSSProperties | undefined;
  popup: CSSProperties | undefined;
  label: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  helper: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
};

function resolveOverrides(overrides: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined): ResolvedOverrides {
  const root: Record<string, string> = {};
  const popup: Record<string, string> = {};
  let label: ResolvedOverrides['label'];
  let helper: ResolvedOverrides['helper'];
  for (const binding of Object.keys(overrides ?? {}) as ComboboxOverridableBinding[]) {
    const ref = overrides?.[binding];
    if (!ref) continue;
    // Locked bindings have no entry in either table, so they are ignored if passed.
    if (binding === 'labelWeight') label = { fontWeight: ref };
    else if (binding === 'helperSize') helper = { fontSize: ref };
    else if (ROOT_HOOK[binding]) root[ROOT_HOOK[binding]] = cssVar(ref);
    else if (POPUP_HOOK[binding]) popup[POPUP_HOOK[binding]] = cssVar(ref);
  }
  return {
    root: Object.keys(root).length ? (root as CSSProperties) : undefined,
    popup: Object.keys(popup).length ? (popup as CSSProperties) : undefined,
    label,
    helper,
  };
}

type ComboboxRow = { value: string; label: string; disabled?: boolean | undefined };

function isGroup(option: ListboxOption): option is { group: string; options: ListboxOption[] } {
  return 'group' in option;
}

function flattenRows(options: ListboxOption[]): ComboboxRow[] {
  const result: ComboboxRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

/** Keeps the rows matching `predicate`, dropping groups left empty. */
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

const COMBINING_MARKS = /\p{M}/gu;

/** Case- and diacritic-insensitive comparison key. */
function normalize(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

function toArray(value: ComboboxValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === '' ? [] : [value];
}

/** A resolved CSS time (`320ms`, `0.32s`) in ms; `null` when it cannot be read. */
function parseTime(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** Which option becomes active when the Listbox is (re)mounted; resolved against the rows on screen. */
type ActiveIntent = 'none' | 'selected' | 'selectedOrFirst' | 'selectedOrLast' | 'typeahead' | { value: string };

type PopupPosition = {
  vertical: 'top' | 'bottom';
  left: number;
  top: number | undefined;
  bottom: number | undefined;
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
    top: vertical === 'bottom' ? field.bottom : undefined,
    bottom: vertical === 'top' ? viewportHeight - field.top : undefined,
    minInlineSize: field.width,
  };
}

function samePosition(a: PopupPosition | null, b: PopupPosition): boolean {
  return (
    a !== null &&
    a.vertical === b.vertical &&
    a.left === b.left &&
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.minInlineSize === b.minInlineSize
  );
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
    | 'className'
    | 'style'
    | 'role'
    | 'autoComplete'
    | 'aria-autocomplete'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-activedescendant'
    | 'aria-disabled'
  > {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The full option set, or the current page of results when `filter` is `async`. Passed through to the Listbox after filtering. */
  options: ListboxOption[];
  /** Controlled selected value(s). With `multiple`, an array. With `allowCustom`, a value not in `options` is a custom entry. */
  value?: ComboboxValue | undefined;
  /** Initial value(s). */
  defaultValue?: ComboboxValue | undefined;
  /** Controlled popup state, for programmatic use and for stories and tests. Omit for the typing-driven default. */
  open?: boolean | undefined;
  /** Controlled text of the input (what the user has typed). Usually uncontrolled; controlled by consumers driving `async` filtering. */
  inputValue?: string | undefined;
  /**
   * Pick many: selected options appear as chips before the input, each removable; the list stays
   * open while toggling; Backspace in an empty input removes the last chip. Uses the same Listbox
   * engine as Select.
   */
  multiple?: boolean | undefined;
  /**
   * Typed text that matches no option can be committed as a value (tags, emails). Enter or a comma
   * commits it; the list shows `copy.addCustom` as a synthetic first row, suppressed when the
   * trimmed text already matches an existing option by either its `value` or its `label`.
   */
  allowCustom?: boolean | undefined;
  /**
   * How typing narrows `options`: by prefix, by substring (default), not at all (the list is a
   * picker; typing is type-ahead — it opens the list and moves the active option to the first label
   * starting with the typed characters, without filtering), or by the consumer (`async`: the
   * component shows `copy.loading` and the consumer updates `options` from `onInputChange`).
   */
  filter?: ComboboxFilter | undefined;
  /** Example input shown while empty. Never the only description. */
  placeholder?: string | undefined;
  /** Helper text under the label. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Not editable, not submitted, still readable and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** For `async`: show the loading row and announce it. The consumer sets it around its request. */
  loading?: boolean | undefined;
  /** Show a clear button when there is a value or text. */
  clearable?: boolean | undefined;
  /** Portal target for the popup. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ComboboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected value(s) change (array with `multiple`; custom entries included when `allowCustom`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired on every keystroke with the input text. The hook for `async` filtering. */
  onInputChange?: ((value: string) => void) | undefined;
  /** Fired when the list opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * Combobox — Design Schema, category: input.
 *
 * When to use:
 * Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.
 */
export const Combobox = function Combobox({
  ref,
  label,
  name,
  options,
  value,
  defaultValue,
  open: openProp,
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
  onKeyDown,
  onClick,
  onBlur,
  id: idProp,
  readOnly,
  ...rest
}: ComboboxProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-combobox${generatedId}`);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const listboxId = `${id}-listbox`;
  const optionId = (optionValue: string) => `${listboxId}-option-${optionValue}`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label) {
      console.warn('Combobox: `label` is required; it is the visible label and the accessible name.');
    }
  }, [label]);

  const rows = useMemo(() => flattenRows(options), [options]);
  const labelFor = (optionValue: string) => rows.find((row) => row.value === optionValue)?.label ?? optionValue;

  // value ⇄ onChange
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ComboboxValue | undefined>(defaultValue);
  const selected = isValueControlled ? value : internalValue;
  const selectedValues = toArray(selected);
  const singleValue = multiple ? undefined : selectedValues[0];

  // inputValue ⇄ onInputChange
  const isTextControlled = inputValue !== undefined;
  const [internalText, setInternalText] = useState<string>(() => {
    const initial = multiple ? undefined : toArray(value ?? defaultValue)[0];
    return initial === undefined ? '' : labelFor(initial);
  });
  const text = isTextControlled ? inputValue : internalText;
  const trimmedText = text.trim();

  // open ⇄ onOpenChange
  const isDisabled = disabled || (form?.disabled ?? false);
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = (openProp ?? internalOpen) && !isDisabled;

  const [showAll, setShowAll] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [openIntent, setOpenIntent] = useState<ActiveIntent>('selectedOrFirst');
  const [activeRequest, setActiveRequest] = useState<{ generation: number; intent: ActiveIntent }>({
    generation: 0,
    intent: 'selectedOrFirst',
  });
  const [seenOpen, setSeenOpen] = useState(isOpen);
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const [statusText, setStatusText] = useState('');

  /** Remounts the Listbox with a new starting active option: the only way to reset its internal state. */
  const requestActive = (intent: ActiveIntent) => {
    setActiveValue(null);
    setActiveRequest((request) => ({ generation: request.generation + 1, intent }));
  };

  // Opening from any source (typing, a key, the toggle, the `open` prop) starts a fresh list.
  if (isOpen !== seenOpen) {
    setSeenOpen(isOpen);
    setActiveValue(null);
    if (isOpen) {
      setActiveRequest((request) => ({ generation: request.generation + 1, intent: openIntent }));
      setOpenIntent('selectedOrFirst');
    } else {
      setShowAll(false);
    }
  }

  const resolvedError =
    error ?? form?.errors[name] ?? (invalid ? COPY.invalid.replace('{label}', label) : undefined);
  const isInvalid = invalid || resolvedError !== undefined;
  const isLoading = filter === 'async' && loading;

  // What the Listbox shows: filtered rows, the synthetic custom row first, nothing while loading.
  const query = showAll || filter === 'none' || filter === 'async' ? '' : normalize(trimmedText);
  const filteredOptions = useMemo(() => {
    if (query === '') return options;
    return filterTree(options, (row) =>
      filter === 'startsWith' ? normalize(row.label).startsWith(query) : normalize(row.label).includes(query),
    );
  }, [options, filter, query]);
  const resultCount = useMemo(() => flattenRows(filteredOptions).length, [filteredOptions]);

  const normalizedText = normalize(trimmedText);
  const showCustomRow =
    allowCustom &&
    trimmedText !== '' &&
    !rows.some((row) => normalize(row.value) === normalizedText || normalize(row.label) === normalizedText);
  const listOptions: ListboxOption[] = useMemo(() => {
    if (isLoading) return [];
    return showCustomRow
      ? [{ value: CUSTOM_ROW_VALUE, label: COPY.addCustom.replace('{value}', trimmedText) }, ...filteredOptions]
      : filteredOptions;
  }, [isLoading, showCustomRow, trimmedText, filteredOptions]);
  const enabledRows = useMemo(() => flattenRows(listOptions).filter((row) => !row.disabled), [listOptions]);

  const resolveIntent = (intent: ActiveIntent): string | undefined => {
    const selectedRow = enabledRows.find((row) => selectedValues.includes(row.value))?.value;
    if (intent === 'none') return undefined;
    if (intent === 'selected') return selectedRow;
    if (intent === 'selectedOrFirst') return selectedRow ?? enabledRows[0]?.value;
    if (intent === 'selectedOrLast') return selectedRow ?? enabledRows[enabledRows.length - 1]?.value;
    if (intent === 'typeahead') {
      return normalizedText === ''
        ? undefined
        : enabledRows.find((row) => normalize(row.label).startsWith(normalizedText))?.value;
    }
    return enabledRows.some((row) => row.value === intent.value) ? intent.value : undefined;
  };
  const requestedActive = resolveIntent(activeRequest.intent);

  // The Listbox takes its starting active option when it receives focus; signal that without moving DOM focus.
  useLayoutEffect(() => {
    if (!isOpen || requestedActive === undefined) return;
    listboxRef.current?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeRequest.generation]);

  // New results (async pages, loading) replace the rows under the active option.
  const rowSignature = `${isLoading}|${rows.map((row) => row.value).join(' ')}`;
  const lastRowSignature = useRef(rowSignature);
  useEffect(() => {
    if (lastRowSignature.current === rowSignature) return;
    lastRowSignature.current = rowSignature;
    if (isOpen) requestActive('none');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSignature]);

  // A single selection that changes from outside shows its label.
  useEffect(() => {
    if (multiple || isTextControlled || singleValue === undefined) return;
    setInternalText(labelFor(singleValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleValue]);

  // Form registration.
  const latest = useRef({ label, required, invalid, error, disabled: isDisabled, selected, multiple });
  latest.current = { label, required, invalid, error, disabled: isDisabled, selected, multiple };
  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      // form.valueType is string[]: every value with `multiple`, the value otherwise; no key when empty.
      getValue: () => {
        const values = toArray(latest.current.selected);
        if (values.length === 0) return undefined;
        return latest.current.multiple ? values : values[0];
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const current = latest.current;
        if (current.error !== undefined) return current.error;
        if (current.required && toArray(current.selected).length === 0) return COPY.required.replace('{label}', current.label);
        if (current.invalid) return COPY.invalid.replace('{label}', current.label);
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  // Polite announcement of result count, loading and empty, after `statusDebounce`.
  const statusMessage = isLoading
    ? COPY.loading
    : resultCount === 0
      ? COPY.empty
      : (new Intl.PluralRules(undefined).select(resultCount) === 'one' ? COPY.resultCount.one : COPY.resultCount.other).replace(
          '{count}',
          String(resultCount),
        );
  useEffect(() => {
    if (!isOpen) {
      setStatusText('');
      return undefined;
    }
    const base = rootRef.current ? parseTime(getComputedStyle(rootRef.current).getPropertyValue(STATUS_DEBOUNCE.token)) : null;
    const timer = setTimeout(() => setStatusText(statusMessage), base === null ? 0 : base * STATUS_DEBOUNCE.multiply);
    return () => clearTimeout(timer);
  }, [isOpen, statusMessage]);

  // Anchor to the field; follow scrolling and resizing.
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const reposition = () => {
      const field = fieldRef.current;
      const popup = popupRef.current;
      if (!field || !popup) return;
      const next = computePosition(field.getBoundingClientRect(), popup.getBoundingClientRect());
      setPosition((previous) => (samePosition(previous, next) ? previous : next));
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, listOptions]);

  const setOpenState = (next: boolean) => {
    if (next === isOpen || (next && isDisabled)) return;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const openWith = (intent: ActiveIntent) => {
    if (isOpen) {
      requestActive(intent);
      return;
    }
    setOpenIntent(intent);
    setOpenState(true);
  };

  const close = () => setOpenState(false);
  const closeRef = useRef(close);
  closeRef.current = close;

  // Outside pointerdown and focus moving outside close the list.
  useEffect(() => {
    if (!isOpen) return undefined;
    const isOutside = (target: EventTarget | null) =>
      !(target instanceof Node) || (!fieldRef.current?.contains(target) && !popupRef.current?.contains(target));
    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target)) closeRef.current();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (fieldRef.current?.contains(event.target as Node) && isOutside(event.relatedTarget)) closeRef.current();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isOpen]);

  const commitValue = (next: ComboboxValue) => {
    if (!isValueControlled) setInternalValue(next);
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const updateText = (next: string) => {
    if (next === text) return;
    if (!isTextControlled) setInternalText(next);
    onInputChange?.(next);
  };

  const commitCustom = (raw: string) => {
    if (raw === '') return;
    if (multiple) {
      if (!selectedValues.includes(raw)) commitValue([...selectedValues, raw]);
      updateText('');
      requestActive('none');
    } else {
      if (raw !== singleValue) commitValue(raw);
      updateText(raw);
      close();
    }
  };

  /** Commits one row: single selects and closes; multiple toggles (selection order), clears the text and stays open. */
  const commitRow = (rowValue: string) => {
    if (rowValue === CUSTOM_ROW_VALUE) {
      commitCustom(trimmedText);
      return;
    }
    if (multiple) {
      commitValue(
        selectedValues.includes(rowValue) ? selectedValues.filter((v) => v !== rowValue) : [...selectedValues, rowValue],
      );
      updateText('');
      requestActive({ value: rowValue });
    } else {
      if (rowValue !== singleValue) commitValue(rowValue);
      updateText(labelFor(rowValue));
      close();
    }
  };

  const handleListboxChange = (next: ListboxValue) => {
    if (!Array.isArray(next)) {
      commitRow(next);
      return;
    }
    const toggled = next.find((v) => !selectedValues.includes(v)) ?? selectedValues.find((v) => !next.includes(v));
    if (toggled !== undefined) commitRow(toggled);
  };

  const handlePopupClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // Listbox reports no change when the already-selected option is pressed; single-select still closes.
    if (multiple || singleValue === undefined) return;
    const option = (event.target as Element).closest('[role="option"]');
    if (option && option.id === optionId(singleValue) && option.getAttribute('aria-disabled') !== 'true') {
      updateText(labelFor(singleValue));
      close();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    setShowAll(false);
    updateText(event.target.value);
    openWith(filter === 'none' ? 'typeahead' : 'none');
  };

  const handleInputClick = (event: ReactMouseEvent<HTMLInputElement>) => {
    onClick?.(event);
    if (isDisabled || isOpen) return;
    setShowAll(true);
    openWith('selectedOrFirst');
  };

  const handleInputBlur = (event: ReactFocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const forwardToListbox = (key: string) => {
    listboxRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (isDisabled) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const down = event.key === 'ArrowDown';
        if (down && event.altKey) {
          if (!isOpen) openWith('selected');
        } else if (!isOpen) {
          openWith(down ? 'selectedOrFirst' : 'selectedOrLast');
        } else {
          forwardToListbox(event.key);
        }
        break;
      }
      case 'Enter': {
        if (!isOpen) break;
        event.preventDefault();
        if (activeValue !== null) commitRow(activeValue);
        else if (allowCustom) commitCustom(trimmedText);
        break;
      }
      case ',': {
        if (!allowCustom) break;
        event.preventDefault();
        commitCustom(trimmedText);
        break;
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault();
          close();
        } else if (clearable && text !== '') {
          event.preventDefault();
          updateText('');
        }
        break;
      }
      case 'Tab': {
        // Focus moves on natively; a highlighted option is not committed.
        if (isOpen) close();
        break;
      }
      case 'Backspace': {
        if (multiple && text === '' && selectedValues.length > 0) {
          event.preventDefault();
          commitValue(selectedValues.slice(0, -1));
        }
        break;
      }
      default:
        break;
    }
  };

  const handleClear = () => {
    updateText('');
    if (selectedValues.length > 0) commitValue(multiple ? [] : '');
    inputRef.current?.focus();
  };

  const handleToggle = () => {
    if (isDisabled) return;
    inputRef.current?.focus();
    if (isOpen) {
      close();
      return;
    }
    setShowAll(true);
    openWith('selectedOrFirst');
  };

  const handleRemoveChip = (chipValue: string) => {
    commitValue(selectedValues.filter((v) => v !== chipValue));
    inputRef.current?.focus();
  };

  const handleFieldMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };

  const resolved = resolveOverrides(overrides);
  const describedBy = [description ? descriptionId : null, resolvedError !== undefined ? errorId : null]
    .filter(Boolean)
    .join(' ');
  const showClear = clearable && !isDisabled && (selectedValues.length > 0 || text !== '');

  const classes = ['ds-combobox', isInvalid ? 'ds-combobox--invalid' : null, isDisabled ? 'ds-combobox--disabled' : null]
    .filter(Boolean)
    .join(' ');

  const popupStyle: CSSProperties = {
    ...resolved.popup,
    ...(position
      ? { left: position.left, top: position.top, bottom: position.bottom, minInlineSize: position.minInlineSize }
      : null),
  };

  return (
    <div ref={rootRef} data-ds="Combobox" data-ds-field="" className={classes} style={resolved.root}>
      <label htmlFor={id} id={labelId} className="ds-combobox__label" data-part="label">
        <Text element="span" weight="medium" overrides={resolved.label}>
          {label}
          {required ? COPY.requiredIndicator : null}
        </Text>
      </label>
      {description ? (
        <Text element="p" id={descriptionId} size="sm" tone="muted" data-part="description" overrides={resolved.helper}>
          {description}
        </Text>
      ) : null}
      <div ref={fieldRef} className="ds-combobox__field" data-part="field" onMouseDown={handleFieldMouseDown}>
        {multiple && selectedValues.length > 0 ? (
          <span className="ds-combobox__chips" data-part="chips">
            {selectedValues.map((chipValue) => {
              const chipLabel = labelFor(chipValue);
              return (
                <span key={chipValue} className="ds-combobox__chip" data-part="chip">
                  <span className="ds-combobox__chip-label">{chipLabel}</span>
                  {/* Button owns its own data-part; the wrapper carries the anatomy name. */}
                  <span className="ds-combobox__control" data-part="chipRemove">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      label={COPY.removeChip.replace('{label}', chipLabel)}
                      leadingIcon={<Icon name="close" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
                      disabled={isDisabled}
                      onClick={() => handleRemoveChip(chipValue)}
                    />
                  </span>
                </span>
              );
            })}
          </span>
        ) : null}
        <input
          {...rest}
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          className="ds-combobox__input"
          data-part="input"
          value={text}
          placeholder={placeholder}
          readOnly={isDisabled || readOnly}
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeValue !== null ? optionId(activeValue) : undefined}
          aria-describedby={describedBy || undefined}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
        />
        {showClear ? (
          <span className="ds-combobox__control" data-part="clearButton">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              label={COPY.clearLabel}
              leadingIcon={<Icon name="close" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
              onClick={handleClear}
            />
          </span>
        ) : null}
        <span className="ds-combobox__control" data-part="toggleButton">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.toggleLabel}
            leadingIcon={<Icon name="chevron-down" inline overrides={{ color: 'color.foreground.muted' as TokenRef }} />}
            disabled={isDisabled}
            tabIndex={-1}
            onClick={handleToggle}
          />
        </span>
      </div>
      {resolvedError !== undefined ? (
        <Text element="p" id={errorId} size="sm" tone="danger" data-part="errorMessage" overrides={resolved.helper}>
          {resolvedError}
        </Text>
      ) : null}
      <div role="status" aria-live="polite" className="ds-combobox__status" data-part="status">
        {statusText}
      </div>
      {selectedValues.map((hiddenValue) => (
        <input key={hiddenValue} type="hidden" name={name} value={hiddenValue} disabled={isDisabled} />
      ))}
      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popupRef}
              className="ds-combobox__popup"
              data-part="popup"
              data-vertical={position?.vertical ?? 'bottom'}
              style={popupStyle}
              // DOM focus never leaves the input while an option is pressed.
              onMouseDown={(event) => event.preventDefault()}
              onClick={handlePopupClick}
            >
              <Listbox
                key={activeRequest.generation}
                ref={listboxRef}
                id={listboxId}
                label={label}
                labelledBy={labelId}
                options={listOptions}
                multiple={multiple}
                value={multiple ? selectedValues : singleValue}
                selectionFollowsFocus={false}
                embedded
                loading={isLoading}
                disabled={isDisabled}
                emptyMessage={COPY.empty}
                initialActiveValue={requestedActive}
                onChange={handleListboxChange}
                onActiveChange={setActiveValue}
              />
            </div>,
            container ?? document.body,
          )
        : null}
    </div>
  );
};
