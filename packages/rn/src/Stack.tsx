import * as React from 'react';
import { View } from 'react-native';
import type { FlexAlignType, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useTheme } from './theme';
import type { Tokens } from './theme';

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
  direction?: StackDirection;
  /** Space between children, from the layout rhythm. The only way to set spacing between siblings. */
  gap?: StackGap;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef>>;
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
 * for it before writing any layout CSS.
 *
 * Renders a `View` with `flexDirection`, `gap` from the token object, `alignItems`,
 * `justifyContent` and `flexWrap`. `element` is not applicable on React Native; put
 * `accessibilityRole` on the content instead. Row direction already follows the
 * writing direction under `I18nManager`.
 */
export function Stack({
  children,
  direction = 'vertical',
  gap = 'normal',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  overrides,
}: StackProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const style = React.useMemo<ViewStyle>(
    () => ({
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      gap: overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t[GAP_TOKEN[gap]],
      alignItems: ALIGN[align],
      justifyContent: JUSTIFY[justify],
      flexWrap: wrap ? 'wrap' : 'nowrap',
    }),
    [t, direction, gap, align, justify, wrap, overrides],
  );

  return (
    <View style={style} testID="Stack">
      {children}
    </View>
  );
}
