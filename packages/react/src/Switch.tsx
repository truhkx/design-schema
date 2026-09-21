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

/**
 * helperSize has no hook: like every binding that is only forwarded to a composed child, it reaches
 * the description Text through its `fontSize` override alone. fontFamily and lineHeight are both a
 * hook (the label's own rule) and a forward.
 */
const OVERRIDE_HOOK: Partial<Record<SwitchOverridableBinding, string>> = {
  trackWidth: '--ds-switch-track-width',
  trackHeight: '--ds-switch-track-height',
  thumbSize: '--ds-switch-thumb-size',
  thumbInset: '--ds-switch-thumb-inset',
  radius: '--ds-switch-radius',
  gap: '--ds-switch-gap',
  partGap: '--ds-switch-part-gap',
  labelSize: '--ds-switch-label-size',
  labelWeight: '--ds-switch-label-weight',
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
    // The description is Text: helperSize, fontFamily and lineHeight reach Text's own overrides.
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'lineHeight') helperOverrides.lineHeight = ref;
    // Locked bindings (and helperSize) have no entry in the hook table, so no hook is written.
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
   * most switches are not in forms. Without `name` a Switch inside a Form does not register (it
   * contributes no key) and its id comes from `useId()`, not the Form's idBase. A Switch never
   * validates and never appears in an error summary.
   */
  name?: string | undefined;
  /**
   * Controlled state: a controlled switch shows a new state only once this prop changes. Omit for an
   * uncontrolled control.
   */
  checked?: boolean | undefined;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean | undefined;
  /**
   * Cannot be toggled. Stays visible, readable and focusable. A disabled switch contributes no key
   * to the Form's values: it unregisters while disabled and registers again when re-enabled.
   */
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
  /**
   * Fired when the user changes the state, with the new boolean. The change is already in effect;
   * there is nothing to submit. A controlled prop change fires nothing, and nothing fires on mount.
   */
  onChange?: ((checked: boolean) => void) | undefined;
}

/**
 * Switch — Design Schema, category: input.
 *
 * When to use:
 * Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.
 */
export function Switch({
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
  const labelRef = useRef<HTMLLabelElement | null>(null);
  // The root is the row; the forwarded ref resolves to the interactive <input>, as in Checkbox.
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // The input stays natively uncontrolled (no React-held `checked` on the element, so a prevented
  // click on a disabled switch cannot leave the DOM out of step); the component holds the state and
  // mirrors it as aria-checked and, when it differs, onto the DOM property.
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : uncontrolledChecked;
  const isDisabled = disabled || (form?.disabled ?? false);

  useEffect(() => {
    const el = inputRef.current;
    if (el && el.checked !== isChecked) el.checked = isChecked;
  }, [isChecked]);

  const latest = useRef({ label, disabled: isDisabled, checked: isChecked });
  latest.current = { label, disabled: isDisabled, checked: isChecked };

  // A Switch contributes its boolean under `name` and never validates — it has no error state. A
  // nameless switch never registers, and a disabled one unregisters until it is enabled again, so
  // neither contributes a key to the Form's values.
  useEffect(() => {
    if (!form || !name || isDisabled) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => latest.current.checked,
      isDisabled: () => latest.current.disabled,
      validate: () => null,
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id, isDisabled]);

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
    // Every native toggle flips the value, so there is no next-equals-checked case to guard here.
    const next = event.target.checked;
    if (isControlled) {
      // Controlled: report the change, then write the prop back, so the track follows the prop.
      event.target.checked = isChecked;
    } else {
      setUncontrolledChecked(next);
    }
    onChange?.(next);
  };

  // The whole row is the target: the gap, the text column and the description forward to the
  // control. The input and the label already toggle natively, so they are left alone.
  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Node;
    if (inputRef.current?.contains(target) || labelRef.current?.contains(target)) return;
    if (!isDisabled) inputRef.current?.click();
  };

  const classes = ['ds-switch', `ds-switch--label-${labelPosition}`, isDisabled ? 'ds-switch--disabled' : null]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    <div className={classes} data-ds="Switch" data-ds-field style={rootStyle} onClick={handleRowClick}>
      {/* The row centres this content box in minTarget; inside it the track stays on the first line. */}
      <div className="ds-switch__row">
        <div className="ds-switch__text">
          <label ref={labelRef} htmlFor={id} className="ds-switch__label" data-part="label">
            {label}
          </label>
          {description ? (
            <Text element="p" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={helperOverrides}>
              {description}
            </Text>
          ) : null}
        </div>
        {/* The slot is one label line tall, so the track centres on the label's first line. */}
        <span className="ds-switch__slot">
          {/* The track wrapper stacks the thumb over the input, as Checkbox's box does. */}
          <span className="ds-switch__track-wrap">
            {/* track: the input itself, drawn with appearance: none. */}
            <input
              {...rest}
              ref={inputRef}
              id={id}
              type="checkbox"
              role="switch"
              name={name}
              defaultChecked={isChecked}
              className="ds-switch__control"
              data-part="track"
              aria-checked={isChecked ? 'true' : 'false'}
              aria-describedby={description ? descriptionId : undefined}
              aria-disabled={isDisabled ? 'true' : undefined}
              onClick={handleClick}
              onChange={handleChange}
            />
            {/* thumb: a Switch-owned span stacked over the input, not a ::before — Firefox draws no
                pseudo-element on an appearance: none input. Decorative and click-through; the input
                carries the state, and the thumb keys off its aria-checked. */}
            <span className="ds-switch__thumb" data-part="thumb" aria-hidden="true" />
          </span>
        </span>
      </div>
    </div>
  );
}
