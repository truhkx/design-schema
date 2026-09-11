import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
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

/** Overridable style hooks; see the `overrides` property. `background`, `foreground`, `focusRing`, `focusRingWidth`, `inverseForeground`, `inverseFocusRing` and `minTarget` are locked and excluded. */
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
  | 'loadingSpin'
  | 'spinnerStroke';

const HOOKS: Record<ButtonOverridableBinding, string> = {
  backgroundHover: '--ds-button-background-hover',
  iconGap: '--ds-button-icon-gap',
  paddingInline: '--ds-button-padding-inline',
  paddingBlock: '--ds-button-padding-block',
  radius: '--ds-button-radius',
  fontFamily: `--ds-button-font-family`,
  fontWeight: '--ds-button-font-weight',
  fontSize: '--ds-button-font-size',
  disabledOpacity: '--ds-button-disabled-opacity',
  transition: '--ds-button-transition',
  loadingSpin: '--ds-button-loading-spin',
  spinnerStroke: '--ds-button-spinner-stroke',
};

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
 * ## When to use
 *
 * Use a Button when the user needs to **do something**: submit, save, confirm,
 * open, add, delete. The label should be a verb or verb phrase that describes
 * the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view.
 * Use `secondary` for the alternatives beside it, `ghost` for low-emphasis
 * actions in dense UI such as toolbars, and `danger` only for destructive,
 * hard-to-undo actions.
 *
 * @fires press - Fired when the button is activated by pointer, keyboard
 *   (Enter/Space), or assistive technology. Not fired while `disabled` or `loading`.
 * @fires track - Fired after `press`, only when `track` is set, with `{ name, label }` in `detail`.
 * @slot leading-icon - Icon rendered before the label (anatomy: leadingIcon).
 * @slot trailing-icon - Icon rendered after the label (anatomy: trailingIcon).
 * @csspart container - The native `<button>` (anatomy: container).
 * @csspart label - The visible label text.
 * @csspart leading-icon - The leading-icon slot (anatomy: leadingIcon).
 * @csspart trailing-icon - The trailing-icon slot (anatomy: trailingIcon).
 */
@customElement('ds-button')
export class DsButton extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
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
      --ds-button-spinner-stroke: var(--border-width-focus);
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

    /* inverse: only ghost is meaningful on inverse surfaces (Toast, Tooltip-like panels); locked tokens */
    :host([variant='ghost']) button.inverse {
      color: var(--color-inverse-link);
    }
    :host([variant='ghost']:not([disabled]):not([loading])) button.inverse:is(:hover, :active) {
      background: color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent);
    }
    button.inverse:focus-visible {
      outline-color: var(--color-inverse-focus);
    }

    /* focus-visible: color.border.focus at border.width.focus, locked */
    button:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabledOpacity: applied to the whole button; colors are unchanged */
    :host([disabled]) button {
      opacity: var(--ds-button-disabled-opacity);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-button-icon-gap);
    }

    /* iconOnly: hide the visible label; the accessible name moves to aria-label */
    :host([icon-only]) .label {
      display: none;
    }

    /* loading: spinner takes the leading-icon spot, trailing icon hides, label stays visible */
    :host([loading]) button {
      cursor: progress;
    }
    :host([loading]) slot[name='leading-icon'] {
      display: none;
    }
    :host([loading]) slot[name='trailing-icon'] {
      display: none;
    }
    .spinner {
      display: none;
      box-sizing: border-box;
      inline-size: 1em;
      block-size: 1em;
      border: var(--ds-button-spinner-stroke) solid currentColor;
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
  `;

  /** The button's text. Also its accessible name. */
  @property() label = '';

  /** Visual emphasis. One primary button per view. */
  @property({ reflect: true }) variant: ButtonVariant = 'primary';

  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  @property({ reflect: true }) size: ButtonSize = 'md';

  /** `submit` submits the enclosing Form. Everything else is `button`. */
  @property({ reflect: true }) type: ButtonType = 'button';

  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel,
   * Disclosure): reflected to the inner button's `aria-expanded`. `undefined`
   * (the default) means this button does not disclose anything, so no
   * `aria-expanded` is rendered. Consumers rarely set it directly.
   */
  @property({ type: Boolean, attribute: false }) expanded?: boolean;

  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Hides the visible label and shows only the icon. `label` is still required and becomes the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) iconOnly = false;

  /** Shows progress and blocks repeat activation while an action is pending. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** The button sits on an inverse surface (Toast, Tooltip-like panels). Only meaningful on `ghost`. */
  @property({ type: Boolean, reflect: true }) inverse = false;

  /**
   * Overrides the accessible name when it must say more than the visible label
   * ("Sort by Amount, ascending" on a header that shows "Amount"). The visible
   * label must be the start of it. Maps to `aria-label`.
   */
  @property({ attribute: 'accessible-name' }) accessibleName?: string;

  /** Text used for this button when a Toolbar collapses it into its overflow Menu. */
  @property({ attribute: 'overflow-label' }) overflowLabel?: string;

  /** Analytics event name sent on press. Omit for no tracking. */
  @property() track?: string;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<ButtonOverridableBinding, TokenRef>>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Button');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render() {
    return html`
      <button
        part="container"
        class=${classMap({ inverse: this.inverse })}
        type=${this.type}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-expanded=${ifDefined(this.expanded === undefined ? undefined : String(this.expanded))}
        aria-label=${ifDefined(this.accessibleName ?? (this.iconOnly ? this.label : undefined))}
        @click=${this.handleClick}
      >
        <span class="content">
          <span class="spinner" part="leading-icon" aria-hidden="true"></span>
          <slot name="leading-icon" part="leading-icon"></slot>
          <span class="label" part="label">${this.label}</span>
          <slot name="trailing-icon" part="trailing-icon"></slot>
        </span>
      </button>
    `;
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      // aria-disabled keeps the button discoverable, so we have to swallow the
      // activation ourselves: no `press`, no native click leaking out, no submit.
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent<ButtonPressDetail>('press', { bubbles: true, composed: true }),
    );

    if (this.track) {
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
