import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
    built breakpoints are duplicated here as literals, and again in JS to drive the ARIA/interactivity switch a
    container query alone cannot express. literal-ok: breakpoint from layout.maxWidth.* */
const PROSE_BREAKPOINT_PX = 572;
const CONTENT_BREAKPOINT_PX = 960;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** First focusable element among `elements` or their descendants, in order. */
function firstFocusable(elements: Element[]): HTMLElement | null {
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    if (el.matches(FOCUSABLE_SELECTOR)) {
      return el;
    }
    const nested = el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (nested) {
      return nested;
    }
  }
  return null;
}

let idCounter = 0;
function nextSplitterId(): string {
  idCounter += 1;
  return `ds-splitter-${idCounter}`;
}

/** Overridable style hooks; see the `overrides` property. `separatorHover`, `separatorActive`, `grip`, `minTarget`,
    `focusRing` and `focusRingWidth` are locked and excluded. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'collapseButtonOffset'
  | 'paneMinTarget'
  | 'transition';

const HOOKS: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
  collapseButtonOffset: '--ds-splitter-collapse-button-offset',
  paneMinTarget: '--ds-splitter-pane-min-target',
  transition: '--ds-splitter-transition',
};

/**
 * `<ds-splitter>` — Splitter (category: layout, APG pattern: windowsplitter).
 *
 * `<ds-splitter label="Sidebar width" collapsible persist-key="app-sidebar">` renders
 * a CSS grid of a primary pane (`slot="primary"`), a `role="separator"` divider and
 * a secondary pane (`slot="secondary"`) in its shadow root; the primary pane's size
 * is a host custom property in percent. Pointer Events with `setPointerCapture` on
 * the separator drive dragging; the full keyboard table (arrows, Home/End, Enter,
 * F6) is implemented on it. Dispatches composed `size-change` (continuously),
 * `size-change-end` (once, at drag end) and `collapse-change` CustomEvents. Below
 * `stackBelow` a horizontal splitter's `@container` query stacks the panes and a
 * `ResizeObserver` on the host retires the separator's `role`/`tabindex` to match.
 *
 * ## When to use
 *
 * Use a Splitter when two regions compete for space and the right split depends on
 * the task: a navigation tree beside content, a list beside a detail view. Make the
 * primary pane the one whose size matters, set sensible `minSize`/`maxSize`, and use
 * `persistKey` so the choice sticks. Use `collapsible` for sidebars.
 *
 * @fires size-change - Fired continuously while dragging and on each key press, with `{ size }` (percent) in `detail`.
 * @fires size-change-end - Fired once when a drag ends, with `{ size }` in `detail`.
 * @fires collapse-change - Fired when the primary pane collapses or restores, with `{ collapsed }` in `detail`.
 * @slot primary - The first pane, start or top (anatomy: primaryPane).
 * @slot secondary - The second pane, which takes the remaining space (anatomy: secondaryPane).
 * @csspart container - The grid of primary pane, separator and secondary pane (anatomy: container).
 * @csspart primaryPane - The primary pane wrapper (anatomy: primaryPane).
 * @csspart secondaryPane - The secondary pane wrapper (anatomy: secondaryPane).
 * @csspart separator - The `role="separator"` divider (anatomy: separator).
 * @csspart handle - The pointer grab area, wider than the visible line (anatomy: handle).
 * @csspart collapseButton - The composed `<ds-button>` that collapses/restores the primary pane (anatomy: collapseButton).
 */
@customElement('ds-splitter')
export class DsSplitter extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      container-type: inline-size;
      /* Internal state channel (not an override hook): the primary pane's live size, in percent. */
      --ds-splitter-primary-size: 30%;
      --ds-splitter-separator-size: var(--space-1);
      --ds-splitter-separator-color: var(--color-border);
      --ds-splitter-handle-size: var(--space-3);
      --ds-splitter-grip-length: var(--space-6);
      --ds-splitter-collapse-button-offset: var(--space-2);
      --ds-splitter-pane-min-target: var(--size-target-comfortable);
      --ds-splitter-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      display: grid;
      block-size: 100%;
      inline-size: 100%;
      grid-template-columns: var(--ds-splitter-primary-size) var(--ds-splitter-separator-size) 1fr;
      grid-template-rows: 1fr;
    }

    :host([orientation='vertical']) .container {
      grid-template-columns: 1fr;
      grid-template-rows: var(--ds-splitter-primary-size) var(--ds-splitter-separator-size) 1fr;
    }

    .pane {
      overflow: auto;
    }

    :host([orientation='horizontal']) .pane {
      min-inline-size: var(--ds-splitter-pane-min-target);
      min-block-size: 0;
    }

    :host([orientation='vertical']) .pane {
      min-block-size: var(--ds-splitter-pane-min-target);
      min-inline-size: 0;
    }

    /* A collapsed primary pane genuinely reaches zero; the pane-min-target floor does not apply to it. */
    .primary-pane.is-collapsed {
      min-inline-size: 0;
      min-block-size: 0;
      overflow: hidden;
    }

    .separator {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ds-splitter-separator-color);
      transition: background var(--ds-splitter-transition) var(--motion-easing-standard);
      touch-action: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .separator {
        transition: none;
      }
    }

    :host([orientation='horizontal']) .separator {
      cursor: col-resize;
      inline-size: var(--ds-splitter-separator-size);
      block-size: 100%;
    }

    :host([orientation='vertical']) .separator {
      cursor: row-resize;
      block-size: var(--ds-splitter-separator-size);
      inline-size: 100%;
    }

    /* separatorHover: color.border.strong, locked */
    .separator:hover {
      background: var(--color-border-strong);
    }

    /* separatorActive: color.control.selectedBackground, locked; while dragging or focused */
    .separator.is-active,
    .separator:focus-visible {
      background: var(--color-control-selected-background);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, both locked */
    .separator:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* handleSize: pointer grab area, centered on the separator, overlapping both panes.
       minTarget: size.target.min hit-area floor, locked. */
    .handle {
      position: absolute;
      pointer-events: none;
    }

    :host([orientation='horizontal']) .handle {
      inset-block: 0;
      inset-inline-start: 50%;
      inline-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateX(-50%);
    }

    :host([orientation='vertical']) .handle {
      inset-inline: 0;
      inset-block-start: 50%;
      block-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateY(-50%);
    }

    /* grip: color.border.strong, locked */
    .grip {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      transform: translate(-50%, -50%);
      background: var(--color-border-strong);
      border-radius: var(--radius-full);
    }

    :host([orientation='horizontal']) .grip {
      inline-size: var(--ds-splitter-separator-size);
      block-size: var(--ds-splitter-grip-length);
    }

    :host([orientation='vertical']) .grip {
      block-size: var(--ds-splitter-separator-size);
      inline-size: var(--ds-splitter-grip-length);
    }

    .collapse-button {
      position: absolute;
      pointer-events: auto;
    }

    :host([orientation='horizontal']) .collapse-button {
      inset-inline-start: 50%;
      inset-block-start: var(--ds-splitter-collapse-button-offset);
      transform: translateX(-50%);
    }

    :host([orientation='vertical']) .collapse-button {
      inset-block-start: 50%;
      inset-inline-start: var(--ds-splitter-collapse-button-offset);
      transform: translateY(-50%);
    }

    @container (max-width: ${unsafeCSS(CONTENT_BREAKPOINT_PX)}px) {
      :host([orientation='horizontal'][stack-below='content']) .container {
        grid-template-columns: 1fr;
        grid-template-rows: auto var(--ds-splitter-separator-size) auto;
      }
      :host([orientation='horizontal'][stack-below='content']) .separator {
        cursor: default;
        inline-size: 100%;
        block-size: var(--ds-splitter-separator-size);
      }
      :host([orientation='horizontal'][stack-below='content']) .handle,
      :host([orientation='horizontal'][stack-below='content']) .collapse-button {
        display: none;
      }
      :host([orientation='horizontal'][stack-below='content']) .pane {
        min-inline-size: 0;
      }
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT_PX)}px) {
      :host([orientation='horizontal'][stack-below='prose']) .container {
        grid-template-columns: 1fr;
        grid-template-rows: auto var(--ds-splitter-separator-size) auto;
      }
      :host([orientation='horizontal'][stack-below='prose']) .separator {
        cursor: default;
        inline-size: 100%;
        block-size: var(--ds-splitter-separator-size);
      }
      :host([orientation='horizontal'][stack-below='prose']) .handle,
      :host([orientation='horizontal'][stack-below='prose']) .collapse-button {
        display: none;
      }
      :host([orientation='horizontal'][stack-below='prose']) .pane {
        min-inline-size: 0;
      }
    }
  `;

  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  @property() label = '';

  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  @property({ reflect: true }) orientation: SplitterOrientation = 'horizontal';

  /** Controlled size of the primary pane, percent (0-100). Omit for an uncontrolled splitter. */
  @property({ type: Number }) size?: number;

  /** Initial primary size, percent, for an uncontrolled splitter. */
  @property({ type: Number, attribute: 'default-size' }) defaultSize = 30;

  /** Smallest primary size, percent. Below this the pane collapses instead, when `collapsible`. */
  @property({ type: Number, attribute: 'min-size' }) minSize = 10;

  /** Largest primary size, percent. */
  @property({ type: Number, attribute: 'max-size' }) maxSize = 90;

  /** Arrow-key increment, percent. */
  @property({ type: Number }) step = 2;

  /** The primary pane can collapse to nothing: drag past `minSize`, press Enter on the separator, or use the
      collapse button. Enter again (or the button) restores the last size. */
  @property({ type: Boolean, reflect: true }) collapsible = false;

  /** Collapsed state. Two-way: set initially to start collapsed, or read/set at any time; the component keeps it
      current as the user drags, presses Enter, or uses the collapse button. */
  @property({ type: Boolean, reflect: true }) collapsed = false;

  /** When set, the size and collapsed state are remembered in `localStorage` under this key across mounts. */
  @property({ attribute: 'persist-key' }) persistKey?: string;

  /** Below this layout width a horizontal splitter stacks its panes and the separator becomes inert. */
  @property({ reflect: true, attribute: 'stack-below' }) stackBelow: SplitterStackBelow = 'prose';

  /** Per-instance style overrides: `{ separatorSize: 'space.2' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SplitterOverridableBinding, TokenRef>>;

  /** Uncontrolled size (seeded from `defaultSize`, or restored via `persistKey`, when nothing else is set). */
  @state() private internalSize?: number;

  /** Active while the pointer is dragging the separator (drives `separatorActive`). */
  @state() private dragging = false;

  /** `true` below `stackBelow`, on a horizontal splitter: the separator loses its `tabindex` and `role`. */
  @state() private stacked = false;

  private readonly instanceId = nextSplitterId();

  private resizeObserver?: ResizeObserver;

  @query('.container') private readonly containerEl!: HTMLDivElement;
  @query('.separator') private readonly separatorEl!: HTMLDivElement;
  @query('.primary-pane') private readonly primaryPaneEl!: HTMLDivElement;
  @query('.secondary-pane') private readonly secondaryPaneEl!: HTMLDivElement;
  @query('slot[name="primary"]') private readonly primarySlotEl?: HTMLSlotElement;
  @query('slot[name="secondary"]') private readonly secondarySlotEl?: HTMLSlotElement;

  /** The current primary size (percent), resolved from `size`, `internalSize`, then `defaultSize`, clamped. */
  private get currentSize(): number {
    const raw = this.size ?? this.internalSize ?? this.defaultSize;
    return this.clamp(raw);
  }

  /** The displayed/reported size: 0 while collapsed, else `currentSize`. */
  private get effectiveSize(): number {
    return this.collapsed ? 0 : this.currentSize;
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
    this.loadPersisted();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleHostKeydown);
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateStacked());
    this.resizeObserver.observe(this);
    this.updateStacked();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('orientation') || changed.has('stackBelow')) {
      this.updateStacked();
    }
    this.style.setProperty('--ds-splitter-primary-size', `${this.effectiveSize}%`);
    this.warnInDev(changed);
  }

  protected override render() {
    const horizontal = this.orientation === 'horizontal';
    const size = this.effectiveSize;
    const collapseLabel = this.collapsed ? COPY_EXPAND(this.label) : COPY_COLLAPSE(this.label);
    const chevronName: IconName = horizontal
      ? this.collapsed
        ? 'chevron-right'
        : 'chevron-left'
      : this.collapsed
        ? 'chevron-down'
        : 'chevron-up';

    return html`
      <div class="container" part="container">
        <div
          class=${classMap({ pane: true, 'primary-pane': true, 'is-collapsed': this.collapsed })}
          part="primaryPane"
          id=${this.primaryPaneId}
          tabindex="-1"
          ?inert=${this.collapsed}
        >
          <slot name="primary"></slot>
        </div>
        <div
          class=${classMap({ separator: true, 'is-active': this.dragging })}
          part="separator"
          role=${this.stacked ? 'presentation' : 'separator'}
          tabindex=${ifDefined(this.stacked ? undefined : 0)}
          aria-orientation=${ifDefined(this.stacked ? undefined : horizontal ? 'vertical' : 'horizontal')}
          aria-valuenow=${ifDefined(this.stacked ? undefined : Math.round(size))}
          aria-valuemin=${ifDefined(this.stacked ? undefined : this.minSize)}
          aria-valuemax=${ifDefined(this.stacked ? undefined : this.maxSize)}
          aria-valuetext=${ifDefined(this.stacked ? undefined : COPY_SIZE_TEXT(Math.round(size)))}
          aria-label=${ifDefined(this.stacked ? undefined : this.label)}
          aria-controls=${ifDefined(this.stacked ? undefined : this.primaryPaneId)}
          @pointerdown=${this.handleSeparatorPointerDown}
          @pointermove=${this.handleSeparatorPointerMove}
          @pointerup=${this.handleSeparatorPointerUp}
          @pointercancel=${this.handleSeparatorPointerUp}
          @keydown=${this.handleSeparatorKeydown}
        >
          <div class="handle" part="handle">
            <div class="grip" aria-hidden="true"></div>
          </div>
          ${this.collapsible
            ? html`<ds-button
                class="collapse-button"
                part="collapseButton"
                variant="ghost"
                size="sm"
                icon-only
                label=${collapseLabel}
                @press=${this.handleCollapseButtonPress}
              >
                <ds-icon slot="leading-icon" name=${chevronName}></ds-icon>
              </ds-button>`
            : nothing}
        </div>
        <div class="pane secondary-pane" part="secondaryPane" tabindex="-1">
          <slot name="secondary"></slot>
        </div>
      </div>
    `;
  }

  private readonly handleSeparatorPointerDown = (event: PointerEvent): void => {
    if (this.stacked) {
      return;
    }
    if ((event.target as HTMLElement).closest('.collapse-button')) {
      return;
    }
    event.preventDefault();
    this.dragging = true;
    this.separatorEl.setPointerCapture(event.pointerId);
    this.updateFromPointer(event);
  };

  private readonly handleSeparatorPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) {
      return;
    }
    this.updateFromPointer(event);
  };

  private readonly handleSeparatorPointerUp = (event: PointerEvent): void => {
    if (!this.dragging) {
      return;
    }
    if (this.separatorEl.hasPointerCapture(event.pointerId)) {
      this.separatorEl.releasePointerCapture(event.pointerId);
    }
    this.dragging = false;
    this.dispatchSizeChangeEnd();
    this.persist();
  };

  private updateFromPointer(event: PointerEvent): void {
    const rect = this.containerEl.getBoundingClientRect();
    const ratio =
      this.orientation === 'horizontal'
        ? rect.width === 0
          ? 0
          : (event.clientX - rect.left) / rect.width
        : rect.height === 0
          ? 0
          : (event.clientY - rect.top) / rect.height;
    const raw = Math.min(100, Math.max(0, ratio * 100));
    if (this.collapsible && raw < this.minSize) {
      this.commitSize(this.minSize);
      this.setCollapsed(true);
    } else {
      this.setCollapsed(false);
      this.commitSize(this.clamp(raw));
    }
    this.dispatchSizeChange();
  }

  private handleSeparatorKeydown(event: KeyboardEvent): void {
    if (this.stacked) {
      return;
    }
    const horizontal = this.orientation === 'horizontal';
    const growKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    switch (event.key) {
      case growKey:
        event.preventDefault();
        this.adjustSize(this.step);
        break;
      case shrinkKey:
        event.preventDefault();
        this.adjustSize(-this.step);
        break;
      case 'Home':
        event.preventDefault();
        this.setCollapsed(false);
        this.commitSize(this.minSize);
        this.dispatchSizeChange();
        this.persist();
        break;
      case 'End':
        event.preventDefault();
        this.setCollapsed(false);
        this.commitSize(this.maxSize);
        this.dispatchSizeChange();
        this.persist();
        break;
      case 'Enter':
        if (this.collapsible) {
          event.preventDefault();
          this.toggleCollapsed();
        }
        break;
      default:
        break;
    }
  }

  private readonly handleHostKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'F6' || this.stacked) {
      return;
    }
    event.preventDefault();
    this.cycleFocus();
  };

  private handleCollapseButtonPress(event: Event): void {
    event.stopPropagation();
    this.toggleCollapsed();
  }

  private adjustSize(delta: number): void {
    const base = this.collapsed ? 0 : this.currentSize;
    this.setCollapsed(false);
    this.commitSize(this.clamp(base + delta));
    this.dispatchSizeChange();
    this.persist();
  }

  private toggleCollapsed(): void {
    this.setCollapsed(!this.collapsed);
    this.persist();
  }

  private commitSize(next: number): void {
    if (this.size !== undefined) {
      this.size = next;
    } else {
      this.internalSize = next;
    }
  }

  private setCollapsed(next: boolean): void {
    if (this.collapsed === next) {
      return;
    }
    this.collapsed = next;
    this.dispatchEvent(
      new CustomEvent<SplitterCollapseChangeDetail>('collapse-change', {
        detail: { collapsed: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchSizeChange(): void {
    this.dispatchEvent(
      new CustomEvent<SplitterSizeChangeDetail>('size-change', {
        detail: { size: this.effectiveSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchSizeChangeEnd(): void {
    this.dispatchEvent(
      new CustomEvent<SplitterSizeChangeDetail>('size-change-end', {
        detail: { size: this.effectiveSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private zoneIndexOf(active: Element | null): number {
    if (!active) {
      return -1;
    }
    if (active === this.separatorEl) {
      return 1;
    }
    const primaryEls = this.primarySlotEl?.assignedElements({ flatten: true }) ?? [];
    if (primaryEls.some((el) => el === active || el.contains(active))) {
      return 0;
    }
    const secondaryEls = this.secondarySlotEl?.assignedElements({ flatten: true }) ?? [];
    if (secondaryEls.some((el) => el === active || el.contains(active))) {
      return 2;
    }
    return -1;
  }

  private focusZone(index: number): void {
    if (index === 1) {
      this.separatorEl?.focus();
      return;
    }
    const slotEl = index === 0 ? this.primarySlotEl : this.secondarySlotEl;
    const paneEl = index === 0 ? this.primaryPaneEl : this.secondaryPaneEl;
    const assigned = slotEl?.assignedElements({ flatten: true }) ?? [];
    const target = firstFocusable(assigned);
    (target ?? paneEl)?.focus();
  }

  /** F6: cycles focus through primary content, the separator, and secondary content (APG convenience). */
  private cycleFocus(): void {
    const active = (this.shadowRoot?.activeElement as Element | null) ?? document.activeElement;
    const current = this.zoneIndexOf(active);
    this.focusZone((current + 1) % 3);
  }

  private updateStacked(): void {
    if (this.orientation !== 'horizontal' || this.stackBelow === 'never') {
      this.stacked = false;
      return;
    }
    const breakpoint = this.stackBelow === 'prose' ? PROSE_BREAKPOINT_PX : CONTENT_BREAKPOINT_PX;
    this.stacked = this.getBoundingClientRect().width < breakpoint;
  }

  private get storageKey(): string {
    return `ds-splitter:${this.persistKey}`;
  }

  private loadPersisted(): void {
    if (!this.persistKey) {
      return;
    }
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { size?: number; collapsed?: boolean };
      if (this.size === undefined && typeof parsed.size === 'number') {
        this.internalSize = parsed.size;
      }
      if (typeof parsed.collapsed === 'boolean') {
        this.collapsed = parsed.collapsed;
      }
    } catch {
      /* localStorage unavailable (SSR, privacy mode); the splitter just keeps its default. */
    }
  }

  private persist(): void {
    if (!this.persistKey) {
      return;
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ size: this.currentSize, collapsed: this.collapsed }));
    } catch {
      /* localStorage unavailable (SSR, privacy mode); ignore. */
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
    if (changed.has('defaultSize') && (this.defaultSize < this.minSize || this.defaultSize > this.maxSize)) {
      console.warn(`<ds-splitter> defaultSize (${this.defaultSize}) is outside minSize/maxSize.`, this);
    }
    if (changed.has('collapsed') && this.collapsed && !this.collapsible) {
      console.warn('<ds-splitter collapsed> has no effect without `collapsible`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-splitter': DsSplitter;
  }
}
