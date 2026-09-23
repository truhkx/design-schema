import * as React from 'react';
import { ScrollView, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Divider } from './Divider';
import { Search } from './Search';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
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
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is
   * drawn between two adjacent groups only (a bare control next to a group gets `itemGap`, no
   * Divider), and only between top-level groups — a group nested inside a group takes no
   * separator and no `size` pass. Consumers never place Dividers themselves.
   */
  children: React.ReactNode;
  /** Vertical toolbars sit beside a canvas; the controls stack along the column. */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: `wrap` onto more rows, or `scroll` with the edges
   * faded. `menu` (the default) renders as `scroll` on React Native — children are opaque and
   * nothing measures them; an explicitly passed `menu` warns once in development.
   */
  overflow?: ToolbarOverflow | undefined;
  /**
   * Default for child Buttons, SegmentedControls, Selects and Searches (recognised by component
   * identity) that do not set their own; applied to direct children and to each ToolbarGroup's
   * children. A child's own `size` wins.
   */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`, for measurement or accessibility focus. */
  ref?: React.Ref<ViewInstance> | undefined;
}

export interface ToolbarGroupProps {
  /** The group's accessible name. */
  label?: string | undefined;
  /** The group's controls, in order. */
  children: React.ReactNode;
  /** The group's `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const ITEM_GAP = {
  compact: 'layoutGapTight',
  comfortable: 'layoutGapNormal',
} as const;

/**
 * Components that take a toolbar `size`, recognised by identity — never by probing for a prop —
 * mapped to the toolbar sizes each one actually accepts. Search has no `sm`, so a `sm` toolbar
 * leaves every Search at its own default.
 */
const SIZED_COMPONENTS: ReadonlyMap<unknown, ReadonlySet<ToolbarSize>> = new Map<unknown, ReadonlySet<ToolbarSize>>([
  [Button, new Set<ToolbarSize>(['sm', 'md'])],
  [SegmentedControl, new Set<ToolbarSize>(['sm', 'md'])],
  [Select, new Set<ToolbarSize>(['sm', 'md'])],
  [Search, new Set<ToolbarSize>(['md'])],
]);

let warnedMenu = false;

interface ToolbarLayout {
  group: ViewStyle;
}

const ToolbarLayoutContext: React.Context<ToolbarLayout | null> = React.createContext<ToolbarLayout | null>(null);

/** Children with fragments expanded, so a fragment of controls counts as its controls. */
function flattenChildren(children: React.ReactNode, prefix = ''): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
      out.push(...flattenChildren(child.props.children, `${prefix}${String(child.key)}`));
    } else if (React.isValidElement(child)) {
      out.push(prefix === '' ? child : React.cloneElement(child, { key: `${prefix}${String(child.key)}` }));
    } else {
      out.push(child);
    }
  });
  return out;
}

/** Applies the toolbar's `size` to a sized package control that did not set its own. */
function withSize(node: React.ReactNode, size: ToolbarSize): React.ReactNode {
  if (!React.isValidElement<{ size?: unknown }>(node)) return node;
  if (!SIZED_COMPONENTS.get(node.type)?.has(size) || node.props.size !== undefined) return node;
  return React.cloneElement(node, { size });
}

function isGroup(node: React.ReactNode): node is React.ReactElement<ToolbarGroupProps> {
  return React.isValidElement(node) && node.type === ToolbarGroup;
}

/**
 * ToolbarGroup — related controls inside a Toolbar. A `View` with `role="group"` and
 * `accessibilityLabel` from `label`, laid out along the toolbar axis with `itemGap` between its
 * controls. The Toolbar draws a Divider between two adjacent groups.
 */
export function ToolbarGroup({ label, children, ref }: ToolbarGroupProps): React.JSX.Element {
  const layout = React.useContext(ToolbarLayoutContext);
  const outside = layout === null;
  React.useEffect(() => {
    if (__DEV__ && outside) {
      console.warn('ToolbarGroup: render it inside a Toolbar; outside one it has no orientation, wrapping or gap.');
    }
  }, [outside]);
  return (
    <View
      ref={ref}
      role="group"
      accessibilityLabel={label}
      aria-label={label}
      style={layout?.group}
      testID="Toolbar.group"
    >
      {children}
    </View>
  );
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
 * `background` (locked), `border`, `borderWidth`, `radius` and `paddingInline`/`paddingBlock`.
 * Direct children (fragments expanded) and `ToolbarGroup`s are laid out along the axis with
 * `itemGap` (by `density`). Between two adjacent groups the Toolbar renders a
 * `Toolbar.separator` wrapper `separatorLength` long across the axis, padded along it by
 * `groupGap − itemGap` (clamped at 0), holding a `Divider` across the axis with `spacing: none`
 * that stretches to fill it. Sized children (Button, SegmentedControl, Select, Search) without
 * their own `size` receive the toolbar's.
 *
 * `overflow: wrap` wraps rows (columns when vertical). `scroll` — and `menu`, which has no
 * native measurement — puts the controls in a `ScrollView` along the toolbar axis with a
 * react-native-svg gradient `fadeWidth` long from `background` to transparent over each edge
 * that has content hidden past it, re-checked on scroll, layout and content size changes.
 *
 * Acknowledged native limits: no roving focus and no arrow/Home/End handling (Pressable has
 * no key events, react-native-web included) — every control is its own accessibility stop,
 * reached by swipe or by Tab with a hardware keyboard; Enter/Space activation is the control's
 * own. `focusRing`/`focusRingWidth` are applied nowhere: each composed control draws its own
 * ring. The `overflowButton`/`overflowMenu` parts have no element on this platform.
 */
export function Toolbar({
  label,
  children,
  orientation = 'horizontal',
  overflow,
  size = 'md',
  density = 'comfortable',
  overrides,
  ref,
}: ToolbarProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const vertical = orientation === 'vertical';
  // The schema default is `menu`; neither it nor `scroll` can measure here, so both scroll.
  const mode: 'wrap' | 'scroll' = overflow === 'wrap' ? 'wrap' : 'scroll';

  React.useEffect(() => {
    if (__DEV__ && overflow === 'menu' && !warnedMenu) {
      warnedMenu = true;
      console.warn(
        'Toolbar: `overflow="menu"` renders as `overflow="scroll"` on React Native — children are opaque, so nothing can measure them and move trailing controls into a "More" Menu.',
      );
    }
  }, [overflow]);

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
    // groupGap replaces itemGap either side of a separator: the row keeps itemGap, the separator pads the rest.
    const separatorPad = Math.max(0, groupGap - itemGap);

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
      gap: itemGap,
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
      ? { width: separatorLength, paddingVertical: separatorPad, alignSelf: 'center' }
      : { height: separatorLength, paddingHorizontal: separatorPad, flexDirection: 'row', alignSelf: 'center' };
    return { root, row, group, separator, fadeWidth };
  }, [t, overrides, density, vertical, mode]);

  const layout = React.useMemo<ToolbarLayout>(() => ({ group: styles.group }), [styles.group]);

  const content: React.ReactNode[] = [];
  let previousWasGroup = false;
  flattenChildren(children).forEach((node, index) => {
    if (isGroup(node)) {
      if (previousWasGroup) {
        content.push(
          <View key={`separator-${index}`} style={styles.separator} testID="Toolbar.separator">
            <Divider orientation={vertical ? 'horizontal' : 'vertical'} spacing="none" />
          </View>,
        );
      }
      content.push(
        React.cloneElement(node, {
          children: flattenChildren(node.props.children).map((child) => withSize(child, size)),
        }),
      );
      previousWasGroup = true;
    } else {
      content.push(withSize(node, size));
      previousWasGroup = false;
    }
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
    <View
      ref={ref}
      testID="Toolbar"
      accessibilityRole="toolbar"
      accessibilityLabel={label}
      aria-label={label}
      style={styles.root}
    >
      <ToolbarLayoutContext.Provider value={layout}>
        {mode === 'wrap' ? (
          <View style={styles.row} testID="Toolbar.container">
            {content}
          </View>
        ) : (
          <View>
            <ScrollView
              testID="Toolbar.container"
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
      </ToolbarLayoutContext.Provider>
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
    <View style={position} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no">
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
