import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { AccessibilityActionEvent, ListRenderItemInfo, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Heading } from './Heading';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Link } from './Link';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** Heading level of the visible label. The schema's values are quoted digits; numbers are accepted too. Its size is `headingSize` regardless. */
export type TreeHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** A hierarchy entry. `href` makes the label a Link; `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`. */
export type TreeNode = { id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | 'lazy' };

/** The style bindings a caller may replace with a different token; locked bindings are excluded. */
export type TreeOverridableBinding =
  | 'indent'
  | 'rowPaddingInline'
  | 'rowRadius'
  | 'rowGap'
  | 'rowHover'
  | 'labelSelectedWeight'
  | 'headingSize'
  | 'badgeSize'
  | 'guideLine'
  | 'guideLineWidth'
  | 'checkboxGap'
  | 'checkboxSize'
  | 'checkboxBorderWidth'
  | 'checkboxBackground'
  | 'checkboxRadius'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

export interface TreeProps {
  /** What the tree lists ("Folders", "Categories"). The accessible name; visible only with `showLabel`. */
  label: string;
  /** Show the label as a Heading above the tree. */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is headingSize regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /** The hierarchy. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a `"lazy"` node; a lazy id listed explicitly stays closed until the user opens it. */
  defaultExpanded?: string[] | undefined;
  /** `single`: one current node. `multiple`: checkbox-like selection, cascading with `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. Always an array, even in `single` mode. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its enabled loaded descendants and parents show indeterminate. */
  selectChildren?: boolean | undefined;
  /** With `single`, focus reaching a node (hardware keyboard, assistive technology) also selects it. */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with every selected id in tree order, as a bare array, and only when the set changes. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Fired with every expanded id, in the order they were opened, as a bare array. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id each time a node whose `children` is still `"lazy"` is opened, so a failed load can retry. It precedes the `onExpandChange` of the same act. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a node is activated, with its id. Nodes with `href` navigate instead. */
  onActivate?: ((id: string) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  expand: (label: string): string => `Expand ${label}`,
  collapse: (label: string): string => `Collapse ${label}`,
  selectedCount: (count: number): string => `${count} selected`,
  loading: 'Loading',
  empty: 'Nothing here.',
} as const;

const LABEL_SELECTED_WEIGHT: TokenRef = 'font.weight.medium';
const HEADING_SIZE: TokenRef = 'font.size.md';
const BADGE_SIZE: TokenRef = 'font.size.xs';
const FONT_FAMILY: TokenRef = 'font.family.body';
const FONT_SIZE: TokenRef = 'font.size.sm';
const LINE_HEIGHT: TokenRef = 'font.lineHeight.normal';

/** Clips content to one point while keeping it in the accessibility tree (the Android live region). */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const isWeb = Platform.OS === 'web';

/** The DOM node behind a View or Pressable on react-native-web, for the attributes it does not forward. */
type WebElement = {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  querySelector(selectors: string): { setAttribute(name: string, value: string): void } | null;
};

/**
 * Marks a disabled row on react-native-web. Pressable writes `aria-disabled` from its own
 * `disabled` prop, which the press guard deliberately never sets — that would take the row out of
 * the accessibility tree — so the attribute is written on the node instead, as Button and Listbox
 * record. It is also what keeps a dimmed row out of axe's contrast check: WCAG 1.4.3 exempts
 * inactive components, and `opacity.disabled` over `color.foreground` cannot reach 4.5:1.
 */
function markDisabled(instance: ViewInstance | null, disabled: boolean): void {
  if (!isWeb || instance === null) {
    return;
  }
  const node = instance as unknown as WebElement;
  if (disabled) {
    node.setAttribute('aria-disabled', 'true');
  } else {
    node.removeAttribute('aria-disabled');
  }
}

/**
 * Demotes the composed Link inside a node's label out of the tab order on react-native-web, the
 * platform's form of the `tabIndex={-1}` web and lit put on it: the row Pressable follows `href`
 * itself, so the row stays the tab stop and the one target. A widget outside the tab order whose
 * ancestor is in it is also not a target of its own, which is what keeps the short inline anchor
 * out of axe's target-size rule.
 */
function demoteLink(instance: ViewInstance | null): void {
  if (!isWeb || instance === null) {
    return;
  }
  (instance as unknown as WebElement).querySelector('[data-testid="Link"]')?.setAttribute('tabindex', '-1');
}

function tokenOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref === undefined ? fallback : (resolveToken(t, ref) as T);
}

function hasChildren(node: TreeNode): boolean {
  return node.children === 'lazy' || (Array.isArray(node.children) && node.children.length > 0);
}

/** One entry of the flattened visible list; collapsed subtrees never appear here. */
interface FlatNode {
  key: string;
  level: number;
  /** A lazy parent's loading placeholder. */
  placeholder: boolean;
  node: TreeNode;
}

function flattenNodes(nodes: TreeNode[], expanded: Set<string>, level: number, out: FlatNode[] = []): FlatNode[] {
  for (const node of nodes) {
    out.push({ key: node.id, level, placeholder: false, node });
    if (hasChildren(node) && expanded.has(node.id)) {
      if (node.children === 'lazy') {
        out.push({ key: `${node.id}::loading`, level: level + 1, placeholder: true, node });
      } else if (Array.isArray(node.children)) {
        flattenNodes(node.children, expanded, level + 1, out);
      }
    }
  }
  return out;
}

/** Every loaded parent, at any depth — what `["*"]` expands; never a `"lazy"` node. */
function expandableIds(nodes: TreeNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (Array.isArray(node.children) && node.children.length > 0) {
      out.push(node.id);
      expandableIds(node.children, out);
    }
  }
  return out;
}

/** Every node whose children are still `"lazy"`, at any depth: those open on a user act only, so `onExpand` never fires for a caller's id. */
function lazyIds(nodes: TreeNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children === 'lazy') {
      out.push(node.id);
    } else if (Array.isArray(node.children)) {
      lazyIds(node.children, out);
    }
  }
  return out;
}

/** Every loaded, enabled descendant id — the reach of a `selectChildren` cascade. A `"lazy"` subtree contributes nothing until it loads. */
function descendantIds(node: TreeNode, out: string[] = []): string[] {
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.disabled !== true) {
        out.push(child.id);
      }
      descendantIds(child, out);
    }
  }
  return out;
}

/** Every node by id, with its parent and its position in tree (document) order. */
interface NodeEntry {
  node: TreeNode;
  parent: string | undefined;
  order: number;
}

function indexNodes(nodes: TreeNode[], parent: string | undefined, out: Map<string, NodeEntry>): Map<string, NodeEntry> {
  for (const node of nodes) {
    out.set(node.id, { node, parent, order: out.size });
    if (Array.isArray(node.children)) {
      indexNodes(node.children, node.id, out);
    }
  }
  return out;
}

type CheckState = 'checked' | 'unchecked' | 'mixed';

/** The expand control's chevron, rotated over `transition`; instant under reduced motion. */
function Chevron({ expanded, color, duration }: { expanded: boolean; color: string; duration: number }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, { toValue, duration, easing: toEasing(t.motionEasingStandard), useNativeDriver: false }).start();
  }, [expanded, reducedMotion, duration, rotation, t.motionEasingStandard]);
  const style: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
  };
  return (
    <Animated.View style={style}>
      <Icon name="chevron-right" size="sm" color={color} />
    </Animated.View>
  );
}

/**
 * Tree — a list that knows about nesting: a file browser's sidebar, a category
 * picker, a documentation site's navigation. One field per node.
 *
 * When to use: a hierarchy the user navigates or picks from. `single` with `href`
 * nodes is a navigation tree; `multiple` with `selectChildren` is a picker. Not for
 * one level (Listbox, a list of Links), several fields per node (TreeGrid) or a
 * Menu.
 *
 * Native has no tree role: an optional `Heading` (`showLabel`, at `headingLevel`,
 * sized by headingSize) above a `FlatList` (`accessibilityRole="list"`, labelled by
 * `label`) over the flattened visible nodes — groups have no wrapper, collapsed
 * subtrees are absent. Each node is a row: indent per level with one guide line per
 * open ancestor (`showGuides`), a ghost `Button` chevron as the real expand target,
 * then a `Pressable` (`button`, or `link` for `href`) holding the drawn checkbox in
 * `multiple` mode, the `Icon`, the label `Text` (or `Link`) and the badge `Text`.
 * The row announces "{label}, level {n}" with `accessibilityState` expanded,
 * selected, checked (`mixed` for a partly selected cascading parent), disabled and
 * busy (an open lazy parent), and `expand`/`collapse` accessibility actions.
 *
 * A tap is Enter: it activates (`onActivate`, or opens `href` through `Linking`)
 * and, in `single`, selects. In `multiple` a tap toggles selection and a long press
 * activates; the row carries the standard `longpress` accessibility action so a
 * screen reader can still reach activation. `selectOnFocus` selects from the
 * Pressable's `onFocus`. Selection is reported in tree order and only when the set
 * changes; in `multiple` it announces `copy.selectedCount` (iOS
 * `announceForAccessibility`, an Android live region). A `"lazy"` node opens on a
 * user act only — firing `onExpand` every time it opens while still lazy, so a
 * failed load can retry — and shows a `copy.loading` placeholder while its parent
 * reports busy. No arrow keys, `*` or type-ahead on this platform.
 */
export function Tree({
  label,
  showLabel = false,
  headingLevel = '2',
  nodes,
  expanded,
  defaultExpanded,
  selectable = 'single',
  selected,
  defaultSelected,
  selectChildren = false,
  selectOnFocus = false,
  showGuides = true,
  overrides,
  onSelectionChange,
  onExpandChange,
  onExpand,
  onActivate,
  ref,
}: TreeProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  // ---- Bindings ----
  const indent = tokenOr<number>(t, overrides?.indent, t.space5);
  const rowHeight = t.sizeTargetMin;
  const rowPaddingInline = tokenOr<number>(t, overrides?.rowPaddingInline, t.space2);
  const rowRadius = tokenOr<number>(t, overrides?.rowRadius, t.radiusSm);
  const rowGap = tokenOr<number>(t, overrides?.rowGap, t.layoutGapTight);
  const rowHover = tokenOr<string>(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
  const rowSelected = t.colorBackgroundStrong;
  const rowSelectedBorder = t.colorControlSelectedBackground;
  const rowSelectedBorderWidth = t.borderWidthFocus;
  const expandButtonSize = t.sizeTargetMin;
  const guideLine = tokenOr<string>(t, overrides?.guideLine, t.colorBorder);
  const guideLineWidth = tokenOr<number>(t, overrides?.guideLineWidth, t.borderWidthThin);
  const checkboxGap = tokenOr<number>(t, overrides?.checkboxGap, t.layoutGapTight);
  const checkboxSize = tokenOr<number>(t, overrides?.checkboxSize, t.space4);
  const checkboxBorderWidth = tokenOr<number>(t, overrides?.checkboxBorderWidth, t.borderWidthThin);
  const checkboxBackground = tokenOr<string>(t, overrides?.checkboxBackground, t.colorControlBackground);
  const checkboxRadius = tokenOr<number>(t, overrides?.checkboxRadius, t.radiusSm);
  const disabledOpacity = tokenOr<number>(t, overrides?.disabledOpacity, t.opacityDisabled);
  const transition = tokenOr<number>(t, overrides?.transition, t.motionDurationFast);
  const labelSelectedWeight = overrides?.labelSelectedWeight ?? LABEL_SELECTED_WEIGHT;
  const headingSize = overrides?.headingSize ?? HEADING_SIZE;
  const badgeSize = overrides?.badgeSize ?? BADGE_SIZE;
  /**
   * fontFamily/fontSize/lineHeight set the container's type and, resolved the same way (the
   * override when there is one, the token otherwise), are always forwarded to the label Text,
   * so the root and the composed label never disagree.
   */
  const labelTypography = {
    fontFamily: overrides?.fontFamily ?? FONT_FAMILY,
    fontSize: overrides?.fontSize ?? FONT_SIZE,
    lineHeight: overrides?.lineHeight ?? LINE_HEIGHT,
  } satisfies Partial<Record<'fontFamily' | 'fontSize' | 'lineHeight', TokenRef>>;

  /** Parent and tree order for every node, loaded subtrees included. */
  const index = React.useMemo(() => indexNodes(nodes, undefined, new Map<string, NodeEntry>()), [nodes]);

  // ---- Expansion ----
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() => (defaultExpanded?.includes('*') ? expandableIds(nodes) : (defaultExpanded ?? [])));
  const expandedIds = expanded ?? internalExpanded;
  const [openedLazy, setOpenedLazy] = React.useState<string[]>([]);
  const lazySet = React.useMemo(() => new Set(lazyIds(nodes)), [nodes]);
  /** What is actually open: a still-lazy id the caller listed stays shut until the user opens it, so `onExpand` follows a user act. */
  const expandedSet = React.useMemo(
    () => new Set(expandedIds.filter((id) => !lazySet.has(id) || openedLazy.includes(id))),
    [expandedIds, lazySet, openedLazy],
  );

  const commitExpanded = (next: string[]): void => {
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandChange?.(next);
  };

  const toggleExpand = (node: TreeNode): void => {
    if (node.disabled === true) {
      return;
    }
    if (expandedSet.has(node.id)) {
      commitExpanded(expandedIds.filter((id) => id !== node.id));
      return;
    }
    if (node.children === 'lazy') {
      setOpenedLazy((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]));
      onExpand?.(node.id);
    }
    commitExpanded(expandedIds.includes(node.id) ? expandedIds : [...expandedIds, node.id]);
  };

  const visible = React.useMemo(() => flattenNodes(nodes, expandedSet, 1), [nodes, expandedSet]);

  // ---- Selection ----
  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  /** Selected ids as the event reports them: tree (document) order, unknown ids last. */
  const inTreeOrder = (ids: Iterable<string>): string[] =>
    Array.from(ids).sort((a, b) => (index.get(a)?.order ?? Number.MAX_SAFE_INTEGER) - (index.get(b)?.order ?? Number.MAX_SAFE_INTEGER));

  const commitSelection = (next: string[]): void => {
    if (next.length === selectedIds.length && next.every((id) => selectedSet.has(id))) {
      return; // The set did not change: selecting the current node again fires nothing.
    }
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
    // iOS has no live region: the Android region below holds the same string, written by the render.
    if (selectable === 'multiple' && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(COPY.selectedCount(next.length));
    }
  };

  const checkStateOf = (node: TreeNode): CheckState => {
    const own = selectedSet.has(node.id);
    if (!selectChildren) {
      return own ? 'checked' : 'unchecked';
    }
    const ids = descendantIds(node);
    if (ids.length === 0) {
      return own ? 'checked' : 'unchecked';
    }
    const count = ids.filter((id) => selectedSet.has(id)).length;
    if (count === ids.length) {
      return 'checked';
    }
    return count > 0 || own ? 'mixed' : 'unchecked';
  };

  /** A cascading parent's id is in the selection exactly when every enabled loaded descendant is. */
  const syncAncestors = (id: string, next: Set<string>): void => {
    let parent = index.get(id)?.parent;
    while (parent !== undefined) {
      const entry = index.get(parent);
      if (entry === undefined) {
        return;
      }
      const reach = descendantIds(entry.node);
      if (reach.length > 0) {
        if (reach.every((child) => next.has(child))) {
          next.add(parent);
        } else {
          next.delete(parent);
        }
      }
      parent = entry.parent;
    }
  };

  const selectNode = (node: TreeNode): void => {
    commitSelection([node.id]);
  };

  const toggleNode = (node: TreeNode): void => {
    const check = checkStateOf(node) !== 'checked';
    const ids = selectChildren ? [node.id, ...descendantIds(node)] : [node.id];
    const next = new Set(selectedSet);
    for (const id of ids) {
      if (check) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    if (selectChildren) {
      syncAncestors(node.id, next);
    }
    commitSelection(inTreeOrder(next));
  };

  // ---- Activation ----
  const activate = (node: TreeNode): void => {
    if (node.href !== undefined) {
      Promise.resolve(Linking.openURL(node.href)).catch(() => undefined);
      return;
    }
    onActivate?.(node.id);
  };

  /** A tap: toggles in `multiple`; otherwise Enter — selects in `single` and activates. */
  const press = (node: TreeNode): void => {
    if (node.disabled === true) {
      return;
    }
    if (selectable === 'multiple') {
      toggleNode(node);
      return;
    }
    if (selectable === 'single') {
      selectNode(node);
    }
    activate(node);
  };

  const longPress = (node: TreeNode): void => {
    if (node.disabled !== true && selectable === 'multiple') {
      activate(node);
    }
  };

  // ---- Focus and hover ----
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const handleFocus = (node: TreeNode): void => {
    setFocusedId(node.id);
    if (selectOnFocus && selectable === 'single' && node.disabled !== true) {
      selectNode(node);
    }
  };

  // ---- Parts ----
  /** One full-height line per open ancestor, centred on that ancestor's expand button. */
  const guides = (level: number): React.JSX.Element | null =>
    showGuides && level > 1 ? (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {Array.from({ length: level - 1 }, (_, ancestor) => (
          <View
            key={ancestor}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              start: rowPaddingInline + ancestor * indent + (expandButtonSize - guideLineWidth) / 2,
              width: guideLineWidth,
              backgroundColor: guideLine,
            }}
          />
        ))}
      </View>
    ) : null;

  const checkbox = (state: CheckState): React.JSX.Element => (
    <View
      testID="Tree.checkbox"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: checkboxSize,
        height: checkboxSize,
        borderRadius: checkboxRadius,
        borderWidth: checkboxBorderWidth,
        borderColor: state === 'unchecked' ? t.colorControlBorder : t.colorControlSelectedBackground,
        backgroundColor: state === 'unchecked' ? checkboxBackground : t.colorControlSelectedBackground,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {state === 'unchecked' ? null : <Icon name={state === 'mixed' ? 'dash' : 'check'} size="xs" color={t.colorControlSelectedForeground} />}
    </View>
  );

  const renderPlaceholder = (item: FlatNode): React.JSX.Element => (
    <View
      testID="Tree.node"
      role="listitem"
      accessible
      accessibilityLabel={COPY.loading}
      style={{ flexDirection: 'row', alignItems: 'center', minHeight: rowHeight, paddingHorizontal: rowPaddingInline, gap: rowGap }}
    >
      {guides(item.level)}
      <View testID="Tree.indent" style={{ width: (item.level - 1) * indent }} />
      <View style={{ width: expandButtonSize }} />
      <Text size="sm" tone="muted">
        {COPY.loading}
      </Text>
    </View>
  );

  const renderNode = ({ item }: ListRenderItemInfo<FlatNode>): React.JSX.Element => {
    if (item.placeholder) {
      return renderPlaceholder(item);
    }
    const { node, level } = item;
    const parent = hasChildren(node);
    const isExpanded = parent && expandedSet.has(node.id);
    const disabled = node.disabled === true;
    const checkState = selectable === 'multiple' ? checkStateOf(node) : 'unchecked';
    const isSelected = selectable === 'single' ? selectedSet.has(node.id) : selectable === 'multiple' && checkState === 'checked';
    const highlighted = !disabled && hoveredId === node.id;

    const actions: { name: string; label?: string }[] = [];
    if (parent && !disabled) {
      actions.push({ name: 'expand', label: COPY.expand(node.label) }, { name: 'collapse', label: COPY.collapse(node.label) });
    }
    if (selectable === 'multiple' && !disabled) {
      actions.push({ name: 'longpress' });
    }
    const handleAction = (event: AccessibilityActionEvent): void => {
      const action = event.nativeEvent.actionName;
      if ((action === 'expand' && !isExpanded) || (action === 'collapse' && isExpanded)) {
        toggleExpand(node);
      } else if (action === 'longpress') {
        longPress(node);
      }
    };

    return (
      <View
        testID="Tree.node"
        // `accessibilityRole="list"` is a real <ul> on react-native-web and ARIA lets a list own
        // only listitems, so the node — not the row's button — is the list's child, as Table.
        role="listitem"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: rowHeight,
          paddingHorizontal: rowPaddingInline,
          gap: rowGap,
          borderRadius: rowRadius,
          backgroundColor: isSelected ? rowSelected : highlighted ? rowHover : undefined,
          opacity: disabled ? disabledOpacity : 1,
        }}
      >
        {guides(level)}
        {isSelected ? (
          <View accessibilityElementsHidden importantForAccessibility="no" style={{ position: 'absolute', top: 0, bottom: 0, start: 0, width: rowSelectedBorderWidth, backgroundColor: rowSelectedBorder, pointerEvents: 'none' }} />
        ) : null}
        <View testID="Tree.indent" style={{ width: (level - 1) * indent }} />
        <View testID="Tree.expandButton" style={{ width: expandButtonSize, minHeight: expandButtonSize, alignItems: 'center', justifyContent: 'center' }}>
          {parent ? (
            <Button
              label={isExpanded ? COPY.collapse(node.label) : COPY.expand(node.label)}
              variant="ghost"
              size="sm"
              iconOnly
              expanded={isExpanded}
              disabled={disabled}
              leadingIcon={<Chevron expanded={isExpanded} color={t.colorForeground} duration={transition} />}
              onPress={() => toggleExpand(node)}
            />
          ) : null}
        </View>
        <Pressable
          testID="Tree.nodeRow"
          ref={(instance) => {
            markDisabled(instance, disabled);
          }}
          accessibilityRole={node.href !== undefined ? 'link' : 'button'}
          // The label replaces the row's rendered content for a screen reader, so the badge is folded in.
          accessibilityLabel={node.badge === undefined ? `${node.label}, level ${level}` : `${node.label}, ${node.badge}, level ${level}`}
          accessibilityState={{
            disabled,
            expanded: parent ? isExpanded : undefined,
            selected: selectable === 'single' ? isSelected : undefined,
            checked: selectable === 'multiple' ? (checkState === 'mixed' ? 'mixed' : checkState === 'checked') : undefined,
            busy: isExpanded && node.children === 'lazy' ? true : undefined,
          }}
          accessibilityActions={actions.length > 0 ? actions : undefined}
          onAccessibilityAction={actions.length > 0 ? handleAction : undefined}
          onPress={() => press(node)}
          onLongPress={selectable === 'multiple' ? () => longPress(node) : undefined}
          onFocus={() => handleFocus(node)}
          onBlur={() => setFocusedId((prev) => (prev === node.id ? null : prev))}
          onHoverIn={() => setHoveredId(node.id)}
          onHoverOut={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
          onPressIn={() => setHoveredId(node.id)}
          onPressOut={() => setHoveredId((prev) => (prev === node.id ? null : prev))}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: checkboxGap }}
        >
          {selectable === 'multiple' ? checkbox(checkState) : null}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: rowGap }}>
            {node.icon !== undefined ? (
              <View testID="Tree.icon">
                <Icon name={node.icon} size="sm" color={t.colorForegroundMuted} />
              </View>
            ) : null}
            {/*
              The label is always the composed Text (the `label` part). An `href` node nests a
              `tone="inherit"` Link inside it, through the tree-owned `link` view, so the link takes
              the label's font and colour; labelSelectedWeight is not forwarded then, since the row
              itself marks a selected navigation node.
            */}
            <View testID="Tree.label" style={{ flex: 1 }}>
              <Text
                size="sm"
                truncate
                overrides={isSelected && node.href === undefined ? { ...labelTypography, fontWeight: labelSelectedWeight } : labelTypography}
              >
                {node.href !== undefined ? (
                  <View testID="Tree.link" ref={demoteLink}>
                    <Link
                      href={node.href}
                      label={node.label}
                      tone="inherit"
                      onPress={() => {
                        // The row decides: it selects and opens `href` itself, so Link's own hand-off is skipped.
                        press(node);
                        return false;
                      }}
                      onLongPress={selectable === 'multiple' ? () => longPress(node) : undefined}
                    />
                  </View>
                ) : (
                  node.label
                )}
              </Text>
            </View>
            {node.badge !== undefined ? (
              <View testID="Tree.badge">
                <Text size="xs" tone="muted" overrides={{ fontSize: badgeSize }}>
                  {node.badge}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
        {focusedId === node.id ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[StyleSheet.absoluteFill, { borderWidth: t.borderWidthFocus, borderColor: t.colorBorderFocus, borderRadius: rowRadius, pointerEvents: 'none' }]}
          />
        ) : null}
      </View>
    );
  };

  return (
    <View ref={ref} testID="Tree">
      {showLabel ? (
        <View testID="Tree.heading">
          <Heading level={headingLevel} overrides={{ fontSize: headingSize }}>
            {label}
          </Heading>
        </View>
      ) : null}
      <FlatList
        accessibilityRole="list"
        accessibilityLabel={label}
        data={visible}
        extraData={[selectedIds, expandedIds, focusedId, hoveredId, selectable, selectChildren, showGuides]}
        keyExtractor={(item) => item.key}
        renderItem={renderNode}
        ListEmptyComponent={
          <View
            testID="Tree.emptyState"
            role="listitem"
            style={{ minHeight: rowHeight, paddingHorizontal: rowPaddingInline, justifyContent: 'center' }}
          >
            <Text size="sm" tone="muted">
              {COPY.empty}
            </Text>
          </View>
        }
      />
      {selectable === 'multiple' ? (
        // Present from mount and always the current count, so nothing is announced at mount and
        // two selections that read the same ("1 selected") are announced once.
        <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
          <Text size="sm">{COPY.selectedCount(selectedIds.length)}</Text>
        </View>
      ) : null}
    </View>
  );
}
