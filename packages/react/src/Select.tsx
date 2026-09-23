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
  type FocusEvent as ReactFocusEvent,
  type FocusEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text, type TextOverridableBinding } from './Text';
import {
  Listbox,
  type ListboxGroup,
  type ListboxItem,
  type ListboxOverridableBinding,
  type ListboxValue,
} from './Listbox';
import { useFormContext } from './FormContext';
import './Select.css';

declare const process: { env: { NODE_ENV?: string } };

export type SelectValue = string | string[];
export type SelectNative = 'auto' | 'always' | 'never';
export type SelectSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}` is replaced by the visible label, `{count}` by the formatted selection count. */
const COPY = {
  placeholder: 'Select…',
  selectedCount: '{count} selected',
  done: 'Done',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
} as const;

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight` and `helperSize` reach only the composed Text parts' own `overrides`
 * (no --ds-select-* hook); `fontFamily`, `fontSize`, `fontWeight` and `lineHeight` are forwarded
 * into the composed parts and keep a root hook for the trigger and the native <select>.
 */
export type SelectOverridableBinding =
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
  | 'chevronReserve'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'popupSurface'
  | 'popupBorder'
  | 'popupBorderWidth'
  | 'popupShadow'
  | 'popupRadius'
  | 'popupOffset'
  | 'layer'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

const ROOT_OVERRIDE_HOOK: Partial<Record<SelectOverridableBinding, string>> = {
  triggerBorderInvalid: '--ds-select-trigger-border-invalid',
  triggerBorderWidth: '--ds-select-trigger-border-width',
  triggerRadius: '--ds-select-trigger-radius',
  triggerPaddingInline: '--ds-select-trigger-padding-inline',
  triggerPaddingBlock: '--ds-select-trigger-padding-block',
  triggerGap: '--ds-select-trigger-gap',
  chevronReserve: '--ds-select-chevron-reserve',
  partGap: '--ds-select-part-gap',
  fontFamily: '--ds-select-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-select-font-size',
  fontWeight: '--ds-select-font-weight',
  lineHeight: '--ds-select-line-height',
  disabledOpacity: '--ds-select-disabled-opacity',
};

/** The popup is portaled, so it inherits nothing from the root: its bindings are set on the popup node itself. */
const POPUP_OVERRIDE_HOOK: Partial<Record<SelectOverridableBinding, string>> = {
  popupSurface: '--ds-select-popup-surface',
  popupBorder: '--ds-select-popup-border',
  popupBorderWidth: '--ds-select-popup-border-width',
  popupShadow: '--ds-select-popup-shadow',
  popupRadius: '--ds-select-popup-radius',
  popupOffset: '--ds-select-popup-offset',
  layer: '--ds-select-layer',
  enter: '--ds-select-enter',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type ListboxOverrides = Partial<Record<ListboxOverridableBinding, TokenRef | undefined>>;

type ResolvedOverrides = {
  rootStyle: CSSProperties | undefined;
  popupStyle: CSSProperties;
  label: TextOverrides;
  value: TextOverrides;
  helper: TextOverrides;
  listbox: ListboxOverrides;
};

/** Splits `overrides` into the root and popup hooks and the forwards into each composed part. */
function resolveOverrides(
  overrides: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined,
  size: SelectSize,
): ResolvedOverrides {
  const rootStyle: Record<string, string> = {};
  const popupStyle: Record<string, string> = {};
  const given = overrides ?? {};
  for (const binding of Object.keys(given) as SelectOverridableBinding[]) {
    const ref = given[binding];
    if (!ref) continue;
    // Locked bindings have no hook in either table, so they are ignored if passed.
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) rootStyle[rootHook] = cssVar(ref);
    const popupHook = POPUP_OVERRIDE_HOOK[binding];
    if (popupHook) popupStyle[popupHook] = cssVar(ref);
  }
  // Every forward carries the resolved token — the consumer's override, else the Select default with
  // {size} resolved — because the composed Text has no size prop of its own.
  const fontSize: TokenRef = given.fontSize ?? (size === 'sm' ? 'font.size.sm' : 'font.size.md');
  const shared: TextOverrides = {
    fontFamily: given.fontFamily ?? 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
    lineHeight: given.lineHeight ?? 'font.lineHeight.normal',
  };
  return {
    rootStyle: Object.keys(rootStyle).length > 0 ? (rootStyle as CSSProperties) : undefined,
    popupStyle: popupStyle as CSSProperties,
    label: { ...shared, fontSize, fontWeight: given.labelWeight ?? 'font.weight.medium' },
    value: { ...shared, fontSize, fontWeight: given.fontWeight ?? 'font.weight.regular' },
    helper: { ...shared, fontSize: given.helperSize ?? 'font.size.sm' },
    // Neither fontSize nor fontWeight reaches the popup: options keep Listbox's own type.
    listbox: shared,
  };
}

/** The locked `chevron` binding, always forwarded as the composed Icon's `overrides.color`. */
const CHEVRON_OVERRIDES: Partial<Record<'color', TokenRef>> = { color: 'color.foreground.muted' };

type SelectRow = { value: string; label: string; disabled?: boolean | undefined };

function isGroup(option: ListboxItem): option is ListboxGroup {
  return 'group' in option;
}

/** Rows in document order, dropping group wrappers (groups do not nest). */
function flattenRows(options: ListboxItem[]): SelectRow[] {
  const result: SelectRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...option.options);
    else result.push(option);
  }
  return result;
}

function toArray(value: SelectValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === '' ? [] : [value];
}

/** Listbox's own order: option order, with values that match no option appended. */
function inListboxOrder(values: string[], rows: SelectRow[]): string[] {
  const known = rows.map((row) => row.value);
  return [...known.filter((v) => values.includes(v)), ...values.filter((v) => !known.includes(v))];
}

const subscribeNothing = (): (() => void) => () => {};

type ResolvedPosition = { style: CSSProperties; vertical: 'top' | 'bottom' };

/** Below the trigger (above when it would overflow), start-aligned, kept inside the viewport, at least as wide as the trigger. */
function computePosition(triggerRect: DOMRect, popupRect: DOMRect): ResolvedPosition {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const vertical: 'top' | 'bottom' =
    triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0 ? 'top' : 'bottom';
  const width = Math.max(popupRect.width, triggerRect.width);
  const left = Math.max(0, Math.min(triggerRect.left, viewportWidth - width));
  const style: Record<string, string | number> = { left, '--ds-select-trigger-width': `${triggerRect.width}px` };
  if (vertical === 'bottom') style.top = triggerRect.bottom;
  else style.bottom = viewportHeight - triggerRect.top;
  return { style: style as CSSProperties, vertical };
}

function displayText(
  values: string[],
  rows: SelectRow[],
  multiple: boolean,
  placeholder: string,
): { text: string; isPlaceholder: boolean } {
  const labelFor = (v: string) => rows.find((row) => row.value === v)?.label ?? v;
  if (values.length === 0) return { text: placeholder, isPlaceholder: true };
  if (!multiple) return { text: labelFor(values[0]!), isPlaceholder: false };
  // Two or fewer are joined with a literal comma and a space (deliberately not Intl.ListFormat).
  if (values.length <= 2) return { text: values.map(labelFor).join(', '), isPlaceholder: false };
  return {
    text: COPY.selectedCount.replace('{count}', new Intl.NumberFormat().format(values.length)),
    isPlaceholder: false,
  };
}

export interface SelectProps
  extends Omit<
    ComponentPropsWithoutRef<'button'>,
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
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-labelledby'
    | 'aria-activedescendant'
    | 'aria-disabled'
  > {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The options, passed through to the Listbox. */
  options: ListboxItem[];
  /** Controlled value (array with `multiple`). */
  value?: SelectValue | undefined;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue | undefined;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  placeholder?: string | undefined;
  /** Visually hide the label (it remains the accessible name), for compact pickers such as DatePicker's month and year. */
  hideLabel?: boolean | undefined;
  /** sm for pickers inside toolbars and calendar headers. */
  size?: SelectSize | undefined;
  /**
   * Controlled popup state, for programmatic opening and for stories and tests (the Keyboard story
   * renders it open). Omit for the trigger-driven default.
   */
  open?: boolean | undefined;
  /**
   * Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer); the
   * popup stays open while toggling and closes on Escape or outside click.
   */
  multiple?: boolean | undefined;
  /** Helper text under the label. */
  description?: string | undefined;
  /** Must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /**
   * Not openable and not submitted. Stays visible and focusable. Wins over a controlled `open`: a
   * disabled Select never shows its popup — it forces the popup closed locally, reports
   * `aria-expanded="false"`, and fires no `onOpenChange` to correct the caller's prop.
   */
  disabled?: boolean | undefined;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /**
   * Use the platform's own picker instead of the popup Listbox: `auto` means never on web (the
   * styled popup) and always on native phones; `always` forces a native <select> on web too (forms
   * that must work without JS); `never` forces the popup everywhere. On web `auto` and `never`
   * render identically.
   */
  native?: SelectNative | undefined;
  /** Portal target for the popup. Defaults to `document.body`. A platform prop, not a schema prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: ((value: string | string[]) => void) | undefined;
  /** Fired when the popup opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/** Keys that open the closed popup from the trigger. */
const OPEN_KEYS: ReadonlySet<string> = new Set(['Enter', ' ', 'ArrowDown', 'ArrowUp']);

/**
 * Select — Design Schema, category: input. The APG select-only combobox.
 *
 * When to use:
 * Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.
 *
 * The root is the field group (`data-ds="Select"`, `data-ds-field`); `ref` reaches the control —
 * the trigger button, or the native <select> with `native: always`.
 */
export function Select({
  ref,
  label,
  name,
  options,
  value,
  defaultValue,
  placeholder,
  hideLabel = false,
  size = 'md',
  open: openProp,
  multiple = false,
  description,
  required = false,
  disabled = false,
  invalid = false,
  error,
  native = 'auto',
  container,
  overrides,
  onChange,
  onOpenChange,
  id: idProp,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  onFocus,
  onBlur,
  ...rest
}: SelectProps & { ref?: Ref<HTMLButtonElement | HTMLSelectElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-select${generatedId}`);
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const listboxId = `${id}-listbox`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const isNativeSelect = native === 'always';
  useImperativeHandle(
    ref,
    () => (isNativeSelect ? selectRef.current : triggerRef.current) as HTMLButtonElement | HTMLSelectElement,
    [isNativeSelect],
  );

  // False on the server and through hydration; the portal renders only once this is true.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<SelectValue | undefined>(defaultValue);
  const selected = isControlled ? value : internalValue;
  const selectedValues = multiple ? toArray(selected) : toArray(selected).slice(0, 1);

  const isDisabled = disabled || (form?.disabled ?? false);
  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  // Disabled wins over a controlled `open`: the popup is forced closed locally, with no onOpenChange.
  const isOpen = !isNativeSelect && !isDisabled && (isOpenControlled ? openProp : internalOpen);
  // Guards close against running twice in one event (a Listbox commit and the key that caused it).
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  useEffect(() => {
    if (isDisabled && internalOpen) setInternalOpen(false);
  }, [isDisabled, internalOpen]);

  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [visible, setVisible] = useState(false);

  // The error region shows `error`, then the Form's message, then `copy.invalid` while `invalid` (as Input).
  const resolvedError =
    (error !== undefined && error !== '' ? error : undefined) ??
    form?.errors[name] ??
    (invalid ? COPY.invalid.replace('{label}', label) : undefined);
  const isInvalid = invalid || resolvedError !== undefined;

  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnBlur = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  const rows = flattenRows(options);
  const enabledRows = rows.filter((row) => !row.disabled);
  const resolvedPlaceholder = placeholder ?? COPY.placeholder;
  const { text: triggerText, isPlaceholder } = displayText(selectedValues, rows, multiple, resolvedPlaceholder);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label) {
      console.warn('Select: `label` is required; it is the trigger’s accessible name.');
    }
  }, [label]);

  const latest = useRef({ label, required, disabled: isDisabled, selectedValues, multiple, invalid, error });
  latest.current = { label, required, disabled: isDisabled, selectedValues, multiple, invalid, error };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      // A string for single, a string[] with `multiple`; nothing (no key) when empty.
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
      focus: () => (isNativeSelect ? selectRef.current?.focus() : triggerRef.current?.focus()),
    });
  }, [form, name, id, isNativeSelect]);

  const commitValue = (next: SelectValue) => {
    if (Array.isArray(next)) {
      if (next.length === selectedValues.length && next.every((v, i) => v === selectedValues[i])) return;
    } else if (next === selectedValues[0]) {
      return;
    }
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && validatesOnChange) {
      // validateField runs the registration's validate() before the re-render, so hand it the new value first.
      latest.current.selectedValues = toArray(next);
      form.validateField(name);
    }
  };

  const changeOpen = (next: boolean) => {
    openRef.current = next;
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const openSelect = () => {
    if (openRef.current || isDisabled) return;
    changeOpen(true);
  };

  const closeSelect = (focusTrigger: boolean) => {
    if (!openRef.current) return;
    if (focusTrigger) triggerRef.current?.focus();
    changeOpen(false);
  };

  /** The option the popup opens on: the selection (the array's first with `multiple`), else the first enabled. */
  const openingActive = (): string | null =>
    selectedValues.find((v) => enabledRows.some((row) => row.value === v)) ?? enabledRows[0]?.value ?? null;

  // Select drives Listbox's `activeValue`: the opening option on open, whatever it reports while open, null on close.
  const openingActiveRef = useRef(openingActive);
  openingActiveRef.current = openingActive;
  useLayoutEffect(() => {
    setActiveValue(isOpen ? openingActiveRef.current() : null);
  }, [isOpen]);

  // Position the popup once it is in the DOM, keep it anchored while scrolling or resizing, and turn
  // the visible flag on a frame later so the enter fade runs.
  useLayoutEffect(() => {
    if (!isOpen || !hydrated) {
      setVisible(false);
      return undefined;
    }
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return undefined;

    const reposition = () => {
      const result = computePosition(trigger.getBoundingClientRect(), popup.getBoundingClientRect());
      setPopupPosition(result.style);
      setVertical(result.vertical);
    };
    reposition();
    const frame = requestAnimationFrame(() => setVisible(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen, hydrated]);

  // A pointer press or focus move outside the trigger and popup closes without changing the value.
  const closeRef = useRef(closeSelect);
  closeRef.current = closeSelect;
  useEffect(() => {
    if (!isOpen) return undefined;
    const isOutside = (target: Node | null) =>
      !target || (!popupRef.current?.contains(target) && !triggerRef.current?.contains(target));
    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target as Node)) closeRef.current(false);
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (isOutside(event.relatedTarget as Node | null)) closeRef.current(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [isOpen]);

  const currentActive = (): string | null => activeValue ?? openingActive();

  const toggleActive = () => {
    const target = currentActive();
    if (target === null) return;
    const next = selectedValues.includes(target)
      ? selectedValues.filter((v) => v !== target)
      : inListboxOrder([...selectedValues, target], rows);
    commitValue(next);
  };

  /** Replays a trigger key on the Listbox wrapper (where Listbox handles keys) and copies defaultPrevented back. */
  const forwardKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const list = listboxRef.current;
    if (!list) return;
    const forwarded = new KeyboardEvent('keydown', {
      key: event.key,
      code: event.code,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
      bubbles: true,
      cancelable: true,
    });
    list.dispatchEvent(forwarded);
    if (forwarded.defaultPrevented) event.preventDefault();
  };

  const handleTriggerClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClickProp?.(event);
    if (event.defaultPrevented || isDisabled) return;
    if (openRef.current) closeSelect(false);
    else openSelect();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    if (!isOpen) {
      if (!isDisabled && OPEN_KEYS.has(event.key)) {
        event.preventDefault();
        openSelect();
      }
      return;
    }
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeSelect(true);
        return;
      case 'Tab': {
        // Commits the active option (single) and closes; the default focus move is never prevented.
        if (!multiple) {
          const target = currentActive();
          if (target !== null) commitValue(target);
        }
        closeSelect(false);
        return;
      }
      case 'Enter':
        if (multiple) {
          // Listbox's Enter is a no-op with `multiple`: Select toggles the active option and stays open.
          event.preventDefault();
          toggleActive();
          return;
        }
        forwardKey(event);
        event.preventDefault();
        // Commits through Listbox's onChange; a re-picked value still closes.
        closeSelect(true);
        return;
      case ' ':
        forwardKey(event);
        event.preventDefault();
        if (!multiple) closeSelect(true);
        return;
      default:
        forwardKey(event);
    }
  };

  const handleTriggerBlur = (event: ReactFocusEvent<HTMLButtonElement>) => {
    onBlur?.(event);
    if (form && validatesOnBlur && !openRef.current) form.validateField(name);
  };

  const handleListboxChange = (next: ListboxValue) => {
    commitValue(next);
    if (!multiple) closeSelect(true);
  };

  const handleListboxActiveChange = (next: string | null) => {
    if (openRef.current) setActiveValue(next);
  };

  const handlePopupClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    // Clicking the already-selected option commits nothing but still closes a single select.
    if (multiple) return;
    const option = (event.target as Element).closest('[role="option"]');
    if (option && option.getAttribute('aria-disabled') !== 'true') closeSelect(true);
  };

  const resolved = resolveOverrides(overrides, size);

  const classes = [
    'ds-select',
    `ds-select--${size}`,
    isInvalid ? 'ds-select--invalid' : null,
    isDisabled ? 'ds-select--disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  // Clicking the label focuses the trigger and does not open the popup (a <label for> would click the button).
  const handleLabelClick = (event: ReactMouseEvent<HTMLLabelElement>) => {
    if (isNativeSelect) return;
    event.preventDefault();
    triggerRef.current?.focus();
  };

  const labelNode = (
    <label
      htmlFor={id}
      id={labelId}
      className={['ds-select__label', hideLabel ? 'ds-select__visually-hidden' : null].filter(Boolean).join(' ')}
      onClick={handleLabelClick}
    >
      <Text element="span" weight="medium" data-part="label" overrides={resolved.label}>
        {label}
        {required ? COPY.requiredIndicator : null}
      </Text>
    </label>
  );

  const descriptionNode = description ? (
    <Text element="span" id={descriptionId} size="sm" tone="muted" data-part="description" overrides={resolved.helper}>
      {description}
    </Text>
  ) : null;

  // The error region is the composed danger Text itself: role="alert", the described-by id and the part hook.
  const errorNode = resolvedError ? (
    <Text
      element="span"
      id={errorId}
      role="alert"
      size="sm"
      tone="danger"
      data-part="errorMessage"
      overrides={resolved.helper}
    >
      {resolvedError}
    </Text>
  ) : null;

  // The wrapper only places the composed Icon; it never styles it.
  const chevronNode = (
    <span className="ds-select__chevron" aria-hidden="true">
      <Icon name="chevron-down" size="sm" data-part="chevron" overrides={CHEVRON_OVERRIDES} />
    </span>
  );

  if (isNativeSelect) {
    const handleNativeChange = (event: ChangeEvent<HTMLSelectElement>) => {
      commitValue(multiple ? Array.from(event.target.selectedOptions, (option) => option.value) : event.target.value);
    };

    const handleNativeBlur = (event: ReactFocusEvent<HTMLSelectElement>) => {
      (onBlur as FocusEventHandler<HTMLSelectElement> | undefined)?.(event);
      if (form && validatesOnBlur) form.validateField(name);
    };

    const renderNativeNode = (node: ListboxItem, index: number): ReactElement => {
      if (isGroup(node)) {
        return (
          <optgroup key={`group-${index}`} label={node.group}>
            {node.options.map((child) => (
              <option key={child.value} value={child.value} disabled={child.disabled}>
                {child.label}
              </option>
            ))}
          </optgroup>
        );
      }
      return (
        <option key={node.value} value={node.value} disabled={node.disabled}>
          {node.label}
        </option>
      );
    };

    return (
      <div data-ds="Select" data-ds-field="" className={classes} style={resolved.rootStyle}>
        {labelNode}
        {descriptionNode}
        <span className="ds-select__native-wrap">
          <select
            {...(rest as unknown as ComponentPropsWithoutRef<'select'>)}
            ref={selectRef}
            id={id}
            name={name}
            multiple={multiple}
            value={multiple ? selectedValues : (selectedValues[0] ?? '')}
            required={required}
            // The one place the system uses real `disabled`: without JavaScript, aria alone would not stop interaction.
            disabled={isDisabled}
            className={
              !multiple && selectedValues.length === 0
                ? 'ds-select__native ds-select__native--placeholder'
                : 'ds-select__native'
            }
            data-part="trigger"
            aria-describedby={describedBy || undefined}
            aria-invalid={isInvalid ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            onChange={handleNativeChange}
            onFocus={onFocus as FocusEventHandler<HTMLSelectElement> | undefined}
            onBlur={handleNativeBlur}
          >
            {!multiple ? (
              <option value="" disabled>
                {resolvedPlaceholder}
              </option>
            ) : null}
            {options.map(renderNativeNode)}
          </select>
          {!multiple ? chevronNode : null}
        </span>
        {errorNode}
      </div>
    );
  }

  const popupPresent = isOpen && hydrated;
  const shown = visible && isOpen;
  const host = hydrated ? (container ?? document.body) : null;

  return (
    <div data-ds="Select" data-ds-field="" className={classes} style={resolved.rootStyle}>
      {labelNode}
      {descriptionNode}
      <button
        {...rest}
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-controls={popupPresent ? listboxId : undefined}
        aria-activedescendant={popupPresent && activeValue !== null ? `${listboxId}-option-${activeValue}` : undefined}
        aria-labelledby={labelId}
        aria-describedby={describedBy || undefined}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        data-part="trigger"
        className="ds-select__trigger"
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        onFocus={onFocus}
        onBlur={handleTriggerBlur}
      >
        {/* valueColor / placeholderColor are the value Text's default and muted tones. */}
        <span className="ds-select__value">
          <Text element="span" data-part="value" tone={isPlaceholder ? 'muted' : 'default'} overrides={resolved.value}>
            {triggerText}
          </Text>
        </span>
        {chevronNode}
      </button>
      {/* One hidden input per selected value; none when disabled. */}
      {isDisabled ? null : selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {errorNode}
      {popupPresent && host
        ? createPortal(
            <div
              ref={popupRef}
              data-part="popup"
              data-vertical={vertical}
              className={['ds-select__popup', shown ? 'ds-select__popup--visible' : null].filter(Boolean).join(' ')}
              style={{ ...popupPosition, ...resolved.popupStyle }}
              // Keep focus on the trigger when an option is pressed.
              onMouseDown={(event) => event.preventDefault()}
              onClick={handlePopupClick}
            >
              <Listbox
                ref={listboxRef}
                id={listboxId}
                data-part="listbox"
                label={label}
                labelledBy={labelId}
                options={options}
                multiple={multiple}
                value={multiple ? selectedValues : (selectedValues[0] ?? [])}
                selectionFollowsFocus={false}
                embedded
                initialActiveValue={selectedValues[0]}
                activeValue={activeValue}
                overrides={resolved.listbox}
                onChange={handleListboxChange}
                onActiveChange={handleListboxActiveChange}
              />
            </div>,
            host,
          )
        : null}
    </div>
  );
}
