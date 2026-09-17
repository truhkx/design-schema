import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `background` is locked — it carries the contrast the build checks
 * against the foreground tokens — so it is not in the union and is ignored if passed.
 */
export type BoxOverridableBinding = 'paddingBlock' | 'paddingInline' | 'border' | 'borderWidth' | 'radius';

export interface BoxProps {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: React.ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /**
   * Vertical padding, overriding `inset` on that axis. It has no default: unset means
   * `inset` applies, which keeps an explicit `none` distinct from an absent value.
   */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies, as with insetBlock. */
  insetInline?: BoxInset | undefined;
  /**
   * Background. `none` is transparent; `default` is the page background (use to lift
   * content off a subtle parent); `subtle` and `strong` step up.
   */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /**
   * Replace individual style bindings with a different token from the theme. The only
   * per-instance styling surface — there is no `style` prop. Overrides change values,
   * never presence: `border: false` and `radius: none` make the matching entries no-ops.
   */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `View` — the surface itself — for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
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
 * Box — a surface: padding around a group of content, a background under it, a border,
 * rounded corners. It has no opinions about what is inside and no spacing between its
 * children (that is Stack's job), and it never carries margin of its own.
 *
 * Renders a `View` with paddingVertical/paddingHorizontal from `layout.inset.*`,
 * backgroundColor from `color.background.*` (nothing for `surface: none`, so the
 * parent's shows through), borderWidth/borderColor when `border`, and borderRadius
 * from `radius.*`. It adds no accessibility role of its own; `radius` does not clip
 * (a child that should be clipped clips itself). The `element` prop is web/Lit only —
 * React Native has no sectioning elements, so the `nav`/`article` semantics those
 * builds render have no counterpart here; use Landmark for a page region.
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
  ref,
}: BoxProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const style = React.useMemo<ViewStyle>(() => {
    const blockInset = insetBlock ?? inset;
    const inlineInset = insetInline ?? inset;

    // ViewStyle is read-only in React Native's strict TypeScript API; this one is built up in place.
    const next: { -readonly [K in keyof ViewStyle]: ViewStyle[K] } = {
      paddingVertical: overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[INSET_TOKEN[blockInset]],
      paddingHorizontal: overrides?.paddingInline
        ? (resolveToken(t, overrides.paddingInline) as number)
        : t[INSET_TOKEN[inlineInset]],
      // `radius: none` renders square corners, so the override has nothing to replace.
      borderRadius:
        radius !== 'none' && overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t[RADIUS_TOKEN[radius]],
    };

    // `surface: none` sets no background at all; `background` is locked, so it is never overridden.
    if (surface !== 'none') {
      next.backgroundColor = t[SURFACE_TOKEN[surface]];
    }

    // `border: false` draws no border, so both border overrides are no-ops.
    if (border) {
      next.borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
      next.borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
    }

    return next;
  }, [t, inset, insetBlock, insetInline, surface, border, radius, overrides]);

  return (
    <View ref={ref} style={style} testID="Box">
      {children}
    </View>
  );
}
