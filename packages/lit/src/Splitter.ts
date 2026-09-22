import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
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

/**
 * copy.* — used verbatim; `{label}` and `{percent}` are the only substitutions. `setMinimum` and
 * `setMaximum` name the Home/End accessibility actions, which only the native platforms expose:
 * on Lit, Home and End are the keys themselves and carry no separate label, so nothing renders
 * them. They are kept here so the contract stays visible, as the web package does.
 */
const COPY = {
  collapse: 'Collapse {label}',
  expand: 'Expand {label}',
  setMinimum: 'Minimum {label}',
  setMaximum: 'Maximum {label}',
  sizeText: '{percent}%',
} as const;

/** stackBelow → the layout.maxWidth.* custom property whose resolved length is the breakpoint. */
const BREAKPOINT_PROPERTY: Record<Exclude<SplitterStackBelow, 'never'>, string> = {
  prose: '--layout-max-width-prose',
  content: '--layout-max-width-content',
};

/**
 * The breakpoint in CSS pixels, read from the loaded token stylesheet — `@container` conditions
 * cannot read custom properties, so stacking is measured in JS and no breakpoint is written here.
 * `null` when the tokens are not loaded, which means the splitter never stacks.
 */
function readBreakpoint(el: Element, stackBelow: Exclude<SplitterStackBelow, 'never'>): number | null {
  const raw = getComputedStyle(el).getPropertyValue(BREAKPOINT_PROPERTY[stackBelow]).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  if (raw.endsWith('rem')) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  if (raw.endsWith('em')) {
    return value * Number.parseFloat(getComputedStyle(el).fontSize);
  }
  return value;
}

/**
 * The primary size channel, set on the container and read by its grid template. Registered so a
 * collapse or restore can transition the track; `@property` does not apply inside a shadow root,
 * so Lit registers it imperatively, with the same descriptor the web package uses. Where
 * registration is unavailable the change is instant and only the separator colour transitions.
 */
const PRIMARY_SIZE_PROPERTY = '--ds-splitter-primary-size';
try {
  CSS.registerProperty({ name: PRIMARY_SIZE_PROPERTY, syntax: '<percentage>', inherits: false, initialValue: '0%' });
} catch {
  /* Already registered (the web package, or a second copy of this module) or unsupported. */
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** First focusable element among `elements` or their light-DOM descendants, in order. A custom
    element that delegates focus (a `ds-button`) counts as focusable. */
function firstFocusable(elements: Element[]): HTMLElement | null {
  for (const root of elements) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (let node: Node | null = root; node; node = walker.nextNode()) {
      if (!(node instanceof HTMLElement) || node.hasAttribute('disabled') || node.closest('[inert]')) {
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

/** The three regions F6 cycles through. */
type SplitterZone = 'primary' | 'separator' | 'secondary';

/** Overridable style hooks; see the `overrides` property. `separatorHover`, `separatorActive`,
    `grip`, `paneMinTarget`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'gripRadius'
  | 'collapseButtonOffset'
  | 'transition';

const HOOKS: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
  gripRadius: '--ds-splitter-grip-radius',
  collapseButtonOffset: '--ds-splitter-collapse-button-offset',
  transition: '--ds-splitter-transition',
};

/**
 * `<ds-splitter>` — Splitter (category: layout, APG pattern: windowsplitter).
 *
 * `<ds-splitter label="Sidebar width" collapsible persist-key="app-sidebar"><nav slot="primary">…</nav>
 * <main slot="secondary">…</main></ds-splitter>` renders a grid of the primary pane, a focusable
 * `role="separator"` and the secondary pane in its shadow root; the primary size is the custom
 * property `--ds-splitter-primary-size`, in percent. Pointer Events with `setPointerCapture` drag the
 * separator; arrows, Home, End, Enter and F6 follow the APG window splitter. Below `stackBelow` — the
 * splitter's own inline size, measured with a ResizeObserver against the loaded `--layout-max-width-*`
 * value — a horizontal splitter stacks its panes and the separator is not rendered.
 *
 * `size` and `collapsed` are controlled when set, uncontrolled from `defaultSize` / `defaultCollapsed`
 * otherwise; the events fire in both modes.
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
      --ds-splitter-separator-size: var(--space-1);
      --ds-splitter-separator-color: var(--color-border);
      --ds-splitter-handle-size: var(--space-3);
      --ds-splitter-grip-length: var(--space-6);
      --ds-splitter-grip-radius: var(--radius-full);
      --ds-splitter-collapse-button-offset: var(--space-2);
      --ds-splitter-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paneMinTarget (size.target.comfortable, locked): a minmax() floor on both tracks beneath the
       percent clamp, so a pane's scrollbar and content stay usable in a very narrow container. */
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

    /* Collapsed: the primary track drops its floor so collapse reaches zero. */
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

    /* Stacked (below stackBelow): one column, both panes in full, in source order; no separator. */
    .container.is-stacked {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto;
    }

    .container.is-stacked .secondary-pane {
      grid-column: 1;
      grid-row: 2;
    }

    /* transition: collapse and restore only; dragging and key steps resize instantly. */
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

    /* role=separator has presentational children, so the collapse Button is not inside it: the middle
       grid item is a track wrapper holding the separator and the Button wrapper as siblings. */
    .track {
      position: relative;
      z-index: 1;
      grid-column: 2;
      grid-row: 1;
    }

    :host([orientation='vertical']) .track {
      grid-column: 1;
      grid-row: 2;
    }

    /* separatorSize / separatorColor: the visible line. */
    .separator {
      position: relative;
      inline-size: 100%;
      block-size: 100%;
      background: var(--ds-splitter-separator-color);
      transition: background-color var(--ds-splitter-transition) var(--motion-easing-standard);
      cursor: col-resize;
      touch-action: none;
      outline: none;
    }

    :host([orientation='vertical']) .separator {
      cursor: row-resize;
    }

    .container.is-collapsed .separator {
      cursor: default;
    }

    /* separatorHover: color.border.strong, locked. The grab area is the separator's ::before, so
       the hover state follows the wider hit area, not the thin line. */
    .separator:hover {
      background-color: var(--color-border-strong);
    }

    /* separatorActive: color.control.selectedBackground, locked; while dragging or focused. */
    .separator[data-dragging],
    .separator:focus-visible {
      background-color: var(--color-control-selected-background);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .separator:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* handle / handleSize: the grab area centered on the line and overlapping both panes, so the
       panes keep their full width; minTarget (size.target.min, locked) is its floor. Drawn as the
       separator's ::before, so it carries no data-part hook. */
    .separator::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 50%;
      inline-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateX(-50%);
    }

    :host([orientation='vertical']) .separator::before {
      inset-block: auto;
      inset-inline: 0;
      inset-block-start: 50%;
      inline-size: auto;
      block-size: max(var(--ds-splitter-handle-size), var(--size-target-min));
      transform: translateY(-50%);
    }

    /* grip (color.border.strong, locked), gripLength, gripRadius: a short rounded bar, gripLength
       along the separator and separatorSize across it, so the divider reads as draggable. */
    .separator::after {
      content: '';
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--color-border-strong);
      border-radius: var(--ds-splitter-grip-radius);
      inline-size: var(--ds-splitter-separator-size);
      block-size: var(--ds-splitter-grip-length);
      pointer-events: none;
    }

    :host([orientation='vertical']) .separator::after {
      inline-size: var(--ds-splitter-grip-length);
      block-size: var(--ds-splitter-separator-size);
    }

    /* collapseButtonOffset: from the separator's start edge along it (top of a vertical separator,
       inline-start of a horizontal one), centered across the line so it overlaps both panes. */
    .collapse-button {
      position: absolute;
      z-index: 1;
      display: flex;
      inset-block-start: var(--ds-splitter-collapse-button-offset);
      inset-inline-start: 50%;
      transform: translateX(-50%);
    }

    :host([orientation='vertical']) .collapse-button {
      inset-block-start: 50%;
      inset-inline-start: var(--ds-splitter-collapse-button-offset);
      transform: translateY(-50%);
    }

    /* While collapsed the primary pane has no size, so the button aligns to the secondary pane's
       start edge instead of hanging outside the container. */
    .container.is-collapsed .collapse-button {
      inset-inline-start: 100%;
      transform: none;
    }

    :host([orientation='vertical']) .container.is-collapsed .collapse-button {
      inset-block-start: 100%;
      inset-inline-start: var(--ds-splitter-collapse-button-offset);
      transform: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .container.is-animating,
      .separator {
        transition: none;
      }
    }
  `;

  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  @property({ type: String }) accessor label: string = '';

  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. The
      splitter fills its parent, so a vertical splitter needs a parent with a definite height. */
  @property({ type: String, reflect: true }) accessor orientation: SplitterOrientation = 'horizontal';

  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  @property({ type: Number }) accessor size: number | undefined;

  /** Initial primary size, percent. */
  @property({ type: Number, attribute: 'default-size' }) accessor defaultSize: number = 30;

  /** Smallest primary size, percent. With `collapsible`, stepping below it collapses the pane
      instead of clamping; otherwise it is the hard floor. */
  @property({ type: Number, attribute: 'min-size' }) accessor minSize: number = 10;

  /** Largest primary size, percent. */
  @property({ type: Number, attribute: 'max-size' }) accessor maxSize: number = 90;

  /** Arrow-key increment, percent. */
  @property({ type: Number }) accessor step: number = 2;

  /** The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator,
      or use the collapse button. Enter again restores the last size. */
  @property({ type: Boolean, reflect: true }) accessor collapsible: boolean = false;

  /** Controlled collapsed state, ignored unless `collapsible`. Reflected when true; an absent
      attribute means uncontrolled, and a controlled `false` is set as a property. */
  @property({ type: Boolean, reflect: true }) accessor collapsed: boolean | undefined;

  /** Initial collapsed state when uncontrolled. */
  @property({ type: Boolean, attribute: 'default-collapsed' }) accessor defaultCollapsed: boolean = false;

  /** When set, the size and collapsed state are remembered in localStorage under this key, so a
      sidebar stays where it was left. */
  @property({ type: String, attribute: 'persist-key' }) accessor persistKey: string | undefined;

  /** Below this width of the splitter's own box a horizontal splitter stacks its panes and renders
      no separator. A vertical splitter never stacks. */
  @property({ type: String, reflect: true, attribute: 'stack-below' }) accessor stackBelow: SplitterStackBelow =
    'prose';

  /** Per-instance style overrides: `{ separatorSize: 'space.2' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SplitterOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled size; undefined until the user moves the separator or a persisted value is read. */
  @state() private accessor internalSize: number | undefined;

  /** Uncontrolled collapsed state; undefined until the user collapses, or a persisted value is read. */
  @state() private accessor internalCollapsed: boolean | undefined;

  /** True while a pointer drag is in progress (separatorActive). */
  @state() private accessor dragging = false;

  /** True below `stackBelow` on a horizontal splitter: the separator is not rendered. */
  @state() private accessor stacked = false;

  /** True for the render that collapses or restores, so only that change transitions the track. */
  @state() private accessor animating = false;

  /** Writing direction, measured once: a horizontal splitter swaps its arrow keys, its drag axis and
      its chevron in RTL, so the separator always moves the way the arrow points. */
  @state() private accessor rtl = false;

  private readonly instanceId = nextSplitterId();
  private resizeObserver: ResizeObserver | undefined;
  private observedWidth = -1;
  /** The last committed expanded size during a drag; the size a collapse keeps for restoring. */
  private dragSize = 0;
  /** True once a drag has actually changed the size. A press that never moved the separator is not
      a drag and fires nothing, so a stray tap on the separator is silent. */
  private dragMoved = false;

  @query('.container') private accessor containerEl!: HTMLDivElement | null;
  @query('.track') private accessor trackEl!: HTMLDivElement | null;
  @query('[data-part="separator"]') private accessor separatorEl!: HTMLDivElement | null;
  @query('[data-part="primaryPane"]') private accessor primaryPaneEl!: HTMLDivElement | null;
  @query('[data-part="secondaryPane"]') private accessor secondaryPaneEl!: HTMLDivElement | null;
  @query('[data-part="collapseButton"] > ds-button') private accessor collapseButtonEl!: HTMLElement | null;
  @query('slot[name="primary"]') private accessor primarySlotEl!: HTMLSlotElement | null;
  @query('slot[name="secondary"]') private accessor secondarySlotEl!: HTMLSlotElement | null;

  /** The primary size (percent) when expanded: `size`, else the uncontrolled value, else
      `defaultSize`, clamped to `minSize`–`maxSize`. */
  private get currentSize(): number {
    return this.clamp(this.size ?? this.internalSize ?? this.defaultSize);
  }

  /** The collapsed state the props ask for. `collapsed` is ignored unless `collapsible`. */
  private get isCollapsed(): boolean {
    return this.collapsible && (this.collapsed ?? this.internalCollapsed ?? this.defaultCollapsed);
  }

  /** The collapsed state that renders: a stacked splitter shows both panes in full. */
  private get effectiveCollapsed(): boolean {
    return this.isCollapsed && !this.stacked;
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
    // No ResizeObserver (an old browser, a server render): the splitter simply never stacks.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver ??= new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        // observe() always delivers an initial notification; only a changed width may set state.
        const width = entry.contentRect.width;
        if (width === this.observedWidth) {
          return;
        }
        this.observedWidth = width;
        this.updateStacked(width);
      });
      this.resizeObserver.observe(this);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleHostKeydown);
    this.resizeObserver?.disconnect();
    this.observedWidth = -1;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('persistKey')) {
      this.loadPersisted();
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    // A controlled collapse animates too; the uncontrolled path sets `animating` as it changes.
    if (changed.has('collapsed') && changed.get('collapsed') !== undefined) {
      this.animating = true;
    }
    // Measured before the first render, so the separator is never rendered and then taken away.
    if (!this.hasUpdated) {
      this.rtl = getComputedStyle(this).direction === 'rtl';
    }
    if (!this.hasUpdated || changed.has('orientation') || changed.has('stackBelow')) {
      this.updateStacked(this.getBoundingClientRect().width);
    }
    this.warnInDev(changed);
  }

  protected override updated(): void {
    this.persist();
  }

  protected override render(): TemplateResult {
    const horizontal = this.orientation === 'horizontal';
    const collapsed = this.effectiveCollapsed;
    const percent = collapsed ? 0 : Math.round(this.currentSize);
    // The chevron points toward the primary pane while expanded and away from it while collapsed;
    // on a horizontal splitter that is mirrored in RTL, where the primary pane sits on the right.
    const pointsAtPrimary = !collapsed;
    const chevron: IconName = horizontal
      ? pointsAtPrimary !== this.rtl
        ? 'chevron-left'
        : 'chevron-right'
      : pointsAtPrimary
        ? 'chevron-up'
        : 'chevron-down';

    return html`
      <div
        class=${classMap({
          container: true,
          'is-collapsed': collapsed,
          'is-stacked': this.stacked,
          'is-animating': this.animating,
        })}
        data-part="container"
        style=${styleMap({ [PRIMARY_SIZE_PROPERTY]: `${collapsed ? 0 : this.currentSize}%` })}
      >
        <div class="pane primary-pane" data-part="primaryPane" id=${this.primaryPaneId} ?inert=${collapsed}>
          <slot name="primary"></slot>
        </div>
        ${this.stacked
          ? nothing
          : html`<div class="track">
              <div
                class="separator"
                data-part="separator"
                role="separator"
                tabindex="0"
                aria-orientation=${horizontal ? 'vertical' : 'horizontal'}
                aria-valuenow=${percent}
                aria-valuemin=${collapsed ? 0 : this.minSize}
                aria-valuemax=${this.maxSize}
                aria-valuetext=${COPY.sizeText.replace('{percent}', String(percent))}
                aria-label=${this.label}
                aria-controls=${this.primaryPaneId}
                ?data-dragging=${this.dragging}
                @pointerdown=${this.handlePointerDown}
                @pointermove=${this.handlePointerMove}
                @pointerup=${this.handlePointerEnd}
                @pointercancel=${this.handlePointerEnd}
                @keydown=${this.handleSeparatorKeydown}
              ></div>
              ${this.collapsible
                ? html`<span
                    class="collapse-button"
                    data-part="collapseButton"
                    @click=${this.handleCollapseTargetClick}
                  >
                    <ds-button
                      variant="ghost"
                      size="sm"
                      icon-only
                      .expanded=${!collapsed}
                      label=${(collapsed ? COPY.expand : COPY.collapse).replace('{label}', this.label)}
                      @press=${this.handleCollapsePress}
                    >
                      <ds-icon slot="leading-icon" name=${chevron}></ds-icon>
                    </ds-button>
                  </span>`
                : nothing}
            </div>`}
        <div class="pane secondary-pane" data-part="secondaryPane">
          <slot name="secondary"></slot>
        </div>
      </div>
    `;
  }

  // ── Pointer ─────────────────────────────────────────────────────────────────

  private handlePointerDown(event: PointerEvent): void {
    if (this.isCollapsed || event.button !== 0 || !this.separatorEl) {
      return;
    }
    event.preventDefault();
    this.separatorEl.focus();
    this.separatorEl.setPointerCapture(event.pointerId);
    this.animating = false;
    this.dragging = true;
    this.dragSize = this.currentSize;
    this.dragMoved = false;
  }

  private handlePointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    const raw = this.percentFromPoint(event.clientX, event.clientY);
    if (raw === undefined) {
      return;
    }
    if (this.collapsible && raw < this.minSize) {
      // Dragging past the minimum collapses: the gesture ends here and the last expanded size is
      // kept for restoring, so the end event carries it and the rest of the drag is ignored.
      this.stopDrag(event.pointerId);
      this.dispatchSize('size-change-end', this.dragSize);
      this.setCollapsed(true);
      return;
    }
    const committed = this.changeSize(raw);
    if (committed !== undefined) {
      this.dragSize = committed;
      this.dragMoved = true;
    }
  }

  /** A gesture the platform cancels counts as a release; a press that never moved is silent. */
  private handlePointerEnd(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    const moved = this.dragMoved;
    this.stopDrag(event.pointerId);
    if (moved) {
      this.dispatchSize('size-change-end', this.dragSize);
    }
  }

  private stopDrag(pointerId: number): void {
    this.dragging = false;
    this.dragMoved = false;
    if (this.separatorEl?.hasPointerCapture(pointerId)) {
      this.separatorEl.releasePointerCapture(pointerId);
    }
  }

  /** The pointer as a percentage of the container along the drag axis, mirrored in RTL. */
  private percentFromPoint(clientX: number, clientY: number): number | undefined {
    const rect = this.containerEl?.getBoundingClientRect();
    if (!rect) {
      return undefined;
    }
    if (this.orientation === 'horizontal') {
      if (rect.width === 0) {
        return undefined;
      }
      const ratio = (clientX - rect.left) / rect.width;
      return (this.rtl ? 1 - ratio : ratio) * 100;
    }
    if (rect.height === 0) {
      return undefined;
    }
    return ((clientY - rect.top) / rect.height) * 100;
  }

  // ── Keyboard ────────────────────────────────────────────────────────────────

  private handleSeparatorKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (!this.collapsible) {
        return;
      }
      event.preventDefault();
      this.setCollapsed(!this.isCollapsed);
      return;
    }
    // In RTL a horizontal splitter swaps ArrowLeft and ArrowRight, as dragging does.
    const vertical = this.orientation === 'vertical';
    const growKey = vertical ? 'ArrowDown' : this.rtl ? 'ArrowLeft' : 'ArrowRight';
    const shrinkKey = vertical ? 'ArrowUp' : this.rtl ? 'ArrowRight' : 'ArrowLeft';
    let next: number;
    switch (event.key) {
      case growKey:
        next = this.currentSize + this.step;
        break;
      case shrinkKey:
        next = this.currentSize - this.step;
        break;
      case 'Home':
        next = this.minSize;
        break;
      case 'End':
        next = this.maxSize;
        break;
      default:
        return;
    }
    event.preventDefault();
    // While collapsed, arrows, Home and End do nothing; only Enter or the collapse button restores.
    if (this.isCollapsed) {
      return;
    }
    // A shrink step that would cross the floor clamps to minSize first; the next one collapses.
    // Home sets minSize and never collapses.
    if (this.collapsible && event.key === shrinkKey && this.currentSize <= this.minSize) {
      this.setCollapsed(true);
      return;
    }
    const committed = this.changeSize(next);
    if (committed !== undefined) {
      // A key press is a complete interaction, so the end event fires too.
      this.dispatchSize('size-change-end', committed);
    }
  }

  /** F6 cycles primary pane → separator → secondary pane → primary pane, wrapping. Shift+F6 is not
      handled, and a collapsed (inert) primary pane or an unrendered separator is skipped. */
  private readonly handleHostKeydown = (event: KeyboardEvent): void => {
    if (
      event.key !== 'F6' ||
      event.defaultPrevented ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    const zones: SplitterZone[] = [];
    if (!this.effectiveCollapsed) {
      zones.push('primary');
    }
    if (!this.stacked) {
      zones.push('separator');
    }
    zones.push('secondary');

    // The collapse Button belongs to the separator zone, so the whole track counts as the separator.
    const path = event.composedPath();
    const current: SplitterZone | undefined =
      this.primaryPaneEl && path.includes(this.primaryPaneEl)
        ? 'primary'
        : this.trackEl && path.includes(this.trackEl)
          ? 'separator'
          : this.secondaryPaneEl && path.includes(this.secondaryPaneEl)
            ? 'secondary'
            : undefined;
    // Focus outside the splitter starts from the last zone, so the first press lands on the primary.
    const index = current === undefined ? zones.length - 1 : zones.indexOf(current);
    const target = zones[(index + 1) % zones.length];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.focusZone(target);
  };

  private focusZone(zone: SplitterZone): void {
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

  // ── Collapse button ─────────────────────────────────────────────────────────

  private handleCollapsePress(event: Event): void {
    // The composite dispatches its own collapse-change; the inner Button's press stops here.
    event.stopPropagation();
    this.setCollapsed(!this.isCollapsed);
  }

  /** The collapseButton part is a wrapper; a click on it reaches the composed Button. */
  private handleCollapseTargetClick(event: MouseEvent): void {
    const button = this.collapseButtonEl;
    if (!button || event.composedPath().includes(button)) {
      return;
    }
    button.click();
  }

  // ── State ───────────────────────────────────────────────────────────────────

  /** Applies a new size and fires `size-change`; returns the committed value, or undefined when the
      size did not change (a key press at a bound fires nothing). */
  private changeSize(next: number): number | undefined {
    const clamped = this.clamp(next);
    this.animating = false;
    if (clamped === this.currentSize) {
      return undefined;
    }
    if (this.size === undefined) {
      this.internalSize = clamped;
    }
    this.dispatchSize('size-change', clamped);
    return clamped;
  }

  private setCollapsed(next: boolean): void {
    if (this.isCollapsed === next) {
      return;
    }
    this.animating = true;
    if (this.collapsed === undefined) {
      this.internalCollapsed = next;
    }
    // A collapse fires only collapse-change; the size is kept for restoring, so no size events.
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

  private updateStacked(width: number): void {
    let next = false;
    if (this.orientation === 'horizontal' && this.stackBelow !== 'never' && this.isConnected && width > 0) {
      const breakpoint = readBreakpoint(this, this.stackBelow);
      next = breakpoint !== null && width < breakpoint;
    }
    if (this.stacked !== next) {
      this.stacked = next;
    }
  }

  // ── persistKey ──────────────────────────────────────────────────────────────

  private loadPersisted(): void {
    if (!this.persistKey) {
      return;
    }
    try {
      const raw = localStorage.getItem(this.persistKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return;
      }
      const { size, collapsed } = parsed as Record<string, unknown>;
      if (typeof size === 'number' && Number.isFinite(size)) {
        this.internalSize = size;
      }
      if (typeof collapsed === 'boolean') {
        this.internalCollapsed = collapsed;
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
      localStorage.setItem(this.persistKey, JSON.stringify({ size: this.currentSize, collapsed: this.isCollapsed }));
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
