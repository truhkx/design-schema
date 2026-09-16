import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Disclosure.js';
import './Divider.js';
import type { DisclosureHeadingLevel, DisclosureToggleDetail, DsDisclosure } from './Disclosure.js';

export type AccordionHeadingLevel = DisclosureHeadingLevel;

/**
 * One section. On Lit the schema's `content` is dropped: the panel body is a
 * light-DOM child slotted by the item id (`<div slot="faq-1">…</div>`).
 */
export interface AccordionItem {
  id: string;
  summary: string;
  disabled?: boolean | undefined;
}

/** Why a section's open state changed. */
export type AccordionOpenChangeReason = 'trigger' | 'keyboard' | 'exclusive' | 'controlled';

/** Detail carried by the `change` CustomEvent: every open id, zero or one entry under `exclusive`. */
export interface AccordionChangeDetail {
  openIds: string[];
}

/** Detail carried by the `open-change` CustomEvent, fired once per section as it opens or closes. */
export interface AccordionOpenChangeDetail {
  id: string;
  open: boolean;
  reason: AccordionOpenChangeReason;
}

/** Overridable style hooks; see the `overrides` property. `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type AccordionOverridableBinding =
  | 'divider'
  | 'dividerWidth'
  | 'itemGap'
  | 'triggerPaddingBlock'
  | 'fontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight';

const HOOKS: Record<AccordionOverridableBinding, string> = {
  divider: '--ds-accordion-divider',
  dividerWidth: '--ds-accordion-divider-width',
  itemGap: '--ds-accordion-item-gap',
  triggerPaddingBlock: '--ds-accordion-trigger-padding-block',
  fontFamily: '--ds-accordion-font-family',
  triggerFontSize: '--ds-accordion-trigger-font-size',
  triggerFontWeight: '--ds-accordion-trigger-font-weight',
};

const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean => value === null,
  toAttribute: (value: boolean): string | null => (value ? null : ''),
};

function isDisclosure(el: Element): el is DsDisclosure {
  return el.localName === 'ds-disclosure';
}

function sameMembers(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}

/**
 * `<ds-accordion>` — Accordion (category: container, APG pattern: accordion).
 *
 * A list of `<ds-disclosure>` sections that know about each other: a shared
 * `heading-level` and `keep-mounted`, a roomier trigger padding, arrow-key
 * navigation between triggers, and (with `exclusive`) the rule that opening
 * one closes the rest. Sections are light-DOM `<ds-disclosure>` children, so
 * their content stays in the document, or are generated from the `items`
 * property, in which case each item's panel body is the light-DOM child whose
 * `slot` is the item's id. Every section is identified by its `id`.
 *
 * The shadow root assigns slots manually, so each section sits in its own slot
 * and a `<ds-divider>` can be rendered between items without touching the
 * light DOM. The accordion always sets each disclosure's `open`, so `value` /
 * `defaultValue` and the `change` / `open-change` events stay authoritative.
 * Every trigger remains a tab stop; arrow keys are a convenience on top of Tab.
 *
 * ## When to use
 *
 * Use an Accordion for a series of independent sections a user scans by
 * heading and opens selectively: an FAQ, a settings page grouped by topic, a
 * multi-part form where each part is optional. Set `headingLevel` to fit the
 * page outline. Leave `exclusive` off unless the panels are heavy or mutually
 * exclusive by nature.
 *
 * ## When not to use
 *
 * Do not use an Accordion for content most users need — show it. Do not use it
 * as navigation or as tabs. Do not nest accordions. Do not use one for a single
 * section; that is a `<ds-disclosure>`.
 *
 * @fires change - The set of open sections changed, with `{ openIds }` in `detail`.
 * @fires open-change - A section opened or closed, with `{ id, open, reason }` in `detail`.
 * @slot - Light-DOM `<ds-disclosure>` children, used when `items` is not set.
 * @slot [item.id] - With `items`, the panel body of the item with that id.
 */
@customElement('ds-accordion')
export class DsAccordion extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual',
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-accordion-divider: var(--color-border);
      --ds-accordion-divider-width: var(--border-width-thin);
      --ds-accordion-item-gap: var(--layout-gap-none);
      --ds-accordion-trigger-padding-block: var(--space-md);
      --ds-accordion-font-family: var(--font-family-body);
      --ds-accordion-trigger-font-size: var(--font-size-md);
      --ds-accordion-trigger-font-weight: var(--font-weight-medium);
    }

    :host([hidden]) {
      display: none;
    }

    /* itemGap: items touch; the divider separates them */
    [data-part='list'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-accordion-item-gap);
    }

    /* triggerPaddingBlock / fontFamily / triggerFontSize / triggerFontWeight reach each Disclosure through its documented hooks */
    [data-part='list'] > ds-disclosure,
    ::slotted(ds-disclosure) {
      --ds-disclosure-trigger-padding-block: var(--ds-accordion-trigger-padding-block);
      --ds-disclosure-trigger-font-family: var(--ds-accordion-font-family);
      --ds-disclosure-trigger-font-size: var(--ds-accordion-trigger-font-size);
      --ds-disclosure-trigger-font-weight: var(--ds-accordion-trigger-font-weight);
    }

    /* divider / dividerWidth reach each Divider through its documented hooks */
    [data-part='list'] > ds-divider {
      --ds-divider-color: var(--ds-accordion-divider);
      --ds-divider-thickness: var(--ds-accordion-divider-width);
    }
  `;

  /** The sections in order. When set, the accordion renders the `<ds-disclosure>` elements itself. */
  @property({ attribute: false }) accessor items: AccordionItem[] | undefined;

  /** Heading level for every trigger, so sections appear in the page outline. */
  @property({ type: String, reflect: true, attribute: 'heading-level' }) accessor headingLevel: AccordionHeadingLevel = '3';

  /** Opening one section closes the others. */
  @property({ type: Boolean, reflect: true }) accessor exclusive = false;

  /** Controlled open ids. A bare string is a one-id array; `[]` or `''` means nothing is open. Omit for uncontrolled. */
  @property({ attribute: false }) accessor value: string | string[] | undefined;

  /** Initially open ids; the same shapes as `value`. */
  @property({ attribute: false }) accessor defaultValue: string | string[] | undefined;

  /** A hairline between items. Exposed as the negated `no-divided` attribute. */
  @property({ attribute: 'no-divided', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER }) accessor divided = true;

  /** Passed to every Disclosure; required when panels contain form fields. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) accessor keepMounted = false;

  /** Per-instance style overrides: `{ divider: 'color.border.strong' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open ids, seeded from `defaultValue`. */
  @state() private accessor internalOpenIds: string[] = [];

  /** Light-DOM `<ds-disclosure>` children, each assigned to its own slot. */
  @state() private accessor slottedItems: DsDisclosure[] = [];

  /** The open set the sections currently show, for diffing a controlled `value`. */
  private renderedIds: string[] = [];

  /** The set last emitted while controlled; a `value` equal to it is not reported as `controlled`. */
  private emittedIds: string[] | undefined;

  private readonly childObserver = new MutationObserver(() => {
    this.readChildren();
    this.assignSlots();
  });

  /** The open ids right now, controlled or not; the first id only under `exclusive`. */
  get openIds(): string[] {
    return this.value !== undefined ? this.toOpenIds(this.value) : this.internalOpenIds;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Accordion');
    this.readChildren();
    // childList only: assigning slots never changes the host's children, so this cannot loop.
    this.childObserver.observe(this, { childList: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.childObserver.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.warnExclusive(this.defaultValue);
      this.internalOpenIds = this.toOpenIds(this.defaultValue);
      this.renderedIds = this.openIds;
    } else if (changed.has('value')) {
      this.warnExclusive(this.value);
      this.reportControlledChange();
    } else if (changed.has('exclusive')) {
      this.renderedIds = this.openIds;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    const sections = this.items
      ? this.items.map((item, index) => html`${this.renderDivider(index)}${this.renderItem(item)}`)
      : this.slottedItems.map((_, index) => html`${this.renderDivider(index)}<slot data-index=${index}></slot>`);
    return html`
      <div data-part="list" part="list" @toggle=${this.handleToggle} @keydown=${this.handleKeydown}>${sections}</div>
    `;
  }

  protected override updated(): void {
    this.syncSlottedItems();
    this.assignSlots();
    this.warnMissingIds();
  }

  private renderDivider(index: number): TemplateResult | typeof nothing {
    return this.divided && index > 0 ? html`<ds-divider></ds-divider>` : nothing;
  }

  private renderItem(item: AccordionItem): TemplateResult {
    return html`
      <ds-disclosure
        id=${item.id}
        summary=${item.summary}
        heading-level=${this.headingLevel}
        ?disabled=${item.disabled === true}
        ?keep-mounted=${this.keepMounted}
        .open=${this.openIds.includes(item.id)}
      >
        <slot data-item=${item.id}></slot>
      </ds-disclosure>
    `;
  }

  private readChildren(): void {
    const next = Array.from(this.children).filter(isDisclosure);
    const current = this.slottedItems;
    if (next.length !== current.length || next.some((el, i) => el !== current[i])) {
      this.slottedItems = next;
    }
  }

  /** Assigns each slot its nodes; a slot already holding exactly those nodes is left alone. */
  private assignSlots(): void {
    for (const slot of this.renderRoot.querySelectorAll<HTMLSlotElement>('slot')) {
      const { index, item } = slot.dataset;
      let nodes: Element[] = [];
      if (index !== undefined) {
        const el = this.slottedItems[Number(index)];
        nodes = el ? [el] : [];
      } else if (item !== undefined) {
        nodes = Array.from(this.children).filter((child) => child.getAttribute('slot') === item);
      }
      const assigned = slot.assignedNodes();
      if (assigned.length !== nodes.length || assigned.some((node, i) => node !== nodes[i])) {
        slot.assign(...nodes);
      }
    }
  }

  /** Sets heading-level, keep-mounted and open on every slotted disclosure, writing only what differs. */
  private syncSlottedItems(): void {
    if (this.items) return;
    const openIds = this.openIds;
    for (const el of this.slottedItems) {
      if (el.headingLevel !== this.headingLevel) el.headingLevel = this.headingLevel;
      if (el.keepMounted !== this.keepMounted) el.keepMounted = this.keepMounted;
      const open = el.id !== '' && openIds.includes(el.id);
      if (el.open !== open) el.open = open;
    }
  }

  private itemElements(): DsDisclosure[] {
    if (this.items) {
      return Array.from(this.renderRoot.querySelectorAll<DsDisclosure>('[data-part="list"] > ds-disclosure'));
    }
    return this.slottedItems;
  }

  private readonly handleToggle = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !isDisclosure(target) || !this.itemElements().includes(target)) {
      return;
    }
    // Disclosures the accordion renders itself are internal; their toggle is replaced by change / open-change.
    if (this.items) event.stopPropagation();
    const { open, reason } = (event as CustomEvent<DisclosureToggleDetail>).detail;
    // `controlled` is the disclosure echoing an `open` the accordion just set.
    if (reason === 'controlled' || target.id === '') return;
    this.toggleSection(target.id, open, reason === 'keyboard' ? 'keyboard' : 'trigger');
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const trigger = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.dataset.part === 'trigger');
    const root = trigger?.getRootNode();
    const items = this.itemElements();
    const current = root instanceof ShadowRoot ? items.findIndex((el) => el === root.host) : -1;
    if (current === -1) return;
    const enabled = (el: DsDisclosure | undefined): el is DsDisclosure => el !== undefined && !el.disabled;
    let next: DsDisclosure | undefined;
    if (event.key === 'Home') {
      next = items.find(enabled);
    } else if (event.key === 'End') {
      next = [...items].reverse().find(enabled);
    } else {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      for (let offset = 1; offset <= items.length && next === undefined; offset += 1) {
        const candidate = items[(current + step * offset + items.length * offset) % items.length];
        if (enabled(candidate)) next = candidate;
      }
    }
    if (next === undefined) return;
    event.preventDefault();
    next.focus();
  };

  /** Applies a user toggle: computes the next open set, closes the others under `exclusive`, and dispatches the events. */
  private toggleSection(id: string, open: boolean, reason: AccordionOpenChangeReason): void {
    const current = this.openIds;
    let next: string[];
    let closed: string[] = [];
    if (open) {
      closed = this.exclusive ? current.filter((existing) => existing !== id) : [];
      next = this.exclusive ? [id] : current.includes(id) ? current : [...current, id];
    } else {
      next = current.filter((existing) => existing !== id);
    }
    if (this.value === undefined) {
      this.internalOpenIds = next;
      this.renderedIds = next;
    } else {
      // Controlled: the sections show the new set only once `value` changes.
      this.emittedIds = next;
    }
    this.dispatchChange(next);
    this.dispatchOpenChange(id, open, reason);
    for (const closedId of closed) {
      this.dispatchOpenChange(closedId, false, 'exclusive');
    }
  }

  /** Reports a `value` change the accordion did not itself just emit as `reason: 'controlled'`, per section. */
  private reportControlledChange(): void {
    const next = this.openIds;
    const previous = this.renderedIds;
    const emitted = this.emittedIds;
    this.renderedIds = next;
    this.emittedIds = undefined;
    if (emitted !== undefined && sameMembers(emitted, next)) return;
    for (const id of next) {
      if (!previous.includes(id)) this.dispatchOpenChange(id, true, 'controlled');
    }
    for (const id of previous) {
      if (!next.includes(id)) this.dispatchOpenChange(id, false, 'controlled');
    }
  }

  private dispatchChange(openIds: string[]): void {
    this.dispatchEvent(
      new CustomEvent<AccordionChangeDetail>('change', {
        detail: { openIds: [...openIds] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchOpenChange(id: string, open: boolean, reason: AccordionOpenChangeReason): void {
    this.dispatchEvent(
      new CustomEvent<AccordionOpenChangeDetail>('open-change', {
        detail: { id, open, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** `''` and `[]` are nothing open; a bare string is one id; under `exclusive` only the first id counts. */
  private toOpenIds(value: string | string[] | undefined): string[] {
    const ids = value === undefined || value === '' ? [] : Array.isArray(value) ? value : [value];
    return this.exclusive ? ids.slice(0, 1) : [...ids];
  }

  private warnExclusive(value: string | string[] | undefined): void {
    if (!import.meta.env.DEV || !this.exclusive || !Array.isArray(value) || value.length < 2) return;
    console.warn(
      `ds-accordion: \`exclusive\` opens one section; opened "${value[0]}" and ignored ${value
        .slice(1)
        .map((id) => `"${id}"`)
        .join(', ')}.`,
      this,
    );
  }

  private warnedMissingId = false;

  private warnMissingIds(): void {
    if (!import.meta.env.DEV || this.warnedMissingId) return;
    const missing = this.itemElements().find((el) => el.id === '');
    if (missing) {
      this.warnedMissingId = true;
      console.warn('ds-accordion: every section needs a unique `id`; it is how `value` and the events identify it.', missing);
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as AccordionOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
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
    'ds-accordion': DsAccordion;
  }
}
