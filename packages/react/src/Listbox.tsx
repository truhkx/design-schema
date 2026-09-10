import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Listbox.css';

/** One selectable row, or a labelled cluster of rows. Export used verbatim from the schema shape. */
export type ListboxOption =
  | { value: string; label: string; description?: string; icon?: IconName; disabled?: boolean }
  | { group: string; options: ListboxOption[] };

type ListboxRow = { value: string; label: string; description?: string; icon?: IconName; disabled?: boolean };

/** A value, or with `multiple` an array of values. */
export type ListboxValue = string | string[];
export type ListboxMaxVisible = '5' | '8' | '12' | 'all' | 5 | 8 | 12;

/**
 * copy.* — used verbatim; `{label}` is replaced by the accessible name. `selectedCount` is shown
 * by the surrounding UI, not this component. The schema's `invalid` prop references `copy.invalid`,
 * but no such key exists under `copy:` — treated as a state-only flag with no bundled message.
 */
const COPY = {
  empty: 'No options',
  required: '{label} is required.',
  loading: 'Loading…',
};

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

function overridesToStyle(overrides: Partial<Record<ListboxOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ListboxOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

function isGroup(option: ListboxOption): option is { group: string; options: ListboxOption[] } {
  return 'group' in option;
}

/** Depth-first rows in document order, dropping group wrappers — the unit keyboard navigation and typeahead move over. */
function flattenRows(options: ListboxOption[]): ListboxRow[] {
  const result: ListboxRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

function toArray(value: ListboxValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

export interface ListboxProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'defaultValue'> {
  /** Accessible name of the list. When a visible Text label exists, pass its id via `labelledBy` instead and this is ignored. */
  label: string;
  /** Id of a visible element that labels the list. */
  labelledBy?: string;
  /** Flat or grouped options. */
  options: ListboxOption[];
  /**
   * Allow any number of selections. The value becomes an array; each option shows a check
   * indicator; selection toggles rather than moves. This is the same engine Combobox uses for
   * multi-select.
   */
  multiple?: boolean;
  /** Controlled selection: a value, or with `multiple` an array. Omit for uncontrolled. */
  value?: ListboxValue;
  /** Initial selection (or array). */
  defaultValue?: ListboxValue;
  /**
   * Single-select only: arrow keys select as they move (the common picker feel). Set false when
   * selection has side effects, so arrows only move and Space selects.
   */
  selectionFollowsFocus?: boolean;
  /** At least one option must be selected to submit when inside a Form. */
  required?: boolean;
  /** The whole list is inert but readable. */
  disabled?: boolean;
  /** Field name for Form collection. Multiple values are collected as an array. */
  name?: string;
  /** Shown when `options` is empty (a filtered Combobox with no matches). Defaults to `copy.empty`. */
  emptyMessage?: string;
  /** Height in rows before the list scrolls; `all` never scrolls. */
  maxVisible?: ListboxMaxVisible;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ListboxOverridableBinding, TokenRef>>;
  /** Fired when the selection changes, with the new value (array when `multiple`). */
  onChange?: (value: ListboxValue) => void;
  /** Fired as the focused (active) option changes, with its value. */
  onActiveChange?: (value: string | null) => void;
}

/**
 * Listbox — Design Schema, category: input.
 *
 * When to use:
 * Use a standalone Listbox when the options should stay visible: a settings picker with five to
 * twenty entries, a transfer list, the sidebar of a two-pane chooser. Use `multiple` for "pick
 * any": tags, recipients, filters. Set `selectionFollowsFocus: false` when selecting has side
 * effects (loading a preview), so arrow-key browsing does not trigger them. Everywhere else, use
 * Select (short lists, form fields) or Combobox (long lists, typing to filter) — both open a
 * Listbox.
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(function Listbox(
  {
    label,
    labelledBy,
    options,
    multiple = false,
    value,
    defaultValue,
    selectionFollowsFocus = true,
    required = false,
    disabled = false,
    name,
    emptyMessage,
    maxVisible = '8',
    overrides,
    onChange,
    onActiveChange,
    onBlur,
    id: idProp,
    className,
    style,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-listbox${generatedId}`);
  const errorId = `${id}-error`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const optionRefs = useRef(new Map<string, HTMLDivElement>());
  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timer: null,
  });

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ListboxValue | undefined>(
    defaultValue ?? (multiple ? [] : undefined),
  );
  const selected = isControlled ? value : internalValue;

  const [activeValue, setActiveValueState] = useState<string | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = name ? form?.errors[name] : undefined;

  const rows = useMemo(() => flattenRows(options), [options]);
  const enabledRows = useMemo(() => rows.filter((row) => !row.disabled), [rows]);
  const maxVisibleKey = String(maxVisible) as '5' | '8' | '12' | 'all';

  const latest = useRef({ label, required, disabled: isDisabled, selected, multiple });
  latest.current = { label, required, disabled: isDisabled, selected, multiple };

  useEffect(() => {
    if (!form || !name) return undefined;
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
        return typeof current === 'string' ? current : undefined;
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, selected: current, multiple: isMultiple } = latest.current;
        const hasSelection = isMultiple ? toArray(current).length > 0 : current !== undefined;
        if (isRequired && !hasSelection) return COPY.required.replace('{label}', currentLabel);
        return null;
      },
      focus: () => rootRef.current?.focus(),
    });
  }, [form, name, id]);

  const isSelected = (optionValue: string) =>
    multiple ? toArray(selected).includes(optionValue) : selected === optionValue;

  const commitValue = (next: ListboxValue) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && name && form.validate === 'change') form.validateField(name);
  };

  const setActiveValue = (next: string | null) => {
    setActiveValueState(next);
    onActiveChange?.(next);
    if (next) optionRefs.current.get(next)?.scrollIntoView({ block: 'nearest' });
  };

  const moveActive = (optionValue: string) => {
    setActiveValue(optionValue);
    if (!multiple && selectionFollowsFocus) commitValue(optionValue);
  };

  const toggleSelection = (optionValue: string) => {
    const current = toArray(selected);
    commitValue(current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
  };

  const activateRow = (row: ListboxRow) => {
    if (isDisabled || row.disabled) return;
    if (multiple) toggleSelection(row.value);
    else commitValue(row.value);
  };

  const handleTypeahead = (char: string, currentIndex: number) => {
    if (enabledRows.length === 0) return;
    const state = typeaheadRef.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, 500);

    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    for (let offset = 1; offset <= enabledRows.length; offset++) {
      const candidate = enabledRows[(startIndex + offset) % enabledRows.length];
      if (candidate.label.toLowerCase().startsWith(state.buffer)) {
        moveActive(candidate.value);
        return;
      }
    }
    if (state.buffer.length > 1) {
      const single = state.buffer.slice(-1);
      for (let offset = 0; offset < enabledRows.length; offset++) {
        const candidate = enabledRows[(startIndex + offset) % enabledRows.length];
        if (candidate.label.toLowerCase().startsWith(single)) {
          state.buffer = single;
          moveActive(candidate.value);
          return;
        }
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isDisabled || enabledRows.length === 0) return;
    const currentIndex = activeValue ? enabledRows.findIndex((row) => row.value === activeValue) : -1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const target = currentIndex === -1 ? enabledRows[0] : enabledRows[Math.min(currentIndex + 1, enabledRows.length - 1)];
        if (multiple && event.shiftKey) {
          setActiveValue(target.value);
          const current = toArray(selected);
          if (!current.includes(target.value)) commitValue([...current, target.value]);
        } else {
          moveActive(target.value);
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const target = currentIndex === -1 ? enabledRows[enabledRows.length - 1] : enabledRows[Math.max(currentIndex - 1, 0)];
        if (multiple && event.shiftKey) {
          setActiveValue(target.value);
          const current = toArray(selected);
          if (!current.includes(target.value)) commitValue([...current, target.value]);
        } else {
          moveActive(target.value);
        }
        break;
      }
      case 'Home':
        event.preventDefault();
        moveActive(enabledRows[0].value);
        break;
      case 'End':
        event.preventDefault();
        moveActive(enabledRows[enabledRows.length - 1].value);
        break;
      case ' ':
        event.preventDefault();
        if (currentIndex !== -1) activateRow(enabledRows[currentIndex]);
        break;
      case 'Enter':
        if (!multiple && currentIndex !== -1) {
          event.preventDefault();
          commitValue(enabledRows[currentIndex].value);
        }
        break;
      case 'PageDown':
      case 'PageUp': {
        event.preventDefault();
        const pageRows = maxVisibleKey === 'all' ? enabledRows.length : Number(maxVisibleKey);
        const direction = event.key === 'PageDown' ? 1 : -1;
        const base = currentIndex === -1 ? (direction === 1 ? -1 : enabledRows.length) : currentIndex;
        const targetIndex = Math.min(Math.max(base + direction * pageRows, 0), enabledRows.length - 1);
        moveActive(enabledRows[targetIndex].value);
        break;
      }
      default:
        if (multiple && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
          event.preventDefault();
          const allValues = enabledRows.map((row) => row.value);
          const current = toArray(selected);
          const allSelected = allValues.length > 0 && allValues.every((v) => current.includes(v));
          commitValue(allSelected ? [] : allValues);
        } else if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key, currentIndex);
        }
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (form && name && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const handleRowPointerMove = (row: ListboxRow) => {
    if (isDisabled || row.disabled || row.value === activeValue) return;
    setActiveValue(row.value);
  };

  const handleRowClick = (row: ListboxRow) => (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isDisabled || row.disabled) {
      event.preventDefault();
      return;
    }
    setActiveValue(row.value);
    activateRow(row);
  };

  const setRowRef = (rowValue: string) => (element: HTMLDivElement | null) => {
    if (element) optionRefs.current.set(rowValue, element);
    else optionRefs.current.delete(rowValue);
  };

  // maxVisible has no row-height token, so — like the RN row measured from the first row — the
  // pixel cap is measured from the first rendered option rather than invented as a literal.
  const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (maxVisibleKey === 'all' || rows.length === 0) {
      setMaxHeight(undefined);
      return;
    }
    const firstRow = optionRefs.current.get(rows[0].value);
    const listEl = rootRef.current;
    if (!firstRow || !listEl) {
      setMaxHeight(undefined);
      return;
    }
    const rowHeight = firstRow.getBoundingClientRect().height;
    const gap = parseFloat(getComputedStyle(listEl).rowGap || '0');
    const visibleRows = Number(maxVisibleKey);
    setMaxHeight(`${visibleRows * rowHeight + Math.max(visibleRows - 1, 0) * gap}px`);
  }, [maxVisibleKey, rows]);

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
        <span className="ds-listbox__check" data-part="optionCheck" aria-hidden="true">
          <Icon name="check" inline overrides={{ color: 'color.control.selectedBackground' as TokenRef }} />
        </span>
        {row.icon ? (
          <span className="ds-listbox__icon" data-part="optionIcon" aria-hidden="true">
            <Icon name={row.icon} inline />
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

  const renderNode = (node: ListboxOption, path: string) => {
    if (isGroup(node)) {
      const groupLabelId = `${id}-group-${path}`;
      return (
        <div key={`${path}-group`} role="group" aria-labelledby={groupLabelId} data-part="group" className="ds-listbox__group">
          <div id={groupLabelId} data-part="groupLabel" className="ds-listbox__group-label">
            {node.group}
          </div>
          {node.options.map((child, index) => renderNode(child, `${path}-${index}`))}
        </div>
      );
    }
    return renderRow(node);
  };

  const classes = ['ds-listbox', isDisabled ? 'ds-listbox--disabled' : null, className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const heightStyle: CSSProperties | undefined = maxHeight ? { maxBlockSize: maxHeight } : undefined;
  const mergedStyle = overrideStyle || heightStyle || style ? { ...heightStyle, ...overrideStyle, ...style } : undefined;

  return (
    <div
      {...rest}
      ref={rootRef}
      id={id}
      data-ds="Listbox"
      data-part="list"
      role="listbox"
      tabIndex={0}
      data-max-visible={maxVisibleKey}
      className={classes}
      style={mergedStyle}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-multiselectable={multiple ? 'true' : undefined}
      aria-activedescendant={activeValue ? `${id}-option-${activeValue}` : undefined}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {rows.length === 0 ? (
        <div className="ds-listbox__empty" data-part="emptyState">
          <Text tone="muted" size="sm">
            {emptyMessage ?? COPY.empty}
          </Text>
        </div>
      ) : (
        options.map((node, index) => renderNode(node, String(index)))
      )}
      {resolvedError ? (
        <div className="ds-listbox__error" data-part="errorMessage">
          <Text element="span" id={errorId} role="alert" size="sm" tone="danger">
            {resolvedError}
          </Text>
        </div>
      ) : null}
    </div>
  );
});
