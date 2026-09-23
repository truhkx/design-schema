import * as React from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { useFormContext } from './FormContext';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';
import { Slider } from './Slider';
import { Stack } from './Stack';
import type { StackGap } from './Stack';
import { Switch } from './Switch';
import { Text } from './Text';
import { useTheme } from './theme';

export type FieldsetGap = Extract<StackGap, 'tight' | 'normal' | 'loose'>;

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type FieldsetOverridableBinding =
  | 'legendSize'
  | 'legendWeight'
  | 'helperSize'
  | 'partGap'
  | 'fieldsGap'
  | 'disabledOpacity'
  | 'fontFamily'
  | 'lineHeight';

/** What Fieldset shares with the fields inside it. Input, Checkbox, Switch and RadioGroup read this to prefix the legend into their own `accessibilityLabel` ("Shipping address, Street") and to render disabled with the group. */
export interface FieldsetContextValue {
  legend: string;
  disabled: boolean;
}

/** `null` outside of a Fieldset so every field works standalone. */
export const FieldsetContext: React.Context<FieldsetContextValue | null> = React.createContext<FieldsetContextValue | null>(null);

export function useFieldsetContext(): FieldsetContextValue | null {
  return React.useContext(FieldsetContext);
}

export interface FieldsetProps {
  /** The group's name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible. Also the group's `accessibilityLabel`. */
  legend: string;
  /** The fields as direct children, usually Inputs, Checkboxes or Switches. Fieldset renders the `Stack` around them. */
  children: React.ReactNode;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. An empty string counts as unset. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. An empty string counts as unset. */
  error?: string | undefined;
  /** Disables every field inside (through `FieldsetContext`). A field may disable itself in an enabled group, but cannot opt out of a disabled one. */
  disabled?: boolean | undefined;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  requiredIndicator: ' (required)',
} as const;

/**
 * `fieldsGap` reaches the Stack only as a token path through its own `overrides.gap`,
 * always sent (the override, else `layout.gap.{gap}`); the Stack gets no `gap` prop.
 */
const FIELDS_GAP_TOKEN = {
  tight: 'layout.gap.tight',
  normal: 'layout.gap.normal',
  loose: 'layout.gap.loose',
} as const satisfies Record<FieldsetGap, TokenRef>;

/**
 * The components that read `FieldsetContext` — a "field" for the required indicator is a
 * direct child of one of these types. Read at render time only: every one of them imports
 * `useFieldsetContext` from this module, so the references resolve once both have loaded.
 */
function isFieldType(type: unknown): boolean {
  return (
    type === Input ||
    type === NumberInput ||
    type === Checkbox ||
    type === Switch ||
    type === RadioGroup ||
    type === Select ||
    type === Slider ||
    type === DatePicker
  );
}

/**
 * The direct child fields, with fragments flattened so `<>{street}{city}</>` counts as
 * two children rather than one. A plain Text or decorative View beside the fields is not
 * a field and neither counts nor suppresses the indicator.
 */
function collectFields(
  children: React.ReactNode,
  out: React.ReactElement<{ required?: boolean | undefined }>[],
): void {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      collectFields((child.props as { children?: React.ReactNode }).children, out);
      return;
    }
    if (isFieldType(child.type)) out.push(child as React.ReactElement<{ required?: boolean | undefined }>);
  });
}

/**
 * Fieldset — how a form says "these belong together." A screen-reader user moving
 * into "Street" hears "Shipping address, Street" and knows where they are.
 *
 * When to use: Use a Fieldset whenever two or more fields share a name a user would
 * say aloud — an address, a card, a start and end date. Give it a `description` when
 * the group needs a rule, and put cross-field errors on the group rather than on one
 * field. Do not wrap a whole form in it (the Form's `label` names the form), use it
 * for a single field, or nest one inside a RadioGroup, which already is a fieldset.
 *
 * Renders a `View` that is NOT `accessible` (so children stay individually
 * reachable) with `role="group"`, `accessibilityLabel` (the legend, with
 * `copy.requiredIndicator` appended when every direct child field is `required`)
 * and `accessibilityHint={description}`. The legend is plain `Text` — not a header
 * trait, which would put it in the headings rotor. The fields render in a `Stack`
 * that is sized only through its own `overrides.gap` (the override, else
 * `layout.gap.{gap}`); `FieldsetContext` carries the legend and `disabled` to Input,
 * Checkbox, Switch and RadioGroup, which render disabled and prefix the legend into
 * their label. Children are never cloned; a non-field child gets no association.
 * `disabled` dims only the legend and description with `opacity.disabled` — the
 * fields dim themselves, and the group error is never dimmed. Those two dimmed
 * Views also carry `aria-disabled`, which is what reaches the DOM under
 * react-native-web (`accessibilityState` is dropped there) and what stops a
 * checker reading dimmed-because-inapplicable text as failing contrast. The group
 * error is announced as in Input (`accessibilityLiveRegion` on Android,
 * `announceForAccessibility` on iOS), once when it appears, and not at all inside a
 * Form with its own error summary; native has no invalid state, so the error text
 * alone identifies it.
 */
export function Fieldset({
  legend,
  children,
  description,
  error,
  disabled = false,
  gap = 'normal',
  overrides,
  ref,
}: FieldsetProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const hasError = error !== undefined && error !== '';
  const hasDescription = description !== undefined && description !== '';
  const form = useFormContext();
  const summarised = form !== null && form.errorSummary;
  const baseId = React.useId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  // iOS: announce the group error when it appears. Appearing is what announces — a change
  // from one error string to another re-renders the text in place without announcing
  // again, matching the Android live region that is already mounted. A Form with its own
  // error summary announces instead, so both are silenced there.
  const hadError = React.useRef(false);
  React.useEffect(() => {
    if (hasError && !hadError.current && Platform.OS === 'ios' && !summarised) {
      AccessibilityInfo.announceForAccessibility(error!);
    }
    hadError.current = hasError;
  }, [hasError, error, summarised]);

  // The indicator is derived: shown when every direct child field is `required`, so it is
  // not repeated on each field. A group with no fields shows none.
  const fieldElements: React.ReactElement<{ required?: boolean | undefined }>[] = [];
  collectFields(children, fieldElements);
  const allRequired = fieldElements.length > 0 && fieldElements.every((child) => child.props.required === true);
  const visibleLegend = allRequired ? `${legend}${COPY.requiredIndicator}` : legend;

  const contextValue = React.useMemo<FieldsetContextValue>(() => ({ legend, disabled }), [legend, disabled]);

  const groupStyle = React.useMemo<ViewStyle>(
    () => ({
      flexDirection: 'column',
      gap: overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapTight,
    }),
    [t, overrides?.partGap],
  );

  const dimStyle = React.useMemo<ViewStyle | undefined>(
    () =>
      disabled
        ? {
            opacity: overrides?.disabledOpacity
              ? (resolveToken(t, overrides.disabledOpacity) as number)
              : t.opacityDisabled,
          }
        : undefined,
    [t, disabled, overrides?.disabledOpacity],
  );

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const legendOverrides = { ...typographyOverrides, fontSize: overrides?.legendSize, fontWeight: overrides?.legendWeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  // react-native-web is the web: the description and error are linked from the group and
  // the group is invalid while an error is set. RN's View types carry neither attribute.
  const webGroupProps: Record<string, unknown> =
    Platform.OS === 'web'
      ? {
          'aria-invalid': hasError ? 'true' : undefined,
          'aria-describedby':
            [hasDescription ? descriptionId : undefined, hasError ? errorId : undefined]
              .filter((part) => part !== undefined)
              .join(' ') || undefined,
        }
      : {};

  return (
    <View
      ref={ref}
      testID="Fieldset"
      role="group"
      accessibilityLabel={visibleLegend}
      aria-label={visibleLegend}
      accessibilityHint={hasDescription ? description : undefined}
      style={groupStyle}
      {...webGroupProps}
    >
      {/*
        The two Views that carry `disabledOpacity` also carry `aria-disabled`, as Input's
        group View does: react-native-web renders the dimmed text into the DOM, where a
        checker measures it against the background and the dimmed legend falls under AA.
        The state is what says the text is dim because the group does not apply, rather
        than because it is low-contrast copy. Native is unaffected — neither View is
        `accessible`, so neither exposes a state, and the group root still asserts none.
      */}
      <View testID="Fieldset.legend" style={dimStyle} aria-disabled={disabled}>
        <Text tone="default" size="md" weight="medium" overrides={legendOverrides}>
          {visibleLegend}
        </Text>
      </View>
      {hasDescription ? (
        <View id={descriptionId} testID="Fieldset.description" style={dimStyle} aria-disabled={disabled}>
          <Text tone="muted" size="sm" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View testID="Fieldset.fields">
        <FieldsetContext.Provider value={contextValue}>
          <Stack overrides={{ gap: overrides?.fieldsGap ?? FIELDS_GAP_TOKEN[gap] }}>{children}</Stack>
        </FieldsetContext.Provider>
      </View>
      {hasError ? (
        <View id={errorId} accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="Fieldset.errorMessage">
          <Text tone="danger" size="sm" overrides={helperOverrides}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
