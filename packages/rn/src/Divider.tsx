import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
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
  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row
   * height. They need a row (a horizontal Stack with align stretch) or a parent with a
   * definite height; otherwise a vertical divider has no height and draws nothing.
   */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the
   * divider from decorative into a labelled separator. Ignored on a vertical divider, with
   * a development warning. An empty string is no label.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. React Native has no separator role, so
   * without a `label` this has no observable effect and warns in development.
   */
  semantic?: boolean | undefined;
  /** Space on both sides along the cross axis, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const SPACING_TOKEN = {
  tight: 'layoutGapTight',
  normal: 'layoutGapNormal',
  loose: 'layoutGapLoose',
} as const satisfies Record<Exclude<DividerSpacing, 'none'>, keyof Tokens>;

/**
 * Divider — a line, decorative by default. A `label` centers text between two line
 * segments and makes the line meaningful rather than furniture.
 *
 * The line is an inner `View` `border.width.thin` thick along the cross axis in
 * `color.border` (vertical: `alignSelf: 'stretch'` to the row height), inside a root `View`
 * that carries `spacing` as padding on that axis. `spacing: none` renders no space, so
 * `overrides.spacing` is a no-op there. There is no `separator` role on React Native:
 * a decorative root hides itself and its line (`accessibilityElementsHidden` +
 * `importantForAccessibility="no-hide-descendants"`); a labelled root is a row (`gap` from
 * `labelGap`) of two hidden line Views around `Text size="sm" tone="muted"`, which is read.
 * The label Text sits in a plain View carrying the `Divider.label` hook, since Text takes
 * no `testID`. `labelSize`/`fontFamily` overrides reach Text's `fontSize`/`fontFamily`.
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
  const labelIgnored = hasLabelText && orientation === 'vertical';
  const labelled = hasLabelText && orientation === 'horizontal';

  // Keyed on `label` and `orientation`: warns when the ignored combination appears or changes.
  React.useEffect(() => {
    if (__DEV__ && labelIgnored) {
      console.warn('Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.');
    }
  }, [label, orientation, labelIgnored]);

  // Keyed on `semantic` and whether a label is in effect, so a semantic vertical divider
  // whose label is ignored warns here too.
  React.useEffect(() => {
    if (__DEV__ && semantic && !labelled) {
      console.warn(
        'Divider: `semantic` has no observable effect on React Native without a `label` — there is no native separator role, so the boundary is silent to assistive technology.',
      );
    }
  }, [semantic, labelled]);

  const styles = React.useMemo(() => {
    const thickness = overrides?.thickness ? (resolveToken(t, overrides.thickness) as number) : t.borderWidthThin;
    const color = overrides?.color ? (resolveToken(t, overrides.color) as string) : t.colorBorder;
    // `spacing: none` is the off state: no space and no token, so an override changes nothing.
    const space =
      spacing === 'none'
        ? undefined
        : overrides?.spacing
          ? (resolveToken(t, overrides.spacing) as number)
          : t[SPACING_TOKEN[spacing]];
    const vertical = orientation === 'vertical';
    const gap = overrides?.labelGap ? (resolveToken(t, overrides.labelGap) as number) : t.layoutGapNormal;
    const root: ViewStyle = vertical
      ? { flexDirection: 'row', alignSelf: 'stretch', paddingHorizontal: space }
      : { alignSelf: 'stretch', paddingVertical: space };
    const labelledRoot: ViewStyle = { alignSelf: 'stretch', paddingVertical: space, flexDirection: 'row', alignItems: 'center', gap };
    const line: ViewStyle = vertical
      ? { width: thickness, alignSelf: 'stretch', backgroundColor: color }
      : { height: thickness, backgroundColor: color };
    const segment: ViewStyle = { flex: 1, height: thickness, backgroundColor: color };
    return { root, labelledRoot, line, segment };
  }, [t, orientation, spacing, overrides]);

  if (labelled) {
    return (
      <View ref={ref} style={styles.labelledRoot} testID="Divider">
        <View style={styles.segment} accessibilityElementsHidden importantForAccessibility="no" testID="Divider.line" />
        <View testID="Divider.label">
          <Text size="sm" tone="muted" overrides={{ fontSize: overrides?.labelSize, fontFamily: overrides?.fontFamily }}>
            {label}
          </Text>
        </View>
        <View style={styles.segment} accessibilityElementsHidden importantForAccessibility="no" testID="Divider.line" />
      </View>
    );
  }

  return (
    <View
      ref={ref}
      style={styles.root}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID="Divider"
    >
      <View style={styles.line} testID="Divider.line" />
    </View>
  );
}
