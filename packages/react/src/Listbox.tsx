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

/** copy.* — used verbatim; `{label}` is replaced by the `label` prop. */
const COPY = {
  empty: 'No options',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  selectedCount: '{count} selected',
  loading: 'Loading…',
} as const;

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

function toArray(value: ListboxValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
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
  /** Controlled selection: a value, or with `multiple` the exported `ListboxValue` (`string | string[]`). Omit for uncontrolled. */
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
   * `error` never clears an explicitly set `invalid`.
   */
  invalid?: boolean | undefined;
  /**
   * Error message rendered below the list and linked by aria-describedby; implies invalid. The
   * displayed message is `error`, then the Form's message, then while invalid `copy.required`
   * (required and nothing selected) else `copy.invalid`.
   */
  error?: string | undefined;
  /**
   * The list lives inside a popup (Select, Combobox) that owns the border, surface and radius; the
   * list draws none of its own. It keeps its own `listPadding`, and an override of `border`,
   * `borderWidth`, `surface` or `radius` is a no-op while it is set.
   */
  embedded?: boolean | undefined;
  /**
   * The option that is active when the list first receives focus (Select opens with the selected
   * option active). It wins when it names an enabled option; otherwise the first selected, else the
   * first enabled.
   */
  initialActiveValue?: string | undefined;
  /** Options are being fetched (async Combobox); the list shows `copy.loading` in place of the empty message and is aria-busy. */
  loading?: boolean | undefined;
  /**
   * The whole list is inert but readable: it stays focusable (tabindex=0, aria-disabled=true), keys,
   * hover and clicks do nothing, and `disabledOpacity` dims the list once.
   */
  disabled?: boolean | undefined;
  /**
   * Field name for Form collection. The submitted value is a string in single-select and an array
   * of strings with `multiple`; nothing selected submits no key.
   */
  name?: string | undefined;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value; null when the list loses focus. */
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
 * handlers sit on the wrapper, so a host (Select) may dispatch `keydown`/`focusin` on the ref.
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
  const selected = isControlled ? value : internalValue;
  const selectedValues = toArray(selected);

  const [activeValue, setActiveValueState] = useState<string | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const nothingSelected = selectedValues.length === 0;
  const formError = name ? form?.errors[name] : undefined;
  const isInvalid = invalid || (error !== undefined && error !== '');
  // Precedence: error → the Form's message → while invalid, copy.required (required, nothing selected) else copy.invalid.
  const resolvedError =
    (error !== undefined && error !== '' ? error : undefined) ??
    formError ??
    (isInvalid ? (required && nothingSelected ? COPY.required : COPY.invalid).replace('{label}', label) : undefined);
  const showsInvalid = isInvalid || resolvedError !== undefined;

  const rows = useMemo(() => flattenRows(options), [options]);
  const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
  const maxVisibleKey = String(maxVisible) as '5' | '8' | '12' | 'all';

  const latest = useRef({ label, required, invalid, error, disabled: isDisabled, selected, multiple });
  latest.current = { label, required, invalid, error, disabled: isDisabled, selected, multiple };

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
        const values = toArray(latest.current.selected);
        if (values.length === 0) return undefined;
        return latest.current.multiple ? values : values[0];
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp, selected: current } =
          latest.current;
        if (errorProp !== undefined && errorProp !== '') return errorProp;
        if (isRequired && toArray(current).length === 0) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => listRef.current?.focus(),
    });
  }, [form, name, id]);

  const isSelected = (optionValue: string) => selectedValues.includes(optionValue);

  const commitValue = (next: ListboxValue) => {
    if (!Array.isArray(next) && next === selected) return;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && name && form.validate === 'change') form.validateField(name);
  };

  /** onChange receives the array in option order. */
  const inOptionOrder = (values: string[]) => rows.map((row) => row.value).filter((v) => values.includes(v));

  const setActiveValue = (next: string | null) => {
    if (next !== null) optionRefs.current.get(next)?.scrollIntoView?.({ block: 'nearest' });
    if (next === activeValue) return;
    setActiveValueState(next);
    onActiveChange?.(next);
  };

  /** Arrows, Home/End, PageUp/PageDown and typeahead all move this way: select too when selection follows focus. */
  const moveActive = (optionValue: string) => {
    setActiveValue(optionValue);
    if (!multiple && selectionFollowsFocus) commitValue(optionValue);
  };

  const toggle = (optionValue: string) => {
    commitValue(
      inOptionOrder(
        selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue],
      ),
    );
  };

  const selectRow = (row: ListboxOption) => {
    if (isDisabled || row.disabled) return;
    if (multiple) toggle(row.value);
    else commitValue(row.value);
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

    const count = enabledRows.length;
    // A repeated single letter cycles; a longer prefix keeps matching the current option first.
    const startOffset = state.buffer.length > 1 || currentIndex === -1 ? 0 : 1;
    const start = currentIndex === -1 ? 0 : currentIndex;
    for (let offset = startOffset; offset < count + startOffset; offset++) {
      const candidate = enabledRows[(start + offset) % count];
      if (candidate && candidate.label.toLowerCase().startsWith(state.buffer)) {
        moveActive(candidate.value);
        return;
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled || enabledRows.length === 0) return;
    const currentIndex = activeValue === null ? -1 : enabledRows.findIndex((row) => row.value === activeValue);
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
          setActiveValue(target.value);
          if (!selectedValues.includes(target.value)) commitValue(inOptionOrder([...selectedValues, target.value]));
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
        // With no active option PageDown lands on the first enabled option and PageUp on the last.
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
        setActiveValue(row.value);
        selectRow(row);
        break;
      }
      case 'Enter': {
        // Enter selects only in single-select; with `multiple` it is a no-op (Space toggles).
        if (multiple) break;
        const target = currentIndex === -1 ? resolveInitialActive() : enabledRows[currentIndex]!.value;
        if (target === undefined) break;
        event.preventDefault();
        setActiveValue(target);
        commitValue(target);
        break;
      }
      default: {
        if (multiple && event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          const all = enabledRows.map((row) => row.value);
          const allSelected = all.every((v) => selectedValues.includes(v));
          // Selected disabled options stay selected either way.
          const keep = selectedValues.filter((v) => !all.includes(v));
          commitValue(inOptionOrder(allSelected ? keep : [...keep, ...all]));
        } else if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key, currentIndex);
        }
      }
    }
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    // The list itself, or a host signalling focus on the root (Select keeps DOM focus on its trigger).
    if ((event.target !== listRef.current && event.target !== event.currentTarget) || activeValue !== null) return;
    const initial = resolveInitialActive();
    if (initial !== undefined) setActiveValue(initial);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.target !== listRef.current) return;
    setActiveValue(null);
    if (form && name && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const handleRowPointerMove = (row: ListboxOption) => {
    if (isDisabled || row.disabled) return;
    setActiveValue(row.value);
  };

  const handleRowClick = (row: ListboxOption) => (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isDisabled || row.disabled) {
      event.preventDefault();
      return;
    }
    setActiveValue(row.value);
    selectRow(row);
  };

  const setRowRef = (rowValue: string) => (element: HTMLDivElement | null) => {
    if (element) optionRefs.current.set(rowValue, element);
    else optionRefs.current.delete(rowValue);
  };

  const renderRow = (row: ListboxOption) => {
    const optionId = `${id}-option-${row.value}`;
    const descriptionId = row.description ? `${optionId}-description` : undefined;
    const rowSelected = isSelected(row.value);
    const rowDisabled = isDisabled || row.disabled === true;
    const classes = [
      'ds-listbox__option',
      row.value === activeValue ? 'ds-listbox__option--active' : null,
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
            <Icon name="check" size="sm" overrides={{ color: 'color.control.selectedBackground' as TokenRef }} />
          </span>
        ) : null}
        {row.icon ? (
          <span className="ds-listbox__icon" data-part="optionIcon" aria-hidden="true">
            <Icon name={row.icon} size="sm" />
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
        tabIndex={0}
        className="ds-listbox__list"
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-multiselectable={multiple ? 'true' : undefined}
        aria-activedescendant={activeValue !== null ? `${id}-option-${activeValue}` : undefined}
        aria-invalid={showsInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-describedby={resolvedError !== undefined ? errorId : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
      >
        {rows.length === 0 ? (
          <div className="ds-listbox__empty">
            <Text data-part="emptyState" tone="muted">
              {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
            </Text>
          </div>
        ) : (
          options.map(renderItem)
        )}
      </div>
      {resolvedError !== undefined ? (
        <Text id={errorId} data-part="errorMessage" size="sm" tone="danger">
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
}
