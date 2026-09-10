import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Heading } from './Heading';
import { Icon, type IconName } from './Icon';
import { Link } from './Link';
import { Text } from './Text';
import './Tree.css';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** A node's children: a loaded subtree, `"lazy"` (loaded on first expand through `onExpand`), or absent (a leaf). */
export type TreeNodeChildren = TreeNode[] | 'lazy';

/** One item in the hierarchy. `id` must be stable — expansion, selection and React keys all use it. */
export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string;
  disabled?: boolean;
  href?: string;
  children?: TreeNodeChildren;
}

/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY = {
  expand: 'Expand {label}',
  collapse: 'Collapse {label}',
  selectedCount: '{count} selected',
  loading: 'Loading',
  empty: 'Nothing here.',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const OVERRIDE_HOOK: Record<TreeOverridableBinding, string> = {
  indent: '--ds-tree-indent',
  rowHeight: '--ds-tree-row-height',
  rowPaddingInline: '--ds-tree-row-padding-inline',
  rowRadius: '--ds-tree-row-radius',
  rowGap: '--ds-tree-row-gap',
  rowHover: '--ds-tree-row-hover',
  rowSelectedBorderWidth: '--ds-tree-row-selected-border-width',
  labelSelectedWeight: '--ds-tree-label-selected-weight',
  badgeSize: '--ds-tree-badge-size',
  expandButtonSize: '--ds-tree-expand-button-size',
  guideLine: '--ds-tree-guide-line',
  guideLineWidth: '--ds-tree-guide-line-width',
  checkboxGap: '--ds-tree-checkbox-gap',
  fontFamily: '--ds-tree-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-tree-font-size',
  lineHeight: '--ds-tree-line-height',
  disabledOpacity: '--ds-tree-disabled-opacity',
  transition: '--ds-tree-transition',
};

function overridesToStyle(overrides: Partial<Record<TreeOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TreeOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}

function nodeHasChildren(node: TreeNode): boolean {
  return node.children === 'lazy' || (Array.isArray(node.children) && node.children.length > 0);
}

interface VisibleNode {
  id: string;
  node: TreeNode;
  level: number;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  parentId: string | null;
  isPlaceholder?: boolean;
}

function flattenTree(nodes: TreeNode[], expandedSet: Set<string>): VisibleNode[] {
  const result: VisibleNode[] = [];
  const walk = (list: TreeNode[], level: number, parentId: string | null) => {
    list.forEach((node, index) => {
      const hasChildren = nodeHasChildren(node);
      result.push({ id: node.id, node, level, posinset: index + 1, setsize: list.length, hasChildren, parentId });
      if (hasChildren && expandedSet.has(node.id)) {
        if (node.children === 'lazy') {
          result.push({
            id: `${node.id}__loading`,
            node,
            level: level + 1,
            posinset: 1,
            setsize: 1,
            hasChildren: false,
            parentId: node.id,
            isPlaceholder: true,
          });
        } else if (Array.isArray(node.children)) {
          walk(node.children, level + 1, node.id);
        }
      }
    });
  };
  walk(nodes, 1, null);
  return result;
}

function collectDescendantIds(node: TreeNode): string[] {
  if (!Array.isArray(node.children)) return [];
  const ids: string[] = [];
  for (const child of node.children) {
    ids.push(child.id, ...collectDescendantIds(child));
  }
  return ids;
}

function collectExpandableIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (nodeHasChildren(node)) ids.push(node.id);
    if (Array.isArray(node.children)) ids.push(...collectExpandableIds(node.children));
  }
  return ids;
}

/** O(n) per call — fine for interaction-driven lookups over the (typically shallow) tree shape. */
function findNode(nodes: TreeNode[], id: string): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (Array.isArray(node.children)) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function nodeCheckedState(node: TreeNode, selectedSet: Set<string>, selectChildren: boolean): 'checked' | 'unchecked' | 'indeterminate' {
  if (!selectChildren) return selectedSet.has(node.id) ? 'checked' : 'unchecked';
  const descendants = collectDescendantIds(node);
  if (descendants.length === 0) return selectedSet.has(node.id) ? 'checked' : 'unchecked';
  const allIds = [node.id, ...descendants];
  const selectedCount = allIds.filter((id) => selectedSet.has(id)).length;
  if (selectedCount === 0) return 'unchecked';
  if (selectedCount === allIds.length) return 'checked';
  return 'indeterminate';
}

export interface TreeProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  label: string;
  /** Show the label as a heading above the tree. */
  showLabel?: boolean;
  /** The hierarchy. `href` makes a node a Link (navigation trees); `badge` is a short trailing count
   * or status; `children: "lazy"` loads on first expand through `onExpand`. */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[];
  /** Initially expanded ids; `["*"]` for all. */
  defaultExpanded?: string[];
  /** `single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like
   * selection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when
   * `selectChildren`. `none`: expand/collapse only. */
  selectable?: TreeSelectable;
  /** Controlled selected ids. */
  selected?: string[];
  /** Initially selected ids. */
  defaultSelected?: string[];
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  selectChildren?: boolean;
  /** With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).
   * Off by default: focus moves, Enter or Space selects. */
  selectOnFocus?: boolean;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef>>;
  /** Fired with the selected ids. */
  onSelectionChange?: (ids: string[]) => void;
  /** Fired with the expanded ids. */
  onExpandChange?: (ids: string[]) => void;
  /** Fired when a lazy node is expanded for the first time, with its id. */
  onExpand?: (id: string) => void;
  /** Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with
   * `href` navigate instead. */
  onActivate?: (id: string) => void;
}

/**
 * Tree — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product
 * categories, an org's departments. `single` selection with `href` nodes is a navigation tree;
 * `multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only
 * when the tree drives a panel beside it and moving through nodes should preview them.
 */
export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  {
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const baseId = `ds-tree${generatedId}`;
  const labelId = `${baseId}-label`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const nodeRefs = useRef(new Map<string, HTMLLIElement>());
  const anchorRefs = useRef(new Map<string, HTMLAnchorElement>());
  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({ buffer: '', timer: null });

  /* ---------- expansion ---------- */
  const isExpandedControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(() =>
    defaultExpanded?.includes('*') ? collectExpandableIds(nodes) : (defaultExpanded ?? []),
  );
  const expandedIds = isExpandedControlled ? (expanded as string[]) : internalExpanded;
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const setExpanded = (next: string[]) => {
    if (!isExpandedControlled) setInternalExpanded(next);
    onExpandChange?.(next);
  };

  const toggleExpand = (id: string) => {
    const next = expandedSet.has(id) ? expandedIds.filter((existing) => existing !== id) : [...expandedIds, id];
    setExpanded(next);
  };

  /* Lazy nodes fire `onExpand` exactly once per expand transition, including ids expanded up front
     through `defaultExpanded={['*']}` or a controlled `expanded` prop. */
  const requestedLazyRef = useRef(new Set<string>());
  useEffect(() => {
    for (const id of expandedIds) {
      if (requestedLazyRef.current.has(id)) continue;
      const found = findNode(nodes, id);
      if (found?.children === 'lazy') {
        requestedLazyRef.current.add(id);
        onExpand?.(id);
      }
    }
  }, [expandedIds, nodes, onExpand]);

  const visible = useMemo(() => flattenTree(nodes, expandedSet), [nodes, expandedSet]);
  const navigable = useMemo(() => visible.filter((v) => !v.isPlaceholder && !v.node.disabled), [visible]);

  /* ---------- selection ---------- */
  const isSelectedControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = isSelectedControlled ? (selected as string[]) : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitSelection = (next: string[]) => {
    if (!isSelectedControlled) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const toggleMultipleSelection = (node: TreeNode) => {
    const ids = selectChildren ? [node.id, ...collectDescendantIds(node)] : [node.id];
    const shouldSelect = nodeCheckedState(node, selectedSet, selectChildren) !== 'checked';
    if (shouldSelect) {
      commitSelection(Array.from(new Set([...selectedIds, ...ids])));
    } else {
      const remove = new Set(ids);
      commitSelection(selectedIds.filter((id) => !remove.has(id)));
    }
  };

  const selectFocused = (v: VisibleNode) => {
    if (v.node.disabled) return;
    if (selectable === 'single') commitSelection([v.id]);
    else if (selectable === 'multiple') toggleMultipleSelection(v.node);
  };

  /* ---------- roving focus ---------- */
  const [focusedId, setFocusedId] = useState<string | undefined>(() => {
    const selectedNavigable = navigable.find((v) => selectedIds.includes(v.id));
    return selectedNavigable?.id ?? navigable[0]?.id;
  });

  const setNodeRef = (nodeId: string) => (el: HTMLLIElement | null) => {
    if (el) nodeRefs.current.set(nodeId, el);
    else nodeRefs.current.delete(nodeId);
  };

  const setAnchorRef = (nodeId: string) => (el: HTMLAnchorElement | null) => {
    if (el) anchorRefs.current.set(nodeId, el);
    else anchorRefs.current.delete(nodeId);
  };

  const focusNode = (id: string) => {
    setFocusedId(id);
    nodeRefs.current.get(id)?.focus();
  };

  const moveFocus = (id: string) => {
    focusNode(id);
    if (selectable === 'single' && selectOnFocus) commitSelection([id]);
  };

  const activateNode = (v: VisibleNode) => {
    if (v.node.disabled) return;
    if (selectable === 'single') commitSelection([v.id]);
    if (v.node.href) anchorRefs.current.get(v.id)?.click();
    else onActivate?.(v.id);
  };

  const expandSiblings = (v: VisibleNode) => {
    const siblingIds = visible.filter((entry) => entry.parentId === v.parentId && entry.hasChildren && !entry.isPlaceholder).map((entry) => entry.id);
    if (siblingIds.length === 0) return;
    setExpanded(Array.from(new Set([...expandedIds, ...siblingIds])));
  };

  /* Type-ahead: buffers keys and jumps to the next visible node whose label starts with them. */
  const handleTypeahead = (char: string, currentIndex: number) => {
    if (navigable.length === 0) return;
    const state = typeaheadRef.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, 500);

    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    for (let offset = 1; offset <= navigable.length; offset++) {
      const candidate = navigable[(startIndex + offset) % navigable.length];
      if (candidate.node.label.toLowerCase().startsWith(state.buffer)) {
        moveFocus(candidate.id);
        return;
      }
    }
    if (state.buffer.length > 1) {
      const single = state.buffer.slice(-1);
      for (let offset = 0; offset < navigable.length; offset++) {
        const candidate = navigable[(startIndex + offset) % navigable.length];
        if (candidate.node.label.toLowerCase().startsWith(single)) {
          state.buffer = single;
          moveFocus(candidate.id);
          return;
        }
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    if (!focusedId) return;
    const currentIndex = navigable.findIndex((v) => v.id === focusedId);
    if (currentIndex === -1) return;
    const current = navigable[currentIndex];

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = navigable[Math.min(currentIndex + 1, navigable.length - 1)];
        if (selectable === 'multiple' && event.shiftKey) {
          focusNode(next.id);
          if (!selectedIds.includes(next.id)) commitSelection([...selectedIds, next.id]);
        } else {
          moveFocus(next.id);
        }
        return;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prev = navigable[Math.max(currentIndex - 1, 0)];
        if (selectable === 'multiple' && event.shiftKey) {
          focusNode(prev.id);
          if (!selectedIds.includes(prev.id)) commitSelection([...selectedIds, prev.id]);
        } else {
          moveFocus(prev.id);
        }
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!current.hasChildren) return;
        if (!expandedSet.has(current.id)) {
          toggleExpand(current.id);
        } else {
          const child = navigable.find((v, i) => i > currentIndex && v.parentId === current.id);
          if (child) moveFocus(child.id);
        }
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (current.hasChildren && expandedSet.has(current.id)) {
          toggleExpand(current.id);
        } else if (current.parentId) {
          moveFocus(current.parentId);
        }
        return;
      }
      case 'Home':
        event.preventDefault();
        moveFocus(navigable[0].id);
        return;
      case 'End':
        event.preventDefault();
        moveFocus(navigable[navigable.length - 1].id);
        return;
      case 'Enter':
        event.preventDefault();
        activateNode(current);
        return;
      case ' ':
        if (selectable !== 'none') {
          event.preventDefault();
          selectFocused(current);
        }
        return;
      case '*':
        event.preventDefault();
        expandSiblings(current);
        return;
      case 'a':
      case 'A':
        if (selectable === 'multiple' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          commitSelection(navigable.map((v) => v.id));
        }
        return;
      default:
        if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          handleTypeahead(event.key, currentIndex);
        }
    }
  };

  const handleRowClick = (v: VisibleNode) => () => {
    if (v.node.disabled) return;
    focusNode(v.id);
    if (selectable !== 'none') selectFocused(v);
  };

  const handleRowDoubleClick = (v: VisibleNode) => () => {
    activateNode(v);
  };

  const renderNode = (node: TreeNode, level: number, posinset: number, setsize: number, parentId: string | null): ReactNode => {
    const hasChildren = nodeHasChildren(node);
    const v: VisibleNode = { id: node.id, node, level, posinset, setsize, hasChildren, parentId };
    const isExpanded = hasChildren && expandedSet.has(node.id);
    const isSelected = selectedSet.has(node.id);
    const checkedState = selectable === 'multiple' ? nodeCheckedState(node, selectedSet, selectChildren) : undefined;
    const isRowSelected = selectable === 'single' ? isSelected : selectable === 'multiple' ? checkedState === 'checked' : false;
    const itemId = `${baseId}-item-${node.id}`;

    const rowClasses = ['ds-tree__row', isRowSelected ? 'ds-tree__row--selected' : null, node.disabled ? 'ds-tree__row--disabled' : null]
      .filter(Boolean)
      .join(' ');
    const labelClasses = ['ds-tree__label', isRowSelected ? 'ds-tree__label--selected' : null].filter(Boolean).join(' ');

    return (
      <li
        key={node.id}
        ref={setNodeRef(node.id)}
        id={itemId}
        role="treeitem"
        aria-level={level}
        aria-setsize={setsize}
        aria-posinset={posinset}
        aria-expanded={hasChildren ? (isExpanded ? 'true' : 'false') : undefined}
        aria-selected={selectable === 'single' ? (isSelected ? 'true' : 'false') : undefined}
        aria-checked={selectable === 'multiple' ? (checkedState === 'indeterminate' ? 'mixed' : checkedState === 'checked' ? 'true' : 'false') : undefined}
        aria-disabled={node.disabled ? 'true' : undefined}
        aria-busy={isExpanded && node.children === 'lazy' ? 'true' : undefined}
        tabIndex={node.id === focusedId ? 0 : -1}
        data-part="node"
        className="ds-tree__node"
        onFocus={() => setFocusedId(node.id)}
      >
        <div
          className={rowClasses}
          data-part="nodeRow"
          onClick={handleRowClick(v)}
          onDoubleClick={handleRowDoubleClick(v)}
        >
          <span
            className="ds-tree__indent"
            data-part="indent"
            aria-hidden="true"
            style={{ inlineSize: `calc(var(--ds-tree-indent) * ${level - 1})` }}
          >
            {showGuides
              ? Array.from({ length: level - 1 }).map((_, ancestorIndex) => (
                  <span
                    key={ancestorIndex}
                    className="ds-tree__guide"
                    style={{ insetInlineStart: `calc(var(--ds-tree-indent) * ${ancestorIndex} + var(--ds-tree-expand-button-size) / 2)` }}
                  />
                ))
              : null}
          </span>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              label={interpolate(isExpanded ? COPY.collapse : COPY.expand, { label: node.label })}
              leadingIcon={
                <Icon name="chevron-right" inline className={isExpanded ? 'ds-tree__expand-icon ds-tree__expand-icon--expanded' : 'ds-tree__expand-icon'} />
              }
              className="ds-tree__expand-button"
              data-part="expandButton"
              tabIndex={-1}
              aria-hidden="true"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation();
                toggleExpand(node.id);
              }}
            />
          ) : (
            <span className="ds-tree__expand-spacer" aria-hidden="true" />
          )}
          {selectable === 'multiple' ? (
            <span className={checkedState === 'unchecked' ? 'ds-tree__checkbox' : 'ds-tree__checkbox ds-tree__checkbox--filled'} data-part="checkbox" aria-hidden="true">
              {checkedState === 'checked' ? <Icon name="check" inline /> : checkedState === 'indeterminate' ? <Icon name="dash" inline /> : null}
            </span>
          ) : null}
          {node.icon ? (
            <span className="ds-tree__icon" data-part="icon" aria-hidden="true">
              <Icon name={node.icon} inline />
            </span>
          ) : null}
          {node.href ? (
            <Link
              ref={setAnchorRef(node.id)}
              href={node.href}
              label={node.label}
              tabIndex={-1}
              className={labelClasses}
              data-part="label"
              onClick={(event) => {
                if (node.disabled) event.preventDefault();
              }}
            />
          ) : (
            <Text element="span" size="sm" className={labelClasses} data-part="label">
              {node.label}
            </Text>
          )}
          {node.badge ? (
            <Text element="span" size="xs" tone="muted" className="ds-tree__badge" data-part="badge">
              {node.badge}
            </Text>
          ) : null}
        </div>
        {isExpanded ? (
          node.children === 'lazy' ? (
            <ul role="group" data-part="group" className="ds-tree__group">
              <li className="ds-tree__loading" data-part="node">
                <div className="ds-tree__row" style={{ paddingInlineStart: `calc(var(--ds-tree-indent) * ${level})` }}>
                  <Text size="sm" tone="muted">
                    {COPY.loading}
                  </Text>
                </div>
              </li>
            </ul>
          ) : Array.isArray(node.children) && node.children.length > 0 ? (
            <ul role="group" data-part="group" className="ds-tree__group">
              {node.children.map((child, index) => renderNode(child, level + 1, index + 1, (node.children as TreeNode[]).length, node.id))}
            </ul>
          ) : null
        ) : null}
      </li>
    );
  };

  const classes = ['ds-tree', className ?? null].filter(Boolean).join(' ');
  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div {...rest} ref={rootRef} data-ds="Tree" data-part="container" className={classes} style={mergedStyle}>
      {showLabel ? (
        <Heading id={labelId} level={2} size="md" className="ds-tree__heading">
          {label}
        </Heading>
      ) : null}
      <ul
        id={baseId}
        role="tree"
        aria-label={showLabel ? undefined : label}
        aria-labelledby={showLabel ? labelId : undefined}
        aria-multiselectable={selectable === 'multiple' ? 'true' : undefined}
        data-part="tree"
        className="ds-tree__list"
        onKeyDown={handleKeyDown}
      >
        {nodes.length === 0 ? (
          <li className="ds-tree__empty" data-part="node">
            <Text tone="muted" size="sm">
              {COPY.empty}
            </Text>
          </li>
        ) : (
          nodes.map((node, index) => renderNode(node, 1, index + 1, nodes.length, null))
        )}
      </ul>
      <div className="ds-tree__visually-hidden" role="status" aria-live="polite">
        {selectable === 'multiple' ? interpolate(COPY.selectedCount, { count: selectedIds.length }) : ''}
      </div>
    </div>
  );
});
