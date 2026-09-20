import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type ContainerWidth = 'prose' | 'content' | 'page' | 'full';
export type ContainerGutter = 'narrow' | 'default' | 'wide' | 'none';
export type ContainerAlign = 'center' | 'start';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ContainerOverridableBinding = 'maxWidth' | 'paddingInline';

export interface ContainerProps {
  /** The page or region content, usually a Stack with `gap: section` between regions. */
  children: React.ReactNode;
  /** `prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed layouts with wide grids, `full` for no cap (gutters only). */
  width?: ContainerWidth | undefined;
  /** Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the content width and the wide gutter above the page width. `none` for a nested container inside a padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. `center` maps to `alignSelf: 'center'`, `start` to `alignSelf: 'flex-start'` (there is no margin on native). */
  align?: ContainerAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. An override is a no-op where its binding renders nothing (`width: full`, `gutter: none`). */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const MAX_WIDTH = {
  prose: 'layoutMaxWidthProse',
  content: 'layoutMaxWidthContent',
  page: 'layoutMaxWidthPage',
} as const satisfies Record<Exclude<ContainerWidth, 'full'>, keyof Tokens>;

const GUTTER = {
  narrow: 'layoutGutterNarrow',
  wide: 'layoutGutterWide',
} as const satisfies Record<'narrow' | 'wide', keyof Tokens>;

/**
 * Container — decides a screen's horizontal rhythm once: a gutter at the viewport
 * edge and a cap on how wide content can get.
 *
 * Renders a `View` with `width: '100%'`, `maxWidth` from `layout.maxWidth.{width}`
 * (none for `full`), `alignSelf` from `align` and `paddingHorizontal` from
 * `layout.gutter.{gutter}`. The `default` gutter compares `useWindowDimensions().width`
 * with the content and page max-width tokens, with the same inclusive `>=` boundaries
 * as the web media queries — it reads the window, never the parent, so a nested
 * `gutter: default` Container picks its gutter by the window; nest with `gutter: none`.
 * Container belongs in a column-direction parent (a screen, a vertical Stack); inside
 * a row parent `width: '100%'` and `alignSelf` cross axes and that placement is not
 * supported. `element` is web and Lit only, as in Box.
 */
export function Container({
  children,
  width = 'content',
  gutter = 'default',
  align = 'center',
  overrides,
  ref,
}: ContainerProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const { width: viewportWidth } = useWindowDimensions();

  const style = React.useMemo<ViewStyle>(() => {
    let maxWidth: number | undefined;
    if (width !== 'full') {
      maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t[MAX_WIDTH[width]];
    }

    let paddingHorizontal: number;
    if (gutter === 'none') {
      paddingHorizontal = 0;
    } else if (overrides?.paddingInline) {
      paddingHorizontal = resolveToken(t, overrides.paddingInline) as number;
    } else if (gutter !== 'default') {
      paddingHorizontal = t[GUTTER[gutter]];
    } else if (viewportWidth >= t.layoutMaxWidthPage) {
      // Same breakpoints as the web media queries (min-width is inclusive).
      paddingHorizontal = t.layoutGutterWide;
    } else if (viewportWidth >= t.layoutMaxWidthContent) {
      paddingHorizontal = t.layoutGutter;
    } else {
      paddingHorizontal = t.layoutGutterNarrow;
    }

    return {
      width: '100%',
      maxWidth,
      alignSelf: align === 'start' ? 'flex-start' : 'center',
      paddingHorizontal,
    };
  }, [t, width, gutter, align, overrides, viewportWidth]);

  return (
    <View ref={ref} style={style} testID="Container">
      {children}
    </View>
  );
}
