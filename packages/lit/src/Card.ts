import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Stack.js';

export type CardHeadingLevel = '2' | '3' | '4' | '5' | '6';
export type CardInset = 'sm' | 'md' | 'lg';
export type CardSurface = 'default' | 'subtle';

/** Overridable style hooks; see the `overrides` property. `background`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type CardOverridableBinding =
  | 'paddingBlock'
  | 'paddingInline'
  | 'partGap'
  | 'headerGap'
  | 'footerGap'
  | 'actionsGap'
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'hoverBackground'
  | 'transition';

const HOOKS: Record<CardOverridableBinding, string> = {
  paddingBlock: '--ds-card-padding-block',
  paddingInline: '--ds-card-padding-inline',
  partGap: '--ds-card-part-gap',
  headerGap: '--ds-card-header-gap',
  footerGap: '--ds-card-footer-gap',
  actionsGap: '--ds-card-actions-gap',
  border: '--ds-card-border',
  borderWidth: '--ds-card-border-width',
  radius: '--ds-card-radius',
  hoverBackground: '--ds-card-hover-background',
  transition: '--ds-card-transition',
};

/** Elements an interactive Card treats as its single action target. */
const HIT_AREA_SELECTOR = 'ds-link, ds-button, a[href], button';
/** Marks the light-DOM link/button whose hit area extends across the whole card. */
const HIT_AREA_CLASS = 'ds-card-hit-area';
const HIT_AREA_STYLE = `.${HIT_AREA_CLASS} { position: relative; } .${HIT_AREA_CLASS}::after { content: ''; position: absolute; inset: 0; }`;

/** Roots that already carry the hit-area rule (a Document per page, a ShadowRoot per nesting host). */
const styledHitAreaRoots = new WeakSet<Document | ShadowRoot>();

/**
 * Injects the hit-area pseudo-element rule into the tree the slotted link or
 * button actually lives in (the page, or an ancestor shadow root). A shadow
 * stylesheet cannot reach that light-DOM content with `::after`, so the rule
 * has to live outside `ds-card`'s own shadow root.
 */
function ensureHitAreaStyle(root: Document | ShadowRoot): void {
  if (styledHitAreaRoots.has(root)) {
    return;
  }
  styledHitAreaRoots.add(root);
  const target = root instanceof Document ? root.head : root;
  if (target.querySelector(`style[data-${HIT_AREA_CLASS}]`) !== null) {
    return;
  }
  const style = document.createElement('style');
  style.setAttribute(`data-${HIT_AREA_CLASS}`, '');
  style.textContent = HIT_AREA_STYLE;
  target.appendChild(style);
}

/** `ElementInternals` with the cross-root ARIA reflection Chromium ships; not yet in every DOM lib. */
type LabelledInternals = ElementInternals & { ariaLabelledByElements?: Element[] | null };

/**
 * `<ds-card>` — Card (category: container).
 *
 * `<ds-card heading="Plan" heading-level="3" inset="md">…</ds-card>`. The host
 * gets an `article` role (via `ElementInternals`, best-effort labelled by the
 * heading across the shadow boundary) when `heading` is set, and no role
 * otherwise. Inside the shadow root: a `.surface` box (padding, background,
 * border and radius from tokens) holding a header row (`<ds-heading>` plus the
 * `header-actions` slot), shown when `heading` or header-actions content is
 * present; the default slot as the body; and a `footer` row, shown when
 * present. `interactive` cards grow their single slotted `ds-link`/`ds-button`
 * hit area across the whole card (a class added on `slotchange`, backed by a
 * rule injected into the light tree — see `ensureHitAreaStyle`) and draw the
 * focus ring on the card via `:focus-within`; the card itself is never a
 * second tab stop. `focusable` cards instead take `tabindex="-1"` (scripted
 * focus only, e.g. from a Feed) and draw the same ring via `:focus-visible`.
 *
 * ## When to use
 *
 * Use Cards for collections of like items where each needs its own boundary,
 * and for a single panel that groups a heading, content and actions. Give the
 * card a `heading` when it is a unit in a list, and set `headingLevel` to fit
 * the page. Use `interactive` only when the card contains exactly one Link or
 * Button whose action the whole card should extend to.
 *
 * @slot - The body. Usually a Stack of Text and controls.
 * @slot header-actions - Controls at the end of the header row — a ghost icon-only Button, a Link. At most two.
 * @slot footer - The action row. Buttons in a horizontal Stack, primary first, following Form's action-order rule.
 * @csspart surface - The padded, bordered box (anatomy: surface).
 * @csspart header - The header row (anatomy: header).
 * @csspart heading - The `<ds-heading>` (anatomy: heading).
 * @csspart header-actions - The header-actions slot (anatomy: headerActions).
 * @csspart body - The body wrapper (anatomy: body).
 * @csspart footer - The footer row (anatomy: footer).
 */
@customElement('ds-card')
export class DsCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: var(--font-family-body);
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
      --ds-card-part-gap: var(--layout-gap-loose);
      --ds-card-header-gap: var(--layout-gap-normal);
      --ds-card-footer-gap: var(--layout-gap-tight);
      --ds-card-actions-gap: var(--layout-gap-tight);
      --ds-card-border: var(--color-border);
      --ds-card-border-width: var(--border-width-thin);
      --ds-card-radius: var(--radius-lg);
      --ds-card-hover-background: var(--color-background-subtle);
      --ds-card-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock/paddingInline: layout.inset.{inset} */
    :host([inset='sm']) {
      --ds-card-padding-block: var(--layout-inset-sm);
      --ds-card-padding-inline: var(--layout-inset-sm);
    }
    :host([inset='md']) {
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
    }
    :host([inset='lg']) {
      --ds-card-padding-block: var(--layout-inset-lg);
      --ds-card-padding-inline: var(--layout-inset-lg);
    }

    /* hoverBackground: color.background.subtle; a subtle surface hovers one step up, to color.background.strong */
    :host([surface='subtle']) {
      --ds-card-hover-background: var(--color-background-strong);
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-card-part-gap);
      padding-block: var(--ds-card-padding-block);
      padding-inline: var(--ds-card-padding-inline);
      border-style: solid;
      border-width: 0;
      border-color: var(--ds-card-border);
      border-radius: var(--ds-card-radius);
      /* background: color.background.{surface}, locked — no override hook */
      background: var(--color-background);
      transition: background-color var(--ds-card-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .surface {
        transition: none;
      }
    }

    /* background: color.background.{surface}, locked */
    :host([surface='subtle']) .surface {
      background: var(--color-background-subtle);
    }

    /* borderWidth: rendered only with surface default — the calm option; subtle has no border */
    :host([surface='default']) .surface {
      border-width: var(--ds-card-border-width);
    }

    /* interactive: position context for the slotted link/button's extending hit area (see ensureHitAreaStyle) */
    :host([interactive]) {
      position: relative;
    }
    :host([interactive]) .surface {
      cursor: pointer;
    }
    :host([interactive]) .surface:hover {
      background: var(--ds-card-hover-background);
    }

    /* focusRing/focusRingWidth: color.border.focus, border.width.focus, locked. Drawn on the card, never a second tab stop. */
    :host([interactive]:focus-within) .surface {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* focusable: scripted focus only (tabindex="-1"); the card draws its own ring via :focus-visible. */
    :host(:focus-visible) .surface {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .body {
      min-inline-size: 0;
    }

    /* actionsGap: layout.gap.tight, between the (at most two) header-actions controls */
    slot[name='header-actions'] {
      display: flex;
      align-items: center;
      gap: var(--ds-card-actions-gap);
    }
  `;

  /** The card's title, rendered as a Heading at `headingLevel`. Omit for a card that is a single piece of content. */
  @property() heading?: string;

  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  @property({ reflect: true, attribute: 'heading-level' }) headingLevel: CardHeadingLevel = '3';

  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  @property({ reflect: true }) inset: CardInset = 'md';

  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  @property({ reflect: true }) surface: CardSurface = 'default';

  /**
   * The whole card is one link or button target. Requires exactly one
   * interactive child (a `ds-link` or `ds-button`) whose action the card
   * extends to its full area; the card itself is not focusable.
   */
  @property({ type: Boolean, reflect: true }) interactive = false;

  /**
   * The card root takes `tabindex="-1"` so a container (Feed) can move focus
   * to it by script, and draws its own focus ring when focused that way. Not
   * a tab stop; not for making cards clickable (`interactive`).
   */
  @property({ type: Boolean }) focusable = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (background, focusRing, focusRingWidth) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<CardOverridableBinding, TokenRef>>;

  private readonly internals: ElementInternals;
  private hitAreaTarget: Element | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Card');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('focusable')) {
      if (this.focusable) {
        this.setAttribute('tabindex', '-1');
      } else {
        this.removeAttribute('tabindex');
      }
    }
  }

  protected override render() {
    const hasHeading = Boolean(this.heading);
    const hasHeaderActions = this.querySelector('[slot="header-actions"]') !== null;
    const hasHeader = hasHeading || hasHeaderActions;
    const hasFooter = this.querySelector('[slot="footer"]') !== null;

    return html`
      <div class="surface" part="surface">
        ${hasHeader
          ? html`
              <ds-stack
                part="header"
                direction="horizontal"
                justify="between"
                align="center"
                style="gap: var(--ds-card-header-gap)"
              >
                ${hasHeading
                  ? html`<ds-heading id="heading" part="heading" level=${this.headingLevel} size="md"
                      >${this.heading}</ds-heading
                    >`
                  : nothing}
                <slot name="header-actions" part="header-actions"></slot>
              </ds-stack>
            `
          : nothing}
        <div class="body" part="body">
          <slot @slotchange=${this.handleDefaultSlotChange}></slot>
        </div>
        ${hasFooter
          ? html`
              <ds-stack part="footer" direction="horizontal" style="gap: var(--ds-card-footer-gap)">
                <slot name="footer"></slot>
              </ds-stack>
            `
          : nothing}
      </div>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    this.syncInternals();
    if (changed.has('interactive')) {
      const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
      if (slot !== null) {
        if (this.interactive) {
          this.syncHitArea(slot);
        } else if (this.hitAreaTarget !== null) {
          this.hitAreaTarget.classList.remove(HIT_AREA_CLASS);
          this.hitAreaTarget = null;
        }
      }
    }
  }

  private handleDefaultSlotChange(event: Event): void {
    if (!this.interactive) {
      return;
    }
    this.syncHitArea(event.target as HTMLSlotElement);
  }

  /** Finds the single interactive child and marks it as the card's extending hit area. */
  private syncHitArea(slot: HTMLSlotElement): void {
    const candidates = slot
      .assignedElements({ flatten: true })
      .filter((element) => element.matches(HIT_AREA_SELECTOR));
    if (this.hitAreaTarget !== null) {
      this.hitAreaTarget.classList.remove(HIT_AREA_CLASS);
      this.hitAreaTarget = null;
    }
    const [target, ...rest] = candidates;
    if (target !== undefined && rest.length === 0) {
      ensureHitAreaStyle(this.getRootNode() as Document | ShadowRoot);
      target.classList.add(HIT_AREA_CLASS);
      this.hitAreaTarget = target;
    } else if (import.meta.env.DEV) {
      console.warn(
        `<ds-card interactive> requires exactly one interactive child (a ds-link or ds-button); found ${candidates.length}.`,
      );
    }
  }

  /** Article role + best-effort cross-shadow labelling by the heading, when one is set. */
  private syncInternals(): void {
    const hasHeading = Boolean(this.heading);
    this.internals.role = hasHeading ? 'article' : null;
    const internals = this.internals as LabelledInternals;
    if ('ariaLabelledByElements' in internals) {
      const headingEl = hasHeading ? this.renderRoot.querySelector<HTMLElement>('#heading') : null;
      internals.ariaLabelledByElements = headingEl ? [headingEl] : null;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CardOverridableBinding[]) {
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
    'ds-card': DsCard;
  }
}
