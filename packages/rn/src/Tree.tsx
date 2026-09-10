import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Linking, Platform, Pressable, View } from 'react-native';
import type { AccessibilityActionEvent, ListRenderItemInfo, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Heading } from './Heading';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** A hierarchy entry. `href` makes the node a link (navigation trees); `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `onExpand`. */
export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string;
  disabled?: boolean;
  href?: string;
  children?: TreeNode[] | 'lazy';
}

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TreeOverridableBinding =
  | 'indent'
  | 'rowHeight'
  | 'rowPaddingInline'
  | 'rowRadius'
  | 'rowGap'
  | 'rowHover'
  | 'rowSelectedBorderWidth'
  | 'labelSelectedWeight'
  | 'badgeSize'
  | 'expandButtonSize'
  | 'guideLine'
  | 'guideLineWidth'
  | 'checkboxGap'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

export interface TreeProps {
  /** What the tree lists ("Folders", "Categories"). The accessible name; visible only with `showLabel`. */
  label: string;
  /** Show `label` as a heading above the tree. */
  showLabel?: boolean;
  /** The hierarchy. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[];
  /** Initially expanded ids; `["*"]` for all. */
  defaultExpanded?: string[];
  /** `single`: one current node. `multiple`: checkbox selection, cascading to descendants when `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable;
  /** Controlled selected ids. */
  selected?: string[];
  /** Initially selected ids. */
  defaultSelected?: string[];
  /** With `multiple`, selecting a parent selects its (loaded) descendants; parents show indeterminate when only some are selected. */
  selectChildren?: boolean;
  /** With `single`, moving focus to a node (an external keyboard, or assistive-technology navigation) also selects it. Off by default. */
  selectOnFocus?: boolean;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef>>;
  /** Fired with the selected ids. */
  onSelectionChange?: (selected: string[]) => void;
  /** Fired with the expanded ids. */
  onExpandChange?: (expanded: string[]) => void;
  /** Fired when a `children: "lazy"` node is expanded for the first time, with its id; the caller loads and replaces `children`. */
  onExpand?: (id: string) => void;
  /** Fired when a node is activated by tap; nodes with `href` navigate instead. */
  onActivate?: (id: string) => void;
}

const COPY = {
  expand: (label: string): string => `Expand ${label}`,
  collapse: (label: string): string => `Collapse ${label}`,
  selectedCount: (count: number): string => `${count} selected`,
  loading: 'Loading',
  empty: 'Nothing here.',
} as const;

/** Visually clips content to 1x1 while keeping it in the accessibility tree, for live-region announcements. */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

function collectAllIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children !== undefined && node.children !== 'lazy') {
      ids.push(...collectAllIds(node.children));
    }
  }
  return ids;
}

function collectLoadedDescendantIds(node: TreeNode): string[] {
  if (node.children === undefined || node.children === 'lazy') {
    return [];
  }
  const ids: string[] = [];
  for (const child of node.children) {
    ids.push(child.id);
    ids.push(...collectLoadedDescendantIds(child));
  }
  return ids;
}

interface TreeVisibleNode {
  key: string;
  node: TreeNode;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  placeholder: boolean;
}

/** Flattens the tree into the visible-row list: what gets rendered, virtualized and counted. Collapsed descendants are not rendered at all. */
function flattenNodes(nodes: TreeNode[], expandedSet: Set<string>, level: number): TreeVisibleNode[] {
  const result: TreeVisibleNode[] = [];
  for (const node of nodes) {
    const hasChildren = node.children !== undefined && (node.children === 'lazy' || node.children.length > 0);
    const isExpanded = hasChildren && expandedSet.has(node.id);
    result.push({ key: node.id, node, level, hasChildren, isExpanded, placeholder: false });
    if (isExpanded) {
      if (node.children === 'lazy') {
        result.push({
          key: `${node.id}::loading`,
          node: { id: `${node.id}::loading`, label: COPY.loading },
          level: level + 1,
          hasChildren: false,
          isExpanded: false,
          placeholder: true,
        });
      } else if (node.children !== undefined) {
        result.push(...flattenNodes(node.children, expandedSet, level + 1));
      }
    }
  }
  return result;
}

interface TreeExpandButtonProps {
  expanded: boolean;
  label: string;
  transitionDuration: number;
  color: string;
  onPress: () => void;
}

/** The expand/collapse control for a node row. Its own component so the chevron rotation can hold an `Animated.Value` per node. */
function TreeExpandButton({ expanded, label, transitionDuration, color, onPress }: TreeExpandButtonProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [expanded, reducedMotion, rotation, transitionDuration, t.motionEasingStandard]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Button
      label={label}
      variant="ghost"
      size="sm"
      iconOnly
      leadingIcon={
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="chevron-right" inline color={color} />
        </Animated.View>
      }
      onPress={onPress}
    />
  );
}

/**
 * Tree — a list that knows about nesting: a file browser's sidebar, a category
 * picker, a documentation site's navigation. One field per node, a chevron to
 * open it, a tap to act on it.
 *
 * When to use: a hierarchy the user navigates or picks from. `single` selection
 * with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a
 * picker (choose folders to sync). Use `TreeGrid` instead when nodes need
 * several comparable fields.
 *
 * There is no `tree`/`treeitem` role on native. Renders an optional `Heading`
 * (`showLabel`) then a `FlatList` (`accessibilityRole="list"`,
 * `accessibilityLabel={label}`) over the flattened visible nodes — collapsing a
 * parent removes its descendants from the list entirely, keeping deep or wide
 * trees cheap until opened. Each row's indent reserves `indent` per level and
 * draws a vertical guide line (`showGuides`) for every open ancestor, aligned
 * with that ancestor's chevron; a `children: "lazy"` node shows one placeholder
 * child in `copy.loading` (and fires `onExpand`) until the caller replaces its
 * children.
 *
 * In `none`/`single` mode the row is a `Pressable` with `accessibilityRole`
 * `"link"` (nodes with `href`, opened through `Linking`) or `"button"`
 * (everything else, calling `onActivate`); `single` also selects the node on
 * activation, and — with `selectOnFocus` — as soon as focus reaches it, since
 * native has no separate "move" and "activate" keys. In `multiple` mode the row
 * has no outer `Pressable`: the `Checkbox` component's own control and label
 * *are* the row's hit target and its visible/accessible name, cascading to
 * loaded descendants and showing indeterminate when `selectChildren` is set.
 * There are no hardware arrow keys, so the chevron `Button` is a real,
 * always-visible touch target, and each row also exposes `expand`/`collapse`
 * `accessibilityActions` for assistive technology. Selection changes in
 * `multiple` mode announce `copy.selectedCount` (`AccessibilityInfo` on iOS, a
 * hidden polite live region on Android).
 */
export function Tree({
  label,
  showLabel = false,
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
}: TreeProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  // ---- tokens ----

  const indentValue = overrides?.indent ? (resolveToken(t, overrides.indent) as number) : t.space5;
  const rowHeightValue = overrides?.rowHeight ? (resolveToken(t, overrides.rowHeight) as number) : t.sizeTargetMin;
  const rowPaddingInlineValue = overrides?.rowPaddingInline ? (resolveToken(t, overrides.rowPaddingInline) as number) : t.space2;
  const rowRadiusValue = overrides?.rowRadius ? (resolveToken(t, overrides.rowRadius) as number) : t.radiusSm;
  const rowGapValue = overrides?.rowGap ? (resolveToken(t, overrides.rowGap) as number) : t.layoutGapTight;
  const rowHoverColor = overrides?.rowHover ? (resolveToken(t, overrides.rowHover) as string) : t.colorActionGhostBackgroundHover;
  const rowSelectedBorderWidthValue = overrides?.rowSelectedBorderWidth ? (resolveToken(t, overrides.rowSelectedBorderWidth) as number) : t.borderWidthFocus;
  const badgeSizeRef: TokenRef = overrides?.badgeSize ?? ('font.size.xs' as TokenRef);
  const labelSelectedWeightRef: TokenRef = overrides?.labelSelectedWeight ?? ('font.weight.medium' as TokenRef);
  const expandButtonSizeValue = overrides?.expandButtonSize ? (resolveToken(t, overrides.expandButtonSize) as number) : t.sizeTargetMin;
  const guideLineColor = overrides?.guideLine ? (resolveToken(t, overrides.guideLine) as string) : t.colorBorder;
  const guideLineWidthValue = overrides?.guideLineWidth ? (resolveToken(t, overrides.guideLineWidth) as number) : t.borderWidthThin;
  const checkboxGapRef: TokenRef = overrides?.checkboxGap ?? ('layout.gap.tight' as TokenRef);
  const disabledOpacityValue = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const typographyOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };
  const badgeOverrides = { ...typographyOverrides, fontSize: badgeSizeRef };

  // `minTarget` is locked: whatever `rowHeight` resolves to, the touch target never drops below it.
  const effectiveRowHeight = Math.max(rowHeightValue, t.sizeTargetMin);
  const targetDeficit = Math.max(0, t.sizeTargetMin - rowHeightValue) / 2;
  const rowHitSlop = targetDeficit > 0 ? { top: targetDeficit, bottom: targetDeficit } : undefined;

  // ---- expansion ----

  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() =>
    defaultExpanded?.includes('*') ? collectAllIds(nodes) : (defaultExpanded ?? []),
  );
  const expandedIds = expanded ?? internalExpanded;
  const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);

  const commitExpanded = (next: string[]): void => {
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandChange?.(next);
  };

  const toggleExpand = (node: TreeNode): void => {
    const isExpandedNow = expandedSet.has(node.id);
    const next = isExpandedNow ? expandedIds.filter((id) => id !== node.id) : [...expandedIds, node.id];
    commitExpanded(next);
    if (!isExpandedNow && node.children === 'lazy') {
      onExpand?.(node.id);
    }
  };

  const nodeAccessibilityAction = (node: TreeNode, isExpanded: boolean) => (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'expand' && !isExpanded) {
      toggleExpand(node);
    } else if (event.nativeEvent.actionName === 'collapse' && isExpanded) {
      toggleExpand(node);
    }
  };

  const visibleNodes = React.useMemo(() => flattenNodes(nodes, expandedSet, 1), [nodes, expandedSet]);

  // ---- selection ----

  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitSelection = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };

  const selectSingle = (id: string): void => commitSelection([id]);

  const toggleMultiple = (node: TreeNode): void => {
    const next = new Set(selectedSet);
    const ids = selectChildren ? [node.id, ...collectLoadedDescendantIds(node)] : [node.id];
    const willSelect = !next.has(node.id);
    ids.forEach((id) => {
      if (willSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
    });
    commitSelection(Array.from(next));
  };

  const checkState = (node: TreeNode, hasChildren: boolean): { checked: boolean; indeterminate: boolean } => {
    const isSelected = selectedSet.has(node.id);
    if (!selectChildren || !hasChildren) {
      return { checked: isSelected, indeterminate: false };
    }
    const descendantIds = collectLoadedDescendantIds(node);
    if (descendantIds.length === 0) {
      return { checked: isSelected, indeterminate: false };
    }
    const selectedDescendants = descendantIds.filter((id) => selectedSet.has(id)).length;
    const allSelected = isSelected && selectedDescendants === descendantIds.length;
    const someSelected = isSelected || selectedDescendants > 0;
    return { checked: allSelected, indeterminate: !allSelected && someSelected };
  };

  const isFirstSelection = React.useRef(true);
  React.useEffect(() => {
    if (selectable !== 'multiple') {
      return;
    }
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(COPY.selectedCount(selectedIds.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length, selectable]);

  // ---- activation & focus ----

  const [focusedId, setFocusedId] = React.useState<string | null>(null);

  const handleActivate = (node: TreeNode): void => {
    if (node.href !== undefined) {
      Linking.openURL(node.href).catch(() => undefined);
    } else {
      onActivate?.(node.id);
    }
  };

  const handleRowPress = (node: TreeNode): void => {
    if (node.disabled) {
      return;
    }
    if (selectable === 'single') {
      selectSingle(node.id);
    }
    handleActivate(node);
  };

  const handleRowFocus = (node: TreeNode): void => {
    setFocusedId(node.id);
    if (selectOnFocus && selectable === 'single' && !node.disabled) {
      selectSingle(node.id);
    }
  };

  const handleRowBlur = (id: string): void => {
    setFocusedId((prev) => (prev === id ? null : prev));
  };

  // ---- parts ----

  const renderIndent = (visible: TreeVisibleNode): React.JSX.Element => {
    const { node, level, hasChildren, isExpanded } = visible;
    const guideOffsets = showGuides ? Array.from({ length: level - 1 }, (_, i) => indentValue * i + expandButtonSizeValue / 2) : [];
    const indentContainerWidth = indentValue * (level - 1) + expandButtonSizeValue;
    return (
      <View style={{ width: indentContainerWidth, height: effectiveRowHeight }} testID="Tree.indent">
        {guideOffsets.map((offset) => (
          <View
            key={offset}
            style={{ position: 'absolute', left: offset, top: 0, bottom: 0, width: guideLineWidthValue, backgroundColor: guideLineColor }}
          />
        ))}
        {hasChildren ? (
          <View style={{ position: 'absolute', left: indentValue * (level - 1), top: 0, bottom: 0, justifyContent: 'center' }} testID="Tree.expandButton">
            <TreeExpandButton
              expanded={isExpanded}
              label={isExpanded ? COPY.collapse(node.label) : COPY.expand(node.label)}
              transitionDuration={transitionDuration}
              color={t.colorForegroundMuted}
              onPress={() => toggleExpand(node)}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderIcon = (node: TreeNode): React.JSX.Element | null =>
    node.icon ? (
      <View testID="Tree.icon">
        <Icon name={node.icon} inline color={t.colorForegroundMuted} />
      </View>
    ) : null;

  const renderBadge = (node: TreeNode): React.JSX.Element | null =>
    node.badge !== undefined ? (
      <View testID="Tree.badge">
        <Text size="xs" tone="muted" overrides={badgeOverrides}>
          {node.badge}
        </Text>
      </View>
    ) : null;

  const renderNode = ({ item }: ListRenderItemInfo<TreeVisibleNode>): React.JSX.Element => {
    if (item.placeholder) {
      const placeholderIndent = indentValue * (item.level - 1) + expandButtonSizeValue;
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: rowGapValue,
            minHeight: effectiveRowHeight,
            paddingHorizontal: rowPaddingInlineValue,
            paddingLeft: placeholderIndent + rowPaddingInlineValue,
          }}
          accessibilityState={{ busy: true }}
          testID="Tree.node"
        >
          <Text size="sm" tone="muted">
            {COPY.loading}
          </Text>
        </View>
      );
    }

    const { node, level, hasChildren, isExpanded } = item;
    const isSelected = selectable !== 'none' && selectedSet.has(node.id);
    const isFocused = focusedId === node.id;
    const nodeCheckState = selectable === 'multiple' ? checkState(node, hasChildren) : null;
    const accessibleLabel = `${node.label}, level ${level}`;

    const contentStyle: ViewStyle = {
      justifyContent: 'center',
      minHeight: effectiveRowHeight,
      paddingHorizontal: rowPaddingInlineValue,
      borderRadius: rowRadiusValue,
      opacity: node.disabled ? disabledOpacityValue : 1,
      borderLeftWidth: isSelected ? rowSelectedBorderWidthValue : 0,
      borderLeftColor: isSelected ? t.colorControlSelectedBackground : 'transparent',
      backgroundColor: isSelected ? t.colorBackgroundStrong : 'transparent',
    };

    if (selectable === 'multiple') {
      return (
        <View style={contentStyle} testID="Tree.node">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rowGapValue }} testID="Tree.nodeRow">
            {renderIndent(item)}
            {renderIcon(node)}
            <View style={{ flex: 1 }} testID="Tree.label">
              <Checkbox
                label={node.label}
                name={`tree-${node.id}`}
                checked={nodeCheckState?.checked ?? false}
                indeterminate={nodeCheckState?.indeterminate ?? false}
                disabled={node.disabled}
                overrides={{ gap: checkboxGapRef }}
                onChange={() => toggleMultiple(node)}
              />
            </View>
            {renderBadge(node)}
          </View>
        </View>
      );
    }

    return (
      <View style={contentStyle} testID="Tree.node">
        <Pressable
          onPress={() => handleRowPress(node)}
          onFocus={() => handleRowFocus(node)}
          onBlur={() => handleRowBlur(node.id)}
          accessibilityRole={node.href !== undefined ? 'link' : 'button'}
          accessibilityLabel={accessibleLabel}
          accessibilityState={{
            disabled: node.disabled,
            selected: selectable !== 'none' ? isSelected : undefined,
            expanded: hasChildren ? isExpanded : undefined,
          }}
          accessibilityActions={hasChildren ? [{ name: 'expand', label: COPY.expand(node.label) }, { name: 'collapse', label: COPY.collapse(node.label) }] : undefined}
          onAccessibilityAction={hasChildren ? nodeAccessibilityAction(node, isExpanded) : undefined}
          hitSlop={rowHitSlop}
          style={({ pressed }) => [
            { flexDirection: 'row', alignItems: 'center', gap: rowGapValue },
            pressed && !node.disabled ? { backgroundColor: rowHoverColor } : null,
            isFocused ? { borderWidth: t.borderWidthFocus, borderColor: t.colorBorderFocus, borderRadius: rowRadiusValue } : null,
          ]}
          testID="Tree.nodeRow"
        >
          {renderIndent(item)}
          {renderIcon(node)}
          <View style={{ flex: 1 }} testID="Tree.label">
            <Text size="sm" truncate weight={isSelected ? 'medium' : 'regular'} overrides={isSelected ? { ...typographyOverrides, fontWeight: labelSelectedWeightRef } : typographyOverrides}>
              {node.label}
            </Text>
          </View>
          {renderBadge(node)}
        </Pressable>
      </View>
    );
  };

  const getItemLayout = (_data: ArrayLike<TreeVisibleNode> | null | undefined, index: number): { length: number; offset: number; index: number } => ({
    length: effectiveRowHeight,
    offset: effectiveRowHeight * index,
    index,
  });

  return (
    <View testID="Tree">
      {showLabel ? <Heading level="2">{label}</Heading> : null}
      <FlatList
        data={visibleNodes}
        keyExtractor={(item) => item.key}
        renderItem={renderNode}
        getItemLayout={getItemLayout}
        accessibilityRole="list"
        accessibilityLabel={label}
        ListEmptyComponent={
          <View style={{ padding: rowPaddingInlineValue }} accessible accessibilityLabel={COPY.empty} testID="Tree.emptyState">
            <Text tone="muted">{COPY.empty}</Text>
          </View>
        }
        testID="Tree.list"
      />
      {selectable === 'multiple' ? (
        <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
          <Text>{COPY.selectedCount(selectedIds.length)}</Text>
        </View>
      ) : null}
    </View>
  );
}
