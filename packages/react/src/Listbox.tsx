import {
  useEffect,
  useId,
  useImperativeHandle,
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

/** One selectable row, or a labelled cluster of rows. The schema shape, verbatim. */
export type ListboxOption =
  | { value: string; label: string; description?: string | undefined; icon?: IconName | undefined; disabled?: boolean | undefined }
  | { group: string; options: ListboxOption[] };

type ListboxRow = {
  value: string;
  label: string;
  description?: string | undefined;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
};

/** A value, or with `multiple` an array of values. */
export type ListboxValue = string | string[];
export type ListboxMaxVisible = '5' | '8' | '12' | 'all' | 5 | 8 | 12;

/**
 * copy.* — used verbatim; `{label}` is replaced by the `label` prop. `selectedCount` belongs to the
 * surrounding UI (a Select trigger, chips), not this list.
 */
const COPY = {
  empty: 'No options',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  selectedCount: '{count} selected',
  loading: 'Loading…',
} as const;

/** Typeahead buffer lifetime. Not a token: it is interaction timing, never rendered. */
const TYPEAHEAD_RESET = 500;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ListboxOverridableBinding =
  | 'border'
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
  | 'disabledOpacity';

const OVERRIDE_HOOK: Record<ListboxOverridableBinding, string> = {
  border: '--ds-listbox-border',
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
};

/** Surface chrome the host popup owns while `embedded`: overrides change values, never presence. */
const EMBEDDED_NO_OP: ReadonlySet<ListboxOverridableBinding> = new Set(['border', 'borderWidth', 'radius']);

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

function isGroup(option: ListboxOption): option is { group: string; options: ListboxOption[] } {
  return 'group' in option;
}

/** Depth-first rows in document order, dropping group wrappers — the unit navigation and typeahead move over. */
function flattenRows(options: ListboxOption[]): ListboxRow[] {
  const result: ListboxRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

function toArray(value: ListboxValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
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
  /** Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` instead and this is ignored. */
  label: string;
  /** Id of a visible element that labels the list. */
  labelledBy?: string | undefined;
  /** Flat or grouped options. */
  options: ListboxOption[];
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
  /** Marks the list invalid (aria-invalid) with `copy.invalid`. */
  invalid?: boolean | undefined;
  /** Error message rendered below the list and linked by aria-describedby; implies invalid. */
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
  /** The whole list is inert but readable. */
  disabled?: boolean | undefined;
  /** Field name for Form collection. Multiple values are collected as an array. */
  name?: string | undefined;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired as the focused (active) option changes, with its value; null when no option is active. */
  onActiveChange?: ((value: string | null) => void) | undefined;
}

/**
 * Listbox — Design Schema, category: input.
 *
 * When to use:
 * Use a standalone Listbox when the options should stay visible: a settings picker with five to twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a Listbox.
 */
export const Listbox = function Listbox({
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

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({ buffer: '', timer: null });

  useEffect(
    () => () => {
      if (typeahead.current.timer) clearTimeout(typeahead.current.timer);
    },
    [],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label && !labelledBy) {
      console.warn('Listbox: `label` or `labelledBy` is required so the list has an accessible name.');
    }
  }, [label, labelledBy]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ListboxValue | undefined>(defaultValue);
  const selected = isControlled ? value : internalValue;
  const selectedValues = toArray(selected);

  const [activeValue, setActiveValueState] = useState<string | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  // Precedence: error prop → the Form's error (copy.required on a failed submit) → invalid (copy.invalid).
  const resolvedError =
    error ?? (name ? form?.errors[name] : undefined) ?? (invalid ? COPY.invalid.replace('{label}', label) : undefined);
  const isInvalid = invalid || resolvedError !== undefined;

  const rows = useMemo(() => flattenRows(options), [options]);
  const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
  const maxVisibleKey = String(maxVisible) as '5' | '8' | '12' | 'all';

  const latest = useRef({ label, required, invalid, error, disabled: isDisabled, selected, multiple });
  latest.current = { label, required, invalid, error, disabled: isDisabled, selected, multiple };

  useEffect(() => {
    // Without `name` the list does not register with a Form.
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
        if (errorProp !== undefined) return errorProp;
        if (isRequired && toArray(current).length === 0) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => rootRef.current?.focus(),
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

  const selectRow = (row: ListboxRow) => {
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
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, TYPEAHEAD_RESET);

    const count = enabledRows.length;
    // A repeated single letter cycles; a longer prefix keeps matching the current option first.
    const startOffset = state.buffer.length > 1 || currentIndex === -1 ? 0 : 1;
    const start = currentIndex === -1 ? 0 : currentIndex;
    for (let offset = startOffset; offset < count + startOffset; offset++) {
      const candidate = enabledRows[(((start + offset) % count) + count) % count];
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
        const page = maxVisibleKey === 'all' ? enabledRows.length : Number(maxVisibleKey);
        const direction = event.key === 'PageDown' ? 1 : -1;
        const base = currentIndex === -1 ? (direction === 1 ? -1 : enabledRows.length) : currentIndex;
        moveActive(enabledRows[Math.min(Math.max(base + direction * page, 0), last)]!.value);
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
        if (multiple && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          const all = enabledRows.map((row) => row.value);
          const allSelected = all.every((v) => selectedValues.includes(v));
          // Disabled options keep whatever selection they already had.
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
    if (event.target !== event.currentTarget || activeValue !== null) return;
    const initial = resolveInitialActive();
    if (initial !== undefined) setActiveValue(initial);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (form && name && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const handleRowPointerMove = (row: ListboxRow) => {
    if (isDisabled || row.disabled) return;
    setActiveValue(row.value);
  };

  const handleRowClick = (row: ListboxRow) => (event: ReactMouseEvent<HTMLDivElement>) => {
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

  const renderRow = (row: ListboxRow) => {
    const optionId = `${id}-option-${row.value}`;
    const descriptionId = row.description ? `${optionId}-description` : undefined;
    const rowSelected = isSelected(row.value);
    const rowDisabled = isDisabled || row.disabled === true;
    const classes = [
      'ds-listbox__option',
      row.value === activeValue ? 'ds-listbox__option--active' : null,
      rowSelected ? 'ds-listbox__option--selected' : null,
      rowDisabled ? 'ds-listbox__option--disabled' : null,
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
          // Always rendered with `multiple` (invisible when unselected) so labels align.
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

  const renderNode = (node: ListboxOption, path: string): ReactElement | null => {
    if (!isGroup(node)) return renderRow(node);
    // Empty groups are omitted.
    if (flattenRows(node.options).length === 0) return null;
    const groupLabelId = `${id}-group-${path}`;
    return (
      <div key={`${path}-group`} role="group" aria-labelledby={groupLabelId} className="ds-listbox__group">
        <div id={groupLabelId} data-part="groupLabel" className="ds-listbox__group-label">
          {node.group}
        </div>
        {node.options.map((child, index) => renderNode(child, `${path}-${index}`))}
      </div>
    );
  };

  const classes = [
    'ds-listbox',
    `ds-listbox--max-visible-${maxVisibleKey}`,
    embedded ? 'ds-listbox--embedded' : null,
    isDisabled ? 'ds-listbox--disabled' : null,
    isInvalid ? 'ds-listbox--invalid' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const rootStyle = overrides ? overridesToStyle(overrides, embedded) : undefined;

  return (
    <>
      <div
        {...rest}
        ref={rootRef}
        id={id}
        data-ds="Listbox"
        data-ds-field={name ? '' : undefined}
        data-part="list"
        role="listbox"
        tabIndex={0}
        className={classes}
        style={rootStyle}
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
        aria-multiselectable={multiple ? 'true' : undefined}
        aria-activedescendant={activeValue !== null ? `${id}-option-${activeValue}` : undefined}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-describedby={resolvedError !== undefined ? errorId : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {rows.length === 0 ? (
          <div className="ds-listbox__empty">
            <Text element="span" data-part="emptyState" size="sm" tone="muted">
              {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
            </Text>
          </div>
        ) : (
          options.map((node, index) => renderNode(node, String(index)))
        )}
      </div>
      {resolvedError !== undefined ? (
        <Text element="p" id={errorId} role="alert" data-part="errorMessage" size="sm" tone="danger">
          {resolvedError}
        </Text>
      ) : null}
    </>
  );
};
