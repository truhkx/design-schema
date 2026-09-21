import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { TextOverridableBinding } from './Text.js';
import './Text.js';

/** Where the label sits relative to the track. */
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

/** Hooks on `:host`. `helperSize` has none: it reaches the description Text only through its `overrides`. */
const HOOKS: Record<Exclude<SwitchOverridableBinding, 'helperSize'>, string> = {
  trackWidth: '--ds-switch-track-width',
  trackHeight: '--ds-switch-track-height',
  thumbSize: '--ds-switch-thumb-size',
  thumbInset: '--ds-switch-thumb-inset',
  radius: '--ds-switch-radius',
  gap: '--ds-switch-gap',
  partGap: '--ds-switch-part-gap',
  labelSize: '--ds-switch-label-size',
  labelWeight: '--ds-switch-label-weight',
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
 * track (in a shadow root with `delegatesFocus`), which keeps label
 * association, Space toggling and form participation for free; the thumb is a
 * Switch-owned `aria-hidden` span stacked over it in a track wrapper (not the
 * input's `::before`, which Firefox does not draw on an `appearance: none`
 * input), and both key off the input's `aria-checked`, never `:checked`. The
 * `<label for>` sits in the same root, so a click on it toggles natively; a
 * click on the description or the row's gap is forwarded to the control, so
 * the whole row toggles.
 *
 * The element is form-associated like `ds-checkbox`: the native form value is
 * `"on"` while checked and `null` otherwise (and `null` while disabled or
 * form-disabled), while `<ds-form>` discovers it by `data-ds-field="change"`
 * and collects `currentValue` as a boolean. A switch never validates. The
 * inner native `change` is not composed, so a composed `change` CustomEvent
 * with `{ checked }` is re-dispatched from the host. `checked` behaves like a
 * native input: the attribute is the initial state only and the property is
 * the live state, so it is not reflected and there is no controlled mode.
 *
 * ## When to use
 *
 * Use a Switch for a binary setting that applies as soon as it changes and can
 * be undone by flipping it back: notifications, dark mode, "show archived".
 * Use it in settings lists with `labelPosition: start` so labels line up and
 * switches sit at the row end. A choice that is only applied on Save is a
 * Checkbox.
 *
 * @fires change - Fired when the user changes the state, with `{ checked }` in `detail`. The change is already in effect.
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
      --ds-switch-track-width: var(--space-10);
      --ds-switch-track-height: var(--space-6);
      --ds-switch-thumb-size: var(--space-5);
      --ds-switch-thumb-inset: var(--space-1);
      --ds-switch-radius: var(--radius-full);
      --ds-switch-gap: var(--space-3);
      --ds-switch-part-gap: var(--space-1);
      --ds-switch-label-size: var(--font-size-md);
      --ds-switch-label-weight: var(--font-weight-regular);
      --ds-switch-font-family: var(--font-family-body);
      --ds-switch-line-height: var(--font-line-height-normal);
      --ds-switch-disabled-opacity: var(--opacity-disabled);
      --ds-switch-transition: var(--motion-duration-fast);
      /* trackOff, trackOn, thumb, labelColor, focusRing, focusRingWidth and minTarget are locked, so
         they read their token directly; helperSize and descriptionText reach the composed Text
         through its own size and tone props and its own overrides alone. */

      /* The label's first line box, which the track slot is tall, and the thumb's travel. */
      --ds-switch-line-box: calc(var(--ds-switch-label-size) * var(--ds-switch-line-height));
      --ds-switch-thumb-travel: calc(
        var(--ds-switch-track-width) - var(--ds-switch-thumb-size) - 2 * var(--ds-switch-thumb-inset)
      );
    }

    :host([hidden]) {
      display: none;
    }

    /* minTarget: a full-width row with no padding; the whole row, gap included, toggles. The content
       box is centred on the cross axis, so a one-line row sits in the middle of minTarget. */
    .root {
      display: flex;
      flex-direction: column;
      justify-content: center;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    /* The content box: the track slot aligns with the top of the text column, so a wrapping label or
       a description grows the row downwards without pulling the track off the first line. */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-switch-gap);
    }

    /* labelPosition changes the order of the row only: start puts the label first and pushes the
       track to the row end; end puts the track first, as on Checkbox. */
    .text {
      order: 0;
    }
    .slot {
      order: 1;
    }
    :host([label-position='start']) .row {
      justify-content: space-between;
    }
    :host([label-position='end']) .text {
      order: 1;
    }
    :host([label-position='end']) .slot {
      order: 0;
    }

    /* partGap: the text column, label then description. */
    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-switch-part-gap);
      min-inline-size: 0;
    }

    /* labelColor, labelSize, labelWeight, fontFamily, lineHeight: the label's own rule */
    .label {
      font-family: var(--ds-switch-font-family);
      font-size: var(--ds-switch-label-size);
      font-weight: var(--ds-switch-label-weight);
      line-height: var(--ds-switch-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    /* One label line tall: the track centres on the label's first line. */
    .slot {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      block-size: var(--ds-switch-line-box);
    }

    /* The track wrapper stacks the Switch-owned thumb span over the input. */
    .track-wrap {
      position: relative;
      display: inline-flex;
      flex: 0 0 auto;
    }

    /* track: a native input sized trackWidth × trackHeight, drawn with the control tokens. */
    .control {
      box-sizing: border-box;
      flex: 0 0 auto;
      inline-size: var(--ds-switch-track-width);
      block-size: var(--ds-switch-track-height);
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: var(--ds-switch-radius);
      background-color: var(--color-control-track-off);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--ds-switch-transition) var(--motion-easing-standard);
    }

    /* trackOn: keyed off the component state, not :checked, so the look always follows checked. */
    .control[aria-checked='true'] {
      background-color: var(--color-control-selected-background);
    }

    /* focusRing, focusRingWidth: drawn around the track, offset by focusRingWidth like every other
       control. Never removed. */
    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* thumb: a real span, not a ::before, which Firefox does not draw on an appearance: none input.
       It is inset evenly on the short axis and click-through, so presses reach the input underneath. */
    .thumb {
      position: absolute;
      inset-block-start: calc((var(--ds-switch-track-height) - var(--ds-switch-thumb-size)) / 2);
      inset-inline-start: var(--ds-switch-thumb-inset);
      inline-size: var(--ds-switch-thumb-size);
      block-size: var(--ds-switch-thumb-size);
      border-radius: var(--ds-switch-radius);
      background-color: var(--color-control-selected-foreground);
      pointer-events: none;
      transition: transform var(--ds-switch-transition) var(--motion-easing-standard);
    }

    /* Travels trackWidth − thumbSize − 2 × thumbInset when on. */
    .control[aria-checked='true'] ~ .thumb {
      transform: translateX(var(--ds-switch-thumb-travel));
    }

    /* RTL: the thumb travels toward the inline end, which is leftward. :dir(rtl) rather than an
       ancestor [dir='rtl'] selector, which misses an inherited direction. */
    :host(:dir(rtl)) .control[aria-checked='true'] ~ .thumb {
      transform: translateX(calc(-1 * var(--ds-switch-thumb-travel)));
    }

    /* transition: under reduced motion the thumb jumps and the track colour changes instantly. */
    @media (prefers-reduced-motion: reduce) {
      .control,
      .thumb {
        transition: none;
      }
    }

    /* disabledOpacity: the track (with its thumb), the label and the description dim — on the slot
       and on the text column, never on the composed description Text itself. The switch stays
       visible, readable and focusable. */
    .root.disabled,
    .root.disabled .control,
    .root.disabled .label {
      cursor: not-allowed;
    }
    .root.disabled .slot,
    .root.disabled .text {
      opacity: var(--ds-switch-disabled-opacity);
    }
  `;

  /** Visible label naming the thing being turned on or off. Also the accessible name. */
  @property() accessor label = '';

  /** Optional field name. When inside a Form the state is collected as a boolean; most switches are not in forms. Reflected so a name set as a property is still submitted by a native `<form>`. */
  @property({ reflect: true }) accessor name = '';

  /** Initial state when neither the `checked` attribute nor property is set. */
  @property({ type: Boolean, attribute: 'default-checked' }) accessor defaultChecked = false;

  /** Cannot be toggled. Stays visible, readable and focusable, and contributes no key to the Form's values. */
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

  /** The live state, like a native input: starts from the `checked` attribute, else `defaultChecked`, and follows every toggle. Not reflected; there is no controlled mode. */
  get checked(): boolean {
    return this.checkedValue ?? this.defaultChecked;
  }
  @property({ type: Boolean })
  set checked(value: boolean) {
    const old = this.checked;
    this.checkedValue = value;
    this.requestUpdate('checked', old);
  }

  /** A switch has no required state: it never validates and never appears in an error summary. Setting it is ignored. */
  get required(): boolean {
    return false;
  }

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#control') private accessor inputEl!: HTMLInputElement | null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Switch');
    // A switch has no useful blur moment, so ds-form validates it on change (it never fails).
    this.setAttribute('data-ds-field', 'change');
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

  /** Always valid: a switch has no error state by design. */
  reportValidity(): boolean {
    return true;
  }

  /* Form-associated custom element callbacks (invoked by the browser). */

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  /** Back to the initial state: the `checked` attribute, else `defaultChecked`. */
  formResetCallback(): void {
    const old = this.checked;
    this.checkedValue = this.hasAttribute('checked') ? true : undefined;
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
    // Native semantics: "on" or null, and null while disabled or form-disabled, so neither a native
    // <form> nor ds-form collects a disabled switch.
    this.internals.setFormValue(this.checked && !this.isDisabled ? 'on' : null);
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    return html`
      <div class=${classMap({ root: true, disabled: isDisabled })} @click=${this.handleRowClick}>
        <!-- The row centres this content box in minTarget; inside it the track stays on the first line. -->
        <div class="row">
          <div class="text">
            <label class="label" part="label" data-part="label" for="control">${this.label}</label>
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
          <span class="slot">
            <span class="track-wrap">
              <input
                id="control"
                class="control"
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
          </span>
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

  /** Clicks on the description, the text column or the row's gap toggle the switch too. */
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
    // The native change does not cross the shadow boundary; the host re-dispatches a composed one.
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;
    if (this.isDisabled) {
      event.preventDefault();
      input.checked = this.checked;
      return;
    }
    // Every native toggle flips the value, so there is no next-equals-checked case to guard here.
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
    for (const [binding, hook] of Object.entries(HOOKS) as [keyof typeof HOOKS, string][]) {
      const ref = this.overrides?.[binding];
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
