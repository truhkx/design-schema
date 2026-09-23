import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Listbox.css';

declare const process: { env: { NODE_ENV?: string } };

/** One selectable row. */
export type ListboxOption = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};

/** A labelled cluster of rows; groups do not nest. */
export type ListboxGroup = { group: string; options: ListboxOption[] };

/** The element type of `options`: a row or a group (Select and Combobox take the same `ListboxItem[]`). */
export type ListboxItem = ListboxOption | ListboxGroup;

/** A value, or with `multiple` an array of values. */
export type ListboxValue = string | string[];
export type ListboxMaxVisible = '5' | '8' | '12' | 'all' | 5 | 8 | 12;

/**
 * copy.* — used verbatim; `{label}` is replaced by the `label` prop. `selectedCount` is not rendered
 * by the list: it is exported for a host (Select, Combobox) or the surrounding UI to show.
 */
export const LISTBOX_COPY: {
  readonly empty: 'No options';
  readonly required: '{label} is required.';
  readonly invalid: '{label} is not valid.';
  readonly selectedCount: '{count} selected';
  readonly loading: 'Loading…';
} = {
  empty: 'No options',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  selectedCount: '{count} selected',
  loading: 'Loading…',
};
const COPY = LISTBOX_COPY;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const OVERRIDE_HOOK: Record<ListboxOverridableBinding, string> = {
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
  fontFamily: '--ds-listbox-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-listbox-font-size',
  lineHeight: '--ds-listbox-line-height',
  disabledOpacity: '--ds-listbox-disabled-opacity',
  typeaheadReset: '--ds-listbox-typeahead-reset',
};

/** Surface chrome the host popup owns while `embedded`: overrides change values, never presence. */
const EMBEDDED_NO_OP: ReadonlySet<ListboxOverridableBinding> = new Set(['border', 'borderInvalid', 'borderWidth', 'radius']);

function overridesToStyle(
  overrides: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>>,
  embedded: boolean,
): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ListboxOverridableBinding[]) {
    const ref = overrides[binding];
    // Locked bindings have no entry in the hook table, so they are ignored if passed.
    const hook = OVERRIDE_HOOK[binding];
    if (!ref || !hook || (embedded && EMBEDDED_NO_OP.has(binding))) continue;
    style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

function isGroup(item: ListboxItem): item is ListboxGroup {
  return 'group' in item;
}

/** Rows in document order, dropping group wrappers — the unit navigation and typeahead move over. */
function flattenRows(items: ListboxItem[]): ListboxOption[] {
  const result: ListboxOption[] = [];
  for (const item of items) {
    if (isGroup(item)) result.push(...item.options);
    else result.push(item);
  }
  return result;
}

/**
 * The selection as a list, normalised to the mode rather than warned about: a single-select list
 * takes an array's first entry, a multi-select list reads a bare string as a one-entry array.
 */
function normalise(value: ListboxValue | undefined, multiple: boolean): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return [value];
  if (multiple) return value;
  const first = value[0];
  return first === undefined ? [] : [first];
}

/** A CSS time (`120ms`, `1.2s`) in milliseconds; 0 when it cannot be read (no stylesheet loaded). */
function parseDuration(raw: string): number {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(raw.trim());
  if (!match) return 0;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

export interface ListboxProps
  extends Omit<
    ComponentPropsWithoutRef<'div'>,
    | 'children'
    | 'onChange'
    | 'defaultValue'
    | 'role'
    | 'tabIndex'
    | 'className'
    | 'style'
    | 'aria-label'
    | 'aria-labelledby'
    | 'aria-multiselectable'
    | 'aria-activedescendant'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-describedby'
    | 'aria-busy'
    | 'aria-disabled'
  > {
  /**
   * Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` as
   * well; on web `aria-labelledby` then wins. Always pass `label` even with `labelledBy`: it is the
   * `{label}` in `copy.required` and `copy.invalid`.
   */
  label: string;
  /** Id of a visible element that labels the list. */
  labelledBy?: string | undefined;
  /** Flat or grouped options; groups do not nest. */
  options: ListboxItem[];
  /**
   * Allow any number of selections. The value becomes an array; each option shows a check
   * indicator; selection toggles rather than moves. This is the same engine Combobox uses for
   * multi-select.
   */
  multiple?: boolean | undefined;
  /**
   * Controlled selection: a value, or with `multiple` the exported `ListboxValue` (`string |
   * string[]`). Omit for uncontrolled. A shape that does not match the mode is normalised: a
   * single-select list takes an array's first entry, a multi-select list reads a bare string as a
   * one-entry array.
   */
  value?: ListboxValue | undefined;
  /** Initial selection (or array). */
  defaultValue?: ListboxValue | undefined;
  /**
   * Single-select only: arrow keys select as they move (the common picker feel). Set false when
   * selection has side effects, so arrows only move and Space selects.
   */
  selectionFollowsFocus?: boolean | undefined;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean | undefined;
  /**
   * Marks the list invalid (aria-invalid, and `borderInvalid` when not `embedded`) with
   * `copy.invalid`. The list is invalid while this is true OR `error` is non-empty; clearing
   * `error` never clears an explicitly set `invalid`. A Form-supplied message makes it invalid too.
   */
  invalid?: boolean | undefined;
  /**
   * Error message rendered below the list and linked by aria-describedby; implies invalid. The
   * displayed message is `error`, then the Form's message, then while invalid `copy.required`
   * (required and nothing selected) else `copy.invalid`. Not a live region.
   */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; the
   * list draws none of its own. It keeps its own `listPadding`, and an override of `border`,
   * `borderWidth`, `borderInvalid`, `surface` or `radius` is a no-op while it is set. An embedded
   * list is not a tab stop (`tabindex="-1"`): its host keeps focus on the trigger or input and
   * forwards keys.
   */
  embedded?: boolean | undefined;
  /**
   * The option that is active when the list first receives focus (Select opens with the selected
   * option active). It wins when it names an enabled option; otherwise the first selected, else the
   * first enabled. When it changes while the list does not contain the focused element, the active
   * option moves to it without firing `onActiveChange`.
   */
  initialActiveValue?: string | undefined;
  /**
   * The active option, driven by a host that keeps focus on its own trigger or input and forwards
   * keys (Select, Combobox, Search). Set, it wins over `initialActiveValue` and needs no focus in
   * the list; `null` means no option is active. Forwarded keys then move nothing on their own: they
   * report the option they would make active through `onActiveChange`. Omitted, the list owns the
   * active option. Option ids are `${id}-option-${value}`.
   */
  activeValue?: string | null | undefined;
  /** Options are being fetched (async Combobox); the list shows `copy.loading` in place of the empty message and is aria-busy. */
  loading?: boolean | undefined;
  /**
   * The whole list is inert but readable: it stays focusable (aria-disabled=true), keys, hover and
   * clicks do nothing, and `disabledOpacity` dims the list once. Focusing it sets no active option
   * and reports nothing; the focus ring is still drawn.
   */
  disabled?: boolean | undefined;
  /**
   * Field name for Form collection. The submitted value is a string in single-select and an array
   * of strings with `multiple`; nothing selected submits no key. Without `name` nothing is submitted.
   */
  name?: string | undefined;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. Computed from tokens, never measured. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /**
   * Fired as the focused (active) option changes, with its value: on keyboard moves, hover (deduped),
   * the option made active when the list receives focus, and null when the list loses focus. Never
   * on mount.
   */
  onActiveChange?: ((value: string | null) => void) | undefined;
}

/**
 * Listbox — Design Schema, category: input.
 *
 * When to use:
 * Use a standalone Listbox when the options should stay visible: a settings picker with five to twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a Listbox.
 *
 * The root is a wrapper `div` (data-ds, data-ds-field) holding the `role="listbox"` list and the
 * error message. `id` names the list, and option ids are `${id}-option-${value}`. Keyboard and focus
 * handlers sit on the wrapper, so a host may dispatch `keydown`/`focusin` on the ref.
 */
export function Listbox({
  ref,
  label,
  labelledBy,
  options,
  multiple = false,
  value,
  defaultValue,
  selectionFollowsFocus = true,
  required = false,
  invalid = false,
  error,
  embedded = false,
  initialActiveValue,
  activeValue: activeValueProp,
  loading = false,
  disabled = false,
  name,
  emptyMessage,
  maxVisible = '8',
  overrides,
  onChange,
  onActiveChange,
  onBlur,
  onFocus,
  onKeyDown,
  id: idProp,
  ...rest
}: ListboxProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-listbox${generatedId}`);
  const errorId = `${id}-error`;
  const emptyId = `${id}-empty`;

  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({ buffer: '', timer: null });

  useEffect(
    () => () => {
      if (typeahead.current.timer) clearTimeout(typeahead.current.timer);
    },
    [],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label) {
      console.warn('Listbox: `label` is required, even with `labelledBy` — it is the {label} in the validation copy.');
    }
  }, [label]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ListboxValue | undefined>(defaultValue);
  const selectedValues = normalise(isControlled ? value : internalValue, multiple);

  const activeControlled = activeValueProp !== undefined;
  const [internalActive, setInternalActive] = useState<string | null>(null);
  const ownActive = activeControlled ? activeValueProp : internalActive;

  const isDisabled = disabled || (form?.disabled ?? false);
  const nothingSelected = selectedValues.length === 0;
  const formError = name ? form?.errors[name] : undefined;
  const hasError = error !== undefined && error !== '';
  // Precedence: error → the Form's message → while invalid, copy.required (required, nothing selected) else copy.invalid.
  const resolvedError =
    (hasError ? error : undefined) ??
    formError ??
    (invalid ? (required && nothingSelected ? COPY.required : COPY.invalid).replace('{label}', label) : undefined);
  const showsInvalid = invalid || hasError || resolvedError !== undefined;

  const rows = useMemo(() => flattenRows(options), [options]);
  const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
  const maxVisibleKey = String(maxVisible) as '5' | '8' | '12' | 'all';

  // A disabled list keeps its active option in state but draws and points at none.
  const renderedActive =
    !isDisabled && ownActive !== null && rows.some((row) => row.value === ownActive) ? ownActive : null;

  // The active option is always scrolled into view (a real element, never a Fragment ref).
  useEffect(() => {
    if (renderedActive === null) return;
    optionRefs.current.get(renderedActive)?.scrollIntoView?.({ block: 'nearest' });
  }, [renderedActive]);

  // When `initialActiveValue` changes while the list has no focus (Combobox updates it as the user
  // types), the active option moves to it — silently, without firing onActiveChange.
  const lastInitialActive = useRef(initialActiveValue);
  useEffect(() => {
    if (lastInitialActive.current === initialActiveValue) return;
    lastInitialActive.current = initialActiveValue;
    const list = listRef.current;
    if (initialActiveValue === undefined || (list !== null && list.contains(document.activeElement))) return;
    if (!enabledRows.some((row) => row.value === initialActiveValue)) return;
    setInternalActive((current) => (current === initialActiveValue ? current : initialActiveValue));
  }, [initialActiveValue, enabledRows]);

  const latest = useRef({ label, required, invalid, error, disabled: isDisabled, selectedValues, multiple });
  latest.current = { label, required, invalid, error, disabled: isDisabled, selectedValues, multiple };

  useEffect(() => {
    // Without `name` the list submits nothing (Form skips unnamed fields).
    if (!form || !name) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      // form.valueType is string[]: every selected value with `multiple`, the value otherwise; no key when empty.
      getValue: () => {
        const values = latest.current.selectedValues;
        if (values.length === 0) return undefined;
        return latest.current.multiple ? values : values[0];
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const current = latest.current;
        if (current.error !== undefined && current.error !== '') return current.error;
        if (current.required && current.selectedValues.length === 0) return COPY.required.replace('{label}', current.label);
        if (current.invalid) return COPY.invalid.replace('{label}', current.label);
        return null;
      },
      focus: () => listRef.current?.focus(),
    });
  }, [form, name, id]);

  // The Form's mode decides when the field re-validates; after a failed submission every mode
  // re-validates on blur and on change, so a fixed field stops being flagged as the user picks.
  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnBlur = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

  /** onChange receives the array in option order. */
  const inOptionOrder = (values: string[]) => rows.map((row) => row.value).filter((v) => values.includes(v));

  const commitValues = (next: string[]) => {
    if (multiple) {
      if (next.length === selectedValues.length && next.every((v, i) => v === selectedValues[i])) return;
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    } else {
      const single = next[0];
      if (single === undefined || single === selectedValues[0]) return;
      if (!isControlled) setInternalValue(single);
      onChange?.(single);
    }
    // The Form validates now, before the re-render refreshes `latest`, so it reads the new selection.
    latest.current = { ...latest.current, selectedValues: multiple ? next : next.slice(0, 1) };
    if (form && name && validatesOnChange) form.validateField(name);
  };

  /**
   * Reports a new active option. Owned: it moves; driven by `activeValue`: it only reports, and the
   * host passes the value back.
   */
  const reportActive = (next: string | null) => {
    if (!activeControlled) setInternalActive(next);
    onActiveChange?.(next);
  };

  /** Arrows, Home/End, PageUp/PageDown and typeahead all move this way: select too when selection follows focus. */
  const moveActive = (optionValue: string) => {
    reportActive(optionValue);
    if (!multiple && selectionFollowsFocus) commitValues([optionValue]);
  };

  const selectRow = (row: ListboxOption) => {
    if (isDisabled || row.disabled) return;
    if (!multiple) {
      commitValues([row.value]);
      return;
    }
    commitValues(
      inOptionOrder(isSelected(row.value) ? selectedValues.filter((v) => v !== row.value) : [...selectedValues, row.value]),
    );
  };

  /** Where focus lands first: `initialActiveValue` when enabled, else the first selected, else the first enabled. */
  const resolveInitialActive = (): string | undefined => {
    if (initialActiveValue !== undefined && enabledRows.some((row) => row.value === initialActiveValue)) {
      return initialActiveValue;
    }
    return (enabledRows.find((row) => isSelected(row.value)) ?? enabledRows[0])?.value;
  };

  const handleTypeahead = (char: string, currentIndex: number) => {
    const state = typeahead.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    // typeaheadReset is read at runtime from the list, never a number written here.
    const list = listRef.current;
    const reset = list ? parseDuration(getComputedStyle(list).getPropertyValue('--ds-listbox-typeahead-reset')) : 0;
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, reset);

    // One letter repeated collapses to that letter and searches from the option after the active
    // one (so it cycles); any other buffer is a prefix searched from the active one.
    const first = state.buffer[0]!;
    const repeated = [...state.buffer].every((c) => c === first);
    const search = repeated ? first : state.buffer;
    const start = currentIndex === -1 ? 0 : currentIndex;
    const startOffset = currentIndex !== -1 && repeated ? 1 : 0;
    const count = enabledRows.length;
    for (let offset = startOffset; offset < count + startOffset; offset++) {
      const candidate = enabledRows[(start + offset) % count];
      if (candidate && candidate.label.toLowerCase().startsWith(search)) {
        moveActive(candidate.value);
        return;
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled || enabledRows.length === 0) return;
    const currentIndex = ownActive === null ? -1 : enabledRows.findIndex((row) => row.value === ownActive);
    const last = enabledRows.length - 1;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const down = event.key === 'ArrowDown';
        // Clamps at the first and last enabled option; with no active option the first press lands on an end.
        const targetIndex =
          currentIndex === -1 ? (down ? 0 : last) : Math.min(Math.max(currentIndex + (down ? 1 : -1), 0), last);
        const target = enabledRows[targetIndex]!;
        if (multiple && event.shiftKey) {
          // Add only: an already-selected option stays selected.
          reportActive(target.value);
          if (!isSelected(target.value)) commitValues(inOptionOrder([...selectedValues, target.value]));
        } else {
          moveActive(target.value);
        }
        break;
      }
      case 'Home':
        event.preventDefault();
        moveActive(enabledRows[0]!.value);
        break;
      case 'End':
        event.preventDefault();
        moveActive(enabledRows[last]!.value);
        break;
      case 'PageDown':
      case 'PageUp': {
        event.preventDefault();
        const down = event.key === 'PageDown';
        let targetIndex: number;
        // Counts enabled options, not drawn rows; with no active option PageDown lands first, PageUp last.
        if (currentIndex === -1) targetIndex = down ? 0 : last;
        else if (maxVisibleKey === 'all') targetIndex = down ? last : 0;
        else targetIndex = Math.min(Math.max(currentIndex + (down ? 1 : -1) * Number(maxVisibleKey), 0), last);
        moveActive(enabledRows[targetIndex]!.value);
        break;
      }
      case ' ': {
        event.preventDefault();
        const target = currentIndex === -1 ? resolveInitialActive() : enabledRows[currentIndex]!.value;
        const row = enabledRows.find((candidate) => candidate.value === target);
        if (!row) break;
        if (currentIndex === -1) reportActive(row.value);
        selectRow(row);
        break;
      }
      case 'Enter': {
        // Enter selects only in single-select; with `multiple` it is a no-op (Space toggles).
        if (multiple) break;
        const target = currentIndex === -1 ? resolveInitialActive() : enabledRows[currentIndex]!.value;
        if (target === undefined) break;
        event.preventDefault();
        if (currentIndex === -1) reportActive(target);
        commitValues([target]);
        break;
      }
      default: {
        if (multiple && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          const all = enabledRows.map((row) => row.value);
          const allSelected = all.every((v) => isSelected(v));
          // Selected disabled options stay selected either way.
          const keep = selectedValues.filter((v) => !all.includes(v));
          commitValues(inOptionOrder(allSelected ? keep : [...keep, ...all]));
        } else if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key, currentIndex);
        }
      }
    }
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    // The list itself, or a host signalling focus on the root.
    if (event.target !== listRef.current && event.target !== event.currentTarget) return;
    const next = ownActive ?? resolveInitialActive();
    if (isDisabled) {
      // Resolved and kept in state, so enabling the list picks up here; nothing drawn, nothing reported.
      if (!activeControlled && internalActive === null && next !== undefined) setInternalActive(next);
      return;
    }
    // Every real focus reports, even when the pre-highlighted option has not changed.
    if (next !== undefined) reportActive(next);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.target !== listRef.current) return;
    if (!isDisabled) reportActive(null);
    if (form && name && validatesOnBlur) form.validateField(name);
  };

  const handleRowPointerMove = (row: ListboxOption) => {
    // Only hover is deduped against the current active value.
    if (isDisabled || row.disabled || row.value === ownActive) return;
    reportActive(row.value);
  };

  const handleRowClick = (row: ListboxOption) => (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isDisabled || row.disabled) {
      event.preventDefault();
      return;
    }
    if (row.value !== ownActive) reportActive(row.value);
    selectRow(row);
  };

  const setRowRef = (rowValue: string) => (element: HTMLDivElement | null) => {
    if (element) optionRefs.current.set(rowValue, element);
    else optionRefs.current.delete(rowValue);
  };

  // Composed Texts take the root's typeface and line height (not fontSize: each carries its own size).
  const textOverrides = {
    fontFamily: overrides?.fontFamily ?? 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
    lineHeight: overrides?.lineHeight ?? 'font.lineHeight.normal',
  };

  const renderRow = (row: ListboxOption) => {
    const optionId = `${id}-option-${row.value}`;
    const descriptionId = row.description ? `${optionId}-description` : undefined;
    const rowSelected = isSelected(row.value);
    const rowDisabled = isDisabled || row.disabled === true;
    const classes = [
      'ds-listbox__option',
      row.value === renderedActive ? 'ds-listbox__option--active' : null,
      rowSelected ? 'ds-listbox__option--selected' : null,
      row.disabled ? 'ds-listbox__option--disabled' : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={row.value}
        ref={setRowRef(row.value)}
        id={optionId}
        role="option"
        data-part="option"
        data-value={row.value}
        aria-selected={rowSelected ? 'true' : 'false'}
        aria-disabled={rowDisabled ? 'true' : undefined}
        aria-describedby={descriptionId}
        className={classes}
        onPointerMove={() => handleRowPointerMove(row)}
        onClick={handleRowClick(row)}
      >
        {multiple ? (
          // Always present with `multiple` (invisible when unselected) so labels align.
          <span className="ds-listbox__check" data-part="optionCheck" aria-hidden="true">
            {/* optionSelectedCheck is locked; it reaches the child as the Icon's own `color` override. */}
            <Icon name="check" size="sm" overrides={{ color: 'color.control.selectedBackground' }} />
          </span>
        ) : null}
        {row.icon ? (
          <span className="ds-listbox__icon" data-part="optionIcon" aria-hidden="true">
            {/* optionColor reaches the icon the same way, so it matches the row's label. */}
            <Icon name={row.icon} size="sm" overrides={{ color: 'color.foreground' }} />
          </span>
        ) : null}
        <span className="ds-listbox__text">
          <span className="ds-listbox__label" data-part="optionLabel">
            {row.label}
          </span>
          {row.description ? (
            <span id={descriptionId} className="ds-listbox__description" data-part="optionDescription">
              {row.description}
            </span>
          ) : null}
        </span>
      </div>
    );
  };

  const renderItem = (item: ListboxItem, index: number): ReactElement | null => {
    if (!isGroup(item)) return renderRow(item);
    // Empty groups are omitted.
    if (item.options.length === 0) return null;
    const groupLabelId = `${id}-group-${index}`;
    return (
      <div key={`group-${index}`} role="group" aria-labelledby={groupLabelId} data-part="group" className="ds-listbox__group">
        <div id={groupLabelId} data-part="groupLabel" className="ds-listbox__group-label">
          {item.group}
        </div>
        {item.options.map(renderRow)}
      </div>
    );
  };

  const isEmpty = rows.length === 0;
  // Joins the empty/loading description and the error message, in reading order.
  const describedBy =
    [isEmpty ? emptyId : null, resolvedError !== undefined ? errorId : null].filter(Boolean).join(' ') || undefined;

  const classes = [
    'ds-listbox',
    `ds-listbox--max-visible-${maxVisibleKey}`,
    embedded ? 'ds-listbox--embedded' : null,
    isDisabled ? 'ds-listbox--disabled' : null,
    showsInvalid ? 'ds-listbox--invalid' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="Listbox"
      data-ds-field=""
      className={classes}
      style={overrides ? overridesToStyle(overrides, embedded) : undefined}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div
        ref={listRef}
        id={id}
        data-part="list"
        role="listbox"
        // Embedded lists are not a tab stop, disabled or not: the host keeps focus on its trigger or input.
        tabIndex={embedded ? -1 : 0}
        className="ds-listbox__list"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-multiselectable={multiple ? 'true' : undefined}
        aria-activedescendant={renderedActive !== null ? `${id}-option-${renderedActive}` : undefined}
        aria-invalid={showsInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-describedby={describedBy}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
      >
        {isEmpty ? (
          /*
           * A listbox owns only options and groups, so the empty/loading row is hidden from the
           * accessibility tree and reaches the user as the list's description instead (aria-describedby
           * resolves hidden text): the still-focusable empty list announces "No options" either way.
           */
          <div id={emptyId} className="ds-listbox__empty" aria-hidden="true">
            <Text data-part="emptyState" element="p" tone="muted" overrides={textOverrides}>
              {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
            </Text>
          </div>
        ) : (
          options.map(renderItem)
        )}
      </div>
      {resolvedError !== undefined ? (
        // A plain wrapper carrying the errorText hook; the part hook and id stay on the Text.
        <div className="ds-listbox__error">
          <Text id={errorId} data-part="errorMessage" element="p" size="sm" tone="danger" overrides={textOverrides}>
            {resolvedError}
          </Text>
        </div>
      ) : null}
    </div>
  );
}
