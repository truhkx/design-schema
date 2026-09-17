import {
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Heading } from './Heading';
import { Icon, type IconName } from './Icon';
import { Link } from './Link';
import { Text } from './Text';
import './Tree.css';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** Heading level of the visible label. Accepts the schema's string values and their numeric equivalents. */
export type TreeHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** A node's children: a loaded subtree, or `"lazy"` (loaded on first expand through `onExpand`). */
export type TreeNodeChildren = TreeNode[] | 'lazy';

/** `TreeNode = { id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | "lazy" }` */
export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNodeChildren | undefined;
}

/** copy.* — used verbatim; `{label}` and `{count}` are replaced with the running values. */
const COPY = {
  expand: 'Expand {label}',
  collapse: 'Collapse {label}',
  selectedCount: '{count} selected',
  loading: 'Loading',
  empty: 'Nothing here.',
} as const;

/** constants.typeaheadReset — how long typed characters accumulate before the buffer clears. */
const TYPEAHEAD_RESET = 500; // literal-ok: constants.typeaheadReset, 500 ms

/**
 * Style bindings that can be overridden per instance; the accessibility-bearing bindings (rowHeight,
 * rowSelected, rowSelectedBorder, rowSelectedBorderWidth, labelColor, iconColor, badgeColor,
 * expandButtonSize, checkboxBorder, checkboxSelected, checkboxMark, minTarget, focusRing,
 * focusRingWidth) are locked and not in this union. `labelSelectedWeight`, `headingSize` and
 * `badgeSize` are forwarded to the composed Text / Heading `overrides` rather than set as hooks.
 */
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

type RootHookBinding = Exclude<TreeOverridableBinding, 'labelSelectedWeight' | 'headingSize' | 'badgeSize'>;

const OVERRIDE_HOOK: Record<RootHookBinding, string> = {
  indent: '--ds-tree-indent',
  rowPaddingInline: '--ds-tree-row-padding-inline',
  rowRadius: '--ds-tree-row-radius',
  rowGap: '--ds-tree-row-gap',
  rowHover: '--ds-tree-row-hover',
  guideLine: '--ds-tree-guide-line',
  guideLineWidth: '--ds-tree-guide-line-width',
  checkboxGap: '--ds-tree-checkbox-gap',
  checkboxSize: '--ds-tree-checkbox-size',
  checkboxBorderWidth: '--ds-tree-checkbox-border-width',
  checkboxBackground: '--ds-tree-checkbox-background',
  checkboxRadius: '--ds-tree-checkbox-radius',
  fontFamily: '--ds-tree-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-tree-font-size',
  lineHeight: '--ds-tree-line-height',
  disabledOpacity: '--ds-tree-disabled-opacity',
  transition: '--ds-tree-transition',
};

function overridesToStyle(overrides: Partial<Record<TreeOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TreeOverridableBinding[]) {
    const hook = (OVERRIDE_HOOK as Partial<Record<TreeOverridableBinding, string>>)[binding];
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function hasChildren(node: TreeNode): boolean {
  return node.children === 'lazy' || (Array.isArray(node.children) && node.children.length > 0);
}

function loadedChildren(node: TreeNode): TreeNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

/** One visible (rendered) node, in document order. */
interface VisibleNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
  siblings: TreeNode[];
}

type CheckedState = 'true' | 'false' | 'mixed';

/** Every node id in document order, expanded or not. */
function allNodes(nodes: TreeNode[], out: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    out.push(node);
    allNodes(loadedChildren(node), out);
  }
  return out;
}

/** The ids a selection toggle touches: the node, plus its enabled descendants when cascading. */
function cascadeIds(node: TreeNode, cascade: boolean): string[] {
  if (!cascade) return [node.id];
  const ids = [node.id];
  for (const descendant of allNodes(loadedChildren(node))) if (!descendant.disabled) ids.push(descendant.id);
  return ids;
}

/** With `selectChildren`, a parent is selected exactly when every enabled child is. */
function normalizeCascade(nodes: TreeNode[], set: Set<string>): void {
  for (const node of nodes) {
    const children = loadedChildren(node);
    if (children.length === 0) continue;
    normalizeCascade(children, set);
    const enabled = children.filter((child) => !child.disabled);
    if (enabled.length === 0 || node.disabled) continue;
    if (enabled.every((child) => set.has(child.id))) set.add(node.id);
    else set.delete(node.id);
  }
}

export interface TreeProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  label: string;
  /** Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label). */
  showLabel?: boolean | undefined;
  /** Heading level of the visible label in the page outline; its size is headingSize regardless. */
  headingLevel?: TreeHeadingLevel | undefined;
  /**
   * The hierarchy. `href` makes a node's label a Link (navigation trees); `icon` is an Icon glyph
   * (`folder` and `file` exist for the usual case); `badge` is a short trailing count or status;
   * `children: "lazy"` loads on first expand through `onExpand`.
   */
  nodes: TreeNode[];
  /** Controlled expanded ids. */
  expanded?: string[] | undefined;
  /** Initially expanded ids; `["*"]` for all. */
  defaultExpanded?: string[] | undefined;
  /**
   * `single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like
   * selection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when
   * `selectChildren`. `none`: expand/collapse only.
   */
  selectable?: TreeSelectable | undefined;
  /** Controlled selected ids. Always an array, even in `single` mode (zero or one element). */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  selectChildren?: boolean | undefined;
  /**
   * With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).
   * Off by default: focus moves, Enter or Space selects.
   */
  selectOnFocus?: boolean | undefined;
  /** Vertical guide lines under open parents. */
  showGuides?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or composed child override) to that token. */
  overrides?: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the selected ids. */
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Fired with the expanded ids. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired when a lazy node is expanded for the first time, with its id. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead. */
  onActivate?: ((id: string) => void) | undefined;
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
export function Tree({
  ref,
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
  ...rest
}: TreeProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const typeahead = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | undefined }>({
    buffer: '',
    timer: undefined,
  });
  const requestedLazy = useRef(new Set<string>());

  const everyNode = useMemo(() => allNodes(nodes), [nodes]);
  const nodeById = useMemo(() => new Map(everyNode.map((node) => [node.id, node])), [everyNode]);

  /* ---------- expansion (controlled or uncontrolled) ---------- */
  const [internalExpanded, setInternalExpanded] = useState<string[]>(() =>
    defaultExpanded?.includes('*')
      ? // `*` opens every loaded parent; lazy nodes wait for a user expand, which is when onExpand fires.
        allNodes(nodes)
          .filter((node) => Array.isArray(node.children) && node.children.length > 0)
          .map((node) => node.id)
      : (defaultExpanded ?? []),
  );
  const expandedIds = expanded ?? internalExpanded;
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const commitExpanded = (next: string[]): void => {
    for (const id of next) {
      if (expandedSet.has(id) || requestedLazy.current.has(id)) continue;
      if (nodeById.get(id)?.children === 'lazy') {
        requestedLazy.current.add(id);
        onExpand?.(id);
      }
    }
    if (expanded === undefined) setInternalExpanded(next);
    onExpandChange?.(next);
  };

  const toggleExpanded = (id: string): void => {
    commitExpanded(expandedSet.has(id) ? expandedIds.filter((existing) => existing !== id) : [...expandedIds, id]);
  };

  /* ---------- visible, navigable nodes ---------- */
  const visible = useMemo(() => {
    const out: VisibleNode[] = [];
    const walk = (list: TreeNode[], level: number, parentId: string | null): void => {
      for (const node of list) {
        out.push({ node, level, parentId, siblings: list });
        if (expandedSet.has(node.id)) walk(loadedChildren(node), level + 1, node.id);
      }
    };
    walk(nodes, 1, null);
    return out;
  }, [nodes, expandedSet]);
  const navigable = useMemo(() => visible.filter((entry) => !entry.node.disabled), [visible]);

  /* ---------- selection (controlled or uncontrolled) ---------- */
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitSelection = (nextSet: Set<string>): void => {
    if (selectable === 'multiple' && selectChildren) normalizeCascade(nodes, nextSet);
    const ordered = everyNode.map((node) => node.id).filter((id) => nextSet.has(id));
    for (const id of nextSet) if (!nodeById.has(id)) ordered.push(id);
    const unchanged = ordered.length === selectedIds.length && ordered.every((id) => selectedSet.has(id));
    if (unchanged) return;
    if (selected === undefined) setInternalSelected(ordered);
    onSelectionChange?.(ordered);
  };

  const selectOnly = (id: string): void => commitSelection(new Set([id]));

  const toggleSelection = (node: TreeNode): void => {
    const next = new Set(selectedIds);
    const ids = cascadeIds(node, selectChildren);
    if (checkedState(node) === 'true') for (const id of ids) next.delete(id);
    else for (const id of ids) next.add(id);
    commitSelection(next);
  };

  const addToSelection = (node: TreeNode): void => {
    const next = new Set(selectedIds);
    for (const id of cascadeIds(node, selectChildren)) next.add(id);
    commitSelection(next);
  };

  /** Space and click: select in single, toggle in multiple, nothing in none. */
  const selectAction = (node: TreeNode): void => {
    if (node.disabled) return;
    if (selectable === 'single') selectOnly(node.id);
    else if (selectable === 'multiple') toggleSelection(node);
  };

  const checkedMemo = new Map<string, CheckedState>();
  function checkedState(node: TreeNode): CheckedState {
    const cached = checkedMemo.get(node.id);
    if (cached) return cached;
    let state: CheckedState = selectedSet.has(node.id) ? 'true' : 'false';
    const children = loadedChildren(node).filter((child) => !child.disabled);
    if (selectChildren && children.length > 0) {
      const states = children.map((child) => checkedState(child));
      if (states.every((s) => s === 'true')) state = 'true';
      else if (states.some((s) => s !== 'false')) state = 'mixed';
      else state = 'false';
    }
    checkedMemo.set(node.id, state);
    return state;
  }

  /* ---------- roving tabindex ---------- */
  const [focusedId, setFocusedId] = useState<string | undefined>(undefined);
  const tabStopId =
    (focusedId !== undefined && navigable.some((entry) => entry.node.id === focusedId) ? focusedId : undefined) ??
    navigable.find((entry) => selectedSet.has(entry.node.id))?.node.id ??
    navigable[0]?.node.id;

  const focusNode = (id: string): void => {
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  };

  /** Keyboard focus movement: with single + selectOnFocus, the node is selected as focus lands. */
  const moveTo = (entry: VisibleNode | undefined): void => {
    if (!entry) return;
    focusNode(entry.node.id);
    if (selectable === 'single' && selectOnFocus) selectOnly(entry.node.id);
  };

  const activate = (node: TreeNode): void => {
    if (node.disabled) return;
    if (selectable === 'single') selectOnly(node.id);
    if (node.href) {
      // The link part is a span the tree owns; the anchor Link renders inside it.
      itemRefs.current.get(node.id)?.querySelector<HTMLAnchorElement>('[data-part="link"] a')?.click();
    } else {
      onActivate?.(node.id);
    }
  };

  const handleTypeahead = (char: string, index: number): void => {
    const state = typeahead.current;
    if (state.timer !== undefined) clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      state.buffer = '';
      state.timer = undefined;
    }, TYPEAHEAD_RESET);
    state.buffer += char.toLowerCase();
    // A fresh first character searches after the current node; a longer buffer may stay on it.
    const start = state.buffer.length === 1 ? index + 1 : index;
    for (let offset = 0; offset < navigable.length; offset++) {
      const entry = navigable[(start + offset) % navigable.length];
      if (entry && entry.node.label.toLowerCase().startsWith(state.buffer)) {
        moveTo(entry);
        return;
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>): void => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'treeitem') return;
    const index = navigable.findIndex((entry) => itemRefs.current.get(entry.node.id) === target);
    const current = navigable[index];
    if (!current) return;
    const { node } = current;
    const multiple = selectable === 'multiple';

    // Control or Meta (Cmd on macOS), bound by key code so a non-QWERTY layout still reaches it.
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.code === 'KeyA') {
      if (!multiple) return;
      event.preventDefault();
      const next = new Set(selectedIds);
      for (const entry of navigable) next.add(entry.node.id);
      commitSelection(next);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const entry = navigable[event.key === 'ArrowDown' ? index + 1 : index - 1];
        if (!entry) return;
        if (multiple && event.shiftKey) {
          focusNode(entry.node.id);
          addToSelection(entry.node);
        } else {
          moveTo(entry);
        }
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!hasChildren(node)) return;
        if (!expandedSet.has(node.id)) {
          toggleExpanded(node.id);
        } else {
          const child = loadedChildren(node).find((candidate) => !candidate.disabled);
          if (child) moveTo(navigable.find((entry) => entry.node.id === child.id));
        }
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (hasChildren(node) && expandedSet.has(node.id)) toggleExpanded(node.id);
        else if (current.parentId !== null) moveTo(navigable.find((entry) => entry.node.id === current.parentId));
        return;
      }
      case 'Home':
        event.preventDefault();
        moveTo(navigable[0]);
        return;
      case 'End':
        event.preventDefault();
        moveTo(navigable[navigable.length - 1]);
        return;
      case 'Enter':
        event.preventDefault();
        activate(node);
        return;
      case ' ':
        if (selectable === 'none') return;
        event.preventDefault();
        selectAction(node);
        return;
      case '*': {
        event.preventDefault();
        // Every enabled sibling, the focused node included; a lazy sibling opens and fires onExpand.
        const openable = current.siblings.filter(
          (sibling) => !sibling.disabled && hasChildren(sibling) && !expandedSet.has(sibling.id),
        );
        if (openable.length > 0) commitExpanded([...expandedIds, ...openable.map((sibling) => sibling.id)]);
        return;
      }
      default:
        // Type-ahead takes any printable character — letters, digits, punctuation.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          handleTypeahead(event.key, index);
        }
    }
  };

  const handleTreeBlur = (event: ReactFocusEvent<HTMLUListElement>): void => {
    // Leaving the tree resets the tab stop, so Tab back in lands on the selected node, else the first.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusedId(undefined);
  };

  /* ---------- render ---------- */
  const labelWeight: TokenRef = overrides?.labelSelectedWeight ?? 'font.weight.medium';
  const badgeSize: TokenRef = overrides?.badgeSize ?? 'font.size.xs';
  const headingSize: TokenRef = overrides?.headingSize ?? 'font.size.md';
  /** fontFamily / fontSize / lineHeight reach the label through the composed Text's own overrides. */
  const labelTextOverrides = {
    fontFamily: overrides?.fontFamily ?? 'font.family.body',
    fontSize: overrides?.fontSize ?? 'font.size.sm',
    lineHeight: overrides?.lineHeight ?? 'font.lineHeight.normal',
  } satisfies Partial<Record<'fontFamily' | 'fontSize' | 'lineHeight', TokenRef>>;

  const renderNode = (node: TreeNode, level: number, posinset: number, setsize: number): ReactNode => {
    const parent = hasChildren(node);
    const isExpanded = parent && expandedSet.has(node.id);
    const checked = selectable === 'multiple' ? checkedState(node) : undefined;
    const isSelected = selectable === 'single' ? selectedSet.has(node.id) : checked === 'true';
    const loading = isExpanded && node.children === 'lazy';
    const children = loadedChildren(node);

    const rowClasses = ['ds-tree__row', isSelected ? 'ds-tree__row--selected' : null, node.disabled ? 'ds-tree__row--disabled' : null]
      .filter(Boolean)
      .join(' ');

    return (
      <li
        key={node.id}
        ref={(el) => {
          if (el) itemRefs.current.set(node.id, el);
          else itemRefs.current.delete(node.id);
        }}
        id={`${baseId}-node-${node.id}`}
        role="treeitem"
        data-part="node"
        className="ds-tree__node"
        style={{ '--ds-tree-level': level - 1 } as CSSProperties}
        aria-level={level}
        aria-setsize={setsize}
        aria-posinset={posinset}
        aria-expanded={parent ? isExpanded : undefined}
        aria-selected={selectable === 'single' ? isSelected : undefined}
        aria-checked={checked}
        aria-disabled={node.disabled ? true : undefined}
        aria-busy={loading ? true : undefined}
        tabIndex={node.id === tabStopId ? 0 : -1}
        onFocus={(event) => {
          if (event.target === event.currentTarget && !node.disabled) setFocusedId(node.id);
        }}
      >
        <div
          className={rowClasses}
          data-part="nodeRow"
          onMouseDown={(event: ReactMouseEvent) => {
            if (node.disabled) event.preventDefault();
          }}
          onClick={(event: ReactMouseEvent) => {
            if (node.disabled) return;
            focusNode(node.id);
            // A double-click toggles once, then activates: the second click does not toggle again.
            if (event.detail >= 2) return;
            selectAction(node);
          }}
          onDoubleClick={() => activate(node)}
        >
          <span className="ds-tree__indent" data-part="indent" aria-hidden="true" />
          <span className="ds-tree__content">
            {parent ? (
              <span
                className="ds-tree__expand"
                data-part="expandButton"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.stopPropagation();
                  // A disabled parent stays closed; the chevron only expands, never selects.
                  if (node.disabled) return;
                  toggleExpanded(node.id);
                  focusNode(node.id);
                }}
                onDoubleClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  label={interpolate(isExpanded ? COPY.collapse : COPY.expand, { label: node.label })}
                  leadingIcon={
                    <span className={isExpanded ? 'ds-tree__chevron ds-tree__chevron--expanded' : 'ds-tree__chevron'}>
                      <Icon name="chevron-right" inline />
                    </span>
                  }
                  disabled={node.disabled ?? false}
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </span>
            ) : (
              <span className="ds-tree__expand" aria-hidden="true" />
            )}
            <span className="ds-tree__main">
              {checked !== undefined ? (
                <span
                  className={checked === 'false' ? 'ds-tree__checkbox' : 'ds-tree__checkbox ds-tree__checkbox--checked'}
                  data-part="checkbox"
                  aria-hidden="true"
                >
                  {checked === 'true' ? <Icon name="check" inline /> : checked === 'mixed' ? <Icon name="dash" inline /> : null}
                </span>
              ) : null}
              <span className="ds-tree__body">
                {node.icon ? (
                  <span className="ds-tree__icon" aria-hidden="true">
                    {/* iconColor is locked, so it always reaches the composed Icon as its own override. */}
                    <Icon data-part="icon" name={node.icon} inline overrides={{ color: 'color.foreground.muted' }} />
                  </span>
                ) : null}
                <span className="ds-tree__label">
                  {/*
                    The label is always the composed Text (the `label` part). An `href` node nests a
                    `tone="inherit"` Link inside it — through the tree-owned `link` span, since Link
                    keeps its own data-part="anchor" — so the link takes the label's font and colour.
                    labelSelectedWeight is not forwarded then: the row marks a selected navigation node.
                  */}
                  <Text
                    data-part="label"
                    element="span"
                    truncate
                    overrides={
                      isSelected && node.href === undefined ? { ...labelTextOverrides, fontWeight: labelWeight } : labelTextOverrides
                    }
                  >
                    {node.href ? (
                      <span className="ds-tree__link" data-part="link">
                        <Link href={node.href} label={node.label} tone="inherit" tabIndex={-1} />
                      </span>
                    ) : (
                      node.label
                    )}
                  </Text>
                </span>
              </span>
            </span>
            {node.badge ? (
              <Text data-part="badge" element="span" tone="muted" overrides={{ fontSize: badgeSize }}>
                {node.badge}
              </Text>
            ) : null}
          </span>
        </div>
        {isExpanded ? (
          <ul role="group" data-part="group" className="ds-tree__group">
            {loading ? (
              <li
                role="treeitem"
                className="ds-tree__node"
                style={{ '--ds-tree-level': level } as CSSProperties}
                aria-level={level + 1}
                aria-setsize={1}
                aria-posinset={1}
                aria-disabled
                tabIndex={-1}
              >
                <div className="ds-tree__row ds-tree__row--placeholder">
                  <span className="ds-tree__indent" aria-hidden="true" />
                  <span className="ds-tree__content">
                    <span className="ds-tree__expand" aria-hidden="true" />
                    <Text element="span" tone="muted">
                      {COPY.loading}
                    </Text>
                  </span>
                </div>
              </li>
            ) : (
              children.map((child, childIndex) => renderNode(child, level + 1, childIndex + 1, children.length))
            )}
          </ul>
        ) : null}
      </li>
    );
  };

  const rootClasses = ['ds-tree', showGuides ? null : 'ds-tree--hide-guides'].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="Tree"
      data-part="container"
      className={rootClasses}
      style={overrides ? overridesToStyle(overrides) : undefined}
    >
      {showLabel ? (
        <div className="ds-tree__heading" data-part="heading">
          <Heading id={headingId} level={headingLevel} size="md" overrides={{ fontSize: headingSize }}>
            {label}
          </Heading>
        </div>
      ) : null}
      <ul
        role="tree"
        className="ds-tree__tree"
        aria-label={showLabel ? undefined : label}
        aria-labelledby={showLabel ? headingId : undefined}
        aria-multiselectable={selectable === 'multiple' ? true : undefined}
        onKeyDown={handleKeyDown}
        onBlur={handleTreeBlur}
      >
        {nodes.map((node, index) => renderNode(node, 1, index + 1, nodes.length))}
      </ul>
      {nodes.length === 0 ? (
        <Text data-part="emptyState" tone="muted">
          {COPY.empty}
        </Text>
      ) : null}
      {selectable === 'multiple' ? (
        <span className="ds-tree__visually-hidden" role="status" aria-live="polite">
          {interpolate(COPY.selectedCount, { count: selectedIds.length })}
        </span>
      ) : null}
    </div>
  );
}
