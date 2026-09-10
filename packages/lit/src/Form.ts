import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';

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
 * `<ds-form>`: `ds-input`, `ds-checkbox`, `ds-switch` and `ds-radio-group` all
 * satisfy it. `error` and `validationMessage` are set by `ds-switch` only in
 * spirit — it never has anything invalid to report, so both stay `undefined`
 * at runtime even though the type says otherwise; Form treats a missing
 * message as `''`.
 */
export interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error: string | undefined;
  readonly currentValue: string | boolean | null;
  focus(): void;
  checkValidity(): boolean;
  readonly validationMessage: string;
}

/** Overridable style hooks; see the `overrides` property. `errorSummaryText` and `errorSummaryBackground` are locked and excluded. */
export type FormOverridableBinding = 'gap' | 'errorSummaryBorder';

const HOOKS: Record<FormOverridableBinding, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
};

/** copy.summaryHeading / copy.summaryHeadingOne */
const COPY_SUMMARY_HEADING = (count: number): string => `${count} problems with this form`;
const COPY_SUMMARY_HEADING_ONE = '1 problem with this form';

const FIELD_TAGS: ReadonlySet<string> = new Set(['DS-INPUT', 'DS-CHECKBOX', 'DS-SWITCH', 'DS-RADIO-GROUP']);
const FIELD_SELECTOR = 'ds-input, ds-checkbox, ds-switch, ds-radio-group';
const CONTROL_SELECTOR = `${FIELD_SELECTOR}, ds-button`;

let formInstanceCount = 0;

/** `ElementInternals` with the cross-root ARIA reflection Chromium ships; not yet in every DOM lib. */
type LabelledInternals = ElementInternals & { ariaLabelledByElements?: Element[] | null };

/**
 * `<ds-form>` — Form (category: container).
 *
 * `<ds-form name="sign-in" label="Sign in">` wraps a native `<form novalidate>`
 * in its shadow root, with a default slot for fields (Input etc. and layout
 * like Stack) and a named `actions` slot for the action row, but form
 * ownership is DOM-tree based, so the slotted fields are not owned by it.
 * Instead it collects light-DOM `ds-input`, `ds-checkbox`, `ds-switch` and
 * `ds-radio-group` descendants that have a `name` and implement `DsFormField`
 * (skipping any inside a closed `ds-disclosure` without `keep-mounted`),
 * submits on a composed `press` from a `ds-button[type=submit]` and on Enter
 * in a `ds-input` (a `keydown` listener, never a CustomEvent named after a
 * native event), and propagates `disabled` to every field and `ds-button`
 * descendant, remembering which ones it disabled so it never re-enables a
 * field that was already disabled on its own. The host takes `role="form"`
 * and its accessible name (via `ElementInternals`, `labelledBy` winning over
 * `label`) so the landmark lives in the light DOM tree. Dispatches composed
 * `submit` (`{ values }`) and `invalid` (`{ errors }`) CustomEvents; never
 * navigates. Never nest a `<ds-form>` inside another.
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
 * @csspart container - The native `<form>` (anatomy: container).
 * @csspart errorSummary - The focusable error summary region, shown after a failed submission (anatomy: errorSummary).
 * @csspart fields - The default slot wrapping fields (anatomy: fields).
 * @csspart actions - The named `actions` slot, rendered after the fields with the form gap (anatomy: actions).
 */
@customElement('ds-form')
export class DsForm extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-form-gap: var(--layout-gap-loose);
      --ds-form-error-summary-border: var(--color-border-danger);
    }

    :host([hidden]) {
      display: none;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--ds-form-gap);
      margin: 0;
      padding: 0;
    }

    /* errorSummaryBackground / errorSummaryText: color.background.subtle / color.foreground.danger, locked */
    .summary {
      box-sizing: border-box;
      padding-block: var(--space-md);
      padding-inline: var(--space-md);
      border: var(--border-width-thin) solid var(--ds-form-error-summary-border);
      border-radius: var(--radius-md);
      background: var(--color-background-subtle);
      color: var(--color-foreground-danger);
    }

    .summary:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .heading {
      margin-block-end: var(--space-sm);
    }

    .list {
      margin: 0;
      padding-inline-start: var(--space-lg);
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-normal);
    }

    .link {
      color: var(--color-foreground-danger);
      text-decoration: underline;
    }

    .link:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }
  `;

  /** Identifier for the form, used for analytics and as the base of generated field ids. */
  @property() name = '';

  /** Accessible name for the form landmark. Required when a page has more than one form and `labelledBy` is not set. */
  @property() label?: string;

  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  @property() labelledBy?: string;

  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  @property() validate: FormValidate = 'submit';

  /** Disables every field and action inside. Use while submitting. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** When submission fails validation, render a summary of errors above the fields that links to each field. */
  @property({ type: Boolean, attribute: 'error-summary' }) errorSummary = true;

  /** Per-instance style overrides: `{ gap: 'layout.gap.normal' }`. Locked bindings (errorSummaryText, errorSummaryBackground) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<FormOverridableBinding, TokenRef>>;

  /** Field name -> message, for fields that have failed validation. */
  @state() private errors: Record<string, string> = {};

  /** Once a submission has failed, fields re-validate on blur/change even in `submit` mode. */
  private hasFailedSubmission = false;

  /** Fields and actions this Form disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByForm = new WeakSet<HTMLElement>();

  /** Re-syncs disabled propagation when fields are added or removed anywhere in the subtree. */
  private readonly mutationObserver = new MutationObserver(() => this.syncDisabled());

  /** Focus the error summary once it exists, after the render that follows a failed submission. */
  private pendingSummaryFocus = false;

  private readonly instanceId = `ds-form-${++formInstanceCount}`;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get idBase(): string {
    return this.name || this.instanceId;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Form');
    this.mutationObserver.observe(this, { childList: true, subtree: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver.disconnect();
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
    if (changed.has('label') || changed.has('labelledBy')) {
      this.syncLabelInternals();
    }
    if (this.pendingSummaryFocus) {
      this.pendingSummaryFocus = false;
      this.renderRoot.querySelector<HTMLElement>('#summary')?.focus();
    }
  }

  protected override render() {
    const errorEntries = Object.entries(this.errors);
    const showSummary = this.errorSummary && errorEntries.length > 0;
    const fieldsByName = new Map(this.queryFields().map((field) => [field.name, field] as const));
    const heading =
      errorEntries.length === 1 ? COPY_SUMMARY_HEADING_ONE : COPY_SUMMARY_HEADING(errorEntries.length);

    return html`
      <form
        id="form"
        part="container"
        novalidate
        name=${ifDefined(this.name || undefined)}
        @keydown=${this.handleKeydown}
        @change=${this.handleFieldChange}
        @focusout=${this.handleFieldFocusOut}
        @press=${this.handlePress}
      >
        ${showSummary
          ? html`
              <div id="summary" class="summary" part="errorSummary" role="alert" tabindex="-1">
                <ds-text class="heading" element="p" weight="semibold" tone="danger">${heading}</ds-text>
                <ul class="list">
                  ${errorEntries.map(([name, message]) => {
                    const field = fieldsByName.get(name);
                    const text = field ? `${field.label}: ${message}` : message;
                    return html`
                      <li>
                        <a
                          class="link"
                          href=${field ? `#${field.id}` : '#'}
                          @click=${(event: MouseEvent) => this.handleSummaryLinkClick(event, name)}
                          >${text}</a
                        >
                      </li>
                    `;
                  })}
                </ul>
              </div>
            `
          : nothing}
        <slot part="fields"></slot>
        <slot name="actions" part="actions"></slot>
      </form>
    `;
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
        if (value !== null) {
          values[field.name] = value;
        }
      } else {
        errors[field.name] = field.validationMessage || '';
        if (firstInvalid === undefined) {
          firstInvalid = field;
        }
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

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.tagName !== 'DS-INPUT') {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private handlePress(event: Event): void {
    const target = event.target as HTMLElement & { type?: string };
    if (target.tagName !== 'DS-BUTTON' || target.type !== 'submit') {
      return;
    }
    this.submit();
  }

  private handleFieldChange(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.isTrackedField(target)) {
      return;
    }
    const isCheckboxLike = target.tagName === 'DS-SWITCH' || target.tagName === 'DS-CHECKBOX';
    const shouldValidate =
      this.validate === 'change' ||
      (this.validate === 'blur' && isCheckboxLike) ||
      (this.validate === 'submit' && this.hasFailedSubmission);
    if (shouldValidate) {
      this.validateField(target as unknown as DsFormField);
    }
  }

  private handleFieldFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (!this.isTrackedField(target)) {
      return;
    }
    if (target.tagName === 'DS-SWITCH' || target.tagName === 'DS-CHECKBOX') {
      // No useful blur moment; these validate on change instead.
      return;
    }
    if (event.relatedTarget === target) {
      // Composed retargeting: focus moved between two radios in the same ds-radio-group,
      // not out of the group, so this is not the "focus left the whole group" moment.
      return;
    }
    const shouldValidate = this.validate === 'blur' || (this.validate === 'submit' && this.hasFailedSubmission);
    if (shouldValidate) {
      this.validateField(target as unknown as DsFormField);
    }
  }

  private handleSummaryLinkClick(event: MouseEvent, name: string): void {
    event.preventDefault();
    const field = this.queryFields().find((candidate) => candidate.name === name);
    field?.focus();
  }

  private validateField(field: DsFormField): void {
    const next = { ...this.errors };
    if (field.disabled || field.checkValidity()) {
      delete next[field.name];
    } else {
      next[field.name] = field.validationMessage || '';
    }
    this.errors = next;
  }

  private isTrackedField(el: HTMLElement): boolean {
    if (!FIELD_TAGS.has(el.tagName)) {
      return false;
    }
    const field = el as unknown as DsFormField;
    if (!field.name) {
      return false;
    }
    return !this.isInsideClosedDisclosure(el);
  }

  /** Fields with a `name`, not inside a closed `ds-disclosure` without `keep-mounted`. */
  private queryFields(): DsFormField[] {
    const candidates = Array.from(this.querySelectorAll<HTMLElement>(FIELD_SELECTOR));
    const fields: DsFormField[] = [];
    for (const candidate of candidates) {
      const field = candidate as unknown as DsFormField;
      if (!field.name) {
        continue;
      }
      if (this.isInsideClosedDisclosure(candidate)) {
        continue;
      }
      fields.push(field);
    }
    return fields;
  }

  private isInsideClosedDisclosure(el: HTMLElement): boolean {
    let node = el.parentElement;
    while (node !== null && node !== this) {
      if (node.tagName === 'DS-DISCLOSURE') {
        const disclosure = node as HTMLElement & { currentOpen?: boolean; keepMounted?: boolean };
        if (!disclosure.keepMounted && !disclosure.currentOpen) {
          return true;
        }
      }
      node = node.parentElement;
    }
    return false;
  }

  /** `name` is the base for a generated id, so an error summary link always has somewhere to point. */
  private assignFieldIds(fields: readonly DsFormField[]): void {
    for (const field of fields) {
      if (!field.id) {
        field.id = `${this.idBase}-${field.name}`;
      }
    }
  }

  /** Disables every field and `ds-button` inside, remembering which it disabled so re-enabling is exact. */
  private syncDisabled(): void {
    const controls = Array.from(this.querySelectorAll<HTMLElement & { disabled: boolean }>(CONTROL_SELECTOR));
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

  /** Landmark role + accessible name, `labelledBy` winning over `label`, via ElementInternals so it lives in the light DOM. */
  private syncLabelInternals(): void {
    this.internals.role = 'form';
    const internals = this.internals as LabelledInternals;
    if (this.labelledBy) {
      const root = this.getRootNode() as Document | ShadowRoot;
      const target = root.getElementById(this.labelledBy);
      if ('ariaLabelledByElements' in internals) {
        internals.ariaLabelledByElements = target ? [target] : null;
      }
      internals.ariaLabel = null;
    } else {
      if ('ariaLabelledByElements' in internals) {
        internals.ariaLabelledByElements = null;
      }
      internals.ariaLabel = this.label ?? null;
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
