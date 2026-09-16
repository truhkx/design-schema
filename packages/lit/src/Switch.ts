import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { TextOverridableBinding } from './Text.js';
import './Text.js';

export type SwitchLabelPosition = 'start' | 'end';

/** Detail carried by the `change` CustomEvent. */
export interface SwitchChangeDetail {
  /** The new state. */
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
  fontFamily: '--ds-switch-font-family',
  lineHeight: '--ds-switch-line-height',
  disabledOpacity: '--ds-switch-disabled-opacity',
  transition: '--ds-switch-transition',
};

/**
 * `<ds-switch>` — Switch (category: input, APG pattern: switch).
 *
 * `<ds-switch label="Email notifications">`. A native
 * `<input type="checkbox" role="switch">` styled with `appearance: none` is the
 * track (with `delegatesFocus`), and keeps label association and Space toggling
 * for free; the thumb is a sibling span laid over it. The `<label for>` sits in
 * the same root, so a click on it toggles natively; a click on the description
 * or the row's empty space is forwarded to the control, so the whole row toggles.
 *
 * The element is form-associated like `ds-checkbox`: the native form value is
 * `"on"` while checked and `null` otherwise, while `<ds-form>` discovers it by
 * `data-ds-field` and collects `currentValue` as a boolean. A switch never
 * validates. The inner native `change` is not composed, so a composed `change`
 * CustomEvent with `{ checked }` is re-dispatched from the host. `checked`
 * behaves like a native input: the attribute is the initial state only and the
 * property is the live state, so it is not reflected.
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

    /* labelPosition: flex order only; start puts the switch at the row end */
    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-switch-part-gap);
      min-inline-size: 0;
      flex: 1 1 auto;
      order: 0;
    }
    .switch {
      order: 1;
    }
    :host([label-position='end']) .switch {
      order: 0;
    }
    :host([label-position='end']) .text {
      order: 1;
    }

    /* Holds the track and its thumb; centered on the label's first line. */
    .switch {
      position: relative;
      display: inline-flex;
      flex: none;
      margin-block-start: calc(
        (var(--ds-switch-label-size) * var(--ds-switch-line-height) - var(--ds-switch-track-height)) / 2
      );
    }

    /* track: trackWidth × trackHeight, radius, trackOff / trackOn */
    .track {
      box-sizing: border-box;
      inline-size: var(--ds-switch-track-width);
      block-size: var(--ds-switch-track-height);
      margin: 0;
      border: 0;
      border-radius: var(--ds-switch-radius);
      background: var(--color-control-track-off);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--ds-switch-transition) var(--motion-easing-standard);
    }
    .track:checked {
      background: var(--color-control-selected-background);
    }

    /* focusRing: drawn around the track, offset by focusRingWidth like every other control */
    .track:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* thumb: thumbSize, inset by thumbInset, travels trackWidth − thumbSize − 2 × thumbInset */
    .thumb {
      position: absolute;
      inset-block-start: calc((var(--ds-switch-track-height) - var(--ds-switch-thumb-size)) / 2);
      inset-inline-start: var(--ds-switch-thumb-inset);
      inline-size: var(--ds-switch-thumb-size);
      block-size: var(--ds-switch-thumb-size);
      border-radius: var(--ds-switch-radius);
      background: var(--color-control-selected-foreground);
      pointer-events: none;
      transition: transform var(--ds-switch-transition) var(--motion-easing-standard);
    }
    .track:checked + .thumb {
      transform: translateX(
        calc(var(--ds-switch-track-width) - var(--ds-switch-thumb-size) - 2 * var(--ds-switch-thumb-inset))
      );
    }
    :host(:dir(rtl)) .track:checked + .thumb {
      transform: translateX(
        calc(-1 * (var(--ds-switch-track-width) - var(--ds-switch-thumb-size) - 2 * var(--ds-switch-thumb-inset)))
      );
    }

    /* transition: travel is instant under reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .track,
      .thumb {
        transition: none;
      }
    }

    /* disabled: stays focusable; dimmed with disabledOpacity */
    :host([disabled]) .row {
      opacity: var(--ds-switch-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) .track,
    :host([disabled]) .label {
      cursor: not-allowed;
    }

    .label {
      font-size: var(--ds-switch-label-size);
      font-weight: var(--ds-switch-label-weight);
      line-height: var(--ds-switch-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }
  `;

  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  @property() accessor label = '';

  /** Optional field name. When inside a Form the state is collected as a boolean; most switches are not in forms. */
  @property() accessor name = '';

  /** Initial state when neither the `checked` attribute nor property is set. */
  @property({ type: Boolean, attribute: 'default-checked' }) accessor defaultChecked = false;

  /** Cannot be toggled. Stays visible, readable and focusable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Persistent helper text below the label explaining the effect. */
  @property() accessor description: string | undefined;

  /** Where the label sits relative to the track. `start` is the settings-list convention; `end` matches Checkbox. */
  @property({ reflect: true, attribute: 'label-position' }) accessor labelPosition: SwitchLabelPosition = 'start';

  /** Per-instance style overrides: `{ trackWidth: 'space.12' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SwitchOverridableBinding, TokenRef | undefined>>
    | undefined;

  private checkedValue: boolean | undefined;

  /** The live state, like a native input. The attribute is the initial state only; not reflected. */
  get checked(): boolean {
    return this.checkedValue ?? this.defaultChecked;
  }
  @property({ type: Boolean })
  set checked(value: boolean) {
    const old = this.checked;
    this.checkedValue = value;
    this.requestUpdate('checked', old);
  }

  /** A switch has no required state: it never validates and never appears in an error summary. */
  readonly required: boolean = false;

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#track') private accessor inputEl!: HTMLInputElement | null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Switch');
    this.setAttribute('data-ds-field', '');
  }

  /** The value `<ds-form>` collects: the state as a boolean. */
  get currentValue(): boolean {
    return this.checked;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  /** Always empty: a switch has no error state by design. */
  get validationMessage(): string {
    return '';
  }

  /** Always valid: a switch has no error state by design. */
  checkValidity(): boolean {
    return true;
  }

  reportValidity(): boolean {
    return true;
  }

  /* Form-associated custom element callbacks (invoked by the browser). */

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    const old = this.checked;
    this.checkedValue = undefined;
    this.requestUpdate('checked', old);
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    this.checked = state === 'on';
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.internals.setFormValue(this.checked && !this.isDisabled ? 'on' : null);
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    return html`
      <div class="row" @click=${this.handleRowClick}>
        <span class="switch">
          <input
            id="track"
            class="track"
            part="track"
            data-part="track"
            type="checkbox"
            role="switch"
            name=${ifDefined(this.name || undefined)}
            .checked=${live(this.checked)}
            aria-checked=${this.checked ? 'true' : 'false'}
            aria-describedby=${ifDefined(this.description ? 'description' : undefined)}
            aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
            @click=${this.handleControlClick}
            @change=${this.handleChange}
          />
          <span class="thumb" part="thumb" data-part="thumb" aria-hidden="true"></span>
        </span>
        <div class="text">
          <label class="label" part="label" data-part="label" for="track">${this.label}</label>
          ${this.description
            ? html`<ds-text
                id="description"
                part="description"
                data-part="description"
                element="p"
                size="sm"
                tone="muted"
                .overrides=${this.textOverrides}
                >${this.description}</ds-text
              >`
            : nothing}
        </div>
      </div>
    `;
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** helperSize, fontFamily and lineHeight forwarded to the description Text. */
  private get textOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const o = this.overrides;
    if (!o) {
      return undefined;
    }
    return { fontSize: o.helperSize, fontFamily: o.fontFamily, lineHeight: o.lineHeight };
  }

  /** Clicks on the description (or the row's empty space) toggle the switch too. */
  private handleRowClick(event: MouseEvent): void {
    const input = this.inputEl;
    const target = event.target;
    if (!input || !(target instanceof Element)) {
      return;
    }
    // The input handles itself, and a label click is already forwarded to it natively.
    if (target === input || target.closest('label') !== null || this.isDisabled) {
      return;
    }
    input.focus();
    input.click();
  }

  /** Disabled uses aria-disabled so the switch stays focusable; click and change are both guarded. */
  private handleControlClick(event: MouseEvent): void {
    if (this.isDisabled) {
      event.preventDefault();
    }
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    if (this.isDisabled) {
      event.preventDefault();
      input.checked = this.checked;
      return;
    }
    const next = input.checked;
    this.checked = next;
    this.dispatchEvent(
      new CustomEvent<SwitchChangeDetail>('change', {
        detail: { checked: next },
        bubbles: true,
        composed: true,
      }),
    );
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
