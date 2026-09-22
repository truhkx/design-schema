import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Heading.js';
import './Icon.js';
import './Link.js';
import './Text.js';
import type { IconName } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';

/**
 * A node in the hierarchy. `href` makes the node's label a `ds-link` with `tone="inherit"` nested inside the
 * label Text, so it takes the label's font and colour (navigation trees); `icon` is an Icon glyph (`folder`
 * and `file` exist for the usual case); `badge` is a short trailing count or status; `children: "lazy"` loads
 * on first expand through the `expand` event.
 */
export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNode[] | 'lazy' | undefined;
}

/** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
export type TreeHeadingLevel = '2' | '3' | '4';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** `selection-change` detail: every selected id, in tree (document) order, as a bare array. */
export type TreeSelectionChangeDetail = string[];

/** `expand-change` detail: every expanded id, in the order they were opened, as a bare array. */
export type TreeExpandChangeDetail = string[];

/** `expand` detail: the id of the still-`"lazy"` node that was opened. */
export type TreeExpandDetail = string;

/** `activate` detail: the id of the activated node. */
export type TreeActivateDetail = string;

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
 * `defaultExpanded: ["*"]` — every node whose `children` is a non-empty array, and never a `"lazy"` node.
 * Reserved as that sentinel, so a node whose id is literally `"*"` is never matched by it.
 */
const EXPAND_ALL = '*';

/** `showGuides` defaults true, so its attribute is the negated `hide-guides`. */
const NEGATED_BOOLEAN = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * Style bindings that can be overridden per instance. The accessibility-bearing bindings (rowHeight,
 * rowSelected, rowSelectedBorder, rowSelectedBorderWidth, labelColor, iconColor, badgeColor,
 * expandButtonSize, checkboxBorder, checkboxSelected, checkboxMark, minTarget, focusRing, focusRingWidth)
 * are locked and not in this union.
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

/**
 * `labelSelectedWeight`, `headingSize` and `badgeSize` reach the composed ds-text / ds-heading through their
 * own `overrides` property only, so they carry no `--ds-tree-*` hook: a consumer's CSS on such a hook would
 * not reach the child. Override them through this element's `overrides` instead.
 */
type TreeRootHookBinding = Exclude<TreeOverridableBinding, 'labelSelectedWeight' | 'headingSize' | 'badgeSize'>;

const HOOKS: Record<TreeRootHookBinding, string> = {
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
  fontFamily: '--ds-tree-font-family', // literal-ok: a custom-property hook name, not a font stack
  fontSize: '--ds-tree-font-size',
  lineHeight: '--ds-tree-line-height',
  disabledOpacity: '--ds-tree-disabled-opacity',
  transition: '--ds-tree-transition',
};

/** Defaults of the bindings forwarded to a composed child's `overrides`. */
const LABEL_SELECTED_WEIGHT: TokenRef = 'font.weight.medium';
const HEADING_SIZE: TokenRef = 'font.size.md';
const BADGE_SIZE: TokenRef = 'font.size.xs';
const FONT_FAMILY: TokenRef = 'font.family.body';
const FONT_SIZE: TokenRef = 'font.size.sm';
const LINE_HEIGHT: TokenRef = 'font.lineHeight.normal';
/** iconColor is locked, so it always reaches the composed Icon through its own `overrides`, never as CSS. */
const ICON_COLOR: Partial<Record<'color', TokenRef>> = { color: 'color.foreground.muted' };

let idCounter = 0;

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function hasChildrenOf(node: TreeNode): boolean {
  return node.children === 'lazy' || (Array.isArray(node.children) && node.children.length > 0);
}

function loadedChildren(node: TreeNode): TreeNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

/** Every node in document order, expanded or not. */
function allNodes(nodes: TreeNode[], out: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    out.push(node);
    allNodes(loadedChildren(node), out);
  }
  return out;
}

/**
 * Every enabled loaded descendant. A disabled node is skipped as a target but does not wall off its subtree —
 * the walk carries on through it — and a `"lazy"` subtree contributes nothing until loaded.
 */
function enabledDescendants(node: TreeNode): TreeNode[] {
  return allNodes(loadedChildren(node)).filter((descendant) => descendant.disabled !== true);
}

/** The ids a selection toggle touches: the node, plus its enabled loaded descendants when cascading. */
function cascadeIds(node: TreeNode, cascade: boolean): string[] {
  if (!cascade) return [node.id];
  return [node.id, ...enabledDescendants(node).map((descendant) => descendant.id)];
}

/**
 * With `selectChildren`, a parent's id is in `selected` exactly when all its enabled loaded descendants are,
 * so unchecking any descendant removes it and every ancestor id. A parent with no enabled loaded descendants
 * at all (a still-lazy subtree, or only disabled children) behaves as a leaf and carries just its own id.
 */
function normalizeCascade(nodes: TreeNode[], set: Set<string>): void {
  for (const node of nodes) {
    const children = loadedChildren(node);
    if (children.length === 0) continue;
    normalizeCascade(children, set);
    if (node.disabled === true) continue;
    const descendants = enabledDescendants(node);
    if (descendants.length === 0) continue;
    if (descendants.every((descendant) => set.has(descendant.id))) set.add(node.id);
    else set.delete(node.id);
  }
}

/** One visible (rendered) node, in document order. */
interface VisibleEntry {
  node: TreeNode;
  level: number;
  parentId: string | undefined;
  siblings: TreeNode[];
}

type CheckedState = 'true' | 'false' | 'mixed';

/** What renderNode needs, resolved once per render. */
interface RenderContext {
  expanded: Set<string>;
  selected: Set<string>;
  tabStopId: string | undefined;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  labelWeight: TokenRef;
  badgeSize: TokenRef;
}

/**
 * `<ds-tree>` — Tree (category: navigation, APG pattern: treeview).
 *
 * `<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>` renders a
 * `role="tree"` list of `role="treeitem"` nodes with nested `role="group"` lists. One tab stop with a roving
 * tabindex on the treeitems; arrows move, Enter activates, Space selects.
 *
 * @fires selection-change - Every selected id, in tree order, as a bare array.
 * @fires expand-change - Every expanded id, in the order they were opened, as a bare array.
 * @fires expand - A still-`"lazy"` node was opened, with its bare id; fires before `expand-change`.
 * @fires activate - Enter or double-click on a node without `href`, with its bare id.
 */
@customElement('ds-tree')
export class DsTree extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-tree-indent: var(--space-5);
      --ds-tree-row-padding-inline: var(--space-2);
      --ds-tree-row-radius: var(--radius-sm);
      --ds-tree-row-gap: var(--layout-gap-tight);
      --ds-tree-row-hover: var(--color-action-ghost-background-hover);
      --ds-tree-guide-line: var(--color-border);
      --ds-tree-guide-line-width: var(--border-width-thin);
      --ds-tree-checkbox-gap: var(--layout-gap-tight);
      --ds-tree-checkbox-size: var(--space-4);
      --ds-tree-checkbox-border-width: var(--border-width-thin);
      --ds-tree-checkbox-background: var(--color-control-background);
      --ds-tree-checkbox-radius: var(--radius-sm);
      --ds-tree-font-family: var(--font-family-body);
      --ds-tree-font-size: var(--font-size-sm);
      --ds-tree-line-height: var(--font-line-height-normal);
      --ds-tree-disabled-opacity: var(--opacity-disabled);
      --ds-tree-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='container'] {
      font-family: var(--ds-tree-font-family);
      font-size: var(--ds-tree-font-size);
      line-height: var(--ds-tree-line-height);
      /* labelColor (locked): the tree's own foreground; the label Text keeps its default tone */
      color: var(--color-foreground);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    [data-part='node'] {
      outline: none;
    }

    /* focusRing / focusRingWidth (locked): around the whole node, the chevron included */
    [data-part='node']:focus-visible > [data-part='nodeRow'] {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='nodeRow'] {
      position: relative;
      display: flex;
      align-items: center;
      /* rowHeight / minTarget (locked) */
      min-block-size: var(--size-target-min);
      padding-inline: var(--ds-tree-row-padding-inline);
      border-radius: var(--ds-tree-row-radius);
      cursor: pointer;
      /* transition: the hover fill, with motion.easing.standard */
      transition: background-color var(--ds-tree-transition) var(--motion-easing-standard);
    }

    [data-part='node']:not([aria-disabled='true']) > [data-part='nodeRow']:hover {
      background: var(--ds-tree-row-hover);
    }

    /* rowSelected (locked): the fill on the selected (or checked) node; a mixed parent gets neither */
    [data-part='node'][aria-selected='true'] > [data-part='nodeRow'],
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow'] {
      background: var(--color-background-strong);
    }

    /* rowSelectedBorder / rowSelectedBorderWidth (locked): drawn over the row, so selecting moves nothing */
    [data-part='node'][aria-selected='true'] > [data-part='nodeRow']::before,
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow']::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      border-inline-start: var(--border-width-focus) solid var(--color-control-selected-background);
      pointer-events: none;
    }

    [data-part='node'][aria-disabled='true'] > [data-part='nodeRow'] {
      opacity: var(--ds-tree-disabled-opacity);
      cursor: default;
    }

    /* indent: space.5 per level, reserved on the row itself */
    [data-part='indent'] {
      flex: none;
      inline-size: calc(var(--ds-tree-indent) * var(--ds-tree-level));
    }

    .content {
      display: flex;
      flex: 1;
      align-items: center;
      gap: var(--ds-tree-row-gap);
      min-inline-size: 0;
    }

    /* expandButtonSize (locked): the square the tree reserves around an unmodified ghost Button; the column
       is reserved on leaves too, so labels line up down a level */
    [data-part='expandButton'],
    .expand-spacer {
      flex: none;
      display: inline-grid;
      place-items: center;
      inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
    }

    .chevron {
      display: inline-flex;
      transition: transform var(--ds-tree-transition) var(--motion-easing-standard);
    }

    .chevron[data-expanded] {
      transform: rotate(90deg);
    }

    /* The collapsed chevron is mirrored in RTL; the open one points down in both directions. */
    :host(:dir(rtl)) .chevron {
      transform: scaleX(-1);
    }

    :host(:dir(rtl)) .chevron[data-expanded] {
      transform: rotate(90deg);
    }

    /* checkboxGap: the gap after the checkbox; every other gap in the row is rowGap */
    .main {
      display: flex;
      flex: 1;
      align-items: center;
      gap: var(--ds-tree-checkbox-gap);
      min-inline-size: 0;
    }

    .body {
      display: flex;
      flex: 1;
      align-items: center;
      gap: var(--ds-tree-row-gap);
      min-inline-size: 0;
    }

    /* checkboxSize / checkboxBorderWidth / checkboxBackground / checkboxRadius: the drawn glyph — the
       treeitem itself is the control, so this is never the Checkbox component */
    [data-part='checkbox'] {
      flex: none;
      display: inline-grid;
      place-items: center;
      box-sizing: border-box;
      inline-size: var(--ds-tree-checkbox-size);
      block-size: var(--ds-tree-checkbox-size);
      /* checkboxBorder (locked) */
      border: var(--ds-tree-checkbox-border-width) solid var(--color-control-border);
      border-radius: var(--ds-tree-checkbox-radius);
      background: var(--ds-tree-checkbox-background);
      /* checkboxMark (locked): the check or dash Icon takes this as currentColor */
      color: var(--color-control-selected-foreground);
    }

    /* checkboxSelected (locked): checked or mixed fills border and background alike, so the fill has no
       contrasting edge */
    [data-part='checkbox'][data-state='true'],
    [data-part='checkbox'][data-state='mixed'] {
      border-color: var(--color-control-selected-background);
      background: var(--color-control-selected-background);
    }

    [data-part='icon'],
    [data-part='badge'] {
      flex: none;
    }

    [data-part='label'] {
      min-inline-size: 0;
    }

    [data-part='group'] {
      position: relative;
    }

    /* guideLine / guideLineWidth: one vertical line down the open parent's group, at the centre of that
       parent's chevron — no elbows, no termination at the last child */
    [data-part='group']::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: calc(
        var(--ds-tree-row-padding-inline) + var(--ds-tree-indent) * var(--ds-tree-level) + var(--size-target-min) / 2
      );
      border-inline-start: var(--ds-tree-guide-line-width) solid var(--ds-tree-guide-line);
      pointer-events: none;
    }

    :host([hide-guides]) [data-part='group']::before {
      display: none;
    }

    .placeholder {
      cursor: default;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='nodeRow'],
      .chevron {
        transition: none;
      }
    }
  `;

  /** What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`. */
  @property() accessor label = '';

  /** Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label). */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) accessor showLabel = false;

  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  @property({ type: String, reflect: true, attribute: 'heading-level' })
  accessor headingLevel: TreeHeadingLevel = '2';

  /** The hierarchy. */
  @property({ attribute: false }) accessor nodes: TreeNode[] = [];

  /**
   * Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in
   * `defaultExpanded` — the id stays in the array the caller passed and in what `expand-change` reports, but
   * the node does not render open and fires no `expand`.
   */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array, never a lazy one. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** `single`: one current node. `multiple`: checkbox-like selection. `none`: expand/collapse only. */
  @property({ type: String, reflect: true }) accessor selectable: TreeSelectable = 'single';

  /** Controlled selected ids. Always an array, even in `single` mode (zero or one element). */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** With `single`, moving focus also selects. Off by default: focus moves, Enter or Space selects. */
  @property({ type: Boolean, reflect: true, attribute: 'select-on-focus' }) accessor selectOnFocus = false;

  /** Vertical guide lines under open parents. Defaults true, so the attribute is the negated `hide-guides`. */
  @property({ attribute: 'hide-guides', reflect: true, converter: NEGATED_BOOLEAN }) accessor showGuides = true;

  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<TreeOverridableBinding, TokenRef | undefined>>
    | undefined;

  @state() private accessor internalExpanded: string[] = [];
  /** Lazy ids the user has opened: a lazy id listed in `expanded`/`defaultExpanded` never opens itself. */
  @state() private accessor openedLazy: string[] = [];
  @state() private accessor internalSelected: string[] = [];
  /** The node the roving tabindex is parked on while focus is inside the tree. */
  @state() private accessor focusedId: string | undefined;

  private readonly instanceId = `ds-tree-${++idCounter}`;
  private nodeMapCache: { nodes: TreeNode[]; map: Map<string, TreeNode> } | undefined;
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private warnedLabel = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Tree');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.typeaheadTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalExpanded = [...(this.defaultExpanded ?? [])];
      this.internalSelected = [...(this.defaultSelected ?? [])];
    }
    if (changed.has('overrides')) this.applyOverrides();
  }

  protected override updated(): void {
    void this.demoteComposedLinks();
    if (import.meta.env.DEV && !this.label && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn('<ds-tree> requires a `label`: it names the tree for assistive technology.', this);
    }
  }

  /* ---------- hierarchy ---------- */

  private get nodeById(): Map<string, TreeNode> {
    if (this.nodeMapCache?.nodes !== this.nodes) {
      this.nodeMapCache = { nodes: this.nodes, map: new Map(allNodes(this.nodes).map((node) => [node.id, node])) };
    }
    return this.nodeMapCache.map;
  }

  /** The caller's list with `"*"` resolved to concrete ids; a held-lazy id stays in it and in what is reported. */
  private get expandedIds(): string[] {
    const raw = this.expanded ?? this.internalExpanded;
    const seen = new Set<string>();
    const out: string[] = [];
    const add = (id: string): void => {
      if (seen.has(id)) return;
      seen.add(id);
      out.push(id);
    };
    for (const id of raw) if (id !== EXPAND_ALL) add(id);
    if (raw.includes(EXPAND_ALL)) {
      const walk = (list: TreeNode[]): void => {
        for (const node of list) {
          if (!Array.isArray(node.children) || node.children.length === 0) continue;
          add(node.id);
          walk(node.children);
        }
      };
      walk(this.nodes);
    }
    return out;
  }

  /** What actually renders open: a still-`"lazy"` id waits for the user act that fires `expand`. */
  private get expandedSet(): Set<string> {
    const byId = this.nodeById;
    return new Set(
      this.expandedIds.filter((id) => byId.get(id)?.children !== 'lazy' || this.openedLazy.includes(id)),
    );
  }

  private get selectedIds(): string[] {
    return this.selected ?? this.internalSelected;
  }

  private get selectedSet(): Set<string> {
    return new Set(this.selectedIds);
  }

  private visible(): VisibleEntry[] {
    const open = this.expandedSet;
    const out: VisibleEntry[] = [];
    const walk = (list: TreeNode[], level: number, parentId: string | undefined): void => {
      for (const node of list) {
        out.push({ node, level, parentId, siblings: list });
        if (open.has(node.id)) walk(loadedChildren(node), level + 1, node.id);
      }
    };
    walk(this.nodes, 1, undefined);
    return out;
  }

  /** Visible, enabled nodes: what the arrows, Home/End, type-ahead and Control+A move across. */
  private navigable(): VisibleEntry[] {
    return this.visible().filter((entry) => entry.node.disabled !== true);
  }

  /** Tab lands on the selected node (the first in tree order when several are), else the first node. */
  private get tabStopId(): string | undefined {
    const navigable = this.navigable();
    if (this.focusedId !== undefined && navigable.some((entry) => entry.node.id === this.focusedId)) {
      return this.focusedId;
    }
    const selected = this.selectedSet;
    return navigable.find((entry) => selected.has(entry.node.id))?.node.id ?? navigable[0]?.node.id;
  }

  private itemId(id: string): string {
    return `${this.instanceId}-node-${id}`;
  }

  private itemEl(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(this.itemId(id))}`);
  }

  private nodeIdOf(item: Element): string | undefined {
    const prefix = `${this.instanceId}-node-`;
    return item.id.startsWith(prefix) ? item.id.slice(prefix.length) : undefined;
  }

  /* ---------- expansion ---------- */

  /**
   * `expand` fires each time a still-`"lazy"` node is opened, so a failed load can retry; once the caller
   * replaces `children` it never fires again. It fires before the `expand-change` of the same act.
   */
  private commitExpanded(next: string[], opened: string[]): void {
    const byId = this.nodeById;
    const lazy = opened.filter((id) => byId.get(id)?.children === 'lazy');
    if (lazy.length > 0) {
      this.openedLazy = [...this.openedLazy, ...lazy.filter((id) => !this.openedLazy.includes(id))];
    }
    for (const id of lazy) {
      this.dispatchEvent(new CustomEvent<TreeExpandDetail>('expand', { detail: id, bubbles: true, composed: true }));
    }
    if (this.expanded === undefined) this.internalExpanded = next;
    this.dispatchEvent(
      new CustomEvent<TreeExpandChangeDetail>('expand-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleExpanded(id: string): void {
    const ids = this.expandedIds;
    if (this.expandedSet.has(id)) {
      this.commitExpanded(
        ids.filter((existing) => existing !== id),
        [],
      );
      return;
    }
    // A held-lazy id is already in the array: opening it only marks it opened and fires `expand`.
    this.commitExpanded(ids.includes(id) ? ids : [...ids, id], [id]);
  }

  /* ---------- selection ---------- */

  /**
   * What a node's checkbox shows. Under `selectChildren` it is derived from the node's enabled loaded
   * descendants (mixed when only some are selected); a node with none of those behaves as a leaf.
   */
  private checkedState(node: TreeNode, selected: Set<string>): CheckedState {
    if (this.selectChildren) {
      const descendants = enabledDescendants(node);
      if (descendants.length > 0) {
        const count = descendants.filter((descendant) => selected.has(descendant.id)).length;
        return count === descendants.length ? 'true' : count > 0 ? 'mixed' : 'false';
      }
    }
    return selected.has(node.id) ? 'true' : 'false';
  }

  /** Fires only when the set actually changes, with the ids in tree (document) order. */
  private commitSelection(next: Set<string>): void {
    if (this.selectable === 'multiple' && this.selectChildren) normalizeCascade(this.nodes, next);
    const byId = this.nodeById;
    const ordered = allNodes(this.nodes)
      .map((node) => node.id)
      .filter((id) => next.has(id));
    for (const id of next) if (!byId.has(id)) ordered.push(id);
    const current = this.selectedIds;
    const currentSet = this.selectedSet;
    if (ordered.length === current.length && ordered.every((id) => currentSet.has(id))) return;
    if (this.selected === undefined) this.internalSelected = ordered;
    this.dispatchEvent(
      new CustomEvent<TreeSelectionChangeDetail>('selection-change', {
        detail: ordered,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private selectOnly(id: string): void {
    this.commitSelection(new Set([id]));
  }

  private toggleSelection(node: TreeNode): void {
    const next = new Set(this.selectedIds);
    const ids = cascadeIds(node, this.selectChildren);
    if (this.checkedState(node, this.selectedSet) === 'true') for (const id of ids) next.delete(id);
    else for (const id of ids) next.add(id);
    this.commitSelection(next);
  }

  /** Shift+ArrowDown/Up only ever add — they never remove a node or an ancestor. */
  private addToSelection(node: TreeNode): void {
    const next = new Set(this.selectedIds);
    for (const id of cascadeIds(node, this.selectChildren)) next.add(id);
    this.commitSelection(next);
  }

  /** Space and click: select in single, toggle in multiple, nothing in none. */
  private selectAction(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.selectOnly(node.id);
    else if (this.selectable === 'multiple') this.toggleSelection(node);
  }

  /* ---------- activation ---------- */

  private activate(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.selectOnly(node.id);
    if (node.href !== undefined) {
      // An href node is followed by clicking its composed link, so the page's click routing sees it; it
      // fires no `activate`. The `link` part is the span the tree owns around the ds-link.
      const link = this.itemEl(node.id)?.querySelector<LitElement>('[data-part="link"] ds-link');
      link?.shadowRoot?.querySelector('a')?.click();
      return;
    }
    this.dispatchEvent(
      new CustomEvent<TreeActivateDetail>('activate', { detail: node.id, bubbles: true, composed: true }),
    );
  }

  /* ---------- focus ---------- */

  private focusNode(id: string): void {
    this.focusedId = id;
    this.itemEl(id)?.focus();
  }

  /** Keyboard movement: with single + selectOnFocus, the node is selected as focus lands. */
  private moveTo(entry: VisibleEntry | undefined): void {
    if (!entry) return;
    this.focusNode(entry.node.id);
    if (this.selectable === 'single' && this.selectOnFocus) this.selectOnly(entry.node.id);
  }

  /** Leaving the tree resets the tab stop, so Tab back in lands on the selected node, else the first. */
  private readonly handleTreeFocusOut = (event: FocusEvent): void => {
    const tree = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (!next || !tree.contains(next)) this.focusedId = undefined;
  };

  /* ---------- keyboard ---------- */

  /** Any printable character moves to the next visible node whose label starts with the buffer. */
  private handleTypeahead(char: string, index: number): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, TYPEAHEAD_RESET);
    this.typeaheadBuffer += char.toLowerCase();
    const navigable = this.navigable();
    // A fresh first character searches after the current node; a longer buffer may stay on it.
    const start = this.typeaheadBuffer.length === 1 ? index + 1 : index;
    for (let offset = 0; offset < navigable.length; offset++) {
      const entry = navigable[(start + offset + navigable.length) % navigable.length];
      if (entry && entry.node.label.toLowerCase().startsWith(this.typeaheadBuffer)) {
        this.moveTo(entry);
        return;
      }
    }
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // Keys drive the tree whenever focus is inside a node — the treeitem itself, or a composed control it
    // holds (the chevron Button, an href Link). Both are out of the tab order but still focusable, so a
    // click or an assistive-technology move can land on one, and the tree must keep answering the arrows.
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>('[role="treeitem"]');
    const id = item ? this.nodeIdOf(item) : undefined;
    if (id === undefined) return;
    const navigable = this.navigable();
    const index = navigable.findIndex((entry) => entry.node.id === id);
    const current = navigable[index];
    if (!current) return;
    const node = current.node;
    const multiple = this.selectable === 'multiple';

    // Control or Meta (Cmd on macOS), bound by key code so a non-QWERTY layout still reaches it.
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.code === 'KeyA') {
      if (!multiple) return;
      event.preventDefault();
      // Adds every visible, enabled node; nodes selected inside a collapsed branch stay selected.
      const next = new Set(this.selectedIds);
      for (const entry of navigable) next.add(entry.node.id);
      this.commitSelection(next);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const entry = navigable[event.key === 'ArrowDown' ? index + 1 : index - 1];
        if (!entry) return;
        if (multiple && event.shiftKey) {
          this.focusNode(entry.node.id);
          this.addToSelection(entry.node);
        } else {
          this.moveTo(entry);
        }
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!hasChildrenOf(node)) return;
        if (!this.expandedSet.has(node.id)) {
          this.toggleExpanded(node.id);
        } else {
          const child = loadedChildren(node).find((candidate) => candidate.disabled !== true);
          if (child) this.moveTo(navigable.find((entry) => entry.node.id === child.id));
        }
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (hasChildrenOf(node) && this.expandedSet.has(node.id)) this.toggleExpanded(node.id);
        else if (current.parentId !== undefined) {
          // When the parent is disabled it is not navigable, so focus stays put.
          this.moveTo(navigable.find((entry) => entry.node.id === current.parentId));
        }
        return;
      }
      case 'Home':
        event.preventDefault();
        this.moveTo(navigable[0]);
        return;
      case 'End':
        event.preventDefault();
        this.moveTo(navigable[navigable.length - 1]);
        return;
      case 'Enter':
        event.preventDefault();
        this.activate(node);
        return;
      case ' ':
        if (this.selectable === 'none') return;
        event.preventDefault();
        this.selectAction(node);
        return;
      case '*': {
        event.preventDefault();
        // Every enabled sibling, the focused node included; a lazy sibling opens and fires `expand`.
        const open = this.expandedSet;
        const opened = current.siblings
          .filter((sibling) => sibling.disabled !== true && hasChildrenOf(sibling) && !open.has(sibling.id))
          .map((sibling) => sibling.id);
        if (opened.length === 0) return;
        const ids = this.expandedIds;
        this.commitExpanded([...ids, ...opened.filter((openedId) => !ids.includes(openedId))], opened);
        return;
      }
      default:
        // Type-ahead takes any printable character — letters, digits, punctuation.
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          this.handleTypeahead(event.key, index);
        }
    }
  };

  /* ---------- render ---------- */

  protected override render(): TemplateResult {
    const headingId = `${this.instanceId}-heading`;
    const context: RenderContext = {
      expanded: this.expandedSet,
      selected: this.selectedSet,
      tabStopId: this.tabStopId,
      labelOverrides: {
        fontFamily: this.overrides?.fontFamily ?? FONT_FAMILY,
        fontSize: this.overrides?.fontSize ?? FONT_SIZE,
        lineHeight: this.overrides?.lineHeight ?? LINE_HEIGHT,
      },
      labelWeight: this.overrides?.labelSelectedWeight ?? LABEL_SELECTED_WEIGHT,
      badgeSize: this.overrides?.badgeSize ?? BADGE_SIZE,
    };

    return html`
      <div data-part="container" part="container">
        ${this.showLabel
          ? html`<div id=${headingId} data-part="heading" part="heading">
              <ds-heading
                level=${this.headingLevel}
                size="md"
                .overrides=${{ fontSize: this.overrides?.headingSize ?? HEADING_SIZE }}
                >${this.label}</ds-heading
              >
            </div>`
          : nothing}
        <ul
          role="tree"
          aria-label=${ifDefined(this.showLabel ? undefined : this.label)}
          aria-labelledby=${ifDefined(this.showLabel ? headingId : undefined)}
          aria-multiselectable=${ifDefined(this.selectable === 'multiple' ? 'true' : undefined)}
          @keydown=${this.handleKeydown}
          @focusout=${this.handleTreeFocusOut}
        >
          ${this.nodes.map((node, index) => this.renderNode(node, 1, index + 1, this.nodes.length, context))}
        </ul>
        ${this.nodes.length === 0
          ? html`<ds-text data-part="emptyState" part="emptyState" tone="muted">${COPY.empty}</ds-text>`
          : nothing}
        ${this.selectable === 'multiple'
          ? html`<span class="visually-hidden" role="status"
              >${interpolate(COPY.selectedCount, { count: this.selectedIds.length })}</span
            >`
          : nothing}
      </div>
    `;
  }

  private renderNode(
    node: TreeNode,
    level: number,
    posinset: number,
    setsize: number,
    context: RenderContext,
  ): TemplateResult {
    const parent = hasChildrenOf(node);
    const expanded = parent && context.expanded.has(node.id);
    const checked = this.selectable === 'multiple' ? this.checkedState(node, context.selected) : undefined;
    const selected = this.selectable === 'single' ? context.selected.has(node.id) : checked === 'true';
    const loading = expanded && node.children === 'lazy';
    const children = loadedChildren(node);
    const disabled = node.disabled === true;
    // A node with `href` is marked by the row alone, so the heavier label weight is not forwarded to its Text.
    const labelOverrides =
      selected && node.href === undefined
        ? { ...context.labelOverrides, fontWeight: context.labelWeight }
        : context.labelOverrides;

    return html`
      <li
        id=${this.itemId(node.id)}
        role="treeitem"
        data-part="node"
        part="node"
        style=${styleMap({ '--ds-tree-level': String(level - 1) })}
        aria-level=${level}
        aria-setsize=${setsize}
        aria-posinset=${posinset}
        aria-expanded=${ifDefined(parent ? String(expanded) : undefined)}
        aria-selected=${ifDefined(this.selectable === 'single' ? String(selected) : undefined)}
        aria-checked=${ifDefined(checked)}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(loading ? 'true' : undefined)}
        tabindex=${node.id === context.tabStopId ? '0' : '-1'}
        @focusin=${(event: FocusEvent) => {
          if (event.target === event.currentTarget && !disabled) this.focusedId = node.id;
        }}
      >
        <div
          data-part="nodeRow"
          part="nodeRow"
          @mousedown=${(event: MouseEvent) => {
            if (disabled) event.preventDefault();
          }}
          @click=${(event: MouseEvent) => {
            if (disabled) return;
            this.focusNode(node.id);
            // A double-click toggles once, then activates: the second click does not toggle again.
            if (event.detail >= 2) return;
            this.selectAction(node);
          }}
          @dblclick=${() => this.activate(node)}
        >
          <span data-part="indent" part="indent" aria-hidden="true"></span>
          <span class="content">
            ${parent
              ? html`<span
                  data-part="expandButton"
                  part="expandButton"
                  @mousedown=${(event: MouseEvent) => event.preventDefault()}
                  @click=${(event: MouseEvent) => {
                    event.stopPropagation();
                    // A disabled parent stays closed; the chevron only expands, never selects.
                    if (disabled) return;
                    this.toggleExpanded(node.id);
                    this.focusNode(node.id);
                  }}
                  @dblclick=${(event: MouseEvent) => event.stopPropagation()}
                  @press=${(event: Event) => event.stopPropagation()}
                >
                  <!--
                    Not aria-hidden, though the platform notes ask for it: this is a real <button>, and
                    tabindex="-1" takes it out of the tab order without taking it out of focus, so hiding it
                    would be axe's aria-hidden-focus (the rule TreeGrid's own chevron settled). It stays
                    exposed under copy.expand/collapse; ArrowLeft/Right remain the keyboard path and the
                    treeitem's own aria-expanded is what conveys the state.
                  -->
                  <ds-button
                    variant="ghost"
                    size="sm"
                    icon-only
                    tabindex="-1"
                    ?disabled=${disabled}
                    label=${interpolate(expanded ? COPY.collapse : COPY.expand, { label: node.label })}
                  >
                    <span slot="leading-icon" class="chevron" data-expanded=${ifDefined(expanded ? '' : undefined)}>
                      <ds-icon name="chevron-right" inline></ds-icon>
                    </span>
                  </ds-button>
                </span>`
              : html`<span class="expand-spacer" aria-hidden="true"></span>`}
            <span class="main">
              ${checked !== undefined
                ? html`<span data-part="checkbox" part="checkbox" data-state=${checked} aria-hidden="true">
                    ${checked === 'true'
                      ? html`<ds-icon name="check" inline></ds-icon>`
                      : checked === 'mixed'
                        ? html`<ds-icon name="dash" inline></ds-icon>`
                        : nothing}
                  </span>`
                : nothing}
              <span class="body">
                ${node.icon !== undefined
                  ? html`<ds-icon
                      data-part="icon"
                      part="icon"
                      name=${node.icon}
                      inline
                      .overrides=${ICON_COLOR}
                    ></ds-icon>`
                  : nothing}
                <ds-text data-part="label" part="label" element="span" truncate .overrides=${labelOverrides}
                  >${node.href !== undefined
                    ? html`<span data-part="link" part="link"
                        ><ds-link href=${node.href} label=${node.label} tone="inherit"></ds-link
                      ></span>`
                    : node.label}</ds-text
                >
              </span>
            </span>
            ${node.badge !== undefined
              ? html`<ds-text
                  data-part="badge"
                  part="badge"
                  element="span"
                  tone="muted"
                  .overrides=${{ fontSize: context.badgeSize }}
                  >${node.badge}</ds-text
                >`
              : nothing}
          </span>
        </div>
        ${expanded
          ? html`<ul role="group" data-part="group" part="group">
              ${loading
                ? this.renderLoading(level + 1)
                : children.map((child, index) => this.renderNode(child, level + 1, index + 1, children.length, context))}
            </ul>`
          : nothing}
      </li>`;
  }

  /** The lazy placeholder: a treeitem the arrows never land on, under an `aria-busy` parent. */
  private renderLoading(level: number): TemplateResult {
    return html`<li
      role="treeitem"
      style=${styleMap({ '--ds-tree-level': String(level - 1) })}
      aria-level=${level}
      aria-setsize="1"
      aria-posinset="1"
      aria-disabled="true"
      tabindex="-1"
    >
      <div data-part="nodeRow" class="placeholder">
        <span data-part="indent" aria-hidden="true"></span>
        <span class="content">
          <span class="expand-spacer" aria-hidden="true"></span>
          <ds-text element="span" tone="muted">${COPY.loading}</ds-text>
        </span>
      </div>
    </li>`;
  }

  /**
   * The tree is one tab stop. `ds-button` forwards the host's `tabindex` to its inner `<button>` on its own,
   * but `ds-link` does not, so each composed link's inner `<a>` is demoted after every render — otherwise the
   * tree would have a tab stop per navigation node. A same-value write is skipped.
   */
  private async demoteComposedLinks(): Promise<void> {
    const links = [...this.renderRoot.querySelectorAll<LitElement>('[data-part="link"] ds-link')];
    if (links.length === 0) return;
    await Promise.all(links.map((link) => link.updateComplete));
    for (const link of links) {
      const anchor = link.shadowRoot?.querySelector('a');
      if (anchor && anchor.getAttribute('tabindex') !== '-1') anchor.setAttribute('tabindex', '-1');
    }
  }

  /* ---------- overrides ---------- */

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TreeRootHookBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) this.style.removeProperty(HOOKS[binding]);
      else this.style.setProperty(HOOKS[binding], cssVar(ref));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tree': DsTree;
  }
}
