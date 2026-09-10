import * as React from 'react';
import { View } from 'react-native';
import type { FlexAlignType, ViewStyle } from 'react-native';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type StackDirection = 'vertical' | 'horizontal';
/** Space between children from the spacing scale. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type StackGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';

export interface StackProps {
  /** Any components. Stack does not style its children; it only positions them. */
  children: React.ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection;
  /** Space between children from the spacing scale. The only way to set spacing. */
  gap?: StackGap;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean;
}

const GAP_TOKEN = {
  '0': 'space0',
  '1': 'space1',
  '2': 'space2',
  '3': 'space3',
  '4': 'space4',
  '5': 'space5',
  '6': 'space6',
  '8': 'space8',
  '10': 'space10',
  '12': 'space12',
} as const satisfies Record<`${StackGap}`, keyof Tokens>;

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
 * Stack — how things get spaced. Owns the gap between its children using a value
 * from the spacing scale, instead of margins on individual components.
 *
 * When to use: Use Stack for any group of siblings that should be evenly spaced:
 * form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout CSS. Choose `element` when the group has meaning
 * — `nav` for navigation, `ul` for a list of like items — so the structure is
 * exposed to assistive technology.
 *
 * Renders a `View` with `flexDirection`, `gap` from the token object, `alignItems`,
 * `justifyContent` and `flexWrap`. `element` is not applicable on React Native; put
 * `accessibilityRole` on the content instead. Row direction already follows the
 * writing direction under `I18nManager`.
 */
export function Stack({
  children,
  direction = 'vertical',
  gap = '4',
  align = 'stretch',
  justify = 'start',
  wrap = false,
}: StackProps): React.JSX.Element {
  const { tokens } = useTheme();
  const gapKey = String(gap) as `${StackGap}`;

  const style: ViewStyle = {
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: tokens[GAP_TOKEN[gapKey]],
    alignItems: ALIGN[align],
    justifyContent: JUSTIFY[justify],
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };

  return <View style={style}>{children}</View>;
}
