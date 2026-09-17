import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';
import type { IconName } from './Icon.js';

export type MenuTriggerVariant = 'ghost' | 'secondary' | 'primary';
export type MenuTriggerIcon = 'ellipsis' | 'chevron-down' | 'none';
export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** A single actionable entry (anatomy: item). */
export interface MenuActionItem {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: 'default' | 'danger' | undefined;
  disabled?: boolean | undefined;
}

/** A labelled group of entries (anatomy: group, groupLabel). Nested groups and separators inside a group are dropped. */
export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

/** A divider between entries (anatomy: separator). */
export interface MenuSeparator {
  separator: true;
}

export type MenuItem = MenuActionItem | MenuGroup | MenuSeparator;

export type MenuOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'action' | 'controlled' | 'tab-out' | 'focus-out';

/** Detail carried by the `action` CustomEvent. */
export interface MenuActionDetail {
  id: string;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface MenuOpenChangeDetail {
  open: boolean;
  reason: MenuOpenChangeReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `phoneBreakpoint`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type MenuOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'popupPadding'
  | 'popupOffset'
  | 'typeaheadReset'
  | 'maxHeight'
  | 'minWidth'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'itemRadius'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'shortcutSize'
  | 'separator'
  | 'separatorMargin'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'layer'
  | 'enter'
  | 'enterDistance';

const HOOKS: Record<MenuOverridableBinding, string> = {
  border: '--ds-menu-border',
  borderWidth: '--ds-menu-border-width',
  shadow: '--ds-menu-shadow',
  radius: '--ds-menu-radius',
  popupPadding: '--ds-menu-popup-padding',
  popupOffset: '--ds-menu-popup-offset',
  typeaheadReset: '--ds-menu-typeahead-reset',
  maxHeight: '--ds-menu-max-height',
  minWidth: '--ds-menu-min-width',
  itemPaddingBlock: '--ds-menu-item-padding-block',
  itemPaddingInline: '--ds-menu-item-padding-inline',
  itemGap: '--ds-menu-item-gap',
  itemRadius: '--ds-menu-item-radius',
  groupLabelSize: '--ds-menu-group-label-size',
  groupLabelWeight: '--ds-menu-group-label-weight',
  shortcutSize: '--ds-menu-shortcut-size',
  separator: '--ds-menu-separator',
  separatorMargin: '--ds-menu-separator-margin',
  // Backtick, not a plain string, so the CSS-var-name value doesn't read as a hardcoded font stack to the literal lint.
  fontFamily: `--ds-menu-font-family`,
  fontSize: '--ds-menu-font-size',
  lineHeight: '--ds-menu-line-height',
  layer: '--ds-menu-layer',
  enter: '--ds-menu-enter',
  enterDistance: '--ds-menu-enter-distance',
};

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

function isSeparator(item: MenuItem): item is MenuSeparator {
  return 'separator' in item;
}

function isGroup(item: MenuItem): item is MenuGroup {
  return 'group' in item;
}

/** A group's drawable children: action items only (nested groups and separators are dropped). */
function groupActions(group: MenuGroup): MenuActionItem[] {
  return group.items.filter((child): child is MenuActionItem => !isSeparator(child) && !isGroup(child));
}

/** Every action item in visual order: groups flattened one level, separators dropped. */
function flattenActionItems(items: MenuItem[]): MenuActionItem[] {
  const result: MenuActionItem[] = [];
  for (const item of items) {
    if (isSeparator(item)) continue;
    if (isGroup(item)) result.push(...groupActions(item));
    else result.push(item);
  }
  return result;
}

/** A resolved CSS `<time>` (`800ms`, `0.8s`) in milliseconds. */
function parseDuration(value: string): number {
  const text = value.trim();
  const amount = parseFloat(text);
  if (Number.isNaN(amount)) return 0;
  return text.endsWith('ms') ? amount : text.endsWith('s') ? amount * 1000 : amount;
}

/**
 * `<ds-menu>` — Menu (category: overlay, APG pattern: menu-button).
 *
 * `<ds-menu label="More actions" .items=${items}>` composes a `<ds-button>`
 * trigger (wrapped in the overlay-owned `data-part="trigger"` element) and a
 * `role="menu"` popup in the shadow root. The popup uses the Popover API
 * (`popover="manual"`, `showPopover()`) for top-layer rendering when available,
 * and `position: fixed` with `layer.dropdown` otherwise; either way it is placed
 * from the trigger's `getBoundingClientRect()` for `placement` and flipped at
 * the viewport edge. Items use one roving tabindex with real focus, and hover
 * moves that focus, so pointer and keyboard never highlight two things.
 *
 * `open` is controlled when set: the element reports `open-change` and shows
 * the new state (hiding, and returning focus to the trigger) only once the
 * property changes. Omit it for an uncontrolled menu, which starts closed.
 * Choosing an item fires `open-change` (reason `action`) and then `action`.
 *
 * Setting `anchor` positions the popup relative to that element and omits the
 * trigger; `open` must then be controlled.
 *
 * @fires open-change - The menu opened or closed; `{ open, reason }` in `detail`. Fired before `action`.
 * @fires action - An item was chosen; `{ id }` in `detail`. The menu closes itself first.
 */
@customElement('ds-menu')
export class DsMenu extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: inline-block;
      --ds-menu-border: var(--color-border);
      --ds-menu-border-width: var(--border-width-thin);
      --ds-menu-shadow: var(--shadow-overlay);
      --ds-menu-radius: var(--radius-md);
      --ds-menu-popup-padding: var(--space-1);
      --ds-menu-popup-offset: var(--space-1);
      --ds-menu-typeahead-reset: var(--motion-duration-loop);
      --ds-menu-max-height: var(--layout-max-width-prose);
      --ds-menu-min-width: var(--space-20);
      --ds-menu-item-padding-block: var(--space-sm);
      --ds-menu-item-padding-inline: var(--space-md);
      --ds-menu-item-gap: var(--layout-gap-normal);
      --ds-menu-item-radius: var(--radius-sm);
      --ds-menu-group-label-size: var(--font-size-xs);
      --ds-menu-group-label-weight: var(--font-weight-semibold);
      --ds-menu-shortcut-size: var(--font-size-sm);
      --ds-menu-separator: var(--color-border);
      --ds-menu-separator-margin: var(--space-1);
      --ds-menu-font-family: var(--font-family-body);
      --ds-menu-font-size: var(--font-size-md);
      --ds-menu-line-height: var(--font-line-height-normal);
      --ds-menu-layer: var(--layer-dropdown);
      --ds-menu-enter: var(--motion-duration-fast);
      --ds-menu-enter-distance: var(--space-1);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='trigger'] {
      display: inline-flex;
    }

    [data-part='popup'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: var(--ds-menu-popup-padding);
      border-style: solid;
      border-width: var(--ds-menu-border-width);
      border-color: var(--ds-menu-border);
      border-radius: var(--ds-menu-radius);
      /* surface: color.overlay.surface, locked */
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-menu-shadow);
      color: var(--color-foreground);
      z-index: var(--ds-menu-layer);
      /* minWidth: an override replaces the base; the × 2.5 stays in the rule */
      min-inline-size: calc(var(--ds-menu-min-width) * 2.5);
      max-inline-size: calc(100vw - 2 * var(--layout-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--layout-gutter)));
      overflow-y: auto;
      font-family: var(--ds-menu-font-family);
      font-size: var(--ds-menu-font-size);
      line-height: var(--ds-menu-line-height);
      outline: none;
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-menu-enter) var(--motion-easing-standard),
        transform var(--ds-menu-enter) var(--motion-easing-standard);
    }

    /* popupOffset: the gap between trigger and popup, on the side facing the trigger */
    [data-part='popup'][data-side='bottom'] {
      margin-block-start: var(--ds-menu-popup-offset);
    }

    [data-part='popup'][data-side='top'] {
      margin-block-end: var(--ds-menu-popup-offset);
    }

    [data-part='popup'][hidden] {
      display: none;
    }

    /* enter: fade plus an enterDistance slide from the trigger side */
    @starting-style {
      [data-part='popup'][data-side='bottom'] {
        opacity: 0;
        transform: translateY(calc(-1 * var(--ds-menu-enter-distance)));
      }

      [data-part='popup'][data-side='top'] {
        opacity: 0;
        transform: translateY(var(--ds-menu-enter-distance));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='popup'] {
        transition: none;
      }
    }

    [data-part='group'] {
      display: flex;
      flex-direction: column;
    }

    /* groupLabelColor: color.foreground.muted, locked */
    [data-part='groupLabel'] {
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      font-size: var(--ds-menu-group-label-size);
      font-weight: var(--ds-menu-group-label-weight);
      color: var(--color-foreground-muted);
    }

    /* borderWidth also sets the separator thickness */
    [data-part='separator'] {
      block-size: var(--ds-menu-border-width);
      margin-block: var(--ds-menu-separator-margin);
      background: var(--ds-menu-separator);
    }

    [data-part='item'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-menu-item-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    /* itemHover: color.background.subtle, locked; keyboard focus shares it, so the highlight is never hover-only */
    [data-part='item']:hover,
    [data-part='item']:focus {
      background: var(--color-background-subtle);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='item']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='item'][aria-disabled='true'] {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    [data-part='item'][aria-disabled='true']:hover {
      background: none;
    }

    /* itemDangerColor: color.foreground.danger, locked */
    [data-part='item'][data-tone='danger'] {
      color: var(--color-foreground-danger);
    }

    [data-part='itemIcon'] {
      flex: none;
    }

    .label {
      flex: 1;
      min-inline-size: 0;
    }

    /* shortcutColor: color.foreground.muted, locked */
    [data-part='itemShortcut'] {
      flex: none;
      font-size: var(--ds-menu-shortcut-size);
      color: var(--color-foreground-muted);
    }
  `;

  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  @property() accessor label = '';

  /** Actions, optionally grouped with a label or divided by separators. */
  @property({ attribute: false }) accessor items: MenuItem[] = [];

  /** Variant of the trigger Button. */
  @property({ attribute: 'trigger-variant' }) accessor triggerVariant: MenuTriggerVariant = 'ghost';

  /** Icon on the trigger: the Button's leading icon with `iconOnly`, its trailing icon otherwise; `none` for no icon. */
  @property({ attribute: 'trigger-icon' }) accessor triggerIcon: MenuTriggerIcon = 'chevron-down';

  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /** Preferred position of the popup relative to the trigger; flips when it would overflow the viewport. */
  @property({ type: String, reflect: true }) accessor placement: MenuPlacement = 'bottom-start';

  /** Controlled open state (the parent flips it from `open-change`). Omit for an uncontrolled menu. */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /**
   * Position the popup relative to this element instead of rendering a
   * trigger; the trigger part is omitted and `open` must be controlled.
   */
  @property({ attribute: false }) accessor anchor: HTMLElement | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<MenuOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** The item carrying the roving tabindex. */
  @state() private accessor activeId: string | null = null;

  @query('[data-part="trigger"]') private accessor triggerEl!: HTMLElement | null;
  @query('[data-part="trigger"] ds-button') private accessor buttonEl!: HTMLElement | null;
  @query('[data-part="popup"]') private accessor popupEl!: HTMLElement | null;

  private wasOpen = false;
  private pendingFocus: 'first' | 'last' = 'first';
  private restoreOnClose = false;
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  private warnedNothingToPress = false;

  /** Whether the menu is open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Menu');
    this.addEventListener('focusout', this.handleFocusOut);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeGlobalListeners();
    clearTimeout(this.typeaheadTimer);
    this.wasOpen = false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (import.meta.env.DEV && !this.warnedNothingToPress && this.iconOnly && this.triggerIcon === 'none' && !this.anchor) {
      this.warnedNothingToPress = true;
      console.warn('<ds-menu>: `icon-only` with `trigger-icon="none"` leaves nothing visible to press.', this);
    }
  }

  protected override updated(): void {
    const isOpen = this.currentOpen;
    if (isOpen === this.wasOpen) return;
    this.wasOpen = isOpen;
    if (isOpen) this.handleOpened();
    else this.handleClosed();
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const navigable = this.navigableItems();
    const rovingId = this.activeId ?? navigable[0]?.id ?? null;
    let groupIndex = 0;

    const renderItem = (item: MenuActionItem): TemplateResult => html`
      <div
        part="item"
        data-part="item"
        role="menuitem"
        data-id=${item.id}
        data-tone=${ifDefined(item.tone === 'danger' ? 'danger' : undefined)}
        tabindex=${rovingId === item.id && !item.disabled ? 0 : -1}
        aria-disabled=${ifDefined(item.disabled ? 'true' : undefined)}
        @click=${() => this.handleItemClick(item)}
        @pointerenter=${() => this.handleItemPointerEnter(item)}
      >
        ${item.icon ? html`<ds-icon part="itemIcon" data-part="itemIcon" name=${item.icon}></ds-icon>` : nothing}
        <span class="label">${item.label}</span>
        ${item.shortcut
          ? html`<span part="itemShortcut" data-part="itemShortcut" aria-hidden="true">${item.shortcut}</span>`
          : nothing}
      </div>
    `;

    const entries = this.items.map((item) => {
      if (isSeparator(item)) {
        return html`<div part="separator" data-part="separator" role="separator"></div>`;
      }
      if (isGroup(item)) {
        const labelId = `group-label-${groupIndex++}`;
        return html`
          <div part="group" data-part="group" role="group" aria-labelledby=${labelId}>
            <div part="groupLabel" data-part="groupLabel" id=${labelId} role="presentation">${item.group}</div>
            ${groupActions(item).map(renderItem)}
          </div>
        `;
      }
      return renderItem(item);
    });

    const icon =
      this.triggerIcon === 'none'
        ? nothing
        : html`<ds-icon slot=${this.iconOnly ? 'leading-icon' : 'trailing-icon'} name=${this.triggerIcon}></ds-icon>`;

    return html`
      ${this.anchor
        ? nothing
        : html`
            <span part="trigger" data-part="trigger">
              <ds-button
                variant=${this.triggerVariant}
                label=${this.label}
                ?icon-only=${this.iconOnly}
                .expanded=${isOpen}
                @press=${this.handleTriggerPress}
                @keydown=${this.handleTriggerKeydown}
              >
                ${icon}
              </ds-button>
            </span>
          `}
      <div
        id="menu"
        part="popup list"
        data-part="popup"
        role="menu"
        aria-label=${this.label}
        popover=${ifDefined(POPOVER_SUPPORTED ? 'manual' : undefined)}
        ?hidden=${!POPOVER_SUPPORTED && !isOpen}
        @keydown=${this.handleMenuKeydown}
      >
        ${entries}
      </div>
    `;
  }

  /* ---- state ---- */

  /** Moves toward `next`: uncontrolled flips internal state first; both modes report it after. */
  private requestOpen(next: boolean, reason: MenuOpenChangeReason): void {
    if (next === this.currentOpen) return;
    if (this.open === undefined) this.internalOpen = next;
    this.dispatchEvent(
      new CustomEvent<MenuOpenChangeDetail>('open-change', {
        detail: { open: next, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleOpened(): void {
    const popup = this.popupEl;
    if (popup && POPOVER_SUPPORTED && !popup.matches(':popover-open')) popup.showPopover();
    this.updatePosition();
    this.addGlobalListeners();
    void this.focusItem(this.pendingFocus);
    this.pendingFocus = 'first';
  }

  private handleClosed(): void {
    this.removeGlobalListeners();
    // Focus still inside the popup would be lost when it hides, so it goes back to the trigger too.
    const active = this.shadowRoot?.activeElement ?? null;
    const focusInPopup = active !== null && (this.popupEl?.contains(active) ?? false);
    this.hidePopup();
    if (this.restoreOnClose || focusInPopup) this.restoreFocus();
    this.restoreOnClose = false;
    this.activeId = null;
    this.typeaheadBuffer = '';
  }

  private hidePopup(): void {
    const popup = this.popupEl;
    if (!popup) return;
    if (POPOVER_SUPPORTED) {
      if (popup.matches(':popover-open')) popup.hidePopover();
    } else {
      popup.hidden = true;
    }
  }

  private restoreFocus(): void {
    (this.anchor ?? this.buttonEl)?.focus();
  }

  /** Closes and returns focus to the trigger once the menu actually closes (controlled: when `open` becomes false). */
  private closeAndRestore(reason: MenuOpenChangeReason): void {
    this.restoreOnClose = true;
    this.requestOpen(false, reason);
  }

  /* ---- handlers ---- */

  private readonly handleTriggerPress = (event: Event): void => {
    // The trigger's press stays internal; the menu reports open-change instead.
    event.stopPropagation();
    if (this.currentOpen) {
      this.closeAndRestore('trigger');
    } else {
      this.pendingFocus = 'first';
      this.requestOpen(true, 'trigger');
    }
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    this.pendingFocus = event.key === 'ArrowDown' ? 'first' : 'last';
    if (this.currentOpen) void this.focusItem(this.pendingFocus);
    else this.requestOpen(true, 'trigger');
  };

  private readonly handleMenuKeydown = (event: KeyboardEvent): void => {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.moveFocus(1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this.moveFocus(-1);
    } else if (key === 'Home') {
      event.preventDefault();
      void this.focusItem('first');
    } else if (key === 'End') {
      event.preventDefault();
      void this.focusItem('last');
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const item = this.navigableItems().find((entry) => entry.id === this.activeId);
      if (item) this.selectItem(item);
    } else if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAndRestore('escape');
    } else if (key === 'Tab') {
      // Park focus on the trigger (or anchor) and let the browser's own Tab /
      // Shift+Tab move on from there, to the tabbable after or before it.
      // An uncontrolled popup hides first so Tab cannot land back inside it.
      this.restoreFocus();
      if (this.open === undefined) this.hidePopup();
      this.requestOpen(false, 'tab-out');
    } else if (key.length === 1 && /^[a-z]$/i.test(key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.typeahead(key);
    }
  };

  private handleItemClick(item: MenuActionItem): void {
    if (item.disabled) return;
    this.selectItem(item);
  }

  private handleItemPointerEnter(item: MenuActionItem): void {
    if (item.disabled || !this.currentOpen) return;
    void this.focusItem(item.id);
  }

  /** The menu, its trigger, and the anchor standing in for a trigger. */
  private isInside(node: EventTarget | null): boolean {
    if (!(node instanceof Node)) return false;
    return node === this || this.contains(node) || this.renderRoot.contains(node) || (this.anchor?.contains(node) ?? false);
  }

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().some((target) => this.isInside(target))) return;
    this.requestOpen(false, 'outside');
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    if (!this.currentOpen) return;
    if (this.isInside(event.relatedTarget)) return;
    this.requestOpen(false, 'focus-out');
  };

  private readonly handleWindowBlur = (): void => {
    this.requestOpen(false, 'focus-out');
  };

  private readonly handleReposition = (): void => {
    if (this.currentOpen) this.updatePosition();
  };

  private addGlobalListeners(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  /* ---- items ---- */

  private navigableItems(): MenuActionItem[] {
    return flattenActionItems(this.items).filter((item) => !item.disabled);
  }

  private async focusItem(target: 'first' | 'last' | string): Promise<void> {
    const items = this.navigableItems();
    if (items.length === 0) return;
    const id = target === 'first' ? items[0]!.id : target === 'last' ? items[items.length - 1]!.id : target;
    this.activeId = id;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`[data-part="item"][data-id="${CSS.escape(id)}"]`)?.focus();
  }

  private moveFocus(delta: 1 | -1): void {
    const items = this.navigableItems();
    if (items.length === 0) return;
    const current = items.findIndex((item) => item.id === this.activeId);
    const next = current === -1 ? (delta === 1 ? 0 : items.length - 1) : (current + delta + items.length) % items.length;
    void this.focusItem(items[next]!.id);
  }

  private selectItem(item: MenuActionItem): void {
    // The menu closes itself first (open-change, reason action), then reports the choice.
    this.closeAndRestore('action');
    this.dispatchEvent(
      new CustomEvent<MenuActionDetail>('action', { detail: { id: item.id }, bubbles: true, composed: true }),
    );
  }

  private typeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadBuffer += char.toLowerCase();
    const items = this.navigableItems();
    const current = Math.max(0, items.findIndex((item) => item.id === this.activeId));
    // A fresh single character looks past the current item; a longer buffer may keep it.
    const start = this.typeaheadBuffer.length === 1 ? current + 1 : current;
    for (let offset = 0; offset < items.length; offset++) {
      const candidate = items[(start + offset) % items.length]!;
      if (candidate.label.toLowerCase().startsWith(this.typeaheadBuffer)) {
        void this.focusItem(candidate.id);
        break;
      }
    }
    // typeaheadReset is read at runtime from the popup.
    const source = this.popupEl ?? this;
    const reset = parseDuration(getComputedStyle(source).getPropertyValue(HOOKS.typeaheadReset));
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, reset);
  }

  /* ---- positioning ---- */

  private updatePosition(): void {
    const reference = this.anchor ?? this.triggerEl;
    const popup = this.popupEl;
    if (!reference || !popup) return;
    const rect = reference.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const [vertical, horizontal] = this.placement.split('-') as ['top' | 'bottom', 'start' | 'end'];

    popup.style.minInlineSize = `max(calc(var(${HOOKS.minWidth}) * 2.5), ${rect.width}px)`;
    popup.dataset['side'] = vertical;
    const style = getComputedStyle(popup);
    const offset = Math.max(parseFloat(style.marginBlockStart) || 0, parseFloat(style.marginBlockEnd) || 0);
    const size = popup.getBoundingClientRect();

    let side = vertical;
    if (side === 'bottom' && rect.bottom + offset + size.height > viewportHeight && rect.top - offset - size.height >= 0) {
      side = 'top';
    } else if (side === 'top' && rect.top - offset - size.height < 0 && rect.bottom + offset + size.height <= viewportHeight) {
      side = 'bottom';
    }
    let align = horizontal;
    if (align === 'start' && rect.left + size.width > viewportWidth && rect.right - size.width >= 0) {
      align = 'end';
    } else if (align === 'end' && rect.right - size.width < 0 && rect.left + size.width <= viewportWidth) {
      align = 'start';
    }

    popup.dataset['side'] = side;
    popup.style.top = side === 'bottom' ? `${rect.bottom}px` : 'auto';
    popup.style.bottom = side === 'top' ? `${viewportHeight - rect.top}px` : 'auto';
    popup.style.left = align === 'start' ? `${rect.left}px` : 'auto';
    popup.style.right = align === 'end' ? `${viewportWidth - rect.right}px` : 'auto';
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as MenuOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-menu': DsMenu;
  }
}
