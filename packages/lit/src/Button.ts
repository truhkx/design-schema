import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { trackPress } from './custom/analytics.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';
/** ARIA's own `aria-haspopup` values, without `true` (which means `menu`). */
export type ButtonHaspopup = 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';

/** Detail carried by the `press` CustomEvent (none). */
export type ButtonPressDetail = void;

/** Detail carried by the `track` CustomEvent. */
export interface ButtonTrackDetail {
  name: string;
  label: string;
}

/**
 * Overridable style hooks; see the `overrides` property. The accessibility-bearing
 * bindings — `background`, `backgroundHover`, `foreground`, `focusRing`,
 * `focusRingWidth`, `focusRingOffset`, `inverseForeground`, `inverseFocusRing`,
 * `minTarget` and `spinnerStroke` — are locked and excluded; of those, only `spinnerStroke` keeps
 * a CSS hook (`--ds-button-spinner-stroke`), the rest read their tokens directly.
 */
export type ButtonOverridableBinding =
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'inverseBackgroundHover'
  | 'inverseHoverOpacity'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin'
  | 'spinnerSize';

const HOOKS: Record<ButtonOverridableBinding, string> = {
  iconGap: '--ds-button-icon-gap',
  paddingInline: '--ds-button-padding-inline',
  paddingBlock: '--ds-button-padding-block',
  radius: '--ds-button-radius',
  fontFamily: '--ds-button-font-family',
  fontWeight: '--ds-button-font-weight',
  fontSize: '--ds-button-font-size',
  inverseBackgroundHover: '--ds-button-inverse-background-hover',
  inverseHoverOpacity: '--ds-button-inverse-hover-opacity',
  disabledOpacity: '--ds-button-disabled-opacity',
  transition: '--ds-button-transition',
  loadingSpin: '--ds-button-loading-spin',
  spinnerSize: '--ds-button-spinner-size',
};

/** copy.loading — announced as the button's description while `loading` is true. */
const COPY_LOADING = 'Loading';

/**
 * `<ds-button>` — Button (category: action, APG pattern: button).
 *
 * Wraps a native `<button>` in a shadow root created with `delegatesFocus`, so
 * focusing the host focuses the inner button. Activation dispatches a composed,
 * bubbling `press` CustomEvent. A `type="submit"` button submits the enclosing
 * `<ds-form>` (which listens for `press`) or, only when no `ds-form` encloses it,
 * calls `requestSubmit()` on the closest native `<form>`. When `track` is set, a
 * press also calls the hand-written `trackPress` analytics module and then fires
 * a composed `track` CustomEvent with `{ name, label }`.
 *
 * `ds-button` is deliberately *not* form-associated: a form-associated custom
 * element with a reflected `disabled` attribute becomes truly disabled and
 * unfocusable, and the doc requires a disabled button to stay in the tab order.
 * The disabled state is `aria-disabled` on the inner button instead.
 *
 * ## When to use
 *
 * Use a Button when the user needs to **do something**: submit, save, confirm,
 * open, add, delete. The label should be a verb or verb phrase that describes
 * the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view.
 * Use `secondary` for the alternatives beside it, `ghost` for low-emphasis
 * actions in dense UI such as toolbars, and `danger` only for destructive,
 * hard-to-undo actions. Navigation belongs to Link, never to Button.
 *
 * @fires press - Fired when the button is activated by pointer, keyboard
 *   (Enter/Space), or assistive technology. Not fired while `disabled` or `loading`.
 * @fires track - Fired after `press`, only when `track` is set, with `{ name, label }` in `detail`.
 * @slot leading-icon - Icon rendered before the label (anatomy: leadingIcon). Decorative.
 * @slot trailing-icon - Icon rendered after the label (anatomy: trailingIcon). Decorative.
 * @csspart container - The native `<button>` (anatomy: container).
 * @csspart label - The visible label text (anatomy: label).
 * @csspart leadingIcon - The leading-icon slot (anatomy: leadingIcon).
 * @csspart trailingIcon - The trailing-icon slot (anatomy: trailingIcon).
 */
@customElement('ds-button')
export class DsButton extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    /*
     * Hooks for the overridable bindings, plus spinnerStroke (locked, but its
     * binding keeps the hook). The other locked bindings (background,
     * backgroundHover, foreground, focusRing, focusRingWidth, focusRingOffset,
     * inverseForeground, inverseFocusRing, minTarget) have no hook: their rules
     * read the token.
     */
    :host {
      display: inline-flex;
      vertical-align: middle;
      --ds-button-icon-gap: var(--space-2);
      --ds-button-padding-inline: var(--space-md);
      --ds-button-padding-block: var(--space-sm);
      --ds-button-radius: var(--radius-md);
      --ds-button-font-family: var(--font-family-body);
      --ds-button-font-weight: var(--font-weight-medium);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-inverse-background-hover: var(--color-inverse-foreground);
      /* the base token; the rule that reads it multiplies by 0.25 */
      --ds-button-inverse-hover-opacity: var(--opacity-disabled);
      --ds-button-disabled-opacity: var(--opacity-disabled);
      --ds-button-transition: var(--motion-duration-fast);
      --ds-button-loading-spin: var(--motion-duration-loop);
      --ds-button-spinner-size: var(--font-size-md);
      --ds-button-spinner-stroke: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='container'] {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      /* minTarget: locked; the floor at every size (WCAG 2.5.8) */
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--ds-button-padding-block);
      padding-inline: var(--ds-button-padding-inline);
      border: 0;
      border-radius: var(--ds-button-radius);
      font-family: var(--ds-button-font-family);
      font-size: var(--ds-button-font-size);
      font-weight: var(--ds-button-font-weight);
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      /* transition: only the background animates, with motion.easing.standard */
      transition: background-color var(--ds-button-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='container'] {
        transition: none;
      }
    }

    /* paddingInline: space.{size}; fontSize and spinnerSize: font.size.{size} */
    :host([size='sm']) {
      --ds-button-padding-inline: var(--space-sm);
      --ds-button-font-size: var(--font-size-sm);
      --ds-button-spinner-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-button-padding-inline: var(--space-md);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-spinner-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-button-padding-inline: var(--space-lg);
      --ds-button-font-size: var(--font-size-lg);
      --ds-button-spinner-size: var(--font-size-lg);
    }

    /*
     * iconOnly: equal padding on all sides. paddingInline takes the resolved
     * paddingBlock, so a paddingBlock override keeps the sides equal and a
     * paddingInline override has no effect.
     */
    :host([icon-only]) [data-part='container'] {
      padding-inline: var(--ds-button-padding-block);
    }

    /* background / foreground: color.action.{variant}.*, locked (no hook) */
    :host([variant='primary']) [data-part='container'] {
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
    }
    :host([variant='secondary']) [data-part='container'] {
      color: var(--color-action-secondary-foreground);
      background: var(--color-action-secondary-background);
    }
    :host([variant='ghost']) [data-part='container'] {
      color: var(--color-action-ghost-foreground);
      background: var(--color-action-ghost-background);
    }
    :host([variant='danger']) [data-part='container'] {
      color: var(--color-action-danger-foreground);
      background: var(--color-action-danger-background);
    }

    /*
     * backgroundHover: color.action.{variant}.backgroundHover on pointer hover and
     * pressed, locked. Suppressed by selector while the button is not accepting a
     * press -- :not([aria-disabled='true']):not([aria-busy='true']), the same
     * suppression web writes, read off the inner button's own state attributes.
     */
    :host([variant='primary'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: var(--color-action-primary-background-hover);
    }
    :host([variant='secondary'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: var(--color-action-secondary-background-hover);
    }
    :host([variant='ghost'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: var(--color-action-ghost-background-hover);
    }
    :host([variant='danger'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: var(--color-action-danger-background-hover);
    }

    /*
     * inverse: only ghost changes on an inverse surface. Its text is
     * inverseForeground, and its hover fill is inverseBackgroundHover at
     * inverseHoverOpacity (the sanctioned color-mix of tokens). Other variants
     * keep their own fills.
     */
    :host([inverse][variant='ghost']) [data-part='container'] {
      color: var(--color-inverse-link);
    }
    :host([inverse][variant='ghost'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: color-mix(
        in srgb,
        var(--ds-button-inverse-background-hover) calc(var(--ds-button-inverse-hover-opacity) * 0.25 * 100%),
        transparent
      );
    }

    /*
     * focusRing / focusRingWidth / focusRingOffset: color.border.focus at
     * border.width.focus, offset by the same token so the ring clears the fill; locked
     */
    [data-part='container']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* inverseFocusRing: the ring must read against the inverse surface, for every variant */
    :host([inverse]) [data-part='container']:focus-visible {
      outline-color: var(--color-inverse-focus);
    }

    /* disabledOpacity: the whole button; colors are unchanged so the contrast math still holds */
    :host([disabled]) [data-part='container'] {
      opacity: var(--ds-button-disabled-opacity);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      /* iconGap: space.2 */
      gap: var(--ds-button-icon-gap);
    }

    :host([loading]) [data-part='container'] {
      cursor: progress;
    }

    /* loading: a ring spinnerSize across, spinnerStroke thick, one quarter transparent, in currentColor */
    .spinner {
      display: inline-block;
      box-sizing: border-box;
      inline-size: var(--ds-button-spinner-size);
      block-size: var(--ds-button-spinner-size);
      border: var(--ds-button-spinner-stroke) solid currentColor;
      /* the block-start quarter, so the turn reads as starting from twelve o'clock */
      border-block-start-color: transparent;
      border-radius: var(--radius-full);
      animation: ds-button-spin var(--ds-button-loading-spin) linear infinite;
    }
    @keyframes ds-button-spin {
      to {
        /* one full turn: a geometric constant, not a themed value */
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** The button's text. Also its accessible name. */
  @property({ type: String }) accessor label = '';

  /** Visual emphasis. One primary button per view. */
  @property({ type: String, reflect: true }) accessor variant: ButtonVariant = 'primary';

  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  @property({ type: String, reflect: true }) accessor size: ButtonSize = 'md';

  /** `submit` submits the enclosing Form. Everything else is `button`. */
  @property({ type: String, reflect: true }) accessor type: ButtonType = 'button';

  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel,
   * Disclosure): rendered as `aria-expanded` on the inner button. A JS property
   * only, and tri-state — `undefined` (the default) means this button discloses
   * nothing, so no `aria-expanded` is rendered at all. A raw `aria-expanded`
   * attribute on the host does not reach the inner button.
   */
  @property({ attribute: false }) accessor expanded: boolean | undefined;

  /**
   * Set by a parent whose popup the button opens (Menu's trigger takes `menu`):
   * rendered as `aria-haspopup` on the inner button, the element that carries the
   * button role. A JS property only, like `expanded`; `undefined` (the default)
   * means the button opens nothing and no `aria-haspopup` is written.
   */
  @property({ attribute: false }) accessor haspopup: ButtonHaspopup | undefined;

  /**
   * Prevents activation. The button stays in the tab order and is announced as
   * disabled. Inside a disabled `ds-form` the form sets this for you.
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /**
   * Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not
   * rendered either. `label` is still required and becomes the accessible name.
   * Padding becomes equal on all sides (`space.sm`).
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /**
   * Shows a ring spinner in the leading icon position, hides `trailingIcon`,
   * keeps the label visible and the height unchanged, and blocks repeat
   * activation while an action is pending. Without a `leadingIcon` the spinner
   * and iconGap widen the button. `copy.loading` is the description.
   */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost`
   * text and hover change, and the focus ring uses the inverse focus token for
   * every variant.
   */
  @property({ type: Boolean, reflect: true }) accessor inverse = false;

  /**
   * Overrides the accessible name when it must say more than the visible label
   * ("Sort by Amount, ascending" on a header that shows "Amount"). The name must
   * contain the visible label (WCAG 2.5.3 label-in-name). Maps to `aria-label`.
   */
  @property({ type: String, attribute: 'accessible-name' }) accessor accessibleName: string | undefined;

  /**
   * Text used for this button when a Toolbar collapses it into its overflow
   * Menu. Read by Toolbar from the host attribute; the button never renders it.
   */
  @property({ type: String, reflect: true, attribute: 'overflow-label' }) accessor overflowLabel:
    | string
    | undefined;

  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  @property({ type: String }) accessor track: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ButtonOverridableBinding, TokenRef | undefined>>
    | undefined;

  /**
   * Mirror of the host's own `tabindex`, forwarded to the inner `<button>`.
   *
   * `delegatesFocus` makes the host focusable, but it does not make the inner
   * button share the host's tabbability: a composer that writes `tabindex="-1"`
   * on a `<ds-button>` — a roving-focus parent such as `ds-toolbar`, or one that
   * keeps the control out of the tab order because the surrounding decoration is
   * `aria-hidden` (`ds-tree-grid`'s expand chevron, `ds-number-input`'s steppers)
   * — takes the *host* out of the tab order while the shadow `<button>` stays a
   * tab stop of its own. Forwarding the attribute is the only way a composer can
   * express that, since it cannot reach into this shadow root.
   *
   * `null` (no `tabindex` on the host) forwards nothing, so an ordinary button is
   * tabbable exactly as before, and `disabled` still leaves it in the tab order.
   */
  @state() private accessor hostTabIndex: string | null = null;

  /**
   * Watches the host's `tabindex` only. The callback writes to the inner button
   * through `hostTabIndex`, never back to the host, so it cannot re-enter.
   */
  private readonly tabIndexObserver: MutationObserver = new MutationObserver(() => this.readHostTabIndex());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Button');
    this.readHostTabIndex();
    this.tabIndexObserver.observe(this, { attributes: true, attributeFilter: ['tabindex'] });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.tabIndexObserver.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    return html`
      <button
        part="container"
        data-part="container"
        type=${this.type}
        tabindex=${ifDefined(this.hostTabIndex ?? undefined)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-expanded=${ifDefined(this.expanded === undefined ? undefined : String(this.expanded))}
        aria-haspopup=${ifDefined(this.haspopup)}
        aria-label=${ifDefined(this.accessibleName ?? (this.iconOnly ? this.label : undefined))}
        aria-describedby=${ifDefined(this.loading ? 'loading-description' : undefined)}
        @click=${this.handleClick}
      >
        <span class="content">
          ${this.loading
            ? html`<span class="spinner" aria-hidden="true"></span>`
            : html`<slot name="leading-icon" part="leadingIcon" data-part="leadingIcon"></slot>`}
          ${this.iconOnly
            ? // iconOnly removes the label part outright — no hidden node either, since the
              // name moves to aria-label, so a part selector targeting it finds nothing.
              nothing
            : html`<span class="label" part="label" data-part="label">${this.label}</span>`}
          ${this.iconOnly || this.loading
            ? nothing
            : html`<slot name="trailing-icon" part="trailingIcon" data-part="trailingIcon"></slot>`}
        </span>
        ${this.loading
          ? html`<span id="loading-description" class="visually-hidden" aria-hidden="true">${COPY_LOADING}</span>`
          : nothing}
      </button>
    `;
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      // aria-disabled keeps the button discoverable, so the activation has to be
      // swallowed here: no `press`, no native click leaking out, no submit.
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.dispatchEvent(new CustomEvent<ButtonPressDetail>('press', { bubbles: true, composed: true }));

    if (this.track) {
      // The analytics seam: a hand-written module the adopter owns, called once
      // per press, after `press` and before `track`.
      trackPress(this.track, this.label);
      this.dispatchEvent(
        new CustomEvent<ButtonTrackDetail>('track', {
          detail: { name: this.track, label: this.label },
          bubbles: true,
          composed: true,
        }),
      );
    }

    if (this.type === 'submit' && !this.closest('ds-form')) {
      // The inner <button> has no form owner (it lives in the shadow root), so a
      // native <form> is submitted explicitly. Inside a ds-form the form reacts
      // to `press` instead, so a ds-form nested in a native form submits once.
      this.closest('form')?.requestSubmit();
    }
  }

  private readHostTabIndex(): void {
    this.hostTabIndex = this.getAttribute('tabindex');
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ButtonOverridableBinding[]) {
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
    'ds-button': DsButton;
  }
}
