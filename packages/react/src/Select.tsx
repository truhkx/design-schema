import {
  forwardRef,
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
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text, type TextOverridableBinding } from './Text';
import { Listbox, type ListboxOption, type ListboxValue } from './Listbox';
import { useFormContext } from './FormContext';
import './Select.css';

export type SelectValue = string | string[];
export type SelectNative = 'auto' | 'always' | 'never';

/** copy.* — used verbatim; `{label}` is replaced by the visible label, `{count}` by the selection count. */
const COPY = {
  placeholder: 'Select…',
  selectedCount: '{count} selected',
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
};

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `labelWeight` and `helperSize` are forwarded to the composed `Text` label/description's
 * own `overrides`, since Text already owns those bindings.
 */
export type SelectOverridableBinding =
  | 'triggerBorderFocus'
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
  | 'popupShadow'
  | 'popupRadius'
  | 'popupOffset'
  | 'layer'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'enter';

const ROOT_OVERRIDE_HOOK: Partial<Record<SelectOverridableBinding, string>> = {
  triggerBorderFocus: '--ds-select-trigger-border-focus',
  triggerBorderInvalid: '--ds-select-trigger-border-invalid',
  triggerBorderWidth: '--ds-select-trigger-border-width',
  triggerRadius: '--ds-select-trigger-radius',
  triggerPaddingInline: '--ds-select-trigger-padding-inline',
  triggerPaddingBlock: '--ds-select-trigger-padding-block',
  triggerGap: '--ds-select-trigger-gap',
  partGap: '--ds-select-part-gap',
  fontFamily: '--ds-select-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-select-font-size',
  lineHeight: '--ds-select-line-height',
  disabledOpacity: '--ds-select-disabled-opacity',
};

/**
 * The popup is portaled, so its own bindings are set on the popup node itself, not inherited from
 * the root. `popupBorder`/`popupRadius`/`popupSurface` are all read by the nested Listbox too (via
 * the sanctioned CSS custom-property escape hatch in Select.css), since Listbox's own equivalent
 * `surface` binding is locked and forwarding `border`/`radius` through its `overrides` prop instead
 * would desync the wrapper's shadow-clipping radius from the visible box whenever only one path
 * were overridden.
 */
const POPUP_OVERRIDE_HOOK: Partial<Record<SelectOverridableBinding, string>> = {
  popupSurface: '--ds-select-popup-surface',
  popupBorder: '--ds-select-popup-border',
  popupShadow: '--ds-select-popup-shadow',
  popupRadius: '--ds-select-popup-radius',
  popupOffset: '--ds-select-popup-offset',
  layer: '--ds-select-layer',
  enter: '--ds-select-enter',
};

function resolveOverrides(overrides: Partial<Record<SelectOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  popupStyle: CSSProperties;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const popupStyle: Record<string, string> = {};
  const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  for (const binding of Object.keys(overrides) as SelectOverridableBinding[]) {
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

type SelectRow = { value: string; label: string; disabled?: boolean };

function isGroup(option: ListboxOption): option is { group: string; options: ListboxOption[] } {
  return 'group' in option;
}

/** Depth-first rows, dropping group wrappers — used to resolve a value to its label. */
function flattenRows(options: ListboxOption[]): SelectRow[] {
  const result: SelectRow[] = [];
  for (const option of options) {
    if (isGroup(option)) result.push(...flattenRows(option.options));
    else result.push(option);
  }
  return result;
}

function toArray(value: SelectValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
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

/** Positions the popup below (or above, on overflow) the trigger, left-aligned and at least as wide as it. */
function computePosition(triggerRect: DOMRect, popupRect: DOMRect): ResolvedPosition {
  const viewportHeight = window.innerHeight;
  let vertical: 'top' | 'bottom' = 'bottom';
  if (triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0) {
    vertical = 'top';
  }
  const style: Record<string, string | number> = {
    left: triggerRect.left,
    '--ds-select-trigger-width': `${triggerRect.width}px`,
  };
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
  if (multiple) {
    const values = toArray(selected);
    if (values.length === 0) return { text: placeholder, isPlaceholder: true };
    if (values.length <= 2) return { text: values.map(labelFor).join(', '), isPlaceholder: false };
    return { text: COPY.selectedCount.replace('{count}', String(values.length)), isPlaceholder: false };
  }
  if (typeof selected === 'string' && selected !== '') return { text: labelFor(selected), isPlaceholder: false };
  return { text: placeholder, isPlaceholder: true };
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
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-haspopup'
    | 'aria-expanded'
    | 'aria-controls'
    | 'aria-labelledby'
  > {
  /** Visible label. Always rendered. */
  label: string;
  /** Field name for the Form. */
  name: string;
  /** The options, passed through to the Listbox. */
  options: ListboxOption[];
  /** Controlled value (array with `multiple`). */
  value?: SelectValue;
  /** Initial value (array with `multiple`). */
  defaultValue?: SelectValue;
  /** Text shown in the trigger when nothing is selected. Defaults to `copy.placeholder`. Not a substitute for the label. */
  placeholder?: string;
  /**
   * Pick any number. The trigger shows `copy.selectedCount` (or the labels when two or fewer);
   * the popup stays open while toggling and closes on Escape or outside click.
   */
  multiple?: boolean;
  /** Helper text under the label. */
  description?: string;
  /** Must have a value to submit. Shown in the label, not only by color. */
  required?: boolean;
  /** Not openable and not submitted. Stays visible and focusable. */
  disabled?: boolean;
  /** Marks the field invalid. Usually set by the Form. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /**
   * Use the platform's own picker instead of the popup Listbox: `auto` never uses a native
   * `<select>` on web (the styled popup); `always` forces a native `<select>` (forms that must
   * work without JS); `never` forces the popup. `auto` and `never` behave identically on web.
   */
  native?: SelectNative;
  /** Portal target for the popup's DOM node. Defaults to `document.body`. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SelectOverridableBinding, TokenRef>>;
  /** Fired when the value changes (array with `multiple`). */
  onChange?: (value: SelectValue) => void;
  /** Fired when the popup opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Select — Design Schema, category: input.
 *
 * When to use:
 * Use a Select for a form field with about seven to fifty options that people recognise on sight —
 * country, role, status, time zone from a short list, a category. Use `multiple` for tags or
 * memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms
 * that must work without JavaScript. Use Combobox instead when the list is long enough that typing
 * to filter is faster than scrolling, or when free text is allowed.
 */
export const Select = forwardRef<HTMLButtonElement | HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    name,
    options,
    value,
    defaultValue,
    placeholder,
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
    className,
    style,
    onClick: onClickProp,
    onKeyDown: onKeyDownProp,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-select${generatedId}`);
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const listboxId = `${id}-listbox`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const isNativeSelect = native === 'always';
  useImperativeHandle(ref, () => (isNativeSelect ? selectRef.current : triggerRef.current) as HTMLButtonElement | HTMLSelectElement, [
    isNativeSelect,
  ]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<SelectValue | undefined>(defaultValue ?? (multiple ? [] : undefined));
  const selected = isControlled ? value : internalValue;

  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

  const rows = flattenRows(options);
  const resolvedPlaceholder = placeholder ?? COPY.placeholder;
  const { text: triggerText, isPlaceholder } = displayText(selected, rows, multiple, resolvedPlaceholder);

  if (isDev && !label) {
    console.warn('Select: `label` is required and becomes the trigger’s accessible name.');
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
      focus: () => (isNativeSelect ? selectRef.current?.focus() : triggerRef.current?.focus()),
    });
  }, [form, name, id, isNativeSelect]);

  const commitValue = (next: SelectValue) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const openSelect = () => {
    if (open || isDisabled) return;
    changeOpen(true);
  };

  const closeSelect = (focusTrigger: boolean) => {
    if (!open) return;
    setActiveValue(null);
    if (focusTrigger) triggerRef.current?.focus();
    changeOpen(false);
  };

  // Position the popup and move focus onto the Listbox on open; reposition while scrolling or resizing.
  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return undefined;

    const reposition = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const result = computePosition(triggerRect, popupRect);
      setPopupStyle(result.style);
      setVertical(result.vertical);
    };
    reposition();
    listboxRef.current?.focus();

    if (prefersReducedMotion()) setEntered(true);
    else requestAnimationFrame(() => setEntered(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  // A pointer click or focus move outside, or the window losing focus, closes.
  useEffect(() => {
    if (!open) return undefined;
    const isOutside = (target: Node | null) =>
      !target || (!popupRef.current?.contains(target) && !triggerRef.current?.contains(target));
    const handlePointerDown = (event: PointerEvent) => {
      if (isOutside(event.target as Node)) closeSelect(false);
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (isOutside(event.relatedTarget as Node | null)) closeSelect(false);
    };
    const handleWindowBlur = () => closeSelect(false);
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

  const handleTriggerClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClickProp?.(event);
    if (isDisabled) return;
    if (open) closeSelect(false);
    else openSelect();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDownProp?.(event);
    if (!open && !isDisabled && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      openSelect();
    }
  };

  const handleListboxChange = (next: ListboxValue) => {
    commitValue(next as SelectValue);
    if (!multiple) closeSelect(true);
  };

  const handlePopupKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSelect(true);
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (!multiple && activeValue) commitValue(activeValue);
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      closeSelect(false);
      focusAdjacent(trigger, popup, event.shiftKey ? -1 : 1);
      return;
    }
    // Listbox only commits Enter for single-select; `multiple` toggles the active option here.
    if (event.key === 'Enter' && multiple && activeValue) {
      event.preventDefault();
      const current = toArray(selected);
      commitValue(current.includes(activeValue) ? current.filter((v) => v !== activeValue) : [...current, activeValue]);
    }
  };

  const resolved = overrides ? resolveOverrides(overrides) : undefined;
  const mergedStyle = resolved?.rootStyle || style ? { ...resolved?.rootStyle, ...style } : undefined;
  const mergedPopupStyle = { ...popupStyle, ...resolved?.popupStyle };

  const classes = [
    'ds-select',
    isInvalid ? 'ds-select--invalid' : null,
    isDisabled ? 'ds-select--disabled' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const labelNode = (
    <label htmlFor={id} id={labelId} className="ds-select__label" data-part="label">
      <Text
        element="span"
        weight="medium"
        overrides={Object.keys(resolved?.labelOverrides ?? {}).length ? resolved!.labelOverrides : undefined}
      >
        {label}
        {required ? <span className="ds-select__required">{COPY.requiredIndicator}</span> : null}
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

  if (isNativeSelect) {
    const handleNativeChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const next: SelectValue = multiple ? Array.from(event.target.selectedOptions).map((option) => option.value) : event.target.value;
      commitValue(next);
    };

    const handleNativeBlur = (event: ReactFocusEvent<HTMLSelectElement>) => {
      (onBlur as FocusEventHandler<HTMLSelectElement> | undefined)?.(event);
      if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
    };

    const renderNativeNode = (node: ListboxOption, path: string) => {
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

    return (
      <div data-ds="Select" data-part="root" className={classes} style={mergedStyle}>
        {labelNode}
        {descriptionNode}
        <span className="ds-select__native-wrap">
          <select
            {...(rest as unknown as ComponentPropsWithoutRef<'select'>)}
            ref={selectRef}
            id={id}
            name={name}
            multiple={multiple}
            value={value}
            defaultValue={defaultValue}
            required={required}
            disabled={isDisabled}
            className="ds-select__native"
            data-part="trigger"
            aria-describedby={describedBy || undefined}
            aria-invalid={isInvalid ? 'true' : undefined}
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
          <span className="ds-select__chevron" data-part="chevron" aria-hidden="true">
            <Icon name="chevron-down" inline />
          </span>
        </span>
        {errorNode}
      </div>
    );
  }

  const popupClasses = ['ds-select__popup', entered ? 'ds-select__popup--entered' : null].filter(Boolean).join(' ');

  return (
    <div data-ds="Select" data-part="root" className={classes} style={mergedStyle}>
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
        aria-labelledby={`${labelId} ${valueId}`}
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
        <span
          id={valueId}
          data-part="value"
          className={['ds-select__value', isPlaceholder ? 'ds-select__value--placeholder' : null].filter(Boolean).join(' ')}
        >
          {triggerText}
        </span>
        <span className="ds-select__chevron" data-part="chevron" aria-hidden="true">
          <Icon name="chevron-down" inline />
        </span>
      </button>
      {multiple
        ? toArray(selected).map((v) => <input key={v} type="hidden" name={name} value={v} disabled={isDisabled} />)
        : typeof selected === 'string' && selected !== ''
          ? <input type="hidden" name={name} value={selected} disabled={isDisabled} />
          : null}
      {errorNode}
      {open
        ? createPortal(
            <div
              ref={popupRef}
              data-part="popup"
              data-vertical={vertical}
              className={popupClasses}
              style={mergedPopupStyle}
              onKeyDown={handlePopupKeyDown}
            >
              <Listbox
                ref={listboxRef}
                id={listboxId}
                label={label}
                labelledBy={labelId}
                options={options}
                multiple={multiple}
                value={selected}
                selectionFollowsFocus={false}
                disabled={isDisabled}
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
