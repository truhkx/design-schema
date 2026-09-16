import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { trackPress } from './custom/analytics.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

/** Detail carried by the `press` CustomEvent (none). */
export type ButtonPressDetail = void;

/** Detail carried by the `track` CustomEvent. */
export interface ButtonTrackDetail {
  name: string;
  label: string;
}

/**
 * Overridable style hooks; see the `overrides` property. The accessibility-bearing
 * bindings — `background`, `foreground`, `focusRing`, `focusRingWidth`,
 * `inverseForeground`, `inverseFocusRing`, `minTarget` and `spinnerStroke` — are
 * locked and excluded.
 */
export type ButtonOverridableBinding =
  | 'backgroundHover'
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin';

const HOOKS: Record<ButtonOverridableBinding, string> = {
  backgroundHover: '--ds-button-background-hover',
  iconGap: '--ds-button-icon-gap',
  paddingInline: '--ds-button-padding-inline',
  paddingBlock: '--ds-button-padding-block',
  radius: '--ds-button-radius',
  fontFamily: '--ds-button-font-family',
  fontWeight: '--ds-button-font-weight',
  fontSize: '--ds-button-font-size',
  disabledOpacity: '--ds-button-disabled-opacity',
  transition: '--ds-button-transition',
  loadingSpin: '--ds-button-loading-spin',
};

/** copy.loading — announced beside the label while `loading` is true. */
const COPY_LOADING = 'Loading';

/**
 * `<ds-button>` — Button (category: action, APG pattern: button).
 *
 * Wraps a native `<button>` in a shadow root created with `delegatesFocus`, so
 * focusing the host focuses the inner button. Activation dispatches a composed,
 * bubbling `press` CustomEvent. A `type="submit"` button submits the enclosing
 * `<ds-form>` (which listens for `press`) or, when placed directly inside a
 * native `<form>`, calls `requestSubmit()` on it. When `track` is set, a press
 * also calls the hand-written `trackPress` analytics module and then fires a
 * composed `track` CustomEvent with `{ name, label }`.
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
    :host {
      display: inline-flex;
      vertical-align: middle;
      --ds-button-background-hover: var(--color-action-primary-background-hover);
      --ds-button-icon-gap: var(--space-2);
      --ds-button-padding-inline: var(--space-md);
      --ds-button-padding-block: var(--space-sm);
      --ds-button-radius: var(--radius-md);
      --ds-button-font-family: var(--font-family-body);
      --ds-button-font-weight: var(--font-weight-medium);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-disabled-opacity: var(--opacity-disabled);
      --ds-button-transition: var(--motion-duration-fast);
      --ds-button-loading-spin: var(--motion-duration-loop);
    }

    :host([hidden]) {
      display: none;
    }

    button {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      /* minTarget: locked — 24px CSS minimum at every size (WCAG 2.5.8) */
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
      /* transition: motion.duration.fast with motion.easing.standard */
      transition:
        background-color var(--ds-button-transition) var(--motion-easing-standard),
        color var(--ds-button-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
    }

    /* paddingInline: space.{size} */
    :host([size='sm']) {
      --ds-button-padding-inline: var(--space-sm);
    }
    :host([size='md']) {
      --ds-button-padding-inline: var(--space-md);
    }
    :host([size='lg']) {
      --ds-button-padding-inline: var(--space-lg);
    }

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-button-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-button-font-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-button-font-size: var(--font-size-lg);
    }

    /* iconOnly: equal padding on all sides (space.sm), regardless of size */
    :host([icon-only]) {
      --ds-button-padding-inline: var(--space-sm);
      --ds-button-padding-block: var(--space-sm);
    }

    /* background / foreground: color.action.{variant}.*, locked */
    :host([variant='primary']) button {
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
    }
    :host([variant='primary']) {
      --ds-button-background-hover: var(--color-action-primary-background-hover);
    }
    :host([variant='secondary']) button {
      color: var(--color-action-secondary-foreground);
      background: var(--color-action-secondary-background);
    }
    :host([variant='secondary']) {
      --ds-button-background-hover: var(--color-action-secondary-background-hover);
    }
    :host([variant='ghost']) button {
      color: var(--color-action-ghost-foreground);
      background: var(--color-action-ghost-background);
    }
    :host([variant='ghost']) {
      --ds-button-background-hover: var(--color-action-ghost-background-hover);
    }
    :host([variant='danger']) button {
      color: var(--color-action-danger-foreground);
      background: var(--color-action-danger-background);
    }
    :host([variant='danger']) {
      --ds-button-background-hover: var(--color-action-danger-background-hover);
    }

    /* backgroundHover: pointer hover and pressed state */
    :host(:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--ds-button-background-hover);
    }

    /*
     * inverse: only the ghost variant changes its fill on an inverse surface
     * (Toast, Tooltip-like panels) — the sanctioned color-mix of two tokens.
     * Other variants keep their own fills.
     */
    :host([inverse][variant='ghost']) button {
      color: var(--color-inverse-link);
    }
    :host([inverse][variant='ghost']:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent);
    }

    /* focus-visible: color.border.focus at border.width.focus, locked */
    button:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* inverseFocusRing: the ring must read against the inverse surface, for every variant */
    :host([inverse]) button:focus-visible {
      outline-color: var(--color-inverse-focus);
    }

    /* disabledOpacity: applied to the whole button; colors are unchanged so the contrast math still holds */
    :host([disabled]) button {
      opacity: var(--ds-button-disabled-opacity);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      /* iconGap: space.2 */
      gap: var(--ds-button-icon-gap);
    }

    /* iconOnly: hide the visible label; the accessible name moves to aria-label */
    :host([icon-only]) .label {
      display: none;
    }

    /*
     * loading: the spinner takes the leading-icon spot (replacing the sole glyph
     * when iconOnly), the trailing icon hides, and the label stays visible, so the
     * layout does not shift.
     */
    :host([loading]) button {
      cursor: progress;
    }
    :host([loading]) slot[name='leading-icon'],
    :host([loading]) slot[name='trailing-icon'] {
      display: none;
    }
    .spinner {
      display: none;
      box-sizing: border-box;
      inline-size: 1em;
      block-size: 1em;
      /* spinnerStroke: border.width.focus, locked */
      border: var(--border-width-focus) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--radius-full);
      animation: ds-button-spin var(--ds-button-loading-spin) linear infinite;
    }
    :host([loading]) .spinner {
      display: inline-block;
    }
    @keyframes ds-button-spin {
      to {
        transform: rotate(1turn);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }

    /* visually-hidden: clipped off-screen but still part of the accessible name */
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
   * nothing, so no `aria-expanded` is rendered at all. Consumers rarely set it
   * directly; a raw `aria-expanded` attribute on the host does not reach the
   * inner button.
   */
  @property({ type: Boolean, attribute: false }) accessor expanded: boolean | undefined;

  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /**
   * Hides the visible label and shows only `leadingIcon`. `label` is still
   * required and becomes the accessible name. Padding becomes equal on all sides.
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /**
   * Shows a 1em ring spinner in `currentColor` in the leading icon slot, hides
   * `trailingIcon`, keeps the label visible and the layout unchanged, and blocks
   * repeat activation while an action is pending.
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
   * ("Sort by Amount, ascending" on a header that shows "Amount"). The visible
   * label must be part of it (WCAG 2.5.3 label-in-name). Maps to `aria-label`.
   */
  @property({ type: String, attribute: 'accessible-name' }) accessor accessibleName: string | undefined;

  /**
   * Text used for this button when a Toolbar collapses it into its overflow
   * Menu. Read by Toolbar only; it has no effect on the button's own rendering.
   */
  @property({ type: String, attribute: 'overflow-label' }) accessor overflowLabel: string | undefined;

  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  @property({ type: String }) accessor track: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<ButtonOverridableBinding, TokenRef | undefined>>
    | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Button');
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
        type=${this.type}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-expanded=${ifDefined(this.expanded === undefined ? undefined : String(this.expanded))}
        aria-label=${ifDefined(this.accessibleName ?? (this.iconOnly ? this.label : undefined))}
        @click=${this.handleClick}
      >
        <span class="content">
          <span class="spinner" aria-hidden="true"></span>
          <slot name="leading-icon" part="leadingIcon"></slot>
          <span class="label" part="label">${this.label}</span>
          <slot name="trailing-icon" part="trailingIcon"></slot>
          ${this.loading ? html`<span class="visually-hidden">${COPY_LOADING}</span>` : nothing}
        </span>
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

    if (this.type === 'submit') {
      // The inner <button> has no form owner (it lives in the shadow root), so a
      // directly enclosing native <form> is submitted explicitly. Inside a
      // <ds-form> this is null and the form reacts to the `press` event instead.
      const form = this.closest('form');
      form?.requestSubmit();
    }
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
