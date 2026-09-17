import * as React from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Stack } from './Stack';
import type { StackGap } from './Stack';
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
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string | undefined;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. */
  error?: string | undefined;
  /** Disables every field inside (through `FieldsetContext`). Fields keep their own `disabled` for finer control. */
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
 * with `gap`; `FieldsetContext` carries the legend and `disabled` to Input,
 * Checkbox, Switch and RadioGroup, which render disabled and prefix the legend into
 * their label. Children are never cloned; a non-field child gets no association.
 * `disabled` dims only the legend and description with `opacity.disabled` — the
 * fields dim themselves. The group error is announced as in Input
 * (`accessibilityLiveRegion` on Android, `announceForAccessibility` on iOS); native
 * has no invalid state, so the error text alone identifies it.
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

  // iOS: announce the group error the moment it appears.
  React.useEffect(() => {
    if (Platform.OS === 'ios' && error !== undefined && error !== '') {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);

  // The indicator is derived: shown when every direct child field is `required`.
  const fieldElements = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{
    required?: boolean | undefined;
  }>[];
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

  return (
    <View
      ref={ref}
      testID="Fieldset"
      role="group"
      accessibilityLabel={visibleLegend}
      accessibilityHint={hasDescription ? description : undefined}
      style={groupStyle}
    >
      <View testID="Fieldset.legend" style={dimStyle}>
        <Text tone="default" size="md" weight="medium" overrides={legendOverrides}>
          {visibleLegend}
        </Text>
      </View>
      {hasDescription ? (
        <View testID="Fieldset.description" style={dimStyle}>
          <Text tone="muted" size="sm" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View testID="Fieldset.fields">
        <FieldsetContext.Provider value={contextValue}>
          <Stack gap={gap} overrides={overrides?.fieldsGap ? { gap: overrides.fieldsGap } : undefined}>
            {children}
          </Stack>
        </FieldsetContext.Provider>
      </View>
      {hasError ? (
        <View accessibilityLiveRegion="assertive" testID="Fieldset.errorMessage">
          <Text tone="danger" size="sm" overrides={helperOverrides}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
