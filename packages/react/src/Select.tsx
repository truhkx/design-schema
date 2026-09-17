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

export type SelectValue = string | string[];
export type SelectNative = 'auto' | 'always' | 'never';
export type SelectSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}` is replaced by the visible label, `{count}` by the selection count. */
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
 * into the composed parts as the schema lists, and keep a root hook for the native <select>.
 */
export type SelectOverridableBinding =
  | 'triggerBorderInvalid'
  | 'triggerBorderWidth'
  | 'triggerRadius'
  | 'triggerPaddingInline'
  | 'triggerPaddingBlock'
  | 'triggerGap'
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
  helper: TextOverrides | undefined;
  listbox: ListboxOverrides | undefined;
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
    // Locked bindings have no hook, so they are ignored if passed.
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) rootStyle[rootHook] = cssVar(ref);
    const popupHook = POPUP_OVERRIDE_HOOK[binding];
    if (popupHook) popupStyle[popupHook] = cssVar(ref);
  }
  // fontSize is font.size.{size}: the label and value follow `size` unless overridden.
  const fontSize = given.fontSize ?? (`font.size.${size}` as TokenRef);
  const { fontFamily, lineHeight } = given;
  const shared = { ...(fontFamily ? { fontFamily } : {}), ...(lineHeight ? { lineHeight } : {}) };
  const hasShared = Object.keys(shared).length > 0;
  return {
    rootStyle: Object.keys(rootStyle).length > 0 ? (rootStyle as CSSProperties) : undefined,
    popupStyle: popupStyle as CSSProperties,
    label: { ...shared, fontSize, ...(given.labelWeight ? { fontWeight: given.labelWeight } : {}) },
    value: { ...shared, fontSize, ...(given.fontWeight ? { fontWeight: given.fontWeight } : {}) },
    helper: given.helperSize || hasShared ? { ...shared, ...(given.helperSize ? { fontSize: given.helperSize } : {}) } : undefined,
    // fontSize is not forwarded: the popup does not follow `size`.
    listbox: hasShared ? shared : undefined,
  };
}

/** The locked `chevron` binding, realised through the composed Icon's color. */
const CHEVRON_OVERRIDES: Partial<Record<'color', TokenRef>> = { color: 'color.foreground.muted' as TokenRef };

declare const process: { env: { NODE_ENV?: string } };

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

type SelectRow = { value: string; label: string; disabled?: boolean | undefined };

function isGroup(option: ListboxItem): option is ListboxGroup {
  return 'group' in option;
}

/** Depth-first rows, dropping group wrappers — used to resolve a value to its label. */
function flattenRows(options: ListboxItem[]): SelectRow[] {
  const result: SelectRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

function toArray(value: SelectValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === '' ? [] : [value];
}

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
  selected: SelectValue | undefined,
  rows: SelectRow[],
  multiple: boolean,
  placeholder: string,
): { text: string; isPlaceholder: boolean } {
  const labelFor = (v: string) => rows.find((row) => row.value === v)?.label ?? v;
  const values = toArray(selected);
  if (values.length === 0) return { text: placeholder, isPlaceholder: true };
  if (!multiple) return { text: labelFor(values[0]!), isPlaceholder: false };
  if (values.length <= 2) return { text: values.map(labelFor).join(', '), isPlaceholder: false };
  return { text: COPY.selectedCount.replace('{count}', String(values.length)), isPlaceholder: false };
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
  /** Not openable and not submitted. Stays visible and focusable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /**
   * Use the platform's own picker instead of the popup Listbox: `auto` means never on web (the
   * styled popup) and always on native phones (the OS wheel/dialog is what users expect); `always`
   * forces a native <select> on web too (forms that must work without JS); `never` forces the popup
   * everywhere.
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

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<SelectValue | undefined>(defaultValue);
  const selected = isControlled ? value : internalValue;
  const selectedValues = toArray(selected);

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = !isNativeSelect && (isOpenControlled ? openProp : internalOpen);
  // Guards close against running twice in one event (a Listbox commit and the key that caused it).
  const openRef = useRef(open);
  openRef.current = open;
  // Set while a trigger key is being replayed on the Listbox, so the popup's own handler skips it.
  const forwarding = useRef(false);

  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);

  const isDisabled = disabled || (form?.disabled ?? false);
  // The error region shows `error`, then the Form's message, then `copy.invalid` while `invalid` (as Input).
  const resolvedError =
    (error !== undefined && error !== '' ? error : undefined) ??
    form?.errors[name] ??
    (invalid ? COPY.invalid.replace('{label}', label) : undefined);
  const isInvalid = invalid || resolvedError !== undefined;

  const rows = flattenRows(options);
  const resolvedPlaceholder = placeholder ?? COPY.placeholder;
  const { text: triggerText, isPlaceholder } = displayText(selected, rows, multiple, resolvedPlaceholder);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !label) {
      console.warn('Select: `label` is required; it is the trigger’s accessible name.');
    }
  }, [label]);

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
      // valueType string[]: every selected value with `multiple`, the value otherwise; no key when empty.
      getValue: () => {
        const values = toArray(latest.current.selected);
        if (values.length === 0) return undefined;
        return latest.current.multiple ? values : values[0];
      },
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, selected: current, invalid: isInvalidProp, error: errorProp } =
          latest.current;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && toArray(current).length === 0) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => (isNativeSelect ? selectRef.current?.focus() : triggerRef.current?.focus()),
    });
  }, [form, name, id, isNativeSelect]);

  const commitValue = (next: SelectValue) => {
    if (!Array.isArray(next) && next === selected) return;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
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
    setActiveValue(null);
    if (focusTrigger) triggerRef.current?.focus();
    changeOpen(false);
  };

  /** The option Enter and Tab commit: the active one, else the selected, else the first enabled. */
  const resolveActive = (): string | undefined =>
    activeValue ??
    rows.find((row) => !row.disabled && selectedValues.includes(row.value))?.value ??
    rows.find((row) => !row.disabled)?.value;

  // Position the popup on open and keep it anchored while scrolling or resizing.
  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
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

    // Focus stays on the trigger. The Listbox resolves its first active option (the selection, else
    // the first enabled) when it receives focus, so that moment is signalled without moving focus.
    listboxRef.current?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    if (document.activeElement !== trigger) trigger.focus();

    if (prefersReducedMotion()) setEntered(true);
    else requestAnimationFrame(() => setEntered(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  // A pointer press or focus move outside the trigger and popup closes.
  const closeRef = useRef(closeSelect);
  closeRef.current = closeSelect;
  useEffect(() => {
    if (!open) return undefined;
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
  }, [open]);

  /** Select's own keys while open; returns true when the key was handled here. */
  const handleOpenKey = (event: ReactKeyboardEvent<HTMLElement>): boolean => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        closeSelect(true);
        return true;
      case 'Tab': {
        // Commits (single) and closes; the default action moves focus on from the trigger.
        if (!multiple) {
          const target = resolveActive();
          if (target !== undefined) commitValue(target);
        }
        if (triggerRef.current && document.activeElement !== triggerRef.current) triggerRef.current.focus();
        closeSelect(false);
        return true;
      }
      case 'Enter': {
        event.preventDefault();
        const target = resolveActive();
        if (multiple) {
          // Listbox's Enter is a no-op with `multiple`; here it toggles and stays open.
          if (target !== undefined) {
            commitValue(
              rows
                .map((row) => row.value)
                .filter((v) => (v === target ? !selectedValues.includes(v) : selectedValues.includes(v))),
            );
          }
        } else {
          if (target !== undefined) commitValue(target);
          closeSelect(true);
        }
        return true;
      }
      default:
        return false;
    }
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
    if (!open) {
      if (!isDisabled && OPEN_KEYS.has(event.key)) {
        event.preventDefault();
        openSelect();
      }
      return;
    }
    if (handleOpenKey(event)) return;
    // Everything else is the Listbox's keyboard model: replay the key on it.
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
    forwarding.current = true;
    try {
      list.dispatchEvent(forwarded);
    } finally {
      forwarding.current = false;
    }
    if (forwarded.defaultPrevented) event.preventDefault();
    // Space commits in single mode; close even when it re-picked the current value.
    if (event.key === ' ' && !multiple) closeSelect(true);
  };

  const handlePopupKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (forwarding.current || event.target === triggerRef.current) return;
    // Focus reached the list directly (it is tabbable); Listbox has already handled its own keys.
    if (event.key === 'Enter' && !multiple) {
      closeSelect(true);
      return;
    }
    if (event.key === 'Escape' || event.key === 'Tab' || (event.key === 'Enter' && multiple)) handleOpenKey(event);
  };

  const handleListboxChange = (next: ListboxValue) => {
    commitValue(next);
    if (!multiple) closeSelect(true);
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
      if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
    };

    const renderNativeNode = (node: ListboxItem, path: string): ReactElement => {
      if (isGroup(node)) {
        return (
          <optgroup key={`${path}-group`} label={node.group}>
            {node.options.map((child, index) => renderNativeNode(child, `${path}-${index}`))}
          </optgroup>
        );
      }
      return (
        <option key={node.value} value={node.value} disabled={node.disabled}>
          {node.label}
        </option>
      );
    };

    const nativeValue = multiple ? selectedValues : (selectedValues[0] ?? '');

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
            value={nativeValue}
            required={required}
            // The one place the system uses real `disabled`: without JavaScript, aria alone would not stop interaction.
            disabled={isDisabled}
            className="ds-select__native"
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
            {options.map((node, index) => renderNativeNode(node, String(index)))}
          </select>
          {!multiple ? chevronNode : null}
        </span>
        {errorNode}
      </div>
    );
  }

  const initialActive = selectedValues[0];

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
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && activeValue !== null ? `${listboxId}-option-${activeValue}` : undefined}
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
        onBlur={onBlur}
      >
        {/* valueColor / placeholderColor are the value Text's default and muted tones. */}
        <span className="ds-select__value">
          <Text element="span" data-part="value" tone={isPlaceholder ? 'muted' : 'default'} overrides={resolved.value}>
            {triggerText}
          </Text>
        </span>
        {chevronNode}
      </button>
      {/* Disabled selects are not submitted. */}
      {isDisabled ? null : selectedValues.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      {errorNode}
      {open
        ? createPortal(
            <div
              ref={popupRef}
              data-part="popup"
              data-vertical={vertical}
              className={['ds-select__popup', entered ? 'ds-select__popup--entered' : null].filter(Boolean).join(' ')}
              style={{ ...popupPosition, ...resolved.popupStyle }}
              // Keep focus on the trigger when an option is pressed.
              onMouseDown={(event) => event.preventDefault()}
              onClick={handlePopupClick}
              onKeyDown={handlePopupKeyDown}
            >
              <Listbox
                ref={listboxRef}
                id={listboxId}
                label={label}
                labelledBy={labelId}
                options={options}
                multiple={multiple}
                value={multiple ? selectedValues : (selectedValues[0] ?? [])}
                selectionFollowsFocus={false}
                embedded
                initialActiveValue={initialActive}
                overrides={resolved.listbox}
                onChange={handleListboxChange}
                onActiveChange={setActiveValue}
              />
            </div>,
            container ?? document.body,
          )
        : null}
    </div>
  );
}
