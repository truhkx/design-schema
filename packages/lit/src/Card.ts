import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import type { HeadingOverridableBinding } from './Heading.js';

export type CardHeadingLevel = '2' | '3' | '4' | '5' | '6';
export type CardInset = 'sm' | 'md' | 'lg';
export type CardSurface = 'default' | 'subtle';

/** Overridable style hooks; see the `overrides` property. `background`, `hoverBackground`, `focusRing` and `focusRingWidth` are locked and excluded. */
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
  transition: '--ds-card-transition',
};

/** The Heading's own bottom margin adds no space inside the header row. */
const HEADING_OVERRIDES: Partial<Record<HeadingOverridableBinding, TokenRef>> = { marginBlockEnd: 'space.0' };

/** Elements an interactive Card treats as its single action target. */
const HIT_AREA_SELECTOR = 'ds-link, ds-button, a[href], button';
/** Marks the light-DOM link/button whose hit area extends across the whole card. */
const HIT_AREA_CLASS = 'ds-card-hit-area';
/** The target itself stays unpositioned so its `::after` resolves against the card host (`position: relative`). */
const HIT_AREA_STYLE = `.${HIT_AREA_CLASS}::after { content: ''; position: absolute; inset: 0; }`;

/** Roots that already carry the hit-area rule (a Document per page, a ShadowRoot per nesting host). */
const styledHitAreaRoots = new WeakSet<Document | ShadowRoot>();

/**
 * Injects the hit-area pseudo-element rule once into the tree the slotted link
 * or button lives in (the document head, or the nearest ancestor shadow root).
 * A shadow stylesheet cannot give light-DOM content an `::after`.
 */
function ensureHitAreaStyle(root: Node): void {
  if (!(root instanceof Document || root instanceof ShadowRoot) || styledHitAreaRoots.has(root)) {
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

const isDisabled = (element: Element): boolean =>
  element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';

/**
 * `<ds-card>` — Card (category: container).
 *
 * `<ds-card heading="Plan" heading-level="3" inset="md">…</ds-card>`. With a
 * `heading` the host is `role="article"` named by `aria-label` (ids do not
 * cross the shadow root); without one it has no role. Inside the shadow root a
 * surface holds the header row (`<ds-heading size="lg">` plus the
 * `header-actions` slot, shown when either is present), the default slot as
 * the body, and the footer row (shown when footer content is slotted). The
 * rows are the card's own flex rows so their gaps stay overridable.
 *
 * `interactive` extends the single `ds-link`/`ds-button` (or raw
 * `a[href]`/`button`) among the default slot's top-level assigned elements
 * across the whole card, and draws the ring on the card while that target has
 * keyboard focus (`:host(:state(target-focus))`); the card is never a focus
 * stop. `focusable` gives the host `tabindex="-1"` for scripted focus (Feed)
 * and draws the ring on `:focus-visible`; with `interactive` it is a no-op.
 *
 * @slot - The body. Usually a Stack of Text and controls.
 * @slot header-actions - Controls at the end of the header row — a ghost icon-only Button, a Link. At most two.
 * @slot footer - The action row. Buttons in a row, primary first, following Form's action-order rule.
 */
@customElement('ds-card')
export class DsCard extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
      --ds-card-part-gap: var(--layout-gap-loose);
      --ds-card-header-gap: var(--layout-gap-normal);
      --ds-card-footer-gap: var(--layout-gap-tight);
      --ds-card-actions-gap: var(--layout-gap-tight);
      --ds-card-border: var(--color-border);
      --ds-card-border-width: var(--border-width-thin);
      --ds-card-radius: var(--radius-lg);
      --ds-card-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock / paddingInline: layout.inset.{inset} */
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

    [data-part='surface'] {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-card-part-gap);
      padding-block: var(--ds-card-padding-block);
      padding-inline: var(--ds-card-padding-inline);
      border-style: solid;
      border-width: 0;
      border-color: transparent;
      border-radius: var(--ds-card-radius);
      /* background: color.background.{surface}, locked; default drops the segment */
      background-color: var(--color-background);
    }

    :host([surface='subtle']) [data-part='surface'] {
      background-color: var(--color-background-subtle);
    }

    /* borderWidth / border: rendered only with surface default */
    :host([surface='default']) [data-part='surface'] {
      border-width: var(--ds-card-border-width);
      border-color: var(--ds-card-border);
    }

    /* headerGap: layout.gap.normal, between the heading and headerActions */
    [data-part='header'] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-card-header-gap);
      min-inline-size: 0;
    }

    /* actionsGap: layout.gap.tight, between the headerActions controls */
    [data-part='headerActions'] {
      display: flex;
      align-items: center;
      gap: var(--ds-card-actions-gap);
      flex: 0 0 auto;
      margin-inline-start: auto;
    }

    [data-part='body'] {
      display: block;
      min-inline-size: 0;
    }

    /* footerGap: layout.gap.tight, between footer actions */
    [data-part='footer'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-card-footer-gap);
    }

    [hidden] {
      display: none;
    }

    /*
     * interactive: position context for the slotted target's ::after. The card always reserves
     * border.width.focus so the ring never shifts the layout; at rest that border is the card's
     * border on surface default and transparent on subtle.
     */
    :host([interactive]) {
      position: relative;
    }
    :host([interactive]) [data-part='surface'] {
      border-width: var(--border-width-focus);
      border-color: var(--ds-card-border);
      transition:
        background-color var(--ds-card-transition) var(--motion-easing-standard),
        border-color var(--ds-card-transition) var(--motion-easing-standard);
    }
    :host([interactive][surface='subtle']) [data-part='surface'] {
      border-color: transparent;
    }
    /* Header actions and footer controls keep their own targets above the extended hit area. */
    :host([interactive]) [data-part='headerActions'],
    :host([interactive]) [data-part='footer'] {
      position: relative;
      z-index: 1;
    }

    /* hoverBackground: color.background.subtle, locked; subtle cards use color.background.strong. Only with a live target. */
    :host([interactive]:state(has-target):not(:state(target-disabled)):hover) [data-part='surface'] {
      background-color: var(--color-background-subtle);
    }
    :host([interactive][surface='subtle']:state(has-target):not(:state(target-disabled)):hover) [data-part='surface'] {
      background-color: var(--color-background-strong);
    }

    /* focusRing: locked; drawn on the card only while its target has keyboard focus */
    :host([interactive]:state(target-focus)) [data-part='surface'] {
      border-color: var(--color-border-focus);
    }

    /* focusable: scripted focus only; an outline of focusRingWidth in focusRing, no offset */
    :host([focusable]:not([interactive])) {
      outline: none;
    }
    :host([focusable]:not([interactive]):focus-visible) [data-part='surface'] {
      /* no outline-offset: the ring sits on the card's edge */
      outline: var(--border-width-focus) solid var(--color-border-focus);
    }

    @media (prefers-reduced-motion: reduce) {
      :host([interactive]) [data-part='surface'] {
        transition: none;
      }
    }
  `;

  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content; an empty string counts as omitted. */
  @property() accessor heading: string | undefined;

  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  @property({ type: String, reflect: true, attribute: 'heading-level' }) accessor headingLevel: CardHeadingLevel = '3';

  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  @property({ type: String, reflect: true }) accessor inset: CardInset = 'md';

  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  @property({ type: String, reflect: true }) accessor surface: CardSurface = 'default';

  /**
   * The whole card is one link or button target. Requires exactly one
   * interactive child (a Link or Button) at the top level of the body whose
   * action the card extends to its full area; the card itself is not focusable.
   */
  @property({ type: Boolean, reflect: true }) accessor interactive = false;

  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it
   * by script, and draws its own focus ring when focused that way. Not a tab
   * stop. With `interactive` also set, `interactive` wins and this is a no-op.
   */
  @property({ type: Boolean, reflect: true }) accessor focusable = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;

  @state() private accessor hasHeaderActions = false;
  @state() private accessor hasFooter = false;

  private readonly internals: ElementInternals;
  private hitAreaTarget: Element | null = null;
  private readonly targetObserver: MutationObserver = new MutationObserver(() => this.syncTargetDisabled());
  /** Host attributes this element wrote, so a consumer's own `role`/`aria-label`/`tabindex` is never removed. */
  private ownsRole = false;
  private ownsLabel = false;
  private ownsTabindex = false;
  private warnedTarget = false;
  private warnedFocusable = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Card');
    this.hasHeaderActions = this.querySelector(':scope > [slot="header-actions"]') !== null;
    this.hasFooter = this.querySelector(':scope > [slot="footer"]') !== null;
    if (this.hitAreaTarget !== null) {
      this.targetObserver.observe(this.hitAreaTarget, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.targetObserver.disconnect();
    this.setCustomState('target-focus', false);
  }

  protected override willUpdate(changed: PropertyValues): void {
    /* `surface` and `interactive` decide which overrides are in effect, so a change to either re-applies them. */
    if (changed.has('overrides') || changed.has('surface') || changed.has('interactive')) {
      this.applyOverrides();
    }
    if (changed.has('heading')) {
      this.syncName();
    }
    if (changed.has('focusable') || changed.has('interactive')) {
      this.syncTabindex();
    }
  }

  protected override render(): TemplateResult {
    const hasHeading = Boolean(this.heading);
    return html`
      <div part="surface" data-part="surface">
        <div part="header" data-part="header" ?hidden=${!hasHeading && !this.hasHeaderActions}>
          ${hasHeading
            ? html`<ds-heading level=${this.headingLevel} size="lg" .overrides=${HEADING_OVERRIDES}
                >${this.heading}</ds-heading
              >`
            : nothing}
          <div part="headerActions" data-part="headerActions" ?hidden=${!this.hasHeaderActions}>
            <slot name="header-actions" @slotchange=${this.handleHeaderActionsSlotChange}></slot>
          </div>
        </div>
        <div part="body" data-part="body">
          <slot @slotchange=${this.handleBodySlotChange}></slot>
        </div>
        <div part="footer" data-part="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
        </div>
      </div>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('interactive')) {
      // On the first update the body may still be filled in later; its slotchange re-checks and warns.
      this.syncHitArea(changed.get('interactive') !== undefined);
    }
  }

  private handleHeaderActionsSlotChange(event: Event): void {
    const next = (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
    if (this.hasHeaderActions !== next) this.hasHeaderActions = next;
  }

  private handleFooterSlotChange(event: Event): void {
    const next = (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
    if (this.hasFooter !== next) this.hasFooter = next;
  }

  private handleBodySlotChange(): void {
    this.syncHitArea(true);
  }

  /** Finds the single interactive child among the body's top-level elements and marks it as the card's extended hit area. */
  private syncHitArea(warn: boolean): void {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    const candidates = this.interactive && slot !== null
      ? slot.assignedElements({ flatten: true }).filter((element) => element.matches(HIT_AREA_SELECTOR))
      : [];
    const [target, ...rest] = candidates;
    const next = target !== undefined && rest.length === 0 ? target : null;
    if (this.hitAreaTarget !== next) {
      if (this.hitAreaTarget !== null) this.hitAreaTarget.classList.remove(HIT_AREA_CLASS);
      this.targetObserver.disconnect();
      this.hitAreaTarget = next;
      if (next !== null) {
        this.targetObserver.observe(next, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
      }
    }
    if (next !== null) {
      ensureHitAreaStyle(next.getRootNode());
      if (!next.classList.contains(HIT_AREA_CLASS)) next.classList.add(HIT_AREA_CLASS);
    } else {
      this.setCustomState('target-focus', false);
      if (this.interactive && warn && !this.warnedTarget && import.meta.env.DEV) {
        this.warnedTarget = true;
        console.warn(
          `<ds-card interactive> requires exactly one interactive child (a ds-link or ds-button) at the top level of the body; found ${candidates.length}. The card stays non-interactive.`,
        );
      }
    }
    this.setCustomState('has-target', next !== null);
    this.syncTargetDisabled();
  }

  private syncTargetDisabled(): void {
    this.setCustomState('target-disabled', this.hitAreaTarget !== null && isDisabled(this.hitAreaTarget));
  }

  private setCustomState(name: string, on: boolean): void {
    if (this.internals.states.has(name) === on) return;
    if (on) {
      this.internals.states.add(name);
    } else {
      this.internals.states.delete(name);
    }
  }

  /**
   * A click on the extended area lands on the target's own host box (its `::after`), not on the
   * native control inside a `ds-link`/`ds-button` shadow root, so it is forwarded to that control.
   */
  private readonly handleHostClick = (event: MouseEvent): void => {
    const target = this.hitAreaTarget;
    if (
      target === null ||
      !this.interactive ||
      isDisabled(target) ||
      event.composedPath()[0] !== target ||
      target.shadowRoot === null
    ) {
      return;
    }
    const control = target.shadowRoot.querySelector<HTMLElement>('a[href], button');
    control?.click();
  };

  /** The ring shows only while the target itself has keyboard focus, never for a header-actions or footer control. */
  private readonly handleFocusIn = (event: FocusEvent): void => {
    const target = this.hitAreaTarget;
    const path = event.composedPath();
    const focused = path[0];
    this.setCustomState(
      'target-focus',
      this.interactive && target !== null && path.includes(target) && focused instanceof Element && focused.matches(':focus-visible'),
    );
  };

  private readonly handleFocusOut = (): void => {
    this.setCustomState('target-focus', false);
  };

  /** `role="article"` named by `aria-label` when a heading is set; plain attributes so accessible-name tests see them. */
  private syncName(): void {
    if (this.heading) {
      if (!this.hasAttribute('role') || this.ownsRole) {
        if (this.getAttribute('role') !== 'article') this.setAttribute('role', 'article');
        this.ownsRole = true;
      }
      if (!this.hasAttribute('aria-label') || this.ownsLabel) {
        if (this.getAttribute('aria-label') !== this.heading) this.setAttribute('aria-label', this.heading);
        this.ownsLabel = true;
      }
    } else {
      if (this.ownsRole) {
        this.removeAttribute('role');
        this.ownsRole = false;
      }
      if (this.ownsLabel) {
        this.removeAttribute('aria-label');
        this.ownsLabel = false;
      }
    }
  }

  private syncTabindex(): void {
    if (this.focusable && this.interactive && !this.warnedFocusable && import.meta.env.DEV) {
      this.warnedFocusable = true;
      console.warn('<ds-card>: `focusable` has no effect with `interactive`; the card already has a target.');
    }
    if (this.focusable && !this.interactive) {
      if (this.getAttribute('tabindex') !== '-1') this.setAttribute('tabindex', '-1');
      this.ownsTabindex = true;
    } else if (this.ownsTabindex) {
      this.removeAttribute('tabindex');
      this.ownsTabindex = false;
    }
  }

  /**
   * Overrides change values, never presence. The border is drawn only on `surface="default"`,
   * an interactive card always reserves `border.width.focus` instead of its own width (so a
   * width override only reaches non-interactive cards), and the transition exists only for the
   * interactive hover. Those bindings are not in effect otherwise, so their overrides are no-ops.
   */
  private isInEffect(binding: CardOverridableBinding): boolean {
    switch (binding) {
      case 'border':
        return this.surface === 'default';
      case 'borderWidth':
        return this.surface === 'default' && !this.interactive;
      case 'transition':
        return this.interactive;
      default:
        return true;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CardOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined || !this.isInEffect(binding)) {
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
