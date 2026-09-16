import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Button.js';
import './Icon.js';
import './FocusScope.js';
import './Menu.js';
import type { IconName } from './Icon.js';
import type { DsFocusScope } from './FocusScope.js';
import type { TextOverridableBinding } from './Text.js';
import type {
  MenuActionDetail,
  MenuActionItem,
  MenuItem,
  MenuOpenChangeDetail,
  MenuOverridableBinding,
} from './Menu.js';

export type ActionSheetActionTone = 'default' | 'danger';
export type ActionSheetCloseReason = 'escape' | 'scrim' | 'cancel' | 'drag';

/** One row of the sheet (anatomy: item). */
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
 * Overridable style hooks; see the `overrides` property. `surface`, `handle`, `itemHover`, `itemColor`,
 * `itemDangerColor`, `titleColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded.
 */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'headerPaddingBlock'
  | 'headerGap'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
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

/** Host hooks. `titleSize` has none: it is forwarded to the heading Text, which sets its own size. */
const HOOKS: Partial<Record<ActionSheetOverridableBinding, string>> = {
  scrim: '--ds-action-sheet-scrim',
  shadow: '--ds-action-sheet-shadow',
  radius: '--ds-action-sheet-radius',
  itemPaddingBlock: '--ds-action-sheet-item-padding-block',
  itemPaddingInline: '--ds-action-sheet-item-padding-inline',
  itemGap: '--ds-action-sheet-item-gap',
  headerPaddingBlock: '--ds-action-sheet-header-padding-block',
  headerGap: '--ds-action-sheet-header-gap',
  handleHeight: '--ds-action-sheet-handle-height',
  handleWidth: '--ds-action-sheet-handle-width',
  handleRadius: '--ds-action-sheet-handle-radius',
  fontFamily: `--ds-action-sheet-font-family`,
  fontSize: '--ds-action-sheet-font-size',
  lineHeight: '--ds-action-sheet-line-height',
  divider: '--ds-action-sheet-divider',
  dividerWidth: '--ds-action-sheet-divider-width',
  maxWidth: '--ds-action-sheet-max-width',
  layer: '--ds-action-sheet-layer',
  enter: '--ds-action-sheet-enter',
  exit: '--ds-action-sheet-exit',
};

/** Bindings the wide Menu shares by name, plus `divider`, which is Menu's `separator`. */
const MENU_FORWARDS: ReadonlyArray<readonly [ActionSheetOverridableBinding, MenuOverridableBinding]> = [
  ['shadow', 'shadow'],
  ['radius', 'radius'],
  ['itemPaddingBlock', 'itemPaddingBlock'],
  ['itemPaddingInline', 'itemPaddingInline'],
  ['itemGap', 'itemGap'],
  ['fontFamily', 'fontFamily'],
  ['fontSize', 'fontSize'],
  ['lineHeight', 'lineHeight'],
  ['divider', 'separator'],
  ['enter', 'enter'],
];

/** The theme's maxWidth breakpoint, used when the host hook cannot be read. */
const MAX_WIDTH_PROPERTY = '--layout-max-width-prose';

/** constants.dismissDistance: fraction of the sheet height a release must pass to dismiss. */
const DISMISS_DISTANCE = 0.25;

/** constants.dismissVelocity: release speed, in px/ms, that dismisses whatever the distance. */
const DISMISS_VELOCITY = 1.5;

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

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** How many open sheets hold the page-scroll lock, so a second one does not release it early. */
let scrollLocks = 0;
let previousOverflow = '';
let previousGutter = '';

function lockPageScroll(): void {
  scrollLocks += 1;
  if (scrollLocks === 1) {
    const style = document.documentElement.style;
    previousOverflow = style.getPropertyValue('overflow');
    previousGutter = style.getPropertyValue('scrollbar-gutter');
    style.setProperty('overflow', 'hidden');
    style.setProperty('scrollbar-gutter', 'stable');
  }
}

function unlockPageScroll(): void {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    const style = document.documentElement.style;
    style.setProperty('overflow', previousOverflow);
    style.setProperty('scrollbar-gutter', previousGutter);
  }
}

interface DragSample {
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
}

function toMenuItem(action: ActionSheetAction): MenuActionItem {
  return { id: action.id, label: action.label, icon: action.icon, tone: action.tone, disabled: action.disabled };
}

/**
 * `<ds-action-sheet>` — ActionSheet (category: overlay, APG pattern: menu-button).
 *
 * `<ds-action-sheet open heading="Photo.jpg" .actions=${[...]}>`. Below the `maxWidth` breakpoint
 * (a `matchMedia` listener, as `<ds-bottom-sheet>`) a native `<dialog>` in the shadow root opened
 * with `showModal()` rises from the bottom edge: a scrim, a `<ds-focus-scope>`, a header with the
 * decorative handle and the muted heading `<ds-text>`, a `role="menu"` of `role="menuitem"` rows with
 * the danger group last behind a divider, and a Cancel `<ds-button variant="secondary">` under a
 * divider. Escape, the scrim, Cancel and a downward drag on the header request close.
 *
 * Above the breakpoint the same actions render as `<ds-menu>` anchored to the element that was
 * focused when `open` became true; Menu's close reasons map `escape` → `escape`, `outside` → `scrim`,
 * and `action` → nothing, so a choice only ever reports `action`.
 *
 * `open` is controlled: the element never closes itself, the consumer flips `open` from `action`
 * and `close`. Focus returns to the opener on close in both presentations.
 *
 * ## When to use
 *
 * Contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button
 * or a long-press. Keep it to what fits without scrolling; put destructive actions last with
 * `tone: danger`.
 *
 * ## When not to use
 *
 * Not for navigation (Menu in a nav Landmark, or Links), settings with state, choosing a value
 * (Select or RadioGroup in a BottomSheet), or confirming — a danger row opens an AlertDialog. No forms.
 *
 * @fires action - An action was chosen, `{ id }`. The consumer performs it and closes.
 * @fires close - Dismissed without choosing, `{ reason: 'escape' | 'scrim' | 'cancel' | 'drag' }`.
 */
@customElement('ds-action-sheet')
export class DsActionSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: contents;
      --ds-action-sheet-scrim: var(--color-overlay-scrim);
      --ds-action-sheet-shadow: var(--shadow-overlay);
      --ds-action-sheet-radius: var(--radius-lg);
      --ds-action-sheet-item-padding-block: var(--space-sm);
      --ds-action-sheet-item-padding-inline: var(--layout-inset-md);
      --ds-action-sheet-item-gap: var(--layout-gap-normal);
      --ds-action-sheet-header-padding-block: var(--space-sm);
      --ds-action-sheet-header-gap: var(--layout-gap-tight);
      --ds-action-sheet-handle-height: var(--space-1);
      --ds-action-sheet-handle-width: var(--space-10);
      --ds-action-sheet-handle-radius: var(--radius-full);
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
      z-index: var(--ds-action-sheet-layer);
    }

    dialog[open] {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    /* The scrim is its own part; the native backdrop stays clear. */
    dialog::backdrop {
      background: transparent;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: var(--ds-action-sheet-scrim);
      opacity: 1;
      transition: opacity var(--ds-action-sheet-enter) var(--motion-easing-standard);
    }

    .scope {
      position: relative;
      display: flex;
      box-sizing: border-box;
      inline-size: 100%;
      max-block-size: 90dvh; /* literal-ok: the sheet sizes to its content up to 90% of the viewport, as BottomSheet's content height */
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-inline-size: 0;
      max-block-size: 100%;
      padding-block-end: env(safe-area-inset-bottom);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
      border-start-start-radius: var(--ds-action-sheet-radius);
      border-start-end-radius: var(--ds-action-sheet-radius);
      box-shadow: var(--ds-action-sheet-shadow);
      transform: translateY(0);
      transition: transform var(--ds-action-sheet-enter) var(--motion-easing-standard);
    }

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        transform: translateY(100%);
      }
    }

    .closing .scrim {
      opacity: 0;
      transition-duration: var(--ds-action-sheet-exit);
    }
    .closing .surface {
      transform: translateY(100%);
      transition-duration: var(--ds-action-sheet-exit);
    }

    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .surface,
      .item {
        transition: none;
      }
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex: none;
      gap: var(--ds-action-sheet-header-gap);
      padding-block: var(--ds-action-sheet-header-padding-block);
      padding-inline: var(--ds-action-sheet-item-padding-inline);
    }

    .header.draggable {
      touch-action: none;
      cursor: grab;
    }

    /* handle: color.foreground.muted, locked; decorative, aria-hidden and never a focus stop */
    .handle {
      align-self: center;
      inline-size: var(--ds-action-sheet-handle-width);
      block-size: var(--ds-action-sheet-handle-height);
      border-radius: var(--ds-action-sheet-handle-radius);
      background: var(--color-foreground-muted);
    }

    .list {
      display: flex;
      flex-direction: column;
      flex: 0 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }

    .item {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-action-sheet-item-gap);
      /* minTarget: size.target.comfortable, locked */
      min-block-size: var(--size-target-comfortable);
      margin: 0;
      padding-block: var(--ds-action-sheet-item-padding-block);
      padding-inline: var(--ds-action-sheet-item-padding-inline);
      border: 0;
      background: transparent;
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      font-family: var(--ds-action-sheet-font-family);
      font-size: var(--ds-action-sheet-font-size);
      line-height: var(--ds-action-sheet-line-height);
      text-align: start;
      cursor: pointer;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* itemDangerColor: color.foreground.danger, locked */
    .item[data-tone='danger'] {
      color: var(--color-foreground-danger);
    }

    /* itemHover: color.background.subtle, locked */
    .item:hover:not([aria-disabled='true']) {
      background: var(--color-background-subtle);
    }

    .item:focus {
      outline: none;
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

    .item-icon {
      flex: none;
    }

    .item-label {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    /* divider: above the danger group and above the cancel row */
    .divider {
      flex: none;
      block-size: var(--ds-action-sheet-divider-width);
      background: var(--ds-action-sheet-divider);
    }

    .cancel-row {
      display: flex;
      flex-direction: column;
      flex: none;
      padding-block: var(--ds-action-sheet-header-padding-block);
      padding-inline: var(--ds-action-sheet-item-padding-inline);
    }
  `;

  /** Controlled visibility. The sheet never closes itself; the consumer flips it from `action` and `close`. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name; defaults to `copy.defaultLabel`. */
  @property() accessor heading: string | undefined;

  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  @property({ attribute: false }) accessor actions: ActionSheetAction[] = [];

  /**
   * Escape, the scrim, the cancel row and the drag all request close; Escape still reports through
   * `close` when false. Gates the sheet presentation only. Attribute: `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. Attribute: `cancel-label`. */
  @property({ attribute: 'cancel-label' }) accessor cancelLabel: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Above the maxWidth breakpoint the actions present as `<ds-menu>`. */
  @state() private accessor wide = false;

  /** The exit transition is playing: the sheet stays rendered a beat past `open` turning false. */
  @state() private accessor closing = false;

  /** The action carrying the roving tabindex. */
  @state() private accessor activeId: string | null = null;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('.scope') private accessor scopeEl!: DsFocusScope | null;
  @query('.scrim') private accessor scrimEl!: HTMLElement | null;
  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('[data-part="cancelButton"]') private accessor cancelButtonEl!: HTMLElement | null;

  /** The element focused when `open` became true: the wide Menu's anchor and the focus-restore target. */
  private opener: HTMLElement | null = null;
  private restoreAfterWideClose = false;
  private scrollLocked = false;
  private closingProgrammatically = false;
  private focusBeforeCancel: HTMLElement | null = null;
  private wideQuery: MediaQueryList | null = null;
  private drag: DragSample | null = null;

  private readonly handleWideChange = (event: MediaQueryListEvent): void => {
    this.wide = event.matches;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ActionSheet');
    this.watchBreakpoint();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unwatchBreakpoint();
    this.releaseScroll();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
      if (this.isConnected && (changed.get('overrides') as this['overrides'])?.maxWidth !== this.overrides?.maxWidth) {
        this.unwatchBreakpoint();
        this.watchBreakpoint();
      }
    }
    if (changed.has('open')) {
      if (this.open) {
        const active = getDeepActiveElement();
        this.opener = active instanceof HTMLElement && active !== document.body ? active : null;
      } else if (changed.get('open') === true && this.wide) {
        // Focus inside the Menu popup would be dropped when the Menu unmounts.
        this.restoreAfterWideClose = this.shadowRoot?.activeElement != null;
      }
    }
    if (this.wide) {
      this.closing = false;
      return;
    }
    if (changed.has('open')) {
      if (this.open) {
        this.closing = false;
      } else if (changed.get('open') === true) {
        this.closing = true;
      }
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('wide') && this.wide) {
      this.releaseScroll();
    }
    if (this.wide) {
      if (this.restoreAfterWideClose) {
        this.restoreAfterWideClose = false;
        if (this.opener?.isConnected) {
          this.opener.focus();
        }
      }
      return;
    }
    if (changed.has('open') || changed.has('wide')) {
      if (this.open) {
        void this.handleOpen();
      } else if (this.closing) {
        void this.handleClose();
      }
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (this.wide) {
      return this.open ? this.renderMenu() : nothing;
    }
    if (!this.open && !this.closing) {
      return nothing;
    }
    return this.renderSheet();
  }

  /** Above the breakpoint: Menu, anchored to the opener, with no trigger, scrim, drag or cancel row. */
  private renderMenu(): TemplateResult {
    return html`
      <ds-menu
        label=${this.accessibleName()}
        .items=${this.menuItems()}
        .anchor=${this.opener ?? document.body}
        .open=${true}
        .overrides=${this.menuOverrides()}
        @action=${this.handleMenuAction}
        @open-change=${this.handleMenuOpenChange}
      ></ds-menu>
    `;
  }

  private renderSheet(): TemplateResult {
    const name = this.accessibleName();
    const regular = this.actions.filter((action) => action.tone !== 'danger');
    const danger = this.actions.filter((action) => action.tone === 'danger');
    const draggable = this.dismissible;

    return html`
      <dialog
        class=${classMap({ closing: this.closing })}
        aria-modal="true"
        aria-label=${name}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim" @click=${this.handleScrimClick}></div>
        <ds-focus-scope
          class="scope"
          part="focusScope"
          data-part="focusScope"
          auto-focus="none"
          .active=${!this.closing}
        >
          <div class="surface" part="surface" data-part="surface">
            <div
              class=${classMap({ header: true, draggable })}
              part="header"
              data-part="header"
              @pointerdown=${this.handlePointerDown}
              @pointermove=${this.handlePointerMove}
              @pointerup=${this.handlePointerUp}
              @pointercancel=${this.handlePointerCancel}
            >
              <span class="handle" part="handle" data-part="handle" aria-hidden="true"></span>
              ${this.heading
                ? html`<ds-text
                    part="heading"
                    data-part="heading"
                    size="sm"
                    tone="muted"
                    .overrides=${this.headingOverrides()}
                    >${this.heading}</ds-text
                  >`
                : nothing}
            </div>
            <div class="list" part="list" data-part="list" role="menu" aria-label=${name} @keydown=${this.handleListKeydown}>
              ${regular.map((action) => this.renderItem(action))}
              ${regular.length > 0 && danger.length > 0
                ? html`<div class="divider" role="separator"></div>`
                : nothing}
              ${danger.map((action) => this.renderItem(action))}
            </div>
            ${this.dismissible
              ? html`
                  <div class="divider" aria-hidden="true"></div>
                  <div class="cancel-row">
                    <ds-button
                      part="cancelButton"
                      data-part="cancelButton"
                      variant="secondary"
                      label=${this.cancelLabel ?? COPY_CANCEL_LABEL}
                      @press=${this.handleCancelPress}
                    ></ds-button>
                  </div>
                `
              : nothing}
          </div>
        </ds-focus-scope>
      </dialog>
    `;
  }

  private renderItem(action: ActionSheetAction): TemplateResult {
    const roving = this.activeId ?? this.navigableActions()[0]?.id ?? null;
    return html`
      <button
        type="button"
        class="item"
        part="item"
        data-part="item"
        role="menuitem"
        data-id=${action.id}
        data-tone=${ifDefined(action.tone === 'danger' ? 'danger' : undefined)}
        tabindex=${roving === action.id ? 0 : -1}
        aria-disabled=${ifDefined(action.disabled ? 'true' : undefined)}
        @click=${() => this.handleItemClick(action)}
      >
        ${action.icon
          ? html`<ds-icon class="item-icon" part="itemIcon" data-part="itemIcon" name=${action.icon}></ds-icon>`
          : nothing}
        <span class="item-label">${action.label}</span>
      </button>
    `;
  }

  private accessibleName(): string {
    return this.heading || COPY_DEFAULT_LABEL;
  }

  private navigableActions(): ActionSheetAction[] {
    // Visual order: the danger group is rendered last.
    return [
      ...this.actions.filter((action) => action.tone !== 'danger'),
      ...this.actions.filter((action) => action.tone === 'danger'),
    ].filter((action) => !action.disabled);
  }

  private menuItems(): MenuItem[] {
    const regular = this.actions.filter((action) => action.tone !== 'danger').map(toMenuItem);
    const danger = this.actions.filter((action) => action.tone === 'danger').map(toMenuItem);
    return regular.length > 0 && danger.length > 0 ? [...regular, { separator: true }, ...danger] : [...regular, ...danger];
  }

  /** fontFamily and lineHeight are forwarded to the heading Text, and titleSize as its fontSize. */
  private headingOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const overrides = this.overrides;
    if (!overrides) {
      return undefined;
    }
    const forwarded: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    if (overrides.titleSize !== undefined) forwarded.fontSize = overrides.titleSize;
    if (overrides.fontFamily !== undefined) forwarded.fontFamily = overrides.fontFamily;
    if (overrides.lineHeight !== undefined) forwarded.lineHeight = overrides.lineHeight;
    return forwarded;
  }

  private menuOverrides(): Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined {
    const overrides = this.overrides;
    if (!overrides) {
      return undefined;
    }
    const forwarded: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> = {};
    for (const [from, to] of MENU_FORWARDS) {
      const ref = overrides[from];
      if (ref !== undefined) {
        forwarded[to] = ref;
      }
    }
    return forwarded;
  }

  /* ---- keyboard ---- */

  private readonly handleListKeydown = (event: KeyboardEvent): void => {
    // Enter and Space are the native button's own activation.
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
      default:
        break;
    }
  };

  private moveFocus(delta: 1 | -1): void {
    const items = this.navigableActions();
    if (items.length === 0) {
      return;
    }
    const current = items.findIndex((action) => action.id === this.activeId);
    const next = current === -1 ? (delta === 1 ? 0 : items.length - 1) : (current + delta + items.length) % items.length;
    void this.focusAction(items[next]!.id);
  }

  private async focusAction(target: 'first' | 'last' | string): Promise<void> {
    const items = this.navigableActions();
    if (items.length === 0) {
      return;
    }
    const id = target === 'first' ? items[0]!.id : target === 'last' ? items[items.length - 1]!.id : target;
    this.activeId = id;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`[data-part="item"][data-id="${CSS.escape(id)}"]`)?.focus();
  }

  /* ---- sheet handlers ---- */

  private handleItemClick(action: ActionSheetAction): void {
    if (action.disabled) {
      return;
    }
    this.activeId = action.id;
    this.dispatchAction(action.id);
  }

  private readonly handleCancel = (event: Event): void => {
    // The consumer owns `open`: never let the browser close the <dialog> on its own.
    event.preventDefault();
    const active = getDeepActiveElement();
    this.focusBeforeCancel = active instanceof HTMLElement ? active : null;
    this.dispatchClose('escape');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // Chromium closes without a cancelable `cancel` when Escape arrives with no user activation.
    const dialog = this.dialogEl;
    if (this.open && dialog && !dialog.open) {
      dialog.showModal();
      const previous = this.focusBeforeCancel;
      if (previous?.isConnected) {
        previous.focus();
      } else {
        this.applyInitialFocus();
      }
    }
    this.focusBeforeCancel = null;
  };

  private readonly handleScrimClick = (event: MouseEvent): void => {
    if (!this.dismissible || event.target !== event.currentTarget) {
      return;
    }
    this.dispatchClose('scrim');
  };

  private readonly handleCancelPress = (event: Event): void => {
    // The composite reports `close`; the inner button's `press` stays inside.
    event.stopPropagation();
    this.dispatchClose('cancel');
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.dismissible || this.closing || !event.isPrimary || event.button !== 0) {
      return;
    }
    const surface = this.surfaceEl;
    if (!surface) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { startY: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0 };
    // The drag follows the finger directly, even under reduced motion.
    surface.style.transition = 'none';
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    const surface = this.surfaceEl;
    if (!drag || !surface) {
      return;
    }
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = (event.clientY - drag.lastY) / elapsed;
    }
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    const surface = this.surfaceEl;
    this.drag = null;
    if (!drag || !surface) {
      return;
    }
    const deltaY = Math.max(0, event.clientY - drag.startY);
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && deltaY > sheetHeight * DISMISS_DISTANCE;
    const pastVelocity = drag.velocity > DISMISS_VELOCITY;

    surface.style.removeProperty('transition');
    if (deltaY > 0 && (pastDistance || pastVelocity)) {
      this.dispatchClose('drag');
      if (!this.open) {
        // The consumer closed: the exit runs from where the finger left the sheet.
        return;
      }
    }
    // Spring back.
    surface.style.removeProperty('transform');
  };

  private readonly handlePointerCancel = (): void => {
    this.drag = null;
    const surface = this.surfaceEl;
    surface?.style.removeProperty('transition');
    surface?.style.removeProperty('transform');
  };

  /* ---- wide Menu handlers ---- */

  private readonly handleMenuAction = (event: CustomEvent<MenuActionDetail>): void => {
    event.stopPropagation();
    this.dispatchAction(event.detail.id);
  };

  private readonly handleMenuOpenChange = (event: CustomEvent<MenuOpenChangeDetail>): void => {
    event.stopPropagation();
    if (event.detail.open) {
      return;
    }
    // A close that accompanies a choice (`action`) is never a dismissal.
    if (event.detail.reason === 'escape') {
      this.dispatchClose('escape');
    } else if (event.detail.reason === 'outside') {
      this.dispatchClose('scrim');
    }
  };

  /* ---- lifecycle helpers ---- */

  private async handleOpen(): Promise<void> {
    const dialog = this.dialogEl;
    if (!dialog) {
      return;
    }
    if (!this.scrollLocked) {
      lockPageScroll();
      this.scrollLocked = true;
    }
    if (!dialog.open) {
      dialog.showModal();
      this.activeId = null;
      await this.scopeEl?.updateComplete;
      if (!this.open || this.closing || this.wide) {
        return;
      }
      this.applyInitialFocus();
    }
  }

  private async handleClose(): Promise<void> {
    await this.updateComplete;
    this.surfaceEl?.style.removeProperty('transform');
    await this.transitionsSettled();
    if (this.open || this.wide) {
      return;
    }
    const dialog = this.dialogEl;
    if (dialog?.open) {
      this.closingProgrammatically = true;
      dialog.close();
    }
    this.releaseScroll();
    // Rendering nothing disconnects the FocusScope, which returns focus to the opener.
    this.closing = false;
  }

  private async transitionsSettled(): Promise<void> {
    const parts = [this.scrimEl, this.surfaceEl].filter((el): el is HTMLElement => el !== null);
    for (const part of parts) {
      void getComputedStyle(part).transform;
    }
    const running = parts.flatMap((part) => part.getAnimations());
    await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
  }

  /** First enabled action; the cancel row when every action is disabled. */
  private applyInitialFocus(): void {
    const first = this.navigableActions()[0];
    if (first) {
      void this.focusAction(first.id);
    } else {
      this.cancelButtonEl?.focus();
    }
  }

  private watchBreakpoint(): void {
    const breakpoint =
      getComputedStyle(this).getPropertyValue(HOOKS.maxWidth!).trim() ||
      getComputedStyle(document.documentElement).getPropertyValue(MAX_WIDTH_PROPERTY).trim();
    if (!breakpoint) {
      return;
    }
    this.wideQuery = matchMedia(`(width > ${breakpoint})`);
    this.wide = this.wideQuery.matches;
    this.wideQuery.addEventListener('change', this.handleWideChange);
  }

  private unwatchBreakpoint(): void {
    this.wideQuery?.removeEventListener('change', this.handleWideChange);
    this.wideQuery = null;
  }

  private releaseScroll(): void {
    if (this.scrollLocked) {
      unlockPageScroll();
      this.scrollLocked = false;
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
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-action-sheet': DsActionSheet;
  }
}
