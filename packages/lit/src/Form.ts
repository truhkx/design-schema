import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Link.js';

export type FormValidate = 'submit' | 'blur' | 'change';

/** Detail carried by the `submit` CustomEvent. */
export interface FormSubmitDetail {
  values: Record<string, string | boolean>;
}

/** Detail carried by the `invalid` CustomEvent. */
export interface FormInvalidDetail {
  errors: Record<string, string>;
}

/**
 * The contract a light-DOM element must implement to be collected by
 * `<ds-form>`. Form finds fields by the `data-ds-field` attribute on their host,
 * never by tag, so any element that sets it and implements this interface is
 * collected. `error` and `validationMessage` are optional: a field that never
 * validates (Switch) omits them, and Form treats absence as valid.
 */
export interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error?: string | undefined;
  readonly currentValue: string | boolean | null;
  id: string;
  focus(): void;
  checkValidity(): boolean;
  readonly validationMessage?: string | undefined;
}

/** Overridable style hooks; see the `overrides` property. `errorSummaryText` and `errorSummaryBackground` are locked and excluded. */
export type FormOverridableBinding = 'gap' | 'errorSummaryBorder';

const HOOKS: Record<FormOverridableBinding, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
};

/** copy.summaryHeading (plural by `count`); the `one` form is copy.summaryHeadingOne. */
const COPY_SUMMARY_HEADING_ONE = '1 problem with this form';
const COPY_SUMMARY_HEADING_OTHER = '{count} problems with this form';

/** Every field component sets this attribute on its host; Form discovers fields by it alone. */
const FIELD_SELECTOR = '[data-ds-field]';

/** Negates a boolean attribute: `no-error-summary` present means `errorSummary` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

let formInstanceCount = 0;

/**
 * `<ds-form>` — Form (category: container).
 *
 * `<ds-form name="sign-in" label="Sign in">` wraps a native `<form novalidate>`
 * in its shadow root, with a default slot for fields (Input etc. and layout
 * like Stack) and a named `actions` slot for the action row, but form
 * ownership is DOM-tree based, so the slotted fields are not owned by it.
 * Instead it collects light-DOM descendants carrying `data-ds-field` that have
 * a `name` and implement `DsFormField` (skipping any inside a closed
 * `ds-disclosure` without `keep-mounted`), submits on a composed `press` from
 * a `ds-button[type=submit]` and on Enter in any field (a `keydown` listener,
 * never a CustomEvent named after a native event), and propagates `disabled`
 * to the fields it found and to `ds-button` descendants, remembering which
 * ones it disabled so it never re-enables one already disabled on its own.
 * The host carries `role="form"` and `aria-label` / `aria-labelledby`
 * (`labelledBy` winning over `label`) as plain attributes, so the landmark
 * lives in the light DOM tree. Dispatches composed `submit` (`{ values }`) and
 * `invalid` (`{ errors }`) CustomEvents; never navigates. Never nest inside a
 * native form or another `<ds-form>`.
 *
 * ## When to use
 *
 * Use Form whenever two or more fields are submitted together, and for any
 * single field whose submission has consequences (sign-in, search with side
 * effects). Place actions (submit, cancel) at the end in a Stack. Give the
 * form a `label` when the page contains more than one.
 *
 * @fires submit - Fired when every field is valid, with `{ values }` (keyed by each field's `name`) in `detail`.
 * @fires invalid - Fired when submission is blocked by validation, with `{ errors }` in `detail`.
 * @slot - Fields (Input etc.) and layout (Stack) (anatomy: fields).
 * @slot actions - The action row: at least one Button with `type: submit`, primary first (anatomy: actions).
 */
@customElement('ds-form')
export class DsForm extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-form-gap: var(--layout-gap-loose);
      --ds-form-error-summary-border: var(--color-border-danger);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='container'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-form-gap);
      margin: 0;
      padding: 0;
    }

    /* errorSummaryBackground / errorSummaryText: color.background.subtle / color.foreground.danger, locked */
    [data-part='errorSummary'] {
      box-sizing: border-box;
      padding: var(--space-md);
      border: var(--border-width-thin) solid var(--ds-form-error-summary-border);
      border-radius: var(--radius-md);
      background: var(--color-background-subtle);
      color: var(--color-foreground-danger);
    }

    [data-part='errorSummary']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--layout-gap-tight);
      margin: 0;
      padding: 0;
      padding-block-start: var(--space-sm);
      padding-inline-start: var(--space-lg);
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
    }
  `;

  /** Identifier for the form, used for analytics and as the base of generated field ids. */
  @property() accessor name = '';

  /** Accessible name for the form landmark. Required when a page has more than one form and `labelledBy` is not set. */
  @property() accessor label: string | undefined;

  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  @property() accessor labelledBy: string | undefined;

  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  @property() accessor validate: FormValidate = 'submit';

  /** Disables every field and action inside. Use while submitting. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /**
   * When submission fails validation, render a summary of errors above the fields that links to each field.
   * Attribute is the negation, `no-error-summary`, because a boolean attribute cannot express `false` for a
   * prop that defaults `true`.
   */
  @property({ attribute: 'no-error-summary', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor errorSummary = true;

  /** Per-instance style overrides: `{ gap: 'layout.gap.normal' }`. Locked bindings (errorSummaryText, errorSummaryBackground) are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<FormOverridableBinding, TokenRef | undefined>> | undefined;

  /** Field name -> message, for fields that have failed validation. */
  @state() private accessor errors: Record<string, string> = {};

  /** Once a submission has failed, fields re-validate on blur/change even in `submit` mode. */
  private hasFailedSubmission = false;

  /** Fields and actions this Form disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByForm = new WeakSet<HTMLElement>();

  /** Re-syncs disabled propagation when fields are added or removed; observes `childList` only, never the attributes it writes. */
  private readonly mutationObserver = new MutationObserver(() => {
    if (this.disabled) this.syncDisabled();
  });

  /** Focus the error summary once it exists, after the render that follows a failed submission. */
  private pendingSummaryFocus = false;

  private readonly instanceId = `ds-form-${++formInstanceCount}`;

  private get idBase(): string {
    return this.name || this.instanceId;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Form');
    if (this.getAttribute('role') !== 'form') this.setAttribute('role', 'form');
    this.mutationObserver.observe(this, { childList: true, subtree: true });
    if (import.meta.env.DEV && this.parentElement?.closest('form, ds-form')) {
      console.warn('<ds-form> must not be nested inside a native <form> or another <ds-form>.');
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('label') || changed.has('labelledBy')) {
      this.syncName();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('disabled')) {
      this.syncDisabled();
    }
    if (this.pendingSummaryFocus) {
      this.pendingSummaryFocus = false;
      this.renderRoot.querySelector<HTMLElement>('[data-part="errorSummary"]')?.focus();
    }
  }

  protected override render(): TemplateResult {
    const errorEntries = Object.entries(this.errors);
    const showSummary = this.errorSummary && errorEntries.length > 0;

    return html`
      <form
        part="container"
        data-part="container"
        novalidate
        name=${ifDefined(this.name || undefined)}
        @keydown=${this.handleKeydown}
        @change=${this.handleFieldChange}
        @focusout=${this.handleFieldFocusOut}
        @press=${this.handlePress}
        @submit=${this.handleNativeSubmit}
      >
        ${showSummary ? this.renderSummary(errorEntries) : nothing}
        <slot data-part="fields"></slot>
        <slot name="actions" data-part="actions"></slot>
      </form>
    `;
  }

  private renderSummary(errorEntries: [string, string][]): TemplateResult {
    const fieldsByName = new Map(this.queryFields().map((field) => [field.name, field] as const));
    return html`
      <div data-part="errorSummary" role="alert" tabindex="-1">
        <ds-text element="p" weight="semibold" tone="danger">${this.summaryHeading(errorEntries.length)}</ds-text>
        <ul class="list">
          ${errorEntries.map(([name, message]) => {
            const field = fieldsByName.get(name);
            const text = field?.label ? `${field.label}: ${message}` : message;
            return html`
              <li>
                <ds-link
                  tone="inherit"
                  href=${field?.id ? `#${field.id}` : '#'}
                  label=${text}
                  @click=${(event: MouseEvent) => this.handleSummaryLinkClick(event, name)}
                ></ds-link>
              </li>
            `;
          })}
        </ul>
      </div>
    `;
  }

  private summaryHeading(count: number): string {
    const locale = this.closest('[lang]')?.getAttribute('lang') || navigator.language;
    return new Intl.PluralRules(locale).select(count) === 'one'
      ? COPY_SUMMARY_HEADING_ONE
      : COPY_SUMMARY_HEADING_OTHER.replace('{count}', String(count));
  }

  /** Validate every field and, only if all pass, dispatch `submit` with the collected values. */
  submit(): void {
    if (this.disabled) {
      return;
    }
    const fields = this.queryFields();
    this.assignFieldIds(fields);

    const errors: Record<string, string> = {};
    const values: Record<string, string | boolean> = {};
    let firstInvalid: DsFormField | undefined;

    for (const field of fields) {
      if (field.disabled) {
        continue;
      }
      if (field.checkValidity()) {
        const value = field.currentValue;
        if (value !== null && value !== undefined) {
          values[field.name] = value;
        }
      } else {
        errors[field.name] = field.validationMessage ?? '';
        firstInvalid ??= field;
      }
    }

    this.errors = errors;

    if (firstInvalid !== undefined) {
      this.hasFailedSubmission = true;
      this.dispatchEvent(
        new CustomEvent<FormInvalidDetail>('invalid', { detail: { errors }, bubbles: true, composed: true }),
      );
      if (this.errorSummary) {
        this.pendingSummaryFocus = true;
      } else {
        firstInvalid.focus();
      }
      return;
    }

    this.dispatchEvent(
      new CustomEvent<FormSubmitDetail>('submit', { detail: { values }, bubbles: true, composed: true }),
    );
  }

  private handleNativeSubmit(event: Event): void {
    // The shadow <form> owns no controls; never let it navigate.
    event.preventDefault();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing) {
      return;
    }
    const field = this.fieldFor(event.target);
    if (field === null) {
      return;
    }
    // Enter in a multi-line control inserts a line break; on a native button or link it activates it.
    const origin = event.composedPath()[0];
    if (origin instanceof HTMLTextAreaElement || origin instanceof HTMLButtonElement || origin instanceof HTMLAnchorElement) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private handlePress(event: Event): void {
    const target = event.target as HTMLElement & { type?: string | undefined };
    if (target.tagName !== 'DS-BUTTON' || target.type !== 'submit') {
      return;
    }
    this.submit();
  }

  private handleFieldChange(event: Event): void {
    const field = this.fieldFor(event.target);
    if (field === null) {
      return;
    }
    const shouldValidate =
      this.validate === 'change' ||
      (this.validate === 'blur' && this.hasNoBlurMoment(event)) ||
      (this.validate === 'submit' && this.hasFailedSubmission);
    if (shouldValidate) {
      this.validateField(field);
    }
  }

  private handleFieldFocusOut(event: FocusEvent): void {
    const field = this.fieldFor(event.target);
    if (field === null || this.hasNoBlurMoment(event)) {
      return;
    }
    const related = event.relatedTarget;
    if (related instanceof Node && (related === field || field.contains(related))) {
      // Focus moved within the same field (two radios in one group), not out of it.
      return;
    }
    const shouldValidate = this.validate === 'blur' || (this.validate === 'submit' && this.hasFailedSubmission);
    if (shouldValidate) {
      this.validateField(field);
    }
  }

  /** Checkbox and Switch controls have no useful blur moment; under `blur` they validate on change instead. */
  private hasNoBlurMoment(event: Event): boolean {
    const origin = event.composedPath()[0];
    return (
      (origin instanceof HTMLInputElement && origin.type === 'checkbox') ||
      (origin instanceof Element && origin.getAttribute('role') === 'switch')
    );
  }

  private handleSummaryLinkClick(event: MouseEvent, name: string): void {
    event.preventDefault();
    this.queryFields()
      .find((candidate) => candidate.name === name)
      ?.focus();
  }

  private validateField(field: DsFormField): void {
    const next = { ...this.errors };
    if (field.disabled || field.checkValidity()) {
      delete next[field.name];
    } else {
      next[field.name] = field.validationMessage ?? '';
    }
    this.errors = next;
  }

  /** The collected field an event came from, or `null`. */
  private fieldFor(target: EventTarget | null): DsFormField | null {
    if (!(target instanceof Element)) {
      return null;
    }
    const el = target.closest<HTMLElement>(FIELD_SELECTOR);
    if (el === null || !this.contains(el)) {
      return null;
    }
    const field = el as DsFormField;
    return field.name && !this.isInsideClosedDisclosure(el) ? field : null;
  }

  /** Fields with a `name`, not inside a closed `ds-disclosure` without `keep-mounted`. */
  private queryFields(): DsFormField[] {
    return Array.from(this.querySelectorAll<HTMLElement>(FIELD_SELECTOR)).filter(
      (el): el is DsFormField => Boolean((el as DsFormField).name) && !this.isInsideClosedDisclosure(el),
    );
  }

  private isInsideClosedDisclosure(el: HTMLElement): boolean {
    let node = el.parentElement;
    while (node !== null && node !== this) {
      if (node.tagName === 'DS-DISCLOSURE') {
        const disclosure = node as HTMLElement & { currentOpen?: boolean | undefined; keepMounted?: boolean | undefined };
        if (!disclosure.keepMounted && !disclosure.currentOpen) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  /** A field missing an `id` gets `{name}-{field.name}`, so an error summary link always has somewhere to point. */
  private assignFieldIds(fields: readonly DsFormField[]): void {
    for (const field of fields) {
      if (!field.id) {
        field.id = `${this.idBase}-${field.name}`;
      }
    }
  }

  /** Disables every found field and `ds-button` inside, remembering which it disabled so re-enabling is exact. */
  private syncDisabled(): void {
    const controls = Array.from(
      this.querySelectorAll<HTMLElement & { disabled: boolean }>(`${FIELD_SELECTOR}, ds-button`),
    );
    for (const control of controls) {
      if (this.disabled) {
        if (!control.disabled) {
          this.disabledByForm.add(control);
          control.disabled = true;
        }
      } else if (this.disabledByForm.has(control)) {
        control.disabled = false;
        this.disabledByForm.delete(control);
      }
    }
  }

  /** Accessible name as plain host attributes, `labelledBy` winning over `label`. */
  private syncName(): void {
    if (this.labelledBy) {
      this.setAttribute('aria-labelledby', this.labelledBy);
      this.removeAttribute('aria-label');
    } else {
      this.removeAttribute('aria-labelledby');
      if (this.label) {
        this.setAttribute('aria-label', this.label);
      } else {
        this.removeAttribute('aria-label');
      }
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as FormOverridableBinding[]) {
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
    'ds-form': DsForm;
  }
}
