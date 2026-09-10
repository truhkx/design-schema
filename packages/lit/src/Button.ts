import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

/** Detail carried by the `press` CustomEvent (none). */
export type ButtonPressDetail = void;

/**
 * `<ds-button>` — Button (category: action, APG pattern: button).
 *
 * Wraps a native `<button>` in a shadow root created with `delegatesFocus`, so
 * focusing the host focuses the inner button. Activation dispatches a composed,
 * bubbling `press` CustomEvent. A `type="submit"` button submits the enclosing
 * `<ds-form>` (which listens for `press`) or, when placed directly inside a
 * native `<form>`, calls `requestSubmit()` on it.
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
 * @slot leading-icon - Icon rendered before the label (anatomy: leadingIcon).
 * @slot trailing-icon - Icon rendered after the label (anatomy: trailingIcon).
 * @csspart button - The native `<button>` (anatomy: container).
 * @csspart label - The visible label text.
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
      gap: var(--space-sm);
      inline-size: 100%;
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--space-sm);
      padding-inline: var(--space-md);
      border: 0;
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
    }

    /* paddingInline: space.{size} */
    :host([size='sm']) button {
      padding-inline: var(--space-sm);
    }
    :host([size='md']) button {
      padding-inline: var(--space-md);
    }
    :host([size='lg']) button {
      padding-inline: var(--space-lg);
    }

    /* background / foreground: color.action.{variant}.* */
    :host([variant='primary']) button {
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
    }
    :host([variant='secondary']) button {
      color: var(--color-action-secondary-foreground);
      background: var(--color-action-secondary-background);
    }
    :host([variant='ghost']) button {
      color: var(--color-action-ghost-foreground);
      background: var(--color-action-ghost-background);
    }
    :host([variant='danger']) button {
      color: var(--color-action-danger-foreground);
      background: var(--color-action-danger-background);
    }

    /* backgroundHover: pointer hover and pressed state (not while disabled or loading) */
    :host(:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--color-action-primary-background-hover);
    }
    :host([variant='secondary']:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--color-action-secondary-background-hover);
    }
    :host([variant='ghost']:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--color-action-ghost-background-hover);
    }
    :host([variant='danger']:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--color-action-danger-background-hover);
    }

    /* focus-visible: color.border.focus at border.width.focus */
    button:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabledOpacity: applied to the whole button; colors are unchanged */
    :host([disabled]) button {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
    }

    /* iconOnly: hide the visible label; the accessible name moves to aria-label */
    :host([icon-only]) .label {
      display: none;
    }
    :host([icon-only]) button {
      padding-inline: var(--space-sm);
    }

    /* loading: keep the footprint, hide the content, show progress */
    :host([loading]) button {
      cursor: progress;
    }
    :host([loading]) .content {
      visibility: hidden;
    }
    .spinner {
      position: absolute;
      inset: 0;
      margin: auto;
      box-sizing: border-box;
      inline-size: 1em;
      block-size: 1em;
      border: var(--border-width-focus) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--radius-full);
      animation: ds-button-spin var(--motion-duration-loop) linear infinite;
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

  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Hides the visible label and shows only the icon. `label` is still required and becomes the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) iconOnly = false;

  /** Shows progress and blocks repeat activation while an action is pending. */
  @property({ type: Boolean, reflect: true }) loading = false;

  protected override render() {
    return html`
      <button
        part="button"
        type=${this.type}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-label=${ifDefined(this.iconOnly ? this.label : undefined)}
        @click=${this.handleClick}
      >
        <span class="content">
          <slot name="leading-icon"></slot>
          <span class="label" part="label">${this.label}</span>
          <slot name="trailing-icon"></slot>
        </span>
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : nothing}
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

    if (this.type === 'submit') {
      // The inner <button> has no form owner (it lives in the shadow root), so a
      // directly enclosing native <form> is submitted explicitly. Inside a
      // <ds-form> this is null and the form reacts to the `press` event instead.
      const form = this.closest('form');
      form?.requestSubmit();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-button': DsButton;
  }
}
