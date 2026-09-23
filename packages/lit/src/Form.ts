import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Link.js';
import './Stack.js';

export type FormValidate = 'submit' | 'blur' | 'change';

/** Detail carried by the `submit` CustomEvent. */
export interface FormSubmitDetail {
  values: Record<string, string | number | boolean | string[] | [number, number]>;
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
 * `currentValue` is `null` when the field contributes no key (empty, unchecked,
 * unselected).
 */
export interface DsFormField extends HTMLElement {
  name: string;
  label: string;
  required: boolean;
  disabled: boolean;
  error?: string | undefined;
  /**
   * Set by Form from the result of `checkValidity()`, which is how the field
   * renders its own message (every field documents `invalid` as "usually set by
   * the Form"). Optional: a field that never validates omits it.
   */
  invalid?: boolean | undefined;
  readonly currentValue: string | number | boolean | string[] | [number, number] | null;
  id: string;
  focus(): void;
  checkValidity(): boolean;
  readonly validationMessage?: string | undefined;
}

/** Overridable style hooks; see the `overrides` property. `errorSummaryText` and `errorSummaryBackground` are locked and excluded. */
export type FormOverridableBinding =
  | 'gap'
  | 'errorSummaryBorder'
  | 'errorSummaryBorderWidth'
  | 'errorSummaryRadius'
  | 'errorSummaryPadding'
  | 'errorSummaryGap';

/** `errorSummaryGap` has no hook: it is forwarded to the summary Stacks' `overrides.gap`. */
const HOOKS: Record<Exclude<FormOverridableBinding, 'errorSummaryGap'>, string> = {
  gap: '--ds-form-gap',
  errorSummaryBorder: '--ds-form-error-summary-border',
  errorSummaryBorderWidth: '--ds-form-error-summary-border-width',
  errorSummaryRadius: '--ds-form-error-summary-radius',
  errorSummaryPadding: '--ds-form-error-summary-padding',
};

type FieldValue = FormSubmitDetail['values'][string];

/** A null, empty-string or empty-array value contributes no key. */
function isEmptyValue(value: FieldValue | null | undefined): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/** copy.summaryHeading, plural by `count`. */
const COPY_SUMMARY_HEADING: Record<'one' | 'other', string> = {
  one: '1 problem with this form',
  other: '{count} problems with this form',
};

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

type Disableable = HTMLElement & { disabled: boolean };

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
 * a `ds-button[type=submit]` and on Enter in any field (a `keydown` listener on
 * the host, never a CustomEvent named after a native event), and propagates
 * `disabled` to the fields it found and to every `ds-button` slotted into
 * `actions`, remembering which ones it disabled so it never re-enables one
 * already disabled on its own. The host carries `role="form"` and
 * `aria-label` / `aria-labelledby` (`labelledBy` winning over `label`) as plain
 * attributes, so the landmark lives in the light DOM tree. Dispatches composed
 * `submit` (`{ values }`) and `invalid` (`{ errors }`) CustomEvents; never
 * navigates. Never nest inside a native form or another `<ds-form>`.
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
      --ds-form-gap: var(--layout-gap-loose);
      --ds-form-error-summary-border: var(--color-border-danger);
      --ds-form-error-summary-border-width: var(--border-width-thin);
      --ds-form-error-summary-radius: var(--radius-md);
      --ds-form-error-summary-padding: var(--space-md);
      /* Locked: no overrides key, but the hook stays so a page stylesheet or the naming codemod can reach it. */
      --ds-form-error-summary-text: var(--color-foreground-danger);
      --ds-form-error-summary-background: var(--color-background-subtle);
      --ds-form-error-summary-line-height: var(--font-line-height-normal);
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

    /* A bare single action keeps its own width instead of stretching across the column. */
    slot[name='actions'] {
      display: flex;
      align-items: flex-start;
    }

    /* errorSummaryBackground / errorSummaryText / errorSummaryLineHeight are locked: out of the
       overrides type, but read through their :host hooks like every other binding. */
    [data-part='errorSummary'] {
      box-sizing: border-box;
      padding: var(--ds-form-error-summary-padding);
      border: var(--ds-form-error-summary-border-width) solid var(--ds-form-error-summary-border);
      border-radius: var(--ds-form-error-summary-radius);
      background: var(--ds-form-error-summary-background);
      color: var(--ds-form-error-summary-text);
      /* The item Links are bare text in this box, so without this they inherit the document's
         line-height: normal and each link's box falls under the 24px target floor (WCAG 2.5.8).
         Form may not give the Links a target of their own, so the box sets the body rhythm and the
         Links inherit it, as they inherit the danger color. Locked for exactly that reason. */
      line-height: var(--ds-form-error-summary-line-height);
    }

    [data-part='errorSummary']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }
  `;

  /** Identifier for the form, used for analytics and as the base of generated field ids. */
  @property() accessor name = '';

  /** Accessible name for the form landmark. Required when a page has more than one form and `labelledBy` is not set. */
  @property() accessor label: string | undefined;

  /** Id of a visible Heading that names the form. Wins over `label` when both are set. */
  @property({ attribute: 'labelled-by' }) accessor labelledBy: string | undefined;

  /** When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms. */
  @property() accessor validate: FormValidate = 'submit';

  /** Disables every field and action inside. Use while submitting. The container applies no opacity of its own. */
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

  /**
   * Field name -> message for the error summary: document order at the failed submit, with errors that
   * blur or change validation finds later appended at the end. Empty until a submission fails.
   */
  @state() private accessor errors: ReadonlyMap<string, string> = new Map();

  /** Each errored field's `label` as registered, so an entry whose field has since gone keeps its fallback text. */
  private readonly errorLabels = new Map<string, string>();

  /** Once a submission has failed, fields re-validate on blur/change even in `submit` mode; a successful one clears it. */
  private hasFailedSubmission = false;

  /** The plural locale, read at the failed submit (nearest `lang` ancestor, else the runtime default). */
  private summaryLocale: string | undefined;

  /** Fields and actions this Form disabled itself, so re-enabling never touches one already disabled by the consumer. */
  private readonly disabledByForm = new Set<Disableable>();

  /** Fields this Form marked invalid, so re-validating never clears one the consumer marked itself. */
  private readonly invalidByForm = new Set<DsFormField>();

  /** Re-syncs disabled propagation when fields are added or removed; observes `childList` only, never the attributes it writes. */
  private readonly mutationObserver = new MutationObserver(() => {
    if (this.disabled) this.syncDisabled();
  });

  /** Focus the error summary once it exists, after the render that follows a failed submission. */
  private pendingSummaryFocus = false;

  private readonly instanceId = `ds-form-${++formInstanceCount}`;

  /** The forbidden-nesting dev warning is emitted once per element, not on every reconnection. */
  private warnedAboutNesting = false;

  constructor() {
    super();
    this.addEventListener('keydown', (event) => this.handleKeydown(event));
    this.addEventListener('press', (event) => this.handlePress(event));
    this.addEventListener('change', (event) => this.handleFieldChange(event));
    this.addEventListener('focusout', (event) => this.handleFieldFocusOut(event));
  }

  private get idBase(): string {
    return this.name || this.instanceId;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Form');
    if (this.getAttribute('role') !== 'form') this.setAttribute('role', 'form');
    this.mutationObserver.observe(this, { childList: true, subtree: true });
    if (import.meta.env.DEV && !this.warnedAboutNesting && this.parentElement?.closest('form, ds-form')) {
      this.warnedAboutNesting = true;
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
    const errorEntries = Array.from(this.errors);
    const showSummary = this.errorSummary && this.hasFailedSubmission && errorEntries.length > 0;

    return html`
      <form
        part="container"
        data-part="container"
        novalidate
        name=${ifDefined(this.name || undefined)}
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
    // errorSummaryGap is forwarded to both Stacks; their `gap="tight"` is the binding's default token.
    const gapRef = this.overrides?.errorSummaryGap;
    const stackOverrides = gapRef === undefined ? undefined : { gap: gapRef };
    return html`
      <div
        part="errorSummary"
        data-part="errorSummary"
        id=${`${this.idBase}-error-summary`}
        role="alert"
        tabindex="-1"
      >
        <ds-stack gap="tight" .overrides=${stackOverrides}>
          <ds-text element="p" weight="semibold" tone="danger">${this.summaryHeading(errorEntries.length)}</ds-text>
          <ds-stack element="ul" gap="tight" .overrides=${stackOverrides}>
            ${errorEntries.map(([name, message]) => {
              const field = fieldsByName.get(name);
              // The field's own message verbatim; its label only when the message is empty.
              const text = message || (field?.label ?? this.errorLabels.get(name)) || name;
              // A field that has since unregistered keeps its entry as plain danger Text, with no Link.
              if (field === undefined) {
                return html`<ds-text tone="danger">${text}</ds-text>`;
              }
              return html`
                <ds-link
                  tone="inherit"
                  href=${`#${field.id}`}
                  label=${text}
                  @click=${(event: MouseEvent) => this.handleSummaryLinkClick(event, name)}
                ></ds-link>
              `;
            })}
          </ds-stack>
        </ds-stack>
      </div>
    `;
  }

  /**
   * copy.summaryHeading, pluralised by `count` in the locale read at the failed submit. A `lang` tag
   * `Intl.PluralRules` rejects falls back to the runtime default locale rather than throwing.
   */
  private summaryHeading(count: number): string {
    let rules: Intl.PluralRules;
    try {
      rules = new Intl.PluralRules(this.summaryLocale);
    } catch {
      rules = new Intl.PluralRules();
    }
    const form = rules.select(count) === 'one' ? 'one' : 'other';
    return COPY_SUMMARY_HEADING[form].replace('{count}', String(count));
  }

  /** Validate every field and, only if all pass, dispatch `submit` with the collected values. */
  submit(): void {
    if (this.disabled) {
      return;
    }
    const fields = this.queryFields();
    this.assignFieldIds(fields);

    const errors = new Map<string, string>();
    this.errorLabels.clear();
    const values: FormSubmitDetail['values'] = {};
    let firstInvalid: DsFormField | undefined;

    for (const field of fields) {
      if (field.disabled) {
        continue;
      }
      if (this.runFieldValidation(field)) {
        const value = field.currentValue;
        if (!isEmptyValue(value)) {
          values[field.name] = value as FieldValue;
        }
      } else {
        errors.set(field.name, field.validationMessage ?? '');
        this.errorLabels.set(field.name, field.label);
        firstInvalid ??= field;
      }
    }

    this.errors = errors;

    if (firstInvalid !== undefined) {
      this.hasFailedSubmission = true;
      this.summaryLocale = this.closest('[lang]')?.getAttribute('lang') || undefined;
      this.dispatchEvent(
        new CustomEvent<FormInvalidDetail>('invalid', {
          detail: { errors: Object.fromEntries(errors) },
          bubbles: true,
          composed: true,
        }),
      );
      if (this.errorSummary) {
        this.pendingSummaryFocus = true;
      } else {
        firstInvalid.focus();
      }
      return;
    }

    // A successful submission removes the summary.
    this.hasFailedSubmission = false;
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
    if (this.fieldFor(event.target) === null) {
      return;
    }
    // Enter in a multi-line control inserts a line break; on a button or link it activates it.
    const origin = event.composedPath()[0];
    if (
      origin instanceof HTMLTextAreaElement ||
      origin instanceof HTMLButtonElement ||
      origin instanceof HTMLAnchorElement
    ) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  private handlePress(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName !== 'DS-BUTTON') {
      return;
    }
    if ((target as HTMLElement & { type?: string | undefined }).type !== 'submit') {
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
      (this.validate === 'blur' && this.validatesOnChange(field)) ||
      this.hasFailedSubmission;
    if (shouldValidate) {
      this.validateField(field);
    }
  }

  private handleFieldFocusOut(event: FocusEvent): void {
    const field = this.fieldFor(event.target);
    if (field === null) {
      return;
    }
    const related = event.relatedTarget;
    if (related instanceof Node && (related === field || field.contains(related))) {
      // Focus moved within the same field (two radios in one group), not out of it.
      return;
    }
    const shouldValidate =
      (this.validate === 'blur' && !this.validatesOnChange(field)) || this.hasFailedSubmission;
    if (shouldValidate) {
      this.validateField(field);
    }
  }

  /**
   * Runs the field's own synchronous validation and mirrors the result onto its
   * `invalid` property, which is what makes the field render its own message.
   * Form never composes a message of its own: the text shown is the field's
   * copy, and `validationMessage` is what the summary repeats.
   */
  private runFieldValidation(field: DsFormField): boolean {
    // Clear only a flag this Form set, so the field's validity is measured
    // afresh while an `invalid` the consumer set itself still counts as a
    // failure (a field's `invalid` is both an input to and a result of
    // validation, so a blanket clear would erase consumer state and a blanket
    // set would be sticky forever).
    if (this.invalidByForm.has(field) && field.invalid === true) {
      field.invalid = false;
    }
    const valid = field.checkValidity();
    if (typeof field.invalid === 'boolean') {
      if (!valid) {
        field.invalid = true;
        this.invalidByForm.add(field);
      } else {
        this.invalidByForm.delete(field);
      }
    }
    return valid;
  }

  /** A field with no useful blur moment (Checkbox, Switch) declares `data-ds-field="change"`. */
  private validatesOnChange(field: DsFormField): boolean {
    return field.getAttribute('data-ds-field') === 'change';
  }

  private handleSummaryLinkClick(event: MouseEvent, name: string): void {
    // Moves focus to the field; never navigates or changes the URL hash.
    event.preventDefault();
    this.queryFields()
      .find((candidate) => candidate.name === name)
      ?.focus();
  }

  /**
   * Runs the field's own validation (the field shows its error). The summary only tracks it after a failed
   * submission: a fixed field drops out, a still-listed one keeps its place, a newly invalid one is appended.
   */
  private validateField(field: DsFormField): void {
    const invalid = !field.disabled && !this.runFieldValidation(field);
    if (!this.hasFailedSubmission) {
      return;
    }
    const next = new Map(this.errors);
    if (invalid) {
      next.set(field.name, field.validationMessage ?? '');
      this.errorLabels.set(field.name, field.label);
    } else {
      next.delete(field.name);
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

  /** Fields with a `name`, in document order, not inside a closed `ds-disclosure` without `keep-mounted`. */
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

  /** Every `ds-button` slotted into `actions`, including the slotted element itself. */
  private queryActionButtons(): Disableable[] {
    const buttons: Disableable[] = [];
    for (const child of Array.from(this.children)) {
      if (child.getAttribute('slot') !== 'actions') continue;
      if (child.tagName === 'DS-BUTTON') buttons.push(child as Disableable);
      buttons.push(...Array.from(child.querySelectorAll<Disableable>('ds-button')));
    }
    return buttons;
  }

  /** Disables every found field and action button, remembering which it disabled so re-enabling is exact. */
  private syncDisabled(): void {
    if (this.disabled) {
      for (const control of [...this.queryFields(), ...this.queryActionButtons()] as Disableable[]) {
        if (!control.disabled) {
          this.disabledByForm.add(control);
          control.disabled = true;
        }
      }
      return;
    }
    for (const control of this.disabledByForm) {
      if (control.disabled) control.disabled = false;
    }
    this.disabledByForm.clear();
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
    for (const binding of Object.keys(HOOKS) as (keyof typeof HOOKS)[]) {
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
