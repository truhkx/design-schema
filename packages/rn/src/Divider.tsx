import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Text } from './Text';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

export interface DividerProps {
  /** `vertical` sits between inline siblings (toolbar groups) and stretches to the row height. */
  orientation?: DividerOrientation | undefined;
  /** Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the line into a labelled separator. */
  label?: string | undefined;
  /** Expose as a separator to assistive technology. Leave `false` for purely visual lines between list rows. */
  semantic?: boolean | undefined;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
}

const SPACING_TOKEN = {
  none: 'layoutGapNone',
  tight: 'layoutGapTight',
  normal: 'layoutGapNormal',
  loose: 'layoutGapLoose',
} as const satisfies Record<DividerSpacing, keyof Tokens>;

/**
 * Divider — a line, decorative by default. A `label` centers text between two line
 * segments and makes the line meaningful rather than furniture.
 *
 * Renders a `View` sized to `border.width.thin` along the cross axis and colored
 * `color.border`; `spacing` adds symmetric margin for dividers standing outside a
 * Stack. There is no `separator` accessibility role on React Native, so a divider
 * without a `label` stays hidden from assistive technology (`accessibilityElementsHidden`
 * + `importantForAccessibility="no"`) regardless of `semantic` — announcing
 * "separator" has no native idiom. A `label` is read because it renders as `Text`,
 * which needs no special role; `semantic` itself has no further observable effect on
 * this platform.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  semantic = false,
  spacing = 'none',
  overrides,
}: DividerProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  if (__DEV__ && semantic && label === undefined) {
    console.warn(
      'Divider: `semantic` has no observable effect on React Native without a `label` — there is no native separator role, so the divider stays hidden from assistive technology.',
    );
  }

  const thickness = overrides?.thickness ? (resolveToken(t, overrides.thickness) as number) : t.borderWidthThin;
  const color = overrides?.color ? (resolveToken(t, overrides.color) as string) : t.colorBorder;
  const labelGap = overrides?.labelGap ? (resolveToken(t, overrides.labelGap) as number) : t.layoutGapNormal;
  const spacingValue =
    spacing !== 'none' ? (overrides?.spacing ? (resolveToken(t, overrides.spacing) as number) : t[SPACING_TOKEN[spacing]]) : 0;

  const hasLabel = label !== undefined && orientation === 'horizontal';

  if (hasLabel) {
    const containerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacingValue,
    };
    const segmentStyle: ViewStyle = { flex: 1, height: thickness, backgroundColor: color };

    return (
      <View style={containerStyle} testID="Divider">
        <View style={segmentStyle} />
        <View style={{ marginHorizontal: labelGap }}>
          <Text size="sm" tone="muted" overrides={{ fontSize: overrides?.labelSize, fontFamily: overrides?.fontFamily }}>
            {label}
          </Text>
        </View>
        <View style={segmentStyle} />
      </View>
    );
  }

  const rootStyle: ViewStyle =
    orientation === 'vertical'
      ? { width: thickness, alignSelf: 'stretch', backgroundColor: color, marginHorizontal: spacingValue }
      : { height: thickness, width: '100%', backgroundColor: color, marginVertical: spacingValue };

  return <View style={rootStyle} accessibilityElementsHidden importantForAccessibility="no" testID="Divider" />;
}
