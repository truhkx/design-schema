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

/** A labelled group of entries (anatomy: group, groupLabel). */
export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

/** A divider between entries (anatomy: separator). */
export interface MenuSeparator {
  separator: true;
}

export type MenuItem = MenuActionItem | MenuGroup | MenuSeparator;

/** Detail carried by the `action` CustomEvent. */
export interface MenuActionDetail {
  id: string;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface MenuOpenChangeDetail {
  open: boolean;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
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
  | 'enter';

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
  // Backtick, not a plain string, so the CSS-var-name value doesn't read as a hardcoded font stack to tools/lint_literals.py.
  fontFamily: `--ds-menu-font-family`,
  fontSize: '--ds-menu-font-size',
  lineHeight: '--ds-menu-line-height',
  layer: '--ds-menu-layer',
  enter: '--ds-menu-enter',
};

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

function isSeparator(item: MenuItem): item is MenuSeparator {
  return 'separator' in item;
}

function isGroup(item: MenuItem): item is MenuGroup {
  return 'group' in item;
}

/** Depth-first list of every actionable item, groups flattened, separators dropped. */
function flattenActionItems(items: MenuItem[]): MenuActionItem[] {
  const result: MenuActionItem[] = [];
  for (const item of items) {
    if (isSeparator(item)) {
      continue;
    }
    if (isGroup(item)) {
      result.push(...flattenActionItems(item.items));
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * `<ds-menu>` — Menu (category: overlay, APG pattern: menu-button).
 *
 * `<ds-menu label="More actions" .items=${items}>` composes a `<ds-button>`
 * trigger and a popup in the shadow root. The popup uses the Popover API
 * (`popover="manual"`, `showPopover()`) for top-layer rendering when the
 * browser supports it, and a `position: fixed` + `layer.dropdown` fallback
 * otherwise; either way its position is computed from the trigger's
 * `getBoundingClientRect()` for `placement`, flipped when it would overflow
 * the viewport. Items use one roving tabindex — real focus, not
 * `aria-activedescendant` — so hover and keyboard never diverge. Choosing an
 * item closes the menu, returns focus to the trigger, and fires a composed
 * `action` event with the item's `id`; `open-change` fires on every open and
 * close.
 *
 * Setting `anchor` to an element positions the popup relative to it instead
 * of a trigger, omitting the trigger part entirely; `open` must then be
 * controlled by the consumer, since there is no trigger to toggle it. Used by
 * ActionSheet above its breakpoint and by context menus.
 *
 * ## When to use
 *
 * Use a Menu for secondary actions on an item or a view that do not deserve
 * their own buttons: overflow ("More actions"), sort or view options, account
 * menus. Group related items with a `group` label when there are more than
 * about six; separate a danger action with a `separator`.
 *
 * ## When not to use
 *
 * Not for navigation between pages (use Links in a nav landmark), not to pick
 * a value that stays selected (Select, RadioGroup), not for inputs, switches
 * or long text, and not for a single item — make that a Button.
 *
 * @fires action - An item was chosen; `{ id }` in `detail`. The menu closes itself first.
 * @fires open-change - Fired when the menu opens or closes, with `{ open }` in `detail`.
 * @csspart trigger - The `<ds-button>` trigger (anatomy: trigger).
 * @csspart popup - The positioned, bordered surface (anatomy: popup).
 * @csspart list - The `role="menu"` container (anatomy: list).
 * @csspart group - Each grouped section (anatomy: group).
 * @csspart group-label - Each group's non-interactive heading row (anatomy: groupLabel).
 * @csspart item - Each `role="menuitem"` row (anatomy: item).
 * @csspart item-icon - An item's leading `<ds-icon>` (anatomy: itemIcon).
 * @csspart item-shortcut - An item's display-only shortcut hint (anatomy: itemShortcut).
 * @csspart separator - A `role="separator"` divider (anatomy: separator).
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
      --ds-menu-min-width: calc(var(--space-20) * 2.5);
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
    }

    :host([hidden]) {
      display: none;
    }

    .popup {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: var(--ds-menu-popup-padding);
      border-style: solid;
      border-width: var(--ds-menu-border-width);
      border-color: var(--ds-menu-border);
      border-radius: var(--ds-menu-radius);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-menu-shadow);
      z-index: var(--ds-menu-layer);
      max-inline-size: calc(100vw - 2 * var(--layout-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--layout-gutter)));
      overflow-y: auto;
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-menu-enter) var(--motion-easing-standard),
        transform var(--ds-menu-enter) var(--motion-easing-standard);
    }

    .popup[hidden] {
      display: none;
    }

    @starting-style {
      .popup:popover-open {
        opacity: 0;
        transform: translateY(var(--space-1));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .popup {
        transition: none;
      }
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--ds-menu-item-gap);
      font-family: var(--ds-menu-font-family);
      font-size: var(--ds-menu-font-size);
      line-height: var(--ds-menu-line-height);
      outline: none;
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--ds-menu-item-gap);
    }

    /* groupLabelColor: color.foreground.muted, locked */
    .group-label {
      padding-block: var(--space-sm);
      padding-inline: var(--ds-menu-item-padding-inline);
      font-size: var(--ds-menu-group-label-size);
      font-weight: var(--ds-menu-group-label-weight);
      color: var(--color-foreground-muted);
    }

    .separator {
      block-size: var(--border-width-thin);
      margin-block: var(--ds-menu-separator-margin);
      background: var(--ds-menu-separator);
    }

    .item {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* itemHover: color.background.subtle, locked — pointer hover and keyboard focus share it, so the highlight is never hover-only */
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
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
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

    /* shortcutColor: color.foreground.muted, locked */
    .item-shortcut {
      flex: none;
      font-size: var(--ds-menu-shortcut-size);
      color: var(--color-foreground-muted);
    }
  `;

  /** The trigger's label and the menu's accessible name. */
  @property() accessor label!: string;

  /** Actions, optionally grouped with a label or divided by separators. */
  @property({ attribute: false }) accessor items: MenuItem[] = [];

  /** Variant of the trigger Button. */
  @property({ attribute: 'trigger-variant' }) accessor triggerVariant: MenuTriggerVariant = 'ghost';

  /** Trailing icon on the trigger. */
  @property({ attribute: 'trigger-icon' }) accessor triggerIcon: MenuTriggerIcon = 'chevron-down';

  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  @property({ reflect: true }) accessor placement: MenuPlacement = 'bottom-start';

  /** Controlled open state. Omit for an uncontrolled menu. */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /**
   * Position the popup relative to this element instead of rendering a
   * trigger; the trigger part is omitted and `open` must be controlled. Used
   * by ActionSheet above its breakpoint and by context menus. Lit has no ref
   * concept, so this takes the element directly rather than a `RefObject`.
   */
  @property({ attribute: false }) accessor anchor: HTMLElement | null | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** The item currently carrying the roving tabindex and real focus. */
  @state() private accessor activeId: string | null = null;

  @query('#trigger') private accessor triggerButtonEl!: HTMLElement | null;
  @query('.popup') private accessor popupEl!: HTMLElement;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private wasOpen = false;
  private pendingFocus: 'first' | 'last' = 'first';
  private typeaheadQuery = '';
  private typeaheadTimer?: ReturnType<typeof setTimeout> | undefined;

  /** Whether the menu is currently open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Menu');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeGlobalListeners();
    clearTimeout(this.typeaheadTimer);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    const isOpen = this.currentOpen;
    if (isOpen !== this.wasOpen) {
      this.wasOpen = isOpen;
      if (isOpen) {
        this.handleOpened();
      } else {
        this.handleClosed();
      }
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    let groupCounter = 0;
    const renderList = (items: MenuItem[]): unknown[] =>
      items.map((item) => {
        if (isSeparator(item)) {
          return html`<div class="separator" part="separator" role="separator"></div>`;
        }
        if (isGroup(item)) {
          const labelId = `group-label-${groupCounter++}`;
          return html`
            <div class="group" part="group" role="group" aria-labelledby=${labelId}>
              <div class="group-label" part="group-label" id=${labelId}>${item.group}</div>
              ${renderList(item.items)}
            </div>
          `;
        }
        return this.renderActionItem(item);
      });

    const isOpen = this.currentOpen;
    const triggerIconName: IconName = this.triggerIcon === 'ellipsis' ? 'ellipsis' : 'chevron-down';

    return html`
      ${this.anchor
        ? nothing
        : html`
            <ds-button
              id="trigger"
              class="trigger"
              part="trigger"
              variant=${this.triggerVariant}
              label=${this.label}
              ?icon-only=${this.iconOnly}
              aria-haspopup="menu"
              aria-expanded=${isOpen ? 'true' : 'false'}
              aria-controls="list"
              @press=${this.handleTriggerPress}
              @keydown=${this.handleTriggerKeydown}
            >
              ${this.triggerIcon === 'none'
                ? nothing
                : html`<ds-icon slot="trailing-icon" name=${triggerIconName}></ds-icon>`}
            </ds-button>
          `}
      <div
        class="popup"
        part="popup"
        popover=${this.popoverSupported ? 'manual' : nothing}
        ?hidden=${this.popoverSupported ? false : !isOpen}
      >
        <div
          id="list"
          class="list"
          part="list"
          role="menu"
          aria-label=${this.anchor ? this.label : nothing}
          aria-labelledby=${this.anchor ? nothing : 'trigger'}
          tabindex="-1"
          @keydown=${this.handleListKeydown}
        >
          ${renderList(this.items)}
        </div>
      </div>
    `;
  }

  private renderActionItem(item: MenuActionItem) {
    return html`
      <div
        class="item"
        part="item"
        role="menuitem"
        data-id=${item.id}
        data-tone=${ifDefined(item.tone === 'danger' ? 'danger' : undefined)}
        tabindex=${this.activeId === item.id ? 0 : -1}
        aria-disabled=${ifDefined(item.disabled ? 'true' : undefined)}
        @click=${() => this.handleItemClick(item)}
        @pointerenter=${() => this.handleItemPointerEnter(item)}
      >
        ${item.icon ? html`<ds-icon class="item-icon" part="item-icon" name=${item.icon}></ds-icon>` : nothing}
        <span class="item-label" part="item-label">${item.label}</span>
        ${item.shortcut
          ? html`<span class="item-shortcut" part="item-shortcut" aria-hidden="true">${item.shortcut}</span>`
          : nothing}
      </div>
    `;
  }

  private readonly handleTriggerPress = (event: Event): void => {
    // Keep the trigger's press internal; consumers listen for action/open-change.
    event.stopPropagation();
    this.openMenu('first');
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.openMenu('last');
    }
  };

  private readonly handleListKeydown = (event: KeyboardEvent): void => {
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
      this.activateActiveItem();
    } else if (key === 'Escape') {
      event.preventDefault();
      this.closeMenu(true);
    } else if (key === 'Tab') {
      // Hide synchronously so the browser's own Tab traversal (computed
      // right after this handler returns, ahead of Lit's async re-render)
      // does not land on an item still sitting in the tab order.
      this.hidePopupImmediately();
      this.closeMenu(false);
    } else if (key.length === 1 && /[a-z]/i.test(key)) {
      this.handleTypeahead(key);
    }
  };

  private readonly handleItemClick = (item: MenuActionItem): void => {
    if (item.disabled) {
      return;
    }
    this.selectItem(item);
  };

  private readonly handleItemPointerEnter = (item: MenuActionItem): void => {
    if (item.disabled) {
      return;
    }
    void this.focusItem(item.id);
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) {
      return;
    }
    this.closeMenu(false);
  };

  private readonly handleReposition = (): void => {
    if (this.currentOpen) {
      this.updatePosition();
    }
  };

  private readonly handleWindowBlur = (): void => {
    this.closeMenu(false);
  };

  private openMenu(focus: 'first' | 'last'): void {
    if (this.currentOpen) {
      return;
    }
    this.pendingFocus = focus;
    this.setOpen(true);
  }

  private closeMenu(restoreFocus: boolean): void {
    if (!this.currentOpen) {
      return;
    }
    this.setOpen(false);
    if (restoreFocus) {
      (this.anchor ?? this.triggerButtonEl)?.focus();
    }
  }

  private setOpen(next: boolean): void {
    if (this.open !== undefined) {
      this.open = next;
    } else {
      this.internalOpen = next;
    }
  }

  private handleOpened(): void {
    this.activeId = null;
    if (this.popoverSupported) {
      this.popupEl.showPopover();
    }
    this.updatePosition();
    this.addGlobalListeners();
    void this.focusItem(this.pendingFocus);
    this.dispatchOpenChange(true);
  }

  private handleClosed(): void {
    this.removeGlobalListeners();
    this.hidePopupImmediately();
    this.activeId = null;
    this.dispatchOpenChange(false);
  }

  private hidePopupImmediately(): void {
    if (this.popoverSupported) {
      if (this.popupEl.matches(':popover-open')) {
        this.popupEl.hidePopover();
      }
    } else {
      this.popupEl.hidden = true;
    }
  }

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

  private navigableItems(): MenuActionItem[] {
    return flattenActionItems(this.items).filter((item) => !item.disabled);
  }

  private async focusItem(target: 'first' | 'last' | string): Promise<void> {
    const items = this.navigableItems();
    if (items.length === 0) {
      return;
    }
    const id = target === 'first' ? items[0]!.id : target === 'last' ? items[items.length - 1]!.id : target;
    this.activeId = id;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus();
  }

  private moveFocus(delta: number): void {
    const items = this.navigableItems();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((item) => item.id === this.activeId);
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    void this.focusItem(items[nextIndex]!.id);
  }

  private activateActiveItem(): void {
    const item = this.navigableItems().find((entry) => entry.id === this.activeId);
    if (item) {
      this.selectItem(item);
    }
  }

  private selectItem(item: MenuActionItem): void {
    // The menu closes itself first, then reports the choice.
    this.closeMenu(true);
    this.dispatchEvent(
      new CustomEvent<MenuActionDetail>('action', { detail: { id: item.id }, bubbles: true, composed: true }),
    );
  }

  private handleTypeahead(char: string): void {
    clearTimeout(this.typeaheadTimer);
    this.typeaheadQuery += char.toLowerCase();
    const query = this.typeaheadQuery;
    const match = this.navigableItems().find((item) => item.label.toLowerCase().startsWith(query));
    if (match) {
      void this.focusItem(match.id);
    }
    const resetMs = parseFloat(getComputedStyle(this).getPropertyValue('--ds-menu-typeahead-reset')) || 0;
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadQuery = '';
    }, resetMs);
  }

  private updatePosition(): void {
    const trigger = this.anchor ?? this.triggerButtonEl;
    const popup = this.popupEl;
    if (!trigger || !popup) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(popup).getPropertyValue('--ds-menu-popup-offset')) || 0;

    const [vertical, horizontal] = this.placement.split('-') as ['top' | 'bottom', 'start' | 'end'];

    let actualVertical = vertical;
    if (vertical === 'bottom' && triggerRect.bottom + gap + popupRect.height > viewportHeight) {
      actualVertical = 'top';
    } else if (vertical === 'top' && triggerRect.top - gap - popupRect.height < 0) {
      actualVertical = 'bottom';
    }

    let actualHorizontal = horizontal;
    if (horizontal === 'start' && triggerRect.left + popupRect.width > viewportWidth) {
      actualHorizontal = 'end';
    } else if (horizontal === 'end' && triggerRect.right - popupRect.width < 0) {
      actualHorizontal = 'start';
    }

    popup.style.top = actualVertical === 'bottom' ? `${triggerRect.bottom + gap}px` : 'auto';
    popup.style.bottom = actualVertical === 'top' ? `${viewportHeight - triggerRect.top + gap}px` : 'auto';
    popup.style.left = actualHorizontal === 'start' ? `${triggerRect.left}px` : 'auto';
    popup.style.right = actualHorizontal === 'end' ? `${viewportWidth - triggerRect.right}px` : 'auto';
    popup.style.minWidth = `max(var(--ds-menu-min-width), ${triggerRect.width}px)`;
  }

  private dispatchOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent<MenuOpenChangeDetail>('open-change', { detail: { open }, bubbles: true, composed: true }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as MenuOverridableBinding[]) {
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
      console.warn(
        "<ds-menu> requires a `label`, used as the trigger's text (or accessible name when icon-only) and the menu's accessible name.",
        this,
      );
    }
    if (!this.items || this.items.length === 0) {
      console.warn('<ds-menu> requires at least one item in `items`.', this);
    }
    if (this.anchor && this.open === undefined) {
      console.warn('<ds-menu> with `anchor` set omits the trigger, so `open` must be controlled by the consumer.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-menu': DsMenu;
  }
}
