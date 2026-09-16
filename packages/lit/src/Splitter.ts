import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';
import type { IconName } from './Icon.js';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterStackBelow = 'prose' | 'content' | 'never';

/** Detail carried by the `size-change` and `size-change-end` CustomEvents. */
export interface SplitterSizeChangeDetail {
  size: number;
}

/** Detail carried by the `collapse-change` CustomEvent. */
export interface SplitterCollapseChangeDetail {
  collapsed: boolean;
}

/** copy.collapse */
const COPY_COLLAPSE = (label: string): string => `Collapse ${label}`;
/** copy.expand */
const COPY_EXPAND = (label: string): string => `Expand ${label}`;
/** copy.sizeText */
const COPY_SIZE_TEXT = (percent: number): string => `${percent}%`;

/** layout.maxWidth.prose / layout.maxWidth.content: `@container` conditions cannot read custom properties, so the
    built breakpoints are duplicated here, as Carousel does, and read again by the ResizeObserver that stops rendering
    the separator. literal-ok: breakpoint from layout.maxWidth.* */
const PROSE_BREAKPOINT_PX = 572;
const CONTENT_BREAKPOINT_PX = 960;

/** The primary size channel on the host. Registered so collapse and restore can transition the grid track; where
    registration is unavailable the change is instant. */
const PRIMARY_SIZE_PROPERTY = '--ds-splitter-primary-size';
try {
  CSS.registerProperty({ name: PRIMARY_SIZE_PROPERTY, syntax: '<percentage>', inherits: true, initialValue: '0%' });
} catch {
  /* Already registered (another copy of the element, or the web build) or unsupported: no size transition. */
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** First focusable element among `elements` or their light-DOM descendants, in order. A custom element that
    delegates focus (a `ds-button`) counts as focusable. */
function firstFocusable(elements: Element[]): HTMLElement | null {
  for (const root of elements) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (let node: Node | null = root; node; node = walker.nextNode()) {
      if (!(node instanceof HTMLElement) || node.hasAttribute('disabled')) {
        continue;
      }
      if (node.matches(FOCUSABLE_SELECTOR) || node.shadowRoot?.delegatesFocus) {
        return node;
      }
    }
  }
  return null;
}

let idCounter = 0;
function nextSplitterId(): string {
  idCounter += 1;
  return `ds-splitter-${idCounter}`;
}

/** Overridable style hooks; see the `overrides` property. `separatorHover`, `separatorActive`, `grip`,
    `paneMinTarget`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'collapseButtonOffset'
  | 'transition';

const HOOKS: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
  collapseButtonOffset: '--ds-splitter-collapse-button-offset',
  transition: '--ds-splitter-transition',
};

/** The stacked layout, shared by both `stackBelow` container queries. */
const STACKED_RULES = (stackBelow: SplitterStackBelow): CSSResult => {
  const host = unsafeCSS(`:host([orientation='horizontal'][stack-below='${stackBelow}'])`);
  return css`
    ${host} .container {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto;
    }
    ${host} .secondary-pane {
      grid-column: 1;
      grid-row: 2;
    }
    ${host} .separator,
    ${host} .collapse-button {
      display: none;
    }
  `;
};

/**
 * `<ds-splitter>` — Splitter (category: layout, APG pattern: windowsplitter).
 *
 * `<ds-splitter label="Sidebar width" collapsible persist-key="app-sidebar"><nav slot="primary">…</nav>
 * <main slot="secondary">…</main></ds-splitter>` renders a grid of the primary pane, a focusable
 * `role="separator"` and the secondary pane in its shadow root; the primary size is the host custom property
 * `--ds-splitter-primary-size`, in percent. Pointer Events with `setPointerCapture` drag the separator; arrows,
 * Home, End, Enter and F6 follow the APG window splitter. Below `stackBelow` (a container query on `:host`) a
 * horizontal splitter stacks its panes and the separator is not rendered.
 *
 * `size` and `collapsed` are controlled when set, uncontrolled from `defaultSize` / `defaultCollapsed` otherwise;
 * the events fire in both modes.
 *
 * @fires size-change - Continuously while dragging and on each key press, with `{ size }` (percent).
 * @fires size-change-end - Once when a drag ends and after each key press, with `{ size }`.
 * @fires collapse-change - When the primary pane collapses or restores, with `{ collapsed }`.
 * @slot primary - The first pane, start or top (anatomy: primaryPane).
 * @slot secondary - The second pane, which takes the remaining space (anatomy: secondaryPane).
 */
@customElement('ds-splitter')
export class DsSplitter extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      container-type: inline-size;
      --ds-splitter-separator-size: var(--space-1);
      --ds-splitter-separator-color: var(--color-border);
      --ds-splitter-handle-size: var(--space-3);
      --ds-splitter-grip-length: var(--space-6);
      --ds-splitter-collapse-button-offset: var(--space-2);
      --ds-splitter-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paneMinTarget (size.target.comfortable, locked): a minmax() floor on both tracks beneath the percent clamp. */
    .container {
      display: grid;
      block-size: 100%;
      inline-size: 100%;
      grid-template-columns:
        minmax(var(--size-target-comfortable), var(--ds-splitter-primary-size))
        var(--ds-splitter-separator-size)
        minmax(var(--size-target-comfortable), 1fr);
      grid-template-rows: minmax(0, 1fr);
    }

    :host([orientation='vertical']) .container {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows:
        minmax(var(--size-target-comfortable), var(--ds-splitter-primary-size))
        var(--ds-splitter-separator-size)
        minmax(var(--size-target-comfortable), 1fr);
    }

    /* The floor is dropped for the primary track while collapsed, so collapse reaches zero. */
    .container.is-collapsed {
      grid-template-columns:
        minmax(0, var(--ds-splitter-primary-size))
        var(--ds-splitter-separator-size)
        minmax(var(--size-target-comfortable), 1fr);
    }

    :host([orientation='vertical']) .container.is-collapsed {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows:
        minmax(0, var(--ds-splitter-primary-size))
        var(--ds-splitter-separator-size)
        minmax(var(--size-target-comfortable), 1fr);
    }

    /* transition: collapse and restore only; dragging and keys have none. */
    .container.is-animating {
      transition: ${unsafeCSS(PRIMARY_SIZE_PROPERTY)} var(--ds-splitter-transition) var(--motion-easing-standard);
    }

    .pane {
      min-inline-size: 0;
      min-block-size: 0;
      overflow: auto;
    }

    .container.is-collapsed .primary-pane {
      overflow: hidden;
    }

    .primary-pane {
      grid-column: 1;
      grid-row: 1;
    }

    .secondary-pane {
      grid-column: 3;
      grid-row: 1;
    }

    :host([orientation='vertical']) .secondary-pane {
      grid-column: 1;
      grid-row: 3;
    }

    .separator {
      position: relative;
      z-index: 1;
      grid-column: 2;
      grid-row: 1;
      background: var(--ds-splitter-separator-color);
      transition: background-color var(--ds-splitter-transition) var(--motion-easing-standard);
      touch-action: none;
      outline: none;
    }

    :host([orientation='vertical']) .separator {
      grid-column: 1;
      grid-row: 2;
    }

    /* separatorHover: color.border.strong, locked */
    .separator:hover {
      background: var(--color-border-strong);
    }

    /* separatorActive: color.control.selectedBackground, locked; while dragging or focused */
    .separator[data-dragging],
    .separator:focus-visible {
      background: var(--color-control-selected-background);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .separator:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* handleSize: the grab area centered on the separator, overlapping both panes;
       minTarget (size.target.min, locked) is its floor. */
    .handle {
      position: absolute;
      cursor: col-resize;
      inset-block: 0;
      inset-inline-start: 50%;
      inline-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateX(-50%);
    }

    :host([orientation='vertical']) .handle {
      cursor: row-resize;
      inset-inline: 0;
      inset-block-start: 50%;
      inline-size: auto;
      block-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateY(-50%);
    }

    .container.is-collapsed-interaction .handle {
      cursor: default;
    }

    /* grip: color.border.strong, locked; gripLength along the separator, separatorSize across it. */
    .grip {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      transform: translate(-50%, -50%);
      background: var(--color-border-strong);
      border-radius: var(--radius-full);
      inline-size: var(--ds-splitter-separator-size);
      block-size: var(--ds-splitter-grip-length);
      pointer-events: none;
    }

    :host([orientation='vertical']) .grip {
      inline-size: var(--ds-splitter-grip-length);
      block-size: var(--ds-splitter-separator-size);
    }

    /* collapseButtonOffset: from the separator's start edge along it, centered across it. */
    .collapse-button {
      position: relative;
      z-index: 2;
      grid-column: 2;
      grid-row: 1;
      justify-self: center;
      align-self: start;
      inset-block-start: var(--ds-splitter-collapse-button-offset);
    }

    :host([orientation='vertical']) .collapse-button {
      grid-column: 1;
      grid-row: 2;
      justify-self: start;
      align-self: center;
      inset-block-start: auto;
      inset-inline-start: var(--ds-splitter-collapse-button-offset);
    }

    /* A collapsed pane has no width to overlap, so the button stays inside the container. */
    :host([orientation='horizontal']) .container.is-collapsed .collapse-button {
      justify-self: start;
    }

    :host([orientation='vertical']) .container.is-collapsed .collapse-button {
      align-self: start;
    }

    @media (prefers-reduced-motion: reduce) {
      .container.is-animating,
      .separator {
        transition: none;
      }
    }

    @container (max-width: ${unsafeCSS(CONTENT_BREAKPOINT_PX)}px) {
      ${STACKED_RULES('content')}
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT_PX)}px) {
      ${STACKED_RULES('prose')}
    }
  `;

  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  @property({ type: String }) accessor label: string = '';

  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  @property({ type: String, reflect: true }) accessor orientation: SplitterOrientation = 'horizontal';

  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  @property({ type: Number }) accessor size: number | undefined;

  /** Initial primary size, percent. */
  @property({ type: Number, attribute: 'default-size' }) accessor defaultSize: number = 30;

  /** Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the pane instead
      of clamping; otherwise it is the hard floor. */
  @property({ type: Number, attribute: 'min-size' }) accessor minSize: number = 10;

  /** Largest primary size, percent. */
  @property({ type: Number, attribute: 'max-size' }) accessor maxSize: number = 90;

  /** Arrow-key increment, percent. */
  @property({ type: Number }) accessor step: number = 2;

  /** The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator, or use the
      collapse button. Enter again restores the last size. */
  @property({ type: Boolean, reflect: true }) accessor collapsible: boolean = false;

  /** Controlled collapsed state. Undefined leaves the element uncontrolled from `defaultCollapsed`. */
  @property({ type: Boolean, reflect: true }) accessor collapsed: boolean | undefined;

  /** Initial collapsed state when uncontrolled. */
  @property({ type: Boolean, attribute: 'default-collapsed' }) accessor defaultCollapsed: boolean = false;

  /** When set, the size and collapsed state are remembered in localStorage under this key. */
  @property({ type: String, attribute: 'persist-key' }) accessor persistKey: string | undefined;

  /** Below this width of the splitter's own box a horizontal splitter stacks its panes and renders no separator. */
  @property({ type: String, reflect: true, attribute: 'stack-below' }) accessor stackBelow: SplitterStackBelow =
    'prose';

  /** Per-instance style overrides: `{ separatorSize: 'space.2' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SplitterOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled size; undefined until the user moves the separator or a persisted value is restored. */
  @state() private accessor internalSize: number | undefined;

  /** Uncontrolled collapsed state; undefined until the user collapses or restores, or a persisted value is read. */
  @state() private accessor internalCollapsed: boolean | undefined;

  /** True while a pointer drag is in progress (separatorActive). */
  @state() private accessor dragging = false;

  /** True below `stackBelow` on a horizontal splitter: the separator and collapse button are not rendered. */
  @state() private accessor stacked = false;

  /** True for the render that collapses or restores, so only that change transitions the track. */
  @state() private accessor animating = false;

  private readonly instanceId = nextSplitterId();
  private resizeObserver: ResizeObserver | undefined;

  @query('.container') private accessor containerEl!: HTMLDivElement | null;
  @query('[data-part="separator"]') private accessor separatorEl!: HTMLDivElement | null;
  @query('[data-part="primaryPane"]') private accessor primaryPaneEl!: HTMLDivElement | null;
  @query('[data-part="secondaryPane"]') private accessor secondaryPaneEl!: HTMLDivElement | null;
  @query('[data-part="collapseButton"]') private accessor collapseButtonEl!: HTMLElement | null;
  @query('slot[name="primary"]') private accessor primarySlotEl!: HTMLSlotElement | null;
  @query('slot[name="secondary"]') private accessor secondarySlotEl!: HTMLSlotElement | null;

  /** The primary size (percent) when expanded: `size`, else the uncontrolled value, else `defaultSize`, clamped. */
  private get currentSize(): number {
    return this.clamp(this.size ?? this.internalSize ?? this.defaultSize);
  }

  private get isCollapsed(): boolean {
    return this.collapsible && (this.collapsed ?? this.internalCollapsed ?? this.defaultCollapsed);
  }

  /** The rendered primary size: 0 while collapsed. */
  private get effectiveSize(): number {
    return this.isCollapsed ? 0 : this.currentSize;
  }

  private get primaryPaneId(): string {
    return `${this.instanceId}-primary`;
  }

  private clamp(value: number): number {
    return Math.min(this.maxSize, Math.max(this.minSize, value));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Splitter');
    this.addEventListener('keydown', this.handleHostKeydown);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver ??= new ResizeObserver(() => this.updateStacked());
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleHostKeydown);
    this.resizeObserver?.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('persistKey')) {
      this.loadPersisted();
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('orientation') || changed.has('stackBelow')) {
      this.updateStacked();
    }
    if (changed.has('collapsed') && changed.get('collapsed') !== undefined && !changed.has('animating')) {
      this.animating = true;
    }
    const next = `${this.effectiveSize}%`;
    if (this.style.getPropertyValue(PRIMARY_SIZE_PROPERTY) !== next) {
      this.style.setProperty(PRIMARY_SIZE_PROPERTY, next);
    }
    this.warnInDev(changed);
  }

  protected override render(): TemplateResult {
    const horizontal = this.orientation === 'horizontal';
    const collapsed = this.isCollapsed;
    const inertPrimary = collapsed && !this.stacked;
    const size = Math.round(this.effectiveSize);
    const chevron: IconName = horizontal
      ? collapsed
        ? 'chevron-right'
        : 'chevron-left'
      : collapsed
        ? 'chevron-down'
        : 'chevron-up';

    return html`
      <div
        class=${classMap({
          container: true,
          'is-collapsed': inertPrimary,
          'is-collapsed-interaction': collapsed,
          'is-animating': this.animating,
        })}
        data-part="container"
      >
        <div class="pane primary-pane" data-part="primaryPane" id=${this.primaryPaneId} ?inert=${inertPrimary}>
          <slot name="primary"></slot>
        </div>
        ${this.stacked
          ? nothing
          : html`<div
              class="separator"
              data-part="separator"
              role="separator"
              tabindex="0"
              aria-orientation=${horizontal ? 'vertical' : 'horizontal'}
              aria-valuenow=${size}
              aria-valuemin=${this.minSize}
              aria-valuemax=${this.maxSize}
              aria-valuetext=${COPY_SIZE_TEXT(size)}
              aria-label=${this.label}
              aria-controls=${this.primaryPaneId}
              ?data-dragging=${this.dragging}
              @pointerdown=${this.handlePointerDown}
              @pointermove=${this.handlePointerMove}
              @pointerup=${this.handlePointerUp}
              @pointercancel=${this.handlePointerUp}
              @keydown=${this.handleSeparatorKeydown}
            >
              <div class="handle" data-part="handle" aria-hidden="true"><div class="grip"></div></div>
            </div>`}
        ${this.collapsible && !this.stacked
          ? html`<ds-button
              class="collapse-button"
              data-part="collapseButton"
              variant="ghost"
              size="sm"
              icon-only
              label=${collapsed ? COPY_EXPAND(this.label) : COPY_COLLAPSE(this.label)}
              @press=${this.handleCollapseButtonPress}
            >
              <ds-icon slot="leading-icon" name=${chevron}></ds-icon>
            </ds-button>`
          : nothing}
        <div class="pane secondary-pane" data-part="secondaryPane">
          <slot name="secondary"></slot>
        </div>
      </div>
    `;
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (this.isCollapsed || event.button !== 0 || !this.separatorEl) {
      return;
    }
    event.preventDefault();
    this.separatorEl.setPointerCapture(event.pointerId);
    this.animating = false;
    this.dragging = true;
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragging || !this.containerEl) {
      return;
    }
    const rect = this.containerEl.getBoundingClientRect();
    const horizontal = this.orientation === 'horizontal';
    const extent = horizontal ? rect.width : rect.height;
    if (extent === 0) {
      return;
    }
    const offset = horizontal ? event.clientX - rect.left : event.clientY - rect.top;
    const raw = Math.min(100, Math.max(0, (offset / extent) * 100));
    if (this.collapsible && raw < this.minSize) {
      this.requestCollapsed(true, false);
      return;
    }
    if (this.isCollapsed) {
      this.requestCollapsed(false, false);
    }
    this.requestSize(this.clamp(raw));
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.dragging) {
      return;
    }
    if (this.separatorEl?.hasPointerCapture(event.pointerId)) {
      this.separatorEl.releasePointerCapture(event.pointerId);
    }
    this.dragging = false;
    this.dispatchSize('size-change-end', this.effectiveSize);
    this.persist();
  };

  private handleSeparatorKeydown(event: KeyboardEvent): void {
    const horizontal = this.orientation === 'horizontal';
    const collapsed = this.isCollapsed;
    let next: number | undefined;
    switch (event.key) {
      case horizontal ? 'ArrowRight' : 'ArrowDown':
        next = this.currentSize + this.step;
        break;
      case horizontal ? 'ArrowLeft' : 'ArrowUp':
        next = this.currentSize - this.step;
        break;
      case 'Home':
        next = this.minSize;
        break;
      case 'End':
        next = this.maxSize;
        break;
      case 'Enter':
        if (this.collapsible) {
          event.preventDefault();
          this.requestCollapsed(!collapsed, true);
          this.persist();
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    if (collapsed) {
      return;
    }
    if (this.collapsible && next < this.minSize) {
      this.requestCollapsed(true, true);
      this.persist();
      return;
    }
    next = this.clamp(next);
    if (next === this.currentSize) {
      return;
    }
    this.animating = false;
    this.requestSize(next);
    this.dispatchSize('size-change-end', next);
    this.persist();
  }

  private handleCollapseButtonPress(event: Event): void {
    event.stopPropagation();
    this.requestCollapsed(!this.isCollapsed, true);
    this.persist();
  }

  /** F6 cycles primary pane → separator → secondary pane, wrapping; a nested splitter handles it first. */
  private readonly handleHostKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'F6' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const zones: Array<'primary' | 'separator' | 'secondary'> = [];
    if (!(this.isCollapsed && !this.stacked)) zones.push('primary');
    if (!this.stacked) zones.push('separator');
    zones.push('secondary');

    const path = event.composedPath();
    const current: 'primary' | 'separator' | 'secondary' | undefined =
      this.primaryPaneEl && path.includes(this.primaryPaneEl)
        ? 'primary'
        : (this.separatorEl && path.includes(this.separatorEl)) ||
            (this.collapseButtonEl && path.includes(this.collapseButtonEl))
          ? 'separator'
          : this.secondaryPaneEl && path.includes(this.secondaryPaneEl)
            ? 'secondary'
            : undefined;
    const index = current === undefined ? -1 : zones.indexOf(current);
    const direction = event.shiftKey ? -1 : 1;
    const target = zones[(index + direction + zones.length) % zones.length];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.focusZone(target);
  };

  private focusZone(zone: 'primary' | 'separator' | 'secondary'): void {
    if (zone === 'separator') {
      this.separatorEl?.focus();
      return;
    }
    const slot = zone === 'primary' ? this.primarySlotEl : this.secondarySlotEl;
    const pane = zone === 'primary' ? this.primaryPaneEl : this.secondaryPaneEl;
    const target = firstFocusable(slot?.assignedElements({ flatten: true }) ?? []);
    if (target) {
      target.focus();
      return;
    }
    if (!pane) {
      return;
    }
    // The wrapper is focusable only while it holds focus, so delegatesFocus never lands on it.
    pane.tabIndex = -1;
    pane.addEventListener('blur', () => pane.removeAttribute('tabindex'), { once: true });
    pane.focus();
  }

  private requestSize(next: number): void {
    if (this.size === undefined) {
      this.internalSize = next;
    }
    this.dispatchSize('size-change', next);
  }

  private requestCollapsed(next: boolean, animate: boolean): void {
    if (this.isCollapsed === next) {
      return;
    }
    this.animating = animate;
    if (this.collapsed === undefined) {
      this.internalCollapsed = next;
    }
    this.dispatchEvent(
      new CustomEvent<SplitterCollapseChangeDetail>('collapse-change', {
        detail: { collapsed: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchSize(type: 'size-change' | 'size-change-end', size: number): void {
    this.dispatchEvent(
      new CustomEvent<SplitterSizeChangeDetail>(type, { detail: { size }, bubbles: true, composed: true }),
    );
  }

  private updateStacked(): void {
    let next = false;
    if (this.orientation === 'horizontal' && this.stackBelow !== 'never' && this.isConnected) {
      const breakpoint = this.stackBelow === 'prose' ? PROSE_BREAKPOINT_PX : CONTENT_BREAKPOINT_PX;
      const width = this.getBoundingClientRect().width;
      next = width > 0 && width <= breakpoint;
    }
    if (this.stacked !== next) {
      this.stacked = next;
    }
  }

  private loadPersisted(): void {
    if (!this.persistKey) {
      return;
    }
    try {
      const raw = localStorage.getItem(this.persistKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { size?: unknown; collapsed?: unknown } | null;
      if (typeof parsed?.size === 'number') {
        this.internalSize = parsed.size;
      }
      if (typeof parsed?.collapsed === 'boolean') {
        this.internalCollapsed = parsed.collapsed;
      }
    } catch {
      /* storage unavailable or malformed: the splitter keeps its defaults */
    }
  }

  private persist(): void {
    if (!this.persistKey) {
      return;
    }
    try {
      localStorage.setItem(
        this.persistKey,
        JSON.stringify({
          size: this.internalSize ?? this.currentSize,
          collapsed: this.internalCollapsed ?? this.isCollapsed,
        }),
      );
    } catch {
      /* storage unavailable (private mode, quota): the size just does not stick */
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SplitterOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(changed: PropertyValues): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if ((changed.has('minSize') || changed.has('maxSize')) && !(this.maxSize > this.minSize)) {
      console.warn(`<ds-splitter> needs maxSize (${this.maxSize}) greater than minSize (${this.minSize}).`, this);
    }
    if (changed.has('label') && !this.label) {
      console.warn('<ds-splitter> needs a `label` naming what the separator resizes.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-splitter': DsSplitter;
  }
}
