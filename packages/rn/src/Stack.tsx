import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useTheme } from './theme';
import type { Tokens } from './theme';

/** The strict TypeScript API (RN ≥ 0.87) no longer exports `FlexAlignType`; the union lives on the style property. */
type FlexAlignType = NonNullable<ViewStyle['alignItems']>;

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'tight' | 'normal' | 'loose' | 'section';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type StackOverridableBinding = 'gap';

export interface StackProps {
  /** Any components. Stack does not style its children; it only positions them. */
  children: React.ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /**
   * Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing
   * scale: tight for related controls, normal for fields in a form, loose for groups,
   * section between page sections. The only way to set spacing between siblings.
   */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /** Main-axis distribution. */
  justify?: StackJustify | undefined;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean | undefined;
  /**
   * Replace individual style bindings with a different token from the theme. The only
   * per-instance styling surface — there is no `style` prop. `gap: none` turns the gap
   * off, which makes `overrides.gap` a no-op.
   */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const GAP_TOKEN = {
  none: 'layoutGapNone',
  tight: 'layoutGapTight',
  normal: 'layoutGapNormal',
  loose: 'layoutGapLoose',
  section: 'layoutGapSection',
} as const satisfies Record<StackGap, keyof Tokens>;

const ALIGN: Record<StackAlign, FlexAlignType> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

const JUSTIFY: Record<StackJustify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
};

/**
 * Stack — how things get spaced. Owns the gap between its children using a preset
 * from the theme's layout rhythm, instead of margins on individual components.
 *
 * When to use: Use Stack for any group of siblings that should be evenly spaced:
 * form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout style. Do not use it for two-dimensional layouts
 * or for positioning a single element.
 *
 * Renders a `View` with `flexDirection`, `gap` from the token object, `alignItems`,
 * `justifyContent` and `flexWrap`; children are not wrapped. `element` is not
 * applicable on React Native — put `accessibilityRole` on the content instead — so
 * the `nav`/`ul` semantics the web and Lit builds render have no counterpart here.
 * Row direction already follows the writing direction under `I18nManager`.
 * Horizontal stacks should `wrap` rather than scroll, so content reflows for large
 * text settings (WCAG 1.4.10).
 */
export function Stack({
  children,
  direction = 'vertical',
  gap = 'normal',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  overrides,
  ref,
}: StackProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const style = React.useMemo<ViewStyle>(
    () => ({
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      // `gap: none` renders no gap, so the override has nothing to replace.
      gap: gap !== 'none' && overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t[GAP_TOKEN[gap]],
      alignItems: ALIGN[align],
      justifyContent: JUSTIFY[justify],
      flexWrap: wrap ? 'wrap' : 'nowrap',
    }),
    [t, direction, gap, align, justify, wrap, overrides],
  );

  return (
    <View ref={ref} style={style} testID="Stack">
      {children}
    </View>
  );
}
