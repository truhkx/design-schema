import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Stack.js';
import './Text.js';
import type { StackOverridableBinding } from './Stack.js';
import type { TextOverridableBinding } from './Text.js';

export type FieldsetGap = 'tight' | 'normal' | 'loose';

/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Overridable style hooks; see the `overrides` property. `legendColor`, `descriptionText` and `errorText` are locked and excluded. */
export type FieldsetOverridableBinding =
  | 'legendSize'
  | 'legendWeight'
  | 'helperSize'
  | 'partGap'
  | 'fieldsGap'
  | 'disabledOpacity'
  | 'fontFamily'
  | 'lineHeight';

const HOOKS: Record<FieldsetOverridableBinding, string> = {
  legendSize: '--ds-fieldset-legend-size',
  legendWeight: '--ds-fieldset-legend-weight',
  helperSize: '--ds-fieldset-helper-size',
  partGap: '--ds-fieldset-part-gap',
  fieldsGap: '--ds-fieldset-fields-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
  fontFamily: '--ds-fieldset-font-family', // literal-ok: CSS custom-property name, not a font stack
  lineHeight: '--ds-fieldset-line-height',
};

type Field = HTMLElement & { disabled: boolean; required?: boolean | undefined };

/**
 * `<ds-fieldset>` — Fieldset (category: input).
 *
 * `<ds-fieldset legend="Shipping address" gap="normal"><ds-input …></ds-input>…</ds-fieldset>`.
 * A shadow `<fieldset><legend>` wraps a composed `<ds-stack>` around a default
 * `<slot>`; the fields stay in the light DOM as raw fields so `<ds-form>` still
 * collects them. The legend and description render their text through
 * `<ds-text>` inside the native `<legend>` / `<p>`, so `legendSize`,
 * `legendWeight` and `helperSize` reach Text as its own overrides. The group
 * error renders once under the fields with `role="alert"`; while it is set the
 * `<fieldset>` carries `aria-invalid="true"` and `aria-describedby` names it.
 * `disabled` sets `aria-disabled` on the fieldset and is propagated to every
 * slotted field (`data-ds-field`) on `slotchange` and whenever it changes,
 * remembering which ones it disabled so clearing never re-enables a field that
 * was disabled on its own — the same pattern `<ds-form>` uses. The
 * `requiredIndicator` is appended to the legend when every direct child field
 * is `required`.
 *
 * ## When to use
 *
 * Use a Fieldset whenever two or more fields share a name a user would say
 * aloud — an address, a card, a start and end date. Give it a `description`
 * when the group needs a rule, and put cross-field errors on the group rather
 * than on one field.
 *
 * @slot - The raw fields (Inputs, Checkboxes, Switches); Fieldset lays them out in its own composed Stack.
 */
@customElement('ds-fieldset')
export class DsFieldset extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-fieldset-legend-size: var(--font-size-md);
      --ds-fieldset-legend-weight: var(--font-weight-medium);
      --ds-fieldset-helper-size: var(--font-size-sm);
      --ds-fieldset-part-gap: var(--layout-gap-tight);
      --ds-fieldset-fields-gap: var(--layout-gap-normal);
      --ds-fieldset-disabled-opacity: var(--opacity-disabled);
      --ds-fieldset-font-family: var(--font-family-body);
      --ds-fieldset-line-height: var(--font-line-height-normal);
      font-family: var(--ds-fieldset-font-family);
      line-height: var(--ds-fieldset-line-height);
    }
    :host([gap='tight']) {
      --ds-fieldset-fields-gap: var(--layout-gap-tight);
    }
    :host([gap='normal']) {
      --ds-fieldset-fields-gap: var(--layout-gap-normal);
    }
    :host([gap='loose']) {
      --ds-fieldset-fields-gap: var(--layout-gap-loose);
    }

    :host([hidden]) {
      display: none;
    }

    /* No border and no padding: the group is structure, not a surface. */
    fieldset {
      display: flex;
      flex-direction: column;
      gap: var(--ds-fieldset-part-gap);
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    /* A <legend> does not take part in the fieldset's flex gap, so partGap below it is a margin. */
    legend {
      margin-block-end: var(--ds-fieldset-part-gap);
      padding: 0;
    }

    /* Text's documented hooks, set from Fieldset's own. legendColor and descriptionText (locked) are Text's tones. */
    legend ds-text {
      --ds-text-font-size: var(--ds-fieldset-legend-size);
      --ds-text-font-weight: var(--ds-fieldset-legend-weight);
      --ds-text-font-family: var(--ds-fieldset-font-family);
      --ds-text-line-height: var(--ds-fieldset-line-height);
    }

    .description {
      margin: 0;
    }
    .description ds-text {
      --ds-text-font-size: var(--ds-fieldset-helper-size);
      --ds-text-font-family: var(--ds-fieldset-font-family);
      --ds-text-line-height: var(--ds-fieldset-line-height);
    }

    /* fieldsGap reaches the composed Stack through its documented gap hook (and its overrides.gap). */
    ds-stack {
      --ds-stack-gap: var(--ds-fieldset-fields-gap);
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      margin: 0;
      font-size: var(--ds-fieldset-helper-size);
      color: var(--color-foreground-danger);
    }

    /* The group's own text dims; fields dim by their own disabled rule, so the Stack is not dimmed twice. */
    :host([disabled]) legend,
    :host([disabled]) .description {
      opacity: var(--ds-fieldset-disabled-opacity);
    }
  `;

  /** The group's name — what the fields together describe. Always visible; the group's accessible name. */
  @property() accessor legend = '';

  /** Persistent helper text under the legend. Linked with aria-describedby on the group. */
  @property() accessor description: string | undefined;

  /** A group-level error (cross-field validation). Field-level errors stay on the fields. */
  @property() accessor error: string | undefined;

  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  @property({ type: String, reflect: true }) accessor gap: FieldsetGap = 'normal';

  /** Per-instance style overrides: `{ fieldsGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>> | undefined;

  /** Every direct child field is `required`; derived on slotchange and when a child's `required` attribute changes. */
  @state() private accessor allFieldsRequired = false;

  /** Fields this Fieldset disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByFieldset = new WeakSet<Field>();

  private readonly requiredObserver = new MutationObserver(() => this.syncRequired());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Fieldset');
    // Observes only; the callback writes state, never an attribute, so it cannot re-trigger itself.
    this.requiredObserver.observe(this, { subtree: true, attributes: true, attributeFilter: ['required'] });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.requiredObserver.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('disabled')) {
      this.syncDisabled();
    }
  }

  protected override render(): TemplateResult {
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : ''].filter((id) => id !== '').join(' ') ||
      undefined;

    return html`
      <fieldset
        part="group"
        data-part="group"
        aria-describedby=${ifDefined(describedBy)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-invalid=${ifDefined(this.error ? 'true' : undefined)}
      >
        <legend part="legend" data-part="legend"
          ><ds-text element="span" size="md" weight="medium" tone="default" .overrides=${this.legendOverrides}
            >${this.legend}${this.allFieldsRequired ? COPY_REQUIRED_INDICATOR : nothing}</ds-text
          ></legend
        >
        ${this.description
          ? html`<p id="description" class="description" part="description" data-part="description"
              ><ds-text element="span" size="sm" tone="muted" .overrides=${this.descriptionOverrides}
                >${this.description}</ds-text
              ></p
            >`
          : nothing}
        <ds-stack part="fields" data-part="fields" gap=${this.gap} .overrides=${this.stackOverrides}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </ds-stack>
        ${this.error
          ? html`<p id="error" class="error" part="errorMessage" data-part="errorMessage" role="alert">${this.error}</p>`
          : nothing}
      </fieldset>
    `;
  }

  /** `overrides.fieldsGap` forwarded to the composed `<ds-stack>`'s own `overrides.gap`. */
  private get stackOverrides(): Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined {
    const ref = this.overrides?.fieldsGap;
    return ref === undefined ? undefined : { gap: ref };
  }

  private get legendOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    return this.textOverrides(this.overrides?.legendSize, this.overrides?.legendWeight);
  }

  private get descriptionOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    return this.textOverrides(this.overrides?.helperSize, undefined);
  }

  private textOverrides(
    fontSize: TokenRef | undefined,
    fontWeight: TokenRef | undefined,
  ): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const o = this.overrides;
    if (o === undefined) return undefined;
    const out: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    if (fontSize !== undefined) out.fontSize = fontSize;
    if (fontWeight !== undefined) out.fontWeight = fontWeight;
    if (o.fontFamily !== undefined) out.fontFamily = o.fontFamily;
    if (o.lineHeight !== undefined) out.lineHeight = o.lineHeight;
    return Object.keys(out).length > 0 ? out : undefined;
  }

  /** Direct child fields only; fields wrapped in a consumer's own container are not inspected. */
  private directFields(): Field[] {
    return Array.from(this.children).filter((el): el is Field => el.hasAttribute('data-ds-field'));
  }

  private handleSlotChange(): void {
    this.syncDisabled();
    this.syncRequired();
  }

  private syncRequired(): void {
    const fields = this.directFields();
    const next = fields.length > 0 && fields.every((field) => field.required === true || field.hasAttribute('required'));
    if (this.allFieldsRequired !== next) this.allFieldsRequired = next;
  }

  /** Disables every slotted field, remembering which it disabled so re-enabling is exact. */
  private syncDisabled(): void {
    for (const field of this.directFields()) {
      if (this.disabled) {
        if (!field.disabled) {
          this.disabledByFieldset.add(field);
          field.disabled = true;
        }
      } else if (this.disabledByFieldset.has(field)) {
        field.disabled = false;
        this.disabledByFieldset.delete(field);
      }
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as FieldsetOverridableBinding[]) {
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
    'ds-fieldset': DsFieldset;
  }
}
