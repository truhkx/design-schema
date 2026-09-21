import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Divider.js';
import './Menu.js';
import type { MenuActionDetail, MenuActionItem, MenuItem } from './Menu.js';

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
  groupGap: '--ds-toolbar-group-gap',
  separatorLength: '--ds-toolbar-separator-length',
  fadeWidth: '--ds-toolbar-fade-width',
};

/** copy.more */
const COPY_MORE = 'More';

/** One shadow-root slot per top-level entry, so the separator wrapper can render between two of them. */
const SLOT_PREFIX = 'ds-toolbar-entry-';

/** Marks a light-DOM entry this toolbar hid into the overflow menu (a consumer's own `hidden` is left alone). */
const COLLAPSED = 'data-ds-toolbar-collapsed';
/** Marks a control whose `size` came from the toolbar rather than its own markup. */
const SIZED = 'data-ds-toolbar-size';

/** The controls that take the toolbar's `size`, by tag name (never by probing for a property), with the sizes each accepts. */
const SIZED_TAGS: ReadonlyMap<string, ReadonlySet<ToolbarSize>> = new Map<string, ReadonlySet<ToolbarSize>>([
  ['ds-button', new Set<ToolbarSize>(['sm', 'md'])],
  ['ds-segmented-control', new Set<ToolbarSize>(['sm', 'md'])],
  ['ds-select', new Set<ToolbarSize>(['sm', 'md'])],
  // Search has no `sm`, so a `sm` toolbar leaves every Search at its own default.
  ['ds-search', new Set<ToolbarSize>(['md'])],
]);

/** The only control that collapses into the overflow Menu. */
const BUTTON_TAG = 'ds-button';
const GROUP_TAG = 'ds-toolbar-group';
/** Design-system elements that are structure or decoration, not controls. */
const STRUCTURE_TAGS: ReadonlySet<string> = new Set([GROUP_TAG, 'ds-divider']);

const NATIVE_FOCUSABLE = 'button, select, input, textarea, a[href], [tabindex]';
/** Input types that are not text entry, so the toolbar may take their arrow, Home and End keys. */
const NON_TEXT_INPUTS: ReadonlySet<string> = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
]);
/** The keys a text-entry control keeps for its caret. ArrowUp and ArrowDown are not caret keys there. */
const CARET_KEYS: ReadonlySet<string> = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

/** One rendered entry slot, and whether a separator is drawn before it. */
interface ToolbarEntrySlot {
  separatorBefore: boolean;
}

/**
 * `<ds-toolbar-group>` — related controls inside a `<ds-toolbar>` (anatomy: group).
 *
 * A light-DOM `role="group"` wrapper named by `label`. `<ds-toolbar>` descends
 * into it for its roving tabindex, draws a Divider between adjacent groups,
 * and collapses it into the overflow Menu as one Menu group.
 *
 * Orientation and gaps come from the Toolbar around it through inherited custom
 * properties, so the Toolbar never writes to the group's markup.
 *
 * @slot - The group's controls.
 */
@customElement('ds-toolbar-group')
export class DsToolbarGroup extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: flex;
      /* set by the Toolbar on itself; these inherit through the flattened tree */
      flex-direction: var(--ds-toolbar-group-direction, row);
      align-items: var(--ds-toolbar-group-align, center);
      gap: var(--ds-toolbar-item-gap, var(--layout-gap-normal));
    }

    :host([hidden]) {
      display: none;
    }
  `;

  /** The group's accessible name ("Text style", "Alignment"); also the Menu group heading when it collapses. */
  @property() accessor label: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ToolbarGroup');
    this.setAttribute('data-part', 'group');
    this.setAttribute('role', 'group');
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
    }
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

/**
 * `<ds-toolbar>` — Toolbar (category: navigation, APG pattern: toolbar).
 *
 * `<ds-toolbar label="Formatting">` holds slotted light-DOM controls, bare or
 * inside `<ds-toolbar-group>`, and makes them one tab stop with a roving
 * tabindex: Tab enters on the last-focused control (initially the first),
 * arrows along `orientation` move between enabled controls without wrapping,
 * Home/End jump to the ends. A control that handles an arrow itself
 * (`defaultPrevented`, as SegmentedControl does) keeps it, and a text-entry
 * control keeps ArrowLeft, ArrowRight, Home and End for its caret.
 *
 * Each top-level entry is assigned to its own shadow-root `<slot>`, so the
 * separator between two adjacent groups — a shadow `<div data-part="separator">`
 * holding a `<ds-divider>` — renders between them without the toolbar ever
 * inserting a node into the consumer's markup.
 *
 * `overflow="menu"` (horizontal only; a vertical toolbar scrolls instead)
 * measures the entries when the host resizes and hides whole trailing entries
 * of Buttons — a group collapses as a group — into a "More" `<ds-menu>`, whose
 * items are named by each control's `overflow-label` and call `click()` on the
 * original element. An entry holding any other control never collapses.
 * `overflow="scroll"` fades each edge only while content is hidden past it.
 *
 * `role`, `aria-label` and `aria-orientation` are plain host attributes so
 * accessible-name computation in tests reads them.
 *
 * @slot - Controls in order, or `<ds-toolbar-group>` wrappers around related ones.
 */
@customElement('ds-toolbar')
export class DsToolbar extends LitElement {
  static override styles: CSSResult = css`
    :host {
      --ds-toolbar-background: var(--color-background-subtle);
      --ds-toolbar-border: var(--color-border);
      --ds-toolbar-border-width: var(--border-width-thin);
      --ds-toolbar-radius: var(--radius-md);
      --ds-toolbar-padding-inline: var(--space-2);
      --ds-toolbar-padding-block: var(--space-1);
      --ds-toolbar-item-gap: var(--layout-gap-normal);
      --ds-toolbar-group-gap: var(--layout-gap-normal);
      --ds-toolbar-separator-length: var(--space-5);
      --ds-toolbar-fade-width: var(--space-6);
      /* Locked, and applied nowhere by the toolbar: every focusable thing in it is a composed child drawing its own ring. */
      --ds-toolbar-focus-ring: var(--color-border-focus);
      --ds-toolbar-focus-ring-width: var(--border-width-focus);
      display: flex;
      position: relative;
      box-sizing: border-box;
      align-items: center;
      gap: var(--ds-toolbar-item-gap);
      padding-inline: var(--ds-toolbar-padding-inline);
      padding-block: var(--ds-toolbar-padding-block);
      border: var(--ds-toolbar-border-width) solid var(--ds-toolbar-border);
      border-radius: var(--ds-toolbar-radius);
      background: var(--ds-toolbar-background);
    }

    :host([hidden]) {
      display: none;
    }

    /* itemGap by density */
    :host([density='compact']) {
      --ds-toolbar-item-gap: var(--layout-gap-tight);
    }

    :host([orientation='vertical']) {
      flex-direction: column;
      align-items: stretch;
      --ds-toolbar-group-direction: column;
      --ds-toolbar-group-align: stretch;
    }

    [data-part='container'] {
      display: flex;
      flex: 1 1 auto;
      align-items: center;
      gap: var(--ds-toolbar-item-gap);
      min-inline-size: 0;
      min-block-size: 0;
    }

    :host([orientation='vertical']) [data-part='container'] {
      flex-direction: column;
      align-items: stretch;
    }

    :host([overflow='wrap']) [data-part='container'] {
      flex-wrap: wrap;
    }

    /* separator: a wrapper of separatorLength along the cross axis; groupGap replaces itemGap either side, so the
       wrapper's padding is groupGap − itemGap, clamped at 0. The Divider inside stretches to fill it. */
    [data-part='separator'] {
      display: flex;
      flex: none;
      align-self: center;
      box-sizing: content-box;
      block-size: var(--ds-toolbar-separator-length);
      padding-inline: max(0px, calc(var(--ds-toolbar-group-gap) - var(--ds-toolbar-item-gap)));
    }

    :host([orientation='vertical']) [data-part='separator'] {
      flex-direction: column;
      justify-content: center;
      block-size: auto;
      inline-size: var(--ds-toolbar-separator-length);
      padding-inline: 0px;
      padding-block: max(0px, calc(var(--ds-toolbar-group-gap) - var(--ds-toolbar-item-gap)));
    }

    /* scroll (and menu on a vertical toolbar): each edge fades only while content is hidden past it */
    :host([overflow='scroll']) [data-part='container'],
    :host([orientation='vertical'][overflow='menu']) [data-part='container'] {
      --fade-start: 0px;
      --fade-end: 0px;
      scrollbar-width: none;
    }

    :host([overflow='scroll']) [data-part='container'][data-fade-start],
    :host([orientation='vertical'][overflow='menu']) [data-part='container'][data-fade-start] {
      --fade-start: var(--ds-toolbar-fade-width);
    }

    :host([overflow='scroll']) [data-part='container'][data-fade-end],
    :host([orientation='vertical'][overflow='menu']) [data-part='container'][data-fade-end] {
      --fade-end: var(--ds-toolbar-fade-width);
    }

    :host([orientation='horizontal'][overflow='scroll']) [data-part='container'] {
      overflow-x: auto;
      overflow-y: hidden;
      mask-image: linear-gradient(to right, transparent, black var(--fade-start), black calc(100% - var(--fade-end)), transparent); /* literal-ok: mask alpha stops, not a color */
    }

    :host([orientation='horizontal'][overflow='scroll']:dir(rtl)) [data-part='container'] {
      mask-image: linear-gradient(to left, transparent, black var(--fade-start), black calc(100% - var(--fade-end)), transparent); /* literal-ok: mask alpha stops, not a color */
    }

    :host([orientation='vertical'][overflow='scroll']) [data-part='container'],
    :host([orientation='vertical'][overflow='menu']) [data-part='container'] {
      overflow-x: hidden;
      overflow-y: auto;
      mask-image: linear-gradient(to bottom, transparent, black var(--fade-start), black calc(100% - var(--fade-end)), transparent); /* literal-ok: mask alpha stops, not a color */
    }

    [data-part='container']::-webkit-scrollbar {
      display: none;
    }

    [data-part='overflowMenu'] {
      flex: none;
    }

    [data-part='overflowMenu'][hidden] {
      display: none;
    }

    /* Measures size.target.min, the width budget reserved for the More trigger before it is rendered. */
    .target-probe {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      inline-size: var(--size-target-min);
      block-size: var(--size-target-min);
    }
  `;

  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; the toolbar's accessible name. */
  @property() accessor label: string = '';

  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  @property({ type: String, reflect: true }) accessor orientation: ToolbarOrientation = 'horizontal';

  /** What happens when controls do not fit: wrap onto more rows, collapse trailing Buttons into a "More" Menu, or scroll with faded edges. */
  @property({ type: String, reflect: true }) accessor overflow: ToolbarOverflow = 'menu';

  /** Default `size` for child Buttons, SegmentedControls, Selects and Searches that do not set their own. */
  @property({ type: String, reflect: true }) accessor size: ToolbarSize = 'md';

  /** Gap between controls: tight or normal rhythm. */
  @property({ type: String, reflect: true }) accessor density: ToolbarDensity = 'comfortable';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** One slot per top-level entry, in order, with the separators between adjacent groups. */
  @state() private accessor entrySlots: ToolbarEntrySlot[] = [];

  /** The overflow Menu's items, built from the collapsed controls. */
  @state() private accessor overflowItems: MenuItem[] = [];

  @query('[data-part="container"]') private accessor containerEl!: HTMLElement | null;
  @query('[data-part="overflowMenu"]') private accessor overflowMenuEl!: HTMLElement | null;
  @query('.target-probe') private accessor probeEl!: HTMLElement | null;

  /** The control carrying tabindex 0: the last one focused, initially the first. */
  private focusedControl: HTMLElement | null = null;

  /** Overflow item id → the original control it clicks. */
  private overflowTargets = new Map<string, HTMLElement>();

  /** Overflow item ids already warned about for a missing `overflow-label`: a control is identified by its place
      in the toolbar (its entry, and its index inside a group) for the life of this toolbar. */
  private readonly warnedOverflowLabel = new Set<string>();

  private recalcFrame = 0;
  private resizeObserver: ResizeObserver | undefined;

  /** Watches the whole light-DOM subtree: a control added inside an existing group is assigned to the group's slot, so
      the toolbar's own `slotchange` would not see it. `childList` only, and every write below is an attribute write,
      so the callback can never re-enter itself. */
  private readonly mutationObserver: MutationObserver = new MutationObserver(() => this.handleChildrenChanged());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Toolbar');
    this.setAttribute('role', 'toolbar');
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('focusin', this.handleFocusIn);
    this.mutationObserver.observe(this, { childList: true, subtree: true });
    this.resizeObserver = new ResizeObserver(() => this.scheduleRecalc());
    this.resizeObserver.observe(this);
    this.handleChildrenChanged();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.mutationObserver.disconnect();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    if (this.recalcFrame) cancelAnimationFrame(this.recalcFrame);
    this.recalcFrame = 0;
  }

  protected override firstUpdated(): void {
    this.handleChildrenChanged();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
      if (import.meta.env.DEV && !this.label) {
        console.warn("<ds-toolbar> requires a `label`, the toolbar's accessible name.", this);
      }
    }
    if (changed.has('orientation')) this.setAttribute('aria-orientation', this.orientation);
    if (changed.has('size')) this.applyDefaultSizes();
    if (changed.has('orientation') || changed.has('overflow') || changed.has('size') || changed.has('density')) {
      this.scheduleRecalc();
    }
  }

  protected override render(): TemplateResult {
    const dividerOrientation = this.orientation === 'vertical' ? 'horizontal' : 'vertical';
    return html`
      <span class="target-probe" aria-hidden="true"></span>
      <div part="container" data-part="container" @scroll=${this.syncFades}>
        ${this.entrySlots.map(
          (entry, index) =>
            html`${entry.separatorBefore
              ? html`<div part="separator" data-part="separator">
                  <ds-divider orientation=${dividerOrientation} spacing="none"></ds-divider>
                </div>`
              : nothing}<slot name=${SLOT_PREFIX + index}></slot>`,
        )}
      </div>
      ${this.usesMenu()
        ? html`<ds-menu
            part="overflowMenu"
            data-part="overflowMenu"
            label=${COPY_MORE}
            icon-only
            trigger-variant="ghost"
            trigger-icon="ellipsis"
            placement="bottom-end"
            .items=${this.overflowItems}
            ?hidden=${this.overflowItems.length === 0}
            @action=${this.handleOverflowAction}
          ></ds-menu>`
        : nothing}
    `;
  }

  // ---- discovery -------------------------------------------------------------------------------------------------

  /** `menu` is for horizontal toolbars; a vertical one treats it as `scroll`. */
  private usesMenu(): boolean {
    return this.overflow === 'menu' && this.orientation === 'horizontal';
  }

  private isGroup(el: Element): boolean {
    return el.localName === GROUP_TAG;
  }

  /** Top-level entries in order. Every element child is one entry, so every one of them gets a slot. */
  private entries(): HTMLElement[] {
    return Array.from(this.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
  }

  /**
   * The focusable control an element stands for: itself when it is a design-system element or natively focusable,
   * otherwise the first such descendant — an arbitrary wrapper makes what it holds one bare control.
   */
  private controlOf(el: HTMLElement): HTMLElement | null {
    if (STRUCTURE_TAGS.has(el.localName)) return null;
    if (el.localName.startsWith('ds-') || el.matches(NATIVE_FOCUSABLE)) return el;
    for (const node of Array.from(el.querySelectorAll<HTMLElement>('*'))) {
      if (STRUCTURE_TAGS.has(node.localName)) continue;
      if (node.localName.startsWith('ds-') || node.matches(NATIVE_FOCUSABLE)) return node;
    }
    return null;
  }

  /** The controls of one entry: a group's children one level down, or the entry itself. */
  private controlsOf(entry: HTMLElement): HTMLElement[] {
    const candidates = this.isGroup(entry)
      ? Array.from(entry.children).filter((el): el is HTMLElement => el instanceof HTMLElement)
      : [entry];
    return candidates.map((el) => this.controlOf(el)).filter((el): el is HTMLElement => el !== null);
  }

  /** Every control, in order, one level into groups; a control's own internals are never descended into. */
  private controls(): HTMLElement[] {
    return this.entries().flatMap((entry) => this.controlsOf(entry));
  }

  private isDisabled(el: HTMLElement): boolean {
    return el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
  }

  private isShown(el: HTMLElement): boolean {
    for (let node: HTMLElement | null = el; node && node !== this; node = node.parentElement) {
      if (node.hidden) return false;
    }
    return true;
  }

  /** What the roving tabindex may land on: shown, enabled controls, then the More trigger when it is showing. */
  private focusable(): HTMLElement[] {
    const list = this.controls().filter((el) => this.isShown(el) && !this.isDisabled(el));
    const menu = this.overflowMenuEl;
    if (menu && !menu.hidden) list.push(menu);
    return list;
  }

  // ---- roving tabindex -------------------------------------------------------------------------------------------

  /** Focusable without a `tabindex` of its own: a native control, or a design-system element that delegates focus. */
  private isNaturallyFocusable(el: HTMLElement): boolean {
    return el.localName.startsWith('ds-') || el.matches('button, select, input, textarea, a[href]');
  }

  /**
   * The one control in the tab sequence carries *no* `tabindex`, the rest carry `-1`.
   * `tabindex="0"` on the host of a composed control would be a second tab stop beside the inner control it
   * forwards its host `tabindex` to (`<ds-button tabindex="0">` renders `<button tabindex="0">`); removing the
   * attribute instead leaves exactly the inner control tabbable. Only an element with no focusability of its
   * own — a consumer's `<div tabindex>` — needs the explicit `0`.
   */
  private setTabStop(el: HTMLElement, active: boolean): void {
    if (!active) {
      if (el.getAttribute('tabindex') !== '-1') el.setAttribute('tabindex', '-1');
    } else if (this.isNaturallyFocusable(el)) {
      if (el.hasAttribute('tabindex')) el.removeAttribute('tabindex');
    } else if (el.getAttribute('tabindex') !== '0') {
      el.setAttribute('tabindex', '0');
    }
  }

  private syncRovingTabindex(): void {
    const list = this.focusable();
    if (!this.focusedControl || !list.includes(this.focusedControl)) this.focusedControl = list[0] ?? null;
    for (const el of list) this.setTabStop(el, el === this.focusedControl);
    // Collapsed or disabled controls leave the sequence too.
    for (const el of this.controls()) {
      if (!list.includes(el)) this.setTabStop(el, false);
    }
  }

  private readonly handleFocusIn = (event: FocusEvent): void => {
    const list = this.focusable();
    const target = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && list.includes(node));
    if (target && target !== this.focusedControl) {
      this.focusedControl = target;
      this.syncRovingTabindex();
    }
  };

  /** A text input, textarea or editable region, which keeps ArrowLeft, ArrowRight, Home and End for its caret. */
  private isTextEntry(node: EventTarget | undefined): boolean {
    if (node instanceof HTMLTextAreaElement) return true;
    if (node instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(node.type);
    return node instanceof HTMLElement && node.isContentEditable;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // A control with its own arrow-key model (SegmentedControl, an open Menu) handled the key first.
    if (event.defaultPrevented) return;
    const path = event.composedPath();
    if (CARET_KEYS.has(event.key) && this.isTextEntry(path[0])) return;
    const vertical = this.orientation === 'vertical';
    const rtl = !vertical && getComputedStyle(this).direction === 'rtl';
    const next = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const list = this.focusable();
    if (list.length === 0) return;
    const current = list.findIndex((el) => path.includes(el));
    let index: number;
    if (event.key === next) index = current < 0 ? 0 : current + 1;
    else if (event.key === prev) index = current < 0 ? 0 : current - 1;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = list.length - 1;
    else return;
    event.preventDefault();
    const target = list[index];
    if (!target) return; // no wrap
    this.focusedControl = target;
    this.syncRovingTabindex();
    target.focus();
  };

  // ---- children --------------------------------------------------------------------------------------------------

  private handleChildrenChanged(): void {
    this.syncEntrySlots();
    this.applyDefaultSizes();
    this.syncRovingTabindex();
    this.scheduleRecalc();
  }

  /**
   * Assigns every entry to its own slot and works out where a separator goes: between two adjacent shown groups.
   * The `slot` attribute is the only thing written to the consumer's markup, and it is written only when it differs,
   * so a pass over settled children is a no-op and the childList observer never sees it.
   */
  private syncEntrySlots(): void {
    const entries = this.entries();
    const slots: ToolbarEntrySlot[] = [];
    let previousShownGroup = false;
    entries.forEach((el, index) => {
      const name = SLOT_PREFIX + index;
      if (el.getAttribute('slot') !== name) el.setAttribute('slot', name);
      const group = this.isGroup(el);
      const shown = !el.hidden;
      slots.push({ separatorBefore: shown && group && previousShownGroup });
      if (shown) previousShownGroup = group;
    });
    const same =
      slots.length === this.entrySlots.length &&
      slots.every((slot, i) => slot.separatorBefore === this.entrySlots[i]?.separatorBefore);
    if (!same) this.entrySlots = slots;
  }

  /** A Button, SegmentedControl, Select or Search without a `size` attribute when first discovered takes the toolbar's;
      its own `size` wins, and a size the control has no value for leaves it at its own default. */
  private applyDefaultSizes(): void {
    for (const el of this.controls()) {
      const accepted = SIZED_TAGS.get(el.localName);
      if (!accepted) continue;
      const owned = el.hasAttribute(SIZED);
      if (!owned && el.hasAttribute('size')) continue;
      if (!accepted.has(this.size)) {
        if (owned) el.removeAttribute('size');
        continue;
      }
      if (!owned) el.setAttribute(SIZED, '');
      if (el.getAttribute('size') !== this.size) el.setAttribute('size', this.size);
    }
  }

  // ---- overflow --------------------------------------------------------------------------------------------------

  /** Measurement runs a frame later, after child controls have rendered their new size or density. */
  private scheduleRecalc(): void {
    if (this.recalcFrame) return;
    this.recalcFrame = requestAnimationFrame(() => {
      this.recalcFrame = 0;
      this.recalcOverflow();
    });
  }

  /** An entry collapses only if every control in it is a Button. */
  private isCollapsible(entry: HTMLElement): boolean {
    if (entry.localName === BUTTON_TAG) return true;
    if (!this.isGroup(entry)) return false;
    const controls = this.controlsOf(entry);
    return controls.length > 0 && controls.every((el) => el.localName === BUTTON_TAG);
  }

  private recalcOverflow(): void {
    if (!this.isConnected) return;
    for (const el of this.entries()) {
      if (el.hasAttribute(COLLAPSED)) {
        el.hidden = false;
        el.removeAttribute(COLLAPSED);
      }
    }
    const collapsed = this.usesMenu() ? this.measureCollapse() : [];
    for (const index of collapsed) {
      const el = this.entries()[index];
      if (!el) continue;
      el.hidden = true;
      el.setAttribute(COLLAPSED, '');
    }
    this.syncEntrySlots();
    this.buildOverflowItems(collapsed);
    this.syncRovingTabindex();
    this.syncFades();
  }

  /** Which trailing collapsible entries must go so the rest, plus a `size.target.min` More trigger, fit the host.
      Walking from the end, an entry holding any control other than a Button is skipped and stays visible. */
  private measureCollapse(): number[] {
    const entries = this.entries();
    const visible = entries.map((el, i) => [el, i] as const).filter(([el]) => !el.hidden);
    if (visible.length === 0) return [];
    const style = getComputedStyle(this);
    const rtl = style.direction === 'rtl';
    const startOf = (r: DOMRect): number => (rtl ? -r.right : r.left);
    const endOf = (r: DOMRect): number => (rtl ? -r.left : r.right);
    const rects = visible.map(([el]) => el.getBoundingClientRect());
    const widths = rects.map((r) => r.width);
    // Space after each entry up to the next one: the gap, plus a separator and its padding between groups.
    const after = rects.map((r, i) => (i < rects.length - 1 ? startOf(rects[i + 1]!) - endOf(r) : 0));
    const available =
      this.clientWidth - (parseFloat(style.paddingInlineStart) || 0) - (parseFloat(style.paddingInlineEnd) || 0);
    const total = (kept: number[]): number =>
      kept.reduce((sum, i, k) => sum + widths[i]! + (k < kept.length - 1 ? after[i]! : 0), 0);

    let kept = visible.map((_, i) => i);
    if (total(kept) <= available) return [];

    const reserve = (this.probeEl?.getBoundingClientRect().width ?? 0) + (parseFloat(style.columnGap) || 0);
    const budget = available - reserve;
    for (let i = visible.length - 1; i >= 0 && total(kept) > budget; i -= 1) {
      if (this.isCollapsible(visible[i]![0])) kept = kept.filter((k) => k !== i);
    }
    return visible.filter((_, i) => !kept.includes(i)).map(([, index]) => index);
  }

  private buildOverflowItems(collapsed: number[]): void {
    this.overflowTargets = new Map();
    const entries = this.entries();
    const items: MenuItem[] = [];
    let previousWasGroup = false;
    const toItem = (el: HTMLElement, id: string): MenuActionItem => {
      this.overflowTargets.set(id, el);
      const overflowLabel = el.getAttribute('overflow-label');
      if (import.meta.env.DEV && !overflowLabel && !this.warnedOverflowLabel.has(id)) {
        this.warnedOverflowLabel.add(id);
        console.warn('<ds-toolbar> a control collapsed into the More menu has no `overflow-label`.', el);
      }
      return {
        id,
        label: overflowLabel || el.getAttribute('label') || el.textContent?.trim() || '',
        disabled: this.isDisabled(el),
      };
    };
    for (const index of collapsed) {
      const entry = entries[index];
      if (!entry) continue;
      if (this.isGroup(entry)) {
        const groupItems = this.controlsOf(entry).map((el, i) => toItem(el, `entry-${index}-${i}`));
        const heading = entry.getAttribute('label');
        if (heading) {
          items.push({ group: heading, items: groupItems });
        } else {
          // A collapsed group without a label becomes plain items set off from earlier ones by a separator.
          if (items.length > 0) items.push({ separator: true });
          items.push(...groupItems);
        }
        previousWasGroup = true;
      } else {
        if (previousWasGroup) items.push({ separator: true });
        const control = this.controlsOf(entry)[0];
        if (control) items.push(toItem(control, `entry-${index}`));
        previousWasGroup = false;
      }
    }
    const unchanged =
      items.length === this.overflowItems.length && JSON.stringify(items) === JSON.stringify(this.overflowItems);
    if (!unchanged) this.overflowItems = items;
  }

  private readonly handleOverflowAction = (event: CustomEvent<MenuActionDetail>): void => {
    event.stopPropagation();
    this.overflowTargets.get(event.detail.id)?.click();
  };

  /** Marks which edges have content hidden past them; re-checked on scroll and after every size or children change. */
  private readonly syncFades = (): void => {
    const container = this.containerEl;
    if (!container) return;
    const vertical = this.orientation === 'vertical';
    const scrolls = this.overflow === 'scroll' || (vertical && this.overflow === 'menu');
    let hiddenStart = false;
    let hiddenEnd = false;
    if (scrolls) {
      const offset = Math.abs(vertical ? container.scrollTop : container.scrollLeft);
      const extent = vertical
        ? container.scrollHeight - container.clientHeight
        : container.scrollWidth - container.clientWidth;
      hiddenStart = offset > 1;
      hiddenEnd = extent - offset > 1;
    }
    if (container.hasAttribute('data-fade-start') !== hiddenStart) {
      container.toggleAttribute('data-fade-start', hiddenStart);
    }
    if (container.hasAttribute('data-fade-end') !== hiddenEnd) {
      container.toggleAttribute('data-fade-end', hiddenEnd);
    }
  };

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ToolbarOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) this.style.removeProperty(HOOKS[binding]);
      else this.style.setProperty(HOOKS[binding], cssVar(ref));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-toolbar': DsToolbar;
    'ds-toolbar-group': DsToolbarGroup;
  }
}
