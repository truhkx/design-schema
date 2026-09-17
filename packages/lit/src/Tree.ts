import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult, type CSSResult } from 'lit';
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
 * A node in the hierarchy. `href` makes the node's label a Link with `tone="inherit"` nested inside the label
 * Text, so it takes the label's font and color (navigation trees); `icon` is an Icon glyph (`folder` and `file`
 * exist for the usual case); `badge` is a short trailing count or status; `children: "lazy"` loads on first
 * expand through the `expand` event.
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

/* copy.* — used verbatim */
const COPY_EXPAND = (label: string): string => `Expand ${label}`;
const COPY_COLLAPSE = (label: string): string => `Collapse ${label}`;
const COPY_SELECTED_COUNT = (count: number): string => `${count} selected`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing here.';

/** constants.typeaheadReset — how long typed characters accumulate (literal-ok, as Listbox). */
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

/**
 * Overridable style bindings. Locked (accessibility-bearing, never overridable): rowHeight, rowSelected,
 * rowSelectedBorder, rowSelectedBorderWidth, labelColor, iconColor, badgeColor, expandButtonSize,
 * checkboxBorder, checkboxSelected, checkboxMark, minTarget, focusRing, focusRingWidth.
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
  checkboxBorderWidth: '--ds-tree-checkbox-border-width',
  checkboxBackground: '--ds-tree-checkbox-background',
  checkboxRadius: '--ds-tree-checkbox-radius',
  fontFamily: '--ds-tree-font-family',
  fontSize: '--ds-tree-font-size',
  lineHeight: '--ds-tree-line-height',
  disabledOpacity: '--ds-tree-disabled-opacity',
  transition: '--ds-tree-transition',
};

/**
 * Defaults of the bindings forwarded to a composed child's `overrides`. A forwarded binding reaches the child
 * that way only, so a consumer's CSS on the matching `--ds-tree-*` hook does not reach it — override it through
 * the `overrides` property instead.
 */
const LABEL_SELECTED_WEIGHT: TokenRef = 'font.weight.medium';
const HEADING_SIZE: TokenRef = 'font.size.md';
const BADGE_SIZE: TokenRef = 'font.size.xs';
const FONT_FAMILY: TokenRef = 'font.family.body';
const FONT_SIZE: TokenRef = 'font.size.sm';
const LINE_HEIGHT: TokenRef = 'font.lineHeight.normal';
/** iconColor (locked) — the glyph tone, forwarded so the Icon does not fall back to currentColor. */
const ICON_COLOR: Partial<Record<'color', TokenRef>> = { color: 'color.foreground.muted' };

let idCounter = 0;

/** One visible node in the flattened list the keyboard moves over. */
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
 * tabindex on the treeitems; arrows move, Enter activates, Space selects.
 *
 * @fires selection-change - Every selected id, in tree order, as a bare array.
 * @fires expand-change - Every expanded id, in the order they were opened, as a bare array.
 * @fires expand - A still-`"lazy"` node was opened, with its id; fires before `expand-change`.
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
      /* labelColor (locked): the tree's own foreground; the label Text takes its default tone */
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
      /* focusRing / focusRingWidth (locked) */
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='nodeRow'] {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--ds-tree-row-gap);
      /* rowHeight / minTarget (locked) */
      min-block-size: var(--size-target-min);
      padding-inline: var(--ds-tree-row-padding-inline);
      border-radius: var(--ds-tree-row-radius);
      cursor: pointer;
      transition: background-color var(--ds-tree-transition) var(--motion-easing-standard);
    }

    [data-part='nodeRow']:hover {
      background: var(--ds-tree-row-hover);
    }

    /* rowSelected (locked): the fill stays under the hover fill on a selected row */
    [data-part='node'][aria-selected='true'] > [data-part='nodeRow'],
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow'] {
      background: var(--color-background-strong);
    }

    /* rowSelectedBorder / rowSelectedBorderWidth (locked): drawn over the row, so selecting shifts nothing */
    [data-part='node'][aria-selected='true'] > [data-part='nodeRow']::before,
    [data-part='node'][aria-checked='true'] > [data-part='nodeRow']::before {
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

    /* expandButtonSize (locked): the square the tree reserves around an unmodified ghost Button */
    [data-part='expandButton'] {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--size-target-min);
      block-size: var(--size-target-min);
    }

    .expand-spacer {
      flex: none;
      inline-size: var(--size-target-min);
    }

    .chevron {
      transition: transform var(--ds-tree-transition) var(--motion-easing-standard);
    }

    .chevron[data-expanded] {
      transform: rotate(90deg);
    }

    /* The collapsed chevron is mirrored in RTL. */
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
      /* checkboxGap: the row gap already sits after the checkbox, so only the difference is added */
      margin-inline-end: calc(var(--ds-tree-checkbox-gap) - var(--ds-tree-row-gap));
      /* checkboxBorder (locked) */
      border: var(--ds-tree-checkbox-border-width) solid var(--color-control-border);
      border-radius: var(--ds-tree-checkbox-radius);
      background: var(--ds-tree-checkbox-background);
      /* checkboxMark (locked): the check or dash Icon takes this as currentColor */
      color: var(--color-control-selected-foreground);
    }

    /* checkboxSelected (locked): checked or mixed takes the fill on both border and background */
    [data-part='checkbox'][data-state='checked'],
    [data-part='checkbox'][data-state='mixed'] {
      background: var(--color-control-selected-background);
      border-color: var(--color-control-selected-background);
    }

    [data-part='icon'],
    [data-part='badge'] {
      flex: none;
    }

    [data-part='group'] {
      position: relative;
    }

    /* guideLine / guideLineWidth: a vertical line under the open parent, aligned to its chevron */
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

  /** Show the label as a Heading above the tree (the tree is then `aria-labelledby` it instead of `aria-label`). */
  @property({ type: Boolean, reflect: true, attribute: 'show-label' }) accessor showLabel = false;

  /** Heading level of the visible label in the page outline; its size is `headingSize` regardless. */
  @property({ type: String, reflect: true, attribute: 'heading-level' }) accessor headingLevel: TreeHeadingLevel = '2';

  /** The hierarchy. */
  @property({ attribute: false }) accessor nodes: TreeNode[] = [];

  /** Controlled expanded ids. */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array, never a lazy one. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** `single`: one current node. `multiple`: checkbox-like selection. `none`: expand/collapse only. */
  @property({ type: String, reflect: true }) accessor selectable: TreeSelectable = 'single';

  /** Controlled selected ids. Always an array, even in `single` mode (zero or one element). */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** With `multiple`, selecting a parent selects its loaded, enabled descendants and parents show indeterminate. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** With `single`, moving focus also selects. Off by default: focus moves, Enter or Space selects. */
  @property({ type: Boolean, reflect: true, attribute: 'select-on-focus' }) accessor selectOnFocus = false;

  /** Vertical guide lines under open parents. The attribute is the negated `hide-guides`. */
  @property({ attribute: 'hide-guides', reflect: true, converter: NEGATED_BOOLEAN }) accessor showGuides = true;

  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<TreeOverridableBinding, TokenRef | undefined>>
    | undefined;

  @state() private accessor internalExpanded: string[] = [];
  @state() private accessor internalSelected: string[] = [];
  /** The treeitem carrying the roving tabindex. */
  @state() private accessor focusedId: string | null = null;
  @state() private accessor liveMessage = '';

  private readonly instanceId = `ds-tree-${++idCounter}`;
  /** Lazy nodes already asked for: `expand` fires once per node until the caller replaces `children`. */
  private readonly requestedLazy = new Set<string>();
  private focusWithin = false;
  private followingHref = false;
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
      this.internalExpanded = this.initialExpanded();
      this.internalSelected = [...(this.defaultSelected ?? [])];
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    this.syncRovingStop();
  }

  protected override updated(): void {
    void this.demoteComposedControls();
    if (import.meta.env.DEV && !this.label && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn('<ds-tree> requires a `label`: it names the tree for assistive technology.', this);
    }
  }

  /** Tab lands on the selected node, else the first; while focus is inside, the focused node keeps the stop. */
  private syncRovingStop(): void {
    const ids = this.navigable().map((entry) => entry.node.id);
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
          ? html`<div id=${headingId} data-part="heading" part="heading">
              <ds-heading
                level=${this.headingLevel}
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
          @focusin=${this.handleFocusIn}
          @focusout=${this.handleFocusOut}
        >
          ${this.nodes.map((node, index) => this.renderNode(node, 1, index + 1, this.nodes.length))}
        </ul>
        ${this.nodes.length === 0
          ? html`<ds-text data-part="emptyState" part="emptyState" tone="muted">${COPY_EMPTY}</ds-text>`
          : nothing}
        ${this.selectable === 'multiple'
          ? html`<span class="visually-hidden" role="status">${this.liveMessage}</span>`
          : nothing}
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
    // A node with `href` is marked by the row alone, so the heavier label weight is not forwarded to its Text.
    const marked = (selected || checked === 'true') && node.href === undefined;
    const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontFamily: this.overrides?.fontFamily ?? FONT_FAMILY,
      fontSize: this.overrides?.fontSize ?? FONT_SIZE,
      lineHeight: this.overrides?.lineHeight ?? LINE_HEIGHT,
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
            ? html`<span
                data-part="expandButton"
                part="expandButton"
                aria-hidden="true"
                @click=${(event: MouseEvent) => this.handleChevronClick(event, node)}
                @press=${(event: Event) => event.stopPropagation()}
              >
                <ds-button
                  variant="ghost"
                  size="sm"
                  icon-only
                  tabindex="-1"
                  ?disabled=${disabled}
                  label=${expanded ? COPY_COLLAPSE(node.label) : COPY_EXPAND(node.label)}
                >
                  <ds-icon
                    slot="leading-icon"
                    class="chevron"
                    data-expanded=${ifDefined(expanded ? '' : undefined)}
                    name="chevron-right"
                  ></ds-icon>
                </ds-button>
              </span>`
            : html`<span class="expand-spacer" aria-hidden="true"></span>`}
          ${checked !== undefined
            ? html`<span
                data-part="checkbox"
                part="checkbox"
                aria-hidden="true"
                data-state=${checked === 'true' ? 'checked' : checked}
              >
                ${checked === 'true'
                  ? html`<ds-icon name="check"></ds-icon>`
                  : checked === 'mixed'
                    ? html`<ds-icon name="dash"></ds-icon>`
                    : nothing}
              </span>`
            : nothing}
          ${node.icon !== undefined
            ? html`<ds-icon data-part="icon" part="icon" name=${node.icon} .overrides=${ICON_COLOR}></ds-icon>`
            : nothing}
          <ds-text data-part="label" part="label" element="span" .overrides=${labelOverrides}
            >${node.href !== undefined
              ? html`<span data-part="link" part="link"
                  ><ds-link tone="inherit" tabindex="-1" href=${node.href} label=${node.label}></ds-link
                ></span>`
              : node.label}</ds-text
          >
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
                : this.renderLoading(level + 1)}
            </ul>`
          : nothing}
      </li>
    `;
  }

  /** The lazy placeholder: a treeitem the arrows never land on, under an `aria-busy` parent. */
  private renderLoading(level: number): TemplateResult {
    return html`<li
      role="treeitem"
      aria-level=${level}
      aria-disabled="true"
      class="loading"
      style=${styleMap({
        paddingInlineStart: `calc(var(--ds-tree-row-padding-inline) + ${level - 1} * var(--ds-tree-indent) + var(--size-target-min))`,
      })}
    >
      <ds-text element="span" tone="muted">${COPY_LOADING}</ds-text>
    </li>`;
  }

  /* ---------- hierarchy ---------- */

  private flatten(nodes: TreeNode[], level: number, parentId: string | undefined, out: VisibleEntry[]): VisibleEntry[] {
    for (const node of nodes) {
      out.push({ node, level, parentId, hasChildren: hasChildrenOf(node), lazy: node.children === 'lazy' });
      if (Array.isArray(node.children) && this.currentExpanded.includes(node.id)) {
        this.flatten(node.children, level + 1, node.id, out);
      }
    }
    return out;
  }

  private visible(): VisibleEntry[] {
    return this.flatten(this.nodes, 1, undefined, []);
  }

  /** Visible, enabled nodes: what the arrows, Home/End, type-ahead and Control+A move across. */
  private navigable(): VisibleEntry[] {
    return this.visible().filter((entry) => entry.node.disabled !== true);
  }

  private entry(id: string | null): VisibleEntry | undefined {
    return id === null ? undefined : this.visible().find((candidate) => candidate.node.id === id);
  }

  /**
   * The initial expansion. `["*"]` opens every node whose `children` is a non-empty array and never a lazy one;
   * a lazy id listed explicitly stays closed until the user opens it, since `expand` only fires for user acts.
   */
  private initialExpanded(): string[] {
    const lazyIds = new Set<string>();
    const loadedParents: string[] = [];
    const walk = (list: TreeNode[]): void => {
      for (const node of list) {
        if (node.children === 'lazy') {
          lazyIds.add(node.id);
        } else if (Array.isArray(node.children) && node.children.length > 0) {
          loadedParents.push(node.id);
          walk(node.children);
        }
      }
    };
    walk(this.nodes);
    const wanted = this.defaultExpanded ?? [];
    return wanted.includes('*') ? loadedParents : wanted.filter((id) => !lazyIds.has(id));
  }

  /** Loaded, enabled descendants: what `selectChildren` cascades over (a lazy subtree contributes nothing). */
  private cascadeIds(node: TreeNode): string[] {
    const ids: string[] = [];
    const walk = (children: TreeNode[] | 'lazy' | undefined): void => {
      if (!Array.isArray(children)) return;
      for (const child of children) {
        if (child.disabled !== true) ids.push(child.id);
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

  /** `selection-change` reports its ids in tree (document) order. */
  private inTreeOrder(ids: string[]): string[] {
    const pending = new Set(ids);
    const ordered: string[] = [];
    const walk = (list: TreeNode[]): void => {
      for (const node of list) {
        if (pending.delete(node.id)) ordered.push(node.id);
        if (Array.isArray(node.children)) walk(node.children);
      }
    };
    walk(this.nodes);
    return [...ordered, ...ids.filter((id) => pending.has(id))];
  }

  private itemId(id: string): string {
    return `${this.instanceId}-item-${id}`;
  }

  /* ---------- expansion ---------- */

  /** `expand` fires before the `expand-change` of the same act, once per still-lazy node. */
  private commitExpanded(next: string[], lazyOpened: string[]): void {
    for (const id of lazyOpened) {
      this.requestedLazy.add(id);
      this.dispatchEvent(new CustomEvent<TreeExpandDetail>('expand', { detail: id, bubbles: true, composed: true }));
    }
    if (this.expanded === undefined) {
      this.internalExpanded = next;
    }
    this.dispatchEvent(
      new CustomEvent<TreeExpandChangeDetail>('expand-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleExpand(node: TreeNode): void {
    if (!hasChildrenOf(node) || node.disabled === true) return;
    const open = this.currentExpanded.includes(node.id);
    const next = open ? this.currentExpanded.filter((id) => id !== node.id) : [...this.currentExpanded, node.id];
    const lazyOpened = !open && node.children === 'lazy' && !this.requestedLazy.has(node.id) ? [node.id] : [];
    this.commitExpanded(next, lazyOpened);
  }

  /** `*`: opens every enabled sibling of the focused node, the focused node included. */
  private expandSiblings(entry: VisibleEntry): void {
    const current = this.currentExpanded;
    const closed = this.visible().filter(
      (candidate) =>
        candidate.parentId === entry.parentId &&
        candidate.hasChildren &&
        candidate.node.disabled !== true &&
        !current.includes(candidate.node.id),
    );
    if (closed.length === 0) return;
    const lazyOpened = closed
      .filter((candidate) => candidate.lazy && !this.requestedLazy.has(candidate.node.id))
      .map((candidate) => candidate.node.id);
    this.commitExpanded([...current, ...closed.map((candidate) => candidate.node.id)], lazyOpened);
  }

  /* ---------- selection ---------- */

  /** A cascading parent's state is derived from its loaded, enabled descendants. */
  private checkedState(node: TreeNode): 'true' | 'false' | 'mixed' {
    const selected = this.currentSelected;
    const descendants = this.selectChildren ? this.cascadeIds(node) : [];
    if (descendants.length === 0) {
      return selected.includes(node.id) ? 'true' : 'false';
    }
    const count = descendants.filter((id) => selected.includes(id)).length;
    if (count === descendants.length) return 'true';
    return count === 0 ? 'false' : 'mixed';
  }

  /** Fires only when the set actually changes, with the ids in tree order. */
  private commitSelected(next: string[]): void {
    const ordered = this.inTreeOrder(next);
    const current = this.currentSelected;
    if (ordered.length === current.length && ordered.every((id) => current.includes(id))) return;
    if (this.selected === undefined) {
      this.internalSelected = ordered;
    }
    if (this.selectable === 'multiple') {
      this.liveMessage = COPY_SELECTED_COUNT(ordered.length);
    }
    this.dispatchEvent(
      new CustomEvent<TreeSelectionChangeDetail>('selection-change', {
        detail: ordered,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * The cascade: a node's id is in the selection exactly when all its enabled loaded descendants are, and
   * unselecting it removes every ancestor id too.
   */
  private cascade(node: TreeNode, select: boolean, into: Set<string>): void {
    const ids = [node.id, ...this.cascadeIds(node)];
    if (select) {
      for (const id of ids) into.add(id);
      for (const ancestor of this.ancestors(node.id)) {
        if (this.cascadeIds(ancestor).every((id) => into.has(id))) into.add(ancestor.id);
      }
      return;
    }
    for (const id of ids) into.delete(id);
    for (const ancestor of this.ancestors(node.id)) into.delete(ancestor.id);
  }

  private toggleMultiple(node: TreeNode): void {
    const next = new Set(this.currentSelected);
    if (this.selectChildren) {
      this.cascade(node, this.checkedState(node) !== 'true', next);
    } else if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    this.commitSelected([...next]);
  }

  /** Space and click: select in `single`, toggle in `multiple`. */
  private selectNode(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.commitSelected([node.id]);
    else if (this.selectable === 'multiple') this.toggleMultiple(node);
  }

  /** Shift+ArrowDown/Up adds the node it lands on, cascading like Space when `selectChildren`. */
  private extendSelection(node: TreeNode): void {
    const next = new Set(this.currentSelected);
    if (this.selectChildren) this.cascade(node, true, next);
    else next.add(node.id);
    this.commitSelected([...next]);
  }

  /* ---------- activation ---------- */

  private activate(node: TreeNode): void {
    if (node.disabled === true) return;
    if (this.selectable === 'single') this.commitSelected([node.id]);
    if (node.href !== undefined) {
      // An href node is followed by clicking its composed link, so the page's click routing sees it, and
      // fires no `activate`. The flag keeps that synthetic click from re-entering the row handler.
      const link = this.renderRoot.querySelector<HTMLElement>(
        `#${CSS.escape(this.itemId(node.id))} [data-part="link"] ds-link`,
      );
      this.followingHref = true;
      link?.shadowRoot?.querySelector('a')?.click();
      this.followingHref = false;
      return;
    }
    this.dispatchEvent(
      new CustomEvent<TreeActivateDetail>('activate', { detail: node.id, bubbles: true, composed: true }),
    );
  }

  /* ---------- pointer ---------- */

  /** The chevron toggles expansion and focuses the node, without changing the selection. */
  private handleChevronClick(event: MouseEvent, node: TreeNode): void {
    event.stopPropagation();
    if (node.disabled === true) return;
    this.toggleExpand(node);
    this.focusEntry(node.id, false);
  }

  private handleRowClick(event: MouseEvent, node: TreeNode): void {
    if (this.followingHref || node.disabled === true) return;
    // A double-click toggles once, then activates: the second click must not toggle again.
    if (event.detail >= 2) return;
    this.focusEntry(node.id, false);
    this.selectNode(node);
  }

  private handleRowDblClick(event: MouseEvent, node: TreeNode): void {
    if (this.followingHref || node.disabled === true) return;
    event.preventDefault();
    this.activate(node);
  }

  /* ---------- focus ---------- */

  private readonly handleFocusIn = (event: FocusEvent): void => {
    this.focusWithin = true;
    const item = event
      .composedPath()
      .find((target): target is HTMLElement => target instanceof HTMLElement && target.getAttribute('role') === 'treeitem');
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

  /** Moves the roving stop and DOM focus; keyboard moves pass `viaKeyboard`, so `selectOnFocus` can select. */
  private focusEntry(id: string, viaKeyboard: boolean): void {
    this.focusWithin = true;
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
    const index = items.findIndex((entry) => entry.node.id === this.focusedId);
    const target = items[index + delta];
    if (index === -1 || !target) return undefined;
    this.focusEntry(target.node.id, true);
    return target;
  }

  /** Any printable character moves to the next visible node whose label starts with the buffer. */
  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeahead += char.toLowerCase();
    const items = this.navigable();
    const index = items.findIndex((entry) => entry.node.id === this.focusedId);
    const start = this.typeahead.length === 1 ? index + 1 : Math.max(index, 0);
    const ordered = [...items.slice(start), ...items.slice(0, start)];
    const match = ordered.find((entry) => entry.node.label.toLowerCase().startsWith(this.typeahead));
    if (match && match.node.id !== this.focusedId) this.focusEntry(match.node.id, true);
    this.typeaheadTimer = setTimeout(() => {
      this.typeahead = '';
    }, TYPEAHEAD_RESET_MS);
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const current = this.entry(this.focusedId);
    if (!current) return;
    const multiple = this.selectable === 'multiple';

    // Control+A (Cmd on macOS), bound by key code so a non-QWERTY layout still reaches it.
    if (event.code === 'KeyA' && (event.ctrlKey || event.metaKey)) {
      if (!multiple) return;
      event.preventDefault();
      this.commitSelected(this.navigable().map((entry) => entry.node.id));
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const target = this.moveBy(event.key === 'ArrowDown' ? 1 : -1);
        if (target && event.shiftKey && multiple) this.extendSelection(target.node);
        return;
      }
      case 'ArrowRight': {
        event.preventDefault();
        if (!current.hasChildren) return;
        if (!this.currentExpanded.includes(current.node.id)) {
          this.toggleExpand(current.node);
          return;
        }
        const child = this.navigable().find((entry) => entry.parentId === current.node.id);
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
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          this.handleTypeahead(event.key);
        }
    }
  };

  /**
   * The tree is one tab stop, so the composed chevron Buttons and node Links are reachable by the arrows and
   * Enter, not by Tab. A same-value write still queues a mutation record, so the attribute is compared first.
   */
  private async demoteComposedControls(): Promise<void> {
    const hosts = [
      ...this.renderRoot.querySelectorAll<LitElement>('[data-part="expandButton"] ds-button, [data-part="link"] ds-link'),
    ];
    await Promise.all(hosts.map((host) => host.updateComplete));
    for (const host of hosts) {
      const control = host.shadowRoot?.querySelector('button, a');
      if (control && control.getAttribute('tabindex') !== '-1') {
        control.setAttribute('tabindex', '-1');
      }
    }
  }

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
