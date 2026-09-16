import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Stack } from './Stack';
import { Text } from './Text';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

export interface DividerProps {
  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the
   * divider from decorative into a labelled separator. Ignored on a vertical divider, with
   * a development warning.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. React Native has no separator role, so
   * without a `label` this has no observable effect and warns in development.
   */
  semantic?: boolean | undefined;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * The line is a `View` `border.width.thin` thick along the cross axis in `color.border`
 * (vertical: `alignSelf: 'stretch'` to the row height). `spacing` pads the root on both
 * sides of the line's axis; `spacing: none` renders no space, so `overrides.spacing` is
 * a no-op there. There is no `separator` role on React Native: the lines are always
 * hidden from assistive technology (`accessibilityElementsHidden` +
 * `importantForAccessibility="no"`), and a label is read because it renders as `Text`.
 * The label composes `Text size="sm" tone="muted"` inside a horizontal `Stack`; the
 * `labelSize`/`fontFamily` overrides reach Text's `fontSize`/`fontFamily` and `labelGap`
 * reaches Stack's `gap`.
 */
export function Divider({
  orientation = 'horizontal',
  label,
  semantic = false,
  spacing = 'none',
  overrides,
  ref,
}: DividerProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const hasLabelText = label !== undefined && label !== '';
  const labelled = hasLabelText && orientation === 'horizontal';

  React.useEffect(() => {
    if (!__DEV__) return;
    if (hasLabelText && orientation === 'vertical') {
      console.warn('Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.');
    }
    if (semantic && !labelled) {
      console.warn(
        'Divider: `semantic` has no observable effect on React Native without a `label` — there is no native separator role, so the boundary is silent to assistive technology.',
      );
    }
  }, [hasLabelText, orientation, semantic, labelled]);

  const styles = React.useMemo(() => {
    const thickness = overrides?.thickness ? (resolveToken(t, overrides.thickness) as number) : t.borderWidthThin;
    const color = overrides?.color ? (resolveToken(t, overrides.color) as string) : t.colorBorder;
    // `spacing: none` is the off state: an override changes the value, never the presence.
    const space =
      spacing !== 'none' && overrides?.spacing ? (resolveToken(t, overrides.spacing) as number) : t[SPACING_TOKEN[spacing]];
    const vertical = orientation === 'vertical';
    const root: ViewStyle = vertical
      ? { flexDirection: 'row', alignSelf: 'stretch', paddingHorizontal: space }
      : { alignSelf: 'stretch', paddingVertical: space };
    const line: ViewStyle = vertical
      ? { width: thickness, alignSelf: 'stretch', backgroundColor: color }
      : { height: thickness, backgroundColor: color };
    const segment: ViewStyle = { flex: 1, height: thickness, backgroundColor: color };
    return { root, line, segment };
  }, [t, orientation, spacing, overrides]);

  if (labelled) {
    return (
      <View ref={ref} style={styles.root} testID="Divider">
        <Stack direction="horizontal" gap="normal" align="center" overrides={{ gap: overrides?.labelGap }}>
          <View style={styles.segment} accessibilityElementsHidden importantForAccessibility="no" testID="Divider.line" />
          <Text size="sm" tone="muted" overrides={{ fontSize: overrides?.labelSize, fontFamily: overrides?.fontFamily }}>
            {label}
          </Text>
          <View style={styles.segment} accessibilityElementsHidden importantForAccessibility="no" testID="Divider.line" />
        </Stack>
      </View>
    );
  }

  return (
    <View ref={ref} style={styles.root} accessibilityElementsHidden importantForAccessibility="no" testID="Divider">
      <View style={styles.line} testID="Divider.line" />
    </View>
  );
}
