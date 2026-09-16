import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './Checkbox.css';

/**
 * copy.* — used verbatim; `{label}` is replaced by the visible label. `checked`, `unchecked` and
 * `mixed` are spoken state values for platforms without a native checkbox; on web the input's
 * checked state and `aria-checked="mixed"` carry them.
 */
const COPY = {
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
  checked: 'Checked',
  unchecked: 'Unchecked',
  mixed: 'Mixed',
} as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CheckboxOverridableBinding =
  | 'controlBackground'
  | 'controlBorderWidth'
  | 'pressedOverlay'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const OVERRIDE_HOOK: Record<CheckboxOverridableBinding, string> = {
  controlBackground: '--ds-checkbox-control-background',
  controlBorderWidth: '--ds-checkbox-control-border-width',
  pressedOverlay: '--ds-checkbox-pressed-overlay',
  controlBorderInvalid: '--ds-checkbox-control-border-invalid',
  controlSize: '--ds-checkbox-control-size',
  controlRadius: '--ds-checkbox-control-radius',
  gap: '--ds-checkbox-gap',
  partGap: '--ds-checkbox-part-gap',
  labelSize: '--ds-checkbox-label-size',
  labelWeight: '--ds-checkbox-label-weight',
  helperSize: '--ds-checkbox-helper-size',
  fontFamily: '--ds-checkbox-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-checkbox-line-height',
  disabledOpacity: '--ds-checkbox-disabled-opacity',
  transition: '--ds-checkbox-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  helperOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  for (const binding of Object.keys(overrides) as CheckboxOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    // Description and error are Text: their typography bindings reach Text's own overrides.
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'lineHeight') helperOverrides.lineHeight = ref;
    // Locked bindings have no entry in the hook table, so they are ignored if passed.
    const hook = OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
  }
  return { rootStyle: rootStyle as CSSProperties, helperOverrides };
}

export interface CheckboxProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'checked'
    | 'defaultChecked'
    | 'required'
    | 'disabled'
    | 'onChange'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-checked'
    | 'aria-disabled'
    | 'className'
    | 'style'
    | 'children'
  > {
  /** Visible label. Clicking or tapping it toggles the control. */
  label: string;
  /** Visually hide the label (it remains the accessible name): a selection column in a Table, where the row name is the label. */
  hideLabel?: boolean | undefined;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select. */
  value?: string | undefined;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /**
   * Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and
   * announced only; the submitted value still follows `checked`.
   */
  indeterminate?: boolean | undefined;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** Persistent helper text below the label. */
  description?: string | undefined;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: ((checked: boolean) => void) | undefined;
}

/**
 * Checkbox — Design Schema, category: input.
 *
 * When to use:
 * Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several with the same `name` when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.
 */
export const Checkbox = function Checkbox({
  ref,
  label,
  hideLabel = false,
  name,
  value = 'on',
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  required = false,
  invalid = false,
  description,
  error,
  overrides,
  onChange,
  onClick,
  id: idProp,
  ...rest
}: CheckboxProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-checkbox${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const isControlled = checked !== undefined;
  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

  // A user toggle clears the mixed state; a new `indeterminate` prop value restores it.
  const [mixedCleared, setMixedCleared] = useState(false);
  const [lastIndeterminate, setLastIndeterminate] = useState(indeterminate);
  if (lastIndeterminate !== indeterminate) {
    setLastIndeterminate(indeterminate);
    setMixedCleared(false);
  }
  const isMixed = indeterminate && !mixedCleared;

  // `indeterminate` has no attribute; it is a DOM property, mirrored as aria-checked="mixed".
  useEffect(() => {
    const el = inputRef.current;
    if (el && el.indeterminate !== isMixed) el.indeterminate = isMixed;
  }, [isMixed]);

  // Keep the latest props in a ref so the Form registration does not churn on every render.
  const latest = useRef({ label, required, disabled: isDisabled, invalid, error });
  latest.current = { label, required, disabled: isDisabled, invalid, error };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      // form.valueType is boolean: the checked state is collected under `name`.
      getValue: () => inputRef.current?.checked ?? false,
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && !inputRef.current?.checked) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isDisabled) {
      // aria-disabled does not stop native toggling, so we do. The input stays focusable.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    if (indeterminate) setMixedCleared(true);
    onChange?.(event.target.checked);
    // There is no useful blur moment for a checkbox: `blur` mode validates on change too.
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  // The whole row is the hit area: the description and the row's own gap forward to the control.
  const forwardClick = () => {
    if (!isDisabled) inputRef.current?.click();
  };
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) forwardClick();
  };

  const classes = ['ds-checkbox', isInvalid ? 'ds-checkbox--invalid' : null, isDisabled ? 'ds-checkbox--disabled' : null]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-checkbox__label', hideLabel ? 'ds-checkbox__visually-hidden' : null].filter(Boolean).join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    <div className={classes} data-ds="Checkbox" data-ds-field style={rootStyle}>
      <div className="ds-checkbox__row" onClick={handleRowClick}>
        <span className="ds-checkbox__box">
          <input
            {...rest}
            ref={inputRef}
            id={id}
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            defaultChecked={isControlled ? undefined : defaultChecked}
            className="ds-checkbox__control"
            data-part="control"
            aria-describedby={describedBy || undefined}
            aria-invalid={isInvalid ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-checked={isMixed ? 'mixed' : undefined}
            aria-disabled={isDisabled ? 'true' : undefined}
            onClick={handleClick}
            onChange={handleChange}
          />
          {/* indicator: decorative, drawn over the control; the input's state is what is announced. */}
          <span className="ds-checkbox__indicator">
            <Icon name={isMixed ? 'dash' : 'check'} size="xs" />
          </span>
        </span>
        <label htmlFor={id} className={labelClasses} data-part="label">
          {label}
          {required ? COPY.requiredIndicator : null}
        </label>
      </div>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-checkbox__description"
          overrides={helperOverrides}
          onClick={forwardClick}
        >
          {description}
        </Text>
      ) : null}
      {resolvedError ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          className="ds-checkbox__error"
          overrides={helperOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
};
