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
import type { TextOverridableBinding } from './Text.js';

/** A node in the hierarchy. `href` makes the node's label a Link (navigation trees); `icon` is an Icon glyph;
    `badge` is a short trailing count or status; `children: "lazy"` loads on first expand through `expand`. */
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

/** `selection-change` detail: every selected id, as a bare array. */
export type TreeSelectionChangeDetail = string[];

/** `expand-change` detail: every expanded id, as a bare array. */
export type TreeExpandChangeDetail = string[];

/** `expand` detail: the lazy node expanded for the first time. */
export type TreeExpandDetail = string;

/** `activate` detail: the id of the activated node. */
export type TreeActivateDetail = string;

/* copy.* — used verbatim */
const COPY_EXPAND = (label: string): string => `Expand ${label}`;
const COPY_COLLAPSE = (label: string): string => `Collapse ${label}`;
const COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing here.';

/** constants.typeaheadReset — literal-ok, as Listbox. */
const TYPEAHEAD_RESET_MS = 500;

/** `showGuides` defaults true, so its attribute is the negated `hide-guides`. */
const NEGATED_BOOLEAN = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style bindings. Locked (never overridable): rowHeight, rowSelected, rowSelectedBorder,
    rowSelectedBorderWidth, labelColor, iconColor, badgeColor, expandButtonSize, checkboxBorder, checkboxSelected,
    checkboxMark, minTarget, focusRing, focusRingWidth. */
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
  | 'checkboxBackground'
  | 'checkboxRadius'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<TreeOverridableBinding, string> = {
  indent: '--ds-tree-indent',
  rowPaddingInline: '--ds-tree-row-padding-inline',
  rowRadius: '--ds-tree-row-radius',
  rowGap: '--ds-tree-row-gap',
  rowHover: '--ds-tree-row-hover',
  labelSelectedWeight: '--ds-tree-label-selected-weight',
  headingSize: '--ds-tree-heading-size',
  badgeSize: '--ds-tree-badge-size',
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

/** Default tokens of the bindings forwarded to composed children's `overrides`. */
const LABEL_SELECTED_WEIGHT: TokenRef = 'font.weight.medium';
const HEADING_SIZE: TokenRef = 'font.size.md';
const BADGE_SIZE: TokenRef = 'font.size.xs';
const FONT_SIZE: TokenRef = 'font.size.sm';

let idCounter = 0;

interface VisibleEntry {
  node: TreeNode;
  level: number;
  parentId: string | undefined;
  hasChildren: boolean;
  lazy: boolean;
}

function hasChildrenOf(node: TreeNode): boolean {
  return node.children === 'lazy' || (Array.isArray(node.children) && node.children.length > 0);
}

/**
 * `<ds-tree>` — Tree (category: navigation, APG pattern: treeview).
 *
 * `<ds-tree label="Folders" .nodes=${nodes} selectable="multiple" select-children></ds-tree>` renders a
 * `role="tree"` list of `role="treeitem"` nodes with nested `role="group"` lists. One tab stop with a roving
 * tabindex on the treeitems.
 *
 * @fires selection-change - Every selected id, as a bare array.
 * @fires expand-change - Every expanded id, as a bare array.
 * @fires expand - A lazy node expanded for the first time, with its id.
 * @fires activate - Enter or double-click on a node without `href`, with its id.
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
      --ds-tree-label-selected-weight: var(--font-weight-medium);
      --ds-tree-heading-size: var(--font-size-md);
      --ds-tree-badge-size: var(--font-size-xs);
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

    [data-part='container'] {
      font-family: var(--ds-tree-font-family);
      font-size: var(--ds-tree-font-size);
      line-height: var(--ds-tree-line-height);
      /* labelColor: locked */
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

    ul[role='tree'],
    [data-part='group'] {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    [data-part='node'] {
      outline: none;
    }

    [data-part='node']:focus-visible > [data-part='nodeRow'] {
      /* focusRing / focusRingWidth: locked */
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='nodeRow'] {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--ds-tree-row-gap);
      /* rowHeight / minTarget: locked */
      min-block-size: var(--size-target-min);
      padding-inline: var(--ds-tree-row-padding-inline);
      border-radius: var(--ds-tree-row-radius);
      cursor: pointer;
      transition: background-color var(--ds-tree-transition) var(--motion-easing-standard);
    }

    [data-part='nodeRow']:hover {
      background: var(--ds-tree-row-hover);
    }

    [data-part='node'][aria-selected='true'] > [data-part='nodeRow'],
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow'] {
      /* rowSelected: locked */
      background: var(--color-background-strong);
    }

    [data-part='node'][aria-selected='true'] > [data-part='nodeRow']::before,
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow']::before {
      /* rowSelectedBorder / rowSelectedBorderWidth: locked */
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      border-inline-start: var(--border-width-focus) solid var(--color-control-selected-background);
    }

    [data-part='node'][aria-disabled='true'] > [data-part='nodeRow'] {
      opacity: var(--ds-tree-disabled-opacity);
      cursor: default;
      pointer-events: none;
    }

    [data-part='indent'] {
      flex: none;
    }

    [data-part='expandButton'],
    .expand-spacer {
      flex: none;
      /* expandButtonSize: locked */
      min-inline-size: var(--size-target-min);
    }

    .chevron {
      transition: transform var(--ds-tree-transition) var(--motion-easing-standard);
    }
    .chevron[data-expanded] {
      transform: rotate(90deg);
    }
    :host(:dir(rtl)) .chevron:not([data-expanded]) {
      transform: scaleX(-1);
    }

    [data-part='checkbox'] {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      inline-size: var(--ds-tree-checkbox-size);
      block-size: var(--ds-tree-checkbox-size);
      margin-inline-end: calc(var(--ds-tree-checkbox-gap) - var(--ds-tree-row-gap));
      /* checkboxBorder: locked */
      border: var(--border-width-thin) solid var(--color-control-border);
      border-radius: var(--ds-tree-checkbox-radius);
      background: var(--ds-tree-checkbox-background);
      /* checkboxMark: locked */
      color: var(--color-control-selected-foreground);
    }
    [data-part='checkbox'][data-state='checked'],
    [data-part='checkbox'][data-state='mixed'] {
      /* checkboxSelected: locked */
      background: var(--color-control-selected-background);
      border-color: var(--color-control-selected-background);
    }

    [data-part='icon'] {
      flex: none;
      /* iconColor: locked */
      color: var(--color-foreground-muted);
    }

    [data-part='badge'] {
      flex: none;
    }

    [data-part='group'] {
      position: relative;
    }
    [data-part='group']::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: var(--guide-inset);
      border-inline-start: var(--ds-tree-guide-line-width) solid var(--ds-tree-guide-line);
      pointer-events: none;
    }
    :host([hide-guides]) [data-part='group']::before {
      display: none;
    }

    .loading {
      display: flex;
      align-items: center;
      min-block-size: var(--size-target-min);
      /* badgeColor-equivalent muted text for the placeholder */
      color: var(--color-foreground-muted);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='nodeRow'],
      .chevron {
        transition: none;
      }
    }
  `;

  /** What the tree lists ("Folders", "Categories"). The tree's accessible name; visible only with `showLabel`. */
  @property() accessor label = '';

  /** Show the label as a Heading above the tree (then the tree is aria-labelledby it). */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) accessor showLabel = false;

  /** Heading level of the visible label; its size is headingSize regardless. */
  @property({ type: String, reflect: true, attribute: 'heading-level' }) accessor headingLevel: TreeHeadingLevel = '2';

  /** The hierarchy. */
  @property({ attribute: false }) accessor nodes: TreeNode[] = [];

  /** Controlled expanded ids. */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids; `["*"]` for all. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** `single`: one current node. `multiple`: checkbox-like selection. `none`: expand/collapse only. */
  @property({ type: String, reflect: true }) accessor selectable: TreeSelectable = 'single';

  /** Controlled selected ids. Always an array, even in `single` mode. */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** With `multiple`, selecting a parent selects its descendants and parents show indeterminate. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** With `single`, moving focus also selects. */
  @property({ type: Boolean, reflect: true, attribute: 'select-on-focus' }) accessor selectOnFocus = false;

  /** Vertical guide lines under open parents. Attribute: the negated `hide-guides`. */
  @property({ attribute: 'hide-guides', reflect: true, converter: NEGATED_BOOLEAN }) accessor showGuides = true;

  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined;

  @state() private accessor internalExpanded: string[] = [];
  @state() private accessor internalSelected: string[] = [];
  /** The treeitem carrying the roving tabindex. */
  @state() private accessor focusedId: string | null = null;
  @state() private accessor liveMessage = '';

  private readonly instanceId = `ds-tree-${++idCounter}`;
  private readonly requestedLazy = new Set<string>();
  private focusWithin = false;
  private typeahead = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private warnedLabel = false;

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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.typeaheadTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalExpanded = this.defaultExpanded?.includes('*')
        ? this.allParentIds(this.nodes)
        : [...(this.defaultExpanded ?? [])];
      this.internalSelected = [...(this.defaultSelected ?? [])];
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    this.syncRovingStop();
  }

  protected override updated(): void {
    if (import.meta.env.DEV && !this.label && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn('<ds-tree> requires a `label`.', this);
    }
  }

  /** Tab lands on the selected node, else the first; while focus is inside, the focused node keeps the stop. */
  private syncRovingStop(): void {
    const items = this.navigable();
    const ids = items.map((entry) => entry.node.id);
    if (!this.focusWithin) {
      const selected = ids.find((id) => this.currentSelected.includes(id));
      if (selected !== undefined) {
        this.focusedId = selected;
        return;
      }
    }
    if (this.focusedId === null || !ids.includes(this.focusedId)) {
      this.focusedId = ids[0] ?? null;
    }
  }

  protected override render(): TemplateResult {
    const headingId = `${this.instanceId}-heading`;
    return html`
      <div data-part="container" part="container">
        ${this.showLabel
          ? html`<ds-heading
              id=${headingId}
              data-part="heading"
              part="heading"
              level=${this.headingLevel}
              .overrides=${{ fontSize: this.overrides?.headingSize ?? HEADING_SIZE }}
              >${this.label}</ds-heading
            >`
          : nothing}
        <ul
          role="tree"
          aria-label=${ifDefined(this.showLabel ? undefined : this.label)}
          aria-labelledby=${ifDefined(this.showLabel ? headingId : undefined)}
          aria-multiselectable=${ifDefined(this.selectable === 'multiple' ? 'true' : undefined)}
          @keydown=${this.handleKeydown}
          @focusin=${this.handleFocusIn}
          @focusout=${this.handleFocusOut}
        >
          ${this.nodes.map((node, index) => this.renderNode(node, 1, index + 1, this.nodes.length))}
        </ul>
        ${this.nodes.length === 0 ? html`<ds-text data-part="emptyState" part="emptyState">${COPY_EMPTY}</ds-text>` : nothing}
        <span class="visually-hidden" role="status">${this.liveMessage}</span>
      </div>
    `;
  }

  private renderNode(node: TreeNode, level: number, posinset: number, setsize: number): TemplateResult {
    const lazy = node.children === 'lazy';
    const hasChildren = hasChildrenOf(node);
    const expanded = hasChildren && this.currentExpanded.includes(node.id);
    const disabled = node.disabled === true;
    const selected = this.selectable === 'single' && this.currentSelected.includes(node.id);
    const checked = this.selectable === 'multiple' ? this.checkedState(node) : undefined;
    const marked = selected || checked === 'true';
    const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontSize: this.overrides?.fontSize ?? FONT_SIZE,
      ...(marked ? { fontWeight: this.overrides?.labelSelectedWeight ?? LABEL_SELECTED_WEIGHT } : {}),
    };

    return html`
      <li
        id=${this.itemId(node.id)}
        role="treeitem"
        data-part="node"
        part="node"
        aria-level=${level}
        aria-setsize=${setsize}
        aria-posinset=${posinset}
        aria-expanded=${ifDefined(hasChildren ? String(expanded) : undefined)}
        aria-selected=${ifDefined(this.selectable === 'single' ? String(selected) : undefined)}
        aria-checked=${ifDefined(checked)}
        aria-disabled=${ifDefined(disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(expanded && lazy ? 'true' : undefined)}
        tabindex=${this.focusedId === node.id ? '0' : '-1'}
      >
        <div
          data-part="nodeRow"
          part="nodeRow"
          @click=${(event: MouseEvent) => this.handleRowClick(event, node)}
          @dblclick=${(event: MouseEvent) => this.handleRowDblClick(event, node)}
        >
          <span
            data-part="indent"
            part="indent"
            aria-hidden="true"
            style=${styleMap({ inlineSize: `calc(${level - 1} * var(--ds-tree-indent))` })}
          ></span>
          ${hasChildren
            ? html`<ds-button
                data-part="expandButton"
                part="expandButton"
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
                  this.focusEntry(node.id, false);
                }}
              >
                <ds-icon
                  slot="leading-icon"
                  class="chevron"
                  data-expanded=${ifDefined(expanded ? '' : undefined)}
                  name="chevron-right"
                ></ds-icon>
              </ds-button>`
            : html`<span class="expand-spacer" aria-hidden="true"></span>`}
          ${checked !== undefined
            ? html`<span data-part="checkbox" part="checkbox" aria-hidden="true" data-state=${checked === 'true' ? 'checked' : checked}>
                ${checked === 'true'
                  ? html`<ds-icon name="check"></ds-icon>`
                  : checked === 'mixed'
                    ? html`<ds-icon name="dash"></ds-icon>`
                    : nothing}
              </span>`
            : nothing}
          ${node.icon ? html`<ds-icon data-part="icon" part="icon" name=${node.icon}></ds-icon>` : nothing}
          ${node.href
            ? html`<ds-link data-part="link" part="link" tabindex="-1" href=${node.href} label=${node.label}></ds-link>`
            : html`<ds-text data-part="label" part="label" element="span" .overrides=${labelOverrides}>${node.label}</ds-text>`}
          ${node.badge !== undefined
            ? html`<ds-text
                data-part="badge"
                part="badge"
                element="span"
                tone="muted"
                .overrides=${{ fontSize: this.overrides?.badgeSize ?? BADGE_SIZE }}
                >${node.badge}</ds-text
              >`
            : nothing}
        </div>
        ${expanded
          ? html`<ul
              role="group"
              data-part="group"
              part="group"
              style=${styleMap({
                '--guide-inset': `calc(var(--ds-tree-row-padding-inline) + ${level - 1} * var(--ds-tree-indent) + var(--size-target-min) / 2)`,
              })}
            >
              ${Array.isArray(node.children)
                ? node.children.map((child, index, list) => this.renderNode(child, level + 1, index + 1, list.length))
                : html`<li role="none" class="loading" style=${styleMap({ paddingInlineStart: `calc(var(--ds-tree-row-padding-inline) + ${level} * var(--ds-tree-indent) + var(--size-target-min))` })}>
                    ${COPY_LOADING}
                  </li>`}
            </ul>`
          : nothing}
      </li>
    `;
  }

  /* ---------- hierarchy ---------- */

  private flatten(nodes: TreeNode[], level: number, parentId: string | undefined, out: VisibleEntry[]): VisibleEntry[] {
    for (const node of nodes) {
      const lazy = node.children === 'lazy';
      out.push({ node, level, parentId, hasChildren: hasChildrenOf(node), lazy });
      if (Array.isArray(node.children) && this.currentExpanded.includes(node.id)) {
        this.flatten(node.children, level + 1, node.id, out);
      }
    }
    return out;
  }

  private visible(): VisibleEntry[] {
    return this.flatten(this.nodes, 1, undefined, []);
  }

  /** Visible, enabled nodes: what arrows, Home/End, type-ahead and Ctrl+A move across. */
  private navigable(): VisibleEntry[] {
    return this.visible().filter((entry) => entry.node.disabled !== true);
  }

  private entry(id: string | null): VisibleEntry | undefined {
    return id === null ? undefined : this.visible().find((e) => e.node.id === id);
  }

  private allParentIds(nodes: TreeNode[]): string[] {
    const ids: string[] = [];
    const walk = (list: TreeNode[]): void => {
      for (const node of list) {
        if (hasChildrenOf(node)) ids.push(node.id);
        if (Array.isArray(node.children)) walk(node.children);
      }
    };
    walk(nodes);
    return ids;
  }

  private descendantIds(node: TreeNode): string[] {
    const ids: string[] = [];
    const walk = (children: TreeNode[] | 'lazy' | undefined): void => {
      if (!Array.isArray(children)) return;
      for (const child of children) {
        ids.push(child.id);
        walk(child.children);
      }
    };
    walk(node.children);
    return ids;
  }

  /** Ancestor nodes of `id`, nearest first. */
  private ancestors(id: string): TreeNode[] {
    const path: TreeNode[] = [];
    const walk = (list: TreeNode[]): boolean => {
      for (const node of list) {
        if (node.id === id) return true;
        if (Array.isArray(node.children)) {
          path.push(node);
          if (walk(node.children)) return true;
          path.pop();
        }
      }
      return false;
    };
    walk(this.nodes);
    return path.reverse();
  }

  private itemId(id: string): string {
    return `${this.instanceId}-item-${id}`;
  }

  /* ---------- expansion ---------- */

  private commitExpanded(next: string[], lazyOpened: string[]): void {
    for (const id of lazyOpened) {
      this.requestedLazy.add(id);
      this.dispatchEvent(new CustomEvent<TreeExpandDetail>('expand', { detail: id, bubbles: true, composed: true }));
    }
    if (this.expanded === undefined) {
      this.internalExpanded = next;
    }
    this.dispatchEvent(new CustomEvent<TreeExpandChangeDetail>('expand-change', { detail: next, bubbles: true, composed: true }));
  }

  private toggleExpand(node: TreeNode): void {
    if (!hasChildrenOf(node) || node.disabled === true) return;
    const open = this.currentExpanded.includes(node.id);
    const next = open ? this.currentExpanded.filter((id) => id !== node.id) : [...this.currentExpanded, node.id];
    const lazyOpened = !open && node.children === 'lazy' && !this.requestedLazy.has(node.id) ? [node.id] : [];
    this.commitExpanded(next, lazyOpened);
  }

  private expandSiblings(entry: VisibleEntry): void {
    const current = this.currentExpanded;
    const closed = this.visible().filter(
      (e) => e.parentId === entry.parentId && e.hasChildren && e.node.disabled !== true && !current.includes(e.node.id),
    );
    if (closed.length === 0) return;
    const lazyOpened = closed.filter((e) => e.lazy && !this.requestedLazy.has(e.node.id)).map((e) => e.node.id);
    this.commitExpanded([...current, ...closed.map((e) => e.node.id)], lazyOpened);
  }

  /* ---------- selection ---------- */

  private checkedState(node: TreeNode): 'true' | 'false' | 'mixed' {
    const selected = this.currentSelected;
    const descendants = this.selectChildren ? this.descendantIds(node) : [];
    if (descendants.length === 0) {
      return selected.includes(node.id) ? 'true' : 'false';
    }
    const count = descendants.filter((id) => selected.includes(id)).length;
    if (count === descendants.length) return 'true';
    return count === 0 ? 'false' : 'mixed';
  }

  private commitSelected(next: string[]): void {
    const current = this.currentSelected;
    if (next.length === current.length && next.every((id) => current.includes(id))) return;
    if (this.selected === undefined) {
      this.internalSelected = next;
    }
    if (this.selectable === 'multiple') {
      this.liveMessage = COPY_SELECTED_COUNT(next.length);
    }
    this.dispatchEvent(new CustomEvent<TreeSelectionChangeDetail>('selection-change', { detail: next, bubbles: true, composed: true }));
  }

  private toggleMultiple(node: TreeNode): void {
    const current = new Set(this.currentSelected);
    if (!this.selectChildren) {
      if (current.has(node.id)) current.delete(node.id);
      else current.add(node.id);
      this.commitSelected([...current]);
      return;
    }
    const ids = [node.id, ...this.descendantIds(node)];
    const ancestors = this.ancestors(node.id);
    if (this.checkedState(node) === 'true') {
      for (const id of ids) current.delete(id);
      for (const ancestor of ancestors) current.delete(ancestor.id);
    } else {
      for (const id of ids) current.add(id);
      for (const ancestor of ancestors) {
        if (this.descendantIds(ancestor).every((id) => current.has(id))) current.add(ancestor.id);
      }
    }
    this.commitSelected([...current]);
  }

  /** Space and click: select in `single`, toggle in `multiple`. */
  private selectNode(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.commitSelected([node.id]);
    else if (this.selectable === 'multiple') this.toggleMultiple(node);
  }

  private addToSelection(id: string): void {
    if (!this.currentSelected.includes(id)) this.commitSelected([...this.currentSelected, id]);
  }

  /* ---------- activation ---------- */

  private activate(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.commitSelected([node.id]);
    if (node.href) {
      const link = this.renderRoot.querySelector(`#${CSS.escape(this.itemId(node.id))} > [data-part="nodeRow"] ds-link`);
      link?.shadowRoot?.querySelector('a')?.click();
      return;
    }
    this.dispatchEvent(new CustomEvent<TreeActivateDetail>('activate', { detail: node.id, bubbles: true, composed: true }));
  }

  /* ---------- pointer ---------- */

  private fromExpandButton(event: Event): boolean {
    return (event.target as Element | null)?.closest('[data-part="expandButton"]') != null;
  }

  private handleRowClick(event: MouseEvent, node: TreeNode): void {
    if (node.disabled === true || this.fromExpandButton(event)) return;
    this.focusEntry(node.id, false);
    this.selectNode(node);
  }

  private handleRowDblClick(event: MouseEvent, node: TreeNode): void {
    if (node.disabled === true || this.fromExpandButton(event)) return;
    this.activate(node);
  }

  /* ---------- focus ---------- */

  private readonly handleFocusIn = (event: FocusEvent): void => {
    this.focusWithin = true;
    const item = event.composedPath().find((target): target is HTMLElement => target instanceof HTMLElement && target.getAttribute('role') === 'treeitem');
    const id = item ? this.nodeIdOf(item) : undefined;
    if (id !== undefined && id !== this.focusedId) this.focusedId = id;
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.renderRoot.contains(next)) this.focusWithin = false;
  };

  private nodeIdOf(item: HTMLElement): string | undefined {
    const prefix = `${this.instanceId}-item-`;
    return item.id.startsWith(prefix) ? item.id.slice(prefix.length) : undefined;
  }

  /** Moves the roving stop and DOM focus; keyboard moves pass `viaKeyboard` so `selectOnFocus` can select. */
  private focusEntry(id: string, viaKeyboard: boolean): void {
    this.focusedId = id;
    if (viaKeyboard && this.selectOnFocus && this.selectable === 'single') {
      this.commitSelected([id]);
    }
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`#${CSS.escape(this.itemId(id))}`)?.focus();
    });
  }

  private moveBy(delta: number): VisibleEntry | undefined {
    const items = this.navigable();
    const index = items.findIndex((e) => e.node.id === this.focusedId);
    const target = items[index + delta];
    if (index === -1 || !target) return undefined;
    this.focusEntry(target.node.id, true);
    return target;
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += char.toLowerCase();
    const items = this.navigable();
    const index = items.findIndex((e) => e.node.id === this.focusedId);
    const start = this.typeahead.length === 1 ? index + 1 : Math.max(index, 0);
    const ordered = [...items.slice(start), ...items.slice(0, start)];
    const match = ordered.find((e) => e.node.label.toLowerCase().startsWith(this.typeahead));
    if (match && match.node.id !== this.focusedId) this.focusEntry(match.node.id, true);
    this.typeaheadTimer = setTimeout(() => {
      this.typeahead = '';
    }, TYPEAHEAD_RESET_MS);
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const current = this.entry(this.focusedId);
    if (!current) return;
    const multiple = this.selectable === 'multiple';

    if (event.ctrlKey && event.code === 'KeyA') {
      if (!multiple) return;
      event.preventDefault();
      this.commitSelected(this.navigable().map((e) => e.node.id));
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const target = this.moveBy(event.key === 'ArrowDown' ? 1 : -1);
        if (target && event.shiftKey && multiple) this.addToSelection(target.node.id);
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!current.hasChildren) return;
        if (!this.currentExpanded.includes(current.node.id)) {
          this.toggleExpand(current.node);
          return;
        }
        const child = this.navigable().find((e) => e.parentId === current.node.id);
        if (child) this.focusEntry(child.node.id, true);
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        if (current.hasChildren && this.currentExpanded.includes(current.node.id)) {
          this.toggleExpand(current.node);
          return;
        }
        const parent = this.entry(current.parentId ?? null);
        if (parent && parent.node.disabled !== true) this.focusEntry(parent.node.id, true);
        return;
      }
      case 'Home':
      case 'End': {
        event.preventDefault();
        const items = this.navigable();
        const target = event.key === 'Home' ? items[0] : items[items.length - 1];
        if (target) this.focusEntry(target.node.id, true);
        return;
      }
      case 'Enter':
        event.preventDefault();
        this.activate(current.node);
        return;
      case ' ':
        if (this.selectable === 'none') return;
        event.preventDefault();
        this.selectNode(current.node);
        return;
      case '*':
        event.preventDefault();
        this.expandSiblings(current);
        return;
      default:
        if (/^[a-z]$/i.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          this.handleTypeahead(event.key);
        }
    }
  };

  /* ---------- overrides ---------- */

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TreeOverridableBinding[]) {
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
