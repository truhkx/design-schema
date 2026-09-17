import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import type { IconName } from './Icon.js';

export type TabsActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsFit = 'start' | 'fill';

/** Shape of each entry in `tabs`. */
export interface TabsItem {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
}

/** @deprecated Use `TabsItem`. */
export type TabsTab = TabsItem;

/** Detail carried by the `change` CustomEvent. */
export interface TabsChangeDetail {
  value: string;
}

/** Overridable style hooks; see the `overrides` property. Locked bindings (`tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `indicatorThickness`, `badgeColor`, `minTarget`, `focusRing`, `focusRingWidth`) are excluded. */
export type TabsOverridableBinding =
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'tabGap'
  | 'listGap'
  | 'listBorder'
  | 'listBorderWidth'
  | 'panelGap'
  | 'badgeSize'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'radius'
  | 'transition'
  | 'disabledOpacity';

const HOOKS: Record<TabsOverridableBinding, string> = {
  tabPaddingBlock: '--ds-tabs-tab-padding-block',
  tabPaddingInline: '--ds-tabs-tab-padding-inline',
  tabGap: '--ds-tabs-tab-gap',
  listGap: '--ds-tabs-list-gap',
  listBorder: '--ds-tabs-list-border',
  listBorderWidth: '--ds-tabs-list-border-width',
  panelGap: '--ds-tabs-panel-gap',
  badgeSize: '--ds-tabs-badge-size',
  fontFamily: '--ds-tabs-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-tabs-font-size',
  fontWeight: '--ds-tabs-font-weight',
  lineHeight: '--ds-tabs-line-height',
  radius: '--ds-tabs-radius',
  transition: '--ds-tabs-transition',
  disabledOpacity: '--ds-tabs-disabled-opacity',
};

type ControlsElement = HTMLElement & { ariaControlsElements?: readonly Element[] | null };

/**
 * `<ds-tab-panel>` — the light-DOM wrapper for one Tabs panel (anatomy: panel).
 *
 * `<ds-tabs>` manages its `hidden`, `role`, `tabindex` and `aria-label`
 * attributes; consumers only set `id` (matching a `tabs[].id`) and put content
 * inside. The panel is named with `aria-label` (the tab's label) rather than
 * `aria-labelledby`, because the tab lives in `<ds-tabs>`'s shadow root and a
 * reference cannot point into a descendant shadow tree.
 */
@customElement('ds-tab-panel')
export class DsTabPanel extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      min-inline-size: 0;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'TabPanel');
    this.setAttribute('data-part', 'panel');
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

/**
 * `<ds-tabs>` — Tabs (category: navigation, APG pattern: tabs).
 *
 * `<ds-tabs label="Project sections" .tabs=${tabs}>` renders a `role="tablist"`
 * of native `<button role="tab">` in its shadow root. Panels are light-DOM
 * `<ds-tab-panel id>` children; `<ds-tabs>` stamps `role`, `tabindex` and
 * `aria-label` onto them and toggles `hidden` on the unselected ones. Panels
 * are never moved, detached or re-appended, so on Lit an unselected panel is
 * always kept in the tree (hidden) and `keepMounted` changes nothing further.
 *
 * The list is one roving-tabindex stop: arrow keys along `orientation` move
 * focus between enabled tabs and wrap, Home/End jump, `automatic` activation
 * selects as focus moves and `manual` selects on Enter/Space (a native button
 * click). Disabled tabs are `aria-disabled`, skipped and never selected.
 *
 * ## When to use
 *
 * Two to about seven views of equal standing that the user switches between
 * often. `manual` when a panel is expensive, `vertical` when horizontal room is
 * short, `fill` on phones for two to four tabs.
 *
 * ## When not to use
 *
 * Not for navigation between pages (a nav landmark of Links), not for a
 * sequence, and not when several panels must be visible at once.
 *
 * @fires change - The selected tab changed by user action; `detail: { value }`.
 * @slot - `<ds-tab-panel>` elements, one per tab, in the same order.
 */
@customElement('ds-tabs')
export class DsTabs extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      --ds-tabs-tab-color: var(--color-foreground-muted);
      --ds-tabs-tab-selected-color: var(--color-foreground-strong);
      --ds-tabs-tab-hover-background: var(--color-background-subtle);
      --ds-tabs-tab-padding-block: var(--space-sm);
      --ds-tabs-tab-padding-inline: var(--space-md);
      --ds-tabs-tab-gap: var(--layout-gap-tight);
      --ds-tabs-list-gap: var(--layout-gap-none);
      --ds-tabs-indicator: var(--color-control-selected-background);
      --ds-tabs-indicator-thickness: var(--border-width-focus);
      --ds-tabs-list-border: var(--color-border);
      --ds-tabs-list-border-width: var(--border-width-thin);
      --ds-tabs-panel-gap: var(--layout-gap-loose);
      --ds-tabs-badge-color: var(--color-foreground-muted);
      --ds-tabs-badge-size: var(--font-size-xs);
      --ds-tabs-font-family: var(--font-family-body);
      --ds-tabs-font-size: var(--font-size-md);
      --ds-tabs-font-weight: var(--font-weight-medium);
      --ds-tabs-line-height: var(--font-line-height-normal);
      --ds-tabs-radius: var(--radius-sm);
      --ds-tabs-min-target: var(--size-target-comfortable);
      --ds-tabs-focus-ring: var(--color-border-focus);
      --ds-tabs-focus-ring-width: var(--border-width-focus);
      --ds-tabs-transition: var(--motion-duration-fast);
      --ds-tabs-disabled-opacity: var(--opacity-disabled);

      display: flex;
      flex-direction: column;
      /* panelGap: between the tab list and the panel */
      gap: var(--ds-tabs-panel-gap);
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation='vertical']) {
      flex-direction: row;
      align-items: flex-start;
    }

    [data-part='tablist'] {
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      flex: none;
      gap: var(--ds-tabs-list-gap);
      border-block-end: var(--ds-tabs-list-border-width) solid var(--ds-tabs-list-border);
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
    }

    :host([orientation='vertical']) [data-part='tablist'] {
      flex-direction: column;
      border-block-end: none;
      border-inline-end: var(--ds-tabs-list-border-width) solid var(--ds-tabs-list-border);
      overflow-x: hidden;
      overflow-y: auto;
    }

    [data-part='tab'] {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: flex-start;
      gap: var(--ds-tabs-tab-gap);
      min-block-size: var(--ds-tabs-min-target);
      min-inline-size: var(--ds-tabs-min-target);
      margin: 0;
      padding-block: var(--ds-tabs-tab-padding-block);
      padding-inline: var(--ds-tabs-tab-padding-inline);
      border: 0;
      border-radius: var(--ds-tabs-radius);
      background: transparent;
      font-family: var(--ds-tabs-font-family);
      font-size: var(--ds-tabs-font-size);
      font-weight: var(--ds-tabs-font-weight);
      line-height: var(--ds-tabs-line-height);
      color: var(--ds-tabs-tab-color);
      white-space: nowrap;
      cursor: pointer;
    }

    /* fill is horizontal only: vertical tabs always span the list's inline size. */
    :host([fit='fill']:not([orientation='vertical'])) [data-part='tab'] {
      flex: 1 1 0%;
      justify-content: center;
    }

    [data-part='tab']:hover:not([aria-disabled='true']) {
      background: var(--ds-tabs-tab-hover-background);
    }

    /* Selection is also carried by aria-selected and the indicator, not color alone. */
    [data-part='tab'][aria-selected='true'] {
      color: var(--ds-tabs-tab-selected-color);
    }

    [data-part='tab']:focus-visible {
      outline: var(--ds-tabs-focus-ring-width) solid var(--ds-tabs-focus-ring);
      outline-offset: calc(-1 * var(--ds-tabs-focus-ring-width));
    }

    [data-part='tab'][aria-disabled='true'] {
      opacity: var(--ds-tabs-disabled-opacity);
      cursor: not-allowed;
    }

    [data-part='tabIcon'] {
      flex: none;
    }

    [data-part='tabLabel'] {
      min-inline-size: 0;
    }

    [data-part='tabBadge'] {
      flex: none;
      font-size: var(--ds-tabs-badge-size);
      line-height: var(--ds-tabs-line-height);
      color: var(--ds-tabs-badge-color);
    }

    [data-part='indicator'] {
      position: absolute;
      background: var(--ds-tabs-indicator);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--ds-tabs-transition) var(--motion-easing-standard),
        inline-size var(--ds-tabs-transition) var(--motion-easing-standard),
        block-size var(--ds-tabs-transition) var(--motion-easing-standard);
    }

    /* Horizontal: an underline flush against the list border at the bottom edge. */
    :host(:not([orientation='vertical'])) [data-part='indicator'] {
      inset-block-end: 0;
      inset-inline-start: 0;
      block-size: var(--ds-tabs-indicator-thickness);
    }

    /* Vertical: a side bar flush against the inline-end edge, next to the panels. */
    :host([orientation='vertical']) [data-part='indicator'] {
      inset-block-start: 0;
      inset-inline-end: 0;
      inline-size: var(--ds-tabs-indicator-thickness);
    }

    ::slotted(*) {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='indicator'] {
        transition: none;
      }
    }
  `;

  /** The tabs in order. A property, not an attribute. */
  @property({ attribute: false }) accessor tabs: TabsItem[] = [];

  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  @property() accessor label: string = '';

  /** Controlled selected tab id. Omit for uncontrolled. */
  @property({ type: String, reflect: true }) accessor value: string | undefined;

  /** Initially selected tab id. Defaults to the first enabled tab. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** `automatic` selects a tab as arrow keys move to it; `manual` moves focus only and selects on Enter/Space. */
  @property({ type: String, reflect: true }) accessor activation: TabsActivation = 'automatic';

  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  @property({ type: String, reflect: true }) accessor orientation: TabsOrientation = 'horizontal';

  /** `start` packs tabs at the start; `fill` stretches them across the width. Horizontal only: vertical tabs always span the list's inline size. */
  @property({ type: String, reflect: true }) accessor fit: TabsFit = 'start';

  /**
   * Keep unselected panels in the tree (hidden). On Lit panels are the
   * consumer's light-DOM children and are only ever hidden, never detached, so
   * both values keep them in the tree.
   */
  @property({ type: Boolean, attribute: 'keep-mounted' }) accessor keepMounted = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled tab). */
  @state() private accessor internalValue: string | undefined;

  /** The tab carrying the roving tabindex. */
  @state() private accessor focusedId: string | null = null;

  @query('[data-part=tablist]') private accessor tablistEl!: HTMLElement | null;
  @query('[data-part=indicator]') private accessor indicatorEl!: HTMLElement | null;

  private resizeObserver: ResizeObserver | undefined;
  private lastScrolledId: string | null = null;
  private readonly warned = new Set<string>();

  /** The selected tab id, controlled or not. */
  get currentValue(): string | null {
    return this.value ?? this.internalValue ?? null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Tabs');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override firstUpdated(): void {
    if (this.tablistEl && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
      this.resizeObserver.observe(this.tablistEl);
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (this.internalValue === undefined && (changed.has('tabs') || changed.has('defaultValue'))) {
      this.internalValue = this.defaultValue ?? this.tabs.find((tab) => tab.disabled !== true)?.id;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncPanels();
    this.updateIndicator();
    this.scrollSelectedIntoView();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const selected = this.currentValue;
    const rovingId = this.rovingId();
    return html`
      <div
        data-part="tablist"
        part="tablist"
        role="tablist"
        aria-label=${this.label}
        aria-orientation=${this.orientation}
        @keydown=${this.handleKeydown}
        @focusout=${this.handleFocusOut}
      >
        ${this.tabs.map((tab, index) => this.renderTab(tab, index, tab.id === selected, tab.id === rovingId))}
        <span data-part="indicator" part="indicator" aria-hidden="true"></span>
      </div>
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  private renderTab(tab: TabsItem, index: number, selected: boolean, roving: boolean): TemplateResult {
    const disabled = tab.disabled === true;
    const hasBadge = tab.badge !== undefined && tab.badge !== '';
    return html`
      <button
        type="button"
        data-part="tab"
        part="tab"
        role="tab"
        id="tab-${index}"
        data-id=${tab.id}
        aria-selected=${selected ? 'true' : 'false'}
        aria-disabled=${disabled ? 'true' : nothing}
        aria-labelledby=${hasBadge ? `tab-${index}-label tab-${index}-badge` : nothing}
        tabindex=${roving ? 0 : -1}
        @click=${() => this.handleTabClick(tab)}
      >
        ${tab.icon ? html`<ds-icon data-part="tabIcon" part="tabIcon" name=${tab.icon}></ds-icon>` : nothing}
        <span data-part="tabLabel" part="tabLabel" id="tab-${index}-label">${tab.label}</span>
        ${hasBadge
          ? html`<span data-part="tabBadge" part="tabBadge" id="tab-${index}-badge">${tab.badge}</span>`
          : nothing}
      </button>
    `;
  }

  /** The tab that is the list's single tab stop: the focused one, else the selected one, else the first enabled. */
  private rovingId(): string | null {
    const enabled = this.enabledTabs();
    const candidates = [this.focusedId, this.currentValue];
    for (const id of candidates) {
      if (id !== null && enabled.some((tab) => tab.id === id)) {
        return id;
      }
    }
    return enabled[0]?.id ?? null;
  }

  private readonly handleTabClick = (tab: TabsItem): void => {
    if (tab.disabled === true) {
      return;
    }
    this.focusedId = tab.id;
    this.selectTab(tab.id);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const vertical = this.orientation === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    if (event.key === nextKey) {
      event.preventDefault();
      this.moveFocus(1);
    } else if (event.key === prevKey) {
      event.preventDefault();
      this.moveFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusEdge('first');
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusEdge('last');
    }
  };

  /** Leaving the list returns the tab stop to the selected tab. */
  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (next && this.tablistEl?.contains(next)) {
      return;
    }
    this.focusedId = null;
  };

  private handleSlotChange(): void {
    this.syncPanels();
    this.warnInDev();
  }

  private enabledTabs(): TabsItem[] {
    return this.tabs.filter((tab) => tab.disabled !== true);
  }

  private moveFocus(delta: number): void {
    const items = this.enabledTabs();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((tab) => tab.id === this.rovingId());
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    this.focusTab(items[nextIndex]!.id);
  }

  private focusEdge(edge: 'first' | 'last'): void {
    const items = this.enabledTabs();
    const target = edge === 'first' ? items[0] : items[items.length - 1];
    if (target) {
      this.focusTab(target.id);
    }
  }

  private focusTab(id: string): void {
    this.focusedId = id;
    if (this.activation === 'automatic') {
      this.selectTab(id);
    }
    void this.updateComplete.then(() => {
      this.tabElement(id)?.focus();
    });
  }

  /** Reports a user selection. Uncontrolled selection updates at once; controlled waits for `value` to change. */
  private selectTab(id: string): void {
    if (id === this.currentValue) {
      return;
    }
    if (this.value === undefined) {
      this.internalValue = id;
    }
    this.dispatchEvent(
      new CustomEvent<TabsChangeDetail>('change', { detail: { value: id }, bubbles: true, composed: true }),
    );
  }

  private tabElement(id: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`[data-part=tab][data-id="${CSS.escape(id)}"]`);
  }

  private panels(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(':scope > ds-tab-panel'));
  }

  /**
   * Labels each slotted panel, toggles `hidden` on the unselected ones and points
   * each tab's aria-controls at its panel. Never moves, detaches or re-appends a
   * panel, and writes an attribute only when its value differs.
   */
  private syncPanels(): void {
    const selected = this.currentValue;
    const panels = this.panels();
    for (const panel of panels) {
      const tab = this.tabs.find((candidate) => candidate.id === panel.id);
      if (!tab) {
        // A panel without a matching tab is not rendered (forced hidden); see warnInDev.
        if (!panel.hidden) panel.hidden = true;
        continue;
      }
      setAttr(panel, 'role', 'tabpanel');
      setAttr(panel, 'tabindex', '0');
      setAttr(panel, 'aria-label', tab.label);
      const hide = tab.id !== selected;
      if (panel.hidden !== hide) panel.hidden = hide;
    }
    for (const button of this.renderRoot.querySelectorAll<ControlsElement>('[data-part=tab]')) {
      if (!('ariaControlsElements' in button)) break;
      const panel = panels.find((candidate) => candidate.id === button.dataset['id']);
      const current = button.ariaControlsElements ?? null;
      if (panel ? current?.[0] !== panel : current !== null) {
        button.ariaControlsElements = panel ? [panel] : null;
      }
    }
  }

  private updateIndicator(): void {
    const indicator = this.indicatorEl;
    if (!indicator) {
      return;
    }
    const selected = this.currentValue;
    const tabEl = selected !== null ? this.tabElement(selected) : null;
    if (!tabEl) {
      indicator.style.opacity = '0';
      return;
    }
    // The first placement is instant; only movement between tabs animates.
    const first = indicator.style.opacity !== '1';
    if (first) indicator.style.transition = 'none';
    indicator.style.opacity = '1';
    if (this.orientation === 'vertical') {
      indicator.style.transform = `translateY(${tabEl.offsetTop}px)`;
      indicator.style.blockSize = `${tabEl.offsetHeight}px`;
      indicator.style.inlineSize = '';
    } else {
      indicator.style.transform = `translateX(${tabEl.offsetLeft}px)`;
      indicator.style.inlineSize = `${tabEl.offsetWidth}px`;
      indicator.style.blockSize = '';
    }
    if (first) {
      void indicator.offsetWidth;
      indicator.style.transition = '';
    }
  }

  /** Keeps the selected tab visible when the list overflows, scrolling the list only (never the page). */
  private scrollSelectedIntoView(): void {
    const selected = this.currentValue;
    const list = this.tablistEl;
    if (selected === null || selected === this.lastScrolledId || !list) {
      return;
    }
    this.lastScrolledId = selected;
    const tabEl = this.tabElement(selected);
    if (!tabEl) {
      return;
    }
    if (this.orientation === 'vertical') {
      const end = tabEl.offsetTop + tabEl.offsetHeight;
      if (tabEl.offsetTop < list.scrollTop) list.scrollTop = tabEl.offsetTop;
      else if (end > list.scrollTop + list.clientHeight) list.scrollTop = end - list.clientHeight;
    } else {
      const end = tabEl.offsetLeft + tabEl.offsetWidth;
      if (tabEl.offsetLeft < list.scrollLeft) list.scrollLeft = tabEl.offsetLeft;
      else if (end > list.scrollLeft + list.clientWidth) list.scrollLeft = end - list.clientWidth;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TabsOverridableBinding[]) {
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
    const warn = (message: string): void => {
      if (this.warned.has(message)) return;
      this.warned.add(message);
      console.warn(message, this);
    };
    if (!this.label) {
      warn("<ds-tabs> requires a `label`, the tab list's accessible name.");
    }
    const panelIds = new Set(this.panels().map((panel) => panel.id));
    for (const tab of this.tabs) {
      if (!panelIds.has(tab.id)) {
        warn(`<ds-tabs> tab "${tab.id}" has no matching <ds-tab-panel id="${tab.id}">.`);
      }
    }
    const tabIds = new Set(this.tabs.map((tab) => tab.id));
    for (const id of panelIds) {
      if (!tabIds.has(id)) {
        warn(`<ds-tabs> has a <ds-tab-panel id="${id}"> with no matching entry in \`tabs\`; it stays hidden.`);
      }
    }
  }
}

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) {
    el.setAttribute(name, value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tabs': DsTabs;
    'ds-tab-panel': DsTabPanel;
  }
}
