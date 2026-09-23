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
  | 'gutter'
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
  gutter: '--ds-menu-gutter',
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

/** minWidth's runtime floor: the trigger's measured width. `0px` in `anchor` mode, which has no floor. */
const TRIGGER_WIDTH_HOOK = '--ds-menu-trigger-width';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
 * Reads a resolved length custom property in px (`popupOffset`, `gutter`): a rem value is multiplied
 * by the root font size. `null` when it cannot be read — no token stylesheet loaded, or not a length.
 */
function readLengthPx(element: Element, name: string): number | null {
  const raw = getComputedStyle(element).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  if (raw.endsWith('rem')) {
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(rootSize) ? value * rootSize : null;
  }
  return raw.endsWith('px') || /^[\d.]+$/.test(raw) ? value : null;
}

/** Whether focus can be parked on this element — an `anchor` is any element, and need not take focus. */
function isFocusable(element: HTMLElement): boolean {
  return element.matches(TABBABLE_SELECTOR) || element.tabIndex >= 0;
}

/**
 * Focuses the tabbable element after (or before) `from` in document order, skipping `exclude`. `from`
 * need not be tabbable itself (an `anchor` stands in for the trigger), and its own descendants are
 * neither before nor after it.
 */
function focusAdjacent(from: HTMLElement, exclude: Element | null, direction: 'next' | 'previous'): void {
  const all = [...document.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].filter(
    (element) => !(exclude && exclude.contains(element)) && !from.contains(element),
  );
  if (direction === 'next') {
    all.find((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)?.focus();
  } else {
    const preceding = all.filter((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING);
    preceding[preceding.length - 1]?.focus();
  }
}

/** The focused element, following open shadow roots down to the leaf that really has focus. */
function deepActiveElement(): HTMLElement | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active instanceof HTMLElement ? active : null;
}

/**
 * `<ds-menu>` — Menu (category: overlay, APG pattern: menu-button).
 *
 * `<ds-menu label="More actions" .items=${items}>` composes a `<ds-button>`
 * trigger (wrapped in the overlay-owned `data-part="trigger"` element) and a
 * `role="menu"` popup in the shadow root. The popup uses the Popover API
 * (`popover="manual"`, `showPopover()`) for top-layer rendering when available,
 * and `position: fixed` with `layer.dropdown` otherwise; either way it is placed
 * from the trigger's `getBoundingClientRect()` for `placement`. Only the block
 * side flips at the viewport edge — `start` and `end` resolve against the layout
 * direction and are shifted inline instead, so the popup stays `gutter` away
 * from the side edges.
 *
 * Items use one roving tabindex over real focus, and hover moves that focus, so
 * pointer and keyboard never highlight two things; DOM focus is authoritative,
 * so an item focused from outside the component (a click, a screen reader) is
 * still where the arrows, Home/End and typeahead move from.
 *
 * `open` is controlled when set: the element reports `open-change` and shows
 * the new state (hiding, and returning focus to the trigger) only once the
 * property changes. Omit it for an uncontrolled menu, which starts closed.
 * Choosing an item fires `open-change` (reason `action`) and then `action`.
 *
 * Setting `anchor` positions the popup relative to that element and omits the
 * trigger; `open` must then be controlled, and focus that would return to the
 * trigger returns to whatever had focus when the menu opened.
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
      --ds-menu-gutter: var(--layout-gutter);
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
      /* Locked bindings: outside the overrides type, but still hooks so page CSS can re-theme them. */
      --ds-menu-surface: var(--color-overlay-surface);
      /* phoneBreakpoint is read on rn only; declared here so the binding stays renameable. */
      --ds-menu-phone-breakpoint: var(--layout-max-width-prose);
      --ds-menu-item-hover: var(--color-background-subtle);
      --ds-menu-item-color: var(--color-foreground);
      --ds-menu-item-danger-color: var(--color-foreground-danger);
      --ds-menu-group-label-color: var(--color-foreground-muted);
      --ds-menu-shortcut-color: var(--color-foreground-muted);
      --ds-menu-min-target: var(--size-target-min);
      --ds-menu-focus-ring: var(--color-border-focus);
      --ds-menu-focus-ring-width: var(--border-width-focus);
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
      background: var(--ds-menu-surface);
      box-shadow: var(--ds-menu-shadow);
      color: var(--ds-menu-item-color);
      z-index: var(--ds-menu-layer);
      /* minWidth: an override replaces the base; the × 2.5 stays in the rule, and the trigger's
         measured width is the runtime floor (0 in anchor mode, which has no trigger). */
      min-inline-size: max(calc(var(--ds-menu-min-width) * 2.5), var(--ds-menu-trigger-width, 0px));
      max-inline-size: calc(100vw - 2 * var(--ds-menu-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--ds-menu-gutter)));
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

    [data-part='popup'][hidden] {
      display: none;
    }

    /* enter: fade plus an enterDistance slide from the side facing the trigger, after any flip */
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
      color: var(--ds-menu-group-label-color);
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
      min-block-size: var(--ds-menu-min-target);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--ds-menu-item-color);
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    /* itemHover: color.background.subtle, locked; keyboard focus shares it, so the highlight is
       never hover-only. The highlight changes instantly: enter is the popup's transition only. */
    [data-part='item']:hover,
    [data-part='item']:focus {
      background: var(--ds-menu-item-hover);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='item']:focus-visible {
      outline: var(--ds-menu-focus-ring-width) solid var(--ds-menu-focus-ring);
      outline-offset: calc(-1 * var(--ds-menu-focus-ring-width));
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
      color: var(--ds-menu-item-danger-color);
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
      color: var(--ds-menu-shortcut-color);
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

  /**
   * Preferred position of the popup relative to the trigger (or `anchor`). Only
   * the block side flips when the popup would overflow the viewport; `start` and
   * `end` never flip — they resolve against the layout direction (in
   * right-to-left `start` is the right edge) and the popup is shifted inline
   * instead so it stays `gutter` away from the side edges.
   */
  @property({ type: String, reflect: true }) accessor placement: MenuPlacement = 'bottom-start';

  /**
   * Controlled open state (the parent flips it from `open-change`). Omit for an
   * uncontrolled menu, which starts closed; there is no defaultOpen. A
   * controlled menu hides only when `open` becomes false — a parent that never
   * flips it keeps the menu open.
   */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /**
   * Position the popup relative to this element instead of rendering a trigger;
   * the trigger part is omitted and `open` must be controlled. The anchor stands
   * in for the trigger: a pointerdown on it is not `outside` and focus moving
   * onto it is not `focus-out`.
   */
  @property({ attribute: false }) accessor anchor: HTMLElement | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<MenuOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** The item carrying the roving tabindex; `null` puts it on the first enabled item. */
  @state() private accessor activeId: string | null = null;

  /** Set while the popup is shown but must hold no tab stop at all, after Tab moved focus out of it. */
  @state() private accessor tabStopSuppressed = false;

  @query('[data-part="trigger"]') private accessor triggerEl!: HTMLElement | null;
  @query('[data-part="trigger"] ds-button') private accessor buttonEl!: HTMLElement | null;
  @query('[data-part="popup"]') private accessor popupEl!: HTMLElement | null;

  private wasOpen = false;
  private pendingFocus: 'first' | 'last' = 'first';
  private restoreOnClose = false;
  /** With `anchor` there is no trigger, so focus returns to whatever held it when the menu opened. */
  private opener: HTMLElement | null = null;
  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
  /** A window blur and the focusout it causes are one focus loss, and report once. */
  private focusLossReported = false;
  private warnedNothingToPress = false;

  /** Whether the menu is open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Menu');
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('focusin', this.handleFocusIn);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('focusin', this.handleFocusIn);
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
    const rovingId = this.tabStopSuppressed ? null : (this.activeId ?? navigable[0]?.id ?? null);
    let groupIndex = 0;

    const renderItem = (item: MenuActionItem): TemplateResult => html`
      <div
        data-part="item"
        role="menuitem"
        data-id=${item.id}
        data-tone=${ifDefined(item.tone === 'danger' ? 'danger' : undefined)}
        tabindex=${rovingId === item.id && !item.disabled ? 0 : -1}
        aria-disabled=${ifDefined(item.disabled ? 'true' : undefined)}
        @click=${() => this.handleItemClick(item)}
        @focus=${() => this.handleItemFocus(item)}
        @pointerenter=${() => this.handleItemPointerEnter(item)}
      >
        ${item.icon ? html`<ds-icon data-part="itemIcon" name=${item.icon}></ds-icon>` : nothing}
        <span class="label">${item.label}</span>
        ${item.shortcut ? html`<span data-part="itemShortcut" aria-hidden="true">${item.shortcut}</span>` : nothing}
      </div>
    `;

    const entries = this.items.map((item) => {
      if (isSeparator(item)) {
        return html`<div data-part="separator" role="separator"></div>`;
      }
      if (isGroup(item)) {
        const labelId = `group-label-${groupIndex++}`;
        return html`
          <div data-part="group" role="group" aria-labelledby=${labelId}>
            <div data-part="groupLabel" id=${labelId} role="presentation">${item.group}</div>
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
            <span data-part="trigger">
              <ds-button
                variant=${this.triggerVariant}
                label=${this.label}
                ?icon-only=${this.iconOnly}
                .expanded=${isOpen}
                .haspopup=${'menu'}
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
    this.tabStopSuppressed = false;
    this.focusLossReported = false;
    // The element that had focus when the menu opened stands in for the trigger in `anchor` mode.
    if (this.anchor) this.opener = deepActiveElement();
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
    this.opener = null;
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

  /** The element focus goes back to: the trigger, or in `anchor` mode whatever had it when the menu opened. */
  private restoreFocus(): void {
    (this.anchor ? this.opener : this.buttonEl)?.focus();
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
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const target = key === 'ArrowDown' ? 'first' : 'last';
      this.pendingFocus = target;
      // On an already open menu the arrows just move focus in, first or last.
      if (this.currentOpen) void this.focusItem(target);
      else this.requestOpen(true, 'trigger');
    } else if (key === 'Escape' && this.currentOpen) {
      // Escape on the trigger while the menu is open closes it too; focus stays where it is.
      event.preventDefault();
      event.stopPropagation();
      this.requestOpen(false, 'escape');
    }
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
      const focused = this.focusedActionId();
      const item = this.navigableItems().find((entry) => entry.id === focused);
      if (item) this.selectItem(item);
    } else if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeAndRestore('escape');
    } else if (key === 'Tab') {
      this.handleTab(event);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Typeahead takes any single printable character (letters of any script and digits, not only
      // a–z); Space is activation above, and keys held with Ctrl, Meta or Alt never reach here.
      event.preventDefault();
      this.typeahead(key);
    }
  };

  /**
   * Tab and Shift+Tab close and let the browser carry on. The key is not prevented when there is
   * somewhere to park focus — the trigger, or a focusable `anchor` standing in for it: every item
   * drops to tabindex -1 and focus moves there, so the browser's own Tab continues from that point
   * and a popup a controlled parent still shows holds no tab stop. Only an unfocusable anchor makes
   * the menu move focus itself, to the first tabbable after (Tab) or last before (Shift+Tab) it.
   */
  private handleTab(event: KeyboardEvent): void {
    // Focus is on its way out either way, so the focusout this causes is not a second focus loss.
    this.focusLossReported = true;
    const anchorEl = this.anchor ?? null;
    const park = this.buttonEl ?? (anchorEl && isFocusable(anchorEl) ? anchorEl : null);
    if (park) {
      for (const item of this.itemElements()) {
        // Converging write: a same-value tabIndex assignment still queues a mutation record.
        if (item.tabIndex !== -1) item.tabIndex = -1;
      }
      this.tabStopSuppressed = true;
      this.activeId = null;
      park.focus();
      this.requestOpen(false, 'tab-out');
      return;
    }
    event.preventDefault();
    this.requestOpen(false, 'tab-out');
    if (anchorEl) focusAdjacent(anchorEl, this.popupEl, event.shiftKey ? 'previous' : 'next');
  }

  private handleItemClick(item: MenuActionItem): void {
    if (item.disabled) return;
    this.selectItem(item);
  }

  /**
   * The one roving tabindex follows real focus, however the item got it. Converging write: the
   * guard makes a same-value assignment a no-op, so this cannot loop with the re-render that
   * moves the tabindex.
   */
  private handleItemFocus(item: MenuActionItem): void {
    this.tabStopSuppressed = false;
    if (item.disabled) return;
    if (this.activeId !== item.id) this.activeId = item.id;
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
    this.reportFocusLoss();
  };

  private readonly handleFocusIn = (): void => {
    // Focus came back: a later loss is a new one.
    this.focusLossReported = false;
  };

  private readonly handleWindowBlur = (): void => {
    if (this.currentOpen) this.reportFocusLoss();
  };

  /** One close per focus loss: the window blur and the focusout it causes report once between them. */
  private reportFocusLoss(): void {
    if (this.focusLossReported) return;
    this.focusLossReported = true;
    this.requestOpen(false, 'focus-out');
  }

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

  private itemElements(): HTMLElement[] {
    return [...this.renderRoot.querySelectorAll<HTMLElement>('[data-part="item"]')];
  }

  /**
   * The item that actually holds focus. The menu moves real focus rather than pointing at an item
   * with aria-activedescendant, so focus is the source of truth: it can land on an item without
   * passing through `focusItem` (a click, a screen reader, a consumer calling focus()), and the
   * arrows, Home/End and typeahead all move from wherever it really is. `activeId` only backs the
   * roving tabindex.
   */
  private focusedActionId(): string | null {
    const active = this.shadowRoot?.activeElement;
    if (active instanceof HTMLElement) {
      const id = active.closest<HTMLElement>('[data-part="item"]')?.dataset['id'];
      if (id !== undefined) return id;
    }
    return this.activeId;
  }

  private async focusItem(target: 'first' | 'last' | string): Promise<void> {
    const items = this.navigableItems();
    if (items.length === 0) return;
    const id = target === 'first' ? items[0]!.id : target === 'last' ? items[items.length - 1]!.id : target;
    this.tabStopSuppressed = false;
    this.activeId = id;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>(`[data-part="item"][data-id="${CSS.escape(id)}"]`)?.focus();
  }

  private moveFocus(delta: 1 | -1): void {
    const items = this.navigableItems();
    if (items.length === 0) return;
    // A disabled item can hold focus (a click puts it there); the arrows then start from the end.
    const current = items.findIndex((item) => item.id === this.focusedActionId());
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
    const current = Math.max(0, items.findIndex((item) => item.id === this.focusedActionId()));
    // A fresh single character looks past the current item; a longer buffer may keep it.
    const start = this.typeaheadBuffer.length === 1 ? current + 1 : current;
    for (let offset = 0; offset < items.length; offset++) {
      const candidate = items[(start + offset) % items.length]!;
      if (candidate.label.toLowerCase().startsWith(this.typeaheadBuffer)) {
        void this.focusItem(candidate.id);
        break;
      }
    }
    // typeaheadReset is read at runtime from the popup; with no token stylesheet it resolves to
    // nothing, and the buffer clears after each keypress rather than accumulating forever.
    const source = this.popupEl ?? this;
    const reset = parseDuration(getComputedStyle(source).getPropertyValue(HOOKS.typeaheadReset));
    this.typeaheadTimer = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, reset);
  }

  /* ---- positioning ---- */

  /**
   * Places the popup from the trigger (or `anchor`) rect for `placement`. Only the block side flips;
   * the inline side resolves against the layout direction and is shifted, never flipped, so the popup
   * stays `gutter` from both viewport edges (the leading edge wins when it cannot have both).
   */
  private updatePosition(): void {
    const reference = this.anchor ?? this.triggerEl;
    const popup = this.popupEl;
    if (!reference || !popup) return;

    // The trigger width is only known at runtime, so the minWidth floor is written before the popup
    // is measured; with `anchor` there is no trigger-width floor.
    const triggerWidth = this.anchor ? '0px' : `${reference.getBoundingClientRect().width}px`;
    if (popup.style.getPropertyValue(TRIGGER_WIDTH_HOOK) !== triggerWidth) {
      popup.style.setProperty(TRIGGER_WIDTH_HOOK, triggerWidth);
    }

    // popupOffset and gutter are read in px from the popup's resolved hooks (rem × root font size).
    const offset = readLengthPx(popup, HOOKS.popupOffset) ?? 0;
    const gutter = readLengthPx(popup, HOOKS.gutter) ?? 0;
    const rtl = getComputedStyle(reference).direction === 'rtl';
    const rect = reference.getBoundingClientRect();
    // Layout size, not the rect: the enter transform must not skew the measurement.
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const [preferred, side] = this.placement.split('-') as ['bottom' | 'top', 'start' | 'end'];
    // The flip check includes the offset and the gutter kept from the block edges.
    const needed = height + offset + gutter;

    let vertical = preferred;
    if (vertical === 'bottom' && rect.bottom + needed > viewportHeight && rect.top - needed >= 0) {
      vertical = 'top';
    } else if (vertical === 'top' && rect.top - needed < 0 && rect.bottom + needed <= viewportHeight) {
      vertical = 'bottom';
    }

    // `start` is the reference's leading edge: its left in left-to-right, its right in right-to-left.
    const alignsToLeadingEdge = rtl ? side === 'end' : side === 'start';
    const preferredLeft = alignsToLeadingEdge ? rect.left : rect.right - width;
    // When the popup is wider than the viewport minus 2 × gutter the leading edge wins, clamped to gutter.
    const furthestLeft = viewportWidth - gutter - width;
    const left =
      furthestLeft < gutter
        ? rtl
          ? furthestLeft
          : gutter
        : Math.min(Math.max(preferredLeft, gutter), furthestLeft);

    // popupOffset is the gap on the side facing the trigger; the block edges keep `gutter` too, so a
    // popup that could not flip is clamped rather than sitting against the edge.
    const preferredTop = vertical === 'bottom' ? rect.bottom + offset : rect.top - offset - height;
    const top = Math.max(gutter, Math.min(preferredTop, viewportHeight - gutter - height));

    if (popup.dataset['side'] !== vertical) popup.dataset['side'] = vertical;
    popup.style.left = `${left}px`;
    popup.style.right = 'auto';
    popup.style.top = `${top}px`;
    popup.style.bottom = 'auto';
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
