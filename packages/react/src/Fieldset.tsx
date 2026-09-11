import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text } from './Text';
import { Stack } from './Stack';
import './Fieldset.css';

export type FieldsetGap = 'tight' | 'normal' | 'loose';

/** copy.* — used verbatim. */
const COPY = {
  requiredIndicator: ' (required)',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type FieldsetOverridableBinding =
  | 'legendSize'
  | 'legendWeight'
  | 'helperSize'
  | 'partGap'
  | 'fieldsGap'
  | 'disabledOpacity'
  | 'fontFamily'
  | 'lineHeight';

const OVERRIDE_HOOK: Record<FieldsetOverridableBinding, string> = {
  legendSize: '--ds-fieldset-legend-size',
  legendWeight: '--ds-fieldset-legend-weight',
  helperSize: '--ds-fieldset-helper-size',
  partGap: '--ds-fieldset-part-gap',
  fieldsGap: '--ds-fieldset-fields-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
  fontFamily: '--ds-fieldset-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-fieldset-line-height',
};

function overridesToStyle(overrides: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as FieldsetOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface FieldsetProps
  extends Omit<
    ComponentPropsWithoutRef<'fieldset'>,
    'disabled' | 'children' | 'aria-describedby' | 'aria-disabled' | 'aria-invalid'
  > {
  /** The group's name — what the fields together describe ("Shipping address", "Notification
   * preferences"). Always visible. The accessible name of the group; screen readers read it
   * before each field inside. */
  legend: string;
  /** The fields, usually a Stack of Inputs, Checkboxes or Switches. */
  children: ReactNode;
  /** Persistent helper text under the legend. Linked with aria-describedby on the group. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date").
   * Field-level errors stay on the fields. Rendered once under the group with role=alert and
   * linked with aria-describedby. */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Fieldset — Design Schema, category: input.
 *
 * When to use:
 * Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a
 * card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when
 * the group needs a rule ("We only ship within the EU") and put cross-field errors on the group
 * rather than on one field.
 */
export const Fieldset = function Fieldset({ ref, legend, children, description, error, disabled = false, gap = 'normal', overrides, id: idProp, className, style, ...rest }: FieldsetProps & { ref?: Ref<HTMLFieldSetElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `ds-fieldset${generatedId}`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const fieldElements = Children.toArray(children).filter(isValidElement) as ReactElement<{ required?: boolean | undefined }>[];
  const allRequired = fieldElements.length > 0 && fieldElements.every((field) => field.props.required === true);

  // Group `disabled` overrides every field; a field's own `disabled` only matters while the group is not disabled.
  const renderedChildren = disabled
    ? Children.map(children, (child) => (isValidElement(child) ? cloneElement(child, { disabled: true } as { disabled: boolean }) : child))
    : children;

  const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ');

  const classes = ['ds-fieldset', `ds-fieldset--gap-${gap}`, disabled ? 'ds-fieldset--disabled' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <fieldset
      {...rest}
      ref={ref}
      id={id}
      data-ds="Fieldset"
      className={classes}
      style={mergedStyle}
      aria-describedby={describedBy || undefined}
      aria-disabled={disabled ? 'true' : undefined}
      aria-invalid={error ? 'true' : undefined}
    >
      <legend className="ds-fieldset__legend">
        {legend}
        {allRequired ? (
          <Text element="span" size="sm" tone="muted" weight="regular" className="ds-fieldset__required">
            {COPY.requiredIndicator}
          </Text>
        ) : null}
      </legend>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-fieldset__description"
        >
          {description}
        </Text>
      ) : null}
      <Stack gap={gap} data-part="fields">
        {renderedChildren}
      </Stack>
      {error ? (
        <Text element="p" id={errorId} role="alert" data-part="errorMessage" size="sm" tone="danger" className="ds-fieldset__error">
          {error}
        </Text>
      ) : null}
    </fieldset>
  );
};
