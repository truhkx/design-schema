import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Button.js';
import './Icon.js';
import './FocusScope.js';
import './Menu.js';
import type { IconName } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';
import type { MenuActionDetail, MenuActionItem, MenuItem, MenuOpenChangeDetail } from './Menu.js';

export type ActionSheetActionTone = 'default' | 'danger';
export type ActionSheetCloseReason = 'escape' | 'scrim' | 'cancel' | 'drag';

/** A single row (anatomy: item). */
export interface ActionSheetAction {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
}

/** Detail carried by the `action` CustomEvent. */
export interface ActionSheetActionDetail {
  id: string;
}

/** Detail carried by the `close` CustomEvent. */
export interface ActionSheetCloseDetail {
  reason: ActionSheetCloseReason;
}

/**
 * Overridable style hooks; see the `overrides` property. `surface`, `itemHover`, `itemColor`,
 * `itemDangerColor`, `titleColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and
 * excluded. `titleSize` has no host hook of its own — it is forwarded to the composed title
 * `<ds-text>`'s own `overrides` (which already owns font size), along with `fontFamily` and
 * `lineHeight` (also applied to the item rows directly). Only applies to the phone presentation;
 * above the wide breakpoint the sheet renders as `<ds-menu>` and uses Menu's own overrides contract.
 */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'titleSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Partial<Record<ActionSheetOverridableBinding, string | undefined>> = {
  scrim: '--ds-action-sheet-scrim',
  shadow: '--ds-action-sheet-shadow',
  radius: '--ds-action-sheet-radius',
  itemPaddingBlock: '--ds-action-sheet-item-padding-block',
  itemPaddingInline: '--ds-action-sheet-item-padding-inline',
  itemGap: '--ds-action-sheet-item-gap',
  fontFamily: '--ds-action-sheet-font-family',
  fontSize: '--ds-action-sheet-font-size',
  lineHeight: '--ds-action-sheet-line-height',
  divider: '--ds-action-sheet-divider',
  dividerWidth: '--ds-action-sheet-divider-width',
  maxWidth: '--ds-action-sheet-max-width',
  layer: '--ds-action-sheet-layer',
  enter: '--ds-action-sheet-enter',
  exit: '--ds-action-sheet-exit',
};

/** copy.cancelLabel */
const COPY_CANCEL_LABEL = 'Cancel';
/** copy.defaultLabel */
const COPY_DEFAULT_LABEL = 'Actions';

/** Negates a boolean attribute: `no-dismiss` present means `dismissible` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** How many `<ds-action-sheet>` instances (in their bottom-edge presentation) hold the body-scroll lock. */
let openSheetCount = 0;

function lockBodyScroll(): void {
  openSheetCount += 1;
  if (openSheetCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  openSheetCount = Math.max(0, openSheetCount - 1);
  if (openSheetCount === 0) {
    document.documentElement.style.removeProperty('overflow');
  }
}

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function toMenuActionItem(action: ActionSheetAction): MenuActionItem {
  return { id: action.id, label: action.label, icon: action.icon, tone: action.tone, disabled: action.disabled };
}

/**
 * `<ds-action-sheet>` — ActionSheet (category: overlay, APG pattern: menu-button).
 *
 * Below `layout.maxWidth.prose` a shadow `<dialog>` opened with `showModal()` rises from the bottom
 * edge (the same mechanics as `<ds-bottom-sheet>`): a scrim, a `<ds-focus-scope trapped>`, an optional
 * muted `<ds-text>` title, a `role="menu"` list of `role="menuitem"` `<button>` rows (danger actions
 * grouped last behind a divider), a divider, and a `<ds-button variant="secondary">` Cancel row. A
 * downward drag on the surface past a distance or velocity threshold closes with reason `drag`,
 * additive to Escape, the scrim and Cancel. Above the breakpoint the same `actions` render as
 * `<ds-menu>` — non-modal, no Cancel row — positioned at the element that was focused when `open`
 * became true (Menu's own trigger has no notion of an external anchor, so it is placed at that
 * element's screen position and hidden with `opacity: 0`).
 *
 * ## When to use
 *
 * Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened
 * from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits
 * without scrolling; more than eight actions means the item needs its own screen. Put destructive
 * actions last with `tone: danger`.
 *
 * ## When not to use
 *
 * Not for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of
 * Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an
 * ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.
 *
 * @fires action - An action was chosen, with `{ id }`. The consumer performs it and closes.
 * @fires close - Dismissed without choosing, with `{ reason: 'escape' | 'scrim' | 'cancel' | 'drag' }`.
 *   The consumer sets `open` to false.
 * @csspart surface - The padded, bordered surface (anatomy: surface).
 * @csspart focus-scope - The focus-trapping wrapper (anatomy: focusScope).
 * @csspart title - The `<ds-text>` title (anatomy: title).
 * @csspart list - The `role="menu"` container (anatomy: list).
 * @csspart item - Each `role="menuitem"` row (anatomy: item).
 * @csspart item-icon - An item's leading `<ds-icon>` (anatomy: itemIcon).
 * @csspart cancel-button - The Cancel `<ds-button>` (anatomy: cancelButton).
 */
@customElement('ds-action-sheet')
export class DsActionSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-action-sheet-scrim: var(--color-overlay-scrim);
      --ds-action-sheet-shadow: var(--shadow-overlay);
      --ds-action-sheet-radius: var(--radius-lg);
      --ds-action-sheet-item-padding-block: var(--space-sm);
      --ds-action-sheet-item-padding-inline: var(--layout-inset-md);
      --ds-action-sheet-item-gap: var(--layout-gap-normal);
      --ds-action-sheet-font-family: var(--font-family-body);
      --ds-action-sheet-font-size: var(--font-size-md);
      --ds-action-sheet-line-height: var(--font-line-height-normal);
      --ds-action-sheet-divider: var(--color-border);
      --ds-action-sheet-divider-width: var(--border-width-thin);
      --ds-action-sheet-max-width: var(--layout-max-width-prose);
      --ds-action-sheet-layer: var(--layer-sheet);
      --ds-action-sheet-enter: var(--motion-duration-base);
      --ds-action-sheet-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    dialog {
      box-sizing: border-box;
      position: fixed;
      inset-block-end: 0;
      inset-inline: 0;
      margin: 0;
      padding: 0;
      border: 0;
      inline-size: 100%;
      max-inline-size: none;
      max-block-size: 90dvh;
      background: transparent;
      color: inherit;
      z-index: var(--ds-action-sheet-layer);
    }

    /* scrim: color.overlay.scrim */
    dialog::backdrop {
      background: var(--ds-action-sheet-scrim);
      transition: opacity var(--ds-action-sheet-enter) var(--motion-easing-standard);
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      font-family: var(--font-family-body);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      border-start-start-radius: var(--ds-action-sheet-radius);
      border-start-end-radius: var(--ds-action-sheet-radius);
      box-shadow: var(--ds-action-sheet-shadow);
      overflow: hidden;
      padding-block-end: env(safe-area-inset-bottom);
      transform: translateY(0);
      transition: transform var(--ds-action-sheet-enter) var(--motion-easing-standard);
      touch-action: none;
    }

    .surface.closing {
      transform: translateY(100%);
      transition-duration: var(--ds-action-sheet-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @starting-style {
      dialog[open] .surface {
        transform: translateY(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog::backdrop,
      .surface {
        transition: none;
      }
    }

    /* handle: color.foreground.muted, locked — a decorative drag affordance; not in the schema
       anatomy (see the generation gap report), mirrored from ds-bottom-sheet's own handle. */
    .handle {
      align-self: center;
      flex: 0 0 auto;
      inline-size: var(--space-10);
      block-size: var(--space-1);
      margin-block-start: var(--layout-gap-tight);
      border-radius: var(--radius-full);
      background: var(--color-foreground-muted);
    }

    .title {
      flex: 0 0 auto;
      padding-inline: var(--ds-action-sheet-item-padding-inline);
      padding-block: var(--layout-gap-tight);
    }

    .list {
      display: flex;
      flex-direction: column;
      flex: 0 1 auto;
      overflow-y: auto;
      font-family: var(--ds-action-sheet-font-family);
      font-size: var(--ds-action-sheet-font-size);
      line-height: var(--ds-action-sheet-line-height);
    }

    .item {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-action-sheet-item-gap);
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-action-sheet-item-padding-block);
      padding-inline: var(--ds-action-sheet-item-padding-inline);
      border: 0;
      background: none;
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      font: inherit;
      text-align: start;
      cursor: pointer;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .item {
        transition: none;
      }
    }

    /* itemHover: color.background.subtle, locked — pointer hover and keyboard focus share it */
    .item:hover,
    .item:focus {
      outline: none;
      background: var(--color-background-subtle);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .item:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .item[aria-disabled='true'] {
      cursor: not-allowed;
      opacity: var(--opacity-disabled);
    }

    /* itemDangerColor: color.foreground.danger, locked */
    .item[data-tone='danger'] {
      color: var(--color-foreground-danger);
    }

    .item-icon {
      flex: none;
    }

    .item-label {
      flex: 1;
      min-inline-size: 0;
    }

    .divider {
      flex: 0 0 auto;
      block-size: var(--ds-action-sheet-divider-width);
      background: var(--ds-action-sheet-divider);
    }

    .cancel-button {
      flex: 0 0 auto;
      align-self: stretch;
      margin: var(--ds-action-sheet-item-padding-inline);
    }
  `;

  /** Controlled visibility. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`. Named `heading`, not `title` — `HTMLElement`
   * already defines `title` as the tooltip attribute.
   */
  @property() accessor heading: string | undefined;

  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  @property({ attribute: false }) accessor actions: ActionSheetAction[] = [];

  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  @property({ attribute: 'cancel-label' }) accessor cancelLabel: string | undefined;

  /**
   * Escape, the scrim, the cancel row and the drag all request close; Escape still reports
   * through `close` when `false`, as in Dialog and BottomSheet. Attribute is the negation,
   * `no-dismiss`, because a boolean attribute cannot express `false` for a prop that defaults `true`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;

  /** Above `layout.maxWidth.prose` the sheet renders as `<ds-menu>` anchored to the opener instead. */
  @state() private accessor isWide = false;

  /** Whether the exit transition is playing (kept present a beat past the `open` flip to animate out). */
  @state() private accessor closing = false;

  /** The action currently carrying the roving tabindex and real focus (narrow presentation only). */
  @state() private accessor activeId: string | null = null;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement;
  @query('.cancel-button') private accessor cancelButtonEl!: HTMLElement;

  private openerElement: Element | null = null;
  private wideQuery: MediaQueryList | null = null;
  private dragState: { startY: number; startTime: number } | null = null;
  private anchorRect: { top: number; left: number; width: number; height: number } | null = null;
  /** Set just before dispatching `action`, so the `<ds-menu>` close that follows selection is not also reported as a dismissal. */
  private menuClosingForAction = false;

  private readonly handleWideChange = (event: MediaQueryListEvent): void => {
    this.isWide = event.matches;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ActionSheet');
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
    if (breakpoint) {
      this.wideQuery = matchMedia(`(min-width: ${breakpoint})`);
      this.isWide = this.wideQuery.matches;
      this.wideQuery.addEventListener('change', this.handleWideChange);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.wideQuery?.removeEventListener('change', this.handleWideChange);
    if (!this.isWide && this.dialogEl?.open) {
      unlockBodyScroll();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('open') && this.open && this.isWide) {
      const opener = getDeepActiveElement();
      this.anchorRect = opener instanceof HTMLElement ? opener.getBoundingClientRect() : null;
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (!this.isWide && changed.has('open')) {
      if (this.open) {
        this.handleOpen();
      } else if (changed.get('open') as boolean) {
        this.playExit();
      }
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult | typeof nothing {
    return this.isWide ? this.renderWide() : this.renderNarrow();
  }

  private renderWide() {
    if (!this.open) {
      return nothing;
    }
    const rect = this.anchorRect;
    // `pointer-events: none` is deliberately omitted: it is an inherited CSS property, so setting it
    // here would inherit into ds-menu's own shadow-DOM popup (a sibling of the invisible trigger,
    // for CSS-inheritance purposes a descendant of this host) and make the whole popup unclickable.
    const anchorStyle = rect
      ? `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;opacity:0;`
      : '';
    return html`
      <ds-menu
        label=${this.accessibleLabel()}
        .items=${this.menuItems()}
        open
        trigger-icon="none"
        style=${anchorStyle}
        @action=${this.handleMenuAction}
        @open-change=${this.handleMenuOpenChange}
      ></ds-menu>
    `;
  }

  private renderNarrow() {
    const accessibleLabel = this.accessibleLabel();
    const { defaults, danger } = this.partitionedActions();

    return html`
      <dialog aria-modal="true" @cancel=${this.handleCancel} @click=${this.handleDialogClick}>
        <div
          class="surface${this.closing ? ' closing' : ''}"
          part="surface"
          @pointerdown=${this.handleSurfacePointerDown}
          @pointermove=${this.handleSurfacePointerMove}
          @pointerup=${this.handleSurfacePointerUp}
          @pointercancel=${this.handleSurfacePointerUp}
        >
          <ds-focus-scope
            part="focus-scope"
            trapped
            ?active=${this.open}
            auto-focus="none"
            ?restore-focus=${false}
            style="display: flex; flex-direction: column"
          >
            <span class="handle" aria-hidden="true"></span>
            ${this.heading
              ? html`<ds-text part="title" class="title" size="sm" tone="muted" .overrides=${this.titleOverrides()}
                  >${this.heading}</ds-text
                >`
              : nothing}
            <div class="list" part="list" role="menu" aria-label=${accessibleLabel} @keydown=${this.handleListKeydown}>
              ${defaults.map((action) => this.renderItem(action))}
              ${danger.length ? html`<div class="divider" part="divider" role="separator" aria-hidden="true"></div>` : nothing}
              ${danger.map((action) => this.renderItem(action))}
            </div>
            <div class="divider" part="divider" role="separator" aria-hidden="true"></div>
            <ds-button
              class="cancel-button"
              part="cancel-button"
              variant="secondary"
              label=${this.cancelLabel || COPY_CANCEL_LABEL}
              @press=${this.handleCancelPress}
            ></ds-button>
          </ds-focus-scope>
        </div>
      </dialog>
    `;
  }

  private renderItem(action: ActionSheetAction) {
    return html`
      <button
        type="button"
        class="item"
        part="item"
        role="menuitem"
        data-id=${action.id}
        data-tone=${ifDefined(action.tone === 'danger' ? 'danger' : undefined)}
        tabindex=${this.activeId === action.id ? 0 : -1}
        aria-disabled=${ifDefined(action.disabled ? 'true' : undefined)}
        @click=${() => this.handleItemClick(action)}
        @pointerenter=${() => this.handleItemPointerEnter(action)}
      >
        ${action.icon
          ? html`<ds-icon class="item-icon" part="item-icon" name=${action.icon} aria-hidden="true"></ds-icon>`
          : nothing}
        <span class="item-label">${action.label}</span>
      </button>
    `;
  }

  private accessibleLabel(): string {
    return this.heading || COPY_DEFAULT_LABEL;
  }

  private partitionedActions(): { defaults: ActionSheetAction[]; danger: ActionSheetAction[] } {
    const defaults = this.actions.filter((action) => action.tone !== 'danger');
    const danger = this.actions.filter((action) => action.tone === 'danger');
    return { defaults, danger };
  }

  private navigableActions(): ActionSheetAction[] {
    return this.actions.filter((action) => !action.disabled);
  }

  private menuItems(): MenuItem[] {
    const { defaults, danger } = this.partitionedActions();
    const items: MenuItem[] = defaults.map(toMenuActionItem);
    if (danger.length > 0) {
      items.push({ separator: true });
      items.push(...danger.map(toMenuActionItem));
    }
    return items;
  }

  private titleOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const overrides = this.overrides;
    if (!overrides) {
      return undefined;
    }
    const result: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    if (overrides.titleSize) {
      result.fontSize = overrides.titleSize;
    }
    if (overrides.fontFamily) {
      result.fontFamily = overrides.fontFamily;
    }
    if (overrides.lineHeight) {
      result.lineHeight = overrides.lineHeight;
    }
    return Object.keys(result).length ? result : undefined;
  }

  private readonly handleListKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        void this.focusAction('first');
        break;
      case 'End':
        event.preventDefault();
        void this.focusAction('last');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateActiveAction();
        break;
      default:
        break;
    }
  };

  private readonly handleItemClick = (action: ActionSheetAction): void => {
    if (action.disabled) {
      return;
    }
    this.dispatchAction(action.id);
  };

  private readonly handleItemPointerEnter = (action: ActionSheetAction): void => {
    if (action.disabled) {
      return;
    }
    void this.focusAction(action.id);
  };

  private readonly handleCancel = (event: Event): void => {
    // The native default would close the <dialog> itself; the consumer owns `open` instead.
    event.preventDefault();
    this.dispatchClose('escape');
  };

  private readonly handleDialogClick = (event: MouseEvent): void => {
    if (!this.dismissible || event.target !== this.dialogEl) {
      return;
    }
    this.dispatchClose('scrim');
  };

  private readonly handleCancelPress = (event: Event): void => {
    // Keep the button's `press` inside the sheet; consumers listen for `close`.
    event.stopPropagation();
    if (!this.dismissible) {
      return;
    }
    this.dispatchClose('cancel');
  };

  private readonly handleMenuAction = (event: CustomEvent<MenuActionDetail>): void => {
    event.stopPropagation();
    this.menuClosingForAction = true;
    this.dispatchAction(event.detail.id);
  };

  private readonly handleMenuOpenChange = (event: CustomEvent<MenuOpenChangeDetail>): void => {
    event.stopPropagation();
    if (event.detail.open) {
      return;
    }
    if (this.menuClosingForAction) {
      this.menuClosingForAction = false;
      return;
    }
    // <ds-menu> does not distinguish Escape from an outside click; `escape` is the closest of the
    // four reasons for a non-modal, scrim-less, cancel-row-less presentation.
    this.dispatchClose('escape');
  };

  private readonly handleSurfacePointerDown = (event: PointerEvent): void => {
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!surface) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragState = { startY: event.clientY, startTime: event.timeStamp };
    surface.style.transition = 'none';
  };

  private readonly handleSurfacePointerMove = (event: PointerEvent): void => {
    const drag = this.dragState;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!drag || !surface) {
      return;
    }
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  private readonly handleSurfacePointerUp = (event: PointerEvent): void => {
    const drag = this.dragState;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    this.dragState = null;
    if (!drag || !surface) {
      return;
    }

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const velocity = deltaY / elapsed;
    const sheetHeight = surface.getBoundingClientRect().height || 1;
    const pastThreshold = deltaY / sheetHeight > 0.25 || velocity > 0.5;

    surface.style.transition = prefersReducedMotion() ? 'none' : '';
    surface.style.transform = '';

    if (pastThreshold && this.dismissible) {
      this.dispatchClose('drag');
    }
  };

  private handleOpen(): void {
    this.closing = false;
    this.openerElement = getDeepActiveElement();
    lockBodyScroll();
    this.dialogEl.showModal();
    this.applyInitialFocus();
  }

  private playExit(): void {
    const finish = (): void => {
      this.dialogEl.close();
      unlockBodyScroll();
      this.restoreFocus();
      this.closing = false;
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    this.closing = true;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!surface) {
      finish();
      return;
    }
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== surface || event.propertyName !== 'transform') {
        return;
      }
      surface.removeEventListener('transitionend', handleTransitionEnd);
      finish();
    };
    surface.addEventListener('transitionend', handleTransitionEnd);
  }

  private applyInitialFocus(): void {
    const first = this.navigableActions()[0];
    if (first) {
      this.activeId = first.id;
      void this.focusAction(first.id);
    } else {
      this.cancelButtonEl?.focus();
    }
  }

  private async focusAction(target: 'first' | 'last' | string): Promise<void> {
    const items = this.navigableActions();
    if (items.length === 0) {
      return;
    }
    const id = target === 'first' ? items[0]!.id : target === 'last' ? items[items.length - 1]!.id : target;
    this.activeId = id;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus();
  }

  private moveFocus(delta: number): void {
    const items = this.navigableActions();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((action) => action.id === this.activeId);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    void this.focusAction(items[nextIndex]!.id);
  }

  private activateActiveAction(): void {
    const action = this.navigableActions().find((entry) => entry.id === this.activeId);
    if (action) {
      this.dispatchAction(action.id);
    }
  }

  private restoreFocus(): void {
    const opener = this.openerElement;
    this.openerElement = null;
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }
  }

  private dispatchAction(id: string): void {
    this.dispatchEvent(
      new CustomEvent<ActionSheetActionDetail>('action', { detail: { id }, bubbles: true, composed: true }),
    );
  }

  private dispatchClose(reason: ActionSheetCloseReason): void {
    this.dispatchEvent(
      new CustomEvent<ActionSheetCloseDetail>('close', { detail: { reason }, bubbles: true, composed: true }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ActionSheetOverridableBinding[]) {
      const hook = HOOKS[binding];
      if (!hook) {
        continue;
      }
      const ref = this.overrides?.[binding];
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
    if (!this.actions || this.actions.length === 0) {
      console.warn('<ds-action-sheet> requires at least one action in `actions`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-action-sheet': DsActionSheet;
  }
}
