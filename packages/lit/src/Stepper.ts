import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';
export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** One step of the flow (`steps` shape). */
export interface StepperStep {
  id: string;
  label: string;
  description?: string | undefined;
  status?: 'complete' | 'current' | 'upcoming' | 'error' | undefined;
}

/** Detail carried by the `step-select` CustomEvent. */
export interface StepperStepSelectDetail {
  /** The id of the chosen step. */
  id: string;
}

const COPY = {
  navLabel: 'Progress',
  stepOf: 'Step {current} of {total}',
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
  stepLabel: 'Step {n}: {label}',
} as const;

const STATUS_WORD: Record<StepperStepStatus, string | undefined> = {
  complete: COPY.complete,
  current: COPY.current,
  error: COPY.error,
  upcoming: undefined,
};

/** layout.maxWidth.prose: a container-query condition cannot read a custom property. */
const PROSE_WIDTH_PX = 572; // literal-ok: breakpoint from layout.maxWidth.prose

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type StepperOverridableBinding =
  | 'indicatorSize'
  | 'indicatorBackground'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'stepHover'
  | 'stepRadius'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

/** Hooks owned by the host. Label and description typography is forwarded to the composed `<ds-text>`'s `overrides`. */
const HOOKS: Partial<Record<StepperOverridableBinding, string>> = {
  indicatorSize: '--ds-stepper-indicator-size',
  indicatorBackground: '--ds-stepper-indicator-background',
  indicatorFontSize: '--ds-stepper-indicator-font-size',
  indicatorFontWeight: '--ds-stepper-indicator-font-weight',
  connector: '--ds-stepper-connector',
  stepHover: '--ds-stepper-step-hover',
  stepRadius: '--ds-stepper-step-radius',
  stepGap: '--ds-stepper-step-gap',
  partGap: '--ds-stepper-part-gap',
  fontFamily: '--ds-stepper-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-stepper-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status) return step.status;
  if (currentIndex === -1 || index > currentIndex) return 'upcoming';
  return index < currentIndex ? 'complete' : 'current';
}

/**
 * `<ds-stepper>` — Stepper (category: navigation).
 *
 * `<ds-stepper current="payment" .steps=${steps}>` renders a shadow `<nav aria-label>` wrapping an
 * `<ol>`. Each `<li>` holds a control — its own native `<button>` when the step is navigable, a `<div>`
 * otherwise — containing the indicator (number, `check` or `danger` icon), the label and (vertical)
 * description as `<ds-text>`, and a visually-hidden status word; a connector follows all but the last
 * step. The current step's control carries `aria-current="step"`. Choosing a navigable step fires a
 * composed `step-select` with `{ id }`; the stepper never changes `current` itself. Below
 * `layout.maxWidth.prose` a horizontal stepper switches to `compact` through a container query on the host.
 *
 * ## When to use
 *
 * A flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a
 * report builder, a multi-part application. Vertical with descriptions for flows that need explanation;
 * horizontal for short, familiar ones. Leave `navigable="completed"` so people can correct earlier
 * answers without losing later ones.
 *
 * ## When not to use
 *
 * Not for two steps (a Button that says "Continue" is enough) or more than about eight (group them). Not
 * Tabs, not task progress (ProgressBar), not a jump-anywhere settings nav (a `nav` of Links).
 *
 * @fires step-select - A navigable step was chosen; `detail.id` is its id.
 */
@customElement('ds-stepper')
export class DsStepper extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      --ds-stepper-indicator-size: var(--space-6);
      --ds-stepper-indicator-background: var(--color-control-background);
      --ds-stepper-indicator-font-size: var(--font-size-sm);
      --ds-stepper-indicator-font-weight: var(--font-weight-semibold);
      --ds-stepper-connector: var(--color-border);
      --ds-stepper-step-hover: var(--color-action-ghost-background-hover);
      --ds-stepper-step-radius: var(--radius-sm);
      --ds-stepper-step-gap: var(--layout-gap-normal);
      --ds-stepper-part-gap: var(--space-2);
      --ds-stepper-font-family: var(--font-family-body); /* literal-ok: hook name, not a font stack */
      --ds-stepper-transition: var(--motion-duration-fast);
      display: block;
      container-type: inline-size;
      font-family: var(--ds-stepper-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* Label and description colour, size and weight belong to the composed Text: labelColor,
       labelUpcomingColor and descriptionColor are its tone; the size and weight hooks reach its overrides. */

    ol {
      display: flex;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      min-inline-size: 0;
    }

    .control {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-stepper-part-gap);
      min-block-size: var(--size-target-min);
      min-inline-size: var(--size-target-min);
      padding-block: 0;
      padding-inline: var(--ds-stepper-part-gap);
      margin: 0;
      border: none;
      border-radius: var(--ds-stepper-step-radius);
      background: none;
      color: inherit;
      font: inherit;
      text-align: start;
    }

    /* stepHover: hover and press background of a navigable step */
    button.control {
      cursor: pointer;
      appearance: none;
    }

    button.control:hover,
    button.control:active {
      background-color: var(--ds-stepper-step-hover);
    }

    /* focusRing / focusRingWidth, locked */
    button.control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* The indicator has four discrete states and switches between them at once. */
    [data-part='indicator'] {
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: var(--ds-stepper-indicator-size);
      block-size: var(--ds-stepper-indicator-size);
      border: var(--border-width-focus) solid var(--color-border-strong);
      border-radius: var(--radius-full);
      background-color: var(--ds-stepper-indicator-background);
      color: var(--color-foreground);
      font-size: var(--ds-stepper-indicator-font-size);
      font-weight: var(--ds-stepper-indicator-font-weight);
      line-height: 1;
    }

    li[data-selected] [data-part='indicator'] {
      border-color: var(--color-control-selected-background);
    }

    li[data-status='complete'] [data-part='indicator'] {
      border-color: var(--color-control-selected-background);
      background-color: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    li[data-status='error'] [data-part='indicator'] {
      border-color: var(--color-status-danger-icon);
      background-color: var(--color-status-danger-background);
      color: var(--color-status-danger-foreground);
    }

    .content {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    /* The connector fills the gap between steps along the orientation axis. */
    [data-part='connector'] {
      flex: none;
      background-color: var(--ds-stepper-connector);
    }

    [data-part='connector'][data-complete] {
      background-color: var(--color-control-selected-background);
    }

    @media (prefers-reduced-motion: no-preference) {
      [data-part='connector'] {
        transition: background-color var(--ds-stepper-transition) var(--motion-easing-standard);
      }
    }

    /* visually hidden: clip pattern, carries the status word */
    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .count {
      display: none;
    }

    /* horizontal */
    :host(:not([orientation='vertical'])) ol {
      align-items: center;
    }

    :host(:not([orientation='vertical'])) li {
      flex: 1 1 auto;
      align-items: center;
    }

    :host(:not([orientation='vertical'])) li:last-child {
      flex: none;
    }

    :host(:not([orientation='vertical'])) [data-part='connector'] {
      flex: 1 1 auto;
      min-inline-size: var(--ds-stepper-step-gap);
      block-size: var(--border-width-focus);
    }

    /* vertical: descriptions under each label; the connector runs down from the indicator's centre */
    :host([orientation='vertical']) ol {
      flex-direction: column;
    }

    :host([orientation='vertical']) li {
      flex-direction: column;
      align-items: stretch;
    }

    :host([orientation='vertical']) .control {
      align-items: flex-start;
      padding-block: var(--ds-stepper-part-gap);
    }

    :host([orientation='vertical']) [data-part='connector'] {
      align-self: flex-start;
      inline-size: var(--border-width-focus);
      min-block-size: var(--ds-stepper-step-gap);
      margin-inline-start: calc(
        var(--ds-stepper-part-gap) + (var(--ds-stepper-indicator-size) - var(--border-width-focus)) / 2
      );
    }

    /* compact (horizontal only): the indicators stay, only the current step's label shows, then the count.
       Hidden labels are clipped (visually hidden), not removed, so a screen reader still reaches them. */
    :host([compact]:not([orientation='vertical'])) li:not([data-selected]) .content {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    :host([compact]:not([orientation='vertical'])) .count {
      display: block;
    }

    @container (max-width: ${unsafeCSS(PROSE_WIDTH_PX)}px) { /* literal-ok: breakpoint from layout.maxWidth.prose */
      /* visually hidden clip pattern, as compact */
      :host(:not([orientation='vertical'])) li:not([data-selected]) .content {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }

      :host(:not([orientation='vertical'])) .count {
        display: block;
      }
    }
  `;

  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  @property() accessor label: string | undefined;

  /** The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
  @property({ attribute: false }) accessor steps: StepperStep[] = [];

  /** The id of the current step. */
  @property({ type: String, reflect: true }) accessor current = '';

  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  @property({ type: String, reflect: true }) accessor orientation: StepperOrientation = 'horizontal';

  /**
   * Which steps can be activated: none (display only), completed (any step before the current one by
   * position, including one marked `error`), or all.
   */
  @property({ type: String, reflect: true }) accessor navigable: StepperNavigable = 'completed';

  /** Show only the current step's label and "Step n of m"; the indicators stay. Horizontal only. */
  @property({ type: Boolean, reflect: true }) accessor compact = false;

  /** Per-instance style overrides: each entry sets the matching hook, or the composed Text's own override, to that token. */
  @property({ attribute: false }) accessor overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Stepper');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (import.meta.env.DEV && (changed.has('steps') || changed.has('current'))) {
      if (this.current && !this.steps.some((step) => step.id === this.current)) {
        console.warn(`<ds-stepper> \`current\` "${this.current}" does not match any step id.`, this);
      }
    }
  }

  protected override render(): TemplateResult {
    const steps = this.steps;
    const currentIndex = steps.findIndex((step) => step.id === this.current);
    const count = COPY.stepOf
      .replace('{current}', String(Math.max(currentIndex, 0) + 1))
      .replace('{total}', String(steps.length));

    return html`
      <nav aria-label=${this.label || COPY.navLabel}>
        <ol data-part="list" part="list">
          ${steps.map((step, index) => this.renderStep(step, index, currentIndex))}
        </ol>
        <ds-text class="count" element="span" size="sm" tone="muted">${count}</ds-text>
      </nav>
    `;
  }

  private renderStep(step: StepperStep, index: number, currentIndex: number): TemplateResult {
    const status = resolveStatus(step, index, currentIndex);
    // Selection and the compact reveal follow the id; the indicator and status word follow the status.
    const isCurrent = step.id === this.current;
    const isNavigable =
      this.navigable === 'all' || (this.navigable === 'completed' && currentIndex !== -1 && index < currentIndex);
    const word = isCurrent && status !== 'error' ? COPY.current : STATUS_WORD[status];
    const descriptionId =
      step.description && this.orientation === 'vertical' ? `step-${index}-description` : undefined;
    const isLast = index === this.steps.length - 1;

    const content = html`
      <span data-part="indicator" part="indicator" aria-hidden="true">
        ${status === 'complete'
          ? html`<ds-icon name="check" inline></ds-icon>`
          : status === 'error'
            ? html`<ds-icon name="danger" inline></ds-icon>`
            : String(index + 1)}
      </span>
      <span class="content">
        <ds-text
          data-part="label"
          part="label"
          element="span"
          size="sm"
          weight=${isCurrent ? 'semibold' : 'medium'}
          tone=${status === 'upcoming' && !isCurrent ? 'muted' : 'default'}
          .overrides=${this.textOverrides(isCurrent ? 'currentLabel' : 'label')}
          >${step.label}</ds-text
        >
        ${descriptionId
          ? html`<ds-text
              id=${descriptionId}
              data-part="description"
              part="description"
              element="span"
              size="xs"
              tone="muted"
              .overrides=${this.textOverrides('description')}
              >${step.description}</ds-text
            >`
          : nothing}
        ${word ? html`<span class="visually-hidden">${word}</span>` : nothing}
      </span>
    `;

    return html`
      <li
        data-part="step"
        part="step"
        data-status=${status}
        ?data-selected=${isCurrent}
      >
        ${isNavigable
          ? html`<button
              type="button"
              class="control"
              aria-current=${ifDefined(isCurrent ? 'step' : undefined)}
              aria-describedby=${ifDefined(descriptionId)}
              @click=${() => this.select(step.id)}
            >
              ${content}
            </button>`
          : html`<div class="control" aria-current=${ifDefined(isCurrent ? 'step' : undefined)}>${content}</div>`}
        ${isLast
          ? nothing
          : html`<span
              data-part="connector"
              part="connector"
              aria-hidden="true"
              ?data-complete=${currentIndex !== -1 && index < currentIndex}
            ></span>`}
      </li>
    `;
  }

  private select(id: string): void {
    this.dispatchEvent(
      new CustomEvent<StepperStepSelectDetail>('step-select', {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Forwards label and description typography overrides to the composed `<ds-text>`. */
  private textOverrides(kind: 'label' | 'currentLabel' | 'description'): TextOverrides | undefined {
    const source = this.overrides;
    if (!source) return undefined;
    const result: TextOverrides = {};
    if (source.fontFamily) result.fontFamily = source.fontFamily;
    if (kind === 'description') {
      if (source.descriptionSize) result.fontSize = source.descriptionSize;
    } else {
      if (source.labelSize) result.fontSize = source.labelSize;
      const weight = kind === 'currentLabel' ? source.labelCurrentWeight : source.labelWeight;
      if (weight) result.fontWeight = weight;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as StepperOverridableBinding[]) {
      const hook = HOOKS[binding]!;
      const ref = this.overrides?.[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-stepper': DsStepper;
  }
}
