import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type SwitchLabelPosition = 'start' | 'end';

/** Detail carried by the `change` CustomEvent. */
export interface SwitchChangeDetail {
  checked: boolean;
}

/** Overridable style hooks; see the `overrides` property. `trackOff`, `trackOn`, `thumb`, `labelColor`, `descriptionText`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type SwitchOverridableBinding =
  | 'trackWidth'
  | 'trackHeight'
  | 'thumbSize'
  | 'thumbInset'
  | 'radius'
  | 'gap'
  | 'partGap'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<SwitchOverridableBinding, string> = {
  trackWidth: '--ds-switch-track-width',
  trackHeight: '--ds-switch-track-height',
  thumbSize: '--ds-switch-thumb-size',
  thumbInset: '--ds-switch-thumb-inset',
  radius: '--ds-switch-radius',
  gap: '--ds-switch-gap',
  partGap: '--ds-switch-part-gap',
  labelSize: '--ds-switch-label-size',
  labelWeight: '--ds-switch-label-weight',
  helperSize: '--ds-switch-helper-size',
  fontFamily: `--ds-switch-font-family`,
  lineHeight: '--ds-switch-line-height',
  disabledOpacity: '--ds-switch-disabled-opacity',
  transition: '--ds-switch-transition',
};

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

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--ds-switch-font-family);
      --ds-switch-track-width: var(--space-10);
      --ds-switch-track-height: var(--space-6);
      --ds-switch-thumb-size: var(--space-5);
      --ds-switch-thumb-inset: var(--space-1);
      --ds-switch-radius: var(--radius-full);
      --ds-switch-gap: var(--space-3);
      --ds-switch-part-gap: var(--space-1);
      --ds-switch-label-size: var(--font-size-md);
      --ds-switch-label-weight: var(--font-weight-regular);
      --ds-switch-helper-size: var(--font-size-sm);
      --ds-switch-font-family: var(--font-family-body);
      --ds-switch-line-height: var(--font-line-height-normal);
      --ds-switch-disabled-opacity: var(--opacity-disabled);
      --ds-switch-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* minTarget: the whole row toggles */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-switch-gap);
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

    /* track: trackWidth × trackHeight, radius */
    .control {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--ds-switch-track-width);
      block-size: var(--ds-switch-track-height);
      margin: 0;
      /* Center the track on the first line of the label. */
      margin-block-start: calc(
        (var(--ds-switch-label-size) * var(--ds-switch-line-height) - var(--ds-switch-track-height)) / 2
      );
      border: 0;
      border-radius: var(--ds-switch-radius);
      background: var(--color-control-track-off);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--ds-switch-transition) var(--motion-easing-standard);
    }

    /* thumb: thumbSize, inset by thumbInset, travels trackWidth − thumbSize − 2 × thumbInset */
    .control::after {
      content: '';
      position: absolute;
      inset-block-start: calc((var(--ds-switch-track-height) - var(--ds-switch-thumb-size)) / 2);
      inset-inline-start: var(--ds-switch-thumb-inset);
      inline-size: var(--ds-switch-thumb-size);
      block-size: var(--ds-switch-thumb-size);
      border-radius: var(--ds-switch-radius);
      background: var(--color-control-selected-foreground);
      transition: transform var(--ds-switch-transition) var(--motion-easing-standard);
    }

    .control:checked {
      background: var(--color-control-selected-background);
    }
    .control:checked::after {
      transform: translateX(
        calc(var(--ds-switch-track-width) - var(--ds-switch-thumb-size) - 2 * var(--ds-switch-thumb-inset))
      );
    }
    :host(:dir(rtl)) .control:checked::after {
      transform: translateX(
        calc(-1 * (var(--ds-switch-track-width) - var(--ds-switch-thumb-size) - 2 * var(--ds-switch-thumb-inset)))
      );
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
      opacity: var(--ds-switch-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) .control {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-switch-part-gap);
      min-inline-size: 0;
    }

    .label {
      font-size: var(--ds-switch-label-size);
      font-weight: var(--ds-switch-label-weight);
      line-height: var(--ds-switch-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .description {
      margin: 0;
      font-size: var(--ds-switch-helper-size);
      line-height: var(--ds-switch-line-height);
      color: var(--color-foreground-muted);
    }
  `;

  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  @property() accessor label = '';

  /** Optional field name. When inside a Form the checked state is collected; most switches are not in forms. */
  @property() accessor name = '';

  /** Controlled state. Omit for an uncontrolled control. The attribute is the initial state only; not reflected. */
  @property({ type: Boolean }) accessor checked: boolean | undefined;

  /** Initial state for an uncontrolled control. */
  @property({ type: Boolean, attribute: 'default-checked' }) accessor defaultChecked = false;

  /** Cannot be toggled. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Persistent helper text below the label explaining the effect. */
  @property() accessor description: string | undefined;

  /** Where the label sits relative to the track. `start` is the settings-list convention. */
  @property({ reflect: true, attribute: 'label-position' }) accessor labelPosition: SwitchLabelPosition = 'start';

  /** Per-instance style overrides: `{ trackWidth: 'space.12' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<SwitchOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled checked state (seeded from `defaultChecked`). */
  @state() private accessor internalChecked = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#control') private accessor inputEl!: HTMLInputElement;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Switch');
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

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!this.hasUpdated) {
      this.internalChecked = this.defaultChecked;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncInternals();
  }

  protected override render(): TemplateResult {
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

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SwitchOverridableBinding[]) {
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
    'ds-switch': DsSwitch;
  }
}
