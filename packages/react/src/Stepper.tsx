import { useId, type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { Icon } from './Icon';
import './Stepper.css';

export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** One step of the flow. */
export type StepperStep = {
  id: string;
  label: string;
  description?: string;
  status?: 'complete' | 'current' | 'upcoming' | 'error';
};

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';

const COPY = {
  navLabel: 'Progress',
  stepOf: 'Step {current} of {total}',
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
  stepLabel: 'Step {n}: {label}',
} as const;

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

/** Hooks owned by the root. Label and description typography is forwarded to the composed Text's `overrides`. */
const ROOT_OVERRIDE_HOOK: Partial<Record<StepperOverridableBinding, string>> = {
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

interface ResolvedOverrides {
  rootStyle: CSSProperties | undefined;
  label: TextOverrides | undefined;
  currentLabel: TextOverrides | undefined;
  description: TextOverrides | undefined;
}

function resolveOverrides(
  overrides: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined,
): ResolvedOverrides {
  if (!overrides) return { rootStyle: undefined, label: undefined, currentLabel: undefined, description: undefined };
  const rootStyle: Record<string, string> = {};
  const label: TextOverrides = {};
  const currentLabel: TextOverrides = {};
  const description: TextOverrides = {};

  for (const binding of Object.keys(overrides) as StepperOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
    switch (binding) {
      case 'labelSize':
        label.fontSize = ref;
        currentLabel.fontSize = ref;
        break;
      case 'labelWeight':
        label.fontWeight = ref;
        break;
      case 'labelCurrentWeight':
        currentLabel.fontWeight = ref;
        break;
      case 'descriptionSize':
        description.fontSize = ref;
        break;
      case 'fontFamily':
        label.fontFamily = ref;
        currentLabel.fontFamily = ref;
        description.fontFamily = ref;
        break;
      default:
        break;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, label, currentLabel, description };
}

export interface StepperProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label' | 'className' | 'style'> {
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /** The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
  steps: { id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[];
  /** The id of the current step. */
  current: string;
  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /**
   * Which steps can be activated: none (display only), completed steps (the usual — you can go back,
   * not skip ahead), or all (a settings-style flow where order does not matter). "Completed" means
   * visited — any step before the current one by position, including one marked `error`.
   */
  navigable?: StepperNavigable | undefined;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by
   * hand or automatically below the prose width — a vertical stepper has the room, so the prop does nothing there.
   */
  compact?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook, or the composed Text's own override, to that token. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
}

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status) return step.status;
  if (currentIndex === -1 || index > currentIndex) return 'upcoming';
  return index < currentIndex ? 'complete' : 'current';
}

const STATUS_WORD: Record<StepperStepStatus, string | undefined> = {
  complete: COPY.complete,
  current: COPY.current,
  error: COPY.error,
  upcoming: undefined,
};

/**
 * Stepper — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout,
 * account setup, a report builder, a multi-part application. Vertical with descriptions for flows that
 * need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones.
 * Leave `navigable: completed` so people can correct earlier answers without losing later ones (the
 * container keeps the later steps' state).
 */
export function Stepper({
  ref,
  label,
  steps,
  current,
  orientation = 'horizontal',
  navigable = 'completed',
  compact = false,
  overrides,
  onStepSelect,
  ...rest
}: StepperProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const baseId = useId();
  const currentIndex = steps.findIndex((step) => step.id === current);
  const resolved = resolveOverrides(overrides);

  const classes = [
    'ds-stepper',
    `ds-stepper--${orientation}`,
    compact && orientation === 'horizontal' ? 'ds-stepper--compact' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const stepOf = COPY.stepOf
    .replace('{current}', String(Math.max(currentIndex, 0) + 1))
    .replace('{total}', String(steps.length));

  return (
    <nav
      {...rest}
      ref={ref}
      data-ds="Stepper"
      className={classes}
      style={resolved.rootStyle}
      aria-label={label || COPY.navLabel}
    >
      <ol className="ds-stepper__list" data-part="list">
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex);
          // Selection and the compact reveal follow the id; the indicator and status word follow the status.
          const isCurrent = step.id === current;
          const isNavigable =
            navigable === 'all' || (navigable === 'completed' && currentIndex !== -1 && index < currentIndex);
          const statusWord = isCurrent && status !== 'error' ? COPY.current : STATUS_WORD[status];
          const descriptionId = step.description && orientation === 'vertical' ? `${baseId}-d${index}` : undefined;
          const isLast = index === steps.length - 1;

          const content = (
            <>
              <span className="ds-stepper__indicator" data-part="indicator" aria-hidden="true">
                {status === 'complete' ? (
                  <Icon name="check" inline />
                ) : status === 'error' ? (
                  <Icon name="danger" inline />
                ) : (
                  index + 1
                )}
              </span>
              <span className="ds-stepper__content">
                <Text
                  element="span"
                  data-part="label"
                  className="ds-stepper__label"
                  size="sm"
                  weight={isCurrent ? 'semibold' : 'medium'}
                  tone={status === 'upcoming' && !isCurrent ? 'muted' : 'default'}
                  overrides={isCurrent ? resolved.currentLabel : resolved.label}
                >
                  {step.label}
                </Text>
                {descriptionId ? (
                  <Text
                    element="span"
                    id={descriptionId}
                    data-part="description"
                    className="ds-stepper__description"
                    size="xs"
                    tone="muted"
                    overrides={resolved.description}
                  >
                    {step.description}
                  </Text>
                ) : null}
                {statusWord ? <span className="ds-stepper__visually-hidden">{statusWord}</span> : null}
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              className={[
                'ds-stepper__step',
                `ds-stepper__step--${status}`,
                isCurrent ? 'ds-stepper__step--selected' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              data-part="step"
            >
              {isNavigable ? (
                <button
                  type="button"
                  className="ds-stepper__control ds-stepper__control--navigable"
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-describedby={descriptionId}
                  onClick={() => onStepSelect?.(step.id)}
                >
                  {content}
                </button>
              ) : (
                <div className="ds-stepper__control" aria-current={isCurrent ? 'step' : undefined}>
                  {content}
                </div>
              )}
              {isLast ? null : (
                <span
                  className={`ds-stepper__connector${
                    currentIndex !== -1 && index < currentIndex ? ' ds-stepper__connector--complete' : ''
                  }`}
                  data-part="connector"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
      <Text element="span" className="ds-stepper__count" size="sm" tone="muted">
        {stepOf}
      </Text>
    </nav>
  );
}
