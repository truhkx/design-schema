import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import type { IconName } from './Icon.js';

export type TabsActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsFit = 'start' | 'fill';

/** Shape of each entry in `tabs`. */
export interface TabsTab {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  badge?: string;
}

/** Detail carried by the `change` CustomEvent. */
export interface TabsChangeDetail {
  value: string;
}

/** Overridable style hooks; see the `overrides` property. `tabColor`, `tabSelectedColor`, `tabHoverBackground`, `indicator`, `badgeColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type TabsOverridableBinding =
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'tabGap'
  | 'listGap'
  | 'indicatorThickness'
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
  indicatorThickness: '--ds-tabs-indicator-thickness',
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

/**
 * `<ds-tab-panel>` — the light-DOM wrapper for one Tabs panel (anatomy: panel).
 *
 * `<ds-tabs>` manages its `hidden`, `role`, `tabindex` and `aria-label`
 * attributes from slotchange and selection changes; consumers only set `id`
 * (matching a `tabs[].id`) and put content inside. `aria-label` carries the
 * matching tab's label rather than `aria-labelledby`, because the tab lives in
 * `<ds-tabs>`'s shadow root and an IDREF cannot cross that boundary.
 */
@customElement('ds-tab-panel')
export class DsTabPanel extends LitElement {
  static override styles = css`
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
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

/**
 * `<ds-tabs>` — Tabs (category: navigation, APG pattern: tabs).
 *
 * `<ds-tabs label="Project sections" .tabs=${tabs}>` renders a `role="tablist"`
 * of native `<button role="tab">` in its shadow root, one per entry of `tabs`.
 * Panels are light-DOM `<ds-tab-panel id>` children, slotted after the list;
 * `<ds-tabs>` toggles their `hidden` attribute (and, unless `keepMounted`,
 * detaches unselected ones from the DOM entirely so their state does not
 * survive a switch) and stamps `role`, `tabindex` and `aria-label` onto them.
 * The list is one roving-tabindex stop: arrow keys along `orientation` move
 * real focus between enabled tabs and wrap, `automatic` activation selects as
 * focus moves, `manual` activation only selects on Enter/Space (the browser
 * already fires `click` for a focused `<button>` on either key, so no extra
 * handling is needed). The indicator is an absolutely positioned bar measured
 * from the selected tab's box and animated with `transition`, removed under
 * reduced motion. Selecting a tab fires a composed `change` CustomEvent with
 * `{ value }`.
 *
 * ## When to use
 *
 * Use Tabs to split a region into two to about seven views of equal standing
 * that the user switches between often. Use `manual` activation when a panel
 * is expensive to show, `vertical` when horizontal room is short, and `fill`
 * on phones for two to four tabs.
 *
 * ## When not to use
 *
 * Not for navigation between pages (use a nav landmark of Links), not for a
 * sequence, and not when several panels must be visible at once.
 *
 * @fires change - Fired when the selected tab changes, with `{ value }` in `detail`.
 * @csspart tablist - The `role="tablist"` container (anatomy: tablist).
 * @csspart tab - Each `role="tab"` button (anatomy: tab).
 * @csspart tab-label - A tab's visible label (anatomy: tabLabel).
 * @csspart tab-icon - A tab's leading `<ds-icon>` (anatomy: tabIcon).
 * @csspart indicator - The bar tracking the selected tab (anatomy: indicator).
 */
@customElement('ds-tabs')
export class DsTabs extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--ds-tabs-panel-gap);
      --ds-tabs-tab-padding-block: var(--space-sm);
      --ds-tabs-tab-padding-inline: var(--space-md);
      --ds-tabs-tab-gap: var(--layout-gap-tight);
      --ds-tabs-list-gap: var(--layout-gap-none);
      --ds-tabs-indicator-thickness: var(--border-width-focus);
      --ds-tabs-list-border: var(--color-border);
      --ds-tabs-list-border-width: var(--border-width-thin);
      --ds-tabs-panel-gap: var(--layout-gap-loose);
      --ds-tabs-badge-size: var(--font-size-xs);
      --ds-tabs-font-family: var(--font-family-body);
      --ds-tabs-font-size: var(--font-size-md);
      --ds-tabs-font-weight: var(--font-weight-medium);
      --ds-tabs-line-height: var(--font-line-height-normal);
      --ds-tabs-radius: var(--radius-sm);
      --ds-tabs-transition: var(--motion-duration-fast);
      --ds-tabs-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation='vertical']) {
      flex-direction: row;
      align-items: flex-start;
    }

    .tablist {
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

    :host([orientation='vertical']) .tablist {
      flex-direction: column;
      border-block-end: none;
      border-inline-end: var(--ds-tabs-list-border-width) solid var(--ds-tabs-list-border);
      overflow-x: hidden;
      overflow-y: auto;
    }

    :host([fit='fill']) .tablist {
      flex: 1 1 auto;
    }

    .tab {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: flex-start;
      gap: var(--ds-tabs-tab-gap);
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-tabs-tab-padding-block);
      padding-inline: var(--ds-tabs-tab-padding-inline);
      border: 0;
      border-radius: var(--ds-tabs-radius);
      background: transparent;
      font-family: var(--ds-tabs-font-family);
      font-size: var(--ds-tabs-font-size);
      font-weight: var(--ds-tabs-font-weight);
      line-height: var(--ds-tabs-line-height);
      /* tabColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
      white-space: nowrap;
      cursor: pointer;
      transition: color var(--ds-tabs-transition) var(--motion-easing-standard);
    }

    :host([fit='fill']) .tab {
      flex: 1 1 0%;
      justify-content: center;
    }

    /* tabHoverBackground: color.background.subtle, locked */
    .tab:hover:not(:disabled) {
      background: var(--color-background-subtle);
    }

    /* tabSelectedColor: color.foreground.strong, locked — selection is also conveyed by aria-selected and the indicator, not color alone */
    .tab[aria-selected='true'] {
      color: var(--color-foreground-strong);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .tab:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .tab:disabled {
      opacity: var(--ds-tabs-disabled-opacity);
      cursor: not-allowed;
    }

    .tab-icon {
      flex: none;
    }

    .tab-label {
      min-inline-size: 0;
    }

    /* badgeColor: color.foreground.muted, locked */
    .badge {
      flex: none;
      font-size: var(--ds-tabs-badge-size);
      color: var(--color-foreground-muted);
    }

    /* indicator: color.control.selectedBackground, locked */
    .indicator {
      position: absolute;
      background: var(--color-control-selected-background);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--ds-tabs-transition) var(--motion-easing-standard),
        inline-size var(--ds-tabs-transition) var(--motion-easing-standard),
        block-size var(--ds-tabs-transition) var(--motion-easing-standard);
    }

    :host(:not([orientation='vertical'])) .indicator {
      inset-block-end: 0;
      inset-inline-start: 0;
      block-size: var(--ds-tabs-indicator-thickness);
    }

    :host([orientation='vertical']) .indicator {
      inset-inline-start: 0;
      inset-block-start: 0;
      inline-size: var(--ds-tabs-indicator-thickness);
    }

    ::slotted(*) {
      min-inline-size: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .tab,
      .indicator {
        transition: none;
      }
    }
  `;

  /** The tabs in order. Two to about seven. A property, not an attribute. */
  @property({ attribute: false }) tabs: TabsTab[] = [];

  /** Accessible name of the tab list. Not shown visually. */
  @property() label!: string;

  /** Controlled selected tab id. Omit for uncontrolled. */
  @property({ reflect: true }) value?: string;

  /** Initially selected tab id. Defaults to the first enabled tab. */
  @property({ attribute: 'default-value' }) defaultValue?: string;

  /** `automatic` selects a tab as arrow keys move to it; `manual` moves focus only, selecting on Enter/Space. */
  @property({ reflect: true }) activation: TabsActivation = 'automatic';

  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  @property({ reflect: true }) orientation: TabsOrientation = 'horizontal';

  /** `fill` stretches tabs across the width; `start` packs them at the start. */
  @property({ reflect: true }) fit: TabsFit = 'start';

  /** Keep unselected panels in the light DOM (hidden) so their state survives switching. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) keepMounted = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<TabsOverridableBinding, TokenRef>>;

  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled tab) on first update. */
  @state() private internalValue?: string;

  /** The tab currently carrying the roving tabindex and (usually) real focus. */
  @state() private focusedId: string | null = null;

  @query('.tablist') private readonly tablistEl?: HTMLElement;
  @query('.indicator') private readonly indicatorEl?: HTMLElement;

  /** Panels detached from the light DOM while unselected (default, non-`keepMounted` behaviour). */
  private readonly detachedPanels = new Map<string, HTMLElement>();
  private resizeObserver?: ResizeObserver;
  private lastScrolledId: string | null = null;

  /** The currently selected tab id, controlled or not. */
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
  }

  protected override firstUpdated(): void {
    if (this.tablistEl) {
      this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
      this.resizeObserver.observe(this.tablistEl);
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue ?? this.tabs.find((tab) => tab.disabled !== true)?.id;
      this.focusedId = this.currentValue;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncPanels();
    this.updateIndicator();
    this.maybeScrollSelectedIntoView();
    this.warnInDev();
  }

  protected override render() {
    const selected = this.currentValue;
    return html`
      <div
        class="tablist"
        part="tablist"
        role="tablist"
        aria-label=${this.label}
        aria-orientation=${this.orientation}
        @keydown=${this.handleKeydown}
      >
        ${this.tabs.map((tab) => this.renderTab(tab, tab.id === selected))}
        <span class="indicator" part="indicator" aria-hidden="true"></span>
      </div>
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  private renderTab(tab: TabsTab, selected: boolean) {
    const disabled = tab.disabled === true;
    const focused = (this.focusedId ?? this.currentValue) === tab.id;
    return html`
      <button
        type="button"
        class="tab"
        part="tab"
        role="tab"
        id="tab-${tab.id}"
        data-id=${tab.id}
        aria-selected=${selected ? 'true' : 'false'}
        aria-controls=${tab.id}
        tabindex=${focused ? 0 : -1}
        ?disabled=${disabled}
        @click=${() => this.handleTabClick(tab)}
      >
        ${tab.icon ? html`<ds-icon class="tab-icon" part="tab-icon" name=${tab.icon}></ds-icon>` : nothing}
        <span class="tab-label" part="tab-label">${tab.label}</span>
        ${tab.badge !== undefined ? html`<span class="badge">${tab.badge}</span>` : nothing}
      </button>
    `;
  }

  private readonly handleTabClick = (tab: TabsTab): void => {
    if (tab.disabled === true) {
      return;
    }
    this.focusedId = tab.id;
    this.selectTab(tab.id);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const horizontal = this.orientation !== 'vertical';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
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

  private handleSlotChange(): void {
    this.syncPanels();
  }

  private enabledTabs(): TabsTab[] {
    return this.tabs.filter((tab) => tab.disabled !== true);
  }

  private moveFocus(delta: number): void {
    const items = this.enabledTabs();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((tab) => tab.id === (this.focusedId ?? this.currentValue));
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    this.focusTab(items[nextIndex].id);
  }

  private focusEdge(edge: 'first' | 'last'): void {
    const items = this.enabledTabs();
    if (items.length === 0) {
      return;
    }
    this.focusTab(edge === 'first' ? items[0].id : items[items.length - 1].id);
  }

  private focusTab(id: string): void {
    this.focusedId = id;
    if (this.activation === 'automatic') {
      this.selectTab(id);
    }
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus();
    });
  }

  private selectTab(id: string): void {
    if (id === this.currentValue) {
      this.focusedId = id;
      return;
    }
    if (this.value !== undefined) {
      this.value = id;
    } else {
      this.internalValue = id;
    }
    this.focusedId = id;
    this.dispatchEvent(
      new CustomEvent<TabsChangeDetail>('change', { detail: { value: id }, bubbles: true, composed: true }),
    );
  }

  /** Attaches/detaches and re-labels each `<ds-tab-panel>`, keeping their DOM order in sync with `tabs`. */
  private syncPanels(): void {
    const selected = this.currentValue;
    for (const tab of this.tabs) {
      const shouldAttach = this.keepMounted || tab.id === selected;
      let panel = this.querySelector<HTMLElement>(`:scope > ds-tab-panel[id="${CSS.escape(tab.id)}"]`);
      if (!panel) {
        if (!shouldAttach) {
          continue;
        }
        panel = this.detachedPanels.get(tab.id) ?? null;
        if (!panel) {
          continue;
        }
        this.detachedPanels.delete(tab.id);
      }
      if (shouldAttach) {
        this.appendChild(panel);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('aria-label', tab.label);
        panel.toggleAttribute('hidden', tab.id !== selected);
      } else {
        this.detachedPanels.set(tab.id, panel);
        panel.remove();
      }
    }
  }

  private updateIndicator(): void {
    const indicator = this.indicatorEl;
    if (!indicator) {
      return;
    }
    const selected = this.currentValue;
    const tabEl = selected
      ? this.renderRoot.querySelector<HTMLElement>(`[data-id="${CSS.escape(selected)}"]`)
      : null;
    if (!tabEl) {
      indicator.style.opacity = '0';
      return;
    }
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
  }

  /** Keeps the selected tab in view when the tab list scrolls (overflowing tabs). */
  private maybeScrollSelectedIntoView(): void {
    const selected = this.currentValue;
    if (selected === null || selected === this.lastScrolledId) {
      return;
    }
    this.lastScrolledId = selected;
    this.renderRoot
      .querySelector<HTMLElement>(`[data-id="${CSS.escape(selected)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
    if (!this.label) {
      console.warn("<ds-tabs> requires a `label`, the tab list's accessible name.", this);
    }
    if (!this.tabs || this.tabs.length === 0) {
      console.warn('<ds-tabs> requires at least one entry in `tabs`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tabs': DsTabs;
    'ds-tab-panel': DsTabPanel;
  }
}
