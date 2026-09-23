import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Stack.js';
import './Text.js';
import type { StackOverridableBinding } from './Stack.js';
import type { TextOverridableBinding } from './Text.js';

/** Gap between the fields, from the layout rhythm. */
export type FieldsetGap = 'tight' | 'normal' | 'loose';

/** copy.requiredIndicator */
const COPY_REQUIRED_INDICATOR = ' (required)';

/** Overridable style bindings; see the `overrides` property. `legendColor`, `descriptionText` and `errorText` are locked and excluded. */
export type FieldsetOverridableBinding =
  | 'legendSize'
  | 'legendWeight'
  | 'helperSize'
  | 'partGap'
  | 'fieldsGap'
  | 'disabledOpacity'
  | 'fontFamily'
  | 'lineHeight';

/**
 * The two bindings Fieldset's own elements read. The rest reach the composed Text and Stack
 * only through their `overrides`, so they declare no --ds-fieldset-* hook (a Fieldset hook
 * would not reach a child's shadow root).
 */
const HOOKS: Partial<Record<FieldsetOverridableBinding, string>> = {
  partGap: '--ds-fieldset-part-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type StackOverrides = Partial<Record<StackOverridableBinding, TokenRef | undefined>>;

/** A direct light-DOM child carrying `data-ds-field` — every field component's root does. */
type Field = HTMLElement & { disabled: boolean; required?: boolean | undefined };

/**
 * `<ds-fieldset>` — Fieldset (category: input, role: group).
 *
 * `<ds-fieldset legend="Shipping address" gap="normal"><ds-input …></ds-input>…</ds-fieldset>`
 * renders a shadow `<fieldset><legend>` around a Fieldset-owned `fields` wrapper holding a
 * composed `<ds-stack>` and the default `<slot>`. The fields themselves stay in the light DOM,
 * so `<ds-form>` still collects them and each keeps its own label, error and validity — the
 * group is structure, not a field. It has no border and no padding: wrap it in a Box or Card
 * for a surface.
 *
 * The legend, description and error render their text through `<ds-text>` (element span) inside
 * the native `<legend>`, a description wrapper and a `role="alert"` wrapper, so `legendSize`,
 * `legendWeight`, `helperSize`, `fontFamily` and `lineHeight` reach them only as Text overrides,
 * never as Fieldset rules; `fieldsGap` likewise reaches the Stack only as its `overrides.gap`.
 * Ids never cross the shadow boundary, so the group's role and accessible name come from the
 * native `<fieldset>`/`<legend>` and `aria-describedby` points at shadow ids.
 *
 * While `error` is set (an empty string counts as unset) the `<fieldset>` carries
 * `aria-invalid="true"` and the error is announced once, because inserting the `role="alert"`
 * wrapper is what announces it. `disabled` sets `aria-disabled` on the fieldset and the
 * `disabled` property on direct `data-ds-field` children — on `slotchange` and whenever it
 * changes — remembering which it set so clearing never enables a field disabled on its own.
 * The `requiredIndicator` is appended inside the legend when every direct child field is
 * `required` (the property or the attribute), so it is not repeated on each field.
 *
 * ## When to use
 *
 * Whenever two or more fields share a name a user would say aloud — an address, a date range,
 * "Which days?" as a set of Checkboxes. Give it a `description` when the group needs a rule,
 * and put cross-field errors on the group rather than on one field. Not for a single field,
 * not for a whole form, and not inside a RadioGroup, which already is a fieldset.
 *
 * @slot - The fields as direct children, usually Inputs, Checkboxes or Switches.
 */
@customElement('ds-fieldset')
export class DsFieldset extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-fieldset-part-gap: var(--layout-gap-tight);
      --ds-fieldset-disabled-opacity: var(--opacity-disabled);
      /* Locked: out of the overrides type, but they keep their hook so page CSS can re-theme them
         and the naming codemod can rename them. */
      --ds-fieldset-legend-color: var(--color-foreground);
      --ds-fieldset-description-text: var(--color-foreground-muted);
      --ds-fieldset-error-text: var(--color-foreground-danger);
      /* legendSize, legendWeight, helperSize, fontFamily, lineHeight and fieldsGap only forward:
         the composed Text and Stack realise them through their own overrides, so no hook. */
    }

    /* legendColor, descriptionText, errorText: the Texts' tones draw them; the parent's hook feeds
       Text's own documented --ds-text-color hook on the child host (an outer-scope rule, so it
       wins over the child's :host([tone]) declaration), never the child's shadow tree. */
    legend > ds-text {
      --ds-text-color: var(--ds-fieldset-legend-color);
    }
    [data-part='description'] > ds-text {
      --ds-text-color: var(--ds-fieldset-description-text);
    }
    [data-part='errorMessage'] > ds-text {
      --ds-text-color: var(--ds-fieldset-error-text);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: between legend, description, fields and error. The browser's border, padding
       and min-inline-size are reset — the group is structure, not a box. */
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

    /* disabledOpacity: the Fieldset-owned legend and description wrappers only, never the Texts.
       The fields dim themselves and the group error is never dimmed, so neither the group root
       nor the fields wrapper is dimmed. */
    :host([disabled]) legend,
    :host([disabled]) [data-part='description'] {
      opacity: var(--ds-fieldset-disabled-opacity);
    }
  `;

  /** The group's name — what the fields together describe ("Shipping address"). Always visible, and the group's accessible name. */
  @property() accessor legend = '';

  /** Persistent helper text under the legend, linked with aria-describedby. An empty string counts as unset. */
  @property() accessor description: string | undefined;

  /** A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. An empty string counts as unset. */
  @property() accessor error: string | undefined;

  /** Disables every direct child field. Fields keep their own `disabled` for finer control. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields. */
  @property({ type: String, reflect: true }) accessor gap: FieldsetGap = 'normal';

  /** Per-instance style overrides: `{ fieldsGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<FieldsetOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Every direct child field is `required`; derived on slotchange and when a child's `required` attribute changes. */
  @state() private accessor allFieldsRequired = false;

  /** The fields this Fieldset disabled itself, so clearing `disabled` never enables one disabled on its own. */
  private readonly disabledByFieldset = new Set<Field>();

  /** Watches the light DOM for `required` attribute changes; the callback writes state only, never an observed attribute, so it cannot re-trigger itself. */
  private readonly requiredObserver = new MutationObserver(() => this.syncRequired());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Fieldset');
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
    const helper = this.helperOverrides;

    return html`
      <fieldset
        part="group"
        data-part="group"
        aria-describedby=${ifDefined(describedBy)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-invalid=${ifDefined(this.error ? 'true' : undefined)}
      >
        <legend part="legend" data-part="legend"
          ><ds-text element="span" tone="default" size="md" weight="medium" .overrides=${this.legendOverrides}
            >${this.legend}${this.allFieldsRequired ? COPY_REQUIRED_INDICATOR : nothing}</ds-text
          ></legend
        >
        ${this.description
          ? html`<div id="description" part="description" data-part="description"
              ><ds-text element="span" tone="muted" size="sm" .overrides=${helper}>${this.description}</ds-text></div
            >`
          : nothing}
        <div part="fields" data-part="fields">
          <ds-stack .overrides=${this.stackOverrides}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </ds-stack>
        </div>
        ${this.error
          ? html`<div id="error" part="errorMessage" data-part="errorMessage" role="alert"
              ><ds-text element="span" tone="danger" size="sm" .overrides=${helper}>${this.error}</ds-text></div
            >`
          : nothing}
      </fieldset>
    `;
  }

  /** fieldsGap → the Stack's own `overrides.gap`, always sent as a token path: the override, else `layout.gap.{gap}`. The Stack gets no `gap` attribute, and Fieldset never sets --ds-stack-gap. */
  private get stackOverrides(): StackOverrides {
    return { gap: this.overrides?.fieldsGap ?? `layout.gap.${this.gap}` };
  }

  /** legendSize, legendWeight, fontFamily and lineHeight → the legend Text's overrides. */
  private get legendOverrides(): TextOverrides {
    return {
      fontSize: this.overrides?.legendSize ?? 'font.size.md',
      fontWeight: this.overrides?.legendWeight ?? 'font.weight.medium',
      ...this.typeOverrides,
    };
  }

  /** helperSize, fontFamily and lineHeight → the description and error Texts' overrides. */
  private get helperOverrides(): TextOverrides {
    return { fontSize: this.overrides?.helperSize ?? 'font.size.sm', ...this.typeOverrides };
  }

  private get typeOverrides(): TextOverrides {
    return {
      fontFamily: this.overrides?.fontFamily ?? 'font.family.body',
      lineHeight: this.overrides?.lineHeight ?? 'font.lineHeight.normal',
    };
  }

  /** Direct children carrying `data-ds-field`; a field nested deeper is not inspected — put fields directly inside the Fieldset. */
  private directFields(): Field[] {
    return Array.from(this.children).filter((el): el is Field => el.hasAttribute('data-ds-field'));
  }

  private handleSlotChange(): void {
    this.syncDisabled();
    this.syncRequired();
  }

  /** The indicator appears only when every direct child field is required; a group with no fields shows none. */
  private syncRequired(): void {
    const fields = this.directFields();
    const next =
      fields.length > 0 && fields.every((field) => field.required === true || field.hasAttribute('required'));
    if (this.allFieldsRequired !== next) {
      this.allFieldsRequired = next;
    }
  }

  /** Sets `disabled` on direct fields, remembering which it set so clearing is exact. */
  private syncDisabled(): void {
    const fields = this.directFields();
    // A field this Fieldset disabled that has since left it gets its own state back.
    for (const field of this.disabledByFieldset) {
      if (!fields.includes(field)) {
        field.disabled = false;
        this.disabledByFieldset.delete(field);
      }
    }
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
    for (const [binding, hook] of Object.entries(HOOKS) as [FieldsetOverridableBinding, string][]) {
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
    'ds-fieldset': DsFieldset;
  }
}
