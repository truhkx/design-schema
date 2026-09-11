import * as React from 'react';
import { ScrollView, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Divider } from './Divider';
import { useTheme } from './theme';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarOverflow = 'wrap' | 'menu' | 'scroll';
export type ToolbarSize = 'sm' | 'md';
export type ToolbarDensity = 'compact' | 'comfortable';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ToolbarOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'itemGap'
  | 'itemGapCompact'
  | 'groupGap'
  | 'separatorLength'
  | 'fadeWidth';

export interface ToolbarProps {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: `Button` (usually `ghost` or `secondary`, `iconOnly` for glyph
   * tools), `SegmentedControl`, `Select`, `Switch`. Place a `Divider` between related
   * clusters — Toolbar gives it extra space on both sides and constrains its length.
   */
  children: React.ReactNode;
  /** Vertical toolbars sit beside a canvas. Arrow-key axis swapping is a web keyboard model; see the component doc. */
  orientation?: ToolbarOrientation | undefined;
  /** What happens when controls do not fit. See the component doc for the native fallback on `menu`. */
  overflow?: ToolbarOverflow | undefined;
  /** Passed to the child controls that accept a `size` prop, unless a child already sets its own. */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
}

function isDividerElement(node: React.ReactNode): node is React.ReactElement<any> {
  return React.isValidElement(node) && node.type === Divider;
}

/**
 * Toolbar — keeps a set of related controls together so the keyboard treats them as
 * one stop: Tab reaches the toolbar, and, on a hardware keyboard on
 * react-native-web, arrows move within it.
 *
 * When to use: Use a Toolbar for controls that act on the same thing and are used
 * together — text formatting, a table's row actions, a data page's filter–sort–
 * export row. Group related controls with a `Divider` between clusters. Do not use
 * it for page navigation or a form's submit row, and do not use it as a generic
 * horizontal Stack — it changes how Tab works on web.
 *
 * Renders a `View` with `accessibilityRole="toolbar"` and `accessibilityLabel`
 * carrying `background` (locked), `border`, `radius` and `paddingInline`/
 * `paddingBlock`. Children are wrapped one-by-one, each carrying the trailing
 * margin to its neighbor: `itemGap`/`itemGapCompact` (by `density`) normally,
 * `groupGap` on either side of a `Divider` child. A `Divider` child is additionally
 * wrapped in a `View` constrained to `separatorLength` on the cross axis, so
 * `Divider`'s own `alignSelf: 'stretch'` renders it shorter than the toolbar rather
 * than restyling it. Non-divider children receive `size` by `React.cloneElement`
 * when they do not already set their own — the same fallback pattern `Fieldset`
 * uses for `disabled` — so a caller's explicit choice is never overridden.
 *
 * `overflow: wrap` renders the children in a plain `View` with `flexWrap: 'wrap'`.
 * `scroll` and `menu` render a `ScrollView` (horizontal unless `orientation` is
 * vertical) with a `Svg`/`LinearGradient` fade of `fadeWidth` at each edge, from
 * `background` to transparent — the RN analog of the web `mask-image` gradient.
 *
 * Acknowledged native limits: there is no `ResizeObserver` equivalent and children
 * are opaque `ReactNode`s with no `overflowLabel` metadata, so `overflow: menu`
 * cannot measure and move trailing controls into a "More" `Menu` the way the web
 * implementation does; it renders the same scrollable row as `overflow: scroll`
 * instead (dev warning in `__DEV__`). There is no generic key-event API on
 * `Pressable`, so the roving-tabindex/arrow-key/Home/End model is a web keyboard
 * concern only, reachable through react-native-web — on native every control is its
 * own accessibility stop, reachable by swipe, the same limit `Tabs` and `Menu`
 * document. `ToolbarGroup`, named in the guidance and the web/Lit platform notes,
 * has no schema of its own; grouping on this platform is expressed by placing a
 * `Divider` between clusters of children rather than a dedicated wrapper component.
 */
export function Toolbar({
  label,
  children,
  orientation = 'horizontal',
  overflow = 'menu',
  size = 'md',
  density = 'comfortable',
  overrides,
}: ToolbarProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const isVertical = orientation === 'vertical';

  React.useEffect(() => {
    if (__DEV__ && overflow === 'menu') {
      console.warn(
        'Toolbar: `overflow="menu"` has no React Native equivalent — there is no way to measure opaque children and move them into a "More" Menu, so it renders the same scrollable row as `overflow="scroll"`.',
      );
    }
  }, [overflow]);

  const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.space2;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.space1;
  const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t.layoutGapNormal;
  const itemGapCompact = overrides?.itemGapCompact ? (resolveToken(t, overrides.itemGapCompact) as number) : t.layoutGapTight;
  const groupGap = overrides?.groupGap ? (resolveToken(t, overrides.groupGap) as number) : t.layoutGapNormal;
  const separatorLength = overrides?.separatorLength ? (resolveToken(t, overrides.separatorLength) as number) : t.space5;
  const fadeWidth = overrides?.fadeWidth ? (resolveToken(t, overrides.fadeWidth) as number) : t.space6;

  const background = t.colorBackgroundSubtle;
  const gap = density === 'compact' ? itemGapCompact : itemGap;

  const childArray = React.Children.toArray(children);

  const items = childArray.map((child, index) => {
    const key = React.isValidElement(child) && child.key !== null ? child.key : index;
    const isLast = index === childArray.length - 1;
    const currentIsDivider = isDividerElement(child);
    const nextIsDivider = !isLast && isDividerElement(childArray[index + 1]);
    const marginAfter = isLast ? 0 : currentIsDivider || nextIsDivider ? groupGap : gap;
    const marginStyle: ViewStyle = isVertical ? { marginBottom: marginAfter } : { marginEnd: marginAfter };

    let content: React.ReactNode = child;
    if (currentIsDivider) {
      const lengthStyle: ViewStyle = isVertical
        ? { width: separatorLength, alignItems: 'center' }
        : { height: separatorLength, justifyContent: 'center' };
      content = <View style={lengthStyle}>{child}</View>;
    } else if (React.isValidElement(child)) {
      const element = child as React.ReactElement<{ size?: ToolbarSize | undefined }>;
      if (element.props.size === undefined) {
        content = React.cloneElement(element, { size });
      }
    }

    return (
      <View key={key} style={marginStyle}>
        {content}
      </View>
    );
  });

  const contentContainerStyle: ViewStyle = {
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: isVertical ? 'stretch' : 'center',
    flexWrap: overflow === 'wrap' ? 'wrap' : 'nowrap',
  };

  const outerStyle: ViewStyle = {
    backgroundColor: background,
    borderWidth,
    borderColor: border,
    borderRadius: radius,
    paddingHorizontal: paddingInline,
    paddingVertical: paddingBlock,
  };

  const body =
    overflow === 'wrap' ? (
      <View style={contentContainerStyle}>{items}</View>
    ) : (
      <View>
        <ScrollView
          horizontal={!isVertical}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
        >
          {items}
        </ScrollView>
        <ToolbarFade edge="start" vertical={isVertical} width={fadeWidth} color={background} />
        <ToolbarFade edge="end" vertical={isVertical} width={fadeWidth} color={background} />
      </View>
    );

  return (
    <View testID="Toolbar" accessibilityRole="toolbar" accessibilityLabel={label} style={outerStyle}>
      {body}
    </View>
  );
}

interface ToolbarFadeProps {
  edge: 'start' | 'end';
  vertical: boolean;
  width: number;
  color: string;
}

/** One edge fade over the scrollable row/column, from `background` to transparent. */
function ToolbarFade({ edge, vertical, width, color }: ToolbarFadeProps): React.JSX.Element {
  const gradientId = React.useId();

  const positionStyle: ViewStyle = vertical
    ? { position: 'absolute', left: 0, right: 0, height: width, [edge === 'start' ? 'top' : 'bottom']: 0 }
    : { position: 'absolute', top: 0, bottom: 0, width, [edge === 'start' ? 'left' : 'right']: 0 };

  // Opaque at the outer edge, fading to transparent moving into the content.
  const [x1, y1, x2, y2] = vertical
    ? edge === 'start'
      ? (['0%', '0%', '0%', '100%'] as const)
      : (['0%', '100%', '0%', '0%'] as const)
    : edge === 'start'
      ? (['0%', '0%', '100%', '0%'] as const)
      : (['100%', '0%', '0%', '0%'] as const);

  return (
    <View style={positionStyle} pointerEvents="none" testID={`Toolbar.fade-${edge}`}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
