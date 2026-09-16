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
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './Switch.css';

/** Where the label sits relative to the track. */
export type SwitchLabelPosition = 'start' | 'end';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type SwitchOverridableBinding =
  | 'trackWidth'
  | 'trackHeight'
  | 'thumbSize'
  | 'thumbInset'
  | 'radius'
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const OVERRIDE_HOOK: Record<SwitchOverridableBinding, string> = {
  trackWidth: '--ds-switch-track-width',
  trackHeight: '--ds-switch-track-height',
  thumbSize: '--ds-switch-thumb-size',
  thumbInset: '--ds-switch-thumb-inset',
  radius: '--ds-switch-radius',
  gap: '--ds-switch-gap',
  partGap: '--ds-switch-part-gap',
  labelSize: '--ds-switch-label-size',
  labelWeight: '--ds-switch-label-weight',
  helperSize: '--ds-switch-helper-size',
  fontFamily: '--ds-switch-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-switch-line-height',
  disabledOpacity: '--ds-switch-disabled-opacity',
  transition: '--ds-switch-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  helperOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  for (const binding of Object.keys(overrides) as SwitchOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    // The description is Text: its typography bindings reach Text's own overrides.
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'lineHeight') helperOverrides.lineHeight = ref;
    // Locked bindings have no entry in the hook table, so they are ignored if passed.
    const hook = OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
  }
  return { rootStyle: rootStyle as CSSProperties, helperOverrides };
}

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
    | 'aria-disabled'
    | 'className'
    | 'style'
    | 'children'
  > {
  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  label: string;
  /**
   * Optional field name. When inside a Form the state is collected as a boolean on every platform;
   * most switches are not in forms. A Switch never validates and never appears in an error summary.
   */
  name?: string | undefined;
  /** Controlled state. Omit for an uncontrolled control. */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /** Cannot be toggled. Stays visible, readable and focusable. */
  disabled?: boolean | undefined;
  /** Persistent helper text below the label explaining the effect. */
  description?: string | undefined;
  /**
   * Where the label sits relative to the track. `start` (label, then switch at the row end) is the
   * settings-list convention; `end` matches Checkbox.
   */
  labelPosition?: SwitchLabelPosition | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the state changes, with the new boolean. The change is already in effect; there is nothing to submit. */
  onChange?: ((checked: boolean) => void) | undefined;
}

/**
 * Switch — Design Schema, category: input.
 *
 * When to use:
 * Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.
 */
export const Switch = function Switch({
  ref,
  label,
  name,
  checked,
  defaultChecked = false,
  disabled = false,
  description,
  labelPosition = 'start',
  overrides,
  onChange,
  onClick,
  id: idProp,
  ...rest
}: SwitchProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase && name ? `${form.idBase}-${name}` : `ds-switch${generatedId}`);
  const descriptionId = `${id}-description`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // aria-checked is written explicitly, so the uncontrolled state is mirrored here. The input itself
  // stays natively uncontrolled: a component-controlled `checked` fights the canceled click on disabled.
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const isDisabled = disabled || (form?.disabled ?? false);

  const latest = useRef({ label, disabled: isDisabled });
  latest.current = { label, disabled: isDisabled };

  // A Switch has no error state: it contributes its boolean under `name` and never validates.
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
    const next = event.target.checked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  // The whole row is the target: the description and the row's own gap forward to the control.
  const forwardClick = () => {
    if (!isDisabled) inputRef.current?.click();
  };
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) forwardClick();
  };

  const classes = ['ds-switch', `ds-switch--label-${labelPosition}`, isDisabled ? 'ds-switch--disabled' : null]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    <div className={classes} data-ds="Switch" data-ds-field style={rootStyle} onClick={handleRowClick}>
      <div className="ds-switch__text">
        <label htmlFor={id} className="ds-switch__label" data-part="label">
          {label}
        </label>
        {description ? (
          <Text
            element="p"
            id={descriptionId}
            data-part="description"
            size="sm"
            tone="muted"
            className="ds-switch__description"
            overrides={helperOverrides}
            onClick={forwardClick}
          >
            {description}
          </Text>
        ) : null}
      </div>
      {/* track: the input itself; thumb is its ::before, so it has no data-part hook. */}
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
        data-part="track"
        aria-checked={isChecked ? 'true' : 'false'}
        aria-describedby={description ? descriptionId : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        onClick={handleClick}
        onChange={handleChange}
      />
    </div>
  );
};
