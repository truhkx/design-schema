import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Switch.css';

export type SwitchLabelPosition = 'start' | 'end';

export interface SwitchProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'role'
    | 'name'
    | 'value'
    | 'checked'
    | 'defaultChecked'
    | 'disabled'
    | 'onChange'
    | 'aria-describedby'
    | 'aria-checked'
    | 'children'
  > {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /** Optional field name. When inside a Form the checked state is collected as a boolean; most switches are not in forms. */
  name?: string;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean;
  /** Cannot be toggled. Stays visible, readable and focusable. */
  disabled?: boolean;
  /** Persistent helper text below the label explaining the effect. */
  description?: string;
  /** Where the label sits relative to the track. `start` is the settings-list convention; `end` matches Checkbox. */
  labelPosition?: SwitchLabelPosition;
  /** Fired when the state changes, with the new boolean. The change is already in effect; there is nothing to submit. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Switch — Design Schema, category: input.
 *
 * When to use:
 * Use a Switch for a binary setting that applies as soon as it changes and can be undone by
 * flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists
 * and preference panels, with `labelPosition: start` so the labels line up and the switches sit
 * at the row end.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    name,
    checked,
    defaultChecked = false,
    disabled = false,
    description,
    labelPosition = 'start',
    onChange,
    onClick,
    id: idProp,
    className,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-switch${generatedId}`);
  const descriptionId = `${id}-description`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const isControlled = checked !== undefined;
  // aria-checked is set explicitly, so the uncontrolled state is mirrored here.
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const isDisabled = disabled || (form?.disabled ?? false);

  const latest = useRef({ label, disabled: isDisabled });
  latest.current = { label, disabled: isDisabled };

  // A Switch has no error state; it only contributes its boolean when it has a name.
  useEffect(() => {
    if (!form || !name) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => inputRef.current?.checked ?? false,
      isDisabled: () => latest.current.disabled,
      validate: () => null,
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isDisabled) {
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
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event.target.checked, event);
  };

  // The whole row toggles: the description is part of the target.
  const handleDescriptionClick = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const classes = [
    'ds-switch',
    `ds-switch--label-${labelPosition}`,
    isDisabled ? 'ds-switch--disabled' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="ds-switch__text">
        <label htmlFor={id} className="ds-switch__label">
          {label}
        </label>
        {description ? (
          <Text
            element="p"
            id={descriptionId}
            size="sm"
            tone="muted"
            className="ds-switch__description"
            onClick={handleDescriptionClick}
          >
            {description}
          </Text>
        ) : null}
      </div>
      <input
        {...rest}
        ref={inputRef}
        id={id}
        type="checkbox"
        role="switch"
        name={name}
        checked={checked}
        defaultChecked={isControlled ? undefined : defaultChecked}
        className="ds-switch__control"
        aria-checked={isChecked ? 'true' : 'false'}
        aria-describedby={description ? descriptionId : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        onClick={handleClick}
        onChange={handleChange}
      />
    </div>
  );
});
