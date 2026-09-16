import {
  Children,
  cloneElement,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type Context,
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

/** Bindings Fieldset's own CSS reads; the rest are forwarded to the composed Text and Stack. */
const OVERRIDE_HOOK: Partial<Record<FieldsetOverridableBinding, string>> = {
  helperSize: '--ds-fieldset-helper-size',
  partGap: '--ds-fieldset-part-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
  fontFamily: '--ds-fieldset-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-fieldset-line-height',
};

function overridesToStyle(overrides: FieldsetOverrides): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as FieldsetOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

/** What a field inside a Fieldset reads: the group's `disabled` and its legend. */
export interface FieldsetContextValue {
  disabled: boolean;
  legend: string;
}

/** Provided by Fieldset; Input, Checkbox, Switch and RadioGroup read it to render disabled. */
export const FieldsetContext: Context<FieldsetContextValue | null> = createContext<FieldsetContextValue | null>(null);

/** The enclosing Fieldset's context, or `null` outside one. */
export function useFieldsetContext(): FieldsetContextValue | null {
  return useContext(FieldsetContext);
}

/** Direct children with fragments flattened, so `<>…</>` children count as direct. */
function directChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? directChildren(child.props.children) : [child],
  );
}

export interface FieldsetProps
  extends Omit<
    ComponentPropsWithoutRef<'fieldset'>,
    'disabled' | 'children' | 'className' | 'style' | 'aria-describedby' | 'aria-disabled' | 'aria-invalid'
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
   * linked with aria-describedby; while set, the group carries aria-invalid="true". */
  error?: string | undefined;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  gap?: FieldsetGap | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: FieldsetOverrides | undefined;
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
export const Fieldset = function Fieldset({
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

  const fields = directChildren(children);
  const fieldElements = fields.filter((child) => isValidElement<{ required?: boolean | undefined }>(child));
  const allRequired = fieldElements.length > 0 && fieldElements.every((field) => field.props.required === true);

  // Until every field reads FieldsetContext, direct children also receive `disabled`; a non-field ignores it.
  const renderedChildren = disabled
    ? fields.map((child) => (isValidElement(child) ? cloneElement(child as ReactElement<{ disabled?: boolean }>, { disabled: true }) : child))
    : children;

  const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ');

  const classes = ['ds-fieldset', disabled ? 'ds-fieldset--disabled' : null].filter(Boolean).join(' ');

  const shared: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };
  const legendOverrides = { ...shared, fontSize: overrides?.legendSize, fontWeight: overrides?.legendWeight };
  const helperOverrides = { ...shared, fontSize: overrides?.helperSize };
  const fieldsGap = overrides?.fieldsGap;

  return (
    <FieldsetContext.Provider value={{ disabled, legend }}>
      <fieldset
        {...rest}
        ref={ref}
        data-ds="Fieldset"
        data-part="group"
        className={classes}
        style={overrides ? overridesToStyle(overrides) : undefined}
        aria-describedby={describedBy || undefined}
        aria-disabled={disabled ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
      >
        <legend data-part="legend" className="ds-fieldset__legend">
          <Text element="span" size="md" weight="medium" overrides={legendOverrides}>
            {legend}
            {allRequired ? COPY.requiredIndicator : null}
          </Text>
        </legend>
        {description ? (
          <Text element="p" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        ) : null}
        <Stack gap={gap} overrides={fieldsGap ? { gap: fieldsGap } : undefined}>
          {renderedChildren}
        </Stack>
        {error ? (
          <p id={errorId} role="alert" data-part="errorMessage" className="ds-fieldset__error">
            {error}
          </p>
        ) : null}
      </fieldset>
    </FieldsetContext.Provider>
  );
};
