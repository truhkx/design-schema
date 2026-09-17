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
 * Bindings Fieldset's own rules read. The others reach the composed Text and Stack only
 * through their `overrides`, so they have no --ds-fieldset-* hook.
 */
const HOOKS: Partial<Record<FieldsetOverridableBinding, string>> = {
  partGap: '--ds-fieldset-part-gap',
  disabledOpacity: '--ds-fieldset-disabled-opacity',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type StackOverrides = Partial<Record<StackOverridableBinding, TokenRef | undefined>>;
type Field = HTMLElement & { disabled: boolean; required?: boolean | undefined };

/**
 * `<ds-fieldset>` — Fieldset (category: input).
 *
 * `<ds-fieldset legend="Shipping address" gap="normal"><ds-input …></ds-input>…</ds-fieldset>`.
 * A shadow `<fieldset><legend>` wraps a Fieldset-owned `fields` wrapper around a
 * composed `<ds-stack>` and a default `<slot>`; the fields stay in the light DOM
 * so `<ds-form>` still collects them. The legend, description and error render
 * their text through `<ds-text>` (element span) inside the native `<legend>`, a
 * description wrapper and a `role="alert"` wrapper; `legendSize`, `legendWeight`,
 * `helperSize`, `fontFamily` and `lineHeight` reach them only as Text overrides,
 * and `fieldsGap` reaches the Stack only as its `overrides.gap`.
 *
 * While `error` is set the `<fieldset>` carries `aria-invalid="true"` and
 * `aria-describedby` names the error. `disabled` sets `aria-disabled` on the
 * fieldset and the `disabled` property on direct `data-ds-field` children on
 * `slotchange` and whenever it changes, remembering which it set so clearing
 * never enables a field disabled on its own. The `requiredIndicator` is appended
 * inside the legend when every direct child field is `required`.
 *
 * @slot - The raw fields (Inputs, Checkboxes, Switches) as direct children.
 */
@customElement('ds-fieldset')
export class DsFieldset extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-fieldset-part-gap: var(--layout-gap-tight);
      --ds-fieldset-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    /* No border, padding or min-inline-size: the group is structure, not a box. */
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

    /* disabledOpacity: the legend and description only; the fields dim themselves. */
    :host([disabled]) legend,
    :host([disabled]) [data-part='description'] {
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

  /** Fields this Fieldset disabled itself, so clearing `disabled` never enables one disabled on its own. */
  private readonly disabledByFieldset = new WeakSet<Field>();

  private readonly requiredObserver = new MutationObserver(() => this.syncRequired());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Fieldset');
    // The callback writes state only, never an observed attribute, so it cannot re-trigger itself.
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

  /** fieldsGap → the Stack's `overrides.gap`, as the token path `layout.gap.{gap}` unless overridden. */
  private get stackOverrides(): StackOverrides {
    return { gap: this.overrides?.fieldsGap ?? `layout.gap.${this.gap}` };
  }

  /** legendSize, legendWeight, fontFamily, lineHeight → the legend Text's overrides. */
  private get legendOverrides(): TextOverrides {
    return {
      fontSize: this.overrides?.legendSize ?? 'font.size.md',
      fontWeight: this.overrides?.legendWeight ?? 'font.weight.medium',
      ...this.typeOverrides,
    };
  }

  /** helperSize, fontFamily, lineHeight → the description and error Texts' overrides. */
  private get helperOverrides(): TextOverrides {
    return { fontSize: this.overrides?.helperSize ?? 'font.size.sm', ...this.typeOverrides };
  }

  private get typeOverrides(): TextOverrides {
    return {
      fontFamily: this.overrides?.fontFamily ?? 'font.family.body',
      lineHeight: this.overrides?.lineHeight ?? 'font.lineHeight.normal',
    };
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

  /** Sets `disabled` on direct fields, remembering which it set so clearing is exact. */
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
