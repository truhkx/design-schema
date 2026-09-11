import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult, type CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';
import './Text.js';
import './Link.js';
import './Heading.js';
import type { IconName } from './Icon.js';

/** A node in the hierarchy. `id` must be stable across renders. `href` makes the node a Link (navigation trees);
    `badge` is a short trailing count or status; `children: "lazy"` marks a node whose children load on first
    expand through `onExpand` — the row shows the expand button and a loading placeholder until `nodes` is
    updated with a real array for that node. */
export interface TreeNode {
  id: string;
  label: string;
  icon?: IconName | undefined;
  badge?: string | undefined;
  disabled?: boolean | undefined;
  href?: string | undefined;
  children?: TreeNode[] | 'lazy' | undefined;
}

export type TreeHeadingLevel = '2' | '3' | '4';

export type TreeSelectable = 'none' | 'single' | 'multiple';

/** Detail carried by the `selection-change` CustomEvent: the new array of selected ids. */
export type TreeSelectionChangeDetail = string[];

/** Detail carried by the `expand-change` CustomEvent: the new array of expanded ids. */
export type TreeExpandChangeDetail = string[];

/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` node being expanded. */
export type TreeExpandDetail = string;

/** Detail carried by the `activate` CustomEvent: the id of the activated node (not fired for `href` nodes, which navigate instead). */
export type TreeActivateDetail = string;

/* copy.* — used verbatim */
const COPY_EXPAND = (label: string): string => `Expand ${label}`;
const COPY_COLLAPSE = (label: string): string => `Collapse ${label}`;
const COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing here.';

/** How long a typed-character run is remembered for typeahead before it resets. Not a design token — an interaction timing, not a motion one. */
const TYPEAHEAD_RESET_MS = 500;

/** Negates a boolean attribute: the attribute present means the property is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `rowSelected`, `rowSelectedBorder`, `labelColor`,
    `iconColor`, `badgeColor`, `checkboxBorder`, `checkboxSelected`, `checkboxMark`, `minTarget`, `focusRing` and
    `focusRingWidth` are accessibility-bearing and locked (excluded). */
export type TreeOverridableBinding =
  | 'indent'
  | 'rowHeight'
  | 'rowPaddingInline'
  | 'rowRadius'
  | 'rowGap'
  | 'rowHover'
  | 'rowSelectedBorderWidth'
  | 'labelSelectedWeight'
  | 'headingSize'
  | 'badgeSize'
  | 'expandButtonSize'
  | 'guideLine'
  | 'guideLineWidth'
  | 'checkboxGap'
  | 'checkboxSize'
  | 'checkboxBackground'
  | 'checkboxRadius'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<TreeOverridableBinding, string> = {
  indent: '--ds-tree-indent',
  rowHeight: '--ds-tree-row-height',
  rowPaddingInline: '--ds-tree-row-padding-inline',
  rowRadius: '--ds-tree-row-radius',
  rowGap: '--ds-tree-row-gap',
  rowHover: '--ds-tree-row-hover',
  rowSelectedBorderWidth: '--ds-tree-row-selected-border-width',
  labelSelectedWeight: '--ds-tree-label-selected-weight',
  headingSize: '--ds-tree-heading-size',
  badgeSize: '--ds-tree-badge-size',
  expandButtonSize: '--ds-tree-expand-button-size',
  guideLine: '--ds-tree-guide-line',
  guideLineWidth: '--ds-tree-guide-line-width',
  checkboxGap: '--ds-tree-checkbox-gap',
  checkboxSize: '--ds-tree-checkbox-size',
  checkboxBackground: '--ds-tree-checkbox-background',
  checkboxRadius: '--ds-tree-checkbox-radius',
  fontFamily: '--ds-tree-font-family',
  fontSize: '--ds-tree-font-size',
  lineHeight: '--ds-tree-line-height',
  disabledOpacity: '--ds-tree-disabled-opacity',
  transition: '--ds-tree-transition',
};

let idCounter = 0;
function nextTreeId(): string {
  idCounter += 1;
  return `ds-tree-${idCounter}`;
}

/** A node flattened out of the hierarchy for rendering and keyboard navigation. */
interface VisibleEntry {
  node: TreeNode;
  level: number;
  parentId?: string | undefined;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  lazy: boolean;
}

/**
 * `<ds-tree>` — Tree (category: navigation, APG pattern: treeview).
 *
 * `<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>` renders a
 * `role="tree"` of `role="treeitem"` nodes, each nesting a `role="group"` list of children. One tab stop with a
 * roving tabindex; the treeitem itself (not the row) carries real DOM focus. `children: "lazy"` nodes fire
 * `expand` on first open and show `copy.loading` until the caller replaces `children` with a real array.
 *
 * ## When to use
 *
 * Use a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product categories.
 * `single` selection with `href` nodes is a navigation tree; `multiple` with `selectChildren` is a picker.
 *
 * @fires selection-change - Fired with the array of selected ids.
 * @fires expand-change - Fired with the array of expanded ids.
 * @fires expand - Fired with the id of a `children: "lazy"` node being expanded; the caller loads and replaces `children`.
 * @fires activate - Fired on Enter or double-click on a node, with its id. Nodes with `href` navigate instead.
 * @csspart heading - The composed `<ds-heading>` shown when `showLabel` (anatomy: heading).
 * @csspart container - The `role="tree"` root list (anatomy: container).
 * @csspart node - Each `role="treeitem"` (anatomy: node).
 * @csspart node-row - The node's visible row (anatomy: nodeRow).
 * @csspart expand-button - The composed `<ds-button>` toggling a parent's children (anatomy: expandButton).
 * @csspart indent - The per-level indent/guide-line spacer (anatomy: indent).
 * @csspart icon - The composed `<ds-icon>` for a node's `icon` (anatomy: icon).
 * @csspart label - The composed `<ds-text>` label of a node without `href` (anatomy: label).
 * @csspart link - The composed `<ds-link>` label of a node with `href` (anatomy: link).
 * @csspart badge - The composed `<ds-text>` badge (anatomy: badge).
 * @csspart checkbox - The drawn checkbox glyph in `multiple` mode (anatomy: checkbox).
 * @csspart group - A nested `role="group"` list of children (anatomy: group).
 * @csspart empty-state - The composed `<ds-text>` shown when `nodes` is empty (anatomy: emptyState).
 */
@customElement('ds-tree')
export class DsTree extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--ds-tree-font-family);
      font-size: var(--ds-tree-font-size);
      line-height: var(--ds-tree-line-height);
      /* labelColor: color.foreground, locked */
      color: var(--color-foreground);
      --ds-tree-indent: var(--space-5);
      --ds-tree-row-height: var(--size-target-min);
      --ds-tree-row-padding-inline: var(--space-2);
      --ds-tree-row-radius: var(--radius-sm);
      --ds-tree-row-gap: var(--layout-gap-tight);
      --ds-tree-row-hover: var(--color-action-ghost-background-hover);
      --ds-tree-row-selected-border-width: var(--border-width-focus);
      --ds-tree-label-selected-weight: var(--font-weight-medium);
      --ds-tree-heading-size: var(--font-size-md);
      --ds-tree-badge-size: var(--font-size-xs);
      --ds-tree-expand-button-size: var(--size-target-min);
      --ds-tree-guide-line: var(--color-border);
      --ds-tree-guide-line-width: var(--border-width-thin);
      --ds-tree-checkbox-gap: var(--layout-gap-tight);
      --ds-tree-checkbox-size: var(--space-4);
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

    /* headingSize forwards into ds-heading's own hook; margin trimmed to the tighter tree-heading gap */
    .tree-heading {
      --ds-heading-font-size: var(--ds-tree-heading-size);
      --ds-heading-margin-block-end: var(--space-2);
    }

    ul.tree,
    ul.group {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .tree {
      outline: none;
    }

    li[role='treeitem'] {
      outline: none;
    }

    li[role='treeitem']:focus-visible > .node-row {
      /* focusRing / focusRingWidth: locked */
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .node-row {
      display: flex;
      align-items: center;
      gap: var(--ds-tree-row-gap);
      block-size: var(--ds-tree-row-height);
      /* minTarget: locked floor so a row can never render shorter than the accessible touch target */
      min-block-size: var(--size-target-min);
      padding-inline: var(--ds-tree-row-padding-inline);
      border-radius: var(--ds-tree-row-radius);
      cursor: pointer;
      transition: background-color var(--ds-tree-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .node-row,
      .expand-icon {
        transition: none;
      }
    }

    li[aria-disabled='true'] .node-row {
      opacity: var(--ds-tree-disabled-opacity);
      cursor: default;
      pointer-events: none;
    }

    .node-row:hover {
      background: var(--ds-tree-row-hover);
    }

    li[aria-selected='true'] > .node-row,
    li[aria-checked='true'] > .node-row {
      /* rowSelected: locked */
      background: var(--color-background-strong);
      box-shadow: inset var(--ds-tree-row-selected-border-width) 0 0 0 var(--color-control-selected-background);
    }

    /* labelSelectedWeight forwards into ds-text's own hook; ds-link has no font-weight hook to forward to (see gaps) */
    li[aria-selected='true'] > .node-row .node-label,
    li[aria-checked='true'] > .node-row .node-label {
      --ds-text-font-weight: var(--ds-tree-label-selected-weight);
    }

    .indent {
      flex: none;
      align-self: stretch;
    }

    .expand-button {
      --ds-button-padding-inline: 0;
      --ds-button-padding-block: 0;
      inline-size: var(--ds-tree-expand-button-size);
      block-size: var(--ds-tree-expand-button-size);
      flex: none;
    }

    .expand-spacer {
      inline-size: var(--ds-tree-expand-button-size);
      flex: none;
    }

    .expand-icon {
      transition: transform var(--ds-tree-transition) var(--motion-easing-standard);
    }
    .expand-icon[data-expanded] {
      transform: rotate(90deg);
    }

    .checkbox-glyph {
      inline-size: var(--ds-tree-checkbox-size);
      block-size: var(--ds-tree-checkbox-size);
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      /* checkboxBorder: color.control.border, locked */
      border: var(--border-width-thin) solid var(--color-control-border);
      border-radius: var(--ds-tree-checkbox-radius);
      background: var(--ds-tree-checkbox-background);
      /* checkboxMark: color.control.selectedForeground, locked */
      color: var(--color-control-selected-foreground);
      margin-inline-end: var(--ds-tree-checkbox-gap);
    }
    .checkbox-glyph[data-checked],
    .checkbox-glyph[data-indeterminate] {
      /* checkboxSelected: color.control.selectedBackground, locked */
      background: var(--color-control-selected-background);
      border-color: var(--color-control-selected-background);
    }

    .node-icon {
      flex: none;
      /* iconColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    .node-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* badgeSize forwards into ds-text's own hook */
    .node-badge {
      flex: none;
      --ds-text-font-size: var(--ds-tree-badge-size);
    }

    .loading-row {
      /* labelColor: color.foreground.muted for a loading placeholder, locked-equivalent */
      color: var(--color-foreground-muted);
    }
  `;

  /** What the tree lists ("Folders", "Categories"). The accessible name of the tree; visually hidden unless `showLabel`. */
  @property() accessor label!: string;

  /** Shows `label` as a heading above the tree; then the tree is `aria-labelledby` it instead of `aria-label`. */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) accessor showLabel = false;

  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  @property({ reflect: true, attribute: 'heading-level' }) accessor headingLevel: TreeHeadingLevel = '2';

  /** The hierarchy. A property, not an attribute. */
  @property({ attribute: false }) accessor nodes: TreeNode[] = [];

  /** Controlled expanded ids. */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids. `["*"]` expands every node with children. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** `single`: one current node. `multiple`: checkbox-like cascading selection. `none`: expand/collapse only. */
  @property({ reflect: true }) accessor selectable: TreeSelectable = 'single';

  /** Controlled selected ids. */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** With `single`, moving focus also selects. Off by default: focus moves, Enter or Space selects. */
  @property({ type: Boolean, reflect: true, attribute: 'select-on-focus' }) accessor selectOnFocus = false;

  /** Vertical guide lines under open parents. Exposed as the negated `hide-guides` attribute (the doc's default
      is `true`, so per the negated-boolean-attribute convention this can't be a positively named attribute —
      see gaps: the schema's own `platforms.lit.reflect` list names this `show-guides`, which contradicts that
      convention for a true-default boolean). */
  @property({ attribute: 'hide-guides', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor showGuides = true;

  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled expanded ids, seeded from `defaultExpanded` on first update. */
  @state() private accessor internalExpanded: string[] = [];

  /** Uncontrolled selected ids, seeded from `defaultSelected` on first update. */
  @state() private accessor internalSelected: string[] = [];

  /** The node currently carrying the roving tabindex and (usually) real focus. */
  @state() private accessor focusedId: string | null = null;

  @state() private accessor liveMessage = '';

  private readonly instanceId = nextTreeId();
  private typeaheadQuery = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout> | undefined;

  private get currentExpanded(): string[] {
    return this.expanded ?? this.internalExpanded;
  }

  private get currentSelected(): string[] {
    return this.selected ?? this.internalSelected;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Tree');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      if (this.expanded === undefined) {
        this.internalExpanded = this.defaultExpanded?.includes('*')
          ? this.allIdsWithChildren(this.nodes)
          : (this.defaultExpanded ?? []);
      }
      if (this.selected === undefined) {
        this.internalSelected = this.defaultSelected ?? [];
      }
      this.focusedId = this.currentSelected[0] ?? this.navigable()[0]?.node.id ?? null;
    } else if (changed.has('nodes') || changed.has('expanded') || changed.has('selectable')) {
      const items = this.navigable();
      if (this.focusedId !== null && !items.some((entry) => entry.node.id === this.focusedId)) {
        this.focusedId = items[0]?.node.id ?? null;
      }
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const items = this.nodes;
    return html`
      ${this.showLabel
        ? html`<ds-heading
            id=${this.headingId}
            class="tree-heading"
            part="heading"
            level=${this.headingLevel}
            size="md"
            >${this.label}</ds-heading
          >`
        : nothing}
      <ul
        class="tree"
        part="container"
        role="tree"
        aria-label=${ifDefined(this.showLabel ? undefined : this.label)}
        aria-labelledby=${ifDefined(this.showLabel ? this.headingId : undefined)}
        aria-multiselectable=${ifDefined(this.selectable === 'multiple' ? 'true' : undefined)}
        @keydown=${this.handleKeydown}
      >
        ${items.length === 0
          ? html`<li role="presentation"><ds-text part="empty-state" tone="muted">${COPY_EMPTY}</ds-text></li>`
          : items.map((node, index) => this.renderNode(node, 1, index + 1, items.length, undefined))}
      </ul>
      <span class="visually-hidden" role="status">${this.liveMessage}</span>
    `;
  }

  private get headingId(): string {
    return `${this.instanceId}-heading`;
  }

  private renderNode(
    node: TreeNode,
    level: number,
    posinset: number,
    setsize: number,
    parentId: string | undefined,
  ): TemplateResult {
    const lazy = node.children === 'lazy';
    const hasChildren = lazy || (Array.isArray(node.children) && node.children.length > 0);
    const expanded = hasChildren && this.isExpanded(node.id);
    const disabled = node.disabled === true;
    const selected = this.selectable === 'single' && this.isSelected(node.id);
    const checked = this.selectable === 'multiple' ? this.checkedState(node) : undefined;
    const focused = this.focusedId === node.id;

    return html`
      <li
        id=${this.itemId(node.id)}
        role="treeitem"
        part="node"
        aria-level=${level}
        aria-setsize=${setsize}
        aria-posinset=${posinset}
        aria-expanded=${ifDefined(hasChildren ? String(expanded) : undefined)}
        aria-selected=${ifDefined(this.selectable === 'single' ? String(selected) : undefined)}
        aria-checked=${ifDefined(checked ? (checked.indeterminate ? 'mixed' : String(checked.checked)) : undefined)}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(expanded && lazy ? 'true' : undefined)}
        tabindex=${focused ? '0' : '-1'}
        @click=${(event: MouseEvent) => this.handleNodeClick(event, node)}
        @dblclick=${() => this.handleActivate(node, disabled)}
      >
        <div class="node-row" part="node-row">
          <span
            class="indent"
            part="indent"
            aria-hidden="true"
            style=${styleMap({ inlineSize: `calc((${level} - 1) * var(--ds-tree-indent))`, ...this.guideLayers(level) })}
          ></span>
          ${hasChildren
            ? html`<ds-button
                class="expand-button"
                part="expand-button"
                variant="ghost"
                size="sm"
                icon-only
                tabindex="-1"
                aria-hidden="true"
                ?disabled=${disabled}
                label=${expanded ? COPY_COLLAPSE(node.label) : COPY_EXPAND(node.label)}
                @press=${(event: Event) => {
                  event.stopPropagation();
                  this.toggleExpand(node);
                }}
              >
                <ds-icon
                  slot="leading-icon"
                  class="expand-icon"
                  data-expanded=${ifDefined(expanded ? '' : undefined)}
                  name="chevron-right"
                  inline
                ></ds-icon>
              </ds-button>`
            : html`<span class="expand-spacer" aria-hidden="true"></span>`}
          ${checked
            ? html`<span
                class="checkbox-glyph"
                part="checkbox"
                aria-hidden="true"
                data-checked=${ifDefined(checked.checked ? '' : undefined)}
                data-indeterminate=${ifDefined(checked.indeterminate ? '' : undefined)}
              >
                ${checked.checked
                  ? html`<ds-icon name="check" inline></ds-icon>`
                  : checked.indeterminate
                    ? html`<ds-icon name="dash" inline></ds-icon>`
                    : nothing}
              </span>`
            : nothing}
          ${node.icon ? html`<ds-icon class="node-icon" part="icon" name=${node.icon} inline></ds-icon>` : nothing}
          ${node.href
            ? html`<ds-link class="node-label" part="link" tabindex="-1" href=${node.href} label=${node.label}></ds-link>`
            : html`<ds-text class="node-label" part="label" element="span">${node.label}</ds-text>`}
          ${node.badge !== undefined
            ? html`<ds-text class="node-badge" part="badge" element="span" size="xs" tone="muted">${node.badge}</ds-text>`
            : nothing}
        </div>
        ${expanded
          ? html`<ul class="group" part="group" role="group">
              ${lazy
                ? html`<li role="presentation" class="loading-row">${COPY_LOADING}</li>`
                : (Array.isArray(node.children) ? node.children : []).map((child, index) =>
                    this.renderNode(child, level + 1, index + 1, (node.children as TreeNode[]).length, node.id),
                  )}
            </ul>`
          : nothing}
      </li>
    `;
  }

  /* ---------- tree flattening ---------- */

  private isExpanded(id: string): boolean {
    return this.currentExpanded.includes(id);
  }

  private isSelected(id: string): boolean {
    return this.currentSelected.includes(id);
  }

  private flatten(nodes: TreeNode[], level: number, parentId: string | undefined): VisibleEntry[] {
    const result: VisibleEntry[] = [];
    nodes.forEach((node, index) => {
      const lazy = node.children === 'lazy';
      const hasChildren = lazy || (Array.isArray(node.children) && node.children.length > 0);
      result.push({ node, level, parentId, posinset: index + 1, setsize: nodes.length, hasChildren, lazy });
      if (hasChildren && this.isExpanded(node.id) && Array.isArray(node.children)) {
        result.push(...this.flatten(node.children, level + 1, node.id));
      }
    });
    return result;
  }

  private visibleEntries(): VisibleEntry[] {
    return this.flatten(this.nodes, 1, undefined);
  }

  /** Visible entries whose node is not disabled: the set keyboard navigation, Home/End, typeahead and
      selection all move across. Disabled nodes stay visible but are skipped. */
  private navigable(): VisibleEntry[] {
    return this.visibleEntries().filter((entry) => entry.node.disabled !== true);
  }

  private entryAt(id: string | null): VisibleEntry | undefined {
    if (id === null) {
      return undefined;
    }
    return this.visibleEntries().find((entry) => entry.node.id === id);
  }

  private allIdsWithChildren(nodes: TreeNode[]): string[] {
    const ids: string[] = [];
    const walk = (list: TreeNode[]) => {
      for (const node of list) {
        if (node.children === 'lazy') {
          ids.push(node.id);
        } else if (Array.isArray(node.children) && node.children.length > 0) {
          ids.push(node.id);
          walk(node.children);
        }
      }
    };
    walk(nodes);
    return ids;
  }

  private collectDescendantIds(node: TreeNode): string[] {
    const ids: string[] = [];
    const walk = (children: TreeNode[] | 'lazy' | undefined) => {
      if (!Array.isArray(children)) {
        return;
      }
      for (const child of children) {
        ids.push(child.id);
        walk(child.children);
      }
    };
    walk(node.children);
    return ids;
  }

  /* ---------- expand / collapse ---------- */

  private commitExpanded(next: string[]): void {
    if (this.expanded === undefined) {
      this.internalExpanded = next;
    }
    this.dispatchEvent(
      new CustomEvent<TreeExpandChangeDetail>('expand-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleExpand(node: TreeNode): void {
    const lazy = node.children === 'lazy';
    const hasChildren = lazy || (Array.isArray(node.children) && node.children.length > 0);
    if (!hasChildren || node.disabled) {
      return;
    }
    const wasExpanded = this.isExpanded(node.id);
    const next = wasExpanded ? this.currentExpanded.filter((id) => id !== node.id) : [...this.currentExpanded, node.id];
    this.commitExpanded(next);
    this.liveMessage = wasExpanded ? COPY_COLLAPSE(node.label) : COPY_EXPAND(node.label);
    if (!wasExpanded && lazy) {
      this.dispatchEvent(new CustomEvent<TreeExpandDetail>('expand', { detail: node.id, bubbles: true, composed: true }));
    }
  }

  private expandSiblings(entry: VisibleEntry): void {
    const siblings = this.visibleEntries().filter((e) => e.parentId === entry.parentId && e.hasChildren);
    const current = new Set(this.currentExpanded);
    const newlyLazy: string[] = [];
    let changed = false;
    for (const sibling of siblings) {
      if (!current.has(sibling.node.id)) {
        current.add(sibling.node.id);
        changed = true;
        if (sibling.lazy) {
          newlyLazy.push(sibling.node.id);
        }
      }
    }
    if (!changed) {
      return;
    }
    this.commitExpanded([...current]);
    for (const id of newlyLazy) {
      this.dispatchEvent(new CustomEvent<TreeExpandDetail>('expand', { detail: id, bubbles: true, composed: true }));
    }
  }

  /* ---------- selection ---------- */

  private checkedState(node: TreeNode): { checked: boolean; indeterminate: boolean } {
    const selected = this.currentSelected;
    if (selected.includes(node.id)) {
      return { checked: true, indeterminate: false };
    }
    if (!this.selectChildren) {
      return { checked: false, indeterminate: false };
    }
    const descendantIds = this.collectDescendantIds(node);
    if (descendantIds.length === 0) {
      return { checked: false, indeterminate: false };
    }
    const count = descendantIds.filter((id) => selected.includes(id)).length;
    if (count === 0) {
      return { checked: false, indeterminate: false };
    }
    if (count === descendantIds.length) {
      return { checked: true, indeterminate: false };
    }
    return { checked: false, indeterminate: true };
  }

  private commitSelected(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelected = next;
    }
    this.dispatchEvent(
      new CustomEvent<TreeSelectionChangeDetail>('selection-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleMultiple(node: TreeNode): void {
    const current = this.currentSelected;
    const wasChecked = this.checkedState(node).checked;
    let next: string[];
    if (this.selectChildren) {
      const ids = [node.id, ...this.collectDescendantIds(node)];
      next = wasChecked ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
    } else {
      next = current.includes(node.id) ? current.filter((id) => id !== node.id) : [...current, node.id];
    }
    this.commitSelected(next);
    this.liveMessage = COPY_SELECTED_COUNT(next.length);
  }

  private extendSelection(delta: number): void {
    const items = this.navigable();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((entry) => entry.node.id === this.focusedId);
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    const from = items[currentIndex];
    const to = items[nextIndex];
    const additions = [from?.node.id, to?.node.id].filter((id): id is string => Boolean(id));
    const next = [...new Set([...this.currentSelected, ...additions])];
    this.commitSelected(next);
    this.liveMessage = COPY_SELECTED_COUNT(next.length);
    this.focusEntry(to!.node.id);
  }

  /* ---------- activation ---------- */

  private handleActivate(node: TreeNode, disabled: boolean): void {
    if (disabled) {
      return;
    }
    this.focusEntry(node.id);
    this.activateNode(node);
  }

  private activateNode(node: TreeNode): void {
    if (node.href) {
      const linkEl = this.renderRoot.querySelector(`#${CSS.escape(this.itemId(node.id))} ds-link`);
      (linkEl?.shadowRoot?.querySelector('a') as HTMLAnchorElement | null)?.click();
    } else {
      this.dispatchEvent(new CustomEvent<TreeActivateDetail>('activate', { detail: node.id, bubbles: true, composed: true }));
    }
    if (this.selectable === 'single') {
      this.commitSelected([node.id]);
    }
  }

  private handleNodeClick(event: MouseEvent, node: TreeNode): void {
    if (node.disabled) {
      return;
    }
    this.focusEntry(node.id);
    if (this.selectable === 'single') {
      this.commitSelected([node.id]);
    } else if (this.selectable === 'multiple') {
      this.toggleMultiple(node);
    }
  }

  /* ---------- keyboard / focus ---------- */

  private focusEntry(id: string): void {
    this.focusedId = id;
    if (this.selectOnFocus && this.selectable === 'single') {
      const entry = this.entryAt(id);
      if (entry && entry.node.disabled !== true) {
        this.commitSelected([id]);
      }
    }
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(this.itemId(id))}`)?.focus();
    });
  }

  private moveFocus(delta: number): void {
    const items = this.navigable();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((entry) => entry.node.id === this.focusedId);
    const nextIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    this.focusEntry(items[nextIndex]!.node.id);
  }

  private focusFirst(): void {
    const items = this.navigable();
    if (items.length > 0) {
      this.focusEntry(items[0]!.node.id);
    }
  }

  private focusLast(): void {
    const items = this.navigable();
    if (items.length > 0) {
      this.focusEntry(items[items.length - 1]!.node.id);
    }
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadQuery += char.toLowerCase();
    const query = this.typeaheadQuery;
    const items = this.navigable();
    const currentIndex = items.findIndex((entry) => entry.node.id === this.focusedId);
    const ordered = [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)];
    const match = ordered.find((entry) => entry.node.label.toLowerCase().startsWith(query));
    if (match) {
      this.focusEntry(match.node.id);
    }
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadQuery = '';
    }, TYPEAHEAD_RESET_MS);
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.ctrlKey && (event.key === 'a' || event.key === 'A') && this.selectable === 'multiple') {
      event.preventDefault();
      const ids = this.navigable().map((entry) => entry.node.id);
      this.commitSelected([...new Set(ids)]);
      this.liveMessage = COPY_SELECTED_COUNT(ids.length);
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (event.shiftKey && this.selectable === 'multiple') {
          this.extendSelection(1);
        } else {
          this.moveFocus(1);
        }
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (event.shiftKey && this.selectable === 'multiple') {
          this.extendSelection(-1);
        } else {
          this.moveFocus(-1);
        }
        return;
      case 'ArrowRight': {
        event.preventDefault();
        const entry = this.entryAt(this.focusedId);
        if (!entry || !entry.hasChildren) {
          return;
        }
        if (!this.isExpanded(entry.node.id)) {
          this.toggleExpand(entry.node);
          return;
        }
        const items = this.navigable();
        const childIndex = items.findIndex((e) => e.parentId === entry.node.id);
        if (childIndex !== -1) {
          this.focusEntry(items[childIndex]!.node.id);
        }
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const entry = this.entryAt(this.focusedId);
        if (!entry) {
          return;
        }
        if (entry.hasChildren && this.isExpanded(entry.node.id)) {
          this.toggleExpand(entry.node);
          return;
        }
        if (entry.parentId) {
          const parentEntry = this.entryAt(entry.parentId);
          if (parentEntry && parentEntry.node.disabled !== true) {
            this.focusEntry(entry.parentId);
          }
        }
        return;
      }
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        return;
      case 'End':
        event.preventDefault();
        this.focusLast();
        return;
      case 'Enter': {
        event.preventDefault();
        const entry = this.entryAt(this.focusedId);
        if (entry && entry.node.disabled !== true) {
          this.activateNode(entry.node);
        }
        return;
      }
      case ' ': {
        if (this.selectable === 'none') {
          return;
        }
        event.preventDefault();
        const entry = this.entryAt(this.focusedId);
        if (!entry || entry.node.disabled) {
          return;
        }
        if (this.selectable === 'single') {
          this.commitSelected([entry.node.id]);
        } else {
          this.toggleMultiple(entry.node);
        }
        return;
      }
      case '*': {
        event.preventDefault();
        const entry = this.entryAt(this.focusedId);
        if (entry) {
          this.expandSiblings(entry);
        }
        return;
      }
      default:
        if (event.key.length === 1 && /[a-z0-9]/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.handleTypeahead(event.key);
        }
        return;
    }
  };

  /* ---------- layout ---------- */

  /** One vertical guide line per ancestor level, aligned to each level's expand-button center. */
  private guideLayers(level: number): Record<string, string> {
    if (!this.showGuides || level <= 1) {
      return {};
    }
    const count = level - 1;
    const image = new Array(count).fill('linear-gradient(var(--ds-tree-guide-line), var(--ds-tree-guide-line))').join(', ');
    const size = new Array(count).fill('var(--ds-tree-guide-line-width) 100%').join(', ');
    const repeat = new Array(count).fill('no-repeat').join(', ');
    const position = Array.from(
      { length: count },
      (_, i) => `calc(${i} * var(--ds-tree-indent) + var(--ds-tree-indent) / 2) 0`,
    ).join(', ');
    return { backgroundImage: image, backgroundSize: size, backgroundRepeat: repeat, backgroundPosition: position };
  }

  private itemId(id: string): string {
    return `${this.instanceId}-item-${id}`;
  }

  /* ---------- overrides / dev warnings ---------- */

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TreeOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.label) {
      console.warn('<ds-tree> requires a `label`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tree': DsTree;
  }
}
