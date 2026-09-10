import { forwardRef, useId, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Text, type TextOverridableBinding } from './Text';
import { Icon } from './Icon';
import './Stepper.css';

export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

export type StepperStep = {
  id: string;
  label: string;
  description?: string;
  status?: StepperStepStatus;
};

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';

const COPY = {
  stepOf: 'Step {current} of {total}',
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/** Bindings owned by the root; labelWeight/labelCurrentWeight/labelSize/descriptionSize are forwarded
 * into the composed Text elements' own `overrides` instead, since Text already exposes them.
 * fontFamily does both: it sets the root hook (for the indicator's own number/glyph) and forwards. */
const ROOT_OVERRIDE_HOOK: Partial<Record<StepperOverridableBinding, string>> = {
  indicatorSize: '--ds-stepper-indicator-size',
  indicatorBackground: '--ds-stepper-indicator-background',
  indicatorBorderWidth: '--ds-stepper-indicator-border-width',
  indicatorFontSize: '--ds-stepper-indicator-font-size',
  indicatorFontWeight: '--ds-stepper-indicator-font-weight',
  connector: '--ds-stepper-connector',
  connectorWidth: '--ds-stepper-connector-width',
  stepGap: '--ds-stepper-step-gap',
  partGap: '--ds-stepper-part-gap',
  transition: '--ds-stepper-transition',
  fontFamily: '--ds-stepper-font-family', // literal-ok: CSS custom-property hook name, not a font stack
};

function overridesToStyle(overrides: Partial<Record<StepperOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  currentLabelOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const currentLabelOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};

  for (const binding of Object.keys(overrides) as StepperOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const rootHook = ROOT_OVERRIDE_HOOK[binding];
    if (rootHook) rootStyle[rootHook] = cssVar(ref);

    switch (binding) {
      case 'labelSize':
        labelOverrides.fontSize = ref;
        currentLabelOverrides.fontSize = ref;
        break;
      case 'labelWeight':
        labelOverrides.fontWeight = ref;
        break;
      case 'labelCurrentWeight':
        currentLabelOverrides.fontWeight = ref;
        break;
      case 'descriptionSize':
        descriptionOverrides.fontSize = ref;
        break;
      case 'fontFamily':
        labelOverrides.fontFamily = ref;
        currentLabelOverrides.fontFamily = ref;
        descriptionOverrides.fontFamily = ref;
        break;
      default:
        break;
    }
  }

  return { rootStyle: rootStyle as CSSProperties, labelOverrides, currentLabelOverrides, descriptionOverrides };
}

export interface StepperProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label'> {
  /** The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
  steps: StepperStep[];
  /** The id of the current step. */
  current: string;
  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  orientation?: StepperOrientation;
  /**
   * Which steps are Buttons: none (display only), completed steps (the usual — you can go back,
   * not skip ahead), or all (a settings-style flow where order does not matter).
   */
  navigable?: StepperNavigable;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Automatic on
   * narrow viewports for horizontal steppers.
   */
  compact?: boolean;
  /** Accessible name of the navigation landmark. Change it only if the page has another progress indicator. */
  label?: string;
  /** Per-instance style overrides: each entry sets the matching CSS hook, or the composed Text's own override, to that token. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef>>;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: (id: string) => void;
}

function resolveStatus(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status) return step.status;
  if (currentIndex === -1) return 'upcoming';
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'upcoming';
}

function isStepNavigable(status: StepperStepStatus, navigable: StepperNavigable): boolean {
  if (navigable === 'none') return false;
  if (navigable === 'all') return true;
  return status === 'complete';
}

/**
 * Stepper — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen:
 * checkout, account setup, a report builder, a multi-part application. Vertical with descriptions
 * for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for
 * short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without
 * losing later ones (the container keeps the later steps' state).
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  {
    steps,
    current,
    orientation = 'horizontal',
    navigable = 'completed',
    compact = false,
    label = 'Progress',
    overrides,
    onStepSelect,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const currentIndex = steps.findIndex((step) => step.id === current);
  const total = steps.length;

  const classes = ['ds-stepper', `ds-stepper--${orientation}`, compact ? 'ds-stepper--compact' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, labelOverrides, currentLabelOverrides, descriptionOverrides } = overrides
    ? overridesToStyle(overrides)
    : {
        rootStyle: undefined,
        labelOverrides: undefined,
        currentLabelOverrides: undefined,
        descriptionOverrides: undefined,
      };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  return (
    <nav {...rest} ref={ref} data-ds="Stepper" className={classes} style={mergedStyle} aria-label={label}>
      <ol className="ds-stepper__list" data-part="list">
        {steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex);
          const isCurrent = status === 'current';
          const isLast = index === steps.length - 1;
          const stepIsNavigable = isStepNavigable(status, navigable);

          const statusWord =
            status === 'complete' ? COPY.complete : status === 'current' ? COPY.current : status === 'error' ? COPY.error : undefined;
          const statusId = statusWord ? `ds-stepper${generatedId}-status-${step.id}` : undefined;
          const descriptionId = step.description ? `ds-stepper${generatedId}-description-${step.id}` : undefined;
          const describedBy = [descriptionId, statusId].filter(Boolean).join(' ') || undefined;

          const labelText = (
            <Text
              element="span"
              data-part="label"
              size="sm"
              weight={isCurrent ? 'semibold' : 'medium'}
              tone={status === 'upcoming' ? 'muted' : 'default'}
              className="ds-stepper__label"
              overrides={isCurrent ? currentLabelOverrides : labelOverrides}
            >
              {step.label}
            </Text>
          );

          const descriptionText = step.description ? (
            <Text
              element="span"
              id={descriptionId}
              data-part="description"
              size="xs"
              tone="muted"
              className="ds-stepper__description"
              overrides={descriptionOverrides}
            >
              {step.description}
            </Text>
          ) : null;

          const hiddenStatus = statusWord ? (
            <span id={statusId} className="ds-stepper__visually-hidden">
              {statusWord}
            </span>
          ) : null;

          return (
            <li key={step.id} className={`ds-stepper__item ds-stepper__item--${status}`} data-part="step">
              <span className="ds-stepper__indicatorWrap">
                <span className="ds-stepper__indicator" data-part="indicator" aria-hidden="true">
                  {status === 'complete' ? (
                    <Icon name="check" inline />
                  ) : status === 'error' ? (
                    <Icon name="danger" inline />
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast && (
                  <span
                    className={`ds-stepper__connector${status === 'complete' ? ' ds-stepper__connector--complete' : ''}`}
                    data-part="connector"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="ds-stepper__content">
                {stepIsNavigable ? (
                  <Button
                    variant="ghost"
                    label={step.label}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-describedby={describedBy}
                    onClick={() => onStepSelect?.(step.id)}
                  />
                ) : (
                  <div className="ds-stepper__control" aria-current={isCurrent ? 'step' : undefined}>
                    {labelText}
                  </div>
                )}
                {descriptionText}
                {hiddenStatus}
              </span>
            </li>
          );
        })}
      </ol>
      <Text element="span" className="ds-stepper__compactStatus" size="sm" tone="muted">
        {COPY.stepOf.replace('{current}', String(Math.max(currentIndex, 0) + 1)).replace('{total}', String(total))}
      </Text>
    </nav>
  );
});
