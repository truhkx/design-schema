import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
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
  /** Horizontal padding at the viewport edge. `default` is responsive: narrow below the content width and wide above the page width. `none` for a nested container inside a padded parent. */
  gutter?: ContainerGutter | undefined;
  /** Where the capped column sits in a wider viewport. */
  align?: ContainerAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;
}

const MAX_WIDTH_TOKEN = {
  prose: 'layoutMaxWidthProse',
  content: 'layoutMaxWidthContent',
  page: 'layoutMaxWidthPage',
} as const satisfies Record<Exclude<ContainerWidth, 'full'>, keyof Tokens>;

/**
 * Container — decides a screen's horizontal rhythm once: a gutter at the viewport
 * edge and a cap on how wide content can get.
 *
 * Renders a `View` with maxWidth, alignSelf and paddingHorizontal resolved from the
 * token object. `element` does not apply on React Native.
 */
export function Container({
  children,
  width = 'content',
  gutter = 'default',
  align = 'center',
  overrides,
}: ContainerProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const { width: viewportWidth } = useWindowDimensions();

  const style = React.useMemo<ViewStyle>(() => {
    // ViewStyle is read-only in React Native's strict TypeScript API; this one is built up in place.
    const next: { -readonly [K in keyof ViewStyle]: ViewStyle[K] } = {
      width: '100%',
      alignSelf: align === 'start' ? 'flex-start' : 'center',
    };

    if (overrides?.maxWidth) {
      next.maxWidth = resolveToken(t, overrides.maxWidth) as number;
    } else if (width !== 'full') {
      next.maxWidth = t[MAX_WIDTH_TOKEN[width]];
    }

    if (overrides?.paddingInline) {
      next.paddingHorizontal = resolveToken(t, overrides.paddingInline) as number;
    } else if (gutter === 'none') {
      next.paddingHorizontal = 0;
    } else if (gutter === 'narrow') {
      next.paddingHorizontal = t.layoutGutterNarrow;
    } else if (gutter === 'wide') {
      next.paddingHorizontal = t.layoutGutterWide;
    } else if (viewportWidth < t.layoutMaxWidthContent) {
      next.paddingHorizontal = t.layoutGutterNarrow;
    } else if (viewportWidth > t.layoutMaxWidthPage) {
      next.paddingHorizontal = t.layoutGutterWide;
    } else {
      next.paddingHorizontal = t.layoutGutter;
    }

    return next;
  }, [t, width, gutter, align, overrides, viewportWidth]);

  return (
    <View style={style} testID="Container">
      {children}
    </View>
  );
}
