import { LitElement, css, html, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Disclosure.js';
import type { DisclosureHeadingLevel, DisclosureToggleDetail } from './Disclosure.js';

export type AccordionHeadingLevel = DisclosureHeadingLevel;

/** One section. `id` must be unique and is also used as the slot name for its panel content when using `items`. */
export interface AccordionItem {
  id: string;
  summary: string;
  disabled?: boolean | undefined;
}

/** Why a section's open state changed. */
export type AccordionOpenChangeReason = 'trigger' | 'keyboard' | 'exclusive' | 'controlled';

/** Detail carried by the `change` CustomEvent. A single id when `exclusive`, otherwise the full open set. */
export interface AccordionChangeDetail {
  value: string | string[];
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

function isDisclosureElement(el: Element): el is HTMLElement & { id: string; open?: boolean | undefined } {
  return el.tagName === 'DS-DISCLOSURE';
}

/**
 * `<ds-accordion>` — Accordion (category: container, APG pattern: accordion).
 *
 * A list of `<ds-disclosure>` sections that know about each other: a shared
 * `heading-level`, a shared roomier trigger padding, arrow-key navigation
 * between triggers, and (with `exclusive`) the rule that opening one closes
 * the rest. Sections are either light-DOM `<ds-disclosure>` children (slotted,
 * so their panel content stays in the document) or generated from the `items`
 * property, in which case each item's panel content is projected through a
 * slot named after its `id` (`<div slot="faq-1">…</div>`). Either way, every
 * `<ds-disclosure>` must carry a unique `id` — it is how `value`,
 * `defaultValue` and the events identify a section. Opening and closing is
 * always driven by the accordion (each disclosure's `open` is set, never left
 * uncontrolled), so `value`/`defaultValue` and the `change`/`open-change`
 * events stay authoritative. Every trigger remains a real tab stop — arrow
 * keys are a convenience on top of, not instead of, Tab.
 *
 * ## When to use
 *
 * Use an Accordion for a series of independent sections a user scans by
 * heading and opens selectively: an FAQ, a settings page grouped by topic, a
 * multi-part form where each part is optional. Set `headingLevel` to fit the
 * page outline. Leave `exclusive` off unless the panels are heavy or
 * mutually exclusive by nature.
 *
 * ## When not to use
 *
 * Do not use an Accordion for content most users need — show it. Do not use
 * it as navigation or as tabs. Do not nest accordions. Do not use one for a
 * single section; that is a `<ds-disclosure>`.
 *
 * @fires change - Fired when the set of open sections changes, with `{ value }` in `detail`.
 * @fires open-change - Fired per section as it opens or closes, with `{ id, open, reason }` in `detail`.
 * @slot - Light-DOM `<ds-disclosure>` children, used when `items` is not set.
 * @slot [item.id] - With `items`, the panel content for the item with that id.
 * @csspart list - The container of sections (anatomy: list).
 */
@customElement('ds-accordion')
export class DsAccordion extends LitElement {
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

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--ds-accordion-item-gap);
    }

    /* triggerPaddingBlock / fontFamily / triggerFontSize / triggerFontWeight forward into each Disclosure's own hooks */
    .list ::slotted(ds-disclosure),
    .list > ds-disclosure {
      --ds-disclosure-trigger-padding-block: var(--ds-accordion-trigger-padding-block);
      --ds-disclosure-trigger-font-family: var(--ds-accordion-font-family);
      --ds-disclosure-trigger-font-size: var(--ds-accordion-trigger-font-size);
      --ds-disclosure-trigger-font-weight: var(--ds-accordion-trigger-font-weight);
    }

    /* divider / dividerWidth: a hairline between items, not before the first */
    :host([divided]) .list ::slotted(ds-disclosure:not(:first-child)),
    :host([divided]) .list > ds-disclosure:not(:first-child) {
      border-block-start: var(--ds-accordion-divider-width) solid var(--ds-accordion-divider);
    }
  `;

  /** Generates a `<ds-disclosure>` per entry instead of reading light-DOM children. Each item's panel content is a slot named after its `id`. */
  @property({ attribute: false }) accessor items: AccordionItem[] | undefined;

  /** Heading level for every trigger, so sections appear in the page outline. */
  @property({ reflect: true, attribute: 'heading-level' }) accessor headingLevel: AccordionHeadingLevel = '3';

  /** Opening one section closes the others. */
  @property({ type: Boolean, reflect: true }) accessor exclusive = false;

  /** Controlled open ids: an array, or a single id when `exclusive`. Omit for uncontrolled. */
  @property({ attribute: false }) accessor value: string | string[] | undefined;

  /** Initially open ids for an uncontrolled accordion. */
  @property({ attribute: false }) accessor defaultValue: string | string[] | undefined;

  /** A hairline between items. */
  @property({ type: Boolean, reflect: true }) accessor divided = true;

  /** Passed to every section; required when panels contain form fields. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) accessor keepMounted = false;

  /** Per-instance style overrides: `{ divider: 'color.border.strong' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<AccordionOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open ids, seeded from `defaultValue`. */
  @state() private accessor internalOpenIds = new Set<string>();

  @query('slot:not([name])') private accessor defaultSlotEl!: HTMLSlotElement | null;

  /** The open ids last dispatched or applied, used to diff a controlled `value` change. */
  private appliedIds = new Set<string>();

  private get usesItems(): boolean {
    return this.items !== undefined;
  }

  /** The open ids right now, controlled or not. */
  get currentOpenIds(): Set<string> {
    return this.value !== undefined ? this.toIdSet(this.value) : this.internalOpenIds;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Accordion');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalOpenIds = this.toIdSet(this.defaultValue);
      this.appliedIds = new Set(this.currentOpenIds);
    } else if (changed.has('value')) {
      this.syncControlledChange();
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncSlottedItems();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    return html`
      <div class="list" part="list" @keydown=${this.handleKeydown}>
        ${this.usesItems
          ? this.items!.map((item) => this.renderItem(item))
          : html`<slot @slotchange=${this.handleSlotChange}></slot>`}
      </div>
    `;
  }

  private renderItem(item: AccordionItem) {
    return html`
      <ds-disclosure
        id=${item.id}
        summary=${item.summary}
        heading-level=${this.headingLevel}
        ?disabled=${item.disabled}
        ?keep-mounted=${this.keepMounted}
        ?open=${this.currentOpenIds.has(item.id)}
        @toggle=${this.handleToggle}
      >
        <slot name=${item.id}></slot>
      </ds-disclosure>
    `;
  }

  private readonly handleSlotChange = (): void => {
    this.syncSlottedItems();
  };

  /** Sets heading-level, keep-mounted, open and the toggle listener on every slotted `<ds-disclosure>`. No-op when `items` is set. */
  private syncSlottedItems(): void {
    if (this.usesItems) {
      return;
    }
    const openIds = this.currentOpenIds;
    for (const el of this.slottedDisclosures()) {
      (el as unknown as { headingLevel?: AccordionHeadingLevel | undefined }).headingLevel = this.headingLevel;
      (el as unknown as { keepMounted: boolean }).keepMounted = this.keepMounted;
      el.addEventListener('toggle', this.handleToggle);
      if (el.id) {
        (el as unknown as { open?: boolean | undefined }).open = openIds.has(el.id);
      }
    }
  }

  private slottedDisclosures(): (HTMLElement & { id: string })[] {
    return (this.defaultSlotEl?.assignedElements({ flatten: true }) ?? []).filter(isDisclosureElement);
  }

  private itemElements(): HTMLElement[] {
    if (this.usesItems) {
      return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.list > ds-disclosure'));
    }
    return this.slottedDisclosures();
  }

  private readonly handleToggle = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !isDisclosureElement(target)) {
      return;
    }
    const id = target.id;
    if (!id) {
      return;
    }
    const detail = (event as CustomEvent<DisclosureToggleDetail>).detail;
    this.setOpen(id, detail.open, 'trigger');
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const items = this.itemElements();
    const path = event.composedPath();
    const currentEl = items.find((el) => path.includes(el));
    if (!currentEl) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusRelative(items, currentEl, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusRelative(items, currentEl, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusEdge(items, 'first');
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusEdge(items, 'last');
    }
  };

  private focusRelative(items: HTMLElement[], currentEl: HTMLElement, delta: number): void {
    const enabled = items.filter((el) => !el.hasAttribute('disabled'));
    if (enabled.length === 0) {
      return;
    }
    const index = enabled.indexOf(currentEl);
    const base = index === -1 ? 0 : index;
    const next = (base + delta + enabled.length) % enabled.length;
    enabled[next]!.focus();
  }

  private focusEdge(items: HTMLElement[], edge: 'first' | 'last'): void {
    const enabled = items.filter((el) => !el.hasAttribute('disabled'));
    if (enabled.length === 0) {
      return;
    }
    (edge === 'first' ? enabled[0] : enabled[enabled.length - 1])!.focus();
  }

  /** Applies a trigger-originated toggle: updates the open set, closes siblings when `exclusive`, and dispatches events. */
  private setOpen(id: string, open: boolean, reason: AccordionOpenChangeReason): void {
    const next = new Set(this.currentOpenIds);
    const closedByExclusive: string[] = [];
    if (open) {
      if (this.exclusive) {
        for (const existing of next) {
          if (existing !== id) {
            closedByExclusive.push(existing);
          }
        }
        next.clear();
      }
      next.add(id);
    } else {
      next.delete(id);
    }
    if (this.value === undefined) {
      this.internalOpenIds = next;
    }
    this.appliedIds = new Set(next);
    this.dispatchOpenChange(id, open, reason);
    for (const closedId of closedByExclusive) {
      this.dispatchOpenChange(closedId, false, 'exclusive');
    }
    this.dispatchChange(next);
  }

  /** Diffs an externally-set `value` against what was last applied and reports the change as `reason: 'controlled'`. */
  private syncControlledChange(): void {
    const next = this.currentOpenIds;
    for (const id of next) {
      if (!this.appliedIds.has(id)) {
        this.dispatchOpenChange(id, true, 'controlled');
      }
    }
    for (const id of this.appliedIds) {
      if (!next.has(id)) {
        this.dispatchOpenChange(id, false, 'controlled');
      }
    }
    this.appliedIds = new Set(next);
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

  private dispatchChange(ids: Set<string>): void {
    this.dispatchEvent(
      new CustomEvent<AccordionChangeDetail>('change', {
        detail: { value: this.toValue(ids) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toValue(ids: Set<string>): string | string[] {
    if (this.exclusive) {
      const [first] = ids;
      return first ?? '';
    }
    return Array.from(ids);
  }

  private toIdSet(value: string | string[] | undefined): Set<string> {
    if (value === undefined || value === '') {
      return new Set();
    }
    return new Set(Array.isArray(value) ? value : [value]);
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

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (this.exclusive && this.currentOpenIds.size > 1) {
      console.warn('<ds-accordion exclusive> has more than one open id; only one section can be open.', this);
    }
    for (const el of this.itemElements()) {
      if (!el.id) {
        console.warn('<ds-accordion> expects each section to have a unique `id`.', el);
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-accordion': DsAccordion;
  }
}
