import * as React from 'react';
import { ScrollView, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Divider } from './Divider';
import type { DividerOrientation, DividerProps } from './Divider';
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
  | 'groupGap'
  | 'separatorLength'
  | 'fadeWidth';

export interface ToolbarProps {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. On React Native, group related controls by placing a
   * `Divider` between clusters; the Toolbar draws it at `separatorLength` between the groups.
   */
  children: React.ReactNode;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes (react-native-web only). */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: `wrap` onto more rows, or `scroll` with the edges
   * faded. `menu` renders as `scroll` on React Native (children are opaque and nothing measures
   * them), with a development warning.
   */
  overflow?: ToolbarOverflow | undefined;
  /** Default for child controls that have a `size` prop and do not set their own (a child's own `size` wins). */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const ITEM_GAP = {
  compact: 'layoutGapTight',
  comfortable: 'layoutGapNormal',
} as const;

let warnedMenu = false;

function isDividerElement(node: React.ReactNode): node is React.ReactElement<DividerProps> {
  return React.isValidElement(node) && node.type === Divider;
}

/** Direct children with fragments expanded, so a fragment of controls counts as its controls. */
function flattenChildren(children: React.ReactNode, prefix = ''): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      out.push(...flattenChildren(child.props.children, `${prefix}${String(child.key)}`));
    } else if (React.isValidElement(child)) {
      out.push(React.cloneElement(child, { key: `${prefix}${String(child.key)}` }));
    } else {
      out.push(child);
    }
  });
  return out;
}

interface ToolbarSegment {
  /** The Divider drawn before this group; absent on the first. */
  divider: React.ReactElement<DividerProps> | undefined;
  items: React.ReactNode[];
}

/** Splits the controls into groups at each Divider; a Divider with no controls on one side draws nothing. */
function toSegments(nodes: React.ReactNode[]): ToolbarSegment[] {
  const segments: ToolbarSegment[] = [];
  let current: ToolbarSegment = { divider: undefined, items: [] };
  for (const node of nodes) {
    if (isDividerElement(node)) {
      if (current.items.length > 0) {
        segments.push(current);
        current = { divider: node, items: [] };
      } else if (segments.length > 0) {
        current.divider = node;
      }
    } else {
      current.items.push(node);
    }
  }
  if (current.items.length > 0) segments.push(current);
  return segments;
}

/**
 * Toolbar — keeps a set of related controls together: one labelled `toolbar` container
 * whose controls keep their own roles and names.
 *
 * When to use: controls that act on the same thing and are used together (text formatting,
 * a table's row actions, a filter–sort–export row). Not for page navigation, a form's
 * submit row, a single control, or as a generic horizontal Stack.
 *
 * Renders a `View` with `accessibilityRole="toolbar"` and `accessibilityLabel` carrying
 * `background` (locked), `border`, `borderWidth`, `radius` and `paddingInline`/
 * `paddingBlock`. Children are split into groups at each `Divider` child: each group is a
 * `View` (`Toolbar.group`) spacing its controls by `itemGap` (by `density`), and the row
 * spaces groups and separators by `groupGap`, which replaces `itemGap` either side of a
 * separator. A Divider is laid in a `Toolbar.separator` box `separatorLength` long on the
 * cross axis, which its own stretch fills — the Toolbar sizes the slot, never the Divider,
 * and only supplies the Divider's `orientation` (across the toolbar axis) when it sets none.
 * Direct children (fragments expanded) that are not Dividers receive `size` by cloning
 * when they do not set their own.
 *
 * `overflow: wrap` wraps rows (columns when vertical). `scroll` — and `menu`, which has no
 * native measurement, so it renders as `scroll` with a `__DEV__` warning — puts the groups
 * in a `ScrollView` along the toolbar axis with a react-native-svg gradient `fadeWidth`
 * long from `background` to transparent over each edge that has content scrolled past it.
 *
 * Acknowledged native limits: no roving focus or arrow/Home/End keys without a hardware
 * keyboard — every control is its own accessibility stop, reachable by swipe; the arrow
 * model applies on react-native-web only. `focusRing`/`focusRingWidth` are applied nowhere:
 * each composed control draws its own ring. The `overflowButton`/`overflowMenu` parts have
 * no element on this platform.
 */
export function Toolbar({
  label,
  children,
  orientation = 'horizontal',
  overflow = 'menu',
  size = 'md',
  density = 'comfortable',
  overrides,
  ref,
}: ToolbarProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const vertical = orientation === 'vertical';
  // `menu` assumes a fixed cross axis and a measurer; neither exists here.
  const mode: 'wrap' | 'scroll' = overflow === 'wrap' ? 'wrap' : 'scroll';

  React.useEffect(() => {
    if (__DEV__ && overflow === 'menu' && !vertical && !warnedMenu) {
      warnedMenu = true;
      console.warn(
        'Toolbar: `overflow="menu"` renders as `overflow="scroll"` on React Native — children are opaque, so nothing can measure them and move trailing controls into a "More" Menu.',
      );
    }
  }, [overflow, vertical]);

  const styles = React.useMemo(() => {
    const border = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
    const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
    const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
    const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.space2;
    const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.space1;
    const itemGap = overrides?.itemGap ? (resolveToken(t, overrides.itemGap) as number) : t[ITEM_GAP[density]];
    const groupGap = overrides?.groupGap ? (resolveToken(t, overrides.groupGap) as number) : t.layoutGapNormal;
    const separatorLength = overrides?.separatorLength
      ? (resolveToken(t, overrides.separatorLength) as number)
      : t.space5;
    const fadeWidth = overrides?.fadeWidth ? (resolveToken(t, overrides.fadeWidth) as number) : t.space6;

    const wrap = mode === 'wrap' ? 'wrap' : 'nowrap';
    const root: ViewStyle = {
      backgroundColor: t.colorBackgroundSubtle,
      borderColor: border,
      borderWidth,
      borderRadius: radius,
      paddingHorizontal: paddingInline,
      paddingVertical: paddingBlock,
    };
    const row: ViewStyle = {
      flexDirection: vertical ? 'column' : 'row',
      alignItems: vertical ? 'stretch' : 'center',
      flexWrap: wrap,
      gap: groupGap,
    };
    const group: ViewStyle = {
      flexDirection: vertical ? 'column' : 'row',
      alignItems: vertical ? 'stretch' : 'center',
      flexWrap: wrap,
      flexShrink: mode === 'wrap' ? 1 : 0,
      gap: itemGap,
    };
    // A row box lets a vertical Divider stretch to the height; a column box lets a horizontal one stretch to the width.
    const separator: ViewStyle = vertical
      ? { width: separatorLength, alignSelf: 'center' }
      : { height: separatorLength, flexDirection: 'row', alignSelf: 'center' };
    return { root, row, group, separator, fadeWidth };
  }, [t, overrides, density, vertical, mode]);

  const segments = toSegments(flattenChildren(children));
  const dividerOrientation: DividerOrientation = vertical ? 'horizontal' : 'vertical';

  const content: React.ReactNode[] = [];
  segments.forEach((segment, index) => {
    if (segment.divider) {
      const divider =
        segment.divider.props.orientation === undefined
          ? React.cloneElement(segment.divider, { orientation: dividerOrientation })
          : segment.divider;
      content.push(
        <View key={`separator-${index}`} style={styles.separator} testID="Toolbar.separator">
          {divider}
        </View>,
      );
    }
    content.push(
      <View key={`group-${index}`} style={styles.group} testID="Toolbar.group">
        {segment.items.map((item) => {
          if (!React.isValidElement<{ size?: unknown }>(item) || item.props.size !== undefined) return item;
          return React.cloneElement(item, { size });
        })}
      </View>,
    );
  });

  // Which edges have content scrolled past them, so a fade only covers hidden content.
  const [edges, setEdges] = React.useState({ start: false, end: false });
  const metrics = React.useRef({ offset: 0, viewport: 0, content: 0 });
  const updateEdges = (): void => {
    const { offset, viewport, content: length } = metrics.current;
    const start = offset > 1;
    const end = offset + viewport < length - 1;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  return (
    <View ref={ref} testID="Toolbar" accessibilityRole="toolbar" accessibilityLabel={label} style={styles.root}>
      {mode === 'wrap' ? (
        <View style={styles.row}>{content}</View>
      ) : (
        <View>
          <ScrollView
            horizontal={!vertical}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.row}
            scrollEventThrottle={16} // literal-ok: one frame between fade updates
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              metrics.current.viewport = vertical ? height : width;
              updateEdges();
            }}
            onContentSizeChange={(width, height) => {
              metrics.current.content = vertical ? height : width;
              updateEdges();
            }}
            onScroll={(event) => {
              const { contentOffset } = event.nativeEvent;
              metrics.current.offset = vertical ? contentOffset.y : contentOffset.x;
              updateEdges();
            }}
          >
            {content}
          </ScrollView>
          {edges.start ? (
            <ToolbarFade edge="start" vertical={vertical} length={styles.fadeWidth} color={t.colorBackgroundSubtle} />
          ) : null}
          {edges.end ? (
            <ToolbarFade edge="end" vertical={vertical} length={styles.fadeWidth} color={t.colorBackgroundSubtle} />
          ) : null}
        </View>
      )}
    </View>
  );
}

interface ToolbarFadeProps {
  edge: 'start' | 'end';
  vertical: boolean;
  length: number;
  color: string;
}

/** One edge fade over the scrolling row, opaque `background` at the edge to transparent inward. */
function ToolbarFade({ edge, vertical, length, color }: ToolbarFadeProps): React.JSX.Element {
  // useId's colons are not valid in an SVG `url(#…)` reference on react-native-web.
  const gradientId = `toolbar-fade-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const position: ViewStyle = vertical
    ? { position: 'absolute', left: 0, right: 0, height: length, ...(edge === 'start' ? { top: 0 } : { bottom: 0 }) }
    : { position: 'absolute', top: 0, bottom: 0, width: length, ...(edge === 'start' ? { left: 0 } : { right: 0 }) };
  const from = edge === 'start' ? '0%' : '100%';
  const to = edge === 'start' ? '100%' : '0%';

  return (
    <View style={position} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id={gradientId}
            x1={vertical ? '0%' : from}
            y1={vertical ? from : '0%'}
            x2={vertical ? '0%' : to}
            y2={vertical ? to : '0%'}
          >
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
