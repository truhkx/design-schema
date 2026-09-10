import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';

export type SwitchLabelPosition = 'start' | 'end';

/** Detail carried by the `change` CustomEvent. */
export interface SwitchChangeDetail {
  checked: boolean;
}

/**
 * `<ds-switch>` — Switch (category: input, APG pattern: switch).
 *
 * `<ds-switch label="Email notifications">`. A native
 * `<input type="checkbox" role="switch">` styled with `appearance: none` draws
 * the track and thumb in CSS and keeps label association, Space toggling and
 * form participation for free. The element is form-associated like
 * `ds-checkbox`: the native form value is `"on"` while checked and `null`
 * otherwise, while `<ds-form>` collects `currentValue` as a boolean. The inner
 * native `change` is not composed, so a composed `change` CustomEvent with
 * `{ checked }` is re-dispatched from the host. `checked` is not reflected: the
 * attribute is the initial state only. A switch never validates.
 *
 * ## When to use
 *
 * Use a Switch for a binary setting that applies as soon as it changes and can
 * be undone by flipping it back: notifications, dark mode, "show archived".
 * Use it in settings lists with `labelPosition: start` so labels line up and
 * switches sit at the row end. A choice that is only applied on Save is a
 * Checkbox.
 *
 * @fires change - Fired when the state changes with `{ checked }` in `detail`. The change is already in effect.
 * @csspart control - The native input drawn as the track (anatomy: track, thumb).
 * @csspart label - The `<label>`.
 * @csspart description - The helper text.
 */
@customElement('ds-switch')
export class DsSwitch extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    /* minTarget: the whole row toggles */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    /* labelPosition: flex order only */
    :host([label-position='start']) .text {
      order: 0;
      flex: 1 1 auto;
    }
    :host([label-position='start']) .control {
      order: 1;
    }
    :host([label-position='end']) .control {
      order: 0;
    }
    :host([label-position='end']) .text {
      order: 1;
    }

    /* track: trackWidth × trackHeight, radius.full */
    .control {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--space-10);
      block-size: var(--space-6);
      margin: 0;
      /* Center the track on the first line of the label. */
      margin-block-start: calc((var(--font-size-md) * var(--font-line-height-normal) - var(--space-6)) / 2);
      border: 0;
      border-radius: var(--radius-full);
      background: var(--color-control-track-off);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* thumb: thumbSize, inset by thumbInset, travels trackWidth − thumbSize − 2 × thumbInset */
    .control::after {
      content: '';
      position: absolute;
      inset-block-start: calc((var(--space-6) - var(--space-5)) / 2);
      inset-inline-start: var(--space-1);
      inline-size: var(--space-5);
      block-size: var(--space-5);
      border-radius: var(--radius-full);
      background: var(--color-control-selected-foreground);
      transition: transform var(--motion-duration-fast) var(--motion-easing-standard);
    }

    .control:checked {
      background: var(--color-control-selected-background);
    }
    .control:checked::after {
      transform: translateX(calc(var(--space-10) - var(--space-5) - 2 * var(--space-1)));
    }
    :host(:dir(rtl)) .control:checked::after {
      transform: translateX(calc(-1 * (var(--space-10) - var(--space-5) - 2 * var(--space-1))));
    }

    @media (prefers-reduced-motion: reduce) {
      .control,
      .control::after {
        transition: none;
      }
    }

    /* focusRing: drawn around the track, offset by focusRingWidth like every other control */
    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    :host([disabled]) .row {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }
    :host([disabled]) .control {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-inline-size: 0;
    }

    .label {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-regular);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .description {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-muted);
    }
  `;

  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  @property() label = '';

  /** Optional field name. When inside a Form the checked state is collected; most switches are not in forms. */
  @property() name = '';

  /** Controlled state. Omit for an uncontrolled control. The attribute is the initial state only; not reflected. */
  @property({ type: Boolean }) checked?: boolean;

  /** Initial state for an uncontrolled control. */
  @property({ type: Boolean, attribute: 'default-checked' }) defaultChecked = false;

  /** Cannot be toggled. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Persistent helper text below the label explaining the effect. */
  @property() description?: string;

  /** Where the label sits relative to the track. `start` is the settings-list convention. */
  @property({ reflect: true, attribute: 'label-position' }) labelPosition: SwitchLabelPosition = 'start';

  /** Uncontrolled checked state (seeded from `defaultChecked`). */
  @state() private internalChecked = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private formDisabled = false;

  @query('#control') private readonly inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  /** Whether the switch is currently on. */
  get currentChecked(): boolean {
    return this.checked ?? this.internalChecked;
  }

  /** The value the Form collects: the checked state as a boolean. */
  get currentValue(): boolean {
    return this.currentChecked;
  }

  /** A switch has no error state by design; the Form never validates it. */
  readonly required = false;

  /** Always valid: a switch has no error state by design. */
  checkValidity(): boolean {
    return true;
  }

  reportValidity(): boolean {
    return true;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.checked = undefined;
    this.internalChecked = this.defaultChecked;
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string') {
      this.checked = state === 'on';
    }
  }

  protected override willUpdate(): void {
    if (!this.hasUpdated) {
      this.internalChecked = this.defaultChecked;
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render() {
    const isDisabled = this.disabled || this.formDisabled;
    return html`
      <div class="row" @click=${this.handleRowClick}>
        <input
          id="control"
          class="control"
          part="control"
          type="checkbox"
          role="switch"
          name=${ifDefined(this.name || undefined)}
          .checked=${live(this.currentChecked)}
          aria-checked=${this.currentChecked ? 'true' : 'false'}
          aria-describedby=${ifDefined(this.description ? 'description' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          @click=${this.handleControlClick}
          @change=${this.handleChange}
        />
        <div class="text">
          <label class="label" part="label" for="control">${this.label}</label>
          ${this.description
            ? html`<p id="description" class="description" part="description">${this.description}</p>`
            : nothing}
        </div>
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private handleRowClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target === this.inputEl || target.closest('label') !== null || this.isDisabled) {
      return;
    }
    this.inputEl.click();
  }

  private handleControlClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private handleChange(event: Event): void {
    if (this.isDisabled) {
      event.preventDefault();
      this.requestUpdate();
      return;
    }
    const next = this.inputEl.checked;
    if (this.checked !== undefined) {
      this.checked = next;
    } else {
      this.internalChecked = next;
    }
    this.dispatchEvent(
      new CustomEvent<SwitchChangeDetail>('change', {
        detail: { checked: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Contribute "on" to an owning form only when the switch has a `name`. */
  private syncInternals(): void {
    if (this.name === '' || this.isDisabled) {
      this.internals.setFormValue(null);
      return;
    }
    this.internals.setFormValue(this.currentChecked ? 'on' : null);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-switch': DsSwitch;
  }
}
