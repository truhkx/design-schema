import {
  LitElement,
  css,
  html,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type CSSResult,
  type TemplateResult,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import type { IconOverridableBinding } from './Icon.js';
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
  // Native-only (React Native, SwiftUI): on web and Lit the <ol> gives the ordinal.
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
  | 'indicatorRadius'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'countSize'
  | 'stepHover'
  | 'stepRadius'
  | 'stepPadding'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

/** Hooks owned by the host. Label, description and count typography is forwarded to the composed `<ds-text>`'s `overrides`. */
const HOOKS: Partial<Record<StepperOverridableBinding, string>> = {
  indicatorSize: '--ds-stepper-indicator-size',
  indicatorBackground: '--ds-stepper-indicator-background',
  indicatorRadius: '--ds-stepper-indicator-radius',
  indicatorFontSize: '--ds-stepper-indicator-font-size',
  indicatorFontWeight: '--ds-stepper-indicator-font-weight',
  connector: '--ds-stepper-connector',
  stepHover: '--ds-stepper-step-hover',
  stepRadius: '--ds-stepper-step-radius',
  stepPadding: '--ds-stepper-step-padding',
  stepGap: '--ds-stepper-step-gap',
  partGap: '--ds-stepper-part-gap',
  fontFamily: '--ds-stepper-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-stepper-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type IconOverrides = Partial<Record<IconOverridableBinding, TokenRef | undefined>>;

/**
 * Every forward carries its binding's token, overridden or not — the composed Text's own `weight`
 * prop is not set, so the weight has to arrive as an override, and the rest follow the same rule.
 */
const DEFAULT_TOKEN = {
  labelSize: 'font.size.sm',
  labelWeight: 'font.weight.medium',
  labelCurrentWeight: 'font.weight.semibold',
  descriptionSize: 'font.size.xs',
  countSize: 'font.size.sm',
  fontFamily: 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
  indicatorFontSize: 'font.size.sm',
  indicatorCompleteForeground: 'color.control.selectedForeground',
  indicatorErrorForeground: 'color.status.danger.foreground',
} as const satisfies Record<string, TokenRef>;

interface ResolvedForwards {
  label: TextOverrides;
  currentLabel: TextOverrides;
  description: TextOverrides;
  count: TextOverrides;
  indicatorFontSize: TokenRef;
}

function resolveForwards(
  overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined,
): ResolvedForwards {
  const fontFamily = overrides?.fontFamily ?? DEFAULT_TOKEN.fontFamily;
  const labelSize = overrides?.labelSize ?? DEFAULT_TOKEN.labelSize;
  return {
    label: {
      fontSize: labelSize,
      fontWeight: overrides?.labelWeight ?? DEFAULT_TOKEN.labelWeight,
      fontFamily,
    },
    currentLabel: {
      fontSize: labelSize,
      fontWeight: overrides?.labelCurrentWeight ?? DEFAULT_TOKEN.labelCurrentWeight,
      fontFamily,
    },
    description: {
      fontSize: overrides?.descriptionSize ?? DEFAULT_TOKEN.descriptionSize,
      fontFamily,
    },
    count: {
      fontSize: overrides?.countSize ?? DEFAULT_TOKEN.countSize,
      fontFamily,
    },
    indicatorFontSize: overrides?.indicatorFontSize ?? DEFAULT_TOKEN.indicatorFontSize,
  };
}

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status) return step.status;
  if (currentIndex === -1 || index > currentIndex) return 'upcoming';
  return index < currentIndex ? 'complete' : 'current';
}

/**
 * `<ds-stepper>` — Stepper (category: navigation).
 *
 * `<ds-stepper current="payment" .steps=${steps}>` renders a shadow `<nav aria-label>` wrapping an
 * `<ol>`, followed by the `count` `<ds-text>`. Each `<li>` holds a control — its own native `<button>`
 * when the step is navigable, a `<div>` otherwise — containing the indicator (number, `check` or `danger`
 * icon), the label and (vertical only) description as `<ds-text>`, and a visually-hidden ", " plus status
 * word; a connector follows all but the last step. The current step's control carries
 * `aria-current="step"`. Choosing a navigable step fires a composed `step-select` with `{ id }`; the
 * stepper never changes `current` itself. Below `layout.maxWidth.prose` a horizontal stepper switches to
 * `compact` through a container query on the host.
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
      --ds-stepper-indicator-radius: var(--radius-full);
      --ds-stepper-indicator-font-size: var(--font-size-sm);
      --ds-stepper-indicator-font-weight: var(--font-weight-semibold);
      --ds-stepper-connector: var(--color-border);
      --ds-stepper-step-hover: var(--color-action-ghost-background-hover);
      --ds-stepper-step-radius: var(--radius-sm);
      --ds-stepper-step-padding: var(--space-2);
      --ds-stepper-step-gap: var(--layout-gap-normal);
      --ds-stepper-part-gap: var(--space-2);
      --ds-stepper-font-family: var(--font-family-body); /* literal-ok: hook name, not a font stack */
      --ds-stepper-transition: var(--motion-duration-fast);
      /* locked: accessibility-bearing, never overridable */
      --ds-stepper-indicator-color: var(--color-foreground);
      --ds-stepper-indicator-border: var(--color-border-strong);
      --ds-stepper-indicator-border-width: var(--border-width-focus);
      --ds-stepper-indicator-complete-background: var(--color-control-selected-background);
      --ds-stepper-indicator-complete-foreground: var(--color-control-selected-foreground);
      --ds-stepper-indicator-complete-border: var(--color-control-selected-background);
      --ds-stepper-indicator-current-border: var(--color-control-selected-background);
      --ds-stepper-indicator-error-background: var(--color-status-danger-background);
      --ds-stepper-indicator-error-foreground: var(--color-status-danger-foreground);
      --ds-stepper-indicator-error-border: var(--color-status-danger-icon);
      --ds-stepper-connector-complete: var(--color-control-selected-background);
      --ds-stepper-connector-width: var(--border-width-focus);
      --ds-stepper-min-target: var(--size-target-min);
      --ds-stepper-focus-ring: var(--color-border-focus);
      --ds-stepper-focus-ring-width: var(--border-width-focus);
      display: block;
      container-type: inline-size;
      font-family: var(--ds-stepper-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* Label, description and count colour, size and weight belong to the composed Text: labelColor,
       labelUpcomingColor, descriptionColor and countColor are its tone, and labelSize, labelWeight,
       labelCurrentWeight, descriptionSize and countSize reach its overrides. */

    /* The count follows the list, stepGap after it; while it is display:none the gap collapses with it. */
    nav {
      display: flex;
      flex-direction: column;
      gap: var(--ds-stepper-step-gap);
    }

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
      padding-block: 0;
      padding-inline: var(--ds-stepper-step-padding);
      margin: 0;
      border: none;
      border-radius: var(--ds-stepper-step-radius);
      background: none;
      color: inherit;
      font: inherit;
      text-align: start;
    }

    /* minTarget is the floor for the navigable control only; display-only steps are not targets.
       stepHover is its hover and press background. */
    button.control {
      appearance: none;
      min-block-size: var(--ds-stepper-min-target);
      min-inline-size: var(--ds-stepper-min-target);
      cursor: pointer;
    }

    button.control:hover,
    button.control:active {
      background-color: var(--ds-stepper-step-hover);
    }

    /* focusRing / focusRingWidth, locked */
    button.control:focus-visible {
      outline: var(--ds-stepper-focus-ring-width) solid var(--ds-stepper-focus-ring);
      outline-offset: var(--ds-stepper-focus-ring-width);
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
      border: var(--ds-stepper-indicator-border-width) solid var(--ds-stepper-indicator-border);
      border-radius: var(--ds-stepper-indicator-radius);
      background-color: var(--ds-stepper-indicator-background);
      color: var(--ds-stepper-indicator-color);
      font-size: var(--ds-stepper-indicator-font-size);
      font-weight: var(--ds-stepper-indicator-font-weight);
    }

    li[data-status='current'] [data-part='indicator'] {
      border-color: var(--ds-stepper-indicator-current-border);
    }

    li[data-status='complete'] [data-part='indicator'] {
      border-color: var(--ds-stepper-indicator-complete-border);
      background-color: var(--ds-stepper-indicator-complete-background);
      color: var(--ds-stepper-indicator-complete-foreground);
    }

    li[data-status='error'] [data-part='indicator'] {
      border-color: var(--ds-stepper-indicator-error-border);
      background-color: var(--ds-stepper-indicator-error-background);
      color: var(--ds-stepper-indicator-error-foreground);
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--ds-stepper-part-gap);
      min-inline-size: 0;
    }

    /* The connector fills the gap between steps along the orientation axis. */
    [data-part='connector'] {
      flex: none;
      background-color: var(--ds-stepper-connector);
    }

    [data-part='connector'][data-complete] {
      background-color: var(--ds-stepper-connector-complete);
    }

    @media (prefers-reduced-motion: no-preference) {
      [data-part='connector'] {
        transition: background-color var(--ds-stepper-transition) var(--motion-easing-standard);
      }
    }

    /* visually hidden: clipped to a 1px box. Carries ", " and the status word for assistive technology. */
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

    /* Layout only: the count is rendered always and shown while compact is in effect. */
    .count {
      display: none;
    }

    /* horizontal: each step is a column — indicator above a centred label — and the connector runs
       across from the indicator's centre line. A reflected default is not guaranteed, so horizontal is
       "not vertical". */
    :host(:not([orientation='vertical'])) ol {
      align-items: flex-start;
    }

    :host(:not([orientation='vertical'])) li {
      flex: 1 1 auto;
      align-items: flex-start;
    }

    :host(:not([orientation='vertical'])) li:last-child {
      flex: none;
    }

    :host(:not([orientation='vertical'])) .control {
      flex-direction: column;
      align-items: center;
    }

    :host(:not([orientation='vertical'])) .content {
      align-items: center;
    }

    :host(:not([orientation='vertical'])) [data-part='connector'] {
      flex: 1 1 auto;
      min-inline-size: var(--ds-stepper-step-gap);
      block-size: var(--ds-stepper-connector-width);
      margin-block-start: calc(
        (var(--ds-stepper-indicator-size) - var(--ds-stepper-connector-width)) / 2
      );
    }

    /* vertical: descriptions under each label; the connector runs down from the indicator's centre. */
    :host([orientation='vertical']) ol {
      flex-direction: column;
    }

    :host([orientation='vertical']) li {
      flex-direction: column;
      align-items: stretch;
    }

    :host([orientation='vertical']) .control {
      align-items: flex-start;
      padding-block: var(--ds-stepper-step-padding);
    }

    :host([orientation='vertical']) [data-part='connector'] {
      align-self: flex-start;
      inline-size: var(--ds-stepper-connector-width);
      min-block-size: var(--ds-stepper-step-gap);
      margin-inline-start: calc(
        var(--ds-stepper-step-padding) +
          (var(--ds-stepper-indicator-size) - var(--ds-stepper-connector-width)) / 2
      );
    }

    /* compact (horizontal only): the indicators stay, only the current step's label shows, then
       "Step n of m". Hidden labels are clipped, not removed, so a screen reader still reaches them. */
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
      /* visually-hidden clip pattern, as compact */
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

  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`, which an empty string also falls back to. */
  @property() accessor label: string | undefined;

  /**
   * The steps in order. `status` is derived from `current` when omitted: before it complete, the step it
   * names current, after it upcoming. An explicit `status` sets only the indicator, its colours and the
   * status word; position (not status) decides the selected state, navigability, the connector colour and
   * the compact reveal.
   */
  @property({ attribute: false }) accessor steps: StepperStep[] = [];

  /**
   * The id of the current step. The step whose id matches is the selected one (`aria-current="step"`) and
   * the one compact reveals, whatever its `status`. When no id matches, nothing is selected, every step
   * without an explicit status is upcoming, no step is navigable under `completed` (all still are under
   * `all`), the count reads "Step 1 of m", and development builds log a warning. The warning needs a
   * non-empty `current`: an empty one (this property's initial `''`) is treated as not yet set.
   */
  @property({ type: String, reflect: true }) accessor current = '';

  /**
   * Vertical shows descriptions under each label and suits a side column; horizontal does not render
   * descriptions at all (not clipped, and no aria-describedby) and collapses to `compact` below the
   * prose width.
   */
  @property({ type: String, reflect: true }) accessor orientation: StepperOrientation = 'horizontal';

  /**
   * Which steps can be activated: none (display only), completed (any step before the current one by
   * position, including one marked `error`), or all.
   */
  @property({ type: String, reflect: true }) accessor navigable: StepperNavigable = 'completed';

  /**
   * Show only the current step's label and "Step n of m"; the indicators stay. Horizontal only, set by
   * hand or automatically below the prose width. The other steps' labels, with their status words, are
   * visually clipped, not removed.
   */
  @property({ type: Boolean, reflect: true }) accessor compact = false;

  /** Per-instance style overrides: each entry sets the matching hook, or the composed Text's or Icon's own override, to that token. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<StepperOverridableBinding, TokenRef | undefined>>
    | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Stepper');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (import.meta.env.DEV && (changed.has('steps') || changed.has('current'))) {
      // An empty `current` is "not yet set", not a mistake, so it does not warn.
      if (this.current !== '' && !this.steps.some((step) => step.id === this.current)) {
        console.warn(
          `<ds-stepper> \`current\` "${this.current}" matches no step id — nothing is selected.`,
          this,
        );
      }
    }
  }

  protected override render(): TemplateResult {
    const steps = this.steps;
    const currentIndex = steps.findIndex((step) => step.id === this.current);
    const forwards = resolveForwards(this.overrides);
    const stepOf = COPY.stepOf
      .replace('{current}', String(Math.max(currentIndex, 0) + 1))
      .replace('{total}', String(steps.length));

    return html`
      <nav aria-label=${this.label || COPY.navLabel}>
        <ol data-part="list" part="list">
          ${steps.map((step, index) => this.renderStep(step, index, currentIndex, forwards))}
        </ol>
        <ds-text
          class="count"
          data-part="count"
          part="count"
          element="span"
          size="sm"
          tone="muted"
          .overrides=${forwards.count}
          >${stepOf}</ds-text
        >
      </nav>
    `;
  }

  private renderStep(
    step: StepperStep,
    index: number,
    currentIndex: number,
    forwards: ResolvedForwards,
  ): TemplateResult {
    const status = resolveStatus(step, index, currentIndex);
    // Selection, navigability, connector and the compact reveal follow position; the indicator, its
    // colours and the status word follow the status.
    const isCurrent = index === currentIndex;
    const isBefore = currentIndex !== -1 && index < currentIndex;
    const isNavigable = this.navigable === 'all' || (this.navigable === 'completed' && isBefore);
    const statusWord = STATUS_WORD[status];
    const hasDescription =
      this.orientation === 'vertical' && step.description !== undefined && step.description !== '';
    // Only a button computes its name from its content, so only there does the description need
    // hiding and referencing; inside a plain <div> it is read once as ordinary text.
    const descriptionId = hasDescription && isNavigable ? `step-${index}-description` : undefined;
    const isLast = index === this.steps.length - 1;

    const content = html`
      <span data-part="indicator" part="indicator" aria-hidden="true">
        ${status === 'complete'
          ? html`<ds-icon
              name="check"
              size="sm"
              .overrides=${this.iconOverrides(forwards, DEFAULT_TOKEN.indicatorCompleteForeground)}
            ></ds-icon>`
          : status === 'error'
            ? html`<ds-icon
                name="danger"
                size="sm"
                .overrides=${this.iconOverrides(forwards, DEFAULT_TOKEN.indicatorErrorForeground)}
              ></ds-icon>`
            : String(index + 1)}
      </span>
      <span class="content">
        <ds-text
          data-part="label"
          part="label"
          element="span"
          size="sm"
          tone=${status === 'upcoming' ? 'muted' : 'default'}
          align=${this.orientation === 'vertical' ? 'start' : 'center'}
          .overrides=${isCurrent ? forwards.currentLabel : forwards.label}
          >${step.label}</ds-text
        >
        <!-- The status word follows the label directly, so compact clips the two together. -->
        ${statusWord ? html`<span class="visually-hidden">${`, ${statusWord}`}</span>` : nothing}
        ${hasDescription
          ? html`<ds-text
              id=${ifDefined(descriptionId)}
              aria-hidden=${ifDefined(descriptionId ? 'true' : undefined)}
              data-part="description"
              part="description"
              element="span"
              size="xs"
              tone="muted"
              .overrides=${forwards.description}
              >${step.description}</ds-text
            >`
          : nothing}
      </span>
    `;

    return html`
      <li data-part="step" part="step" data-status=${status} ?data-selected=${isCurrent}>
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
          : html`<div class="control" aria-current=${ifDefined(isCurrent ? 'step' : undefined)}>
              ${content}
            </div>`}
        ${isLast
          ? nothing
          : html`<span
              data-part="connector"
              part="connector"
              aria-hidden="true"
              ?data-complete=${isBefore}
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

  /** The check and danger Icons match the numeral: `indicatorFontSize` is their size override. */
  private iconOverrides(forwards: ResolvedForwards, color: TokenRef): IconOverrides {
    return { size: forwards.indicatorFontSize, color };
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
