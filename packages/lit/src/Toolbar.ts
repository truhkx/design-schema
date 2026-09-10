import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Divider.js';
import './Menu.js';
import type { DsDivider } from './Divider.js';
import type { MenuActionItem, MenuActionDetail } from './Menu.js';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarOverflow = 'wrap' | 'menu' | 'scroll';
export type ToolbarSize = 'sm' | 'md';
export type ToolbarDensity = 'compact' | 'comfortable';

/** Overridable style hooks; see the `overrides` property. `background`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type ToolbarOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'itemGap'
  | 'itemGapCompact'
  | 'groupGap'
  | 'separatorLength'
  | 'fadeWidth';

const HOOKS: Record<ToolbarOverridableBinding, string> = {
  border: '--ds-toolbar-border',
  borderWidth: '--ds-toolbar-border-width',
  radius: '--ds-toolbar-radius',
  paddingInline: '--ds-toolbar-padding-inline',
  paddingBlock: '--ds-toolbar-padding-block',
  itemGap: '--ds-toolbar-item-gap',
  itemGapCompact: '--ds-toolbar-item-gap-compact',
  groupGap: '--ds-toolbar-group-gap',
  separatorLength: '--ds-toolbar-separator-length',
  fadeWidth: '--ds-toolbar-fade-width',
};

/** Elements this build has moved into the overflow menu, in order, for `click()` on selection. */
type OverflowTarget = HTMLElement;

/**
 * `<ds-toolbar-group>` — groups related controls inside a `<ds-toolbar>` (anatomy: group).
 *
 * A light-DOM wrapper with no independent meaning: `<ds-toolbar>` discovers
 * direct `<ds-toolbar-group>` children by `data-ds`, descends into them for
 * its roving-tabindex list and its `overflow="menu"` collapse, and inserts a
 * `<ds-divider>` between adjacent groups.
 */
@customElement('ds-toolbar-group')
export class DsToolbarGroup extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--ds-toolbar-item-gap, var(--layout-gap-normal));
    }

    :host([hidden]) {
      display: none;
    }

    :host([data-vertical]) {
      flex-direction: column;
      align-items: stretch;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ToolbarGroup');
    this.setAttribute('role', 'group');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

/**
 * `<ds-toolbar>` — Toolbar (category: navigation, APG pattern: toolbar).
 *
 * `<ds-toolbar label="Formatting">` holds slotted light-DOM controls (plain
 * controls or `<ds-toolbar-group>` wrappers) and manages them as one
 * roving-tabindex stop: Tab moves into the last-focused control (initially
 * the first) and out again; arrow keys along `orientation` move real focus
 * between enabled controls without wrapping, Home/End jump to the ends. A
 * control with its own arrow-key model (`ds-segmented-control`,
 * `ds-radio-group`) keeps it — the toolbar does not intercept arrows while
 * focus is inside one (or inside an open `ds-menu`). A `<ds-divider>` is
 * inserted automatically between adjacent `<ds-toolbar-group>` children.
 * `overflow="menu"` uses a `ResizeObserver` to hide trailing controls (their
 * `overflow-label` attribute names them) into a "More" `<ds-menu>`; choosing
 * one calls `click()` on the original, still-present element. `overflow`
 * `wrap` and `scroll` are CSS-only.
 *
 * ## When to use
 *
 * Use a Toolbar for controls that act on the same thing and are used
 * together: text formatting, a table's row actions, a data page's
 * filter–sort–export row. Group by purpose with `ToolbarGroup`. Use
 * `overflow="menu"` for toolbars whose width the layout cannot guarantee, and
 * give every control an `overflow-label`.
 *
 * ## When not to use
 *
 * Not for page navigation (Breadcrumb, Tabs, a nav landmark) or a form's
 * submit row. Not for a single control. Not as a generic horizontal Stack —
 * the roving tabindex changes how Tab works.
 *
 * @csspart container - The flex row/column holding the slotted controls (anatomy: container).
 * @csspart overflow - The composed "More" `<ds-menu>` (anatomy: overflowButton, overflowMenu).
 * @slot - Controls in order, or `<ds-toolbar-group>` wrappers around related ones.
 */
@customElement('ds-toolbar')
export class DsToolbar extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      box-sizing: border-box;
      align-items: stretch;
      gap: var(--ds-toolbar-item-gap);
      padding-inline: var(--ds-toolbar-padding-inline);
      padding-block: var(--ds-toolbar-padding-block);
      border-style: solid;
      border-width: var(--ds-toolbar-border-width);
      border-color: var(--ds-toolbar-border);
      border-radius: var(--ds-toolbar-radius);
      /* background: color.background.subtle, locked */
      background: var(--color-background-subtle);
      --ds-toolbar-border: var(--color-border);
      --ds-toolbar-border-width: var(--border-width-thin);
      --ds-toolbar-radius: var(--radius-md);
      --ds-toolbar-padding-inline: var(--space-2);
      --ds-toolbar-padding-block: var(--space-1);
      --ds-toolbar-item-gap: var(--layout-gap-normal);
      --ds-toolbar-item-gap-compact: var(--layout-gap-tight);
      --ds-toolbar-group-gap: var(--layout-gap-normal);
      --ds-toolbar-separator-length: var(--space-5);
      --ds-toolbar-fade-width: var(--space-6);
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation='vertical']) {
      flex-direction: column;
      align-items: stretch;
    }

    :host([density='compact']) {
      gap: var(--ds-toolbar-item-gap-compact);
    }

    .container {
      box-sizing: border-box;
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      min-inline-size: 0;
      min-block-size: 0;
      gap: var(--ds-toolbar-item-gap);
    }

    :host([density='compact']) .container {
      gap: var(--ds-toolbar-item-gap-compact);
    }

    :host([orientation='vertical']) .container {
      flex-direction: column;
      align-items: stretch;
    }

    :host([overflow='wrap']) .container {
      flex-wrap: wrap;
    }

    :host([overflow='scroll']) .container {
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      /* mask-image alpha channel: opaque/transparent stops, not a color. literal-ok: mask alpha marker, not a color */
      mask-image: linear-gradient(to right, transparent, black var(--ds-toolbar-fade-width), black calc(100% - var(--ds-toolbar-fade-width)), transparent); /* literal-ok: mask alpha marker, not a color */
    }

    :host([overflow='scroll']) .container::-webkit-scrollbar {
      display: none;
    }

    :host([orientation='vertical'][overflow='scroll']) .container {
      overflow-x: hidden;
      overflow-y: auto;
      mask-image: linear-gradient(to bottom, transparent, black var(--ds-toolbar-fade-width), black calc(100% - var(--ds-toolbar-fade-width)), transparent); /* literal-ok: mask alpha marker, not a color */
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked. Defensive only: the host
       itself is never given a tabindex by this component, real focus always lands on a slotted control. */
    :host(:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .overflow {
      flex: none;
      align-self: center;
    }
  `;

  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; the toolbar's accessible name. */
  @property() label!: string;

  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  @property({ reflect: true }) orientation: ToolbarOrientation = 'horizontal';

  /** Trailing-control behavior when the toolbar does not fit: wrap onto more rows, collapse into a "More" menu, or scroll with faded edges. */
  @property({ reflect: true }) overflow: ToolbarOverflow = 'menu';

  /** Default size passed to child controls that have not set their own `size`. */
  @property({ reflect: true }) size: ToolbarSize = 'md';

  /** Gap between controls: tight (`compact`) or normal (`comfortable`) rhythm. */
  @property({ reflect: true }) density: ToolbarDensity = 'comfortable';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef>>;

  /** Controls currently collapsed into the overflow menu, built from their `overflow-label` attribute. */
  @state() private overflowItems: MenuActionItem[] = [];

  @query('.container') private readonly containerEl?: HTMLDivElement;
  @query('.overflow') private readonly overflowMenuEl?: HTMLElement;

  /** The control that currently carries the roving tabindex (and, usually, real focus). */
  private focusedControl: HTMLElement | null = null;

  /** In the same order as `overflowItems`, so choosing an item can `click()` the original element. */
  private overflowTargets: OverflowTarget[] = [];

  private resizeObserver?: ResizeObserver;

  /** Watches the whole light-DOM subtree: a control added inside an existing `<ds-toolbar-group>` does not
      fire the default slot's `slotchange`, since it is assigned to that group's own inner slot instead. */
  private readonly mutationObserver = new MutationObserver(() => this.handleChildrenChanged());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Toolbar');
    this.setAttribute('role', 'toolbar');
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('focusin', this.handleFocusIn);
    this.mutationObserver.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.mutationObserver.disconnect();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    if (this.containerEl) {
      this.resizeObserver = new ResizeObserver(() => this.recalcOverflow());
      this.resizeObserver.observe(this.containerEl);
    }
    this.handleChildrenChanged();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('orientation')) {
      this.syncGroupOrientation();
      for (const child of Array.from(this.children)) {
        const el = child as HTMLElement;
        if (el.dataset.ds === 'Divider' && el.hasAttribute('data-ds-toolbar-separator')) {
          this.applySeparatorGeometry(el);
        }
      }
      this.recalcOverflow();
    }
    if (changed.has('overflow')) {
      if (this.overflow === 'menu') {
        this.recalcOverflow();
      } else {
        this.resetOverflow();
      }
    }
  }

  protected override updated(): void {
    this.syncHostAria();
    this.warnInDev();
  }

  protected override render() {
    const showOverflow = this.overflow === 'menu';
    return html`
      <div class="container" part="container">
        <slot></slot>
      </div>
      ${showOverflow
        ? html`
            <ds-menu
              class="overflow"
              part="overflow"
              label="More"
              icon-only
              trigger-variant="ghost"
              trigger-icon="ellipsis"
              .items=${this.overflowItems}
              ?hidden=${this.overflowItems.length === 0}
              @action=${this.handleOverflowAction}
            ></ds-menu>
          `
        : nothing}
    `;
  }

  /** `role`/`aria-label`/`aria-orientation` as plain host attributes — see the class doc for why not `ElementInternals`. */
  private syncHostAria(): void {
    if (this.label) {
      this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
    }
    this.setAttribute('aria-orientation', this.orientation);
  }

  private readonly handleOverflowAction = (event: CustomEvent<MenuActionDetail>): void => {
    const index = Number(event.detail.id.slice('overflow-'.length));
    this.overflowTargets[index]?.click();
  };

  private readonly handleFocusIn = (event: FocusEvent): void => {
    const controls = this.focusableCandidates();
    const target = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && controls.includes(node));
    if (target && target !== this.focusedControl) {
      this.focusedControl = target;
      this.syncRovingTabindex();
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.shouldDelegateToChild(event)) {
      return;
    }
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

  /** True while focus is inside a control that keeps its own arrow-key model (SegmentedControl, RadioGroup) or
      inside an open overflow Menu, so the toolbar must not steal the key. */
  private shouldDelegateToChild(event: KeyboardEvent): boolean {
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      if (node === this) {
        break;
      }
      const kind = node.dataset.ds;
      if (kind === 'SegmentedControl' || kind === 'RadioGroup') {
        return true;
      }
      if (kind === 'Menu' && node.hasAttribute('open')) {
        return true;
      }
    }
    return false;
  }

  private moveFocus(delta: number): void {
    const controls = this.focusableCandidates();
    if (controls.length === 0) {
      return;
    }
    const currentIndex = controls.indexOf(this.focusedControl ?? controls[0]);
    const nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= controls.length) {
      return;
    }
    this.focusTo(controls[nextIndex]);
  }

  private focusEdge(edge: 'first' | 'last'): void {
    const controls = this.focusableCandidates();
    if (controls.length === 0) {
      return;
    }
    this.focusTo(edge === 'first' ? controls[0] : controls[controls.length - 1]);
  }

  private focusTo(el: HTMLElement): void {
    this.focusedControl = el;
    this.syncRovingTabindex();
    el.focus();
  }

  private isDisabled(el: HTMLElement): boolean {
    return el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
  }

  /** Every non-decorative control, direct child or one level inside a `<ds-toolbar-group>`; a control's own
      internals (e.g. an icon slotted into it) are never descended into. */
  private topLevelControls(): HTMLElement[] {
    const result: HTMLElement[] = [];
    const collect = (parent: Element): void => {
      for (const node of Array.from(parent.children)) {
        const el = node as HTMLElement;
        const kind = el.dataset.ds;
        if (kind === 'ToolbarGroup') {
          collect(el);
        } else if (kind === 'Divider') {
          continue;
        } else if (kind) {
          result.push(el);
        }
      }
    };
    collect(this);
    return result;
  }

  /** `topLevelControls()` filtered to what the roving tabindex may land on, plus the overflow trigger when it's showing. */
  private focusableCandidates(): HTMLElement[] {
    const result = this.topLevelControls().filter((el) => !el.hidden && !this.isDisabled(el));
    if (this.overflow === 'menu' && this.overflowItems.length > 0 && this.overflowMenuEl) {
      result.push(this.overflowMenuEl);
    }
    return result;
  }

  private syncRovingTabindex(): void {
    const controls = this.focusableCandidates();
    if (controls.length === 0) {
      return;
    }
    if (!this.focusedControl || !controls.includes(this.focusedControl)) {
      this.focusedControl = controls[0];
    }
    for (const el of controls) {
      el.tabIndex = el === this.focusedControl ? 0 : -1;
    }
  }

  private handleChildrenChanged(): void {
    this.mutationObserver.disconnect();
    this.syncSeparators();
    this.syncGroupOrientation();
    this.applyDefaultSizes();
    this.mutationObserver.observe(this, { childList: true, subtree: true });
    this.syncRovingTabindex();
    this.recalcOverflow();
  }

  /** Inserts a `<ds-divider>` between adjacent `<ds-toolbar-group>` children and removes one that no longer sits
      between two groups. */
  private syncSeparators(): void {
    for (const child of Array.from(this.children)) {
      const el = child as HTMLElement;
      if (el.dataset.ds === 'Divider' && el.hasAttribute('data-ds-toolbar-separator')) {
        const prev = el.previousElementSibling as HTMLElement | null;
        const next = el.nextElementSibling as HTMLElement | null;
        const stillValid = prev?.dataset.ds === 'ToolbarGroup' && next?.dataset.ds === 'ToolbarGroup';
        if (!stillValid) {
          el.remove();
        }
      }
    }
    const groups = Array.from(this.children).filter((child) => (child as HTMLElement).dataset.ds === 'ToolbarGroup');
    for (let i = 0; i < groups.length - 1; i += 1) {
      const current = groups[i] as HTMLElement;
      const next = current.nextElementSibling as HTMLElement | null;
      if (next?.dataset.ds === 'ToolbarGroup') {
        const divider = document.createElement('ds-divider') as DsDivider;
        divider.setAttribute('data-ds-toolbar-separator', '');
        divider.setAttribute('aria-hidden', 'true');
        current.after(divider);
        this.applySeparatorGeometry(divider);
      } else if (next?.dataset.ds === 'Divider' && next.hasAttribute('data-ds-toolbar-separator')) {
        this.applySeparatorGeometry(next);
      }
    }
  }

  /** Perpendicular orientation, and length/spacing forwarded to the Divider's own hooks (never its shadow tree). */
  private applySeparatorGeometry(divider: HTMLElement): void {
    const vertical = this.orientation === 'vertical';
    (divider as DsDivider).orientation = vertical ? 'horizontal' : 'vertical';
    divider.style.setProperty('--ds-divider-spacing', 'var(--ds-toolbar-group-gap)');
    divider.style.alignSelf = 'center';
    divider.style.flex = 'none';
    divider.style.blockSize = vertical ? '' : 'var(--ds-toolbar-separator-length)';
    divider.style.inlineSize = vertical ? 'var(--ds-toolbar-separator-length)' : '';
  }

  private syncGroupOrientation(): void {
    const vertical = this.orientation === 'vertical';
    for (const child of Array.from(this.children)) {
      const el = child as HTMLElement;
      if (el.dataset.ds === 'ToolbarGroup') {
        el.toggleAttribute('data-vertical', vertical);
      }
    }
  }

  /** One-time default: a control that has not set its own `size` gets the toolbar's. A later change to the
      toolbar's `size` does not retroactively revisit controls already defaulted. */
  private applyDefaultSizes(): void {
    for (const el of this.topLevelControls()) {
      if (!el.hasAttribute('size')) {
        el.setAttribute('size', this.size);
      }
    }
  }

  private resetOverflow(): void {
    for (const el of this.topLevelControls()) {
      if (el.hasAttribute('data-ds-toolbar-overflow-hidden')) {
        el.hidden = false;
        el.removeAttribute('data-ds-toolbar-overflow-hidden');
      }
    }
    this.overflowItems = [];
    this.overflowTargets = [];
    this.syncRovingTabindex();
  }

  /** Measures the top-level controls and, when they do not fit `.container`, hides as many trailing ones as
      needed and rebuilds the overflow menu from their `overflow-label` attribute. */
  private recalcOverflow(): void {
    if (this.overflow !== 'menu') {
      return;
    }
    const container = this.containerEl;
    if (!container) {
      return;
    }
    const controls = this.topLevelControls();
    for (const el of controls) {
      if (el.hasAttribute('data-ds-toolbar-overflow-hidden')) {
        el.hidden = false;
      }
    }
    if (controls.length === 0) {
      this.overflowItems = [];
      this.overflowTargets = [];
      return;
    }

    const vertical = this.orientation === 'vertical';
    const sizes = controls.map((el) => {
      const rect = el.getBoundingClientRect();
      return vertical ? rect.height : rect.width;
    });
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    const available = vertical ? container.clientHeight : container.clientWidth;
    let total = sizes.reduce((sum, size) => sum + size, 0) + gap * Math.max(0, controls.length - 1);

    if (total <= available) {
      for (const el of controls) {
        el.removeAttribute('data-ds-toolbar-overflow-hidden');
      }
      this.overflowItems = [];
      this.overflowTargets = [];
      this.syncRovingTabindex();
      return;
    }

    const reserved = parseFloat(getComputedStyle(this).getPropertyValue('--size-target-min')) || 0;
    const budget = available - reserved;
    const hidden: HTMLElement[] = [];
    for (let i = controls.length - 1; i >= 0 && total > budget; i -= 1) {
      hidden.unshift(controls[i]);
      total -= sizes[i] + gap;
    }

    for (const el of controls) {
      const shouldHide = hidden.includes(el);
      el.hidden = shouldHide;
      el.toggleAttribute('data-ds-toolbar-overflow-hidden', shouldHide);
    }

    this.overflowTargets = hidden;
    this.overflowItems = hidden.map((el, index) => ({
      id: `overflow-${index}`,
      label: el.getAttribute('overflow-label') ?? el.getAttribute('label') ?? el.textContent?.trim() ?? `Item ${index + 1}`,
      disabled: this.isDisabled(el),
    }));
    this.syncRovingTabindex();
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ToolbarOverridableBinding[]) {
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
      console.warn("<ds-toolbar> requires a `label`, the toolbar's accessible name.", this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-toolbar': DsToolbar;
    'ds-toolbar-group': DsToolbarGroup;
  }
}
