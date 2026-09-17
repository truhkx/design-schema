import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
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

type FieldsetOverrides = Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>>;
type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

/**
 * Bindings Fieldset's own CSS reads. legendSize, legendWeight, helperSize, fontFamily and lineHeight
 * reach the composed Texts only through their `overrides`; fieldsGap reaches the Stack only through its `overrides.gap`.
 */
const OVERRIDE_HOOK: Partial<Record<FieldsetOverridableBinding, string>> = {
  partGap: '--ds-fieldset-part-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
};

function overridesToStyle(overrides: FieldsetOverrides, disabled: boolean): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as FieldsetOverridableBinding[]) {
    // disabledOpacity is only in effect while disabled.
    if (binding === 'disabledOpacity' && !disabled) continue;
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

/** Drops undefined entries so a Text receives only the overrides that were passed. */
function defined(overrides: TextOverrides): TextOverrides | undefined {
  const entries = Object.entries(overrides).filter(([, ref]) => ref !== undefined);
  return entries.length > 0 ? (Object.fromEntries(entries) as TextOverrides) : undefined;
}

/** Direct children with fragments flattened, so `<>…</>` children count as direct. */
function directChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? directChildren(child.props.children) : [child],
  );
}

const NATIVE_FIELDS = new Set(['input', 'select', 'textarea', 'button', 'fieldset']);

type FieldElement = ReactElement<{ disabled?: boolean | undefined; required?: boolean | undefined }>;

/** A direct child that can take `disabled`: a component, or a native form control. */
function isField(child: ReactNode): child is FieldElement {
  return isValidElement(child) && (typeof child.type !== 'string' || NATIVE_FIELDS.has(child.type));
}

export interface FieldsetProps
  extends Omit<
    ComponentPropsWithoutRef<'fieldset'>,
    'disabled' | 'children' | 'className' | 'style' | 'aria-describedby' | 'aria-disabled' | 'aria-invalid'
  > {
  /** The group's name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible. */
  legend: string;
  /** The fields as direct children, usually Inputs, Checkboxes or Switches; Fieldset renders the Stack around them. */
  children: ReactNode;
  /** Persistent helper text under the legend. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  gap?: FieldsetGap | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline, or reaches the composed Text/Stack through its `overrides`. */
  overrides?: FieldsetOverrides | undefined;
}

/**
 * Fieldset — Design Schema, category: input.
 *
 * When to use:
 * Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a
 * card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the
 * group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather
 * than on one field.
 */
export function Fieldset({
  ref,
  legend,
  children,
  description,
  error,
  disabled = false,
  gap = 'normal',
  overrides,
  ...rest
}: FieldsetProps & { ref?: Ref<HTMLFieldSetElement> | undefined }): ReactElement {
  const baseId = useId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const direct = directChildren(children);
  const fields = direct.filter(isField);
  const allRequired = fields.length > 0 && fields.every((field) => field.props.required === true);

  // The native `disabled` attribute on <fieldset> would take fields out of the tab order, so the
  // group carries aria-disabled and each direct child field receives `disabled`.
  const renderedChildren = disabled ? direct.map((child) => (isField(child) ? cloneElement(child, { disabled: true }) : child)) : children;

  const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ');
  const classes = ['ds-fieldset', disabled ? 'ds-fieldset--disabled' : null].filter(Boolean).join(' ');

  const legendOverrides = defined({
    fontSize: overrides?.legendSize,
    fontWeight: overrides?.legendWeight,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  });
  const helperOverrides = defined({
    fontSize: overrides?.helperSize,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  });
  const fieldsGap = overrides?.fieldsGap;

  return (
    <fieldset
      {...rest}
      ref={ref}
      data-ds="Fieldset"
      data-part="group"
      className={classes}
      style={overrides ? overridesToStyle(overrides, disabled) : undefined}
      aria-describedby={describedBy || undefined}
      aria-disabled={disabled ? 'true' : undefined}
      aria-invalid={error ? 'true' : undefined}
    >
      <legend data-part="legend" className="ds-fieldset__legend">
        <Text element="span" tone="default" size="md" weight="medium" overrides={legendOverrides}>
          {legend}
          {allRequired ? COPY.requiredIndicator : null}
        </Text>
      </legend>
      {description ? (
        <div id={descriptionId} data-part="description" className="ds-fieldset__description">
          <Text element="span" tone="muted" size="sm" overrides={helperOverrides}>
            {description}
          </Text>
        </div>
      ) : null}
      <div data-part="fields" className="ds-fieldset__fields">
        <Stack gap={gap} overrides={fieldsGap ? { gap: fieldsGap } : undefined}>
          {renderedChildren}
        </Stack>
      </div>
      {error ? (
        <div id={errorId} role="alert" data-part="errorMessage" className="ds-fieldset__error">
          <Text element="span" tone="danger" size="sm" overrides={helperOverrides}>
            {error}
          </Text>
        </div>
      ) : null}
    </fieldset>
  );
}
