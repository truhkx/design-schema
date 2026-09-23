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
import { Button } from './Button';
import './Fieldset.css';

export type FieldsetGap = 'tight' | 'normal' | 'loose';

/** copy.* — used verbatim. */
const COPY = {
  requiredIndicator: ' (required)',
};

/** fieldsGap → layout.gap.{gap}, resolved per enum value and sent to the Stack as a token path. */
const FIELDS_GAP_TOKEN: Record<FieldsetGap, TokenRef> = {
  tight: 'layout.gap.tight',
  normal: 'layout.gap.normal',
  loose: 'layout.gap.loose',
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
type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef>>;

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

/** Default tokens of the bindings forwarded to the composed Texts; always sent, the override winning. */
const TEXT_DEFAULTS = {
  legendSize: 'font.size.md',
  legendWeight: 'font.weight.medium',
  helperSize: 'font.size.sm',
  fontFamily: 'font.family.body', // literal-ok: a TokenRef path sent to Text overrides, not a font stack
  lineHeight: 'font.lineHeight.normal',
} as const satisfies Partial<Record<FieldsetOverridableBinding, TokenRef>>;

/** Direct children with fragments flattened, so `<>…</>` children count as direct. */
function directChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment ? directChildren(child.props.children) : [child],
  );
}

const NATIVE_FIELDS = new Set(['input', 'select', 'textarea', 'button', 'fieldset']);
/** Native inputs whose type carries no value (actions), excluded from the required indicator. */
const ACTION_INPUT_TYPES = new Set(['button', 'submit', 'reset', 'image']);

type FieldElement = ReactElement<{ disabled?: boolean | undefined; required?: boolean | undefined; type?: unknown }>;

/** A direct child that can take `disabled`: a component, or a native form control. */
function isField(child: ReactNode): child is FieldElement {
  return isValidElement(child) && (typeof child.type !== 'string' || NATIVE_FIELDS.has(child.type));
}

/**
 * The narrower set the required indicator counts: value-bearing fields only. A native button, an
 * action-type input or a nested fieldset is not counted, nor are the package's non-field components
 * (Button, Text, Fieldset), so required Inputs beside a submit Button still show the indicator.
 */
function isValueField(child: FieldElement): boolean {
  const { type } = child;
  if (typeof type === 'string') {
    if (type === 'input') return !ACTION_INPUT_TYPES.has(String(child.props.type ?? 'text'));
    return type === 'select' || type === 'textarea';
  }
  return type !== Button && type !== Text && type !== Fieldset;
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
  /** Persistent helper text under the legend. An empty string counts as unset (no part rendered, no link). */
  description?: string | undefined;
  /**
   * A group-level error (cross-field validation such as "End date must be after start date"). Field-level
   * errors stay on the fields. An empty string counts as unset (no part, no aria-invalid, no announcement).
   */
  error?: string | undefined;
  /**
   * Disables every field inside. The group wins in one direction only: a field may disable itself while
   * the group is enabled, but it cannot opt out of a disabled group — `disabled={false}` on a child of a
   * disabled Fieldset is overridden, and clearing the group never enables a field that was disabled on its own.
   */
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
  const valueFields = direct.filter(isField).filter(isValueField);
  const allRequired = valueFields.length > 0 && valueFields.every((field) => field.props.required === true);

  // The native `disabled` attribute on <fieldset> would take fields out of the tab order, so the
  // group carries aria-disabled and each direct child field receives `disabled`. The group wins in
  // one direction only: a disabled group overrides `disabled={false}`, an enabled one leaves fields
  // as they are. Fragments are flattened on both paths, so the Stack receives the same children.
  const renderedChildren = disabled ? direct.map((child) => (isField(child) ? cloneElement(child, { disabled: true }) : child)) : direct;

  const describedBy = [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ');
  const classes = ['ds-fieldset', disabled ? 'ds-fieldset--disabled' : null].filter(Boolean).join(' ');

  // Forwarded bindings are always sent: the override, else the binding's default token.
  const fontFamily: TokenRef = overrides?.fontFamily ?? TEXT_DEFAULTS.fontFamily;
  const lineHeight: TokenRef = overrides?.lineHeight ?? TEXT_DEFAULTS.lineHeight;
  const legendOverrides: TextOverrides = {
    fontSize: overrides?.legendSize ?? TEXT_DEFAULTS.legendSize,
    fontWeight: overrides?.legendWeight ?? TEXT_DEFAULTS.legendWeight,
    fontFamily,
    lineHeight,
  };
  const helperOverrides: TextOverrides = {
    fontSize: overrides?.helperSize ?? TEXT_DEFAULTS.helperSize,
    fontFamily,
    lineHeight,
  };
  // The dimmed parts report the disabled state on themselves, since the dim is only permissible on an inactive control.
  const dimmed = disabled ? 'true' : undefined;
  // fieldsGap reaches the Stack only through its own `overrides.gap`, and is always sent: the
  // override when there is one, else the token layout.gap.{gap}. The Stack gets no `gap` prop.
  const fieldsGap: TokenRef = overrides?.fieldsGap ?? FIELDS_GAP_TOKEN[gap];

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
      <legend data-part="legend" className="ds-fieldset__legend" aria-disabled={dimmed}>
        <Text element="span" tone="default" size="md" weight="medium" overrides={legendOverrides}>
          {allRequired ? `${legend}${COPY.requiredIndicator}` : legend}
        </Text>
      </legend>
      {description ? (
        <div id={descriptionId} data-part="description" className="ds-fieldset__description" aria-disabled={dimmed}>
          <Text element="span" tone="muted" size="sm" overrides={helperOverrides}>
            {description}
          </Text>
        </div>
      ) : null}
      <div data-part="fields" className="ds-fieldset__fields">
        <Stack overrides={{ gap: fieldsGap }}>{renderedChildren}</Stack>
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
