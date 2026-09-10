import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type BoxOverridableBinding = 'paddingBlock' | 'paddingInline' | 'background' | 'border' | 'borderWidth' | 'radius';

export interface BoxProps {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: React.ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset;
  /** Vertical padding, overriding `inset` on that axis. */
  insetBlock?: BoxInset;
  /** Horizontal padding, overriding `inset` on that axis. */
  insetInline?: BoxInset;
  /** Background. `none` is transparent; `default` is the page background; `subtle` and `strong` step up. */
  surface?: BoxSurface;
  /** A thin default border. */
  border?: boolean;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef>>;
}

const INSET_TOKEN = {
  none: 'layoutInsetNone',
  sm: 'layoutInsetSm',
  md: 'layoutInsetMd',
  lg: 'layoutInsetLg',
  xl: 'layoutInsetXl',
} as const satisfies Record<BoxInset, keyof Tokens>;

const SURFACE_TOKEN = {
  default: 'colorBackground',
  subtle: 'colorBackgroundSubtle',
  strong: 'colorBackgroundStrong',
} as const satisfies Record<Exclude<BoxSurface, 'none'>, keyof Tokens>;

const RADIUS_TOKEN = {
  none: 'radiusNone',
  sm: 'radiusSm',
  md: 'radiusMd',
  lg: 'radiusLg',
  full: 'radiusFull',
} as const satisfies Record<BoxRadius, keyof Tokens>;

/**
 * Box — a surface: padding, background, border, radius. It spaces nothing between
 * children (put a Stack inside for that) and never carries margin of its own.
 *
 * Renders a `View` with paddingVertical/paddingHorizontal, backgroundColor,
 * borderWidth/borderColor and borderRadius resolved from the token object.
 * `element` does not apply on React Native.
 */
export function Box({
  children,
  inset = 'none',
  insetBlock,
  insetInline,
  surface = 'none',
  border = false,
  radius = 'none',
  overrides,
}: BoxProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const style = React.useMemo<ViewStyle>(() => {
    const blockInset = insetBlock ?? inset;
    const inlineInset = insetInline ?? inset;

    const next: ViewStyle = {
      paddingVertical: overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[INSET_TOKEN[blockInset]],
      paddingHorizontal: overrides?.paddingInline
        ? (resolveToken(t, overrides.paddingInline) as number)
        : t[INSET_TOKEN[inlineInset]],
      borderRadius:
        radius !== 'none' && overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t[RADIUS_TOKEN[radius]],
    };

    if (surface !== 'none') {
      next.backgroundColor = overrides?.background ? (resolveToken(t, overrides.background) as string) : t[SURFACE_TOKEN[surface]];
    }

    if (border) {
      next.borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
      next.borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
    }

    return next;
  }, [t, inset, insetBlock, insetInline, surface, border, radius, overrides]);

  return (
    <View style={style} testID="Box">
      {children}
    </View>
  );
}
