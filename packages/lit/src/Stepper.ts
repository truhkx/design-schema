import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';
export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** Shape of each entry in `steps`. */
export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  status?: StepperStepStatus;
}

/** Detail carried by the `step-select` CustomEvent. */
export interface StepperStepSelectDetail {
  id: string;
}

/** copy.stepOf */
const COPY_STEP_OF = 'Step {current} of {total}';
/** copy.complete */
const COPY_COMPLETE = 'completed';
/** copy.current */
const COPY_CURRENT = 'current step';
/** copy.error */
const COPY_ERROR = 'has an error';
/** copy.stepLabel */
const COPY_STEP_LABEL = 'Step {n}: {label}';

/** Below this inline size a horizontal stepper switches to `compact`. layout.maxWidth.prose (572px); literal-ok: a container-query condition cannot reference a custom property. */
const COMPACT_BREAKPOINT_PX = 572;

function formatStepOf(current: number, total: number): string {
  return COPY_STEP_OF.replace('{current}', String(current)).replace('{total}', String(total));
}

function formatStepLabel(n: number, label: string): string {
  return COPY_STEP_LABEL.replace('{n}', String(n)).replace('{label}', label);
}

function statusWord(status: StepperStepStatus): string | undefined {
  if (status === 'complete') return COPY_COMPLETE;
  if (status === 'current') return COPY_CURRENT;
  if (status === 'error') return COPY_ERROR;
  return undefined;
}

/** Overridable style hooks; see the `overrides` property. `indicatorBorder`, `indicatorCompleteBackground`, `indicatorCompleteForeground`, `indicatorCurrentBorder`, `indicatorErrorBackground`, `indicatorErrorForeground`, `indicatorErrorBorder`, `connectorComplete`, `labelColor`, `labelUpcomingColor`, `descriptionColor`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type StepperOverridableBinding =
  | 'indicatorSize'
  | 'indicatorBackground'
  | 'indicatorBorderWidth'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'connectorWidth'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

const HOOKS: Record<StepperOverridableBinding, string> = {
  indicatorSize: '--ds-stepper-indicator-size',
  indicatorBackground: '--ds-stepper-indicator-background',
  indicatorBorderWidth: '--ds-stepper-indicator-border-width',
  indicatorFontSize: '--ds-stepper-indicator-font-size',
  indicatorFontWeight: '--ds-stepper-indicator-font-weight',
  connector: '--ds-stepper-connector',
  connectorWidth: '--ds-stepper-connector-width',
  labelWeight: '--ds-stepper-label-weight',
  labelCurrentWeight: '--ds-stepper-label-current-weight',
  labelSize: '--ds-stepper-label-size',
  descriptionSize: '--ds-stepper-description-size',
  stepGap: '--ds-stepper-step-gap',
  partGap: '--ds-stepper-part-gap',
  fontFamily: '--ds-stepper-font-family', // literal-ok: CSS custom-property name, not a font stack
  transition: '--ds-stepper-transition',
};

/**
 * `<ds-stepper>` — Stepper (category: navigation).
 *
 * `<ds-stepper current="payment" .steps=${steps}>` renders a `<nav aria-label>`
 * wrapping an `<ol>` in its shadow root; each `<li>` holds an indicator
 * `<span aria-hidden>` (number, a check `<ds-icon>` when complete, or a danger
 * `<ds-icon>` on error), a connector `<span aria-hidden>` after all but the
 * last, and the label/description as `<ds-text>`. A step is a native `<button>`
 * when navigable (per `navigable`) or a plain `<div>` otherwise; either way it
 * carries `aria-current="step"` for the current step and an `aria-label` built
 * from `copy.stepLabel` plus the status word, so state is announced without
 * relying on the (decorative, `aria-hidden`) visible label text. Selecting a
 * navigable step fires a composed `step-select` CustomEvent with `{ id }` —
 * the stepper never changes `current` itself. Below `layout.maxWidth.prose` a
 * horizontal stepper switches to `compact` via a container query.
 *
 * ## When to use
 *
 * Use a Stepper for a flow with three to about seven ordered steps that each
 * fit on a screen: checkout, account setup, a report builder, a multi-part
 * application. Vertical with descriptions for flows that need explanation;
 * horizontal for short, familiar ones. Leave `navigable="completed"` so
 * people can correct earlier answers without losing later ones.
 *
 * ## When not to use
 *
 * Not for two steps (a Button that says "Continue" is enough) or more than
 * about eight (group them). Not Tabs — steps have an order and a current
 * position. Not task progress (ProgressBar), not a jump-anywhere settings nav
 * (a `nav` of Links).
 *
 * @fires step-select - Fired when a navigable step is chosen, with `{ id }` in `detail`. The container changes `current`; the stepper never changes it itself.
 * @csspart list - The `<ol>` (anatomy: list).
 * @csspart step - Each `<li>` (anatomy: step).
 * @csspart indicator - The step indicator (anatomy: indicator).
 * @csspart connector - The line between steps (anatomy: connector).
 * @csspart label - The step's label `<ds-text>` (anatomy: label).
 * @csspart description - The step's description `<ds-text>` (anatomy: description).
 */
@customElement('ds-stepper')
export class DsStepper extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      container-type: inline-size;
      font-family: var(--ds-stepper-font-family);
      --ds-stepper-indicator-size: var(--space-6);
      --ds-stepper-indicator-background: var(--color-control-background);
      --ds-stepper-indicator-border-width: var(--border-width-focus);
      --ds-stepper-indicator-font-size: var(--font-size-sm);
      --ds-stepper-indicator-font-weight: var(--font-weight-semibold);
      --ds-stepper-connector: var(--color-border);
      --ds-stepper-connector-width: var(--border-width-focus);
      --ds-stepper-label-weight: var(--font-weight-medium);
      --ds-stepper-label-current-weight: var(--font-weight-semibold);
      --ds-stepper-label-size: var(--font-size-sm);
      --ds-stepper-description-size: var(--font-size-xs);
      --ds-stepper-step-gap: var(--layout-gap-normal);
      --ds-stepper-part-gap: var(--space-2);
      --ds-stepper-font-family: var(--font-family-body);
      --ds-stepper-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    ol {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: var(--ds-stepper-step-gap);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    :host([orientation='vertical']) ol {
      flex-direction: column;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1 1 0%;
      gap: var(--ds-stepper-part-gap);
    }

    :host([orientation='vertical']) .step {
      flex-direction: row;
      align-items: flex-start;
      flex: none;
    }

    .indicator-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      inline-size: 100%;
    }

    :host([orientation='vertical']) .indicator-row {
      flex-direction: column;
      align-items: center;
      align-self: stretch;
      inline-size: auto;
    }

    /* indicatorSize: space.6; indicatorBorder: color.border.strong, locked */
    .indicator {
      box-sizing: border-box;
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--ds-stepper-indicator-size);
      block-size: var(--ds-stepper-indicator-size);
      border-radius: var(--radius-full);
      border: var(--ds-stepper-indicator-border-width) solid var(--color-border-strong);
      background: var(--ds-stepper-indicator-background);
      color: var(--color-foreground);
      font-size: var(--ds-stepper-indicator-font-size);
      font-weight: var(--ds-stepper-indicator-font-weight);
      line-height: 1;
      transition:
        background-color var(--ds-stepper-transition) var(--motion-easing-standard),
        border-color var(--ds-stepper-transition) var(--motion-easing-standard),
        color var(--ds-stepper-transition) var(--motion-easing-standard);
    }

    /* indicatorCurrentBorder: color.control.selectedBackground, locked */
    .indicator[data-status='current'] {
      border-color: var(--color-control-selected-background);
    }

    /* indicatorCompleteBackground / indicatorCompleteForeground: locked */
    .indicator[data-status='complete'] {
      background: var(--color-control-selected-background);
      border-color: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    /* indicatorErrorBackground / indicatorErrorForeground / indicatorErrorBorder: locked; the ring is the 3:1-guaranteed piece */
    .indicator[data-status='error'] {
      background: var(--color-status-danger-background);
      border-color: var(--color-status-danger-icon);
      color: var(--color-status-danger-foreground);
    }

    @media (prefers-reduced-motion: reduce) {
      .indicator {
        transition: none;
      }
    }

    /* connector: color.border; connectorWidth: border.width.focus */
    .connector {
      flex: 1 1 auto;
      align-self: center;
      block-size: var(--ds-stepper-connector-width);
      background: var(--ds-stepper-connector);
      transition: background-color var(--ds-stepper-transition) var(--motion-easing-standard);
    }

    :host([orientation='vertical']) .connector {
      inline-size: var(--ds-stepper-connector-width);
      block-size: auto;
      min-block-size: var(--ds-stepper-indicator-size);
    }

    /* connectorComplete: color.control.selectedBackground, locked */
    .connector[data-complete] {
      background: var(--color-control-selected-background);
    }

    @media (prefers-reduced-motion: reduce) {
      .connector {
        transition: none;
      }
    }

    .control {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ds-stepper-part-gap);
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      font: inherit;
    }

    :host([orientation='vertical']) .control {
      align-items: flex-start;
    }

    button.control {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    button.control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .label-wrap {
      display: inline;
    }

    :host([compact]) .label-wrap {
      display: none;
    }
    :host([compact]) .control[aria-current='step'] .label-wrap {
      display: inline;
    }

    .description-wrap {
      display: inline;
    }
    :host(:not([orientation='vertical'])) .description-wrap {
      display: none;
    }

    .step-of {
      display: none;
      margin: 0;
      padding-block-start: var(--ds-stepper-part-gap);
      font-family: var(--ds-stepper-font-family);
      font-size: var(--ds-stepper-label-size);
      font-weight: var(--ds-stepper-label-current-weight);
      color: var(--color-foreground);
    }

    :host([compact]) .step-of {
      display: block;
    }

    @container (max-width: ${unsafeCSS(COMPACT_BREAKPOINT_PX)}px) {
      :host([orientation='horizontal']) .label-wrap {
        display: none;
      }
      :host([orientation='horizontal']) .control[aria-current='step'] .label-wrap {
        display: inline;
      }
      :host([orientation='horizontal']) .step-of {
        display: block;
      }
    }
  `;

  /** The steps in order. A property, not an attribute. */
  @property({ attribute: false }) steps: StepperStep[] = [];

  /** The id of the current step. */
  @property({ reflect: true }) current = '';

  /** Vertical shows descriptions under each label; horizontal collapses to `compact` below the prose width. */
  @property({ reflect: true }) orientation: StepperOrientation = 'horizontal';

  /** Which steps are focusable controls: `none`, `completed` (the usual — go back, not skip ahead), or `all`. */
  @property({ reflect: true }) navigable: StepperNavigable = 'completed';

  /** Show only the current step's label and "Step n of m"; the indicators stay. Automatic on narrow horizontal steppers. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Accessible name of the navigation landmark. */
  @property() label = 'Progress';

  /** Per-instance style overrides: `{ transition: 'motion.duration.slow' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<StepperOverridableBinding, TokenRef>>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Stepper');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.warnInDev();
  }

  protected override render() {
    const steps = this.steps;
    const total = steps.length;
    const currentIndex = steps.findIndex((step) => step.id === this.current);

    return html`
      <nav aria-label=${this.label}>
        <ol part="list">${steps.map((step, index) => this.renderStep(step, index, currentIndex, total))}</ol>
        <p class="step-of">${formatStepOf(currentIndex + 1, total)}</p>
      </nav>
    `;
  }

  private renderStep(step: StepperStep, index: number, currentIndex: number, total: number) {
    const status: StepperStepStatus =
      step.status ?? (index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming');
    const isCurrentStep = step.id === this.current;
    const navigable = this.isNavigable(index, currentIndex);
    const n = index + 1;
    const word = statusWord(status);
    const accessibleLabel = word ? `${formatStepLabel(n, step.label)}, ${word}` : formatStepLabel(n, step.label);
    const hasDescription = step.description !== undefined && step.description !== '';
    const descId = `${step.id}-description`;
    const align = this.orientation === 'vertical' ? 'start' : 'center';

    const content = html`
      <span class="label-wrap">
        <ds-text
          class="label"
          part="label"
          element="span"
          size="sm"
          align=${align}
          weight=${isCurrentStep ? 'semibold' : 'medium'}
          tone=${status === 'upcoming' ? 'muted' : 'default'}
          .overrides=${this.textOverrides('label', isCurrentStep)}
        >
          ${step.label}
        </ds-text>
      </span>
      ${hasDescription
        ? html`<span class="description-wrap">
            <ds-text
              id=${descId}
              class="description"
              part="description"
              element="span"
              size="xs"
              align=${align}
              tone="muted"
              .overrides=${this.textOverrides('description', isCurrentStep)}
            >
              ${step.description}
            </ds-text>
          </span>`
        : nothing}
    `;

    const control = navigable
      ? html`<button
          type="button"
          class="control"
          aria-label=${accessibleLabel}
          aria-describedby=${ifDefined(hasDescription ? descId : undefined)}
          aria-current=${ifDefined(isCurrentStep ? 'step' : undefined)}
          @click=${() => this.handleStepClick(step)}
        >
          ${content}
        </button>`
      : html`<div
          class="control"
          aria-label=${accessibleLabel}
          aria-describedby=${ifDefined(hasDescription ? descId : undefined)}
          aria-current=${ifDefined(isCurrentStep ? 'step' : undefined)}
        >
          ${content}
        </div>`;

    return html`
      <li class="step" part="step">
        <span class="indicator-row">
          <span class="indicator" part="indicator" data-status=${status} aria-hidden="true">
            ${this.renderIndicator(status, n)}
          </span>
          ${index < total - 1
            ? html`<span class="connector" part="connector" aria-hidden="true" ?data-complete=${status === 'complete'}></span>`
            : nothing}
        </span>
        ${control}
      </li>
    `;
  }

  private renderIndicator(status: StepperStepStatus, n: number) {
    if (status === 'complete') {
      return html`<ds-icon name="check" inline></ds-icon>`;
    }
    if (status === 'error') {
      return html`<ds-icon name="danger" inline></ds-icon>`;
    }
    return `${n}`;
  }

  private isNavigable(index: number, currentIndex: number): boolean {
    if (this.navigable === 'none') {
      return false;
    }
    if (this.navigable === 'all') {
      return true;
    }
    return index < currentIndex;
  }

  private handleStepClick(step: StepperStep): void {
    this.dispatchEvent(
      new CustomEvent<StepperStepSelectDetail>('step-select', {
        detail: { id: step.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Forwards this component's own overrides down to a composed `<ds-text>`'s `overrides` property. */
  private textOverrides(
    kind: 'label' | 'description',
    isCurrentStep: boolean,
  ): Partial<Record<TextOverridableBinding, TokenRef>> | undefined {
    const source = this.overrides;
    if (!source) {
      return undefined;
    }
    const result: Partial<Record<TextOverridableBinding, TokenRef>> = {};
    if (source.fontFamily) {
      result.fontFamily = source.fontFamily;
    }
    if (kind === 'label') {
      const weightRef = isCurrentStep ? source.labelCurrentWeight : source.labelWeight;
      if (weightRef) {
        result.fontWeight = weightRef;
      }
      if (source.labelSize) {
        result.fontSize = source.labelSize;
      }
    } else if (source.descriptionSize) {
      result.fontSize = source.descriptionSize;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as StepperOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (this.steps.length === 0) {
      console.warn('<ds-stepper> requires at least one entry in `steps`.', this);
    }
    if (this.current && !this.steps.some((step) => step.id === this.current)) {
      console.warn('<ds-stepper> `current` does not match any step id.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-stepper': DsStepper;
  }
}
