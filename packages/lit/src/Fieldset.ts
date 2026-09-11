import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Stack.js';
import type { StackOverridableBinding } from './Stack.js';

export type FieldsetGap = 'tight' | 'normal' | 'loose';

/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Fields a Fieldset disables and whose `required` it reads to decide the legend's indicator. */
const FIELD_SELECTOR = 'ds-input, ds-checkbox, ds-switch, ds-radio-group';

/** Overridable style hooks; see the `overrides` property. `legendColor`, `descriptionText` and `errorText` are locked and excluded. */
export type FieldsetOverridableBinding =
  | 'legendSize'
  | 'legendWeight'
  | 'helperSize'
  | 'partGap'
  | 'fieldsGap'
  | 'fontFamily'
  | 'lineHeight';

/** CSS hooks on the host. `fieldsGap` is forwarded to the composed `<ds-stack>`'s own `overrides.gap` instead — see `stackOverrides`. */
const HOOKS: Record<Exclude<FieldsetOverridableBinding, 'fieldsGap'>, string> = {
  legendSize: '--ds-fieldset-legend-size',
  legendWeight: '--ds-fieldset-legend-weight',
  helperSize: '--ds-fieldset-helper-size',
  partGap: '--ds-fieldset-part-gap',
  fontFamily: '--ds-fieldset-font-family', // literal-ok: CSS custom-property name, not a font stack
  lineHeight: '--ds-fieldset-line-height',
};

/**
 * `<ds-fieldset>` — Fieldset (category: input).
 *
 * `<ds-fieldset legend="Shipping address" gap="normal"><ds-input …></ds-input>…</ds-fieldset>`.
 * A shadow `<fieldset><legend>` wraps a `<ds-stack>` composed around a default
 * `<slot>` for the fields, which stay in the light DOM as raw fields (Fieldset
 * renders the Stack itself, so consumers should not wrap their own) so
 * `<ds-form>` still collects them by traversing past this element. The
 * group's `description` and `error` render in the shadow root, linked from the
 * fieldset with `aria-describedby`; `error` gets `role="alert"`. `disabled`
 * propagates to every slotted `ds-input`, `ds-checkbox`, `ds-switch` and
 * `ds-radio-group` on `slotchange` and whenever `disabled` changes, remembering
 * which ones it disabled (a `WeakSet`) so clearing it never re-enables a field
 * that was already disabled on its own — the same pattern `<ds-form>` uses.
 * The `requiredIndicator` is appended to the legend when every field inside is
 * `required`, computed from the same fields at render time, so the indicator
 * is not repeated on each field.
 *
 * ## When to use
 *
 * Use a Fieldset whenever two or more fields share a name a user would say
 * aloud — an address, a card, a start and end date. Give it a `description`
 * when the group needs a rule, and put cross-field errors on the group rather
 * than on one field.
 *
 * @slot - The raw fields (Inputs, Checkboxes, Switches); Fieldset lays them out in its own composed Stack.
 * @csspart group - The `<fieldset>` (anatomy: group).
 * @csspart legend - The `<legend>`.
 * @csspart description - The group helper text.
 * @csspart fields - The composed `<ds-stack>` wrapping the default slot (anatomy: fields).
 * @csspart errorMessage - The `role="alert"` group error region.
 */
@customElement('ds-fieldset')
export class DsFieldset extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-fieldset-font-family);
      --ds-fieldset-legend-size: var(--font-size-md);
      --ds-fieldset-legend-weight: var(--font-weight-medium);
      --ds-fieldset-helper-size: var(--font-size-sm);
      --ds-fieldset-part-gap: var(--layout-gap-tight);
      --ds-fieldset-font-family: var(--font-family-body);
      --ds-fieldset-line-height: var(--font-line-height-normal);
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
      font-size: var(--ds-fieldset-legend-size);
      font-weight: var(--ds-fieldset-legend-weight);
      line-height: var(--ds-fieldset-line-height);
      /* legendColor: color.foreground, locked */
      color: var(--color-foreground);
    }

    .required {
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
    }

    /* descriptionText: color.foreground.muted, locked */
    .description {
      margin: 0;
      font-size: var(--ds-fieldset-helper-size);
      line-height: var(--ds-fieldset-line-height);
      color: var(--color-foreground-muted);
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-fieldset-helper-size);
      line-height: var(--ds-fieldset-line-height);
      color: var(--color-foreground-danger);
    }
    .error:empty {
      display: none;
    }
  `;

  /** The group's name — what the fields together describe. Always visible. */
  @property() legend = '';

  /** Persistent helper text under the legend. Linked with aria-describedby. */
  @property() description?: string;

  /** A group-level error (cross-field validation). Field-level errors stay on the fields. */
  @property() error?: string;

  /** Disables every field inside. Fields keep their own `disabled` for finer control. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  @property({ reflect: true }) gap: FieldsetGap = 'normal';

  /** Per-instance style overrides: `{ fieldsGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<FieldsetOverridableBinding, TokenRef>>;

  /** Fields this Fieldset disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByFieldset = new WeakSet<HTMLElement & { disabled: boolean }>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Fieldset');
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

  protected override render() {
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;

    return html`
      <fieldset
        part="group"
        aria-describedby=${ifDefined(describedBy)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-invalid=${ifDefined(this.error ? 'true' : undefined)}
      >
        <legend part="legend"
          >${this.legend}${this.allFieldsRequired
            ? html`<span class="required" aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
            : nothing}</legend
        >
        ${this.description
          ? html`<p id="description" class="description" part="description">${this.description}</p>`
          : nothing}
        <ds-stack part="fields" gap=${this.gap} .overrides=${this.stackOverrides}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </ds-stack>
        <div id="error" class="error" part="errorMessage" role="alert">${this.error ?? ''}</div>
      </fieldset>
    `;
  }

  /** `overrides.fieldsGap` forwarded to the composed `<ds-stack>`'s own `overrides.gap`; Fieldset never styles the Stack directly. */
  private get stackOverrides(): Partial<Record<StackOverridableBinding, TokenRef>> | undefined {
    const ref = this.overrides?.fieldsGap;
    return ref === undefined ? undefined : { gap: ref };
  }

  /** True once at least one field is found and every one of them is `required`. */
  private get allFieldsRequired(): boolean {
    const fields = this.queryFields();
    return fields.length > 0 && fields.every((field) => (field as unknown as { required?: boolean }).required === true);
  }

  private queryFields(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>(FIELD_SELECTOR));
  }

  private handleSlotChange(): void {
    this.syncDisabled();
    this.requestUpdate();
  }

  /** Disables every slotted field, remembering which it disabled so re-enabling is exact. */
  private syncDisabled(): void {
    const fields = this.queryFields() as (HTMLElement & { disabled: boolean })[];
    for (const field of fields) {
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
    for (const binding of Object.keys(HOOKS) as Exclude<FieldsetOverridableBinding, 'fieldsGap'>[]) {
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
