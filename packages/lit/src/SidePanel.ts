import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Icon.js';
import './Box.js';
import './Stack.js';
import './FocusScope.js';

export type SidePanelSide = 'start' | 'end';
export type SidePanelWidth = 'narrow' | 'default' | 'wide';
export type SidePanelPersistent = 'never' | 'content' | 'page';
export type SidePanelLandmark = 'complementary' | 'navigation';
export type SidePanelOpenChangeReason =
  | 'trigger'
  | 'escape'
  | 'close-button'
  | 'scrim'
  | 'outside'
  | 'swipe'
  | 'action'
  | 'navigation';

/** Detail carried by the `open-change` CustomEvent. */
export interface SidePanelOpenChangeDetail {
  open: boolean;
  reason: SidePanelOpenChangeReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded, but keep their `:host` hooks. */
export type SidePanelOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'border'
  | 'borderWidth'
  | 'width'
  | 'widthNarrow'
  | 'widthWide'
  | 'edgeGutter'
  | 'inset'
  | 'headerGap'
  | 'headingGap'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<SidePanelOverridableBinding, string> = {
  scrim: '--ds-side-panel-scrim',
  shadow: '--ds-side-panel-shadow',
  border: '--ds-side-panel-border',
  borderWidth: '--ds-side-panel-border-width',
  width: '--ds-side-panel-width',
  widthNarrow: '--ds-side-panel-width-narrow',
  widthWide: '--ds-side-panel-width-wide',
  edgeGutter: '--ds-side-panel-edge-gutter',
  inset: '--ds-side-panel-inset',
  headerGap: '--ds-side-panel-header-gap',
  headingGap: '--ds-side-panel-heading-gap',
  partGap: '--ds-side-panel-part-gap',
  footerGap: '--ds-side-panel-footer-gap',
  layer: '--ds-side-panel-layer',
  enter: '--ds-side-panel-enter',
  exit: '--ds-side-panel-exit',
};

/**
 * `copy.*`, verbatim. `expanded` is rendered only on SwiftUI: here the trigger's
 * `aria-expanded` carries the state and the platform announces it in its own
 * words, so the string is carried unused rather than dropped.
 */
const COPY = { closeLabel: 'Close', expanded: 'Expanded' };

/** The persistent breakpoint for each `persistent` value, read through its token. */
const PERSISTENT_BREAKPOINT_VARS: Record<Exclude<SidePanelPersistent, 'never'>, string> = {
  content: '--layout-max-width-content',
  page: '--layout-max-width-page',
};

/** Negates a boolean attribute: `no-dismiss` present means `dismissible` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'ds-button',
  'ds-link',
  'ds-input',
  'ds-checkbox',
  'ds-switch',
  'ds-radio-group',
  'ds-disclosure',
].join(',');

/** How many modal `<ds-side-panel>` instances currently hold the body-scroll lock. */
let scrollLockCount = 0;

function lockBodyScroll(): void {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.documentElement.style.removeProperty('overflow');
  }
}

/**
 * A CSS length resolved to px, measured once with an off-screen probe on
 * `<html>`. A `rem` breakpoint handed straight to `matchMedia` resolves against
 * the initial font size rather than the one on `<html>`, so the token is
 * converted before the media query is built.
 */
function measurePx(length: string): number {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.inlineSize = length;
  document.documentElement.append(probe);
  const px = probe.getBoundingClientRect().width;
  probe.remove();
  return px;
}

/** The focused element, descending through open shadow roots. */
function deepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** Longest `transition-duration + transition-delay` pair on an element, in milliseconds. */
function transitionTimeMs(element: Element): number {
  const style = getComputedStyle(element);
  const toMs = (value: string): number => (value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000) || 0;
  const durations = style.transitionDuration.split(',').map((part) => toMs(part.trim()));
  const delays = style.transitionDelay.split(',').map((part) => toMs(part.trim()));
  return durations.reduce((max, duration, index) => Math.max(max, duration + (delays[index] ?? 0)), 0);
}

/**
 * `<ds-side-panel>` — SidePanel (category: overlay, APG pattern: disclosure).
 *
 * `<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger"
 * icon-only label="Menu"><ds-icon slot="leading-icon" name="menu"></ds-icon></ds-button>
 * <ds-stack>…</ds-stack></ds-side-panel>`.
 *
 * The `trigger` slot holds the APG disclosure button: activating it toggles
 * the panel and the panel sets `aria-expanded` on it (`expanded` on a
 * `<ds-button>`). `aria-controls` is never set — it cannot address an id in
 * the shadow root, so the panel is named by its heading instead. Non-modal
 * (default): the panel is a shadow `<aside>` (a `<nav>` for
 * `landmark="navigation"`) placed right after the trigger slot, `hidden` when
 * closed; focus stays on the trigger and document order walks Tab into it.
 * Modal: a shadow `<dialog>` opened with `showModal()` that fills the viewport
 * with a transparent `::backdrop` around a real scrim element and the
 * edge-positioned surface — top layer, inert page, scroll lock, focus moved in
 * and trapped. Above the `persistent` breakpoint (a `matchMedia` listener on
 * the resolved `layout.maxWidth.*` token) the host lays out as a sidebar in the
 * parent grid and the same header/body/footer render in the landmark, with no
 * scrim, trap or trigger.
 *
 * `open` is controlled when set: user actions only dispatch `open-change`, and
 * the panel changes once the property does. Omitted, the panel keeps its own
 * state and still dispatches `open-change`.
 *
 * @fires open-change - `{ open, reason }` when a user action opens or closes the panel.
 * @slot trigger - The APG disclosure button. Omit to control `open` from elsewhere.
 * @slot - The body: a Stack or Tree of Links, a Stack of filter controls, a Stack of Cards. Scrolls inside the panel.
 * @slot footer - Pinned to the bottom of the panel above the safe area.
 */
@customElement('ds-side-panel')
export class DsSidePanel extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      --ds-side-panel-scrim: var(--color-overlay-scrim);
      --ds-side-panel-shadow: var(--shadow-overlay);
      --ds-side-panel-border: var(--color-border);
      --ds-side-panel-border-width: var(--border-width-thin);
      --ds-side-panel-width: var(--layout-max-width-prose);
      --ds-side-panel-width-narrow: calc(var(--space-20) * 3);
      --ds-side-panel-width-wide: var(--layout-max-width-content);
      --ds-side-panel-edge-gutter: var(--space-12);
      --ds-side-panel-inset: var(--layout-inset-lg);
      --ds-side-panel-header-gap: var(--layout-gap-normal);
      --ds-side-panel-heading-gap: var(--space-0);
      --ds-side-panel-part-gap: var(--layout-gap-loose);
      --ds-side-panel-footer-gap: var(--layout-gap-tight);
      --ds-side-panel-layer: var(--layer-sheet);
      --ds-side-panel-enter: var(--motion-duration-base);
      --ds-side-panel-exit: var(--motion-duration-fast);
      /* Locked: out of the overrides type, still themeable and renameable through these hooks. */
      --ds-side-panel-surface: var(--color-overlay-surface);
      --ds-side-panel-focus-ring: var(--color-border-focus);
      --ds-side-panel-focus-ring-width: var(--border-width-focus);
      --ds-side-panel-active-width: var(--ds-side-panel-width);
      /* 100% of the fixed containing block, which excludes the scrollbar gutter — never 100vw. */
      --ds-side-panel-inline-size: min(
        var(--ds-side-panel-active-width),
        calc(100% - var(--ds-side-panel-edge-gutter))
      );
    }

    :host([width='narrow']) {
      --ds-side-panel-active-width: var(--ds-side-panel-width-narrow);
    }
    :host([width='wide']) {
      --ds-side-panel-active-width: var(--ds-side-panel-width-wide);
    }

    :host([hidden]) {
      display: none;
    }

    /* Persistent: above the breakpoint the host itself is the sidebar in the parent grid. */
    :host([data-persistent]) {
      display: block;
      inline-size: var(--ds-side-panel-active-width);
    }
    :host([data-persistent]) ::slotted([slot='trigger']) {
      display: none;
    }

    /* scrim: color.overlay.scrim. Shares the layer binding with the surface — no token
       arithmetic; it precedes the surface in the DOM, so the surface paints above it. */
    .scrim {
      position: fixed;
      inset: 0;
      background: var(--ds-side-panel-scrim);
      z-index: var(--ds-side-panel-layer);
      opacity: 1;
      transition: opacity var(--ds-side-panel-enter) var(--motion-easing-standard);
    }
    .scrim[hidden] {
      display: none;
    }
    .scrim.closing {
      opacity: 0;
      transition-duration: var(--ds-side-panel-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    @starting-style {
      .scrim:not([hidden]) {
        opacity: 0;
      }
    }

    /* Addressed by class: the body's <ds-box> writes its own data-part="surface" on its host. */
    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — excluded from the overrides type, hook kept */
      background: var(--ds-side-panel-surface);
    }
    .surface[hidden] {
      display: none;
    }

    /* The modal <dialog> fills the viewport and holds the scrim and the surface;
       the native backdrop stays clear. */
    dialog {
      box-sizing: border-box;
      position: fixed;
      inset: 0;
      inline-size: auto;
      block-size: auto;
      max-inline-size: none;
      max-block-size: none;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      overflow: hidden;
      z-index: var(--ds-side-panel-layer);
    }
    dialog:not([open]) {
      display: none;
    }
    dialog::backdrop {
      background: transparent;
    }
    dialog .scrim,
    dialog .overlay {
      position: absolute;
    }

    .overlay {
      position: fixed;
      inset-block: 0;
      inset-inline: auto;
      block-size: 100%;
      inline-size: var(--ds-side-panel-inline-size);
      box-shadow: var(--ds-side-panel-shadow);
      z-index: var(--ds-side-panel-layer);
    }

    /* enter: slide in from the edge over motion.duration.base / motion.easing.standard.
       The inset-inline properties keep the slide on the writing-direction edge under RTL. */
    :host([side='start']) .overlay {
      inset-inline-start: 0;
      transition: inset-inline-start var(--ds-side-panel-enter) var(--motion-easing-standard);
    }
    :host([side='end']) .overlay {
      inset-inline-end: 0;
      transition: inset-inline-end var(--ds-side-panel-enter) var(--motion-easing-standard);
    }
    /* exit: slide out over motion.duration.fast / motion.easing.exit. */
    :host([side='start']) .overlay.closing {
      inset-inline-start: calc(-1 * var(--ds-side-panel-inline-size));
    }
    :host([side='end']) .overlay.closing {
      inset-inline-end: calc(-1 * var(--ds-side-panel-inline-size));
    }
    .overlay.closing {
      transition-duration: var(--ds-side-panel-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    @starting-style {
      :host([side='start']) .overlay:not([hidden]) {
        inset-inline-start: calc(-1 * var(--ds-side-panel-inline-size));
      }
      :host([side='end']) .overlay:not([hidden]) {
        inset-inline-end: calc(-1 * var(--ds-side-panel-inline-size));
      }
    }

    /* Overlay mode only: the safe-area inset on the physical edge the panel touches. */
    :host([side='start']) .overlay {
      padding-inline-start: env(safe-area-inset-left);
    }
    :host([side='end']) .overlay {
      padding-inline-end: env(safe-area-inset-right);
    }
    :host(:dir(rtl)[side='start']) .overlay {
      padding-inline-start: env(safe-area-inset-right);
    }
    :host(:dir(rtl)[side='end']) .overlay {
      padding-inline-end: env(safe-area-inset-left);
    }

    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .overlay {
        transition: none;
      }
    }

    /* Persistent: natural height (the page scrolls, not the body), a border on the
       edge facing the content, no shadow and no safe-area padding. */
    .sidebar {
      position: relative;
      inline-size: 100%;
    }
    :host([side='start']) .sidebar {
      border-inline-end: var(--ds-side-panel-border-width) solid var(--ds-side-panel-border);
    }
    :host([side='end']) .sidebar {
      border-inline-start: var(--ds-side-panel-border-width) solid var(--ds-side-panel-border);
    }

    /* FocusScope writes its own data-part="scope", so the parts column is an
       overlay-owned element directly inside it. */
    ds-focus-scope {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-block-size: 0;
    }

    /* partGap: the only space between header, body and footer. The block edges are
       padded once, here, so nothing doubles with the parts' own inline padding. */
    [data-part='focusScope'] {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-side-panel-part-gap);
      flex: 1 1 auto;
      min-block-size: 0;
      padding-block: var(--ds-side-panel-inset);
    }
    .overlay [data-part='focusScope'] {
      padding-block-start: calc(var(--ds-side-panel-inset) + env(safe-area-inset-top));
      padding-block-end: calc(var(--ds-side-panel-inset) + env(safe-area-inset-bottom));
    }

    [data-part='header'] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-side-panel-header-gap);
      padding-inline: var(--ds-side-panel-inset);
      flex: 0 0 auto;
    }
    /* Only the close button is left in the header: end-align it. */
    [data-part='header'].heading-hidden {
      justify-content: flex-end;
    }

    /* headingGap: forwarded to the Heading's marginBlockEnd, turning its own margin off. */
    [data-part='heading'] {
      --ds-heading-margin-block-end: var(--ds-side-panel-heading-gap);
      min-inline-size: 0;
    }
    [data-part='heading']:focus-visible {
      outline: var(--ds-side-panel-focus-ring-width) solid var(--ds-side-panel-focus-ring);
      outline-offset: var(--ds-side-panel-focus-ring-width);
    }

    /* hideHeading: kept for the accessible name, removed from the visual layout. */
    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    [data-part='closeButton'] {
      flex: none;
    }

    /* Box never scrolls, so the body part is an overlay-owned scroll element around it;
       partGap measures to this wrapper. */
    [data-part='body'] {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }
    /* inset: forwarded as the body Box's paddingInline hook; its block padding stays zero. */
    [data-part='body'] > ds-box {
      --ds-box-padding-inline: var(--ds-side-panel-inset);
    }

    [data-part='footer'] {
      flex: 0 0 auto;
      padding-inline: var(--ds-side-panel-inset);
    }
    [data-part='footer'][hidden] {
      display: none;
    }
  `;

  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). */
  @property() accessor heading: string = '';

  /** Keep the title for assistive technology but do not show it. The accessible name is required regardless. */
  @property({ type: Boolean, attribute: 'hide-heading' }) accessor hideHeading = false;

  /** The edge the panel slides from; `start`/`end` follow the writing direction. */
  @property({ type: String, reflect: true }) accessor side: SidePanelSide = 'start';

  /** Panel width on wide screens. On phones the panel is the viewport width minus `edgeGutter`. */
  @property({ type: String, reflect: true }) accessor width: SidePanelWidth = 'default';

  /** Above this layout width the panel becomes a fixed sidebar: always visible, no scrim, no trap, no trigger. */
  @property({ type: String, reflect: true }) accessor persistent: SidePanelPersistent = 'never';

  /**
   * The doc's `role`: the landmark the panel exposes (persistent, and the
   * non-modal region). Named `landmark` because `Element` already defines `role`.
   */
  @property({ type: String }) accessor landmark: SidePanelLandmark = 'complementary';

  /** `false` (default, the disclosure pattern): a disclosed region. `true`: a modal dialog at the edge. */
  @property({ type: Boolean }) accessor modal = false;

  /** Show the scrim in non-modal mode too (modal always has one). Attribute `no-scrim` negates it. */
  @property({ attribute: 'no-scrim', converter: NEGATED_BOOLEAN_CONVERTER }) accessor scrim = true;

  /**
   * Escape, the close button, a scrim tap / outside click and the swipe request
   * close. When false the close button is not rendered and a scrim tap or an
   * outside press does nothing; Escape still reports `open-change` with reason
   * `escape` and the consumer decides.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Accepted for parity; the swipe gesture is native only and wires nothing on Lit. Attribute `no-swipeable` negates it. */
  @property({ attribute: 'no-swipeable', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor swipeable = true;

  /** Per-instance style overrides: `{ inset: 'layout.inset.md' }`. Locked bindings are ignored. */
  @property({ attribute: false })
  accessor overrides: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** Whether the persistent breakpoint currently matches. */
  @state() private accessor isPersistent = false;

  /** Whether the exit transition is playing (the panel stays rendered until it ends). */
  @state() private accessor closing = false;

  /** Whether the footer slot has assigned content. */
  @state() private accessor hasFooter = false;

  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('[data-part="heading"]') private accessor headingEl!: HTMLElement | null;
  @query('[data-part="closeButton"]') private accessor closeButtonEl!: HTMLElement | null;

  private triggerEl: HTMLElement | null = null;
  private persistentQuery: MediaQueryList | null = null;
  private overlayShown = false;
  private overlayModal = false;
  private holdsScrollLock = false;
  private openerEl: HTMLElement | null = null;
  /**
   * Where focus goes when the pending close finishes: `trigger` always, `none`
   * never (a followed Link owns focus; an outside press put it where it is),
   * `auto` only if focus was inside or the panel was modal (a controlled close).
   */
  private closeFocus: 'trigger' | 'none' | 'auto' = 'auto';
  private exitTimer: ReturnType<typeof setTimeout> | undefined;
  private warnedHeading = false;

  /** Whether the panel is currently open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'SidePanel');
    this.addEventListener('submit', this.handleSubmit);
    this.setupPersistentQuery();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('submit', this.handleSubmit);
    this.persistentQuery?.removeEventListener('change', this.handlePersistentChange);
    this.persistentQuery = null;
    this.removeOutsideListener();
    clearTimeout(this.exitTimer);
    this.releaseScrollLock();
    this.overlayShown = false;
    this.closing = false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('persistent') && this.isConnected) {
      this.setupPersistentQuery();
    }
    // The next render swaps the presentation (dialog ↔ region ↔ sidebar): tear the current one down now.
    const presentationChanged =
      (changed.has('modal') && changed.get('modal') !== undefined) ||
      (changed.has('isPersistent') && this.isPersistent);
    if (presentationChanged && (this.overlayShown || this.closing)) {
      this.overlayShown = false;
      this.finishClose();
    }
  }

  protected override updated(): void {
    const showOverlay = this.currentOpen && !this.isPersistent;
    if (showOverlay !== this.overlayShown) {
      this.overlayShown = showOverlay;
      if (showOverlay) {
        this.openOverlay();
      } else {
        this.startExit();
      }
    }
    this.toggleAttribute('data-persistent', this.isPersistent);
    this.updateTriggerExpanded();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const isPersistent = this.isPersistent;
    const visible = isPersistent || this.currentOpen || this.closing;
    const useDialog = this.modal && !isPersistent;
    const closing = this.closing ? ' closing' : '';
    const showCloseButton = this.dismissible && !isPersistent;

    const headingTemplate = html`<ds-heading
      id="heading"
      part="heading"
      data-part="heading"
      class=${this.hideHeading ? 'visually-hidden' : ''}
      level="2"
      size="lg"
      tabindex="-1"
      .overrides=${this.headingOverrides()}
      >${this.heading}</ds-heading
    >`;
    // hideHeading with no close button leaves the header empty: drop it, and the hidden title
    // sits at the top of the surface so aria-labelledby still resolves.
    const header =
      this.hideHeading && !showCloseButton
        ? headingTemplate
        : html`<div part="header" data-part="header" class=${this.hideHeading ? 'heading-hidden' : ''}>
            ${headingTemplate}
            ${showCloseButton
              ? html`
                  <ds-button
                    part="closeButton"
                    data-part="closeButton"
                    variant="ghost"
                    icon-only
                    label=${COPY.closeLabel}
                    @press=${this.handleCloseButtonPress}
                  >
                    <ds-icon slot="leading-icon" name="close"></ds-icon>
                  </ds-button>
                `
              : nothing}
          </div>`;

    const content = html`
      <ds-focus-scope .trapped=${useDialog} .active=${visible} auto-focus="none" .restoreFocus=${false}>
        <div part="focusScope" data-part="focusScope" @click=${this.handlePanelClick}>
          ${header}
          <div part="body" data-part="body">
            <ds-box .overrides=${this.bodyOverrides()}>
              <slot></slot>
            </ds-box>
          </div>
          <ds-stack
            part="footer"
            data-part="footer"
            direction="horizontal"
            gap="tight"
            justify="end"
            ?hidden=${!this.hasFooter}
            .overrides=${this.footerOverrides()}
          >
            <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
          </ds-stack>
        </div>
      </ds-focus-scope>
    `;

    const surfaceClass = isPersistent ? 'surface sidebar' : `surface overlay${closing}`;
    // Non-modal and persistent: the panel is the landmark the `role` prop names.
    const region =
      this.landmark === 'navigation'
        ? html`<nav
            part="surface"
            data-part="surface"
            class=${surfaceClass}
            aria-labelledby="heading"
            ?hidden=${!visible}
            @keydown=${this.handleSurfaceKeydown}
          >
            ${content}
          </nav>`
        : html`<aside
            part="surface"
            data-part="surface"
            class=${surfaceClass}
            aria-labelledby="heading"
            ?hidden=${!visible}
            @keydown=${this.handleSurfaceKeydown}
          >
            ${content}
          </aside>`;

    const scrimTemplate = html`<div
      part="scrim"
      data-part="scrim"
      class=${`scrim${closing}`}
      aria-hidden="true"
      ?hidden=${!useDialog && !visible}
      @click=${this.handleScrimClick}
    ></div>`;

    return html`
      <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${useDialog
        ? // A modal panel is a dialog, not a landmark, so it takes no `role`.
          html`<dialog
            aria-labelledby="heading"
            @keydown=${this.handleSurfaceKeydown}
            @cancel=${this.handleCancel}
          >
            ${scrimTemplate}
            <div part="surface" data-part="surface" class=${`surface overlay${closing}`}>${content}</div>
          </dialog>`
        : html`${!isPersistent && this.scrim ? scrimTemplate : nothing}${region}`}
    `;
  }

  /** `inset` forwards to the body Box's `paddingInline`, but only when the caller overrode it. */
  private bodyOverrides(): { paddingInline: TokenRef } | undefined {
    const inset = this.overrides?.inset;
    return inset ? { paddingInline: inset } : undefined;
  }

  private headingOverrides(): { marginBlockEnd: TokenRef } | undefined {
    const gap = this.overrides?.headingGap;
    return gap ? { marginBlockEnd: gap } : undefined;
  }

  private footerOverrides(): { gap: TokenRef } | undefined {
    const gap = this.overrides?.footerGap;
    return gap ? { gap } : undefined;
  }

  private readonly handleTriggerSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true });
    // A text node cannot carry `slot`, so only a second element can reach this slot by mistake.
    if (import.meta.env.DEV && assigned.length > 1) {
      console.warn('<ds-side-panel> `trigger` must be exactly one element; only the first is wired.', this);
    }
    const next = (assigned[0] as HTMLElement | undefined) ?? null;
    if (next === this.triggerEl) {
      return;
    }
    this.detachTrigger();
    this.triggerEl = next;
    if (next) {
      next.addEventListener('click', this.handleTriggerClick);
      this.updateTriggerExpanded();
    }
  };

  private readonly handleFooterSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const hasFooter = slot
      .assignedNodes({ flatten: true })
      .some((node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim() !== '');
    if (hasFooter !== this.hasFooter) {
      this.hasFooter = hasFooter;
    }
  };

  private detachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.removeEventListener('click', this.handleTriggerClick);
    if (trigger.tagName === 'DS-BUTTON') {
      (trigger as HTMLElement & { expanded: boolean | undefined }).expanded = undefined;
    } else {
      trigger.removeAttribute('aria-expanded');
    }
  }

  /**
   * `aria-expanded` on the slotted trigger. `aria-controls` is never set: an
   * IDREF in the light DOM cannot address the panel inside the shadow root.
   */
  private updateTriggerExpanded(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    const expanded = this.currentOpen;
    if (trigger.tagName === 'DS-BUTTON') {
      const button = trigger as HTMLElement & { expanded: boolean | undefined };
      if (button.expanded !== expanded) {
        button.expanded = expanded;
      }
    } else if (trigger.getAttribute('aria-expanded') !== String(expanded)) {
      trigger.setAttribute('aria-expanded', String(expanded));
    }
  }

  /** The trigger toggle is never gated by `dismissible`. A persistent sidebar has no trigger. */
  private readonly handleTriggerClick = (): void => {
    if (this.isPersistent) {
      return;
    }
    this.requestOpenChange(!this.currentOpen, 'trigger', { apply: true, focusTrigger: true });
  };

  /** A followed Link inside the panel closes it, and is never gated by `dismissible`. */
  private readonly handlePanelClick = (event: Event): void => {
    if (this.isPersistent || event.defaultPrevented) {
      return;
    }
    const followed = event
      .composedPath()
      .some(
        (target) =>
          target instanceof HTMLElement &&
          ((target.tagName === 'A' && target.hasAttribute('href')) || target.tagName === 'DS-LINK'),
      );
    if (followed) {
      // The navigation owns focus: it is not moved to the trigger.
      this.requestOpenChange(false, 'navigation', { apply: true, focusTrigger: false });
    }
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // The panel dispatches its own event; keep the inner button's `press` inside.
    event.stopPropagation();
    this.requestOpenChange(false, 'close-button', { apply: true, focusTrigger: true });
  };

  private readonly handleSurfaceKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || this.isPersistent || !this.currentOpen) {
      return;
    }
    // Handled here for both modes; preventing the keydown also stops a modal <dialog>'s own cancel.
    event.preventDefault();
    event.stopPropagation();
    this.requestOpenChange(false, 'escape', { apply: this.dismissible, focusTrigger: true });
  };

  /**
   * A `cancel` the keydown handler did not already swallow (a platform back
   * gesture). The browser's own close is non-cancelable in some cases, so the
   * dialog is re-shown when `open` is still true.
   */
  private readonly handleCancel = (event: Event): void => {
    if (event.cancelable) {
      event.preventDefault();
    }
    this.requestOpenChange(false, 'escape', { apply: this.dismissible, focusTrigger: true });
    // A non-cancelable `cancel` closes the dialog *after* this handler, so the re-open
    // is checked once that has happened rather than against a still-open dialog.
    queueMicrotask(() => {
      if (!this.currentOpen || this.isPersistent || !this.modal) {
        return;
      }
      const dialog = this.dialogEl;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });
  };

  /** A click whose target is the scrim element — modal and non-modal alike. */
  private readonly handleScrimClick = (): void => {
    if (!this.dismissible) {
      return;
    }
    this.requestOpenChange(false, 'scrim', { apply: true, focusTrigger: true });
  };

  /** With no scrim to catch it, a press outside the panel and trigger (both inside the host) closes with `outside`. */
  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (
      this.scrim ||
      this.modal ||
      !this.dismissible ||
      !this.currentOpen ||
      this.isPersistent ||
      event.composedPath().includes(this)
    ) {
      return;
    }
    // Focus stays where the press put it rather than being pulled back to the trigger.
    this.requestOpenChange(false, 'outside', { apply: true, focusTrigger: false });
  };

  /** A slotted `<form method="dialog">` submitted inside the panel asks it to close. */
  private readonly handleSubmit = (event: SubmitEvent): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !this.currentOpen || this.isPersistent) {
      return;
    }
    const method = event.submitter?.getAttribute('formmethod') ?? form.method;
    if (method.toLowerCase() !== 'dialog') {
      return;
    }
    event.preventDefault();
    this.requestOpenChange(false, 'action', { apply: true, focusTrigger: true });
  };

  /**
   * A user asked for `next`. Uncontrolled (and `apply`): the state changes first,
   * then `open-change` reports it. Controlled: only the event; the panel follows
   * `open` when the consumer sets it.
   */
  private requestOpenChange(
    next: boolean,
    reason: SidePanelOpenChangeReason,
    options: { apply: boolean; focusTrigger: boolean },
  ): void {
    if (!next) {
      this.closeFocus = options.focusTrigger ? 'trigger' : 'none';
    }
    if (options.apply && this.open === undefined) {
      this.internalOpen = next;
    }
    this.dispatchEvent(
      new CustomEvent<SidePanelOpenChangeDetail>('open-change', {
        detail: { open: next, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private openOverlay(): void {
    clearTimeout(this.exitTimer);
    this.closing = false;
    this.closeFocus = 'auto';
    const active = deepActiveElement();
    this.openerEl = active instanceof HTMLElement && active !== document.body ? active : null;
    this.overlayModal = this.modal;
    if (this.modal) {
      const dialog = this.dialogEl;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
      if (!this.holdsScrollLock) {
        this.holdsScrollLock = true;
        lockBodyScroll();
      }
      this.applyInitialFocus();
    } else {
      // Non-modal: focus stays on the trigger; the page stays live.
      this.addOutsideListener();
    }
  }

  private startExit(): void {
    this.removeOutsideListener();
    const surface = this.surfaceEl;
    if (!surface) {
      this.finishClose();
      return;
    }
    this.closing = true;
    // Wait one render for `.closing`, then for its transition (none under reduced motion).
    void this.updateComplete.then(() => {
      if (!this.closing) {
        return;
      }
      const duration = transitionTimeMs(surface);
      if (duration === 0) {
        this.finishClose();
        return;
      }
      clearTimeout(this.exitTimer);
      this.exitTimer = setTimeout(() => this.finishClose(), duration);
    });
  }

  private finishClose(): void {
    clearTimeout(this.exitTimer);
    const surface = this.surfaceEl;
    const focusWasInside = surface !== null && surface.matches(':focus-within');
    const dialog = this.dialogEl;
    if (dialog?.open) {
      dialog.close();
    }
    this.releaseScrollLock();
    this.closing = false;
    const restore =
      this.closeFocus === 'trigger' || (this.closeFocus === 'auto' && (focusWasInside || this.overlayModal));
    if (restore) {
      const target = this.triggerEl ?? this.openerEl;
      if (target?.isConnected) {
        target.focus();
      }
    }
    this.closeFocus = 'auto';
    this.overlayModal = false;
    this.openerEl = null;
  }

  private releaseScrollLock(): void {
    if (this.holdsScrollLock) {
      this.holdsScrollLock = false;
      unlockBodyScroll();
    }
  }

  /** After showModal(): the first focusable in the body, then the footer, then the close button, then the heading. */
  private applyInitialFocus(): void {
    const target = this.findFirstFocusable() ?? this.closeButtonEl ?? this.headingEl;
    target?.focus();
  }

  private findFirstFocusable(): HTMLElement | null {
    for (const name of [null, 'footer']) {
      const slot = this.renderRoot.querySelector<HTMLSlotElement>(
        name === null ? 'slot:not([name])' : `slot[name="${name}"]`,
      );
      for (const element of slot?.assignedElements({ flatten: true }) ?? []) {
        const found = element.matches(FOCUSABLE_SELECTOR)
          ? (element as HTMLElement)
          : element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private addOutsideListener(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
  }

  private removeOutsideListener(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
  }

  /**
   * The breakpoint is read from the theme token on `<html>` when the component
   * connects; a theme change after that takes effect on the next mount. Where
   * `matchMedia` does not exist (jsdom) the overlay presentation renders.
   */
  private setupPersistentQuery(): void {
    this.persistentQuery?.removeEventListener('change', this.handlePersistentChange);
    this.persistentQuery = null;
    if (this.persistent === 'never' || typeof matchMedia !== 'function') {
      this.isPersistent = false;
      return;
    }
    const breakpoint = getComputedStyle(document.documentElement)
      .getPropertyValue(PERSISTENT_BREAKPOINT_VARS[this.persistent])
      .trim();
    const px = breakpoint ? measurePx(breakpoint) : 0;
    if (px <= 0) {
      this.isPersistent = false;
      return;
    }
    // `(width > token)`: exactly the token width is still the overlay.
    this.persistentQuery = matchMedia(`(width > ${px}px)`);
    this.isPersistent = this.persistentQuery.matches;
    this.persistentQuery.addEventListener('change', this.handlePersistentChange);
  }

  private readonly handlePersistentChange = (event: MediaQueryListEvent): void => {
    this.isPersistent = event.matches;
  };

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SidePanelOverridableBinding[]) {
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
    if (!this.heading && !this.warnedHeading) {
      this.warnedHeading = true;
      console.warn('<ds-side-panel> requires a `heading`, used as the accessible name.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-side-panel': DsSidePanel;
  }
}
