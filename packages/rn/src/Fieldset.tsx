import * as React from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import type { ViewStyle } from 'react-native';
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

/** What Fieldset shares with the fields inside it. Input, Checkbox, Switch and RadioGroup read this to prefix the legend into their own `accessibilityLabel` ("Shipping address, Street") and to fold in the group's `disabled`. */
export interface FieldsetContextValue {
  legend: string;
  disabled: boolean;
}

/** `null` outside of a Fieldset so every field works standalone. */
export const FieldsetContext = React.createContext<FieldsetContextValue | null>(null);

export function useFieldsetContext(): FieldsetContextValue | null {
  return React.useContext(FieldsetContext);
}

export interface FieldsetProps {
  /** The group's name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible. Also the group's `accessibilityLabel`. */
  legend: string;
  /** The fields, usually Inputs, Checkboxes or Switches. Laid out in a `Stack` with `gap`. */
  children: React.ReactNode;
  /** Persistent helper text under the legend. Also the group's `accessibilityHint`. */
  description?: string;
  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. */
  error?: string;
  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  disabled?: boolean;
  /** Gap between the fields, from the layout rhythm. */
  gap?: FieldsetGap;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef>>;
}

const COPY = {
  requiredIndicator: ' (required)',
} as const;

/**
 * Fieldset — how a form says "these belong together." A screen-reader user tabbing
 * into "Street" hears "Shipping address, Street" and knows where they are.
 *
 * When to use: Use a Fieldset whenever two or more fields share a name a user would
 * say aloud — an address, a card, a start and end date. Give it a `description` when
 * the group needs a rule, and put cross-field errors on the group rather than on one
 * field. Do not wrap a whole form in it (the Form's `label` names the form), use it
 * for a single field, or nest one inside a RadioGroup, which already is a fieldset.
 *
 * Renders a `View` that is NOT `accessible` (so children stay individually
 * reachable) with `role="group"` (RN ≥ 0.74), `accessibilityLabel` (the legend,
 * `copy.requiredIndicator` appended when every direct field is `required`) and
 * `accessibilityHint={description}`. The legend is plain `Text` — not a header
 * trait, which would put it in the headings rotor. The fields render in a `Stack`
 * with `gap`; a `FieldsetContext` carries the legend and `disabled` for Input,
 * Checkbox, Switch and RadioGroup to read. Until those components read it, `disabled`
 * is also applied directly to every direct child field as a fallback so it still
 * takes effect today. The group error is announced as in Input. `disabled` dims the
 * whole group with `opacity.disabled`.
 */
export function Fieldset({ legend, children, description, error, disabled = false, gap = 'normal', overrides }: FieldsetProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  React.useEffect(() => {
    if (Platform.OS === 'ios' && error !== undefined && error !== '') {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);

  const fieldElements = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{ required?: boolean }>[];
  const allRequired = fieldElements.length > 0 && fieldElements.every((child) => child.props.required === true);
  const visibleLegend = allRequired ? `${legend}${COPY.requiredIndicator}` : legend;

  const contextValue = React.useMemo<FieldsetContextValue>(() => ({ legend, disabled }), [legend, disabled]);

  // Fallback until Input, Checkbox, Switch and RadioGroup read FieldsetContext themselves: force every direct field's own `disabled`.
  const renderedChildren = disabled
    ? React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<{ disabled?: boolean }>, { disabled: true }) : child,
      )
    : children;

  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapTight;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const legendOverrides = { ...typographyOverrides, fontSize: overrides?.legendSize, fontWeight: overrides?.legendWeight };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  const groupStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: disabled ? disabledOpacity : 1,
  };

  return (
    <View
      testID="Fieldset"
      role="group"
      accessibilityLabel={visibleLegend}
      accessibilityHint={description}
      accessibilityState={{ disabled }}
      style={groupStyle}
    >
      <Text weight="medium" overrides={legendOverrides}>
        {visibleLegend}
      </Text>
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      <FieldsetContext.Provider value={contextValue}>
        <Stack gap={gap} overrides={overrides?.fieldsGap ? { gap: overrides.fieldsGap } : undefined}>
          {renderedChildren}
        </Stack>
      </FieldsetContext.Provider>
      {error !== undefined && error !== '' ? (
        <View accessibilityLiveRegion="assertive">
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
